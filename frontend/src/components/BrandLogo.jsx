// ChefAI wordmark: a small ink tile with a serif "C" and a tomato dot,
// followed by the name set in the display serif. Pure markup, so it's crisp
// at any size and costs no image download.
const BrandLogo = ({ size = 'md', className = '' }) => {
  const tile = size === 'lg' ? 'size-9 text-[22px] rounded-[10px]' : 'size-7 text-[17px] rounded-lg';
  const text = size === 'lg' ? 'text-[24px]' : 'text-[19px]';
  const dot = size === 'lg' ? 'size-2 right-1.5 top-1.5' : 'size-1.5 right-1 top-1';

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`relative inline-flex shrink-0 items-center justify-center bg-ink text-paper ${tile}`}
      >
        <span className="display leading-none">C</span>
        <span className={`absolute rounded-full bg-brand-bright ${dot}`} />
      </span>
      <span className={`display leading-none tracking-tight text-ink ${text}`}>
        Chef<span className="text-brand">AI</span>
      </span>
    </span>
  );
};

export default BrandLogo;
