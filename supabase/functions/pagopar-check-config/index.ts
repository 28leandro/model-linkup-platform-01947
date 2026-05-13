import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Verifica se as chaves do Pagopar foram configuradas como secrets.
// Não retorna os valores — apenas booleanos — para uso seguro no frontend.
Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const hasPublicKey = !!Deno.env.get("PAGOPAR_PUBLIC_KEY");
  const hasPrivateKey = !!Deno.env.get("PAGOPAR_PRIVATE_KEY");

  return new Response(
    JSON.stringify({
      configured: hasPublicKey && hasPrivateKey,
      hasPublicKey,
      hasPrivateKey,
      webhook_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/pagopar-webhook`,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});