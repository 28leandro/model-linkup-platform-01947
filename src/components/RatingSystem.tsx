import { useState, useEffect, useMemo } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RatingSystemProps {
  listingId: string;
  listingOwnerId: string;
  listingCategory?: string | null;
  /** When true, render only a compact star + average badge that opens the reviews modal. */
  compactBadge?: boolean;
}

interface RatingRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  seller_response: string | null;
  seller_response_at: string | null;
  reviewer_name: string;
  reviewer_avatar: string | null;
  rating_punctuality: number | null;
  rating_location: number | null;
  rating_professionalism: number | null;
}

const StarRow = ({ value, size = 16 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        style={{ width: size, height: size }}
        className={s <= value ? "fill-foreground text-foreground" : "text-muted-foreground/40"}
      />
    ))}
  </div>
);

const initialsFrom = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const CRITERIA: { key: "rating_punctuality" | "rating_location" | "rating_professionalism"; label: string; hint: string }[] = [
  { key: "rating_punctuality", label: "Puntualidad", hint: "¿Llegó / respondió a tiempo?" },
  { key: "rating_location", label: "Estado del lugar", hint: "Bueno, más o menos, pésimo" },
  { key: "rating_professionalism", label: "Profesionalismo", hint: "Trato, calidad y respeto" },
];

export const RatingSystem = ({ listingId, listingOwnerId, listingCategory, compactBadge = false }: RatingSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = user?.id === listingOwnerId;
  const isService = listingCategory === "services";

  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [average, setAverage] = useState(0);
  const [canRate, setCanRate] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [formCriteria, setFormCriteria] = useState<Record<string, number>>({
    rating_punctuality: 0,
    rating_location: 0,
    rating_professionalism: 0,
  });
  const [hoverKey, setHoverKey] = useState<{ key: string; value: number } | null>(null);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const myRating = useMemo(
    () => (user ? ratings.find((r) => r.user_id === user.id) : null),
    [ratings, user]
  );

  const refresh = async () => {
    const { data } = await supabase.rpc("get_listing_ratings_with_profiles", {
      listing_uuid: listingId,
    });
    const list = (((data as RatingRow[]) || []).map((r) => ({ ...r, rating: Number(r.rating) })));
    setRatings(list);
    setAverage(list.length ? list.reduce((s, r) => s + Number(r.rating), 0) / list.length : 0);

    if (user && !isOwner) {
      const { data: canData } = await supabase.rpc("can_rate_service", {
        listing_uuid: listingId,
      });
      setCanRate(!!canData);
    } else {
      setCanRate(false);
    }
  };

  useEffect(() => {
    if (isService) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, user, isService]);

  useEffect(() => {
    if (openForm && myRating) {
      setFormCriteria({
        rating_punctuality: myRating.rating_punctuality || myRating.rating,
        rating_location: myRating.rating_location || myRating.rating,
        rating_professionalism: myRating.rating_professionalism || myRating.rating,
      });
      setFormComment(myRating.comment);
    } else if (openForm) {
      setFormCriteria({ rating_punctuality: 0, rating_location: 0, rating_professionalism: 0 });
      setFormComment("");
    }
  }, [openForm, myRating]);

  if (!isService) return null;

  const submitRating = async () => {
    if (!user) return;
    const trimmed = formComment.trim();
    const p = formCriteria.rating_punctuality;
    const l = formCriteria.rating_location;
    const pr = formCriteria.rating_professionalism;
    if (p < 1 || l < 1 || pr < 1) {
      toast({ title: "Calificá los 3 criterios (1 a 5 estrellas)", variant: "destructive" });
      return;
    }
    if (trimmed.length < 20) {
      toast({ title: "Tu comentario debe tener al menos 20 caracteres", variant: "destructive" });
      return;
    }
    const total = Math.round(((p + l + pr) / 3) * 100) / 100;
    setSubmitting(true);
    try {
      if (myRating) {
        const { error } = await supabase
          .from("listing_ratings")
          .update({
            rating: total,
            comment: trimmed,
            rating_punctuality: p,
            rating_location: l,
            rating_professionalism: pr,
          })
          .eq("id", myRating.id);
        if (error) throw error;
        toast({ title: "Evaluación actualizada" });
      } else {
        const { error } = await supabase
          .from("listing_ratings")
          .insert({
            listing_id: listingId,
            user_id: user.id,
            rating: total,
            comment: trimmed,
            rating_punctuality: p,
            rating_location: l,
            rating_professionalism: pr,
          });
        if (error) throw error;
        toast({ title: "Gracias por tu evaluación" });
      }
      setOpenForm(false);
      await refresh();
    } catch (e: any) {
      toast({ title: e.message || "No se pudo guardar", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const submitResponse = async (ratingId: string) => {
    const trimmed = responseText.trim();
    if (!trimmed) return;
    const { error } = await supabase
      .from("listing_ratings")
      .update({ seller_response: trimmed })
      .eq("id", ratingId);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    setRespondingId(null);
    setResponseText("");
    await refresh();
  };

  // Compact badge variant (small discrete star + average under the photo)
  if (compactBadge) {
    if (ratings.length === 0) return null;
    return (
      <>
        <button
          type="button"
          onClick={() => setOpenList(true)}
          className="inline-flex items-center gap-1 text-xs text-foreground/70 hover:text-foreground transition-colors"
          aria-label={`${average.toFixed(1)} puntos · ${ratings.length} evaluaciones`}
        >
          <Star className="w-3 h-3 fill-foreground text-foreground" />
          <span className="font-medium text-foreground">{average.toFixed(1)}</span>
        </button>
        {renderListDialog()}
      </>
    );
  }

  function renderListDialog() {
    return (
      <Dialog open={openList} onOpenChange={setOpenList}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-semibold text-xl">{average ? average.toFixed(1) : "—"}</span>
              <span className="text-sm text-muted-foreground font-normal">
                · {ratings.length} {ratings.length === 1 ? "evaluación" : "evaluaciones"}
              </span>
            </DialogTitle>
            <DialogDescription>Experiencias de personas que contrataron este servicio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {ratings.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Todavía no hay evaluaciones para este servicio.
              </p>
            )}
            {ratings.map((r) => (
              <div key={r.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    {r.reviewer_avatar && <AvatarImage src={r.reviewer_avatar} alt={r.reviewer_name} />}
                    <AvatarFallback>{initialsFrom(r.reviewer_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.reviewer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("es", { year: "numeric", month: "long" })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">{Number(r.rating).toFixed(2)} / 5</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {CRITERIA.map((c) => (
                    <div key={c.key} className="text-xs">
                      <p className="text-muted-foreground truncate">{c.label}</p>
                      <StarRow value={(r as any)[c.key] || 0} size={12} />
                    </div>
                  ))}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{r.comment}</p>
                {r.seller_response && (
                  <div className="mt-3 ml-6 pl-3 border-l-2 border-primary/40 bg-muted/40 p-3 rounded-r">
                    <p className="text-xs font-medium mb-1">Respuesta del anunciante</p>
                    <p className="text-sm whitespace-pre-wrap break-words">{r.seller_response}</p>
                  </div>
                )}
                {isOwner && !r.seller_response && (
                  <div className="mt-3 ml-6">
                    {respondingId === r.id ? (
                      <div className="space-y-2">
                        <Textarea rows={2} maxLength={1000} value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Escribí tu respuesta pública..." />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => submitResponse(r.id)}>Publicar respuesta</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setRespondingId(null); setResponseText(""); }}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="link" className="px-0"
                        onClick={() => { setRespondingId(r.id); setResponseText(""); }}>Responder</Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="bg-muted/40 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-sm">
            <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
            {average ? average.toFixed(1) : "—"}
          </span>
          <button
            type="button"
            onClick={() => setOpenList(true)}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            {ratings.length === 0
              ? "Sin evaluaciones aún"
              : `Ver ${ratings.length} ${ratings.length === 1 ? "evaluación" : "evaluaciones"}`}
          </button>
        </div>
        {user && !isOwner && (
          <Button
            size="sm"
            variant={myRating ? "outline" : "default"}
            disabled={!canRate && !myRating}
            onClick={() => setOpenForm(true)}
            title={
              !canRate && !myRating
                ? "Disponible 24h después de contactar al prestador"
                : undefined
            }
          >
            {myRating ? "Editar mi evaluación" : "Dejar evaluación"}
          </Button>
        )}
      </div>
      {!canRate && !myRating && user && !isOwner && (
        <p className="text-xs text-muted-foreground">
          Podrás evaluar este servicio 24 horas después de contactar al prestador.
        </p>
      )}

      {renderListDialog()}

      {/* Rating form modal */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{myRating ? "Editar evaluación" : "¿Cómo fue tu experiencia?"}</DialogTitle>
            <DialogDescription>
              Calificá los 3 criterios y dejá un comentario. Tu evaluación será pública.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {CRITERIA.map((c) => {
              const current = formCriteria[c.key];
              const hover = hoverKey?.key === c.key ? hoverKey.value : 0;
              return (
                <div key={c.key}>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground mb-1">{c.hint}</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHoverKey({ key: c.key, value: s })}
                        onMouseLeave={() => setHoverKey(null)}
                        onClick={() => setFormCriteria((prev) => ({ ...prev, [c.key]: s }))}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            s <= (hover || current)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <div>
              <p className="text-sm font-medium mb-2">
                Tu comentario <span className="text-muted-foreground font-normal">(mínimo 20 caracteres)</span>
              </p>
              <Textarea
                rows={5}
                maxLength={1000}
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                placeholder="Contá cómo fue el contacto, la calidad del servicio, la puntualidad..."
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {formComment.trim().length}/1000
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenForm(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={submitRating} disabled={submitting}>
              {myRating ? "Guardar cambios" : "Publicar evaluación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatingSystem;
