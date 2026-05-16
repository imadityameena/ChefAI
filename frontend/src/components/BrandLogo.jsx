import chefLogo from '../assets/chefAI2.png';

const BrandLogo = ({ compact = false, className = '', imageClassName = '' }) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={chefLogo}
        alt="ChefAI"
        className={`${compact ? 'h-10 sm:h-11' : 'h-16 sm:h-20'} ${imageClassName} w-auto select-none object-contain`}
        draggable="false"
      />
    </div>
  );
};

export default BrandLogo;
