/* ============================================================
   PAWSITIVE.LIVING — Theme scripts
   Cart drawer · Mobile menu · Accordion · Product variants
   No dependencies. Uses native Shopify cart AJAX API.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Money formatting ---------- */
  var moneyFormat = (document.body && document.body.dataset.moneyFormat) || '${{amount}}';
  function formatMoney(cents) {
    var value = (cents / 100);
    if (moneyFormat.indexOf('amount_no_decimals') !== -1) {
      return moneyFormat.replace('{{amount_no_decimals}}', value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    }
    var formatted = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return moneyFormat.replace('{{amount}}', formatted);
  }

  /* ---------- Cart drawer ---------- */
  var drawer = $('#CartDrawer');
  var overlay = $('#CartDrawerOverlay');
  var lastFocused = null;

  function announce(msg) {
    var status = $('#CartStatus');
    if (status) status.textContent = msg;
  }

  function setBackgroundInert(inert) {
    $$('#MainContent, .site-header, .site-footer').forEach(function (el) {
      if (inert) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    document.body.classList.add('cart-open');
    drawer.setAttribute('aria-hidden', 'false');
    setBackgroundInert(true);
    var closeBtn = $('.cart-drawer__close', drawer);
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    document.body.classList.remove('cart-open');
    drawer.setAttribute('aria-hidden', 'true');
    setBackgroundInert(false);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  // Keep keyboard focus inside the open drawer
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !drawer || !document.body.classList.contains('cart-open')) return;
    var focusable = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer)
      .filter(function (el) { return el.offsetParent !== null; });
    if (focusable.length === 0) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function cartCount(c) {
    return c.items.reduce(function (n, i) { return n + i.quantity; }, 0);
  }

  function renderCart(c) {
    var itemsEl = $('#CartDrawerItems');
    var footEl = $('#CartDrawerFoot');
    var countEls = $$('[data-cart-count]');
    var n = cartCount(c);
    countEls.forEach(function (el) {
      el.textContent = n;
      if (n === 0) { el.setAttribute('hidden', ''); } else { el.removeAttribute('hidden'); }
    });

    if (!itemsEl) return;
    if (c.items.length === 0) {
      itemsEl.innerHTML = '<div class="cart-drawer__empty"><p>Your cart is empty.</p>' +
        '<p style="margin-top:1rem"><a class="btn btn--secondary" href="' + (drawer.dataset.shopUrl || '/collections/all') + '">Explore the collection</a></p></div>';
      if (footEl) footEl.style.display = 'none';
      var sp = $('#ShipProgress'); if (sp) sp.style.display = 'none';
      return;
    }
    if (footEl) footEl.style.display = '';

    itemsEl.innerHTML = c.items.map(function (item) {
      var img = item.image
        ? '<img src="' + item.image.replace(/(\.[a-z]+)$/i, '_160x$1') + '" alt="' + escapeHtml(item.product_title) + '" loading="lazy" width="84" height="104">'
        : '';
      var variant = (item.variant_title && item.variant_title !== 'Default Title')
        ? '<p class="cart-item__variant">' + escapeHtml(item.variant_title) + '</p>' : '';
      return '<div class="cart-item" data-key="' + item.key + '">' +
        '<div class="cart-item__media">' + img + '</div>' +
        '<div><p class="cart-item__title"><a href="' + item.url + '">' + escapeHtml(item.product_title) + '</a></p>' +
        variant +
        '<div class="cart-item__row">' +
          '<span class="cart-item__qty">' +
            '<button type="button" data-qty="minus" aria-label="Decrease quantity">−</button>' +
            '<output aria-live="polite">' + item.quantity + '</output>' +
            '<button type="button" data-qty="plus" aria-label="Increase quantity">+</button>' +
          '</span>' +
          '<span class="cart-item__price">' + formatMoney(item.final_line_price) + '</span>' +
        '</div>' +
        '<button type="button" class="cart-item__remove" data-remove>Remove</button></div>' +
      '</div>';
    }).join('');

    var subtotalEl = $('#CartSubtotal');
    if (subtotalEl) subtotalEl.textContent = formatMoney(c.total_price);

    // Free-shipping progress (threshold in cents, from section setting)
    var threshold = parseInt(drawer.dataset.freeShip || '0', 10);
    var spWrap = $('#ShipProgress');
    if (spWrap && threshold > 0) {
      spWrap.style.display = '';
      var label = $('#ShipProgressLabel'), fill = $('#ShipProgressFill');
      var pct = Math.min(100, Math.round((c.total_price / threshold) * 100));
      if (fill) fill.style.width = pct + '%';
      if (label) {
        label.textContent = c.total_price >= threshold
          ? 'Your order ships free.'
          : 'You are ' + formatMoney(threshold - c.total_price) + ' away from free shipping.';
      }
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function refreshCart(openAfter) {
    return fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (c) {
        renderCart(c);
        if (openAfter) openDrawer();
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: c }));
      });
  }

  function addToCart(formData, openAfter) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw new Error(e.description || 'Could not add to cart.'); });
      return r.json();
    }).then(function () { return refreshCart(openAfter !== false); });
  }

  // Product forms (main product + quick add)
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('[data-product-form]')) return;
    e.preventDefault();
    var btn = $('[data-add-to-cart]', form);
    var original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = btn.dataset.addingText || 'Adding…'; }
    addToCart(new FormData(form), true).then(function () {
      var root = form.closest('[data-product-root]');
      var titleEl = root ? $('.product__title', root) : null;
      var qtyInput = form.querySelector('input[name="quantity"]');
      var qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
      announce((titleEl ? titleEl.textContent.trim() : 'Product') + ' added to your cart' + (qty > 1 ? ' (' + qty + ').' : '.'));
    }).catch(function (err) {
      var errEl = $('.form-status--error', form);
      if (errEl) { errEl.textContent = err.message; errEl.hidden = false; }
      else { alert(err.message); }
    }).finally(function () {
      if (btn) { btn.disabled = false; btn.textContent = original; }
    });
  });

  // Sticky mobile purchase bar — submits the main product form
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-sticky-add]');
    if (!btn) return;
    var root = btn.closest('[data-product-root]');
    var form = root ? $('[data-product-form]', root) : document.getElementById('ProductForm');
    if (form) form.requestSubmit();
  });

  // Drawer item controls (event delegation)
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      var item = e.target.closest('[data-key]');
      if (e.target.closest('[data-cart-close]')) { closeDrawer(); return; }
      if (!item) return;
      var key = item.dataset.key;
      var qtyBtn = e.target.closest('[data-qty]');
      var rmBtn = e.target.closest('[data-remove]');
      if (qtyBtn || rmBtn) {
        e.preventDefault();
        if (item.dataset.busy === '1') return; // prevent duplicate submissions
        var out = $('output', item);
        var qty = parseInt(out.textContent, 10) || 1;
        var next = rmBtn ? 0 : (qtyBtn.dataset.qty === 'plus' ? qty + 1 : Math.max(0, qty - 1));
        var titleEl = $('.cart-item__title', item);
        var title = titleEl ? titleEl.textContent.trim() : 'item';
        item.dataset.busy = '1';
        $$('button', item).forEach(function (b) { b.disabled = true; });
        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ id: key, quantity: next })
        }).then(function (r) {
          if (!r.ok) return r.json().then(function (err) { throw new Error(err.description || 'Could not update the cart.'); });
          return r.json();
        }).then(function (c) {
          renderCart(c);
          if (next === 0) announce(title + ' removed from your cart.');
          else announce(title + ' quantity updated to ' + next + '.');
        }).catch(function (err) {
          announce(err.message || 'Could not update the cart. Please try again.');
        }).finally(function () {
          delete item.dataset.busy;
        });
      }
    });
  }
  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDrawer(); closeMenu(); }
  });
  // Header cart buttons open the drawer
  $$('[data-open-cart]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); refreshCart(true); });
  });

  /* ---------- Product quantity controls ---------- */
  // Delegated: works for the main product form and any future qty steppers.
  // Buttons are type="button" so they never submit the form by accident.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-qty-minus], [data-qty-plus]');
    if (!btn) return;
    var wrap = btn.closest('.qty');
    var input = wrap ? wrap.querySelector('input[type="number"]') : null;
    if (!input) return;
    var cur = parseInt(input.value, 10);
    if (isNaN(cur) || cur < 1) cur = 1;
    input.value = btn.hasAttribute('data-qty-plus') ? cur + 1 : Math.max(1, cur - 1);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  // Clamp hand-typed values to a minimum of 1
  document.addEventListener('change', function (e) {
    if (e.target.matches && e.target.matches('.qty input[type="number"]')) {
      var v = parseInt(e.target.value, 10);
      if (isNaN(v) || v < 1) e.target.value = 1;
    }
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#MobileMenuBtn');
  var mobileNav = $('#MobileNav');
  function closeMenu() {
    if (!mobileNav || !menuBtn) return;
    mobileNav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var firstLink = $('a', mobileNav);
        if (firstLink) firstLink.focus();
      } else {
        menuBtn.focus();
      }
    });
  }

  /* ---------- Accordion ---------- */
  $$('[data-accordion]').forEach(function (acc) {
    var btns = $$('.accordion__btn', acc);
    btns.forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        // Single-open behavior within a group
        btns.forEach(function (b) {
          b.setAttribute('aria-expanded', 'false');
          var p = document.getElementById(b.getAttribute('aria-controls'));
          if (p) p.style.maxHeight = null;
        });
        if (!expanded) {
          btn.setAttribute('aria-expanded', 'true');
          if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  });

  /* ---------- Product variant selection ---------- */
  $$('[data-product-json]').forEach(function (scriptEl) {
    var root = scriptEl.closest('[data-product-root]');
    if (!root) return;
    var variants = JSON.parse(scriptEl.textContent);
    var form = $('[data-product-form]', root);
    var variantInput = $('[name="id"]', form);
    var priceEl = $('[data-product-price]', root);
    var invEl = $('[data-inventory-note]', root);
    var addBtn = $('[data-add-to-cart]', form);
    var stickyPrice = $('[data-sticky-price]', root);
    var stickyBtn = $('[data-sticky-add]', root);
    var featuredImg = $('[data-featured-image]', root);
    var variantImagesEl = $('[data-variant-images]', root);
    var variantImages = {};
    try { variantImages = variantImagesEl ? JSON.parse(variantImagesEl.textContent) : {}; }
    catch (err) { variantImages = {}; }

    function currentVariant() {
      var selected = {};
      $$('[data-option-input]:checked', root).forEach(function (input) {
        selected[input.dataset.optionIndex] = input.value;
      });
      // Single-option products may use a select
      $$('[data-option-select]', root).forEach(function (sel) {
        selected[sel.dataset.optionIndex] = sel.value;
      });
      return variants.find(function (v) {
        return v.options.every(function (opt, i) { return selected[i] === opt; });
      });
    }

    function update() {
      var v = currentVariant();
      if (!v) return;
      variantInput.value = v.id;
      if (priceEl) priceEl.innerHTML = formatMoney(v.price) +
        (v.compare_at_price && v.compare_at_price > v.price ? ' <s>' + formatMoney(v.compare_at_price) + '</s>' : '');
      if (addBtn) {
        addBtn.disabled = !v.available;
        addBtn.textContent = v.available ? (addBtn.dataset.addText || 'Add to cart') : 'Sold out';
      }
      if (stickyPrice) stickyPrice.textContent = formatMoney(v.price);
      if (stickyBtn) stickyBtn.disabled = !v.available;
      if (invEl) {
        invEl.hidden = false;
        invEl.className = 'inventory-note';
        if (!v.available) {
          invEl.textContent = invEl.dataset.soldout || 'Sold out';
          invEl.classList.add('inventory-note--out');
        } else if (v.inventory_management && typeof v.inventory_quantity === 'number' && v.inventory_quantity <= 5 && v.inventory_quantity > 0) {
          invEl.textContent = (invEl.dataset.low || 'Only a few left') + ' (' + v.inventory_quantity + ')';
          invEl.classList.add('inventory-note--low');
        } else {
          invEl.textContent = invEl.dataset.instock || 'In stock';
        }
      }
      if (variantImages[v.id] && featuredImg) {
        featuredImg.src = variantImages[v.id];
      }
    }

    root.addEventListener('change', function (e) {
      if (e.target.matches('[data-option-input], [data-option-select]')) update();
    });
    update();
  });

  /* ---------- Product thumbnails ---------- */
  $$('[data-thumbs]').forEach(function (thumbs) {
    var root = thumbs.closest('[data-product-root]') || document;
    var featured = $('[data-featured-image]', root);
    thumbs.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-thumb]');
      if (!btn || !featured) return;
      featured.src = btn.dataset.full;
      featured.alt = btn.querySelector('img') ? btn.querySelector('img').alt : featured.alt;
      $$('[data-thumb]', thumbs).forEach(function (b) { b.setAttribute('aria-current', 'false'); });
      btn.setAttribute('aria-current', 'true');
    });
  });

  // Initial cart count on load
  refreshCart(false);

  /* ---------- Ritual finder quiz ---------- */
  $$('[data-quiz]').forEach(function (quiz) {
    var config = JSON.parse($('[data-quiz-config]', quiz).textContent);
    var steps = $$('[data-quiz-step]', quiz);
    var result = $('[data-quiz-result]', quiz);
    var nextBtn = $('[data-quiz-next]', quiz);
    var backBtn = $('[data-quiz-back]', quiz);
    var progress = $('[data-quiz-progress]', quiz);
    var current = 0;
    var answers = {};

    function showStep(i) {
      steps.forEach(function (s, idx) { s.hidden = idx !== i; });
      result.hidden = true;
      nextBtn.hidden = false;
      backBtn.hidden = i === 0;
      nextBtn.disabled = !answers[i];
      nextBtn.textContent = nextBtn.dataset.label || nextBtn.textContent;
      progress.textContent = 'Question ' + (i + 1) + ' of ' + steps.length;
      current = i;
    }

    function showResult() {
      // Tally scores; highest wins, ties go to bundle
      var scores = { paw: 0, coat: 0, bundle: 0 };
      Object.keys(answers).forEach(function (k) {
        var v = answers[k];
        if (scores[v] !== undefined) scores[v]++;
      });
      var winner = 'bundle';
      var best = -1;
      ['paw', 'coat', 'bundle'].forEach(function (k) {
        if (scores[k] > best) { best = scores[k]; winner = k; }
      });

      var p = config.products[winner];
      var r = config.results[winner];
      $('[data-quiz-result-title]', result).textContent = r.title;
      $('[data-quiz-result-text]', result).textContent = r.text;
      var prodHtml = '';
      if (p && p.url) {
        prodHtml = '<a class="quiz__product-card" href="' + p.url + '">' +
          (p.image ? '<img src="' + p.image + '" alt="' + (p.title || '').replace(/"/g, '&quot;') + '" loading="lazy">' : '') +
          '<span class="quiz__product-info"><strong>' + (p.title || '') + '</strong>' +
          (p.price ? '<span>' + p.price + '</span>' : '') + '</span></a>';
      }
      $('[data-quiz-result-product]', result).innerHTML = prodHtml;

      steps.forEach(function (s) { s.hidden = true; });
      result.hidden = false;
      nextBtn.hidden = true;
      backBtn.hidden = true;
      progress.textContent = '';
    }

    quiz.addEventListener('change', function (e) {
      if (!e.target.matches('[data-quiz-input]')) return;
      var step = e.target.closest('[data-quiz-step]');
      var idx = steps.indexOf(step);
      answers[idx] = e.target.value;
      if (idx === current) nextBtn.disabled = false;
    });

    nextBtn.addEventListener('click', function () {
      if (current < steps.length - 1) showStep(current + 1);
      else showResult();
    });
    backBtn.addEventListener('click', function () {
      if (current > 0) showStep(current - 1);
    });
    var restart = $('[data-quiz-restart]', quiz);
    if (restart) restart.addEventListener('click', function () {
      answers = {};
      $$('[data-quiz-input]', quiz).forEach(function (i) { i.checked = false; });
      showStep(0);
    });

    if (steps.length) showStep(0);
  });

  /* ---------- Product image zoom (hover) ---------- */
  $$('.product__featured').forEach(function (wrap) {
    var img = wrap.querySelector('img');
    if (!img) return;
    wrap.classList.add('zoomable');
    wrap.addEventListener('mousemove', function (e) {
      var rect = wrap.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = x + '% ' + y + '%';
    });
    wrap.addEventListener('mouseenter', function () {
      img.style.transform = 'scale(1.8)';
    });
    wrap.addEventListener('mouseleave', function () {
      img.style.transform = '';
      img.style.transformOrigin = 'center';
    });
  });
})();
