/*
 * Fietslease Holland – VanMoof leaseformulier insluiten
 *
 * Gebruik op de site van de dealer:
 *   <div data-flh-vanmoof data-dealer="DEALERID"></div>
 *   <script src="https://vanmoof-leasen.vercel.app/embed.js" async></script>
 *
 * Het script maakt van elk element met data-flh-vanmoof een iframe met het formulier,
 * laat het iframe meegroeien met de inhoud (geen dubbele scrollbalk) en geeft door waar
 * het iframe op het scherm staat, zodat de prijsbalk op mobiel onderin beeld blijft.
 * Optioneel: data-accent="7a1f1f" (accentkleur, hex zonder #) en data-offset="80"
 * (hoogte van een vaste menubalk bovenin, voor het terugscrollen naar het formulier).
 */
(function () {
  "use strict";
  var script = document.currentScript;
  var BASE = script && script.src ? new URL(script.src).origin : "https://vanmoof-leasen.vercel.app";
  var frames = [];
  var queued = false;

  function sendViewport() {
    queued = false;
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (!f.contentWindow) continue;
      var r = f.getBoundingClientRect();
      f.contentWindow.postMessage({ type: "flh-viewport", top: r.top, vh: window.innerHeight }, BASE);
    }
  }
  function queue() {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(sendViewport);
  }

  function mount(el) {
    if (el.getAttribute("data-flh-mounted")) return;
    el.setAttribute("data-flh-mounted", "1");

    var params = new URLSearchParams();
    if (el.getAttribute("data-dealer")) params.set("dealerid", el.getAttribute("data-dealer"));
    if (el.getAttribute("data-accent")) params.set("accent", el.getAttribute("data-accent"));

    var f = document.createElement("iframe");
    f.src = BASE + "/" + (params.toString() ? "?" + params.toString() : "");
    f.title = "VanMoof leasen via Fietslease Holland";
    f.loading = "lazy";
    f.setAttribute("allow", "clipboard-write");
    // Tot de eerste hoogtemelding binnen is: ruime hoogte; het formulier scrollt dan zelf
    f.style.cssText = "display:block;width:100%;max-width:100%;min-width:0;border:0;margin:0;padding:0;height:900px;background:transparent;color-scheme:light";
    f.addEventListener("load", queue);
    el.style.width = el.style.width || "100%";
    el.appendChild(f);
    frames.push(f);
    f._flhOffset = parseInt(el.getAttribute("data-offset") || "0", 10) || 0;
  }

  function mountAll() {
    var els = document.querySelectorAll("[data-flh-vanmoof]");
    for (var i = 0; i < els.length; i++) mount(els[i]);
    queue();
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== BASE || !e.data) return;
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (e.source !== f.contentWindow) continue;
      if (e.data.type === "flh-height" && e.data.height > 0) {
        f.style.height = Math.ceil(e.data.height) + "px";
        queue();
      }
      if (e.data.type === "flh-scroll-top") {
        // Alleen terugscrollen als de bovenkant van het formulier buiten beeld is
        var top = f.getBoundingClientRect().top;
        if (top < f._flhOffset || top > window.innerHeight) {
          window.scrollTo({ top: top + window.pageYOffset - f._flhOffset - 16, behavior: "smooth" });
        }
      }
    }
  });
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  window.addEventListener("orientationchange", queue);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll);
  else mountAll();
  // Voor sites die de container later toevoegen (bijv. paginabouwers)
  if (window.MutationObserver) {
    new MutationObserver(function () { mountAll(); }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
