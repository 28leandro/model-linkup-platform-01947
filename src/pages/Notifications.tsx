import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ArrowLeft } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  listing_id: string | null;
}

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/", { replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id,title,body,read_at,created_at,listing_id")
        .order("created_at", { ascending: false });
      setItems((data || []) as Notification[]);
      setLoading(false);
      const unread = (data || []).filter((n: any) => !n.read_at).map((n: any) => n.id);
      if (unread.length) {
        await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", unread);
      }
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Bell className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Avisos</h1>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No tenés avisos.</p>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <Card key={n.id} className="p-4">
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(n.created_at).toLocaleString("es-PY")}
                </p>
                {n.listing_id && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate(`/post-ad/${n.listing_id}`)}>
                    Editar anuncio
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
