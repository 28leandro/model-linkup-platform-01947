import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CASH_METHODS = ["aqui_pago", "pago_express", "efectivo", "cash"];

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const orderNumber = params.get("order");

  const [waiting, setWaiting] = useState(true); // 3s intro loader
  const [order, setOrder] = useState<any>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // 3s loader
  useEffect(() => {
    const t = setTimeout(() => setWaiting(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Security: must be logged in AND own a paid/pending order
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      let q = supabase.from("payment_orders").select("*").eq("user_id", user.id);
      if (orderNumber) q = q.eq("external_order_number", orderNumber);
      else q = q.order("created_at", { ascending: false }).limit(1);
      const { data } = await q.maybeSingle();
      if (!data) {
        setAuthorized(false);
        setTimeout(() => navigate("/", { replace: true }), 1500);
        return;
      }
      setOrder(data);
      setAuthorized(true);
    })();
  }, [user, authLoading, orderNumber, navigate]);

  // Poll for paid status
  useEffect(() => {
    if (!order || order.status === "paid") return;
    let tries = 0;
    const t = setInterval(async () => {
      tries++;
      const { data } = await supabase
        .from("payment_orders")
        .select("*")
        .eq("id", order.id)
        .maybeSingle();
      if (data) setOrder(data);
      if (data?.status === "paid" || tries > 30) clearInterval(t);
    }, 3000);
    return () => clearInterval(t);
  }, [order?.id]);

  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-destructive font-medium">Acceso no autorizado</p>
            <p className="text-sm text-muted-foreground">Redirigiendo al inicio…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCash = order?.payment_method && CASH_METHODS.includes(String(order.payment_method).toLowerCase());
  const isPaid = order?.status === "paid";
  const showLoader = waiting || authorized === null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-glow animate-fade-in">
        <CardHeader className="text-center pt-10">
          {showLoader ? (
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
          ) : (
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-2 w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
          )}
          <CardTitle className="mt-4 text-2xl">
            {showLoader ? "Verificando pago…" : "¡Todo listo! Acceso desbloqueado"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-5 pb-8">
          {!showLoader && (
            <>
              <p className="text-muted-foreground">
                Ya puedes empezar a subir tus fotos y lanzar tus anuncios.
              </p>

              {!isPaid && isCash && (
                <div className="text-sm rounded-md border border-yellow-500/30 bg-yellow-500/10 text-yellow-900 dark:text-yellow-200 p-3">
                  Si pagaste en efectivo (Aquí Pago/Pago Express), tu acceso se liberará en máximo 15 minutos.
                </div>
              )}

              {!isPaid && !isCash && (
                <p className="text-xs text-muted-foreground">
                  Esperando confirmación de Pagopar…
                </p>
              )}

              <Button asChild size="lg" className="w-full">
                <Link to="/post-ad">Crear mi primer anuncio</Link>
              </Button>

              <a
                href={`https://wa.me/595981000000?text=${encodeURIComponent("Hola, tengo un problema con mi pago")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                ¿Tienes problemas? Contáctanos por WhatsApp
              </a>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;