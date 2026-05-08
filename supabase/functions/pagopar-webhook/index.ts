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
    const orderNumber = body.numero_pedido ?? body.external_order_number;
    const status = (body.estado ?? body.status ?? "").toString().toUpperCase();
    const method = body.forma_pago ?? body.payment_method ?? null;
    const hash = body.hash_pagopar ?? body.hash ?? null;

    if (!orderNumber) throw new Error("numero_pedido required");
    if (!hash) {
      return new Response(JSON.stringify({ error: "missing hash" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: getErr } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("external_order_number", orderNumber)
      .single();
    if (getErr || !order) throw new Error("Order not found");

    // Verify Pagopar hash signature: SHA1(PRIVATE_KEY + orderNumber + amount + currency)
    const PRIVATE_KEY = Deno.env.get("PAGOPAR_PRIVATE_KEY");
    if (!PRIVATE_KEY) {
      console.error("PAGOPAR_PRIVATE_KEY not configured");
      return new Response(JSON.stringify({ error: "server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const expected = await sha1Hex(
      `${PRIVATE_KEY}${orderNumber}${order.amount_pyg}PYG`
    );
    if (hash.toLowerCase() !== expected.toLowerCase()) {
      return new Response(JSON.stringify({ error: "invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPaid = status === "PAGO" || status === "PAID";

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