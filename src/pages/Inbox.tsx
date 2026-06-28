import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { LoginDialog } from "@/components/LoginDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, MessageSquare, Star, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  ad_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
}

type ParsedSystem =
  | { kind: "wa_confirm"; contactId: string; text: string }
  | { kind: "rate_invite"; listingId: string; text: string }
  | null;

const parseSystem = (content: string): ParsedSystem => {
  if (content.startsWith("__SYS_WA_CONFIRM__:")) {
    const rest = content.slice("__SYS_WA_CONFIRM__:".length);
    const sep = rest.indexOf("::");
    if (sep > 0) {
      return { kind: "wa_confirm", contactId: rest.slice(0, sep), text: rest.slice(sep + 2) };
    }
  }
  if (content.startsWith("__SYS_RATE_INVITE__:")) {
    const rest = content.slice("__SYS_RATE_INVITE__:".length);
    const sep = rest.indexOf("::");
    if (sep > 0) {
      return { kind: "rate_invite", listingId: rest.slice(0, sep), text: rest.slice(sep + 2) };
    }
  }
  return null;
};

interface SwipeableMessageRowProps {
  mine: boolean;
  onDelete: () => void;
  children: React.ReactNode;
}

const SwipeableMessageRow = ({ mine, onDelete, children }: SwipeableMessageRowProps) => {
  const [offset, setOffset] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);

  const REVEAL_WIDTH = 64;
  const THRESHOLD = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    moved.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    // Swipe right-to-left → negative dx
    if (dx < 0) {
      moved.current = true;
      setOffset(Math.max(dx, -REVEAL_WIDTH));
    } else if (revealed && dx > 0) {
      moved.current = true;
      setOffset(Math.min(-REVEAL_WIDTH + dx, 0));
    }
  };
  const onTouchEnd = () => {
    if (offset <= -THRESHOLD) {
      setOffset(-REVEAL_WIDTH);
      setRevealed(true);
    } else {
      setOffset(0);
      setRevealed(false);
    }
    startX.current = null;
  };

  const handleDeleteClick = () => {
    setOffset(0);
    setRevealed(false);
    onDelete();
  };

  return (
    <div className="relative group">
      {/* Mobile reveal background */}
      <div className="absolute inset-y-0 right-0 flex items-center md:hidden">
        <button
          type="button"
          aria-label="Eliminar mensaje"
          onClick={handleDeleteClick}
          className="h-full w-16 flex items-center justify-center bg-destructive text-destructive-foreground rounded-r-md"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div
        className={`flex items-center gap-1 ${mine ? "justify-end" : "justify-start"} transition-transform`}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Desktop trash (left of mine messages, right of theirs) */}
        {mine && (
          <button
            type="button"
            aria-label="Eliminar mensaje"
            onClick={onDelete}
            className="hidden md:inline-flex opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        {children}
        {!mine && (
          <button
            type="button"
            aria-label="Eliminar mensaje"
            onClick={onDelete}
            className="hidden md:inline-flex opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

interface ThreadInfo {
  ad_id: string;
  other_user_id: string;
  ad_title: string;
  last_message: Message;
  unread: number;
}

const Inbox = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showLogin, setShowLogin] = useState(false);
  const [activeThread, setActiveThread] = useState<{ adId: string; otherId: string } | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (!loading && !user) setShowLogin(true);
  }, [loading, user]);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["inbox", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  const adIds = useMemo(() => Array.from(new Set(messages.map((m) => m.ad_id))), [messages]);

  const { data: ads = [] } = useQuery({
    queryKey: ["inbox-ads", adIds.join(",")],
    enabled: adIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings_public")
        .select("id, title")
        .in("id", adIds);
      if (error) throw error;
      return data as { id: string; title: string }[];
    },
  });

  const adTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    ads.forEach((a) => m.set(a.id, a.title));
    return m;
  }, [ads]);

  const threads: ThreadInfo[] = useMemo(() => {
    if (!user) return [];
    const map = new Map<string, ThreadInfo>();
    for (const m of messages) {
      const other = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      const key = `${m.ad_id}::${other}`;
      const existing = map.get(key);
      if (!existing || new Date(m.created_at) > new Date(existing.last_message.created_at)) {
        map.set(key, {
          ad_id: m.ad_id,
          other_user_id: other,
          ad_title: adTitleMap.get(m.ad_id) || "Anúncio",
          last_message: m,
          unread: existing?.unread || 0,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
    );
  }, [messages, user, adTitleMap]);

  const threadMessages = useMemo(() => {
    if (!activeThread || !user) return [];
    return messages.filter(
      (m) =>
        m.ad_id === activeThread.adId &&
        ((m.sender_id === user.id && m.receiver_id === activeThread.otherId) ||
          (m.sender_id === activeThread.otherId && m.receiver_id === user.id))
    );
  }, [activeThread, messages, user]);

  // Mark thread as read when opened or new messages arrive in active thread
  useEffect(() => {
    if (!user || !activeThread) return;
    const unreadIds = threadMessages
      .filter((m) => m.receiver_id === user.id && !(m as any).read_at)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    (async () => {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds)
        .eq("receiver_id", user.id);
      if (!error) {
        qc.invalidateQueries({ queryKey: ["inbox", user.id] });
      }
    })();
  }, [activeThread, threadMessages, user, qc]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`inbox-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as Message;
          if (m.sender_id !== user.id && m.receiver_id !== user.id) return;
          qc.setQueryData<Message[]>(["inbox", user.id], (prev = []) =>
            prev.find((x) => x.id === m.id) ? prev : [...prev, m]
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const handleSend = async () => {
    if (!user || !activeThread) return;
    const content = reply.trim();
    if (!content) return;
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: activeThread.otherId,
      ad_id: activeThread.adId,
      content,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setReply("");
    qc.invalidateQueries({ queryKey: ["inbox", user.id] });
  };

  const handleWaConfirm = async (contactId: string, answer: "yes" | "no") => {
    const { error } = await supabase.functions.invoke("whatsapp-contact-confirm", {
      body: { contact_id: contactId, answer },
    });
    if (error) {
      toast.error("No se pudo registrar tu respuesta");
      return;
    }
    toast.success(answer === "yes" ? "Marcado como atendido" : "Marcado como no atendido");
    qc.invalidateQueries({ queryKey: ["inbox", user!.id] });
  };

  const handleDelete = async (messageId: string) => {
    if (!user) return;
    // Optimistic update
    qc.setQueryData<Message[]>(["inbox", user.id], (prev = []) =>
      prev.filter((m) => m.id !== messageId)
    );
    const { error } = await supabase.from("messages").delete().eq("id", messageId);
    if (error) {
      toast.error("No se pudo eliminar el mensaje");
      qc.invalidateQueries({ queryKey: ["inbox", user.id] });
      return;
    }
    toast.success("Mensaje eliminado");
  };

  return (
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </Button>

          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" /> Mensajes
          </h1>

          {!user ? (
            <Card><CardContent className="p-6">Inicia sesión para ver tus mensajes.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1">
                <CardContent className="p-2">
                  {threads.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">Aún no tienes conversaciones.</p>
                  )}
                  <ul className="divide-y">
                    {threads.map((t) => {
                      const isActive =
                        activeThread?.adId === t.ad_id && activeThread?.otherId === t.other_user_id;
                      return (
                        <li key={`${t.ad_id}-${t.other_user_id}`}>
                          <button
                            className={`w-full text-left p-3 hover:bg-muted/50 transition-colors rounded-md ${
                              isActive ? "bg-muted" : ""
                            }`}
                            onClick={() =>
                              setActiveThread({ adId: t.ad_id, otherId: t.other_user_id })
                            }
                          >
                            <p className="font-medium text-sm truncate">{t.ad_title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {t.last_message.content}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(t.last_message.created_at).toLocaleString()}
                            </p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-3 sm:p-4 flex flex-col h-[60vh]">
                  {!activeThread ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                      Selecciona una conversación
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <p className="font-semibold text-sm truncate">
                          {adTitleMap.get(activeThread.adId) || "Anúncio"}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => navigate(`/listing/${activeThread.adId}`)}
                        >
                          Ver anúncio
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 bg-muted/30 rounded-md p-3">
                        {threadMessages.map((m) => {
                          const mine = m.sender_id === user.id;
                          const sys = !m.sender_id ? parseSystem(m.content) : null;
                          if (sys?.kind === "wa_confirm") {
                            return (
                              <div key={m.id} className="flex justify-center">
                                <div className="max-w-[90%] w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                                  <p className="text-amber-900 whitespace-pre-wrap">{sys.text}</p>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleWaConfirm(sys.contactId, "yes")}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-1" /> Sí, lo atendí
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleWaConfirm(sys.contactId, "no")}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" /> No
                                    </Button>
                                  </div>
                                  <p className="text-[10px] text-amber-700 mt-2">
                                    {new Date(m.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          if (sys?.kind === "rate_invite") {
                            return (
                              <div key={m.id} className="flex justify-center">
                                <div className="max-w-[90%] w-full bg-primary/5 border border-primary/30 rounded-xl p-3 text-sm">
                                  <p className="whitespace-pre-wrap">{sys.text}</p>
                                  <Button
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => navigate(`/listing/${sys.listingId}`)}
                                  >
                                    <Star className="w-4 h-4 mr-1" /> Dejar evaluación
                                  </Button>
                                  <p className="text-[10px] text-muted-foreground mt-2">
                                    {new Date(m.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <SwipeableMessageRow
                              key={m.id}
                              mine={mine}
                              onDelete={() => handleDelete(m.id)}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                                  mine
                                    ? "bg-primary text-primary-foreground rounded-br-sm"
                                    : "bg-background border rounded-bl-sm"
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                <p className="text-[10px] mt-1 opacity-70">
                                  {new Date(m.created_at).toLocaleString()}
                                </p>
                              </div>
                            </SwipeableMessageRow>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Textarea
                          rows={2}
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Escribe tu respuesta..."
                          maxLength={1000}
                          className="text-base sm:text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
                          }}
                        />
                        <Button onClick={handleSend} className="self-end">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Inbox;