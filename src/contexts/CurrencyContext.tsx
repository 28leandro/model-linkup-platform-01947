import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type DisplayCurrency = "PYG" | "USD";

// Base conversion rate — 1 USD = 7500 PYG
export const USD_TO_PYG = 7500;

interface CurrencyContextType {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  rate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("displayCurrency") : null;
    return (stored === "USD" || stored === "PYG") ? stored : "PYG";
  });

  const setDisplayCurrency = (c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    try { localStorage.setItem("displayCurrency", c); } catch {}
  };

  useEffect(() => {
    try { localStorage.setItem("displayCurrency", displayCurrency); } catch {}
  }, [displayCurrency]);

  return (
    <CurrencyContext.Provider value={{ displayCurrency, setDisplayCurrency, rate: USD_TO_PYG }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};

/** Convert a value from its source currency into the target display currency */
export const convertPrice = (
  value: number | null | undefined,
  from: string | undefined,
  to: DisplayCurrency,
  rate = USD_TO_PYG
): number => {
  const v = Number(value || 0);
  const src = (from || "PYG").toUpperCase();
  if (src === to) return v;
  if (src === "USD" && to === "PYG") return v * rate;
  if (src === "PYG" && to === "USD") return v / rate;
  return v;
};