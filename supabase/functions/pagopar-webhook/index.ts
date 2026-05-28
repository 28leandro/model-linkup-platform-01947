import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha1Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Pagopar webhook — receives payment confirmation
// Expected payload (simplified): { hash_pagopar, numero_pedido, estado, forma_pago }
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const result = Array.isArray(body?.resultado) ? body.resultado[0] ?? {} : body;
    const orderNumber = result.id_pedido_comercio ?? result.external_order_number ?? result.numero_pedido;
    const status = (result.estado ?? result.status ?? "").toString().toUpperCase();
    const method = result.forma_pago ?? result.payment_method ?? null;
    const hash = result.hash_pedido ?? result.hash_pagopar ?? result.hash ?? null;
    const token = result.token ?? body.token ?? null;

    if (!hash) {
      return new Response(JSON.stringify({ error: "missing hash" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: getErr } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("pagopar_hash", hash)
      .single();
    if (getErr || !order) throw new Error("Order not found");

    // Verify Pagopar notification token: SHA1(PRIVATE_KEY + hash_pedido)
    const PRIVATE_KEY = Deno.env.get("PAGOPAR_PRIVATE_KEY");
    if (!PRIVATE_KEY) {
      console.error("PAGOPAR_PRIVATE_KEY not configured");
      return new Response(JSON.stringify({ error: "server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const expected = await sha1Hex(`${PRIVATE_KEY.trim()}${hash}`);
    if (!token || token.toLowerCase() !== expected.toLowerCase()) {
      return new Response(JSON.stringify({ error: "invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPaid = result.pagado === true || status === "PAGO" || status === "PAID";

    await supabase.from("payment_orders").update({
      status: isPaid ? "paid" : "failed",
      payment_method: method,
      pagopar_hash: hash,
      paid_at: isPaid ? new Date().toISOString() : null,
    }).eq("id", order.id);

    if (isPaid && order.listing_id) {
      await supabase
        .from("listings")
        .update({ is_published: true, photos_unlocked: true })
        .eq("id", order.listing_id);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});