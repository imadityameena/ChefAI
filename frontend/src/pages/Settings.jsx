import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../components/ConfirmDialog';
import { CUISINES, DIETARY_OPTIONS } from '../lib/constants';
import { errorMessage } from '../lib/format';
import { Button, Card, Chip, Field, Input, PageHeader, PageLoader, Segmented, Stepper } from '../components/ui';

// One settings block: title + description on the left, form on the right
const Section = ({ title, description, children, danger }) => (
  <section className="grid gap-4 border-t border-line py-8 first:border-t-0 first:pt-0 md:grid-cols-[240px_1fr] md:gap-10">
    <div>
      <h2 className={`text-[15px] font-semibold ${danger ? 'text-danger' : 'text-ink'}`}>{title}</h2>
      {description && <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>}
    </div>
    <div className="min-w-0">{children}</div>
  </section>
);

const Settings = () => {
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(''); // which form is saving

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [prefs, setPrefs] = useState({
    dietary_restrictions: [],
    preferred_cuisines: [],
    default_servings: 4,
    measurement_unit: 'metric',
  });
  const [allergiesText, setAllergiesText] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    api
      .get('/users/profile')
      .then((res) => {
        const { user, preferences } = res.data.data;
        setProfile({ name: user.name, email: user.email });
        if (preferences) {
          setAllergiesText((preferences.allergies || []).join(', '));
          setPrefs({
            dietary_restrictions: preferences.dietary_restrictions || [],
            preferred_cuisines: (preferences.preferred_cuisines || []).filter((c) => c !== 'Any'),
            default_servings: preferences.default_servings || 4,
            measurement_unit: preferences.measurement_unit || 'metric',
          });
        }
      })
      .catch(() => toast.error('Could not load your settings'))
      .finally(() => setLoading(false));
  }, []);

  const toggleIn = (key, value) =>
    setPrefs((p) => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter((v) => v !== value) : [...p[key], value],
    }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving('profile');
    try {
      const res = await api.put('/users/profile', profile);
      const { user } = res.data.data;
      updateUser({ name: user.name, email: user.email });
      toast.success('Profile saved');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your profile'));
    } finally {
      setSaving('');
    }
  };

  const savePrefs = async (e) => {
    e.preventDefault();
    setSaving('prefs');
    try {
      await api.put('/users/preferences', {
        ...prefs,
        allergies: allergiesText
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
      });
      toast.success('Preferences saved');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your preferences'));
    } finally {
      setSaving('');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords don’t match');
      return;
    }
    setSaving('password');
    try {
      await api.put('/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not change your password'));
    } finally {
      setSaving('');
    }
  };

  const deleteAccount = async () => {
    const ok = await confirm({
      title: 'Delete your account?',
      description: 'Your recipes, pantry, meal plans and shopping list will be permanently deleted. This can’t be undone.',
      confirmLabel: 'Delete account',
      danger: true,
      requireText: 'DELETE',
    });
    if (!ok) return;
    try {
      await api.delete('/users/account');
      logout();
      toast.success('Your account has been deleted');
      navigate('/');
    } catch {
      toast.error('Could not delete your account');
    }
  };

  if (loading) return <PageLoader label="Loading settings" />;

  const mismatch = passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword;

  return (
    <>
      <PageHeader title="Settings" description="Your account and cooking preferences." />

      <Card className="px-5 py-8 sm:px-8">
        <Section title="Profile" description="How you sign in and what ChefAI calls you.">
          <form onSubmit={saveProfile} className="max-w-md space-y-4">
            <Field label="Name">
              {(p) => <Input {...p} required autoComplete="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />}
            </Field>
            <Field label="Email">
              {(p) => (
                <Input {...p} type="email" required autoComplete="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              )}
            </Field>
            <Button type="submit" variant="secondary" loading={saving === 'profile'}>
              Save profile
            </Button>
          </form>
        </Section>

        <Section
          title="Cooking preferences"
          description="Used as the starting point for every new recipe. Allergies are always left out of AI recipes."
        >
          <form onSubmit={savePrefs} className="space-y-6">
            <Field label="Allergies" hint="Separate with commas, e.g. peanuts, shellfish, sesame." className="max-w-md">
              {(p) => <Input {...p} value={allergiesText} onChange={(e) => setAllergiesText(e.target.value)} placeholder="None" />}
            </Field>

            <div className="space-y-2">
              <p className="text-[13px] font-medium text-ink-2">Diet</p>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_OPTIONS.map((o) => (
                  <Chip key={o} selected={prefs.dietary_restrictions.includes(o)} onClick={() => toggleIn('dietary_restrictions', o)}>
                    {o}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[13px] font-medium text-ink-2">Favourite cuisines</p>
              <div className="flex flex-wrap gap-1.5">
                {CUISINES.map((c) => (
                  <Chip key={c} selected={prefs.preferred_cuisines.includes(c)} onClick={() => toggleIn('preferred_cuisines', c)}>
                    {c}
                  </Chip>
                ))}
              </div>
              <p className="text-xs text-muted">The first one you pick is preselected for new recipes.</p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="space-y-1.5">
                <p className="text-[13px] font-medium text-ink-2">Default servings</p>
                <Stepper value={prefs.default_servings} onChange={(v) => setPrefs({ ...prefs, default_servings: v })} min={1} max={12} label="default servings" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[13px] font-medium text-ink-2">Units</p>
                <Segmented
                  value={prefs.measurement_unit}
                  onChange={(v) => setPrefs({ ...prefs, measurement_unit: v })}
                  label="Units"
                  options={[
                    { value: 'metric', label: 'Metric (g, ml)' },
                    { value: 'imperial', label: 'Imperial (oz, cups)' },
                  ]}
                />
              </div>
            </div>

            <Button type="submit" variant="secondary" loading={saving === 'prefs'}>
              Save preferences
            </Button>
          </form>
        </Section>

        <Section title="Password" description="Use at least 6 characters.">
          <form onSubmit={savePassword} className="max-w-md space-y-4">
            <Field label="Current password">
              {(p) => (
                <Input
                  {...p}
                  type="password"
                  required
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                />
              )}
            </Field>
            <Field label="New password">
              {(p) => (
                <Input
                  {...p}
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
              )}
            </Field>
            <Field label="Confirm new password" error={mismatch ? 'Passwords don’t match' : undefined}>
              {(p) => (
                <Input
                  {...p}
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                />
              )}
            </Field>
            <Button type="submit" variant="secondary" loading={saving === 'password'}>
              Change password
            </Button>
          </form>
        </Section>

        <Section title="Delete account" description="Permanently remove your account and everything in it." danger>
          <Button variant="danger-ghost" className="-ml-3" onClick={deleteAccount}>
            Delete my account
          </Button>
        </Section>
      </Card>
    </>
  );
};

export default Settings;
