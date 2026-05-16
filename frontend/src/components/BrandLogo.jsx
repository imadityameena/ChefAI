import { ChefHat, Sparkles } from 'lucide-react';

const BrandLogo = ({ compact = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="chefai-mark">
        <ChefHat className="h-6 w-6" />
        <Sparkles className="chefai-spark h-3.5 w-3.5" />
      </div>

      {!compact && (
        <div className="leading-none">
          <div className="text-xl font-black tracking-tight text-gray-900">
            Chef<span className="text-emerald-600">AI</span>
          </div>
          <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gray-500">
            Recipe Studio
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
