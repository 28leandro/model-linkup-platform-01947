import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const Body = z.object({
  contact_id: z.string().uuid(),
  answer: z.enum(["yes", "no"]),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
  const sellerId = claims.claims.sub as string;

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

  const { data: contact } = await admin
    .from("service_contacts")
    .select("id, seller_id, listing_id, buyer_id")
    .eq("id", parsed.data.contact_id)
    .maybeSingle();

  if (!contact || contact.seller_id !== sellerId) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const patch = parsed.data.answer === "yes"
    ? { confirmed_at: new Date().toISOString() }
    : { declined_at: new Date().toISOString() };

  await admin.from("service_contacts").update(patch).eq("id", contact.id);

  // Replace the original system message in seller's inbox
  const newContent = parsed.data.answer === "yes"
    ? `Marcaste este contacto como atendido. El cliente podrá evaluarte 24 horas después.`
    : `Marcaste este contacto como no atendido. No se enviará invitación de evaluación.`;

  await admin
    .from("messages")
    .update({ content: newContent })
    .eq("receiver_id", sellerId)
    .eq("ad_id", contact.listing_id)
    .is("sender_id", null)
    .like("content", `__SYS_WA_CONFIRM__:${contact.id}:%`);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});