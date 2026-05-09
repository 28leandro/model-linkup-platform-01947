import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

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

  const redeemToken = async () => {
    if (!listingId) {
      toast({
        title: "Anuncio no encontrado",
        description: "Primero guarda el anuncio antes de canjear el código.",
        variant: "destructive",
      });
      navigate("/post-ad");
      return;
    }
    if (!code.trim()) {
      toast({ title: "Ingresa un código", variant: "destructive" });
      return;
    }
    setRedeeming(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-test-token", {
        body: { listing_id: listingId, code: code.trim() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: "¡Código aplicado!", description: "Ahora puedes subir hasta 10 fotos." });
      navigate(`/post-ad/${listingId}`);
    } catch (e: any) {
      toast({
        title: "Código inválido",
        description: e.message || "No se pudo aplicar el código",
        variant: "destructive",
      });
    } finally {
      setRedeeming(false);
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

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-2 text-xs text-muted-foreground">o</span></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-code">Código promocional (fase de prueba)</Label>
              <div className="flex gap-2">
                <Input
                  id="test-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ingresa tu código"
                  className="h-11 sm:h-10"
                />
                <Button variant="outline" onClick={redeemToken} disabled={redeeming}>
                  {redeeming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Aplicar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Durante la fase de prueba, usa un código válido para subir hasta 10 fotos sin pagar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotoPaywall;