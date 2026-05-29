/**
 * CalcAutoEntrepreneur.fr — Consentement RGPD
 * Charge les scripts tiers uniquement après consentement explicite (CNIL 17/09/2020)
 */
(function () {
  function loadTrackingScripts() {
    // Google AdSense
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      var ads = document.createElement('script');
      ads.async = true;
      ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2844746944687552';
      ads.crossOrigin = 'anonymous';
      document.head.appendChild(ads);
    }
    // Google Analytics 4
    if (!document.querySelector('script[src*="googletagmanager"]')) {
      var ga = document.createElement('script');
      ga.async = true;
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-4H7VPXJ6KS';
      document.head.appendChild(ga);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', 'G-4H7VPXJ6KS');
    }
    // Microsoft Clarity
    if (!window.clarity) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', 'wxp28322ek');
    }
  }

  // Charger immédiatement si déjà consenti
  if (localStorage.getItem('cookieConsent') === 'accepted') {
    loadTrackingScripts();
  }

  // Exposer pour le bandeau cookies
  window.loadTrackingScripts = loadTrackingScripts;
})();
