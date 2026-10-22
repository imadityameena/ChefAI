import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Refrigerator, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';
import { CATEGORIES, UNITS } from '../lib/constants';
import { errorMessage, expiryStatus, formatQuantity, toLocalDate } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  cx,
} from '../components/ui';

const EMPTY_FORM = { name: '', quantity: '', unit: 'pieces', category: 'Vegetables', expiry_date: '', is_running_low: false };

// Add a new item, or edit one when `item` is passed
const ItemModal = ({ open, item, onClose, onSaved }) => {
  const isEditing = Boolean(item);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      item
        ? {
            name: item.name,
            quantity: formatQuantity(item.quantity),
            unit: item.unit,
            category: item.category,
            expiry_date: item.expiry_date ? format(toLocalDate(item.expiry_date), 'yyyy-MM-dd') : '',
            is_running_low: Boolean(item.is_running_low),
          }
        : EMPTY_FORM,
    );
  }, [open, item]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // Keep unusual values from older data selectable
  const units = UNITS.includes(form.unit) ? UNITS : [form.unit, ...UNITS];
  const categories = CATEGORIES.includes(form.category) ? CATEGORIES : [form.category, ...CATEGORIES];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, name: form.name.trim(), quantity: parseFloat(form.quantity), expiry_date: form.expiry_date || null };
    try {
      if (isEditing) {
        await api.put(`/pantry/${item.id}`, payload);
        toast.success('Item updated');
      } else {
        await api.post('/pantry', payload);
        toast.success(`${payload.name} added to pantry`);
      }
      onSaved();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, isEditing ? 'Could not update the item' : 'Could not add the item'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit item' : 'Add to pantry'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="pantry-item-form" loading={saving}>
            {isEditing ? 'Save changes' : 'Add item'}
          </Button>
        </>
      }
    >
      <form id="pantry-item-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          {(p) => <Input {...p} data-autofocus required value={form.name} onChange={set('name')} placeholder="e.g. Basmati rice" />}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            {(p) => (
              <Input {...p} type="number" inputMode="decimal" min="0" step="any" required value={form.quantity} onChange={set('quantity')} />
            )}
          </Field>
          <Field label="Unit">
            {(p) => (
              <Select {...p} value={form.unit} onChange={set('unit')}>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            {(p) => (
              <Select {...p} value={form.category} onChange={set('category')}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Expiry date" optional>
            {(p) => <Input {...p} type="date" value={form.expiry_date} onChange={set('expiry_date')} />}
          </Field>
        </div>
        <Checkbox checked={form.is_running_low} onChange={set('is_running_low')} label="Running low" />
      </form>
    </Modal>
  );
};

const StatusBadges = ({ item }) => {
  const status = expiryStatus(item.expiry_date);
  if (!status?.label && !item.is_running_low) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {status?.label && (
        <Badge tone={status.tone} icon={status.tone === 'danger' ? AlertTriangle : undefined}>
          {status.label}
        </Badge>
      )}
      {item.is_running_low && <Badge tone="outline">Running low</Badge>}
    </div>
  );
};

const Pantry = () => {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState({ open: false, item: null });

  const fetchItems = () =>
    api
      .get('/pantry')
      .then((res) => setItems(res.data.data.items || []))
      .catch(() => toast.error('Could not load your pantry'))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchItems();
  }, []);

  // Tabs show only categories that have items
  const categoryTabs = useMemo(() => {
    const counts = items.reduce((acc, i) => ({ ...acc, [i.category]: (acc[i.category] || 0) + 1 }), {});
    const ordered = [...CATEGORIES.filter((c) => counts[c]), ...Object.keys(counts).filter((c) => !CATEGORIES.includes(c))];
    return [['All', items.length], ...ordered.map((c) => [c, counts[c]])];
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => (category === 'All' || i.category === category) && (!q || i.name.toLowerCase().includes(q)))
      .sort((a, b) => {
        // Soonest expiry first, items without a date last
        const da = a.expiry_date ? toLocalDate(a.expiry_date).getTime() : Infinity;
        const db = b.expiry_date ? toLocalDate(b.expiry_date).getTime() : Infinity;
        return da - db || a.name.localeCompare(b.name);
      });
  }, [items, search, category]);

  const attention = useMemo(() => {
    let expired = 0;
    let soon = 0;
    for (const i of items) {
      const d = expiryStatus(i.expiry_date)?.days;
      if (d === undefined) continue;
      if (d < 0) expired += 1;
      else if (d <= 7) soon += 1;
    }
    return { expired, soon };
  }, [items]);

  const handleDelete = async (item) => {
    const ok = await confirm({ title: `Remove ${item.name}?`, confirmLabel: 'Remove', danger: true });
    if (!ok) return;
    try {
      await api.delete(`/pantry/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${item.name} removed`);
    } catch {
      toast.error('Could not remove the item');
    }
  };

  const openAdd = () => setModal({ open: true, item: null });
  const openEdit = (item) => setModal({ open: true, item });

  return (
    <>
      <PageHeader
        title="Pantry"
        description="What’s in your kitchen. ChefAI can cook from it and leaves it off your shopping list."
        actions={
          <Button icon={Plus} onClick={openAdd}>
            Add item
          </Button>
        }
      />

      {!loading && (attention.expired > 0 || attention.soon > 0) && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber/25 bg-amber-soft px-4 py-3 text-sm text-amber">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            {attention.expired > 0 && (
              <>
                <span className="font-semibold">{attention.expired} expired</span>
                {attention.soon > 0 && ' and '}
              </>
            )}
            {attention.soon > 0 && <span className="font-semibold">{attention.soon} expiring this week</span>}. They’re listed
            first.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0" role="tablist" aria-label="Categories">
            <div className="flex gap-1">
              {categoryTabs.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={category === name}
                  onClick={() => setCategory(name)}
                  className={cx(
                    'flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors',
                    category === name ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-sunken',
                  )}
                >
                  {name}
                  <span className={cx('tabular text-xs', category === name ? 'text-paper/70' : 'text-muted')}>{count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="md:w-64">
            <Input
              icon={Search}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pantry"
              aria-label="Search pantry"
            />
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Refrigerator}
            title="Your pantry is empty"
            description="Add what you have at home. ChefAI will cook from it and skip it when building your shopping list."
            action={
              <Button icon={Plus} onClick={openAdd}>
                Add your first item
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState icon={Search} title="Nothing matches" description="Try another search or category." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-line bg-paper/60 text-xs text-muted md:table-header-group">
              <tr>
                <th scope="col" className="px-5 py-2.5 font-medium">
                  Item
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Quantity
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Category
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-5 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((item) => (
                <tr
                  key={item.id}
                  className="group grid grid-cols-[1fr_auto] items-center gap-x-3 px-4 py-3 hover:bg-paper/50 md:table-row md:p-0"
                >
                  <td className="min-w-0 md:px-5 md:py-3">
                    <div className="font-medium text-ink">{item.name}</div>
                    <div className="mt-0.5 text-xs text-muted md:hidden">
                      {formatQuantity(item.quantity)} {item.unit} · {item.category}
                    </div>
                    {item.expiry_date && !expiryStatus(item.expiry_date)?.label && (
                      <div className="mt-0.5 hidden text-xs text-muted md:block">
                        Use by {format(toLocalDate(item.expiry_date), 'd MMM yyyy')}
                      </div>
                    )}
                  </td>
                  <td className="tabular hidden text-ink-2 md:table-cell md:px-3 md:py-3">
                    {formatQuantity(item.quantity)} <span className="text-muted">{item.unit}</span>
                  </td>
                  <td className="hidden text-ink-2 md:table-cell md:px-3 md:py-3">{item.category}</td>
                  <td className="col-span-2 pt-2 empty:hidden md:table-cell md:px-3 md:py-3">
                    <StatusBadges item={item} />
                  </td>
                  <td className="col-start-2 row-start-1 md:px-5 md:py-3">
                    <div className="flex justify-end gap-0.5 md:opacity-0 md:transition-opacity md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                      <IconButton icon={Pencil} label={`Edit ${item.name}`} size="sm" onClick={() => openEdit(item)} />
                      <IconButton icon={Trash2} label={`Remove ${item.name}`} size="sm" variant="danger" onClick={() => handleDelete(item)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <ItemModal open={modal.open} item={modal.item} onClose={() => setModal({ open: false, item: null })} onSaved={fetchItems} />
    </>
  );
};

export default Pantry;
