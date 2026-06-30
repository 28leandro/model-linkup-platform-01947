import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePagoparScript } from "@/hooks/usePagoparScript";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type ConfigState = {
  configured: boolean;
  hasPublicKey: boolean;
  hasPrivateKey: boolean;
  webhook_url: string;
} | null;

const PagoparTest = () => {
  const { user, loading } = useAuth();
  const scriptStatus = usePagoparScript();
  const [config, setConfig] = useState<ConfigState>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const refresh = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "pagopar-check-config"
      );
      if (error) throw error;
      setConfig(data as ConfigState);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "No se pudo verificar la configuración",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      const admin = !error && !!data;
      setIsAdmin(admin);
      if (admin) refresh();
      else setChecking(false);
    })();
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (isAdmin === false) return <Navigate to="/" replace />;

  const handleTestPayment = () => {
    if (!config?.configured) {
      toast({
        title: "Llaves faltantes",
        description:
          "Configura PAGOPAR_PUBLIC_KEY y PAGOPAR_PRIVATE_KEY como secrets en Lovable Cloud.",
        variant: "destructive",
      });
      return;
    }
    if (scriptStatus !== "ready") {
      toast({
        title: "Script no cargado",
        description: `Estado actual: ${scriptStatus}`,
        variant: "destructive",
      });
      return;
    }
    // @ts-expect-error — Pagopar global injectada por pay-v1.js
    const Pagopar = window.Pagopar;
    console.log("[Pagopar Test] System ready", {
      scriptStatus,
      config,
      Pagopar,
    });
    toast({
      title: "✓ Sistema listo",
      description:
        "Llaves presentes y script cargado. Listo para llamar a la API y abrir el modal.",
    });
  };

  const Indicator = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex items-center justify-between rounded-md border p-3">
      <span className="text-sm">{label}</span>
      {ok ? (
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-destructive" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-lg mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Pagopar — Diagnóstico de integración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Indicator
              ok={scriptStatus === "ready"}
              label={`Script Pagopar (pay-v1.js): ${scriptStatus}`}
            />
            {checking ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Verificando llaves…
              </div>
            ) : (
              <>
                <Indicator
                  ok={!!config?.hasPublicKey}
                  label="PAGOPAR_PUBLIC_KEY configurada"
                />
                <Indicator
                  ok={!!config?.hasPrivateKey}
                  label="PAGOPAR_PRIVATE_KEY configurada"
                />
              </>
            )}

            {config?.webhook_url && (
              <div className="rounded-md border p-3 space-y-2 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground">
                  Webhook (IPN) URL — pega esto en el panel de Pagopar:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs break-all flex-1">
                    {config.webhook_url}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(config.webhook_url);
                      toast({ title: "Copiado" });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <Button className="w-full" onClick={handleTestPayment}>
              Probar inicialización de Pagopar
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={refresh}
              disabled={checking}
            >
              {checking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Re-verificar configuración
            </Button>

            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <p className="font-medium">Pasos restantes:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Agrega las llaves PAGOPAR_PUBLIC_KEY y PAGOPAR_PRIVATE_KEY en los Secrets.</li>
                <li>Configura el webhook en el panel de Pagopar con la URL de arriba.</li>
                <li>Vuelve a esta página y presiona "Re-verificar".</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PagoparTest;