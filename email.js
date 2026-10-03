/**
 * BARKHO — order confirmation email (sent through Resend: https://resend.com)
 *
 * Needs two Netlify environment variables:
 *   RESEND_API_KEY  — your Resend API key (starts with re_)
 *   EMAIL_FROM      — sender, e.g. "BARKHO <orders@yourdomain.com>"
 *                     (before you have a domain: "BARKHO <onboarding@resend.dev>",
 *                      which can only send to your own Resend account email)
 *
 * If RESEND_API_KEY is missing, nothing is sent and orders still work.
 */

const PRODUCTS = require("./products.js");

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNok(amount) {
  return `${Math.round(amount)} NOK`;
}

function buildEmail({ name, cart, amountTotal, address, siteUrl }) {
  let itemsTotal = 0;
  const rows = cart
    .map((line) => {
      const product = PRODUCTS.find((p) => p.id === line.id);
      const title = product ? product.name : line.id;
      const price = product ? product.priceNok * (line.qty || 1) : 0;
      itemsTotal += price;
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #DEDACD;">
            ${escapeHtml(title)}<br>
            <span style="color:#57534A;font-size:13px;">Size ${escapeHtml(line.size)} · Qty ${escapeHtml(line.qty || 1)}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #DEDACD;text-align:right;white-space:nowrap;">${formatNok(price)}</td>
        </tr>`;
    })
    .join("");

  const addressLines = [
    address.line1,
    address.line2,
    [address.postal_code, address.city].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");

  const html = `
  <div style="background:#F4F1EA;padding:32px 16px;font-family:Georgia,serif;color:#17140F;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;padding:32px;">
      <div style="font-size:28px;font-weight:bold;letter-spacing:2px;">BARKHO</div>
      <h1 style="font-size:24px;margin:28px 0 8px;">Thank you${name ? ", " + escapeHtml(name.split(" ")[0]) : ""}.</h1>
      <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#57534A;margin:0 0 24px;">
        Your order is confirmed. Every piece is made to order — production takes 2–5 business days,
        and you'll get a shipping notice when it's on its way.
      </p>
      <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;">
        ${rows}
        <tr>
          <td style="padding:10px 0;">Shipping</td>
          <td style="padding:10px 0;text-align:right;">${formatNok(Math.max(0, amountTotal - itemsTotal))}</td>
        </tr>
        <tr>
          <td style="padding:12px 0;font-weight:bold;border-top:2px solid #17140F;">Total</td>
          <td style="padding:12px 0;font-weight:bold;text-align:right;border-top:2px solid #17140F;">${formatNok(amountTotal)}</td>
        </tr>
      </table>
      <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#57534A;margin:24px 0 0;">
        <b style="color:#17140F;">Shipping to</b><br>${addressLines}
      </p>
      <p style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#57534A;margin:28px 0 0;border-top:1px solid #DEDACD;padding-top:16px;">
        Questions? Just reply to this email.<br>
        <a href="${siteUrl}/shipping-returns.html" style="color:#2440E0;">Shipping &amp; Returns</a> ·
        <a href="${siteUrl}/terms.html" style="color:#2440E0;">Terms</a>
      </p>
    </div>
  </div>`;

  return html;
}

async function sendOrderConfirmation({ to, name, cart, amountTotal, address, siteUrl }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set — skipping confirmation email");
    return { skipped: true };
  }
  if (!to) {
    console.log("No customer email — skipping confirmation email");
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "BARKHO <onboarding@resend.dev>",
      to: [to],
      reply_to: "maxim.barkho@hotmail.com",
      subject: "Your BARKHO order is confirmed",
      html: buildEmail({ name, cart, amountTotal, address: address || {}, siteUrl }),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

module.exports = { sendOrderConfirmation };
