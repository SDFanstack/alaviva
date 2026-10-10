/* AlaViva — botón de compartir.
   Uso: <button class="btn btn-outline share-btn" data-title="..." data-text="..." [data-url="..."] [data-hash="galicia"]>Compartir</button>
   - Si el navegador tiene el menú nativo de compartir (móviles), se usa.
   - Si no, se despliega un menú con WhatsApp y "Copiar enlace".
   Funciona por delegación de eventos, así que sirve también para botones creados por JS. */
(function () {
  function urlDe(btn) {
    if (btn.dataset.url) return btn.dataset.url;
    return location.href.split('#')[0] + (btn.dataset.hash ? '#' + btn.dataset.hash : '');
  }

  function copiar(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto);
    }
    return new Promise(function (ok, fail) {
      var t = document.createElement('textarea');
      t.value = texto; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); }
      document.body.removeChild(t);
    });
  }

  function crearMenu(btn, datos) {
    var menu = document.createElement('div');
    menu.className = 'share-menu';
    menu.hidden = true;
    var wa = document.createElement('a');
    wa.className = 'btn btn-outline btn-sm';
    wa.target = '_blank'; wa.rel = 'noopener';
    wa.textContent = 'WhatsApp';
    var cp = document.createElement('button');
    cp.type = 'button'; cp.className = 'btn btn-outline btn-sm';
    cp.textContent = 'Copiar enlace';
    var estado = document.createElement('span');
    estado.className = 'share-status'; estado.setAttribute('role', 'status');
    menu.append(wa, cp, estado);
    cp.addEventListener('click', function () {
      copiar(menu.dataset.url).then(function () { estado.textContent = '¡Enlace copiado!'; },
                                    function () { estado.textContent = 'No se pudo copiar'; });
    });
    btn.insertAdjacentElement('afterend', menu);
    return { menu: menu, wa: wa, estado: estado };
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.share-btn');
    if (!btn) return;
    var datos = { title: btn.dataset.title || document.title, text: btn.dataset.text || '', url: urlDe(btn) };

    if (navigator.share) {
      navigator.share(datos).catch(function () { /* el usuario canceló */ });
      return;
    }
    var menu = btn.nextElementSibling;
    var refs;
    if (!menu || !menu.classList.contains('share-menu')) {
      refs = crearMenu(btn, datos);
      menu = refs.menu;
    } else {
      refs = { menu: menu, wa: menu.querySelector('a'), estado: menu.querySelector('.share-status') };
    }
    menu.dataset.url = datos.url;
    refs.wa.href = 'https://wa.me/?text=' + encodeURIComponent((datos.text ? datos.text + ' ' : '') + datos.url);
    refs.estado.textContent = '';
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
})();
