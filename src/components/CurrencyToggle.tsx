import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";

const CurrencyToggle = ({ className = "" }: { className?: string }) => {
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  return (
    <div className={`inline-flex rounded-md border border-border overflow-hidden text-xs ${className}`}>
      <Button
        type="button"
        size="sm"
        variant={displayCurrency === "PYG" ? "default" : "ghost"}
        className="rounded-none h-8 px-3"
        onClick={() => setDisplayCurrency("PYG")}
      >
        Gs.
      </Button>
      <Button
        type="button"
        size="sm"
        variant={displayCurrency === "USD" ? "default" : "ghost"}
        className="rounded-none h-8 px-3"
        onClick={() => setDisplayCurrency("USD")}
      >
        US$
      </Button>
    </div>
  );
};

export default CurrencyToggle;