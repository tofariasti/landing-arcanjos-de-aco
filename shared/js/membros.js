/**
 * Irmãos / membros A.A.M.C. — perfis + moto + história
 */
window.ArcanjosMembros = (function () {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getDataUrl() {
    var script = document.querySelector('script[src*="shared/js/membros.js"]');
    if (!script) return '../shared/data/membros.json';
    return script.getAttribute('src').replace('js/membros.js', 'data/membros.json');
  }

  function getSharedBase() {
    var script = document.querySelector('script[src*="shared/js/membros.js"]');
    if (!script) return '../shared/';
    return script.getAttribute('src').replace('js/membros.js', '');
  }

  function renderMember(member, sharedBase, index) {
    var moto = member.moto || {};
    var photo = sharedBase + (member.photo || 'img/profile-pic.jpg');
    var motoImg = sharedBase + (moto.image || member.photo || 'img/hero.jpg');
    var side = index % 2 === 1 ? ' membro--flip' : '';

    var meta = [];
    if (member.role) meta.push(escapeHtml(member.role));
    if (member.city) meta.push(escapeHtml(member.city));
    if (member.since) meta.push('Desde ' + escapeHtml(member.since));

    var motoMeta = [];
    if (moto.year) motoMeta.push(escapeHtml(moto.year));
    if (moto.type) motoMeta.push(escapeHtml(moto.type));
    if (moto.acquired) motoMeta.push('Adquirida em ' + escapeHtml(moto.acquired));

    var nickname = moto.nickname
      ? '<span class="membro__moto-nick">“' + escapeHtml(moto.nickname) + '”</span>'
      : '';

    return (
      '<article class="membro' + side + '" id="membro-' + escapeHtml(member.id) + '" data-member-id="' + escapeHtml(member.id) + '">' +
        '<div class="membro__portrait">' +
          '<img src="' + escapeHtml(photo) + '" alt="' + escapeHtml(member.name) + '" loading="lazy" width="480" height="600">' +
        '</div>' +
        '<div class="membro__content">' +
          '<header class="membro__head">' +
            '<p class="membro__meta">' + meta.join(' · ') + '</p>' +
            '<h2 class="membro__name">' + escapeHtml(member.name) + '</h2>' +
            (member.bio ? '<p class="membro__bio">' + escapeHtml(member.bio) + '</p>' : '') +
          '</header>' +
          '<div class="membro__moto">' +
            '<div class="membro__moto-media">' +
              '<img src="' + escapeHtml(motoImg) + '" alt="' + escapeHtml(moto.name || 'Moto') + ' de ' + escapeHtml(member.name) + '" loading="lazy" width="640" height="400">' +
            '</div>' +
            '<div class="membro__moto-body">' +
              '<p class="membro__moto-label">A máquina</p>' +
              '<h3 class="membro__moto-name">' + escapeHtml(moto.name || 'Moto') + ' ' + nickname + '</h3>' +
              (motoMeta.length ? '<p class="membro__moto-meta">' + motoMeta.join(' · ') + '</p>' : '') +
              (moto.story
                ? '<div class="membro__story">' +
                    '<p class="membro__story-label">História da moto</p>' +
                    '<p class="membro__story-text">' + escapeHtml(moto.story) + '</p>' +
                  '</div>'
                : '') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function render(containerId) {
    var container = document.getElementById(containerId || 'membros-list');
    if (!container) return Promise.resolve();

    var sharedBase = getSharedBase();

    return fetch(getDataUrl())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var intro = document.querySelector('.membros__intro');
        var note = document.querySelector('.membros__note');
        if (intro && data.intro) intro.textContent = data.intro;
        if (note && data.note) note.textContent = data.note;

        var members = data.members || [];
        container.innerHTML = members.map(function (m, i) {
          return renderMember(m, sharedBase, i);
        }).join('');

        if (window.ArcanjosReveal && typeof ArcanjosReveal.refresh === 'function') {
          ArcanjosReveal.refresh();
        }
      })
      .catch(function () {
        container.innerHTML = '<p class="membros__intro">Lista de irmãos temporariamente indisponível. Consulte a sede Village.</p>';
      });
  }

  function init(containerId) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        render(containerId);
      });
    } else {
      render(containerId);
    }
  }

  return { init: init, render: render };
})();
