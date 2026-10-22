import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, EyeOff, Users } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { Input } from './ui';

// A small, static recipe card used as illustration on the auth and landing pages
export const SampleRecipeCard = ({ className = '', showStep = true }) => (
  <div className={`w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-pop ${className}`} aria-hidden="true">
    <p className="text-xs text-muted">Indian · Easy</p>
    <p className="display mt-1 text-[26px] leading-tight">Spinach &amp; paneer fried rice</p>
    <div className="tabular mt-3 flex gap-4 text-[13px] text-muted">
      <span className="flex items-center gap-1.5">
        <Clock className="size-3.5" /> 25 min
      </span>
      <span className="flex items-center gap-1.5">
        <Users className="size-3.5" /> 2
      </span>
    </div>
    <ul className="mt-5 divide-y divide-line border-y border-line text-sm">
      {[
        ['Cooked rice', '300 g'],
        ['Paneer', '150 g'],
        ['Spinach', '100 g'],
        ['Soy sauce', '2 tbsp'],
      ].map(([name, qty]) => (
        <li key={name} className="flex justify-between py-2">
          <span className="text-ink">{name}</span>
          <span className="tabular text-muted">{qty}</span>
        </li>
      ))}
    </ul>
    {showStep && (
      <div className="mt-4 grid grid-cols-[1.5rem_1fr] gap-2 text-sm text-ink-2">
        <span className="display text-lg leading-none text-brand">1</span>
        <span>Pan-fry the paneer until golden on all sides.</span>
      </div>
    )}
  </div>
);

export const PasswordInput = (props) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pr-11" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-sunken hover:text-ink"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
};

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen bg-paper lg:grid-cols-2">
    <div className="flex flex-col px-6 py-8 sm:px-10">
      <Link to="/" aria-label="ChefAI home" className="self-start">
        <BrandLogo />
      </Link>
      <main className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <h1 className="display text-[32px] leading-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-8 text-sm text-muted">{footer}</p>}
        </div>
      </main>
    </div>

    <div className="relative hidden overflow-hidden border-l border-line bg-sunken lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-12">
      <SampleRecipeCard className="rotate-[-1.5deg]" />
      <p className="mt-10 max-w-sm text-center text-[15px] leading-relaxed text-ink-2">
        Tell ChefAI what’s in your kitchen. Get a recipe that fits your diet, uses what’s expiring and never includes
        your allergies.
      </p>
    </div>
  </div>
);

export default AuthLayout;
