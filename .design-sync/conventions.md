# The Daily Glow Co. — brand conventions

This is a **tokens + CSS-class** design system (from a Shopify theme). There are **no React components** in `window` — build with plain JSX/HTML and the `dg` classes below. Everything is styled by `styles.css` (Poppins from Google Fonts, `tokens/dg-tokens.css`, `_ds_bundle.css` = the theme's `daily-glow.css` + star rating + landing-page (`wsp-*`) styles). Read those two CSS files before styling; they are the source of truth.

## Setup
Wrap every section in `<section className="dg">` — `.dg` sets `box-sizing`, background and text color, and scopes the `--dg-bg/--dg-fg/--dg-card/--dg-line/--dg-muted` surface variables. Without it, cards, buttons and titles lose their colors. Surface variants: add `dg--mist` (soft green-grey background, white cards) or `dg--teal` (dark teal background, light text, gold accents). Inside, use `.dg__wrap` (1200px max, 88px vertical padding; override with `style={{'--dg-pt':'48px','--dg-pb':'48px'}}`).

## Tokens (use `var(--…)`, never raw hex)
- Brand: `--dg-teal` #17393d (primary ink/dark surface), `--dg-teal-900`, `--dg-orange` #f08a2c, `--dg-orange-deep` (hover), `--dg-gold` #ffc24a, `--dg-mist` #eef3f1, `--dg-white`, `--dg-glow-red` (sale accent only)
- Text/lines: `--dg-ink`, `--dg-ink-muted`, `--dg-line-c`; inside `.dg`: `--dg-fg`, `--dg-muted`, `--dg-line`, `--dg-card`, `--dg-bg`
- Effects: `--dg-grad` (orange→gold, 90deg — the signature gradient), `--dg-shadow-cta`, `--dg-shadow-media`; ratings `--dg-star`, `--dg-star-off`
- Type: `--font-heading-family`, `--font-body-family` (both Poppins). Headings 700, letter-spacing -0.015em; body 400–500; labels 600 uppercase with wide tracking.
- Shape: pill buttons (999px), cards 22px radius, large panels 24–28px.

## Class vocabulary
| Family | Classes |
|---|---|
| Section head | `dg__head` (centered, 720px) `dg__head--left`, `dg__eyebrow` (orange caps label with gradient dash), `dg__title` (wrap a word in `<em>` for gradient text), `dg__lede`, `dg__note` |
| Buttons | `dg-btn` + `dg-btn--primary` (gradient pill, teal text) or `dg-btn--ghost` (outlined); group in `dg__cta` |
| Cards grid | `dg-grid` (cols via `--dg-cols`, default 3) → `dg-card` > `dg-card__icon`, `dg-card__title`, `dg-card__text` |
| Steps | `dg-steps` → `dg-step` > `dg-step__num`, `dg-step__label` |
| Compare table | `dg-compare` > `<table>`; highlight our column with `is-us`; cells `dg-yes` / `dg-no` |
| Guarantee | `dg-guarantee` > `dg-guarantee__seal` (`<strong>30</strong><span>Day</span>`), `dg-guarantee__cta`; trust list `dg-badges` |
| FAQ | `dg-faq` > `<details><summary>…</summary><div className="dg-faq__a">…</div></details>` |
| Ticker | `dg-ticker` > `dg-ticker__track` > two identical `dg-ticker__group` > `dg-ticker__item` |
| Icons | `dg-icon` on an inline 24×24 stroke SVG (`stroke="currentColor"`, no fill) — the theme's set: check, x, arrow, shield, truck, heart, leaf, spark, clock, lock, battery, power, cap, light |

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

Don't invent new `dg-*` or `wsp-*` names; for layout glue use inline styles with the tokens above.

## Example
```jsx
<section className="dg dg--mist">
  <div className="dg__wrap">
    <div className="dg__head">
      <p className="dg__eyebrow">How it works</p>
      <h2 className="dg__title">Smooth your wrinkles <em>while you sleep</em></h2>
      <p className="dg__lede">Soft silicone that holds your skin smooth overnight.</p>
    </div>
    <div className="dg-grid">
      <div className="dg-card">
        <div className="dg-card__icon"><svg className="dg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7"/></svg></div>
        <h3 className="dg-card__title">Reusable</h3>
        <p className="dg-card__text">Just clean and reuse, night after night.</p>
      </div>
    </div>
    <div className="dg__cta"><a className="dg-btn dg-btn--primary" href="#">Shop now</a></div>
  </div>
</section>
```
