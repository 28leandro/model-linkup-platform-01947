import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  listingId: string;
  listingTitle: string;
  variant?: "floating" | "inline" | "compact";
}

const WhatsAppContactButton = ({ listingId, listingTitle, variant = "floating" }: Props) => {
  const [phone, setPhone] = useState<string | null>(null);

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
  const message = `Olá, tenho interesse no anúncio "${listingTitle}"`;
  const url = `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;

  if (variant === "inline") {
    return (
      <Button
        asChild
        className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center transition-transform hover:scale-110 p-0"
      >
        <a
          href={url}
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
        className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-green-500 hover:bg-green-600 p-0"
        title="Contactar por WhatsApp"
      >
        <a
          href={url}
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
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110 p-0"
    >
      <a
        href={url}
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