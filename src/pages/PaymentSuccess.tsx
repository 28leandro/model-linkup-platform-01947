import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");
  const [status, setStatus] = useState<"checking" | "paid" | "pending">("checking");

  useEffect(() => {
    if (!orderNumber) return;
    let tries = 0;
    const t = setInterval(async () => {
      tries++;
      const { data } = await supabase
        .from("payment_orders")
        .select("status")
        .eq("external_order_number", orderNumber)
        .maybeSingle();
      if (data?.status === "paid") {
        setStatus("paid");
        clearInterval(t);
      } else if (tries > 20) {
        setStatus("pending");
        clearInterval(t);
      }
    }, 3000);
    return () => clearInterval(t);
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === "checking" ? (
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          ) : (
            <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
          )}
          <CardTitle className="mt-2">
            {status === "paid" ? "Pago confirmado!" : status === "pending" ? "Aguardando confirmação" : "Verificando pago..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            {status === "paid"
              ? "Seu anúncio foi publicado com todas as fotos."
              : "Assim que Pagopar confirmar, seu anúncio será publicado automaticamente."}
          </p>
          <Button asChild className="w-full">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;