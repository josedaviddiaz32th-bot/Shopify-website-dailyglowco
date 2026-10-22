# Lessons (to copy into Drive doc 03)

2026-10-21 (wrinkle patch landing page build):
- Shopify's GitHub sync SILENTLY drops invalid JSON templates and section files — the theme just misses them (homepage 404'd). Always validate before pushing: select values must match schema options exactly (dg-* use "light", wsp-* use "white"); text-type settings need strings ("30" not 30); url-type settings reject "#anchor"-only values; richtext values — including BLOCK-level richtext like dg-steps step text — must be <p>-wrapped; Liquid filters are not allowed inside tag arguments (e.g. form id).
- Fastest debug path for a rejected file: themeFilesUpsert via Admin GraphQL on the unpublished theme — it returns the exact validation error, one at a time.
- Missing product templateSuffix in a theme → storefront falls back to the default product template (not always 404). Missing index.json → homepage 404.
- Navigation menus and pages are STORE-level, not theme files: menu/page changes go live immediately, on every theme, regardless of branch.
- Shopify commits API/theme-editor changes back to the connected branch ("Update from Shopify" commits) — always pull/rebase before pushing.
- wsp-hero's bundle offer card + areas nudge are dormant until a variant whose title contains "Set" exists; featured offer resolves in block order so the bundle auto-wins once created.
