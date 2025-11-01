import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "+595981000000"; // Número do Paraguai (será sanitizado)
  const message = "Hola! Me interesa tu anuncio en la plataforma.";
  
  const encodedMessage = encodeURIComponent(message);
  const sanitized = phoneNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${sanitized}?text=${encodedMessage}`;

  return (
    <Button
      asChild
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp" title="Contactar por WhatsApp">
        <MessageCircle className="w-6 h-6 text-white" />
      </a>
    </Button>
  );
};

export default WhatsAppButton;