#!/bin/sh
# Builds the tokens-only Claude Design bundle into ./ds-bundle (off-script layout;
# this repo is a Liquid theme, so there are no React components to convert).
set -e
cd "$(dirname "$0")/.."
OUT=ds-bundle
rm -rf "$OUT" && mkdir -p "$OUT/tokens"

cp .design-sync/tokens.css "$OUT/tokens/dg-tokens.css"
# Component CSS: the shared dg-* sections, the star rules (they live in the
# Shopify-specific dg-theme.css, which isn't synced), then the wsp-* landing page.
{
  cat assets/daily-glow.css
  printf '\n/* ---------- Stars (from assets/dg-theme.css) ---------- */\n'
  grep -E '^\.dg-stars' assets/dg-theme.css
  printf '\n/* ---------- Landing page (assets/wsp.css) ---------- */\n'
  cat assets/wsp.css
} > "$OUT/_ds_bundle.css"
grep -q '^\.dg-stars svg' "$OUT/_ds_bundle.css" || { echo "star rules missing from dg-theme.css" >&2; exit 1; }
cp .design-sync/conventions.md "$OUT/README.md"

cat > "$OUT/styles.css" <<'EOF'
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap");
@import "./tokens/dg-tokens.css";
@import "./_ds_bundle.css";
EOF

printf '/* @ds-bundle: {"namespace":"DailyGlow","components":[],"sourceHashes":{},"inlinedExternals":[],"builtBy":"cc-design-sync"} */\nwindow.DailyGlow = window.DailyGlow || {};\n' > "$OUT/_ds_bundle.js"
printf '{"by":"design-sync-cli"}' > "$OUT/_ds_needs_recompile"
echo "built $OUT"
