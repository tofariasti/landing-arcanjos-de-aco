/**
 * Loja oficial A.A.M.C. — catálogo + compra via WhatsApp ou link externo
 */
window.ArcanjosLoja = (function () {
  'use strict';

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
    return script.getAttribute('src').replace('js/loja.js', 'data/loja.json');
  }

  function getSharedBase() {
    var script = document.querySelector('script[src*="shared/js/loja.js"]');
    if (!script) return '../shared/';
    return script.getAttribute('src').replace('js/loja.js', '');
  }

  function getWhatsAppNumber() {
    if (window.ArcanjosWhatsApp && ArcanjosWhatsApp.WHATSAPP_NUMBER) {
      return ArcanjosWhatsApp.WHATSAPP_NUMBER;
    }
    return '5522999999999';
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

    var whatsapp = purchase.whatsapp !== false;
    if (!whatsapp && !links.length) whatsapp = true;

    return { whatsapp: whatsapp, links: links };
  }

  function renderPurchaseActions(product) {
    var options = normalizePurchase(product);
    var parts = ['<div class="loja-card__actions">'];

    if (options.whatsapp) {
      parts.push(
        '<button type="button" class="loja-card__buy loja-card__buy--whatsapp" data-loja-buy-wa>' +
          '<i class="fab fa-whatsapp" aria-hidden="true"></i> Pedir no WhatsApp' +
        '</button>'
      );
    }

    options.links.forEach(function (link) {
      if (!link.url) return;

      var platform = link.platform || 'external';
      var label = link.label || 'Comprar online';
      var icon = platform === 'mercadolivre'
        ? '<span class="loja-card__ml-icon" aria-hidden="true">ML</span>'
        : '<i class="fas fa-external-link-alt" aria-hidden="true"></i>';

      parts.push(
        '<a href="' + escapeHtml(link.url) + '" class="loja-card__buy loja-card__buy--' + escapeHtml(platform) + '"' +
          ' target="_blank" rel="noopener noreferrer" data-loja-buy-external>' +
          icon + ' ' + escapeHtml(label) +
        '</a>'
      );
    });

    parts.push('</div>');
    return parts.join('');
  }

  function renderProduct(product, sharedBase) {
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

    return (
      '<article class="loja-card" data-product-id="' + escapeHtml(product.id) + '">' +
        '<div class="loja-card__media">' +
          badge +
          '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(product.name) + '" loading="lazy" width="400" height="300">' +
        '</div>' +
        '<div class="loja-card__body">' +
          '<span class="loja-card__cat">' + escapeHtml(product.category || 'Oficial') + '</span>' +
          '<h3 class="loja-card__name">' + escapeHtml(product.name) + '</h3>' +
          '<p class="loja-card__desc">' + escapeHtml(product.description) + '</p>' +
          '<p class="loja-card__price">R$ ' + escapeHtml(product.price) + ' <small>/ un.</small></p>' +
          sizeBlock +
          renderPurchaseActions(product) +
        '</div>' +
      '</article>'
    );
  }

  function bindPurchaseActions(container, products) {
    container.querySelectorAll('.loja-card').forEach(function (card) {
      var id = card.getAttribute('data-product-id');
      var product = products.find(function (p) { return p.id === id; });
      if (!product) return;

      var waBtn = card.querySelector('[data-loja-buy-wa]');
      if (waBtn) {
        waBtn.addEventListener('click', function () {
          var sizeEl = card.querySelector('[data-loja-size]');
          var size = sizeEl ? sizeEl.value : '';
          var url = 'https://wa.me/' + getWhatsAppNumber() + '?text=' +
            encodeURIComponent(buildOrderMessage(product, size));
          window.open(url, '_blank');
          if (window.ArcanjosWhatsApp && ArcanjosWhatsApp.showToast) {
            ArcanjosWhatsApp.showToast('Abrindo WhatsApp…', 'store');
          }
        });
      }

      card.querySelectorAll('[data-loja-buy-external]').forEach(function (link) {
        link.addEventListener('click', function () {
          if (window.ArcanjosWhatsApp && ArcanjosWhatsApp.showToast) {
            ArcanjosWhatsApp.showToast('Abrindo loja online…', 'store');
          }
        });
      });
    });
  }

  function render(containerId, options) {
    options = options || {};
    var container = document.getElementById(containerId || 'loja-grid');
    if (!container) return Promise.resolve();

    var sharedBase = getSharedBase();

    return fetch(getDataUrl())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var intro = document.querySelector('.loja__intro');
        var note = document.querySelector('.loja__note');
        if (intro && data.intro) intro.textContent = data.intro;
        if (note && data.note) note.textContent = data.note;

        var products = data.products || [];
        container.innerHTML = products.map(function (p) {
          return renderProduct(p, sharedBase);
        }).join('');

        bindPurchaseActions(container, products);

        if (window.ArcanjosReveal && typeof ArcanjosReveal.refresh === 'function') {
          ArcanjosReveal.refresh();
        }
      })
      .catch(function () {
        container.innerHTML = '<p class="loja__intro">Catálogo temporariamente indisponível. Chame no WhatsApp para consultar produtos.</p>';
      });
  }

  function init(containerId, options) {
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
