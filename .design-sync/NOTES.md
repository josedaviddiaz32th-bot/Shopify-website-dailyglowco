# design-sync notes

- This repo is a Shopify Liquid theme, not a React DS. The sync is **brand/tokens-only** (user's choice, 2026-10-21): no components, empty `window.DailyGlow` bundle stub.
- Off-script layout: the bundled converter (`package-build.mjs`) is NOT used. Build with `sh .design-sync/build-brand.sh` → `ds-bundle/`. Upload only: `styles.css`, `tokens/dg-tokens.css`, `_ds_bundle.css`, `_ds_bundle.js`, `README.md`, `_ds_needs_recompile` (sentinel first and last).
- `_ds_bundle.css` = `assets/daily-glow.css` (reusable `.dg*` section classes) + the `.dg-stars` rules grepped from `assets/dg-theme.css` + `assets/wsp.css` (wrinkle-patch landing page, `.wsp-*`), concatenated by `build-brand.sh` (since 2026-10-24). The build fails loudly if the star rules disappear from dg-theme.css. Otherwise `dg-theme.css` is Shopify-specific (header/buy box/cart); only its `:root` tokens are used, copied by hand into `.design-sync/tokens.css`.
- Render check done 2026-10-24 by serving `ds-bundle/` locally (`python3 -m http.server`) with a throwaway dot-prefixed test page: stars, offer cards (checked state + flag), ATC button, product card and CTA all styled from `styles.css` alone. Delete the test page before uploading.
- Fonts: Poppins (theme settings poppins_n4 / poppins_n6) loaded from Google Fonts via `@import` in `styles.css`; `--font-body-family` / `--font-heading-family` are defined in tokens.css because Shopify normally injects them.
- No `_ds_sync.json` anchor is uploaded (off-script, no components) - every re-sync is a full re-upload of the six files, which is cheap.
- Node.js is not installed on this machine; `package-validate.mjs` couldn't run. Checks were done by hand (bundle syntax via osascript JS, header fields, @import targets). No visual render check was done.

## Re-sync risks
- `.design-sync/tokens.css` is a hand copy of the `:root` block in `assets/dg-theme.css` - re-copy it if theme colors change.
- If the theme fonts change in `config/settings_data.json`, update the Google Fonts `@import` in `build-brand.sh` and the font vars in tokens.css.
- `conventions.md` names `dg-*` (and, once approved, `wsp-*`) classes; re-check them against the built `_ds_bundle.css` after CSS edits.
- `wsp.css` carries Shopify-only behavior that is harmless but odd in designs: the mobile slide height reads `--wsp-slide-h` (set by `wsp.js`, absent in Claude Design, so the svh fallback applies) and `.wsp-title` has a 32px bottom margin on phones for the fold. `.wsp-slide` is `display:none` unless it also has `is-active`.
