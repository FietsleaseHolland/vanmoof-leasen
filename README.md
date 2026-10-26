# VanMoof leasen – formulier voor dealers

Embedbaar leaseformulier van Fietslease Holland. VanMoof-dealers plaatsen het als iframe op hun eigen site; de bezoeker stelt een VanMoof S6 / S6 Open samen, ziet direct de maandprijs en vraagt de lease aan bij Fietslease Holland.

- `index.html` – het formulier (configurator + gegevens + bevestiging)
- `demo.html` – voorbeeld van een dealersite met het formulier als iframe
- `img/` – productfoto's per model / kleur / bagagedrager (`<model>-<kleur>-<bagagedrager>.jpg`)
- `api/aanvraag.js` – zet aanvragen door naar de webhook in `WEBHOOK_URL`
- `vercel.json` – headers (cache voor foto's, iframe toegestaan) en doorverwijzing van het oude Tally-adres

## Instellen

- **Aanvragen versturen:** het formulier post naar `/api/aanvraag` (`api/aanvraag.js`), die de aanvraag doorzet naar de webhook (Make/Zapier/n8n). Stel in Vercel onder Settings → Environment Variables `WEBHOOK_URL` in en deploy opnieuw. Zo staat het webhook-adres niet in de pagina. Op localhost draait het formulier in demo-modus (aanvraag alleen in de console).
- **Spam:** een onzichtbaar veld (`website`) vangt bots af; zulke aanvragen worden niet doorgestuurd.
- **Prijzen:** de tabel `CARRIERS` in `index.html` (maandprijs per bagagedrager en looptijd).
- **Dealer:** via de link, `?dealerid=FLHDE0393`. Gaat mee in elke aanvraag.

## Embedcode voor dealers

```html
<iframe id="flh-vanmoof" src="https://JOUW-DOMEIN/?dealerid=DEALERID"
        style="width:100%;border:0;min-height:900px;display:block" title="VanMoof leasen via Fietslease Holland" loading="lazy"></iframe>
<script>
  (function () {
    var f = document.getElementById("flh-vanmoof"), queued = false;
    function viewport() {
      queued = false;
      var r = f.getBoundingClientRect();
      f.contentWindow && f.contentWindow.postMessage({ type: "flh-viewport", top: r.top, vh: window.innerHeight }, "*");
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(viewport); } }
    window.addEventListener("message", function (e) {
      if (e.source !== f.contentWindow || !e.data) return;
      if (e.data.type === "flh-height") { f.style.minHeight = "0"; f.style.height = e.data.height + "px"; queue(); }
      if (e.data.type === "flh-scroll-top") f.scrollIntoView({ behavior: "smooth" });
    });
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    f.addEventListener("load", queue);
  })();
</script>
```

Het script zorgt dat het iframe meegroeit met het formulier en dat op mobiel de balk met prijs en mini-foto onderin beeld blijft.

## Lokaal bekijken

```bash
python3 -m http.server 8765
```

en open http://localhost:8765 (of `/demo`).
