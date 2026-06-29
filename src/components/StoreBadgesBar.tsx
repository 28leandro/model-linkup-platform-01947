import appStoreBadge from "@/assets/app-store-badge.svg";
import googlePlayBadge from "@/assets/google-play-badge.png";

const IOS_LINK = "#"; // TODO: substituir pelo link real da App Store
const ANDROID_LINK = "#"; // TODO: substituir pelo link real da Google Play

const StoreBadgesBar = () => {
  return (
    <div className="w-full bg-background/95 border-t border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 sm:gap-4">
        <a
          href={IOS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Descargar en App Store"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <img
            src={appStoreBadge}
            alt="Descargar en App Store"
            className="h-10 sm:h-12 w-auto"
            loading="lazy"
          />
        </a>
        <a
          href={ANDROID_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Disponible en Google Play"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <img
            src={googlePlayBadge}
            alt="Disponible en Google Play"
            className="h-10 sm:h-12 w-auto"
            loading="lazy"
          />
        </a>
      </div>
    </div>
  );
};

export default StoreBadgesBar;