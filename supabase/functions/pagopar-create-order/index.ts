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

const PAGOPAR_API = "https://api.pagopar.com/api/comercios/1.1/iniciar-transaccion";

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
      .select("id, title")
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

    const PUBLIC_KEY = Deno.env.get("PAGOPAR_PUBLIC_KEY");
    const PRIVATE_KEY = Deno.env.get("PAGOPAR_PRIVATE_KEY");
    if (!PUBLIC_KEY || !PRIVATE_KEY) {
      throw new Error("Pagopar keys not configured");
    }

    const orderNumber = `LST-${listing_id.slice(0, 8)}-${Date.now()}`;
    // Pagopar 1.1 signature for iniciar-transaccion:
    // token = sha1(private_token + public_key + numero_pedido + monto_total)
    const pagoparToken = await sha1Hex(
      `${PRIVATE_KEY}${PUBLIC_KEY}${orderNumber}${amount}`
    );
    // Hash used to validate webhook (numero_pedido + amount + currency)
    const webhookHash = await sha1Hex(
      `${PRIVATE_KEY}${orderNumber}${amount}PYG`
    );

    const { data: order, error: insErr } = await supabase
      .from("payment_orders")
      .insert({
        user_id: user.id,
        listing_id,
        photo_count,
        amount_pyg: amount,
        external_order_number: orderNumber,
        pagopar_token: webhookHash,
        status: "pending",
      })
      .select()
      .single();
    if (insErr) throw insErr;

    const fechaMax = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const payload = {
      token: pagoparToken,
      public_key: PUBLIC_KEY,
      tipo_pedido: "VENTA",
      numero_pedido: orderNumber,
      monto_total: amount,
      id_estado_pedido: 1,
      fecha_maxima_pago: fechaMax,
      descripcion_resumen: `Pack ${photo_count} fotos - Anuncio`,
      email_solicitante: user.email ?? "noreply@nemu.com.py",
      comprador: {
        documento: "0",
        documento_tipo: "CI",
        email: user.email ?? "noreply@nemu.com.py",
        nombre: (user.user_metadata?.full_name as string) ?? user.email ?? "Cliente",
        telefono: "0000000000",
        direccion: "Asuncion",
        pais: "PY",
      },
      compras_items: [
        {
          nombre: `Pack ${photo_count} fotos`,
          ticket: orderNumber,
          descripcion: `Desbloqueo de fotos para anuncio ${ownedListing.title ?? ""}`.slice(0, 250),
          url_imagen: "",
          cantidad: 1,
          precio_unitario: amount,
        },
      ],
    };

    const apiRes = await fetch(PAGOPAR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const apiJson = await apiRes.json().catch(() => null);
    console.log("[pagopar] response", apiRes.status, JSON.stringify(apiJson));

    if (!apiRes.ok || !apiJson || apiJson.respuesta === false) {
      const msg =
        (apiJson && (apiJson.resultado?.[0]?.mensaje || apiJson.mensaje)) ||
        `Pagopar API error (HTTP ${apiRes.status})`;
      throw new Error(msg);
    }

    const hashPedido: string | undefined =
      apiJson.resultado?.[0]?.hash_pedido ||
      apiJson.hash_pedido ||
      apiJson.resultado?.hash_pedido;
    if (!hashPedido) throw new Error("Pagopar no devolvió hash_pedido");

    const checkoutUrl = `https://www.pagopar.com/pagos/${hashPedido}`;

    return new Response(
      JSON.stringify({
        order_id: order.id,
        external_order_number: orderNumber,
        amount,
        checkout_url: checkoutUrl,
        hash_pedido: hashPedido,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[pagopar-create-order]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});