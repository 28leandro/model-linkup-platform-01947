import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Sightengine image moderation. Receives base64 image, returns { approved, reason }.
// Models: nudity-2.1, weapon, offensive, gore. Threshold: 0.8.
const THRESHOLD = 0.8;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require authenticated caller to prevent anonymous abuse of paid Sightengine quota.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiUser = Deno.env.get('SIGHTENGINE_API_USER');
    const apiSecret = Deno.env.get('SIGHTENGINE_API_SECRET');
    if (!apiUser || !apiSecret) {
      return new Response(JSON.stringify({ error: 'Moderation not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageBase64, contentType } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(JSON.stringify({ error: 'imageBase64 required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cap payload at ~10MB base64 (~7.5MB binary) to limit abuse cost.
    if (imageBase64.length > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Image too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert base64 -> Blob for multipart upload.
    const bytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: contentType || 'image/jpeg' });

    const form = new FormData();
    form.append('media', blob, 'image');
    form.append('models', 'nudity-2.1,weapon,offensive,gore');
    form.append('api_user', apiUser);
    form.append('api_secret', apiSecret);

    const seRes = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: form,
    });
    const data = await seRes.json();

    if (data.status !== 'success') {
      console.error('Sightengine error', data);
      // Fail-open: if the moderation service is down, allow the image (avoid blocking legit users).
      return new Response(JSON.stringify({ approved: true, reason: 'service_unavailable' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reasons: string[] = [];
    const n = data.nudity || {};
    const nudityScore = Math.max(
      n.sexual_activity ?? 0,
      n.sexual_display ?? 0,
      n.erotica ?? 0,
      n.very_suggestive ?? 0,
    );
    if (nudityScore >= THRESHOLD) reasons.push('nudity');
    if ((data.weapon?.classes?.firearm ?? data.weapon ?? 0) >= THRESHOLD) reasons.push('weapon');
    if ((data.offensive?.prob ?? data.offensive?.nazi ?? 0) >= THRESHOLD) reasons.push('offensive');
    if ((data.gore?.prob ?? 0) >= THRESHOLD) reasons.push('gore');

    const approved = reasons.length === 0;
    return new Response(JSON.stringify({ approved, reasons }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('moderate-image error', err);
    return new Response(JSON.stringify({ approved: true, reason: 'error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});