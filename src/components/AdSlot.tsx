import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdSlotProps {
  variant?: "banner" | "sidebar" | "inline";
  className?: string;
}

/**
 * Placeholder ad slot used to reserve advertising space in the layout.
 * Replace with real ad network embed (AdSense, etc.) when available.
 */
const AdSlot = ({ variant = "inline", className }: AdSlotProps) => {
  const { language } = useLanguage();
  const label = language === "pt" ? "Espaço publicitário" : "Espacio publicitario";

  const dims =
    variant === "sidebar"
      ? "h-[600px] w-full max-w-[300px]"
      : variant === "banner"
      ? "h-24 sm:h-28 w-full"
      : "h-32 w-full";

  return (
    <aside
      role="complementary"
      aria-label={label}
      className={cn(
        "rounded-2xl border border-dashed bg-muted/40 text-muted-foreground",
        "flex flex-col items-center justify-center gap-2 p-4",
        dims,
        className
      )}
    >
      <Megaphone className="h-5 w-5 opacity-50" />
      <span className="text-xs font-medium uppercase tracking-wider opacity-70">
        {label}
      </span>
    </aside>
  );
};

export default AdSlot;