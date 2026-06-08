# ─────────────────────────────────────────────
# 1. KARPATHY PRINCIPLES
# Prévient les 3 erreurs classiques des agents IA
# (suppositions silencieuses, sur-engineering, modifications parasites)
# ─────────────────────────────────────────────
git clone https://github.com/multica-ai/andrej-karpathy-skills /tmp/karpathy
cp -r /tmp/karpathy/skills/karpathy-principles .claude/skills/
rm -rf /tmp/karpathy

# ─────────────────────────────────────────────
# 2. FRONTEND DESIGN (Anthropic officiel)
# UI production-grade, évite les patterns IA génériques
# (Inter font, gradient violet, card layout...)
# ─────────────────────────────────────────────
npx skills add anthropic/frontend-design
# Si la commande échoue, alternative manuelle :
# → Télécharger sur skillsmp.com/skills/frontend-design
# → Copier le dossier dans .claude/skills/frontend-design/

# ─────────────────────────────────────────────
# 3. SECURITY SCANNER (Trail of Bits)
# Détection de vulnérabilités, secrets exposés, audit de sécurité
# ─────────────────────────────────────────────
git clone https://github.com/trailofbits/claude-code-skills /tmp/tob
cp -r /tmp/tob/skills/security-audit .claude/skills/security-scanner
rm -rf /tmp/tob
# Si le repo a changé de nom, chercher "Trail of Bits claude-code-skills" sur GitHub

# ─────────────────────────────────────────────
# 4. WEB QUALITY AUDIT — Addy Osmani (Google Chrome team)
# Remplace tes skills custom : core-web-vitals-netlify + accessibility-wcag21
# 5 skills en un seul repo, maintenus par un ingénieur Google
# ─────────────────────────────────────────────
git clone https://github.com/addyosmani/web-quality-audit /tmp/wqa
cp -r /tmp/wqa/skills/core-web-vitals  .claude/skills/
cp -r /tmp/wqa/skills/accessibility    .claude/skills/
cp -r /tmp/wqa/skills/performance      .claude/skills/
cp -r /tmp/wqa/skills/seo-technical    .claude/skills/
cp -r /tmp/wqa/skills/best-practices   .claude/skills/
rm -rf /tmp/wqa

# ─────────────────────────────────────────────
# 5. CLAUDE SEO (AgriciDaniel)
# Remplace tes skills custom : seo-technique-fr + seo-editorial-fr
# 25 sub-skills : SEO technique, E-E-A-T, schema, GEO, backlinks,
# sémantique, international SEO, reporting PDF/Excel
# ─────────────────────────────────────────────
git clone https://github.com/AgriciDaniel/claude-seo /tmp/claudeseo
cp -r /tmp/claudeseo/skills/. .claude/skills/claude-seo/
rm -rf /tmp/claudeseo

# ─────────────────────────────────────────────
# 6. SEO SURVIVAL KIT (maxschottke-spec)
# Récupération Core Update, analyse concurrentielle,
# tracking PSI hebdomadaire avec alertes de régression
# ─────────────────────────────────────────────
git clone https://github.com/maxschottke-spec/seo-survival-kit /tmp/seokit
cp -r /tmp/seokit/skills/. .claude/skills/seo-survival-kit/
rm -rf /tmp/seokit

# ─────────────────────────────────────────────
# 7. MARKETING SKILLS (coreyhaines31)
# Remplace ton skill custom : cro-ux + partie de competitor-analysis-ae
# CRO, copywriting, analytics GA4, stratégie contenu, analyse concurrents
# ─────────────────────────────────────────────
git clone https://github.com/coreyhaines31/marketingskills /tmp/mkt
cp -r /tmp/mkt/skills/cro                .claude/skills/
cp -r /tmp/mkt/skills/analytics          .claude/skills/marketing-analytics
cp -r /tmp/mkt/skills/competitor-research .claude/skills/
cp -r /tmp/mkt/skills/content-strategy   .claude/skills/
rm -rf /tmp/mkt

# ─────────────────────────────────────────────
# VÉRIFICATION FINALE
# ─────────────────────────────────────────────
echo "Skills communautaires installés :"
ls .claude/skills/