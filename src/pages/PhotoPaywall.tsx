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

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  const startPayment = async () => {
    if (!listingId) {
      toast({
        title: "Anuncio no encontrado",
        description: "Primero guarda el anuncio antes de pagar las fotos extra.",
        variant: "destructive",
      });
      navigate("/post-ad");
      return;
    }
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("pagopar-create-order", {
        body: { listing_id: listingId, photo_count: 10 },
      });
      if (error) throw error;
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      throw new Error("No se recibió URL de pago");
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "No se pudo iniciar el pago",
        variant: "destructive",
      });
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
            <Button className="w-full" onClick={startPayment} disabled={processing}>
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Pagar con Pagopar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotoPaywall;