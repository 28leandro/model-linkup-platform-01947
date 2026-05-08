import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pricing rule: 0-3 photos free, 4-8 = 3500 Gs, 9-12 = 4000 Gs (max 12)
function priceFor(photoCount: number): number {
  if (photoCount <= 3) return 0;
  if (photoCount <= 8) return 3500;
  if (photoCount <= 12) return 4000;
  return -1;
}

async function sha1Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { listing_id, photo_count } = await req.json();
    if (!listing_id || typeof photo_count !== "number") {
      throw new Error("listing_id and photo_count required");
    }

    // Ownership check: ensure listing belongs to caller
    const { data: ownedListing, error: ownErr } = await supabase
      .from("listings")
      .select("id")
      .eq("id", listing_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownErr) throw ownErr;
    if (!ownedListing) throw new Error("listing not found or not owned by user");

    const amount = priceFor(photo_count);
    if (amount < 0) throw new Error("Maximum 12 photos");
    if (amount === 0) {
      // Free tier — auto-publish
      await supabase.from("listings").update({ is_published: true }).eq("id", listing_id).eq("user_id", user.id);
      return new Response(JSON.stringify({ free: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pagopar credentials (fictitious for now — replace later)
    const PUBLIC_KEY = Deno.env.get("PAGOPAR_PUBLIC_KEY");
    const PRIVATE_KEY = Deno.env.get("PAGOPAR_PRIVATE_KEY");
    if (!PUBLIC_KEY || !PRIVATE_KEY) {
      throw new Error("Pagopar keys not configured");
    }

    const orderNumber = `LST-${listing_id.slice(0, 8)}-${Date.now()}`;
    // Pagopar token signature: SHA1(private_key + orderNumber + amount + currency)
    const pagoparToken = await sha1Hex(`${PRIVATE_KEY}${orderNumber}${amount}PYG`);

    const { data: order, error: insErr } = await supabase
      .from("payment_orders")
      .insert({
        user_id: user.id,
        listing_id,
        photo_count,
        amount_pyg: amount,
        external_order_number: orderNumber,
        pagopar_token: pagoparToken,
        status: "pending",
      })
      .select()
      .single();
    if (insErr) throw insErr;

    // In real impl: POST to https://api.pagopar.com/api/comercios/1.1/iniciar-transaccion
    // For now we return a simulated checkout URL
    const checkoutUrl = `https://desarrollo.pagopar.com/pagos/${pagoparToken}?order=${orderNumber}&amount=${amount}&public_key=${PUBLIC_KEY}`;

    return new Response(
      JSON.stringify({
        order_id: order.id,
        external_order_number: orderNumber,
        amount,
        checkout_url: checkoutUrl,
        token: pagoparToken,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});