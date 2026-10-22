import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { PasswordInput } from '../components/AuthLayout';
import { Button, Field, Input } from '../components/ui';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome to ChefAI');
      navigate('/dashboard');
    } else {
      // Shown under the password field
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free, and takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          {(p) => <Input {...p} required autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />}
        </Field>
        <Field label="Email">
          {(p) => (
            <Input {...p} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          )}
        </Field>
        <Field label="Password" hint="At least 6 characters." error={error || undefined}>
          {(p) => (
            <PasswordInput {...p} required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
        </Field>
        <Button type="submit" size="lg" block loading={loading} className="mt-2">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
