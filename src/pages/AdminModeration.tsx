import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ShieldCheck, Check, X, ImageOff } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_MESSAGE =
  "¡Hola! Tu anuncio en Nemu.com.py fue desactivado porque exigimos fotografías reales tomadas por vos para garantizar la transparencia entre particulares (fotos de catálogo/internet no están permitidas). Por favor, editá tu anuncio con una foto real para reactivarlo.";

const REASONS = [
  { key: "catalog_photo", label: "Foto de catálogo/internet", message: DEFAULT_MESSAGE },
  {
    key: "incomplete",
    label: "Información incompleta",
    message:
      "¡Hola! Tu anuncio en Nemu.com.py fue desactivado porque la información publicada está incompleta. Por favor, editá tu anuncio con los datos completos para reactivarlo.",
  },
  {
    key: "inappropriate",
    label: "Contenido inadecuado",
    message:
      "¡Hola! Tu anuncio en Nemu.com.py fue desactivado porque el contenido publicado no cumple con nuestras normas de uso. Por favor, editá tu anuncio para reactivarlo.",
  },
];

interface Row {
  id: string;
  title: string;
  category: string | null;
  images: string[] | null;
  user_id: string;
  location: string | null;
  created_at: string;
  is_published: boolean;
  moderation_status: string;
  rejection_reason: string | null;
}

const statusMeta = (r: Row) => {
  if (r.moderation_status === "rejected") return { label: "Rechazado", variant: "destructive" as const };
  if (r.moderation_status === "pending" || !r.is_published) return { label: "Pendiente", variant: "secondary" as const };
  return { label: "Activo", variant: "default" as const };
};

const AdminModeration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Row | null>(null);
  const [reasonKey, setReasonKey] = useState(REASONS[0].key);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/", { replace: true });
  }, [adminLoading, isAdmin, navigate]);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("id,title,category,images,user_id,location,created_at,is_published,moderation_status,rejection_reason")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setRows((data || []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchRows();
  }, [isAdmin]);

  const approve = async (row: Row) => {
    const { error } = await supabase
      .from("listings")
      .update({ moderation_status: "active", is_published: true, rejection_reason: null, moderated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Anuncio aprobado", description: row.title });
    fetchRows();
  };

  const openReject = (row: Row) => {
    setTarget(row);
    setReasonKey(REASONS[0].key);
    setMessage(DEFAULT_MESSAGE);
  };

  const confirmReject = async () => {
    if (!target) return;
    setSaving(true);
    const reasonLabel = REASONS.find((r) => r.key === reasonKey)?.label ?? "Otro motivo";
    const { error } = await supabase
      .from("listings")
      .update({
        moderation_status: "rejected",
        is_published: false,
        rejection_reason: reasonLabel,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", target.id);

    if (error) {
      setSaving(false);
      return toast({ title: "Error", description: error.message, variant: "destructive" });
    }

    const { error: nErr } = await supabase.from("notifications").insert({
      user_id: target.user_id,
      listing_id: target.id,
      title: `Tu anuncio fue desactivado: ${reasonLabel}`,
      body: message.trim(),
    });

    setSaving(false);
    setTarget(null);
    if (nErr) {
      toast({ title: "Anuncio rechazado", description: "No se pudo enviar el aviso al anunciante.", variant: "destructive" });
    } else {
      toast({ title: "Anuncio rechazado", description: "Aviso enviado al anunciante." });
    }
    fetchRows();
  };

  if (adminLoading || !isAdmin) return <div className="min-h-screen" aria-hidden />;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Moderación de anuncios</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground">No hay anuncios.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const meta = statusMeta(row);
              return (
                <Card key={row.id} className="p-3 flex gap-3 items-center">
                  <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {row.images?.[0] ? (
                      <img src={row.images[0]} alt={row.title} width={80} height={80} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{row.title}</p>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {row.category || "—"} · {row.location || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">Anunciante: {row.user_id}</p>
                    {row.rejection_reason && (
                      <p className="text-xs text-destructive truncate">Motivo: {row.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Button size="sm" onClick={() => approve(row)} className="gap-1">
                      <Check className="w-4 h-4" /> Aprobar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openReject(row)} className="gap-1">
                      <X className="w-4 h-4" /> Rechazar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Rechazar anuncio</DialogTitle>
            <DialogDescription>Elegí el motivo y revisá el mensaje que recibirá el anunciante.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <Button
                  key={r.key}
                  type="button"
                  size="sm"
                  variant={reasonKey === r.key ? "default" : "outline"}
                  onClick={() => {
                    setReasonKey(r.key);
                    setMessage(r.message);
                  }}
                >
                  {r.label}
                </Button>
              ))}
            </div>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} maxLength={1000} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={saving || message.trim().length < 5} onClick={confirmReject}>
              {saving ? "Enviando…" : "Confirmar rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModeration;
