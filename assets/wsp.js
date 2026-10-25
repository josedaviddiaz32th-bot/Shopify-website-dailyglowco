/* Wrinkle Smooth Patches landing page behaviour: offer selector, gallery, sticky bar.
   Add-to-cart itself is handled by the theme's <product-form> (product-form.js). */
(function () {
  'use strict';

  function formatMoney(cents, format) {
    var value = (cents / 100).toFixed(2);
    var parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    value = parts.join('.');
    return (format || '${{amount}}').replace(/\{\{\s*amount[^}]*\}\}/, value);
  }

  if (!customElements.get('wsp-hero')) {
    customElements.define('wsp-hero', class extends HTMLElement {
      connectedCallback() {
        if (this._ready) return;
        this._ready = true;
        this.format = this.dataset.moneyFormat || '${{amount}}';

        this.addEventListener('click', this.onClick.bind(this));
        this.querySelectorAll('.wsp-offers input').forEach(function (r) {
          r.addEventListener('change', this.update.bind(this));
        }.bind(this));

        this.setupSticky();
        this.setupSwipe();
        this.setupFold();
        this.preloadSlides();
        this.update();
      }

      // Hidden slides are lazy, so they only start downloading when tapped and show
      // an empty box for a moment. Fetch them once the page itself has loaded.
      preloadSlides() {
        var self = this;
        var go = function () {
          self.querySelectorAll('.wsp-slide img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
        };
        if (document.readyState === 'complete') go();
        else window.addEventListener('load', go, { once: true });
      }

      onClick(e) {
        var t = e.target.closest('[data-thumb]');
        if (t) { this.showSlide(parseInt(t.dataset.thumb, 10)); return; }
        var step = e.target.closest('[data-gallery-step]');
        if (step) { this.stepSlide(parseInt(step.dataset.galleryStep, 10)); return; }
        if (e.target.closest('[data-sticky-atc]')) {
          var btn = this.querySelector('.wsp-atc');
          if (btn && !btn.disabled) btn.click();
        }
      }

      selected() {
        return this.querySelector('.wsp-offers input:checked');
      }

      update() {
        var r = this.selected();
        if (!r) return;
        var price = parseInt(r.dataset.price, 10);
        var available = r.dataset.available === 'true';
        var fmt = formatMoney(price, this.format);

        this.querySelectorAll('.wsp-form [name="id"], .wsp-sticky__form [name="id"]').forEach(function (i) {
          i.value = r.value;
          i.disabled = !available;
        });
        this.querySelectorAll('.wsp-form [name="quantity"]').forEach(function (q) {
          q.value = r.dataset.qty || 1;
        });
        var line = this.querySelector('[data-stock-line]');
        if (line) {
          var stock = parseInt(r.dataset.stock, 10);
          var max = parseInt(line.dataset.lowMax, 10) || 0;
          line.hidden = !(max > 0 && stock > 0 && stock <= max);
          var n = line.querySelector('[data-stock-n]');
          if (n && stock > 0) n.textContent = stock;
        }
        var label = this.querySelector('[data-atc-label]');
        if (label) label.textContent = available ? (label.dataset.add + ' · ' + fmt) : label.dataset.soldout;
        var atc = this.querySelector('.wsp-atc');
        if (atc) atc.disabled = !available;
        var sp = this.querySelector('[data-sticky-price]');
        if (sp) sp.textContent = fmt;
        var sn = this.querySelector('[data-sticky-name]');
        if (sn && r.dataset.title) sn.textContent = r.dataset.title;
      }

      showSlide(n) {
        var slides = this.querySelectorAll('[data-slide]');
        if (!slides.length) return;
        n = ((n - 1 + slides.length) % slides.length) + 1;
        slides.forEach(function (s) { s.classList.toggle('is-active', s.dataset.slide === String(n)); });
        this.querySelectorAll('[data-thumb]').forEach(function (b) {
          var on = b.dataset.thumb === String(n);
          b.classList.toggle('is-active', on);
          if (on && b.parentElement.scrollWidth > b.parentElement.clientWidth) {
            var strip = b.parentElement;
            strip.scrollTo({ left: b.offsetLeft - strip.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2 });
          }
        });
      }

      stepSlide(dir) {
        var cur = this.querySelector('[data-slide].is-active');
        this.showSlide((cur ? parseInt(cur.dataset.slide, 10) : 1) + dir);
      }

      setupSwipe() {
        var self = this, x0 = null, y0 = 0;
        var g = this.querySelector('.wsp-media');
        if (!g) return;
        g.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
        g.addEventListener('touchend', function (e) {
          if (x0 === null || !e.target.closest('[data-slide]')) { x0 = null; return; }
          var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
          x0 = null;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) self.stepSlide(dx < 0 ? 1 : -1);
        });
      }

      // Phones: size the slide so the product name ends right at the bottom of the
      // first screen and the description starts just below it.
      setupFold() {
        var self = this;
        var media = this.querySelector('.wsp-media');
        var slide = this.querySelector('.wsp-slide.is-active');
        var title = this.querySelector('.wsp-title');
        if (!media || !slide || !title) return;
        var fit = function () {
          if (window.innerWidth >= 750) { self.style.removeProperty('--wsp-slide-h'); return; }
          var cur = slide.getBoundingClientRect().height;
          var titleBottom = title.getBoundingClientRect().bottom + window.scrollY;
          var spare = window.innerHeight - titleBottom - 16;
          var h = Math.max(260, Math.min(cur + spare, window.innerWidth * 1.25));
          self.style.setProperty('--wsp-slide-h', Math.round(h) + 'px');
        };
        fit();
        var lastW = window.innerWidth;
        window.addEventListener('resize', function () {
          // Ignore height-only resizes (mobile toolbars showing/hiding) to avoid jumps.
          if (window.innerWidth !== lastW) { lastW = window.innerWidth; self.style.removeProperty('--wsp-slide-h'); fit(); }
        });
      }

      setupSticky() {
        var bar = this.querySelector('[data-sticky]');
        var buy = this.querySelector('[data-buy]');
        if (!bar || !buy || !('IntersectionObserver' in window)) return;
        new IntersectionObserver(function (entries) {
          bar.hidden = entries[0].isIntersecting || entries[0].boundingClientRect.top > 0;
        }, { threshold: 0 }).observe(buy);
      }
    });
  }

  /* Area cards: plain product forms; <product-form> does the cart work. */

  /* Shop grid: grid size, filter & sort, Quick Shop panels. */
  if (!customElements.get('wsp-shop')) {
    customElements.define('wsp-shop', class extends HTMLElement {
      connectedCallback() {
        if (this._ready) return;
        this._ready = true;
        this.format = this.dataset.moneyFormat || '${{amount}}';
        this.grid = this.querySelector('[data-grid]');
        this.filter = this.querySelector('[data-filter]');

        this.addEventListener('click', this.onClick.bind(this));
        this.addEventListener('change', this.onChange.bind(this));
        // Close a Quick Shop panel when its add-to-cart is submitted, so the cart drawer shows.
        this.addEventListener('submit', function (e) {
          var d = e.target.closest('dialog');
          if (d) setTimeout(function () { d.close(); }, 150);
        });
        // Click on the dimmed backdrop closes the panel; the page behind stays locked while one is open.
        this.querySelectorAll('dialog').forEach(function (d) {
          d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
          d.addEventListener('close', function () { document.documentElement.classList.remove('wsp-locked'); });
        });
      }

      onClick(e) {
        var q = e.target.closest('[data-open-quick]');
        if (q) { this.open(document.getElementById(q.dataset.openQuick)); return; }
        if (e.target.closest('[data-open-filter]')) { this.open(this.filter); return; }
        var c = e.target.closest('[data-close]');
        if (c) { c.closest('dialog').close(); return; }
        var m = e.target.closest('[data-cols]');
        if (m) { this.style.setProperty('--wsp-cols-m', m.dataset.cols); this.press(m, '[data-cols]'); return; }
        var dk = e.target.closest('[data-cols-d]');
        if (dk) { this.style.setProperty('--wsp-cols-d', dk.dataset.colsD); this.press(dk, '[data-cols-d]'); }
      }

      open(d) {
        if (!d) return;
        document.documentElement.classList.add('wsp-locked');
        d.showModal();
        var sc = d.querySelector('.wsp-quick__scroll');
        if (sc) sc.scrollTop = 0;
      }

      press(btn, sel) {
        this.querySelectorAll(sel).forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
      }

      onChange(e) {
        var t = e.target;
        if (t.name && t.name.indexOf('wsp-quick-opt-') === 0) {
          var d = t.closest('dialog');
          var input = d.querySelector('form [name="id"]');
          var btn = d.querySelector('form [type="submit"]');
          var ok = t.dataset.available === 'true';
          input.value = t.value;
          var qty = d.querySelector('form [name="quantity"]');
          if (qty) qty.value = t.dataset.qty || 1;
          input.disabled = !ok;
          btn.disabled = !ok;
          var price = d.querySelector('[data-quick-price]');
          if (price) price.textContent = formatMoney(parseInt(t.dataset.price, 10), this.format);
          return;
        }
        if (t.name && (t.name.indexOf('wsp-cat-') === 0 || t.name.indexOf('wsp-sort-') === 0)) this.apply();
      }

      apply() {
        var cat = (this.querySelector('[name^="wsp-cat-"]:checked') || {}).value || '';
        var sort = (this.querySelector('[name^="wsp-sort-"]:checked') || {}).value || 'featured';
        var cards = Array.prototype.slice.call(this.grid.children);
        var shown = 0;
        cards.forEach(function (c) {
          var on = !cat || c.dataset.cat === cat;
          c.hidden = !on;
          if (on) shown++;
        });
        cards.sort(function (a, b) {
          if (sort === 'price-asc') return a.dataset.price - b.dataset.price;
          if (sort === 'price-desc') return b.dataset.price - a.dataset.price;
          return a.dataset.index - b.dataset.index;
        }).forEach(function (c) { this.grid.appendChild(c); }.bind(this));
        this.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = shown; });
        var empty = this.querySelector('[data-empty]');
        if (empty) empty.hidden = shown > 0;
      }
    });
  }
})();
