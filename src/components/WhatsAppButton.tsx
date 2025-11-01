import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  autoOpen?: boolean;
}

const WhatsAppButton = ({
  phoneNumber = "+595981000000",
  message = "Hola! Me interesa tu anuncio en la plataforma.",
  autoOpen = false,
}: WhatsAppButtonProps) => {
  const openedRef = useRef(false);

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    const sanitized = phoneNumber.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${sanitized}?text=${encodedMessage}`;

    const newWin = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!newWin) {
      // Fallback: redireciona a aba atual para evitar bloqueio de pop-up
      window.location.href = whatsappUrl;
    }
  };

  useEffect(() => {
    if (autoOpen && !openedRef.current) {
      openedRef.current = true;
      const timer = setTimeout(() => {
        openWhatsApp();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [autoOpen]);

  return (
    <Button
      onClick={openWhatsApp}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </Button>
  );
};

export default WhatsAppButton;