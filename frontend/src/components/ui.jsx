/* Shared UI building blocks. Every page uses these, so the app looks and
   behaves the same everywhere. Tokens live in index.css (@theme). */
import { forwardRef, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Loader2, Minus, Plus, X } from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components
export const cx = (...classes) => classes.filter(Boolean).join(' ');

/* ---------- Buttons ---------- */

const BUTTON_VARIANTS = {
  primary:
    'bg-brand text-white hover:bg-brand-hover disabled:bg-brand/50 shadow-[inset_0_-1px_0_rgb(0_0_0/0.12)]',
  secondary:
    'bg-surface text-ink border border-line-strong hover:bg-sunken hover:border-line-strong disabled:text-muted',
  ghost: 'text-ink-2 hover:bg-sunken hover:text-ink disabled:text-muted',
  danger: 'bg-danger text-white hover:bg-[#912018] disabled:bg-danger/50',
  'danger-ghost': 'text-danger hover:bg-danger-soft disabled:text-danger/50',
  dark: 'bg-ink text-paper hover:bg-ink-2 disabled:bg-ink/50',
};

const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
};

// eslint-disable-next-line react-refresh/only-export-components
export const buttonClass = ({ variant = 'primary', size = 'md', block = false, className } = {}) =>
  cx(
    'inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none',
    'disabled:cursor-not-allowed [&_svg]:shrink-0',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    block && 'w-full',
    className,
  );

export const Button = forwardRef(function Button(
  { variant, size, block, loading = false, icon: Icon, children, className, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, block, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
      )}
      {children}
    </button>
  );
});

export const ButtonLink = ({ to, variant, size, block, icon: Icon, children, className, ...props }) => (
  <Link to={to} className={buttonClass({ variant, size, block, className })} {...props}>
    {Icon && <Icon className="size-4" strokeWidth={2} aria-hidden="true" />}
    {children}
  </Link>
);

export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', className, type = 'button', ...props },
  ref,
) {
  const dims = size === 'sm' ? 'size-8 rounded-lg' : 'size-10 rounded-lg';
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex shrink-0 items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        dims,
        variant === 'ghost' && 'text-muted hover:bg-sunken hover:text-ink',
        variant === 'danger' && 'text-muted hover:bg-danger-soft hover:text-danger',
        variant === 'secondary' && 'border border-line-strong bg-surface text-ink-2 hover:bg-sunken',
        className,
      )}
      {...props}
    >
      <Icon className={size === 'sm' ? 'size-4' : 'size-[18px]'} strokeWidth={1.9} aria-hidden="true" />
    </button>
  );
});

/* ---------- Form fields ---------- */

const controlBase =
  'w-full rounded-lg border border-line-strong bg-surface text-ink placeholder:text-muted/70 transition-[border-color,box-shadow] ' +
  'focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15 disabled:bg-sunken disabled:text-muted';

export const Input = forwardRef(function Input({ className, icon: Icon, ...props }, ref) {
  if (Icon) {
    return (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input ref={ref} className={cx(controlBase, 'h-10 pl-9 pr-3 text-sm', className)} {...props} />
      </div>
    );
  }
  return <input ref={ref} className={cx(controlBase, 'h-10 px-3 text-sm', className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cx(
        controlBase,
        'select-chevron h-10 appearance-none pl-3 pr-9 text-sm',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cx(controlBase, 'min-h-24 px-3 py-2.5 text-sm', className)} {...props} />;
});

// Label + control + hint/error. Pass a render function to get the generated id.
export const Field = ({ label, hint, error, children, className, optional }) => {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cx('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-medium text-ink-2">
          {label}
          {optional && <span className="text-xs font-normal text-muted">Optional</span>}
        </label>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
};

export const Checkbox = ({ checked, onChange, label, className, ...props }) => (
  <label className={cx('inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink-2', className)}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="size-[18px] shrink-0 cursor-pointer rounded-[5px] border-line-strong accent-[var(--color-brand)]"
      {...props}
    />
    {label}
  </label>
);

export const Switch = ({ checked, onChange, label, description, id: idProp }) => {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-brand' : 'bg-line-strong',
        )}
      >
        <span
          className={cx(
            'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
};

// Toggleable pill, e.g. dietary options
export const Chip = ({ selected, onClick, children, icon: Icon }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cx(
      'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
      selected
        ? 'border-ink bg-ink text-paper'
        : 'border-line-strong bg-surface text-ink-2 hover:border-ink/40 hover:text-ink',
    )}
  >
    {Icon && <Icon className="size-3.5" aria-hidden="true" />}
    {children}
  </button>
);

// Segmented control: one choice from a few options
export const Segmented = ({ value, onChange, options, label, size = 'md', className }) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={cx('inline-flex rounded-lg border border-line bg-sunken p-0.5', className)}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option.value)}
          className={cx(
            'flex-1 rounded-md px-3 font-medium whitespace-nowrap transition-colors',
            size === 'sm' ? 'h-7 text-xs' : 'h-8 text-[13px]',
            active ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(31_26_21/0.08)] ring-1 ring-line' : 'text-muted hover:text-ink',
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export const Stepper = ({ value, onChange, min = 1, max = 50, label }) => (
  <div className="inline-flex h-10 items-center rounded-lg border border-line-strong bg-surface" role="group" aria-label={label}>
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label={`Decrease ${label}`}
      className="flex h-full w-10 items-center justify-center text-ink-2 hover:bg-sunken disabled:text-line-strong rounded-l-lg"
    >
      <Minus className="size-4" />
    </button>
    <span className="tabular w-9 text-center text-sm font-semibold text-ink" aria-live="polite">{value}</span>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`Increase ${label}`}
      className="flex h-full w-10 items-center justify-center text-ink-2 hover:bg-sunken disabled:text-line-strong rounded-r-lg"
    >
      <Plus className="size-4" />
    </button>
  </div>
);

/* ---------- Surfaces ---------- */

export const Card = ({ as: Tag = 'div', className, children, ...props }) => (
  <Tag className={cx('rounded-[var(--radius-card)] border border-line bg-surface shadow-card', className)} {...props}>
    {children}
  </Tag>
);

export const CardHeader = ({ title, description, action, className }) => (
  <div className={cx('flex items-start justify-between gap-4 border-b border-line px-5 py-4', className)}>
    <div className="min-w-0">
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
    </div>
    {action}
  </div>
);

const BADGE_TONES = {
  neutral: 'bg-sunken text-ink-2',
  brand: 'bg-brand-soft text-brand-ink',
  herb: 'bg-herb-soft text-herb',
  amber: 'bg-amber-soft text-amber',
  danger: 'bg-danger-soft text-danger',
  outline: 'border border-line-strong text-ink-2',
};

export const Badge = ({ tone = 'neutral', icon: Icon, children, className }) => (
  <span
    className={cx(
      'inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap',
      BADGE_TONES[tone],
      className,
    )}
  >
    {Icon && <Icon className="size-3.5" aria-hidden="true" />}
    {children}
  </span>
);

/* ---------- Page structure ---------- */

export const PageHeader = ({ title, description, actions, eyebrow }) => (
  <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="mb-1.5 text-[13px] font-medium text-muted">{eyebrow}</p>}
      <h1 className="display text-[30px] leading-tight sm:text-[34px]">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-[15px] text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

export const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={cx('flex flex-col items-center px-6 py-14 text-center', className)}>
    {Icon && (
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-sunken text-muted">
        <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
      </div>
    )}
    <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Spinner = ({ className }) => (
  <Loader2 className={cx('size-5 animate-spin text-muted', className)} aria-hidden="true" />
);

export const PageLoader = ({ label = 'Loading' }) => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status">
    <Spinner />
    <span className="sr-only">{label}</span>
  </div>
);

export const Skeleton = ({ className }) => (
  <div className={cx('animate-pulse rounded-md bg-sunken', className)} aria-hidden="true" />
);

/* ---------- Dialog ---------- */

// Accessible modal: Escape closes, focus moves in and returns on close,
// Tab stays inside, background scroll is locked.
export const Modal = ({ open, onClose, title, description, children, footer, size = 'md' }) => {
  const panelRef = useRef(null);
  const titleId = useId();
  // Keep the latest onClose without re-running the focus effect
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const focusables = () =>
      panel.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');

    const first = panel.querySelector('[data-autofocus]') || focusables()[1] || focusables()[0];
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
      }
      if (e.key === 'Tab') {
        const items = Array.from(focusables());
        if (items.length === 0) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'relative flex max-h-[92vh] w-full animate-pop-in flex-col rounded-t-2xl bg-surface shadow-pop sm:rounded-2xl',
          size === 'sm' && 'sm:max-w-sm',
          size === 'md' && 'sm:max-w-md',
          size === 'lg' && 'sm:max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
          <div>
            <h2 id={titleId} className="text-[17px] font-semibold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <IconButton icon={X} label="Close" size="sm" onClick={onClose} className="-mr-1.5 -mt-1" />
        </div>
        {children ? <div className="overflow-y-auto px-5 pb-5">{children}</div> : <div className="pb-2" />}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
