import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Refrigerator, ShieldCheck, ShoppingBasket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { SampleRecipeCard } from '../components/AuthLayout';
import { ButtonLink } from '../components/ui';

const STEPS = [
  {
    title: 'Add what you have',
    body: 'Type a few ingredients, or let ChefAI use everything in your pantry.',
  },
  {
    title: 'Get a full recipe',
    body: 'Steps, timings, servings and nutrition, matched to your diet and cuisine.',
  },
  {
    title: 'Plan and shop',
    body: 'Drop it into your week. Your shopping list fills itself, minus what you already own.',
  },
];

const FEATURES = [
  {
    icon: Refrigerator,
    title: 'A pantry that remembers',
    body: 'Track quantities and expiry dates. Items about to go off float to the top, so less ends up in the bin.',
  },
  {
    icon: ShieldCheck,
    title: 'Allergies, always respected',
    body: 'Save them once. Every AI recipe leaves them out, and ChefAI flags anything that looks risky.',
  },
  {
    icon: CalendarDays,
    title: 'A week at a glance',
    body: 'Breakfast, lunch and dinner for seven days, planned from recipes you’ve saved.',
  },
  {
    icon: ShoppingBasket,
    title: 'Shopping lists that add up',
    body: 'Built from your meal plan, grouped by aisle, and checked items move straight into your pantry.',
  },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="ChefAI home">
          <BrandLogo />
        </Link>
        <nav className="flex items-center gap-1" aria-label="Account">
          {isAuthenticated ? (
            <ButtonLink to="/dashboard" size="sm">
              Open ChefAI
            </ButtonLink>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink to="/signup" size="sm">
                Get started
              </ButtonLink>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-20">
          <div className="animate-fade-up">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] text-ink-2">
              <span className="size-1.5 rounded-full bg-brand-bright" aria-hidden="true" />
              Your AI kitchen assistant
            </p>
            <h1 className="display text-[44px] leading-[1.05] sm:text-[60px]">
              Cook with what you <em className="text-brand">already have.</em>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-2">
              ChefAI turns the ingredients in your kitchen into real recipes, plans your week, and writes the shopping
              list for you.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to={isAuthenticated ? '/generate' : '/signup'} size="lg">
                {isAuthenticated ? 'Create a recipe' : 'Start cooking, it’s free'} <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <a href="#how-it-works" className="inline-flex h-12 items-center justify-center rounded-xl px-5 text-[15px] font-medium text-ink-2 hover:bg-sunken hover:text-ink">
                How it works
              </a>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm pb-20">
              <SampleRecipeCard className="relative rotate-[-1.5deg]" showStep={false} />
              {/* Small "use soon" note overlapping the card */}
              <div
                className="absolute -left-4 bottom-0 w-52 rotate-[2deg] rounded-xl border border-line bg-surface p-4 shadow-pop sm:-left-12"
                aria-hidden="true"
              >
                <p className="text-xs font-medium text-amber">Use soon</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  <li className="flex justify-between">
                    <span>Spinach</span>
                    <span className="text-muted">Tomorrow</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Paneer</span>
                    <span className="text-muted">3 days</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-8 border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <h2 className="display max-w-md text-[32px] leading-tight sm:text-[38px]">From fridge to plate in three steps</h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="border-t border-line pt-6">
                  <span className="display text-[28px] leading-none text-brand">{i + 1}</span>
                  <h3 className="mt-4 text-[17px] font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <h2 className="display text-[32px] leading-tight sm:text-[38px]">Everything your kitchen needs, nothing it doesn’t</h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
                One calm place for recipes, ingredients, plans and shopping, without the clutter.
              </p>
            </div>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title}>
                  <div className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface text-brand">
                    <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-3xl bg-ink px-8 py-12 text-paper sm:px-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="display text-[30px] leading-tight text-paper sm:text-[36px]">What’s for dinner tonight?</h2>
              <p className="mt-2 text-[15px] text-paper/70">Find out from what’s already in your fridge.</p>
            </div>
            <Link
              to={isAuthenticated ? '/generate' : '/signup'}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-paper px-5 text-[15px] font-medium text-ink transition-colors hover:bg-white"
            >
              {isAuthenticated ? 'Create a recipe' : 'Get started free'} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-8">
          <BrandLogo />
          <p>© {new Date().getFullYear()} ChefAI. AI recipes are suggestions; always check ingredients for allergens.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
