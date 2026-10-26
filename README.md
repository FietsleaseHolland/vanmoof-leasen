# VanMoof leasen – formulier voor dealers

Embedbaar leaseformulier van Fietslease Holland. VanMoof-dealers plaatsen het als iframe op hun eigen site; de bezoeker stelt een VanMoof S6 / S6 Open samen, ziet direct de maandprijs en vraagt de lease aan bij Fietslease Holland.

- `index.html` – het formulier (configurator + gegevens + bevestiging)
- `embed.js` – script dat dealers plaatsen; maakt het iframe en regelt hoogte en mobiele balk
- `demo.html`, `demo-zonder-script.html` – voorbeelden van een dealersite met het formulier
- `img/` – productfoto's per model / kleur / bagagedrager (`<model>-<kleur>-<bagagedrager>.jpg`)
- `api/aanvraag.js` – zet aanvragen door naar de webhook in `WEBHOOK_URL`
- `vercel.json` – headers (cache voor foto's, iframe toegestaan) en doorverwijzing van het oude Tally-adres

## Instellen

- **Aanvragen versturen:** het formulier post naar `/api/aanvraag` (`api/aanvraag.js`), die de aanvraag doorzet naar de webhook (Make/Zapier/n8n). Stel in Vercel onder Settings → Environment Variables `WEBHOOK_URL` in en deploy opnieuw. Zo staat het webhook-adres niet in de pagina. Op localhost draait het formulier in demo-modus (aanvraag alleen in de console).
- **Spam:** een onzichtbaar veld (`website`) vangt bots af; zulke aanvragen worden niet doorgestuurd.
- **Prijzen:** de tabel `CARRIERS` in `index.html` (maandprijs per bagagedrager en looptijd).
- **Dealer:** via de link, `?dealerid=FLHDE0393`. Gaat mee in elke aanvraag.

## Embedcode voor dealers

Plaats op de pagina van de dealer (vervang `DEALERID`):

```html
<div data-flh-vanmoof data-dealer="DEALERID"></div>
<script src="https://vanmoof-leasen.vercel.app/embed.js" async></script>
```

`embed.js` maakt er een iframe van dat altijd de volle breedte van de plek neemt, meegroeit met het formulier (geen dubbele scrollbalk) en op mobiel de balk met prijs en mini-foto onderin beeld houdt. Optioneel:

- `data-offset="80"` – hoogte in px van een vaste menubalk bovenin de dealersite, zodat het terugscrollen naar het formulier daar niet onder valt
- `data-accent="7a1f1f"` – andere accentkleur (hex zonder #)

Omdat het script centraal staat, krijgen alle dealers verbeteringen vanzelf mee.

**Zonder script** (websitebouwers die geen scripts toestaan): alleen een iframe; het formulier scrollt dan binnen een vaste hoogte.

```html
<iframe src="https://vanmoof-leasen.vercel.app/?dealerid=DEALERID" title="VanMoof leasen via Fietslease Holland" loading="lazy"
        style="display:block;width:100%;height:min(900px,90vh);border:0"></iframe>
```

Voorbeelden: `/demo` (met script) en `/demo-zonder-script`.

## Lokaal bekijken

```bash
python3 -m http.server 8765
```

en open http://localhost:8765 (of `/demo`).
