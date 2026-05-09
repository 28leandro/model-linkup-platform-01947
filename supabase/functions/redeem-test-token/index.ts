import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { listing_id, code } = await req.json();
    if (!code) throw new Error("code required");

    const expected = Deno.env.get("TEST_PHOTO_TOKEN");
    if (!expected) throw new Error("Test token not configured");
    const provided = String(code).trim();
    const expectedClean = expected.trim();
    if (
      provided !== expectedClean &&
      provided.toLowerCase() !== expectedClean.toLowerCase()
    ) {
      console.log("redeem-test-token: mismatch", {
        providedLen: provided.length,
        expectedLen: expectedClean.length,
      });
      return new Response(JSON.stringify({ error: "Código inválido" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!listing_id) {
      return new Response(JSON.stringify({ success: true, valid_only: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ownership check
    const { data: owned, error: ownErr } = await supabase
      .from("listings")
      .select("id")
      .eq("id", listing_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownErr) throw ownErr;
    if (!owned) throw new Error("Anuncio no encontrado");

    const { error: updErr } = await supabase
      .from("listings")
      .update({ photos_unlocked: true, is_published: true })
      .eq("id", listing_id);
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ success: true }), {
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