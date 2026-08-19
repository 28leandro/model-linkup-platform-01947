import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface Props {
  listingId: string;
  listingTitle: string;
  variant?: "floating" | "inline" | "compact";
}

const WhatsAppContactButton = ({ listingId, listingTitle, variant = "floating" }: Props) => {
  const [phone, setPhone] = useState<string | null>(null);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (!user) {
      setPhone(null);
      return () => {
        active = false;
      };
    }
    (async () => {
      const { data } = await supabase.rpc("get_listing_contact_phone", {
        listing_uuid: listingId,
      });
      if (active) setPhone((data as string) || null);
    })();
    return () => {
      active = false;
    };
  }, [listingId, user]);

  // Auto-hide the login message after 5s
  useEffect(() => {
    if (!showLoginMessage) return;
    const timer = setTimeout(() => setShowLoginMessage(false), 5000);
    return () => clearTimeout(timer);
  }, [showLoginMessage]);

  // Normalize phone for wa.me — must be full international number, digits only.
  // Paraguay default: numbers stored locally (e.g. "0982 123-456" / "982123456")
  // are converted to "595982123456". Numbers already including a country code
  // (with or without "+") are preserved.
  const normalizeWhatsApp = (raw: string | null): string => {
    if (!raw) return "";
    const trimmed = raw.trim();
    const hadPlus = trimmed.startsWith("+");
    let digits = trimmed.replace(/\D/g, "");
    if (!digits) return "";
    if (hadPlus) return digits;
    // Strip leading zeros (local trunk prefix)
    digits = digits.replace(/^0+/, "");
    // If it already starts with a known country code length (>=11 digits), keep as-is
    if (digits.length >= 11) return digits;
    // Default Paraguay country code
    return `595${digits}`;
  };

  const sanitized = normalizeWhatsApp(phone);

  if (import.meta.env.DEV && phone) {
    // eslint-disable-next-line no-console
    console.debug("[WhatsApp] raw:", phone, "→ normalized:", sanitized);
  }

  const cleanText = (value: string) => value.replace(/\s+/g, " ").trim();
  const cleanPhone = (value: string) => value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const buyerMeta = (user?.user_metadata || {}) as Record<string, string>;
  const buyerName = cleanText(buyerMeta.name || user?.email?.split("@")[0] || "");
  const buyerPhone = cleanPhone(buyerMeta.phone || "");
  // Visible to everyone, but only logged-in users with a resolved phone can actually send.
  const isReady = !!user && !!sanitized;

  const message = [
    `¡Hola! Soy ${buyerName} y vi tu anuncio de '${cleanText(listingTitle)}' en el sitio:`,
    "https://nemu.com.py",
    buyerPhone ? `¡Me interesa! WhatsApp de contacto es: ${buyerPhone}` : "¡Me interesa!",
  ].join("\n\n");

  const url = `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;

  const trackContact = () => {
    if (!user) return;
    // Fire-and-forget: register pending contact + notify seller.
    supabase.functions.invoke("whatsapp-contact-init", {
      body: { listing_id: listingId },
    }).catch(() => {});
  };

  const handleBlocked = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLoginMessage(true);
  };

  const loginMessage = (
    <div className="bg-popover text-popover-foreground text-xs rounded-lg border border-border shadow-lg p-2.5 z-50 animate-in fade-in zoom-in-95 duration-200">
      <p className="leading-snug">{t('whatsapp.loginRequired')}</p>
      <button
        type="button"
        onClick={() => navigate("/?auth=login")}
        className="mt-1.5 text-primary font-medium underline hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring rounded"
      >
        {t('whatsapp.login')}
      </button>
    </div>
  );

  if (variant === "inline") {
    return (
      <div className="relative inline-flex items-center">
        <Button
          asChild
          className={`rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center transition-transform hover:scale-110 p-0`}
        >
          <a
            href={isReady ? url : "#"}
            onClick={isReady ? (() => trackContact()) : handleBlocked}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
            title="Contactar por WhatsApp"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </a>
        </Button>
        {showLoginMessage && (
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-44 sm:w-48">
            {loginMessage}
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="relative inline-flex items-center">
        <Button
          asChild
          size="icon"
          className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-green-500 hover:bg-green-600 p-0`}
          title="Contactar por WhatsApp"
        >
          <a
            href={isReady ? url : "#"}
            onClick={isReady ? (() => trackContact()) : handleBlocked}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-white" />
          </a>
        </Button>
        {showLoginMessage && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 sm:w-48">
            {loginMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2">
      {showLoginMessage && (
        <div className="w-44 sm:w-48">{loginMessage}</div>
      )}
      <Button
        asChild
        className={`rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center transition-transform hover:scale-110 p-0`}
      >
        <a
          href={isReady ? url : "#"}
          onClick={isReady ? (() => trackContact()) : handleBlocked}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          title="Contactar por WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      </Button>
    </div>
  );
};

export default WhatsAppContactButton;
