import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  listingId: string;
  listingTitle: string;
}

const WhatsAppContactButton = ({ listingId, listingTitle }: Props) => {
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

  return (
    <Button
      asChild
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110 p-0"
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