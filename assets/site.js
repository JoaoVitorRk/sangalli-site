/* Diogo Sangalli · site — JS sem dependências.
   Tudo funciona sem JS; aqui só o que melhora: cabeçalho, menu, entrada suave, parallax, vídeo no card. */
(function () {
  var html = document.documentElement;
  html.classList.add('js');
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cabeçalho: transparente no topo, vidro escuro ao rolar */
  var cab = document.querySelector('.cab');
  function rolou() { if (cab) cab.classList.toggle('rolou', (window.scrollY || 0) > 40); }
  window.addEventListener('scroll', rolou, { passive: true });
  rolou();

  /* Menu de tela cheia */
  var menu = document.querySelector('.menu');
  var abrir = document.querySelector('[data-abre-menu]');
  function setMenu(aberto) {
    if (!menu) return;
    menu.classList.toggle('aberto', aberto);
    document.body.classList.toggle('travado', aberto);
    if (abrir) abrir.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    var conteudo = document.querySelectorAll('main, .cab, footer');
    for (var i = 0; i < conteudo.length; i++) { if (aberto) conteudo[i].setAttribute('inert', ''); else conteudo[i].removeAttribute('inert'); }
    var f = menu.querySelector('button[data-fecha-menu]');
    if (aberto && f) f.focus(); else if (!aberto && abrir) abrir.focus();
  }
  if (abrir) abrir.addEventListener('click', function () { setMenu(true); });
  document.querySelectorAll('[data-fecha-menu]').forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && menu.classList.contains('aberto')) setMenu(false); });

  /* Entrada suave (a página fica completa em repouso: quem não rola vê tudo) */
  var alvos = document.querySelectorAll('.rv');
  function mostraTudo() { alvos.forEach(function (a) { a.classList.add('in'); }); }
  if (!('IntersectionObserver' in window) || reduz) { mostraTudo(); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    alvos.forEach(function (a) { io.observe(a); });
    setTimeout(mostraTudo, 4000);
  }

  /* Parallax leve: só desktop e sem movimento reduzido */
  var px = [].slice.call(document.querySelectorAll('[data-parallax]'));
  if (px.length && !reduz && window.matchMedia('(min-width: 861px)').matches) {
    var pedido = false;
    function move() {
      pedido = false;
      var vh = window.innerHeight;
      px.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var f = parseFloat(el.getAttribute('data-parallax')) || 0;
        var d = (r.top + r.height / 2 - vh / 2) * f;
        el.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0) scale(1.08)';
      });
    }
    window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(move); } }, { passive: true });
    move();
  }

  /* Vídeo dentro do card: só baixa ao tocar; um por vez */
  var tocandoAgora = null;
  document.querySelectorAll('.video-card').forEach(function (card) {
    var btn = card.querySelector('.tocar');
    var fecha = card.querySelector('.fechar');
    var src = card.getAttribute('data-src');
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
      vv.preload = 'metadata'; vv.src = src;
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
