/* The Daily Glow Co. — shared behaviour for the redesign (buy box, holiday effects, countdown). */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatMoney(cents, format) {
    format = format || '${{amount}}';
    var value = (cents / 100).toFixed(2);
    var withDelims = function (num, thousands, decimal) {
      var parts = num.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return parts.join(decimal);
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, key) {
      switch (key) {
        case 'amount_no_decimals': return withDelims(Math.round(cents / 100).toString(), ',', '.');
        case 'amount_with_comma_separator': return withDelims(value, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return withDelims(Math.round(cents / 100).toString(), '.', ',');
        default: return withDelims(value, ',', '.');
      }
    });
  }

  /* ---------- Buy box ---------- */
  if (!customElements.get('dg-product')) {
    customElements.define('dg-product', class extends HTMLElement {
      connectedCallback() {
        if (this._ready) return;
        this._ready = true;
        try { this.variants = JSON.parse(this.querySelector('[data-variants]').textContent); } catch (e) { this.variants = []; }
        this.pct = parseInt(this.dataset.pct, 10) || 0;
        this.showCompare = this.dataset.compare === 'true';
        this.format = this.dataset.moneyFormat;
        this.qty = 1;
        var input = this.querySelector('.dgp-form [name="id"]');
        var cur = this.variants.find(function (v) { return String(v.id) === (input && input.value); }) || this.variants[0] || {};
        this.color = cur.color;
        this.plug = cur.plug;

        this.addEventListener('click', this.onClick.bind(this));
        this.querySelectorAll('.dgp-sets input').forEach(function (r) {
          r.addEventListener('change', function () { this.qty = parseInt(r.value, 10); this.update(); }.bind(this));
        }.bind(this));

        this.setupSticky();
        this.update(true);
      }

      onClick(e) {
        var c = e.target.closest('[data-pick-color]');
        if (c) { this.color = c.dataset.pickColor; this.update(); return; }
        var p = e.target.closest('[data-pick-plug]');
        if (p) { this.plug = p.dataset.pickPlug; this.update(); return; }
        var t = e.target.closest('[data-thumb]');
        if (t) {
          var g = t.closest('.dgp-gallery');
          g.querySelectorAll('[data-thumb]').forEach(function (b) { b.classList.toggle('is-active', b === t); });
          g.querySelectorAll('[data-slide]').forEach(function (s) { s.classList.toggle('is-active', s.dataset.slide === t.dataset.thumb); });
          return;
        }
        if (e.target.closest('[data-sticky-atc]')) {
          var btn = this.querySelector('.dgp-atc');
          if (btn && !btn.disabled) btn.click();
        }
      }

      variant() {
        var color = this.color, plug = this.plug;
        return this.variants.find(function (v) { return v.color === color && (!plug || v.plug === plug); })
          || this.variants.find(function (v) { return v.color === color; })
          || this.variants[0];
      }

      totals(v) {
        var q = this.qty;
        var price = q === 2 ? Math.floor(v.price * 2 * (100 - this.pct) / 100) : v.price;
        return { price: price, compare: v.compare * q };
      }

      update(initial) {
        var v = this.variant();
        if (!v) return;
        var self = this, fmt = function (c) { return formatMoney(c, self.format); };
        var t = this.totals(v);
        var duo = Math.floor(v.price * 2 * (100 - this.pct) / 100);

        this.querySelectorAll('[data-pick-color]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.pickColor === v.color); });
        this.querySelectorAll('[data-pick-plug]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.pickPlug === v.plug); });
        this.querySelectorAll('[data-color-name]').forEach(function (el) { el.textContent = v.color; });
        this.querySelectorAll('[data-plug-name]').forEach(function (el) { el.textContent = v.plug; });
        this.querySelectorAll('.dgp-gallery').forEach(function (g) { g.hidden = g.dataset.color !== v.color; });

        this.querySelectorAll('[name="id"]').forEach(function (i) { i.value = v.id; i.disabled = !v.available; });
        this.querySelectorAll('[data-qty]').forEach(function (i) { i.value = self.qty; });

        this.querySelectorAll('[data-price-single]').forEach(function (el) { el.textContent = fmt(v.price); });
        this.querySelectorAll('[data-price-duo]').forEach(function (el) { el.textContent = fmt(duo); });
        this.querySelectorAll('[data-price-each]').forEach(function (el) { el.textContent = fmt(Math.floor(duo / 2)); });
        this.querySelectorAll('[data-price]').forEach(function (el) { el.textContent = fmt(t.price); });

        var hasCompare = this.showCompare && t.compare > t.price;
        this.querySelectorAll('[data-compare]').forEach(function (el) { el.hidden = !hasCompare; el.textContent = fmt(t.compare); });
        this.querySelectorAll('[data-compare-single]').forEach(function (el) { el.textContent = fmt(v.compare); });
        this.querySelectorAll('[data-save]').forEach(function (el) { el.hidden = !hasCompare; el.textContent = 'Save ' + fmt(t.compare - t.price); });

        var note = this.querySelector('[data-price-note]');
        if (note) {
          if (!note.dataset.base) note.dataset.base = note.textContent;
          note.textContent = this.qty === 2 ? fmt(Math.floor(duo / 2)) + ' each · you save ' + fmt(v.price * 2 - duo) : note.dataset.base;
        }

        var atc = this.querySelector('.dgp-atc');
        var label = this.querySelector('[data-atc-label]');
        if (atc && label) {
          atc.disabled = !v.available;
          label.textContent = v.available ? (window.variantStrings ? window.variantStrings.addToCart : 'Add to cart') + ' · ' + fmt(t.price) : (window.variantStrings ? window.variantStrings.soldOut : 'Sold out');
        }

        var meta = this.querySelector('[data-sticky-meta]');
        if (meta) meta.textContent = v.color + (v.plug ? ' · ' + v.plug + ' adapter' : '') + ' · ' + this.qty + (this.qty === 2 ? ' caps' : ' cap');

        if (!initial && this.dataset.layout === 'pdp' && window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', v.id);
          window.history.replaceState({}, '', url.toString());
        }
      }

      setupSticky() {
        var bar = this.querySelector('[data-sticky]');
        var buy = this.querySelector('[data-buy]');
        if (!bar || !buy) return;
        var check = function () {
          var r = buy.getBoundingClientRect();
          bar.hidden = !(r.bottom < 0 || r.top > window.innerHeight);
          document.body.style.paddingBottom = bar.hidden ? '' : bar.offsetHeight + 'px';
        };
        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check);
        check();
      }
    });
  }

  /* ---------- Snow + string lights ---------- */
  function festive(el) {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    var flakes = parseInt(el.dataset.flakes, 10) || 70;
    var bulbs = parseInt(el.dataset.bulbs, 10) || 28;
    var mini = el.classList.contains('dg-festive--mini');
    var seed = mini ? 11 : 7;
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var html = '';
    var amp = mini ? 3 : 6, base = mini ? 4 : 14, wireH = mini ? 30 : 40;
    var path = '';
    for (var i = 0; i <= 100; i++) path += (i ? 'L' : 'M') + (i * 10) + ' ' + (base + Math.sin((i / 100) * Math.PI * 4) * amp).toFixed(2) + ' ';
    html += '<svg class="dg-festive__wire" viewBox="0 0 1000 ' + wireH + '" preserveAspectRatio="none" style="height:' + wireH + 'px"><path d="' + path + '"/></svg>';
    var colors = ['#ffc24a', '#f08a2c', '#ff6b4a', '#ffffff'];
    for (var b = 0; b < bulbs; b++) {
      var x = (b + 0.5) / bulbs;
      var y = (mini ? 1 : 8) + Math.sin(x * Math.PI * 4) * amp + (mini ? 3 : 6);
      var col = colors[b % 4];
      html += '<span class="dg-bulb" style="top:' + y.toFixed(1) + 'px;left:' + (x * 100).toFixed(2) + '%;background:' + col + ';box-shadow:0 0 ' + (mini ? '8px 2px ' : '12px 3px ') + col + ';animation-duration:' + (1.6 + (b % 5) * 0.4) + 's;animation-delay:' + (-(b % 7) * 0.3) + 's"></span>';
    }
    for (var f = 0; f < flakes; f++) {
      var s = (mini ? 3 : 3) + rnd() * (mini ? 5 : 6);
      html += '<span class="dg-flake" style="left:' + (rnd() * 100).toFixed(2) + '%;width:' + s.toFixed(1) + 'px;height:' + s.toFixed(1) + 'px;opacity:' + ((mini ? 0.35 : 0.6) + rnd() * (mini ? 0.45 : 0.4)).toFixed(2) + ';--drift:' + ((rnd() - 0.5) * (mini ? 80 : 120)).toFixed(0) + 'px;animation-duration:' + ((mini ? 7 : 9) + rnd() * (mini ? 8 : 10)).toFixed(1) + 's;animation-delay:' + (-rnd() * 18).toFixed(1) + 's"></span>';
    }
    el.innerHTML = html;
  }

  /* ---------- Countdown ---------- */
  function countdown(el) {
    var parts = (el.dataset.dgCountdown || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return;
    var end = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
    var q = function (s) { return el.querySelector(s); };
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var tick = function () {
      var left = Math.max(0, Math.floor((end - new Date()) / 1000));
      q('[data-d]').textContent = Math.floor(left / 86400);
      q('[data-h]').textContent = pad(Math.floor((left % 86400) / 3600));
      q('[data-m]').textContent = pad(Math.floor((left % 3600) / 60));
      q('[data-s]').textContent = pad(left % 60);
      if (left === 0) clearInterval(timer);
    };
    var timer = setInterval(tick, 1000);
    tick();
  }

  /* ---------- Delivery estimate ---------- */
  function eta(el) {
    var add = function (n) { var d = new Date(); d.setDate(d.getDate() + n); return d; };
    var fmt = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    var out = el.querySelector('[data-eta-dates]');
    if (out) out.textContent = fmt(add(parseInt(el.dataset.min, 10))) + ' – ' + fmt(add(parseInt(el.dataset.max, 10)));
  }

  function init(root) {
    root = root || document;
    if (!reduceMotion) root.querySelectorAll('[data-dg-festive]').forEach(festive);
    root.querySelectorAll('[data-dg-countdown]').forEach(countdown);
    root.querySelectorAll('[data-eta]').forEach(eta);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });

  /* ---------- Cart drawer upsell: bump the single line to 2 ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-dg-upsell]');
    if (!btn) return;
    var items = document.querySelector('cart-drawer-items');
    if (!items || typeof items.updateQuantity !== 'function') return;
    btn.disabled = true;
    items.updateQuantity(parseInt(btn.dataset.line, 10), 2, e, 'dg-upsell', btn.dataset.variant);
  });
})();
