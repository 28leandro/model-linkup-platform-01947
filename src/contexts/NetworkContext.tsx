import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type EffectiveType = "4g" | "3g" | "2g" | "slow-2g" | "unknown";

interface NetworkState {
  online: boolean;
  effectiveType: EffectiveType;
  saveData: boolean;
  isSlow: boolean;
}

const NetworkContext = createContext<NetworkState>({
  online: true,
  effectiveType: "4g",
  saveData: false,
  isSlow: false,
});

function readConnection(): Omit<NetworkState, "online"> {
  const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
  const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
  const effectiveType = (conn?.effectiveType as EffectiveType) || "unknown";
  const saveData = !!conn?.saveData;
  const isSlow =
    saveData || effectiveType === "2g" || effectiveType === "slow-2g" || effectiveType === "3g";
  return { effectiveType, saveData, isSlow };
}

export const SpeedProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<NetworkState>(() => ({
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    ...readConnection(),
  }));

  useEffect(() => {
    const update = () =>
      setState({
        online: navigator.onLine,
        ...readConnection(),
      });

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as any).connection;
    conn?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);

  return <NetworkContext.Provider value={state}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => useContext(NetworkContext);