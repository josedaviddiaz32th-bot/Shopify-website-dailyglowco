# Proposed edits to conventions.md (awaiting owner approval)

## 1. Fix one stale line (intro paragraph)
`_ds_bundle.css` = the theme's `daily-glow.css`
→ `_ds_bundle.css` = the theme's `daily-glow.css` + star rating + landing-page (`wsp-*`) styles

## 2. Replace the example (it's the cap's copy, and "Clinically studied" breaks the patch copy rules)
- eyebrow: `Why it works` → `How it works`
- title: `Fuller hair in <em>8 weeks</em>` → `Smooth your wrinkles <em>while you sleep</em>`
- lede: `Clinically studied red light, ten minutes a day.` → `Soft silicone that holds your skin smooth overnight.`
- card: `Cordless` / `Wear it anywhere — no wires.` → `Reusable` / `Just clean and reuse, night after night.`

## 3. Add this section after the class table

## Landing-page pieces (`wsp-*`)
Use inside a `dg` section. Real markup matters: the offer card's selected state comes from a real `<input type="radio">`.

| Piece | Markup |
|---|---|
| Rating line | `wsp-rating` > `dg-stars` (five 24×24 star SVGs; add `class="off"` to unfilled ones) + `<span><strong>4.7</strong>/5 · 671 ratings</span>` |
| Hero title | `wsp-title` (h1, `<em>` = gradient text), `wsp-sub` for the line under it |
| Proof bullets | `wsp-proof` > `<li>` with a `dg-icon` + short text |
| Offer selector | `<fieldset className="wsp-offers"><legend>…</legend>` > one `<label className="wsp-offer">` per option: `<input type="radio" name="offer">`, optional `wsp-offer__flag` ("Most popular"), `wsp-offer__dot`, `wsp-offer__body` > `wsp-offer__title` (+ `wsp-offer__save` pill) and `wsp-offer__sub`, `wsp-offer__price` > `wsp-offer__now` + `wsp-offer__was` (struck through) |
| Buy button | `dg-btn dg-btn--primary wsp-atc` (full width), then `wsp-guarantee-line` (shield `dg-icon` + text) |
| Gallery | `wsp-media` > `<figure className="wsp-slide is-active">` (slides without `is-active` are hidden); empty frame = `wsp-ph` |
| Story block | `wsp-story__inner` (centered paragraphs), `wsp-story__kicker` (bigger closing line) |
| Area cards | `wsp-areas` > `wsp-area` > `wsp-area__img`, `wsp-area__body` > `wsp-area__title`, `wsp-area__text`, `wsp-area__row` (`wsp-area__price` + button); bundle hint `wsp-nudge` |
| Product cards | `wsp-products` > `<a className="wsp-product-card">` > `wsp-product-card__img`, `wsp-product-card__body` > `__tag`, `__title`, `__text`, `__row` (`__price` + `__link`) |
| 4-column compare | `wsp-compare` > `<table>`, same cells as `dg-compare` (`is-us`, `dg-yes`, `dg-no`) |
| Final CTA | `wsp-cta` (centered) with `dg__eyebrow`, `dg__title`, `dg__cta` |

Copy rules for the wrinkle patches: keep "visibly" / "smoother-looking" on every result claim; never "removes/erases wrinkles", "Botox alternative", "clinically proven" or "boosts collagen". Show only real ratings, and say where they come from.
