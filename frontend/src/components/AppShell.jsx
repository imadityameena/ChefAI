/* Layout for every signed-in page: sidebar on desktop, top bar + drawer on
   mobile. Pages render into <Outlet />. */
import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  ChevronsUpDown,
  House,
  LogOut,
  Menu,
  Refrigerator,
  Settings,
  ShoppingBasket,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import { ButtonLink, PageLoader, cx } from './ui';

const NAV = [
  { to: '/dashboard', label: 'Home', icon: House },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/pantry', label: 'Pantry', icon: Refrigerator },
  { to: '/meal-plan', label: 'Meal plan', icon: CalendarDays },
  { to: '/shopping-list', label: 'Shopping list', icon: ShoppingBasket },
];

const initials = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const NavItem = ({ to, label, icon: Icon, onNavigate }) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    className={({ isActive }) =>
      cx(
        'group flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors',
        isActive
          ? 'bg-surface font-medium text-ink shadow-[0_1px_2px_rgb(31_26_21/0.06)] ring-1 ring-line'
          : 'text-ink-2 hover:bg-sunken hover:text-ink',
      )
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          className={cx('size-[18px]', isActive ? 'text-brand' : 'text-muted group-hover:text-ink-2')}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        {label}
      </>
    )}
  </NavLink>
);

const UserMenu = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 mb-2 animate-pop-in overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop"
        >
          <Link
            role="menuitem"
            to="/settings"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-2 hover:bg-sunken hover:text-ink"
          >
            <Settings className="size-4 text-muted" /> Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-2 hover:bg-sunken hover:text-ink"
          >
            <LogOut className="size-4 text-muted" /> Log out
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sunken"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-semibold text-ink-2 ring-1 ring-line">
          {initials(user?.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{user?.name || 'Account'}</span>
          <span className="block truncate text-xs text-muted">{user?.email}</span>
        </span>
        <ChevronsUpDown className="size-4 text-muted" aria-hidden="true" />
      </button>
    </div>
  );
};

const SidebarContent = ({ onNavigate }) => (
  <div className="flex h-full flex-col">
    <div className="flex h-16 items-center px-5">
      <Link to="/dashboard" onClick={onNavigate} aria-label="ChefAI home">
        <BrandLogo />
      </Link>
    </div>

    <div className="px-3 pb-4">
      <ButtonLink to="/generate" icon={Sparkles} block onClick={onNavigate}>
        New recipe
      </ButtonLink>
    </div>

    <nav aria-label="Main" className="flex-1 space-y-0.5 px-3">
      {NAV.map((item) => (
        <NavItem key={item.to} {...item} onNavigate={onNavigate} />
      ))}
    </nav>

    <div className="border-t border-line p-3">
      <UserMenu onNavigate={onNavigate} />
    </div>
  </div>
);

const AppShell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Start each page at the top (the drawer closes itself via onNavigate)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-paper lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur lg:hidden">
        <Link to="/dashboard" aria-label="ChefAI home">
          <BrandLogo />
        </Link>
        <div className="flex items-center gap-1">
          <ButtonLink to="/generate" icon={Sparkles} size="sm">
            New
          </ButtonLink>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="flex size-10 items-center justify-center rounded-lg text-ink-2 hover:bg-sunken"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-fade-in border-r border-line bg-paper shadow-pop">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-lg text-muted hover:bg-sunken"
            >
              <X className="size-5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <main id="main" className="lg:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {/* Only the page area shows a loader while a page's code downloads */}
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default AppShell;
