// Ontvangt een leaseaanvraag van het formulier en zet hem door naar de webhook (Make/Zapier/n8n).
// De webhook-URL staat als omgevingsvariabele WEBHOOK_URL in Vercel, zodat hij niet in de pagina staat.

const REQUIRED = ["Model", "Voorletters", "Achternaam", "E-mailadres", "Telefoonnummer", "Postcode", "Huisnummer", "Plaats"];
const MAX_BYTES = 20000;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ ok: false, error: "invalid_json" }); }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: "invalid_body" });
  }
  if (JSON.stringify(body).length > MAX_BYTES) {
    return res.status(413).json({ ok: false, error: "too_large" });
  }

  // Honeypot: een verborgen veld dat alleen bots invullen. Doen alsof het gelukt is, maar niets doorsturen.
  if (body.website) return res.status(200).json({ ok: true });
  delete body.website;

  const missing = REQUIRED.filter(k => !String(body[k] ?? "").trim());
  if (missing.length) return res.status(400).json({ ok: false, error: "missing_fields", fields: missing });

  const webhook = process.env.WEBHOOK_URL;
  if (!webhook) {
    console.error("WEBHOOK_URL is niet ingesteld");
    return res.status(500).json({ ok: false, error: "not_configured" });
  }

  try {
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) {
      console.error("Webhook antwoordde met", r.status);
      return res.status(502).json({ ok: false, error: "webhook_failed" });
    }
  } catch (e) {
    console.error("Webhook niet bereikbaar:", e.message);
    return res.status(502).json({ ok: false, error: "webhook_unreachable" });
  }

  return res.status(200).json({ ok: true });
};
