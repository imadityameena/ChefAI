import { useEffect, useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { CalendarDays, Check, PackagePlus, Plus, ShoppingBasket, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { CATEGORIES, UNITS } from '../lib/constants';
import { errorMessage, formatQuantity } from '../lib/format';
import { useConfirm } from '../components/ConfirmDialog';
import {
  Button,
  Card,
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

const AddItemModal = ({ open, onClose, onAdded }) => {
  const [form, setForm] = useState({ ingredient_name: '', quantity: '1', unit: 'pieces', category: 'Other' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ ingredient_name: '', quantity: '1', unit: 'pieces', category: 'Other' });
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/shopping-list', { ...form, ingredient_name: form.ingredient_name.trim(), quantity: parseFloat(form.quantity) });
      toast.success(`${form.ingredient_name.trim()} added`);
      onAdded();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not add the item'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to shopping list"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="shopping-item-form" loading={saving}>
            Add item
          </Button>
        </>
      }
    >
      <form id="shopping-item-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Item">
          {(p) => <Input {...p} data-autofocus required value={form.ingredient_name} onChange={set('ingredient_name')} placeholder="e.g. Lemons" />}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            {(p) => <Input {...p} type="number" inputMode="decimal" min="0" step="any" required value={form.quantity} onChange={set('quantity')} />}
          </Field>
          <Field label="Unit">
            {(p) => (
              <Select {...p} value={form.unit} onChange={set('unit')}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <Field label="Aisle">
          {(p) => (
            <Select {...p} value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </form>
    </Modal>
  );
};

const ShoppingList = () => {
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(''); // which bulk action is running

  const fetchList = () =>
    api
      .get('/shopping-list?grouped=true')
      .then((res) => {
        const flat = [];
        for (const group of res.data.data.items || []) {
          for (const item of group.items) flat.push({ ...item, category: group.category });
        }
        setItems(flat);
      })
      .catch(() => toast.error('Could not load your shopping list'))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchList();
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const key = item.category && item.category !== 'Uncategorized' ? item.category : 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    // Unchecked first within each aisle
    for (const list of map.values()) list.sort((a, b) => Number(a.is_checked) - Number(b.is_checked) || a.ingredient_name.localeCompare(b.ingredient_name));
    return [...map.entries()].sort(([a], [b]) => (a === 'Other') - (b === 'Other') || a.localeCompare(b));
  }, [items]);

  const checkedCount = items.filter((i) => i.is_checked).length;
  const progress = items.length ? Math.round((checkedCount / items.length) * 100) : 0;

  const toggle = async (item) => {
    // Update instantly, roll back if the request fails
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_checked: !i.is_checked } : i)));
    try {
      await api.put(`/shopping-list/${item.id}/toggle`);
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_checked: item.is_checked } : i)));
      toast.error('Could not update the item');
    }
  };

  const remove = async (item) => {
    try {
      await api.delete(`/shopping-list/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      toast.error('Could not remove the item');
    }
  };

  const generateFromPlan = async () => {
    const ok = await confirm({
      title: 'Build list from your meal plan?',
      description:
        'Adds what you need for meals in the next 7 days, minus what’s already in your pantry. Items added from the plan before will be replaced.',
      confirmLabel: 'Build list',
    });
    if (!ok) return;
    setBusy('generate');
    try {
      const today = new Date();
      const res = await api.post('/shopping-list/generate', {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(addDays(today, 6), 'yyyy-MM-dd'),
      });
      await fetchList();
      const fromPlan = (res.data.data.items || []).filter((i) => i.from_meal_plan).length;
      toast.success(fromPlan ? `Added ${fromPlan} items from your meal plan` : 'Nothing needed: no meals planned, or your pantry has it all');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not build the list'));
    } finally {
      setBusy('');
    }
  };

  const moveToPantry = async () => {
    setBusy('pantry');
    try {
      await api.post('/shopping-list/add-to-pantry');
      setItems((prev) => prev.filter((i) => !i.is_checked));
      toast.success(`${checkedCount} ${checkedCount === 1 ? 'item' : 'items'} moved to your pantry`);
    } catch {
      toast.error('Could not move items to your pantry');
    } finally {
      setBusy('');
    }
  };

  const clearChecked = async () => {
    const ok = await confirm({ title: `Remove ${checkedCount} checked ${checkedCount === 1 ? 'item' : 'items'}?`, confirmLabel: 'Remove', danger: true });
    if (!ok) return;
    setBusy('clear');
    try {
      await api.delete('/shopping-list/clear/checked');
      setItems((prev) => prev.filter((i) => !i.is_checked));
    } catch {
      toast.error('Could not clear items');
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <PageHeader
        title="Shopping list"
        description={items.length ? `${checkedCount} of ${items.length} in the basket` : 'Everything you need to buy, grouped by aisle.'}
        actions={
          <>
            <Button variant="secondary" icon={CalendarDays} onClick={generateFromPlan} loading={busy === 'generate'}>
              From meal plan
            </Button>
            <Button icon={Plus} onClick={() => setAdding(true)}>
              Add item
            </Button>
          </>
        }
      />

      {items.length > 0 && (
        <div className="mb-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Items checked">
            <div className="h-full rounded-full bg-herb transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          {checkedCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" icon={PackagePlus} onClick={moveToPantry} loading={busy === 'pantry'}>
                Move {checkedCount} to pantry
              </Button>
              <Button size="sm" variant="ghost" icon={X} onClick={clearChecked} loading={busy === 'clear'}>
                Clear checked
              </Button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <Card className="divide-y divide-line">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingBasket}
            title="Your list is empty"
            description="Build it from this week’s meal plan, or add items yourself."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" icon={CalendarDays} onClick={generateFromPlan} loading={busy === 'generate'}>
                  From meal plan
                </Button>
                <Button icon={Plus} onClick={() => setAdding(true)}>
                  Add item
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([aisle, list]) => (
            <section key={aisle} aria-labelledby={`aisle-${aisle}`}>
              <h2 id={`aisle-${aisle}`} className="mb-2 flex items-baseline gap-2 px-1 text-sm font-semibold text-ink">
                {aisle}
                <span className="tabular text-xs font-normal text-muted">{list.length}</span>
              </h2>
              <Card as="ul" className="divide-y divide-line overflow-hidden">
                {list.map((item) => (
                  <li key={item.id} className="group flex items-center gap-3 pr-3 hover:bg-paper/50">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={item.is_checked}
                      onClick={() => toggle(item)}
                      className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-5 text-left"
                    >
                      <span
                        className={cx(
                          'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                          item.is_checked ? 'border-herb bg-herb text-white' : 'border-line-strong bg-surface group-hover:border-ink/40',
                        )}
                        aria-hidden="true"
                      >
                        {item.is_checked && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className={cx('min-w-0 flex-1 truncate text-[15px]', item.is_checked ? 'text-muted line-through' : 'text-ink')}>
                        {item.ingredient_name}
                      </span>
                      <span className={cx('tabular shrink-0 text-sm', item.is_checked ? 'text-muted' : 'text-ink-2')}>
                        {formatQuantity(item.quantity)} {item.unit}
                      </span>
                    </button>
                    {item.from_meal_plan && (
                      <span title="Added from your meal plan" className="shrink-0 text-muted/70">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">From meal plan</span>
                      </span>
                    )}
                    <IconButton
                      icon={Trash2}
                      label={`Remove ${item.ingredient_name}`}
                      size="sm"
                      variant="danger"
                      onClick={() => remove(item)}
                      className="sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                    />
                  </li>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}

      <AddItemModal open={adding} onClose={() => setAdding(false)} onAdded={fetchList} />
    </>
  );
};

export default ShoppingList;
