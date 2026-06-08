#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== 1. Karpathy Principles ==="
git clone https://github.com/multica-ai/andrej-karpathy-skills /tmp/karpathy 2>&1 \
  && cp -r /tmp/karpathy/skills/karpathy-principles .claude/skills/ \
  && rm -rf /tmp/karpathy \
  && echo "OK" || echo "ECHEC — repo introuvable"

echo "=== 2. Frontend Design (Anthropic) ==="
npx --yes skills add anthropic/frontend-design 2>&1 || echo "ECHEC — npx skills non disponible"

echo "=== 3. Security Scanner (Trail of Bits) ==="
git clone https://github.com/trailofbits/claude-code-skills /tmp/tob 2>&1 \
  && cp -r /tmp/tob/skills/security-audit .claude/skills/security-scanner \
  && rm -rf /tmp/tob \
  && echo "OK" || echo "ECHEC — repo introuvable"

echo "=== 4. Web Quality Audit (Addy Osmani) ==="
git clone https://github.com/addyosmani/web-quality-audit /tmp/wqa 2>&1 \
  && cp -r /tmp/wqa/skills/core-web-vitals  .claude/skills/ \
  && cp -r /tmp/wqa/skills/accessibility    .claude/skills/ \
  && cp -r /tmp/wqa/skills/performance      .claude/skills/ \
  && cp -r /tmp/wqa/skills/seo-technical    .claude/skills/ \
  && cp -r /tmp/wqa/skills/best-practices   .claude/skills/ \
  && rm -rf /tmp/wqa \
  && echo "OK" || echo "ECHEC — repo introuvable"

echo "=== 5. Claude SEO (AgriciDaniel) ==="
git clone https://github.com/AgriciDaniel/claude-seo /tmp/claudeseo 2>&1 \
  && cp -r /tmp/claudeseo/skills/. .claude/skills/claude-seo/ \
  && rm -rf /tmp/claudeseo \
  && echo "OK" || echo "ECHEC — repo introuvable"

echo "=== 6. SEO Survival Kit (maxschottke-spec) ==="
git clone https://github.com/maxschottke-spec/seo-survival-kit /tmp/seokit 2>&1 \
  && cp -r /tmp/seokit/skills/. .claude/skills/seo-survival-kit/ \
  && rm -rf /tmp/seokit \
  && echo "OK" || echo "ECHEC — repo introuvable"

echo "=== 7. Marketing Skills (coreyhaines31) ==="
git clone https://github.com/coreyhaines31/marketingskills /tmp/mkt 2>&1 \
  && cp -r /tmp/mkt/skills/cro                .claude/skills/ \
  && cp -r /tmp/mkt/skills/analytics          .claude/skills/marketing-analytics \
  && cp -r /tmp/mkt/skills/competitor-research .claude/skills/ \
  && cp -r /tmp/mkt/skills/content-strategy   .claude/skills/ \
  && rm -rf /tmp/mkt \
  && echo "OK" || echo "ECHEC — repo introuvable"

echo ""
echo "=== Skills installés ==="
ls .claude/skills/
