/* Diogo Sangalli · site — JS sem dependências.
   Tudo funciona sem JS; aqui só o que melhora: cabeçalho, menu, revelação, caneta, vídeo. */
(function () {
  var html = document.documentElement;
  html.classList.add('js');
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cabeçalho: escuro sobre a capa escura, papel ao rolar */
  var cab = document.querySelector('.cab');
  var capaEscura = document.querySelector('.capa.escura, .capa.home');
  function rolou() {
    if (!cab) return;
    var y = window.scrollY || 0;
    var limite = capaEscura ? Math.max(80, capaEscura.offsetHeight - 120) : 40;
    cab.classList.toggle('rolou', y > limite);
  }
  window.addEventListener('scroll', rolou, { passive: true });
  rolou();

  /* Menu de tela cheia */
  var menu = document.querySelector('.menu');
  var abrir = document.querySelector('[data-abre-menu]');
  var fechar = document.querySelector('[data-fecha-menu]');
  function setMenu(aberto) {
    if (!menu) return;
    menu.classList.toggle('aberto', aberto);
    document.body.classList.toggle('travado', aberto);
    if (abrir) abrir.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    var conteudo = document.querySelectorAll('main, .cab, footer');
    for (var i = 0; i < conteudo.length; i++) { if (aberto) conteudo[i].setAttribute('inert', ''); else conteudo[i].removeAttribute('inert'); }
    if (aberto && fechar) fechar.focus(); else if (!aberto && abrir) abrir.focus();
  }
  if (abrir) abrir.addEventListener('click', function () { setMenu(true); });
  if (fechar) fechar.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && menu.classList.contains('aberto')) setMenu(false); });

  /* Caneta: desenha o traço sob a palavra marcada, uma vez */
  document.querySelectorAll('.caneta').forEach(function (el) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 10');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M1.5 6.4 C 14 3.2, 30 8.1, 47 5.4 S 78 3.6, 98.5 5.9');
    svg.appendChild(p);
    el.appendChild(svg);
    try { var len = p.getTotalLength(); el.style.setProperty('--len', Math.ceil(len) + 8); } catch (e) {}
  });

  /* Revelação ao rolar */
  var alvos = document.querySelectorAll('.rv, .caneta');
  function mostraTudo() { alvos.forEach(function (a) { a.classList.add('in'); }); }
  if (!('IntersectionObserver' in window) || reduz) { mostraTudo(); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    alvos.forEach(function (a) { io.observe(a); });
    /* garantia: a página fica completa em repouso; quem rola cedo vê a entrada suave, quem não rola vê tudo */
    setTimeout(function () { alvos.forEach(function (a) { if (a.getBoundingClientRect().top < window.innerHeight) a.classList.add('in'); }); }, 700);
    setTimeout(mostraTudo, 2600);
  }

  /* Capa da home: vídeo só no desktop, sem economia de dados e sem movimento reduzido */
  var fundo = document.querySelector('.capa.home .fundo[data-video]');
  var conn = navigator.connection || {};
  if (fundo && !reduz && window.innerWidth >= 900 && !conn.saveData) {
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.poster = fundo.getAttribute('data-poster') || '';
    v.src = fundo.getAttribute('data-video');
    v.addEventListener('canplay', function () { fundo.classList.add('com-video'); });
    fundo.insertBefore(v, fundo.querySelector('.veu'));
    var play = v.play(); if (play && play.catch) play.catch(function () {});
    document.addEventListener('visibilitychange', function () { if (document.hidden) v.pause(); else { var p2 = v.play(); if (p2 && p2.catch) p2.catch(function () {}); } });
  }

  /* Vídeo dentro do card: só baixa ao tocar; um por vez */
  var cards = document.querySelectorAll('.video-card');
  var tocandoAgora = null;
  cards.forEach(function (card) {
    var btn = card.querySelector('.tocar');
    var fecha = card.querySelector('.fechar');
    var src = card.getAttribute('data-src');
    var legendas = card.getAttribute('data-legendas');
    function parar() {
      var vv = card.querySelector('video');
      if (vv) { vv.pause(); vv.remove(); }
      card.classList.remove('tocando');
      if (tocandoAgora === card) tocandoAgora = null;
    }
    function tocar() {
      if (tocandoAgora && tocandoAgora !== card) { tocandoAgora.querySelector('.fechar').click(); }
      var vv = document.createElement('video');
      vv.controls = true; vv.playsInline = true; vv.setAttribute('playsinline', '');
      vv.preload = 'metadata';
      vv.src = src;
      if (legendas) { var tr = document.createElement('track'); tr.kind = 'captions'; tr.srclang = 'pt'; tr.label = 'Português'; tr.src = legendas; vv.appendChild(tr); }
      card.appendChild(vv);
      card.classList.add('tocando');
      tocandoAgora = card;
      var p3 = vv.play(); if (p3 && p3.catch) p3.catch(function () {});
      vv.addEventListener('ended', parar);
    }
    if (btn) btn.addEventListener('click', tocar);
    if (fecha) fecha.addEventListener('click', parar);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && tocandoAgora) tocandoAgora.querySelector('.fechar').click(); });

  /* Ano no rodapé */
  document.querySelectorAll('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
