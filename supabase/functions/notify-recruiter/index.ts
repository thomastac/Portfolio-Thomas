import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const TO_EMAIL = 'thomastac920@gmail.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, subject, company_name, contact_name, contact_email, location_name, job_type, duration, message } = body;

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — email not sent');
      return new Response(JSON.stringify({ success: true, email_sent: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    /* ── Formulaire de contact (section #contact du portfolio) ── */
    if (type === 'contact') {
      const safe = (s: string) => String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const contactHtml = `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#fafafa;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:#81B29A;padding:28px 32px;">
            <h1 style="color:white;margin:0;font-size:22px;">✉️ Nouveau message — Portfolio</h1>
          </div>
          <div style="padding:32px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;color:#888;width:120px;">Expéditeur</td><td style="padding:10px 0;font-weight:600;color:#3D405B;">${safe(contact_email)}</td></tr>
              <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;color:#888;">Objet</td><td style="padding:10px 0;color:#3D405B;">${safe(subject)}</td></tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:#fff;border-radius:8px;border:1px solid #eee;color:#3D405B;white-space:pre-wrap;line-height:1.6;">${safe(message)}</div>
            <div style="margin-top:24px;padding:16px;background:#81B29A22;border-left:4px solid #81B29A;border-radius:4px;">
              <p style="margin:0;color:#3D405B;font-weight:600;">Répondre à : <a href="mailto:${safe(contact_email)}" style="color:#3D405B;">${safe(contact_email)}</a></p>
            </div>
          </div>
          <div style="padding:20px 32px;background:#f0f0f0;text-align:center;font-size:12px;color:#999;">Formulaire de contact · Portfolio de Thomas CHONGCHAREUN</div>
        </div>`;
      const cRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Portfolio <onboarding@resend.dev>',
          to: [TO_EMAIL],
          reply_to: contact_email,
          subject: `[Portfolio – Contact] ${subject ?? 'Nouveau message'}`,
          html: contactHtml,
        }),
      });
      const cData = await cRes.json();
      return new Response(JSON.stringify({ success: true, email_sent: true, resend: cData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#fafafa;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:#3D405B;padding:28px 32px;">
          <h1 style="color:white;margin:0;font-size:22px;">📍 Nouvelle Proposition — Portfolio</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#555;font-size:15px;margin-bottom:24px;">Un recruteur vient d'épingler une proposition sur votre carte interactive.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;color:#888;width:140px;">Entreprise</td><td style="padding:10px 0;font-weight:600;color:#3D405B;">${company_name}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;color:#888;">Localisation</td><td style="padding:10px 0;color:#3D405B;">${location_name}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;color:#888;">Contact</td><td style="padding:10px 0;color:#3D405B;">${contact_name ?? ''} &lt;${contact_email}&gt;</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;color:#888;">Type de poste</td><td style="padding:10px 0;color:#3D405B;">${job_type}</td></tr>
            <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0;color:#888;">Durée / Timing</td><td style="padding:10px 0;color:#3D405B;">${duration ?? 'Non précisé'}</td></tr>
            ${message ? `<tr><td style="padding:10px 0;color:#888;vertical-align:top;">Message</td><td style="padding:10px 0;color:#3D405B;">${message}</td></tr>` : ''}
          </table>
          <div style="margin-top:28px;padding:16px;background:#E07A5F22;border-left:4px solid #E07A5F;border-radius:4px;">
            <p style="margin:0;color:#E07A5F;font-weight:600;">Répondre à : <a href="mailto:${contact_email}" style="color:#E07A5F;">${contact_email}</a></p>
          </div>
        </div>
        <div style="padding:20px 32px;background:#f0f0f0;text-align:center;font-size:12px;color:#999;">
          Envoyé depuis votre portfolio interactif · Thomas CHONGCHAREUN
        </div>
      </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: contact_email,
        subject: `[Portfolio] Proposition de ${company_name} — ${job_type}`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, email_sent: true, resend: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
