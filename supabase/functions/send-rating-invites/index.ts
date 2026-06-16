import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// Cron-invoked. Finds service_contacts confirmed >24h ago without an invite
// sent, and inserts a system "rate invite" message into the buyer's inbox.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: pending, error } = await admin
    .from("service_contacts")
    .select("id, buyer_id, seller_id, listing_id")
    .lt("confirmed_at", cutoff)
    .not("confirmed_at", "is", null)
    .is("invite_sent_at", null)
    .is("declined_at", null)
    .limit(500);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  for (const c of pending || []) {
    const { data: listing } = await admin
      .from("listings")
      .select("id, title, category")
      .eq("id", c.listing_id)
      .maybeSingle();
    if (!listing || listing.category !== "services") continue;

    const content = `__SYS_RATE_INVITE__:${listing.id}::¿Cómo fue tu experiencia con "${listing.title}"? Tomate un minuto para dejar tu evaluación y ayudar a otros usuarios.`;

    const { error: insErr } = await admin.from("messages").insert({
      sender_id: null,
      receiver_id: c.buyer_id,
      ad_id: c.listing_id,
      content,
    });
    if (insErr) continue;

    await admin
      .from("service_contacts")
      .update({ invite_sent_at: new Date().toISOString() })
      .eq("id", c.id);
    sent++;
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});