import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// Verifica se as chaves do Pagopar foram configuradas como secrets.
// Requer um usuário autenticado para evitar que visitantes anônimos
// consigam sondar o estado da configuração de pagamentos.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claims?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Admin-only: verify role using service role client to bypass RLS safely.
  const userId = claims.claims.sub as string;
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: isAdmin, error: roleErr } = await adminClient.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (roleErr || !isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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