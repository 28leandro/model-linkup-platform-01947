import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Props {
  listingId: string;
  listingTitle: string;
  sellerId: string;
  currentUserId: string;
  onLoginRequired?: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  ad_id: string;
  content: string;
  created_at: string;
}

const ContactSellerChat = ({ listingId, listingTitle, sellerId, currentUserId, onLoginRequired }: Props) => {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const queryKey = ["messages", listingId, currentUserId, sellerId];

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey,
    enabled: !!currentUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("ad_id", listingId)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const payload: any = {
        receiver_id: sellerId,
        ad_id: listingId,
        content,
      };
      if (currentUserId) {
        payload.sender_id = currentUserId;
      } else {
        payload.guest_name = guestName.trim();
        payload.guest_contact = guestContact.trim();
      }
      const { error } = await supabase.from("messages").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      if (currentUserId) {
        qc.invalidateQueries({ queryKey });
      } else {
        toast.success("Mensagem enviada! O vendedor entrará em contato.");
      }
    },
    onError: (e: any) => toast.error(e.message || "Erro ao enviar mensaje"),
  });

  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel(`messages-${listingId}-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `ad_id=eq.${listingId}` },
        (payload) => {
          const m = payload.new as Message;
          if (
            (m.sender_id === currentUserId && m.receiver_id === sellerId) ||
            (m.sender_id === sellerId && m.receiver_id === currentUserId)
          ) {
            qc.setQueryData<Message[]>(queryKey, (prev = []) =>
              prev.find((x) => x.id === m.id) ? prev : [...prev, m]
            );
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, currentUserId, sellerId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    if (content.length > 1000) {
      toast.error("Mensaje muy largo (máx. 1000 caracteres)");
      return;
    }
    if (!currentUserId) {
      if (!guestName.trim()) {
        toast.error("Por favor, informe seu nome");
        return;
      }
      if (!guestContact.trim() || guestContact.trim().length < 3) {
        toast.error("Por favor, informe um email ou telefone válido");
        return;
      }
    }
    sendMutation.mutate(content);
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">Enviar mensaje al vendedor</h3>
        </div>

        {currentUserId && (
          <div
            ref={scrollRef}
            className="max-h-64 overflow-y-auto space-y-2 mb-3 bg-muted/30 rounded-lg p-3"
          >
            {isLoading && <p className="text-xs text-muted-foreground">Cargando…</p>}
            {!isLoading && messages.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Aún no hay mensajes. Inicia la conversación sobre "{listingTitle}".
              </p>
            )}
            {messages.map((m) => {
              const mine = m.sender_id === currentUserId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-background border rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    <p className={`text-[10px] mt-1 opacity-70`}>
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!currentUserId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Seu nome"
              maxLength={100}
              className="text-base sm:text-sm"
            />
            <Input
              value={guestContact}
              onChange={(e) => setGuestContact(e.target.value)}
              placeholder="Email ou telefone"
              maxLength={200}
              className="text-base sm:text-sm"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              currentUserId
                ? `Hola, me interesa "${listingTitle}"...`
                : `Olá, tenho interesse em "${listingTitle}"...`
            }
            rows={2}
            maxLength={1000}
            className="text-base sm:text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
            }}
          />
          <Button
            onClick={handleSend}
            disabled={sendMutation.isPending}
            className="sm:self-end"
          >
            <Send className="w-4 h-4" />
            Enviar
          </Button>
        </div>

        {!currentUserId && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Envia sin registrarte.{" "}
            <button
              type="button"
              onClick={() => onLoginRequired?.()}
              className="underline hover:text-primary"
            >
              Iniciar sesión
            </button>{" "}
            para ver respuestas en el chat.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactSellerChat;