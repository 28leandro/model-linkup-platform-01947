import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface Props {
  listingId: string;
  listingTitle: string;
  variant?: "floating" | "inline" | "compact";
}

const WhatsAppContactButton = ({ listingId, listingTitle, variant = "floating" }: Props) => {
  const [phone, setPhone] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.rpc("get_listing_contact_phone", {
        listing_uuid: listingId,
      });
      if (active) setPhone((data as string) || null);
    })();
    return () => {
      active = false;
    };
  }, [listingId]);

  if (!phone) return null;

  const sanitized = phone.replace(/\D/g, "");
  if (!sanitized) return null;

  const buyerMeta = (user?.user_metadata || {}) as Record<string, string>;
  const buyerName = buyerMeta.name || user?.email?.split("@")[0] || "";
  const buyerPhone = buyerMeta.phone || "";
  const isReady = !!user && !!buyerPhone;

  const listingLink = typeof window !== "undefined"
    ? `${window.location.origin}/listing/${listingId}`
    : `/listing/${listingId}`;

  const message =
    `¡Hola! Soy ${buyerName} y vi tu anuncio de '${listingTitle}' en el sitio. ¡Me interesa!\n\n` +
    `Mi teléfono/WhatsApp de contacto es: ${buyerPhone}\n\n` +
    `Link del anuncio: ${listingLink}`;

  const url = `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;

  const handleBlocked = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Necesitas estar logueado para contactar al vendedor por WhatsApp.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Teléfono no registrado",
      description: "Actualiza tu perfil con un teléfono válido antes de enviar el mensaje.",
      variant: "destructive",
    });
    navigate("/account-settings");
  };

  if (variant === "inline") {
    return (
      <Button
        asChild
        className={`rounded-full w-14 h-14 ${isReady ? "bg-green-500 hover:bg-green-600" : "bg-muted hover:bg-muted"} shadow-lg flex items-center justify-center transition-transform hover:scale-110 p-0`}
      >
        <a
          href={isReady ? url : "#"}
          onClick={isReady ? undefined : handleBlocked}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          title="Contactar por WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <Button
        asChild
        size="icon"
        className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full ${isReady ? "bg-green-500 hover:bg-green-600" : "bg-muted hover:bg-muted"} p-0`}
        title="Contactar por WhatsApp"
      >
        <a
          href={isReady ? url : "#"}
          onClick={isReady ? undefined : handleBlocked}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
        className={`fixed bottom-24 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 ${isReady ? "bg-green-500 hover:bg-green-600" : "bg-muted hover:bg-muted"} shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110 p-0`}
    >
      <a
        href={isReady ? url : "#"}
        onClick={isReady ? undefined : handleBlocked}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
          <MessageCircle className="w-6 h-6 text-white" />
      </a>
    </Button>
  );
};

export default WhatsAppContactButton;