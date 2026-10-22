// 240px WebP version of chefAI2.png (8 KB instead of 50 KB)
import chefLogo from "../assets/chefAI-logo.webp";

const BrandLogo = ({
  compact = false,
  className = "",
  imageClassName = "",
}) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={chefLogo}
        alt="ChefAI"
        width="240"
        height="240"
        decoding="async"
        className={`${compact ? "h-10 sm:h-11" : "h-16 sm:h-20"} ${imageClassName} w-auto select-none object-contain`}
        draggable="false"
      />
    </div>
  );
};

export default BrandLogo;
