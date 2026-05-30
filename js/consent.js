/**
 * CalcAutoEntrepreneur.fr — Consentement RGPD (Google Consent Mode v2)
 *
 * Modèle "annonces pour tous" conforme :
 *  - AdSense est chargé dans le <head> pour TOUS les visiteurs.
 *  - Par défaut (Consent Mode défini dans le <head>), le consentement publicitaire
 *    est "denied" => Google sert des annonces NON PERSONNALISÉES (sans cookie).
 *  - À l'acceptation, on passe le consentement à "granted" => annonces personnalisées
 *    + chargement de Google Analytics et Microsoft Clarity.
 *  - Au refus, on reste en non personnalisé (pas d'Analytics/Clarity).
 *
 * gtag() et dataLayer sont déjà définis dans le <head> (bloc Consent Mode).
 */
(function () {
  function loadAnalytics() {
    // Google Analytics 4
    if (!document.querySelector('script[src*="googletagmanager"]')) {
      var ga = document.createElement('script');
      ga.async = true;
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-4H7VPXJ6KS';
      document.head.appendChild(ga);
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

  // Acceptation : on accorde le consentement (pubs personnalisées + analytics)
  function grantConsent() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });
    }
    loadAnalytics();
  }

  // Si déjà consenti lors d'une visite précédente
  if (localStorage.getItem('cookieConsent') === 'accepted') {
    grantConsent();
  }

  // Le bandeau cookies appelle ceci au clic sur "Accepter"
  window.loadTrackingScripts = grantConsent;
})();
