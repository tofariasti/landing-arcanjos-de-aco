/**
 * Formulário WhatsApp compartilhado — Arcanjos de Aço MC
 * Altere WHATSAPP_NUMBER quando o clube fornecer o número real.
 */
window.ArcanjosWhatsApp = (function () {
  'use strict';

  var WHATSAPP_NUMBER = '5522999999999';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function validateField(field) {
    var group = field.closest('.field');
    var existing = group ? group.querySelector('.error-message') : null;
    if (existing) existing.remove();
    field.classList.remove('error');

    if (field.hasAttribute('required') && !field.value.trim()) {
      showFieldError(field, 'Obrigatório');
      return false;
    }
    return true;
  }

  function showFieldError(field, message) {
    field.classList.add('error');
    var div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    div.setAttribute('role', 'alert');
    field.parentNode.appendChild(div);
  }

  function showToast(message, theme) {
    var toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.className = 'wa-toast' + (theme ? ' wa-toast--' + theme : '');
    toast.innerHTML = '<span>' + escapeHtml(message || 'Pedido enviado!') + '</span>';
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  function buildMessage() {
    var msg = '*Olá, Arcanjos de Aço! Tenho interesse em fazer parte do clube.*\n\n';
    msg += '🏍️ *Meus dados*\n';
    msg += '• Nome: ' + document.getElementById('nome').value + '\n';
    msg += '• Cidade: ' + document.getElementById('cidade').value + '\n';
    msg += '• Moto: ' + document.getElementById('moto').value + '\n';
    msg += '• Tempo de estrada: ' + document.getElementById('tempo-estrada').value + '\n';
    msg += '• Como conheci: ' + document.getElementById('como-conheceu').value + '\n';
    var mensagem = document.getElementById('mensagem');
    if (mensagem && mensagem.value) msg += '• Mensagem: ' + mensagem.value + '\n';
    msg += '\nAguardo retorno. Obrigado!';
    return msg;
  }

  function initForm(formId, options) {
    options = options || {};
    var form = document.getElementById(formId || 'whatsapp-form');
    if (!form) return;

    form.querySelectorAll('.field input, .field select, .field textarea').forEach(function (input) {
      input.addEventListener('blur', function () { validateField(this); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = ['nome', 'cidade', 'moto', 'tempo-estrada', 'como-conheceu'];
      var valid = true;
      fields.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !validateField(el)) valid = false;
      });
      if (!valid) return;

      var number = options.number || WHATSAPP_NUMBER;
      window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(buildMessage()), '_blank');
      showToast(options.successMessage || 'Pedido enviado!', options.theme);
      form.reset();
    });
  }

  function initFloatButton(selector, options) {
    options = options || {};
    var btn = document.querySelector(selector || '#whatsapp-float');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      var form = document.getElementById('whatsapp-form');
      if (form) {
        e.preventDefault();
        var contato = document.getElementById('contato');
        if (contato) {
          contato.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }
    });
  }

  return {
    WHATSAPP_NUMBER: WHATSAPP_NUMBER,
    initForm: initForm,
    initFloatButton: initFloatButton,
    validateField: validateField,
    showToast: showToast
  };
})();
