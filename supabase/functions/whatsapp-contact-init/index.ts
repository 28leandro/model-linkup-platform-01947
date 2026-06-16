import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const Body = z.object({ listing_id: z.string().uuid() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const buyerId = claims.claims.sub as string;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: listing } = await admin
    .from("listings")
    .select("id, user_id, title, category")
    .eq("id", parsed.data.listing_id)
    .maybeSingle();

  if (!listing || listing.category !== "services" || listing.user_id === buyerId) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Upsert pending contact
  const { data: contactRows } = await admin
    .from("service_contacts")
    .upsert(
      {
        buyer_id: buyerId,
        seller_id: listing.user_id,
        listing_id: listing.id,
        channel: "whatsapp",
        contacted_at: new Date().toISOString(),
      },
      { onConflict: "buyer_id,listing_id,channel", ignoreDuplicates: false }
    )
    .select("id, confirmed_at, declined_at")
    .limit(1);

  const contact = contactRows?.[0];
  if (!contact) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // If already confirmed or declined, no need to notify again
  if (contact.confirmed_at || contact.declined_at) {
    return new Response(JSON.stringify({ ok: true, already: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch buyer display name
  const { data: buyerInfo } = await admin.auth.admin.getUserById(buyerId);
  const meta = (buyerInfo?.user?.user_metadata || {}) as Record<string, string>;
  const buyerName =
    meta.full_name || meta.name || buyerInfo?.user?.email?.split("@")[0] || "Un usuario";

  // Insert system message to seller's inbox (sender_id=NULL bypasses tracking trigger)
  const sysContent = `__SYS_WA_CONFIRM__:${contact.id}::${buyerName} te contactó por WhatsApp sobre "${listing.title}". ¿Lo atendiste?`;
  await admin.from("messages").insert({
    sender_id: null,
    receiver_id: listing.user_id,
    ad_id: listing.id,
    content: sysContent,
  });

  return new Response(JSON.stringify({ ok: true, contact_id: contact.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});