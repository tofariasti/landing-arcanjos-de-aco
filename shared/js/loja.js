/**
 * Loja oficial A.A.M.C. — catálogo + compra via WhatsApp ou link externo
 */
window.ArcanjosLoja = (function () {
  'use strict';

  var PURCHASE_LINKS_ENABLED = false;

  var state = {
    products: [],
    category: 'all',
    query: '',
    sort: 'featured',
    marketplace: false,
    sharedBase: '../shared/'
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getDataUrl() {
    var script = document.querySelector('script[src*="shared/js/loja.js"]');
    if (!script) return '../shared/data/loja.json';
    return script.getAttribute('src').replace(/js\/loja\.js.*$/, 'data/loja.json');
  }

  function getSharedBase() {
    var script = document.querySelector('script[src*="shared/js/loja.js"]');
    if (!script) return '../shared/';
    return script.getAttribute('src').replace(/js\/loja\.js.*$/, '');
  }

  function getWhatsAppNumber() {
    if (window.ArcanjosWhatsApp && ArcanjosWhatsApp.WHATSAPP_NUMBER) {
      return ArcanjosWhatsApp.WHATSAPP_NUMBER;
    }
    return '5522999999999';
  }

  function parsePrice(price) {
    return parseFloat(String(price || '0').replace(/\./g, '').replace(',', '.')) || 0;
  }

  function formatMoney(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function installmentHint(priceStr) {
    var value = parsePrice(priceStr);
    if (value < 40) return '';
    var n = value >= 120 ? 3 : 2;
    var parcel = value / n;
    return 'em até ' + n + 'x de R$ ' + formatMoney(parcel);
  }

  function buildOrderMessage(product, size) {
    var msg = '*Pedido — Loja Oficial A.A.M.C.*\n\n';
    msg += '🛒 *Produto:* ' + product.name + '\n';
    msg += '💰 *Valor:* R$ ' + product.price + '\n';
    if (size) msg += '📏 *Tamanho:* ' + size + '\n';
    msg += '\nGostaria de finalizar este pedido. Aguardo retorno sobre disponibilidade e forma de pagamento/retirada.';
    return msg;
  }

  function normalizePurchase(product) {
    var purchase = product.purchase || {};
    var links = Array.isArray(purchase.links) ? purchase.links.slice() : [];

    if (purchase.mercadolivre) {
      links.push({
        platform: 'mercadolivre',
        url: purchase.mercadolivre,
        label: purchase.mercadolivreLabel || 'Comprar no Mercado Livre'
      });
    }

    if (purchase.url && !links.length) {
      links.push({
        platform: purchase.platform || 'external',
        url: purchase.url,
        label: purchase.label || 'Comprar online'
      });
    }

    var mlLink = links.find(function (link) {
      return link && link.platform === 'mercadolivre' && link.url;
    }) || null;

    return {
      whatsapp: true,
      mercadolivre: true,
      mlUrl: mlLink ? mlLink.url : '',
      links: links
    };
  }

  function renderPurchaseActions(product) {
    var options = normalizePurchase(product);
    var parts = ['<div class="loja-card__actions">'];
    var inertAttrs = PURCHASE_LINKS_ENABLED
      ? ''
      : ' aria-disabled="true" title="Catálogo demonstrativo — link desativado"';
    var demoClass = PURCHASE_LINKS_ENABLED ? '' : ' is-demo';

    // Always show both channels on every product card
    parts.push(
      '<button type="button" class="loja-card__buy loja-card__buy--whatsapp' + demoClass +
        '" data-loja-buy-wa' + inertAttrs + '>' +
        '<i class="fab fa-whatsapp" aria-hidden="true"></i> Pedir no WhatsApp' +
      '</button>'
    );

    if (PURCHASE_LINKS_ENABLED && options.mlUrl) {
      parts.push(
        '<a href="' + escapeHtml(options.mlUrl) + '" class="loja-card__buy loja-card__buy--mercadolivre"' +
          ' target="_blank" rel="noopener noreferrer" data-loja-buy-external>' +
          '<span class="loja-card__ml-icon" aria-hidden="true">ML</span> Mercado Livre' +
        '</a>'
      );
    } else {
      parts.push(
        '<button type="button" class="loja-card__buy loja-card__buy--mercadolivre' + demoClass +
          '" data-loja-buy-external' + inertAttrs + '>' +
          '<span class="loja-card__ml-icon" aria-hidden="true">ML</span> Mercado Livre' +
        '</button>'
      );
    }

    parts.push('</div>');
    return parts.join('');
  }

  function renderProduct(product, sharedBase, marketplace) {
    var imgSrc = sharedBase + product.image;
    var badge = product.badge
      ? '<span class="loja-card__badge">' + escapeHtml(product.badge) + '</span>'
      : '';

    var sizeBlock = '';
    if (product.sizes && product.sizes.length) {
      var options = product.sizes.map(function (s) {
        return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>';
      }).join('');
      sizeBlock =
        '<div class="loja-card__size">' +
          '<label for="loja-size-' + escapeHtml(product.id) + '">Tamanho</label>' +
          '<select id="loja-size-' + escapeHtml(product.id) + '" data-loja-size>' +
            options +
          '</select>' +
        '</div>';
    }

    var installments = marketplace ? installmentHint(product.price) : '';
    var priceExtra = installments
      ? '<span class="loja-card__installments">' + escapeHtml(installments) + '</span>'
      : '<small>/ un.</small>';

    var shipping = marketplace
      ? '<p class="loja-card__shipping"><i class="fas fa-truck" aria-hidden="true"></i> Frete sob consulta</p>'
      : '';

    var desc = '<p class="loja-card__desc">' + escapeHtml(product.description) + '</p>';
    var disclaimer =
      '<p class="loja-card__disclaimer">' +
        'Item e valor meramente ilustrativos/fictícios. Imagem criada com IA.' +
      '</p>';

    return (
      '<article class="loja-card' + (marketplace ? ' loja-card--market' : '') + '" data-product-id="' + escapeHtml(product.id) + '">' +
        '<div class="loja-card__media">' +
          badge +
          '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(product.name) + ' (ilustrativo)" loading="lazy" width="400" height="400">' +
        '</div>' +
        '<div class="loja-card__body">' +
          '<span class="loja-card__cat">' + escapeHtml(product.category || 'Oficial') + '</span>' +
          '<h3 class="loja-card__name">' + escapeHtml(product.name) + '</h3>' +
          desc +
          '<div class="loja-card__pricing">' +
            '<p class="loja-card__price">R$ ' + escapeHtml(product.price) + ' ' + priceExtra + '</p>' +
            shipping +
          '</div>' +
          sizeBlock +
          disclaimer +
          renderPurchaseActions(product) +
        '</div>' +
      '</article>'
    );
  }

  function uniqueCategories(products) {
    var seen = {};
    var cats = [];
    products.forEach(function (p) {
      var cat = p.category || 'Oficial';
      if (!seen[cat]) {
        seen[cat] = true;
        cats.push(cat);
      }
    });
    return cats;
  }

  function filterAndSort() {
    var q = state.query.trim().toLowerCase();
    var list = state.products.filter(function (p) {
      var cat = p.category || 'Oficial';
      if (state.category !== 'all' && cat !== state.category) return false;
      if (!q) return true;
      var hay = [p.name, p.description, cat, p.badge || ''].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    if (state.sort === 'price-asc') {
      list.sort(function (a, b) { return parsePrice(a.price) - parsePrice(b.price); });
    } else if (state.sort === 'price-desc') {
      list.sort(function (a, b) { return parsePrice(b.price) - parsePrice(a.price); });
    } else if (state.sort === 'name-asc') {
      list.sort(function (a, b) { return a.name.localeCompare(b.name, 'pt-BR'); });
    } else {
      list.sort(function (a, b) {
        var ba = a.badge ? 1 : 0;
        var bb = b.badge ? 1 : 0;
        return bb - ba;
      });
    }

    return list;
  }

  function renderFilters() {
    var wrap = document.getElementById('loja-filters');
    if (!wrap) return;

    var cats = uniqueCategories(state.products);
    var html = '<button type="button" class="loja-filter' + (state.category === 'all' ? ' is-active' : '') + '" data-loja-cat="all" role="tab" aria-selected="' + (state.category === 'all') + '">Todos</button>';
    cats.forEach(function (cat) {
      var active = state.category === cat;
      html +=
        '<button type="button" class="loja-filter' + (active ? ' is-active' : '') + '" data-loja-cat="' + escapeHtml(cat) + '" role="tab" aria-selected="' + active + '">' +
          escapeHtml(cat) +
        '</button>';
    });
    wrap.innerHTML = html;

    wrap.querySelectorAll('[data-loja-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.category = btn.getAttribute('data-loja-cat');
        paintCatalog();
        renderFilters();
      });
    });
  }

  function updateCount(n) {
    var el = document.getElementById('loja-count');
    if (!el) return;
    if (n === 0) {
      el.textContent = 'Nenhum produto';
    } else if (n === 1) {
      el.textContent = '1 produto';
    } else {
      el.textContent = n + ' produtos';
    }
  }

  function showDemoToast(message) {
    if (window.ArcanjosWhatsApp && ArcanjosWhatsApp.showToast) {
      ArcanjosWhatsApp.showToast(message || 'Catálogo demonstrativo — link desativado', 'store');
      return;
    }
    var existing = document.querySelector('.wa-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'wa-toast wa-toast--store';
    toast.textContent = message || 'Catálogo demonstrativo — link desativado';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 2600);
  }

  function bindPurchaseActions(container, products) {
    container.querySelectorAll('.loja-card').forEach(function (card) {
      var id = card.getAttribute('data-product-id');
      var product = products.find(function (p) { return p.id === id; });
      if (!product) return;

      var waBtn = card.querySelector('[data-loja-buy-wa]');
      if (waBtn) {
        waBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (!PURCHASE_LINKS_ENABLED) {
            showDemoToast('Catálogo demonstrativo — WhatsApp desativado');
            return;
          }
          var sizeEl = card.querySelector('[data-loja-size]');
          var size = sizeEl ? sizeEl.value : '';
          var url = 'https://wa.me/' + getWhatsAppNumber() + '?text=' +
            encodeURIComponent(buildOrderMessage(product, size));
          window.open(url, '_blank');
          showDemoToast('Abrindo WhatsApp…');
        });
      }

      card.querySelectorAll('[data-loja-buy-external]').forEach(function (link) {
        link.addEventListener('click', function (e) {
          if (!PURCHASE_LINKS_ENABLED) {
            e.preventDefault();
            showDemoToast('Catálogo demonstrativo — link desativado');
            return;
          }
          showDemoToast('Abrindo loja online…');
        });
      });
    });
  }

  function paintCatalog() {
    var container = document.getElementById('loja-grid');
    if (!container) return;

    var list = filterAndSort();
    var empty = document.getElementById('loja-empty');

    updateCount(list.length);

    if (!list.length) {
      container.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    container.innerHTML = list.map(function (p) {
      return renderProduct(p, state.sharedBase, state.marketplace);
    }).join('');

    bindPurchaseActions(container, list);

    if (window.ArcanjosReveal && typeof ArcanjosReveal.refresh === 'function') {
      ArcanjosReveal.refresh();
    }
  }

  function bindMarketplaceControls() {
    var form = document.getElementById('loja-search-form');
    var input = document.getElementById('loja-search');
    var sort = document.getElementById('loja-sort');

    if (form && input) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        state.query = input.value || '';
        paintCatalog();
        var catalog = document.getElementById('catalogo');
        if (catalog) catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      var debounce;
      input.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(function () {
          state.query = input.value || '';
          paintCatalog();
        }, 220);
      });
    }

    if (sort) {
      sort.addEventListener('change', function () {
        state.sort = sort.value;
        paintCatalog();
      });
    }
  }

  function render(containerId, options) {
    options = options || {};
    var container = document.getElementById(containerId || 'loja-grid');
    if (!container) return Promise.resolve();

    state.marketplace = !!options.marketplace;
    state.sharedBase = getSharedBase();
    state.category = 'all';
    state.query = '';
    state.sort = 'featured';

    return fetch(getDataUrl())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var intro = document.querySelector('.loja__intro');
        var note = document.querySelector('.loja__note');
        if (intro && data.intro) intro.textContent = data.intro;
        if (note && data.note) note.textContent = data.note;

        state.products = data.products || [];

        if (state.marketplace) {
          renderFilters();
          bindMarketplaceControls();
        }

        paintCatalog();
      })
      .catch(function () {
        container.innerHTML = '<p class="loja__intro">Catálogo temporariamente indisponível. Chame no WhatsApp para consultar produtos.</p>';
        updateCount(0);
      });
  }

  function init(containerId, options) {
    if (typeof containerId === 'object' && containerId !== null) {
      options = containerId;
      containerId = 'loja-grid';
    }
    options = options || {};

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        render(containerId, options);
      });
    } else {
      render(containerId, options);
    }
  }

  return { init: init, render: render };
})();
