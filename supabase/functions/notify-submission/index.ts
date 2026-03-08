import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL")!;

const SCORE_LABELS = ["Pass", "Legit", "Big Legit", "Certified Legit Buy"];
const PRICE_SYMBOLS: Record<string, string> = {
  cheap: "£", fair: "££", pricey: "£££"
};

serve(async (req) => {
  const payload = await req.json();
  const r = payload.record;

  const score = SCORE_LABELS[r.rating] ?? `${r.rating}`;
  const price = r.price ? `£${r.price}` : "";
  const priceRange = PRICE_SYMBOLS[r.price_range] ?? "";
  const dietTags = Array.isArray(r.diet_tags) && r.diet_tags.length > 0
    ? r.diet_tags.join(", ")
    : "None";

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#0d0d0d;color:#f0ede8;border-radius:12px;overflow:hidden;">
      <div style="background:#C8FF47;padding:16px 24px;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#0a0a0a;">Legit Buys · New submission</p>
      </div>
      <div style="padding:24px;">
        <h2 style="margin:0 0 4px;font-size:22px;color:#f0ede8;">${r.product}</h2>
        <p style="margin:0 0 20px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.12em;">${r.category} · ${r.where}</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:12px;color:#666;">Score</td>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:13px;color:#C8FF47;font-weight:700;">${score}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:12px;color:#666;">Price</td>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:13px;color:#f0ede8;">${price} ${priceRange}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:12px;color:#666;">Submitted by</td>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:13px;color:#f0ede8;">${r.submitter}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:12px;color:#666;">Dietary</td>
            <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:13px;color:#f0ede8;">${dietTags}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-size:12px;color:#666;">Date</td>
            <td style="padding:10px 0;font-size:13px;color:#f0ede8;">${r.date}</td>
          </tr>
        </table>

        <div style="background:#141414;border:1px solid #1e1e1e;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#aaa;font-style:italic;line-height:1.6;">"${r.review}"</p>
        </div>

        <a href="https://legit-buys.vercel.app" style="display:inline-block;background:#C8FF47;color:#0a0a0a;text-decoration:none;padding:12px 28px;border-radius:99px;font-size:13px;font-weight:700;letter-spacing:.04em;">
          Review in admin panel →
        </a>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Legit Buys <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `New submission: ${r.product} by ${r.submitter}`,
      html,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200 });
});