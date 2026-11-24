// Envío de correos por SMTP (igual que en Piquea).
// Variables en Netlify: SMTP_HOST · SMTP_PORT (465) · SMTP_USER (hola@ladynails.pe) · SMTP_PASS
//   SMTP_FROM ("Lady Nails Studio <hola@ladynails.pe>") · opcional SMTP_COPIA (copia oculta al equipo, separadas por comas)
import nodemailer from "nodemailer";

export const correoConfigurado = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function enviarCorreo(para: string, asunto: string, filas: [string, string][], intro: string) {
  if (!correoConfigurado()) return false;
  const port = Number(process.env.SMTP_PORT || 465);
  const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER!.trim(), pass: process.env.SMTP_PASS } });
  const F = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif";
  const html = `<div style="background:#f4f1e7;padding:28px 12px;${F}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fffdf9;border-radius:18px;overflow:hidden">
<tr><td style="background:#722a2a;color:#f4f1e7;padding:22px 26px;font-size:20px">Lady Nails Studio</td></tr>
<tr><td style="padding:24px 26px;color:#3b2a2a;font-size:14px;line-height:1.6">
<p style="margin:0 0 16px">${esc(intro).replace(/\n/g, "<br>")}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${filas
    .map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;color:#7a6461;font-size:12px;vertical-align:top;width:34%;border-top:1px solid #e6dcd3">${esc(k)}</td><td style="padding:8px 0;border-top:1px solid #e6dcd3;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("")}</table>
</td></tr>
<tr><td style="padding:16px 26px 24px;color:#7a6461;font-size:11.5px;line-height:1.5">BEAUTY CORP PERU S.A.C. · RUC 20615935396 · Av. Caminos del Inca 131, Edificio G, Of. 305, Santiago de Surco</td></tr>
</table></div>`;
  const bcc = (process.env.SMTP_COPIA ?? "").split(/[,;\s]+/).filter((x) => x.includes("@"));
  await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: para, bcc: bcc.length ? bcc : undefined, subject: asunto, html, text: `${intro}\n\n${filas.map(([k, v]) => `${k}: ${v}`).join("\n")}` });
  return true;
}
