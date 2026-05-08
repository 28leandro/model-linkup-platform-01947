import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const PhotoPaywall = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const listingId = params.get("listing_id");
  const { user, loading } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  const simulatePayment = async () => {
    setProcessing(true);
    try {
      // Simulated checkout — flips photos_unlocked on the listing if provided
      await new Promise((r) => setTimeout(r, 1200));
      if (listingId) {
        const { error } = await supabase
          .from("listings")
          .update({ photos_unlocked: true })
          .eq("id", listingId);
        if (error) throw error;
      }
      setDone(true);
      toast({ title: "Pago confirmado", description: "Fotos desbloqueadas — hasta 10 fotos" });
      setTimeout(() => navigate(listingId ? `/post-ad/${listingId}` : "/post-ad"), 900);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "No se pudo procesar el pago", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-lg mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to={listingId ? `/post-ad/${listingId}` : "/post-ad"} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Desbloquear fotos ilimitadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Has alcanzado el límite gratuito de 3 fotos. Desbloquea hasta 10 fotos para destacar tu anuncio.
            </p>
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Pack 10 fotos</span>
                <span className="text-2xl font-bold text-primary">Gs. 4.000</span>
              </div>
              <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Hasta 10 fotos por anuncio</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Mayor visibilidad</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Pago único</li>
              </ul>
            </div>
            <Button className="w-full" onClick={simulatePayment} disabled={processing || done}>
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {done ? "¡Desbloqueado!" : "Confirmar pago (simulado)"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotoPaywall;