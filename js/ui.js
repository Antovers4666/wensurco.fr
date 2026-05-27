/**
 * CalcAutoEntrepreneur.fr — UI Utilities
 * Interactions communes à toutes les pages
 */

(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-theme');
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ---- Mobile hamburger ----
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // ---- Dark Mode Toggle ----
  const initializeThemeToggle = () => {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = document.body.classList.contains('dark-theme') ? ICONS.sun : ICONS.moon;
      btn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.querySelectorAll('.theme-toggle').forEach(b => {
          b.innerHTML = isDark ? ICONS.sun : ICONS.moon;
        });
        showToast(isDark ? 'Mode sombre activé ! 🌙' : 'Mode clair activé ! ☀️', 'info');
      });
    });
  };
  initializeThemeToggle();

  // ---- Radio options ----
  document.querySelectorAll('.radio-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const group = opt.closest('.radio-group');
      group.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    });
  });

  // ---- Checkbox form-check style ----
  document.querySelectorAll('.form-check').forEach(fc => {
    const cb = fc.querySelector('input[type="checkbox"]');
    if (cb) {
      fc.classList.toggle('checked', cb.checked);
      cb.addEventListener('change', () => fc.classList.toggle('checked', cb.checked));
    }
  });

  // ---- FAQ Accordion ----
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ---- Copy buttons ----
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.copy);
      const text = target ? target.textContent.trim() : btn.dataset.copyText || '';
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = `<span class="copy-feedback">${ICONS.check} Copié !</span>`;
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      });
    });
  });

  // ---- Reset buttons ----
  document.querySelectorAll('[data-reset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = document.querySelector(btn.dataset.reset);
      if (form) {
        form.reset();
        form.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
        const firstRadio = form.querySelector('.radio-option');
        if (firstRadio) { firstRadio.classList.add('selected'); firstRadio.querySelector('input').checked = true; }
        form.querySelectorAll('.form-check').forEach(fc => {
          const cb = fc.querySelector('input[type="checkbox"]');
          if (cb) fc.classList.toggle('checked', cb.checked);
        });
        // Hide result panel
        document.querySelectorAll('.result-panel').forEach(p => p.classList.remove('visible'));
        document.querySelectorAll('.result-placeholder').forEach(p => p.classList.remove('hidden'));
      }
    });
  });

  // ---- Number input: format on blur ----
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('wheel', e => e.preventDefault()); // disable scroll on number inputs
  });

  // ---- Share URL with params ----
  window.shareCurrentUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Lien copié dans le presse-papier !', 'success');
    });
  };

  // ---- Animate elements on scroll (tool-cards only — NEVER seo-content) ----
  const animatables = document.querySelectorAll('.tool-card, .testimonial-card');
  if (animatables.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.4s ease forwards';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    animatables.forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
      // Fallback : si l'Observer ne se déclenche pas dans 2s, afficher quand même
      setTimeout(() => {
        if (el.style.opacity === '0') {
          el.style.opacity = '1';
          el.style.animation = 'none';
        }
      }, 2000);
    });
  }

  // S'assurer que .seo-content est TOUJOURS visible (jamais caché)
  document.querySelectorAll('.seo-content').forEach(el => {
    el.style.opacity = '1';
    el.style.visibility = 'visible';
  });

});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;';
    document.body.appendChild(toastContainer);
  }

  const colors = { info: '#2563EB', success: '#10B981', warning: '#F59E0B', error: '#EF4444' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:white;border-left:4px solid ${colors[type]};border-radius:8px;padding:0.85rem 1.1rem;box-shadow:0 8px 32px rgba(0,0,0,0.15);font-size:0.875rem;font-weight:500;color:#1E293B;max-width:320px;animation:fadeInUp 0.3s ease;`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ============================================================
// PIE CHART SVG
// ============================================================

function drawPieChart(svgId, data) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;

  const size = 120;
  const r = 48;
  const cx = size / 2;
  const cy = size / 2;
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.innerHTML = '';

  let startAngle = -Math.PI / 2;
  data.forEach(slice => {
    const angle = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`);
    path.setAttribute('fill', slice.color);
    path.style.transition = 'opacity 0.2s';
    path.addEventListener('mouseenter', () => path.style.opacity = '0.8');
    path.addEventListener('mouseleave', () => path.style.opacity = '1');
    svg.appendChild(path);
    startAngle = endAngle;
  });

  // Center circle (donut)
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', cx); circle.setAttribute('cy', cy);
  circle.setAttribute('r', 26); circle.setAttribute('fill', 'white');
  svg.appendChild(circle);
}

// ============================================================
// PROGRESS BAR ANIMÉE
// ============================================================

function animateProgressBar(barId, targetPct) {
  const bar = document.getElementById(barId);
  if (!bar) return;

  bar.style.width = '0%';
  bar.className = 'progress-bar';

  if (targetPct >= 100) {
    bar.classList.add('danger');
  } else if (targetPct >= 80) {
    bar.classList.add('warn');
  }

  setTimeout(() => { bar.style.width = Math.min(targetPct, 100) + '%'; }, 50);
}

// ============================================================
// URL PARAMS (share results)
// ============================================================

function getUrlParams() {
  const params = {};
  new URLSearchParams(window.location.search).forEach((v, k) => { params[k] = v; });
  return params;
}

function updateUrlParams(params) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  window.history.replaceState({}, '', url.toString());
}

// ============================================================
// ICONS (Lucide-style SVG inline)
// ============================================================

const ICONS = {
  calc: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/></svg>`,
  chart: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  check: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  info: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  warning: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  copy: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  refresh: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.11"/></svg>`,
  share: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  arrow: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  chevron: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`,
  car: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  calendar: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  euro: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 14H5m0-4h10M5 6a9 9 0 1 1 0 12"/></svg>`,
  gauge: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 2A10 10 0 0 0 4.62 18.75"/><line x1="12" y1="12" x2="16" y2="8"/><circle cx="12" cy="12" r="2"/></svg>`,
  home: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  star: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  sun: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></svg>`,
  moon: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></svg>`,
};

// ============================================================
// BAR CHART SVG
// ============================================================

function drawBarChart(svgId, data) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 400;
  const barHeight = 35;
  const gap = 15;
  const height = data.length * (barHeight + gap) + gap;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = '';

  data.forEach((d, i) => {
    const y = gap + i * (barHeight + gap);
    const barWidth = (d.value / maxValue) * (width - 150);

    // Label
    const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textLabel.setAttribute('x', '10');
    textLabel.setAttribute('y', y + barHeight / 2 + 5);
    textLabel.setAttribute('fill', 'var(--text)');
    textLabel.style.cssText = 'font-size: 13px; font-weight: 600; font-family: var(--font-main);';
    textLabel.textContent = d.label;
    svg.appendChild(textLabel);

    // Bar background
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', '110');
    bgRect.setAttribute('y', y);
    bgRect.setAttribute('width', width - 200);
    bgRect.setAttribute('height', barHeight);
    bgRect.setAttribute('rx', '6');
    bgRect.setAttribute('fill', 'var(--border)');
    svg.appendChild(bgRect);

    // Bar foreground
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '110');
    rect.setAttribute('y', y);
    rect.setAttribute('width', '0');
    rect.setAttribute('height', barHeight);
    rect.setAttribute('rx', '6');
    rect.setAttribute('fill', d.color);
    rect.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    svg.appendChild(rect);

    // Animate width
    setTimeout(() => { rect.setAttribute('width', barWidth); }, 50);

    // Value Label
    const textVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textVal.setAttribute('x', 110 + barWidth + 10);
    textVal.setAttribute('y', y + barHeight / 2 + 5);
    textVal.setAttribute('fill', 'var(--text)');
    textVal.style.cssText = 'font-size: 13px; font-weight: 700; font-family: var(--font-heading);';
    textVal.textContent = CAE.formatEuro(d.value);
    textVal.style.opacity = '0';
    textVal.style.transition = 'opacity 0.3s ease';
    svg.appendChild(textVal);
    
    setTimeout(() => {
      const textX = 110 + barWidth + 10;
      textVal.setAttribute('x', Math.min(textX, width - 80));
      textVal.style.opacity = '1';
    }, 850);
  });
}

window.ICONS = ICONS;
window.drawPieChart = drawPieChart;
window.drawBarChart = drawBarChart;
window.animateProgressBar = animateProgressBar;
window.showToast = showToast;
window.getUrlParams = getUrlParams;
window.updateUrlParams = updateUrlParams;
