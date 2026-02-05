/**
 * Componentes listos para usar en el editor Markdown (Pagedown).
 * Añade botones entre "listas" y "undo/redo" en la barra del editor.
 * Usa un modal propio para pedir URL y texto del botón (sin prompt nativo).
 */
(function () {
  'use strict';

  var MODAL_ID = 'dashboard-link-button-modal';
  var MODAL_DESPLEGABLE_ID = 'dashboard-desplegable-modal';
  var BACKDROP_ID = 'dashboard-link-button-modal-backdrop';
  var BACKDROP_DESPLEGABLE_ID = 'dashboard-desplegable-modal-backdrop';
  var currentTextarea = null;
  var modalEl = null;
  var modalDesplegableEl = null;
  var backdropEl = null;
  var backdropDesplegableEl = null;

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Obtiene la URL del endpoint de subida de imágenes (mismo que Pagedown).
   */
  function getImageUploadUrl() {
    var input = document.querySelector('.pagedown-image-upload .file-input[data-action]');
    return (input && input.getAttribute('data-action')) || '/pagedown/image-upload/';
  }

  /**
   * Sube un archivo de imagen al servidor y llama a callback(url) o callback(null, errorMsg).
   */
  function uploadImage(file, callback) {
    var url = getImageUploadUrl();
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    formData.append('image', file);

    xhr.open('POST', url, true);
    xhr.onload = function () {
      if (xhr.status !== 200) {
        callback(null, 'Error al subir: ' + (xhr.statusText || xhr.status));
        return;
      }
      try {
        var resp = JSON.parse(xhr.responseText);
        if (resp.success && resp.url) {
          callback(resp.url);
        } else {
          var err = resp.error && resp.error.image ? resp.error.image.join(' ') : (resp.error || 'Error desconocido');
          callback(null, err);
        }
      } catch (e) {
        callback(null, 'Error al leer la respuesta');
      }
    };
    xhr.onerror = function () { callback(null, 'Error de red'); };
    xhr.send(formData);
  }

  /**
   * Inserta en el textarea el snippet en la posición del cursor y dispara input para actualizar preview.
   */
  function insertAtCursor(textarea, snippet) {
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var value = textarea.value;
    textarea.value = value.slice(0, start) + snippet + value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
    textarea.focus();
    if (typeof Event !== 'undefined') {
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Crea el modal para "Botón de enlace" (una sola vez) y lo devuelve.
   */
  function getOrCreateModal() {
    if (modalEl) return modalEl;

    var modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'modal fade dashboard-component-modal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', MODAL_ID + '-title');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML =
      '<div class="modal-dialog modal-dialog-centered">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h5 class="modal-title" id="' + MODAL_ID + '-title">Insertar botón de enlace</h5>' +
            '<button type="button" class="btn-close" data-dismiss aria-label="Cerrar"></button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="mb-3">' +
              '<label for="' + MODAL_ID + '-url" class="form-label">URL del enlace</label>' +
              '<input type="url" class="form-control" id="' + MODAL_ID + '-url" placeholder="https://ejemplo.gob.ar/documento.pdf" autocomplete="url">' +
            '</div>' +
            '<div class="mb-3">' +
              '<label for="' + MODAL_ID + '-label" class="form-label">Texto del botón</label>' +
              '<input type="text" class="form-control" id="' + MODAL_ID + '-label" placeholder="Descargá el documento" autocomplete="off">' +
            '</div>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-dismiss>Cancelar</button>' +
            '<button type="button" class="btn btn-primary btn-azul-claro" id="' + MODAL_ID + '-insert">Insertar</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    modalEl = modal;

    var urlInput = modal.querySelector('#' + MODAL_ID + '-url');
    var labelInput = modal.querySelector('#' + MODAL_ID + '-label');
    var insertBtn = modal.querySelector('#' + MODAL_ID + '-insert');
    var closeButtons = modal.querySelectorAll('[data-dismiss]');

    function close() {
      modal.classList.remove('show');
      modal.style.display = '';
      if (backdropEl && backdropEl.parentNode) {
        backdropEl.parentNode.removeChild(backdropEl);
      }
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (modal._escapeHandler) {
        document.removeEventListener('keydown', modal._escapeHandler);
        modal._escapeHandler = null;
      }
      currentTextarea = null;
    }

    function doInsert() {
      var url = (urlInput.value || '').trim();
      var label = (labelInput.value || '').trim();
      if (!url) {
        urlInput.focus();
        return;
      }
      if (currentTextarea) {
        var snippet = '<a href="' + escapeHtml(url) + '" target="_blank" class="btn btn-azul-claro btn-small">' + escapeHtml(label || 'Enlace') + '</a>';
        insertAtCursor(currentTextarea, snippet);
      }
      urlInput.value = '';
      labelInput.value = 'https://';
      close();
    }

    insertBtn.addEventListener('click', doInsert);
    urlInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); doInsert(); }
    });
    labelInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); doInsert(); }
    });

    closeButtons.forEach(function (btn) {
      btn.addEventListener('click', close);
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    backdropEl = document.createElement('div');
    backdropEl.id = BACKDROP_ID;
    backdropEl.className = 'modal-backdrop fade show dashboard-component-modal-backdrop';
    backdropEl.setAttribute('aria-hidden', 'true');
    backdropEl.addEventListener('click', close);

    modal._componentClose = close;
    return modal;
  }

  function openLinkButtonModal(textarea) {
    var modal = getOrCreateModal();
    currentTextarea = textarea;
    var urlInput = modal.querySelector('#' + MODAL_ID + '-url');
    var labelInput = modal.querySelector('#' + MODAL_ID + '-label');
    urlInput.value = 'https://';
    labelInput.value = '';
    modal.style.display = 'block';
    modal.offsetHeight; // reflow
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    if (!backdropEl.parentNode) {
      document.body.appendChild(backdropEl);
    }
    var escapeHandler = function (e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        if (modal._componentClose) modal._componentClose();
      }
    };
    modal._escapeHandler = escapeHandler;
    document.addEventListener('keydown', escapeHandler);
    setTimeout(function () {
      urlInput.focus();
      urlInput.select();
    }, 100);
  }

  /**
   * Abre el modal para insertar el botón de enlace (enlace con clase btn btn-azul-claro btn-small).
   */
  function createLinkButton(textarea) {
    openLinkButtonModal(textarea);
  }

  /**
   * Crea el modal para "Insertar desplegable" (una sola vez).
   */
  function getOrCreateDesplegableModal() {
    if (modalDesplegableEl) return modalDesplegableEl;

    var mid = MODAL_DESPLEGABLE_ID;
    var modal = document.createElement('div');
    modal.id = mid;
    modal.className = 'modal fade dashboard-component-modal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', mid + '-title');

    modal.innerHTML =
      '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h5 class="modal-title" id="' + mid + '-title">Insertar desplegable</h5>' +
            '<button type="button" class="btn-close" data-dismiss aria-label="Cerrar"></button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="mb-3">' +
              '<label for="' + mid + '-titulo" class="form-label">Título del desplegable</label>' +
              '<input type="text" class="form-control" id="' + mid + '-titulo" placeholder="Ej: Disminución en frecuencia e intensidad de precipitación" autocomplete="off">' +
            '</div>' +
            '<div class="mb-3">' +
              '<label for="' + mid + '-icono-file" class="form-label">Icono del encabezado (opcional)</label>' +
              '<input type="file" class="form-control" id="' + mid + '-icono-file" accept="image/*">' +
              '<div class="dashboard-upload-feedback mt-1" id="' + mid + '-icono-feedback"></div>' +
            '</div>' +
            '<div class="mb-3">' +
              '<label for="' + mid + '-contenido" class="form-label">Contenido (puede incluir HTML, ej. &lt;strong&gt;, &lt;p&gt;)</label>' +
              '<textarea class="form-control" id="' + mid + '-contenido" rows="5" placeholder="Ej: Impacto directo: texto...&#10;&#10;Impacto indirecto: texto..."></textarea>' +
            '</div>' +
            '<div class="mb-3">' +
              '<label for="' + mid + '-imagen-file" class="form-label">Imagen en el contenido (opcional)</label>' +
              '<input type="file" class="form-control" id="' + mid + '-imagen-file" accept="image/*">' +
              '<div class="dashboard-upload-feedback mt-1" id="' + mid + '-imagen-feedback"></div>' +
            '</div>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-dismiss>Cancelar</button>' +
            '<button type="button" class="btn btn-primary btn-azul-claro" id="' + mid + '-insert">Insertar</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    var tituloInput = modal.querySelector('#' + mid + '-titulo');
    var iconoFileInput = modal.querySelector('#' + mid + '-icono-file');
    var iconoFeedback = modal.querySelector('#' + mid + '-icono-feedback');
    var contenidoInput = modal.querySelector('#' + mid + '-contenido');
    var imagenFileInput = modal.querySelector('#' + mid + '-imagen-file');
    var imagenFeedback = modal.querySelector('#' + mid + '-imagen-feedback');
    var insertBtn = modal.querySelector('#' + mid + '-insert');
    var closeButtons = modal.querySelectorAll('[data-dismiss]');

    modal._iconoUrl = '';
    modal._imagenUrl = '';

    function closeDesplegable() {
      modal.classList.remove('show');
      modal.style.display = '';
      if (backdropDesplegableEl && backdropDesplegableEl.parentNode) {
        backdropDesplegableEl.parentNode.removeChild(backdropDesplegableEl);
      }
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (modal._escapeHandler) {
        document.removeEventListener('keydown', modal._escapeHandler);
        modal._escapeHandler = null;
      }
      modal._iconoUrl = '';
      modal._imagenUrl = '';
      iconoFileInput.value = '';
      imagenFileInput.value = '';
      iconoFeedback.innerHTML = '';
      imagenFeedback.innerHTML = '';
      currentTextarea = null;
    }

    function showUploadFeedback(feedbackEl, fileName, url, onRemove) {
      feedbackEl.innerHTML = '<span class="text-success small">Subido: ' + escapeHtml(fileName) + '</span> ' +
        '<button type="button" class="btn btn-link btn-sm p-0 ms-1" data-remove>Quitar</button>';
      feedbackEl.querySelector('[data-remove]').addEventListener('click', function () {
        onRemove();
        feedbackEl.innerHTML = '';
      });
    }

    iconoFileInput.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file) return;
      iconoFeedback.innerHTML = '<span class="text-muted small">Subiendo...</span>';
      uploadImage(file, function (url, err) {
        if (url) {
          modal._iconoUrl = url;
          showUploadFeedback(iconoFeedback, file.name, url, function () { modal._iconoUrl = ''; iconoFileInput.value = ''; });
        } else {
          iconoFeedback.innerHTML = '<span class="text-danger small">' + escapeHtml(err || 'Error') + '</span>';
        }
      });
    });

    imagenFileInput.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file) return;
      imagenFeedback.innerHTML = '<span class="text-muted small">Subiendo...</span>';
      uploadImage(file, function (url, err) {
        if (url) {
          modal._imagenUrl = url;
          showUploadFeedback(imagenFeedback, file.name, url, function () { modal._imagenUrl = ''; imagenFileInput.value = ''; });
        } else {
          imagenFeedback.innerHTML = '<span class="text-danger small">' + escapeHtml(err || 'Error') + '</span>';
        }
      });
    });

    function doInsertDesplegable() {
      var titulo = (tituloInput.value || '').trim();
      if (!titulo) {
        tituloInput.focus();
        return;
      }
      if (!currentTextarea) { closeDesplegable(); return; }

      var iconoUrl = modal._iconoUrl || '';
      var contenido = (contenidoInput.value || '').trim();
      var imagenUrl = modal._imagenUrl || '';

      var collapseId = 'snicc-collapse-' + Date.now();
      var tituloEsc = escapeHtml(titulo);

      var iconoBlock = '';
      if (iconoUrl) {
        iconoBlock =
          '<div class="snicc-desplegable-icono" style="width:40px; height:40px; flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center;">' +
            '<img src="' + escapeHtml(iconoUrl) + '" alt="" style="width:100%; height:100%; object-fit:contain;">' +
          '</div>';
      }

      var bodyContent = '';
      if (imagenUrl) {
        bodyContent += '<div class="snicc-desplegable-imagen mb-3"><img src="' + escapeHtml(imagenUrl) + '" alt=""></div>';
      }
      if (contenido) {
        if (contenido.indexOf('<') === -1) {
          bodyContent += contenido.split(/\n\n+/).map(function (p) {
            return '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>';
          }).join('');
        } else {
          bodyContent += contenido;
        }
      }

      var html =
        '<div class="card border shadow-sm mb-3 snicc-desplegable" style="border-color: rgba(38,44,81,0.15); border-radius:16px; overflow:hidden;">' +
          '<button class="card-header btn w-100 text-start d-flex align-items-center justify-content-between gap-3 collapsed snicc-desplegable-header" type="button" data-bs-toggle="collapse" data-bs-target="#' + collapseId + '" aria-expanded="false" aria-controls="' + collapseId + '" style="background:transparent; border:0; padding:1rem 1.25rem;">' +
            '<div class="d-flex align-items-center gap-3">' +
              iconoBlock +
              '<span class="fw-semibold" style="color:#262C51;">' + tituloEsc + '</span>' +
            '</div>' +
            '<i class="bi bi-chevron-down transition-all" style="color:#262C51;"></i>' +
          '</button>' +
          '<div id="' + collapseId + '" class="collapse">' +
            '<div class="card-body snicc-desplegable-body">' +
              bodyContent +
            '</div>' +
          '</div>' +
        '</div>';

      insertAtCursor(currentTextarea, html);

      tituloInput.value = '';
      contenidoInput.value = '';
      modal._iconoUrl = '';
      modal._imagenUrl = '';
      iconoFileInput.value = '';
      imagenFileInput.value = '';
      iconoFeedback.innerHTML = '';
      imagenFeedback.innerHTML = '';
      closeDesplegable();
    }

    insertBtn.addEventListener('click', doInsertDesplegable);
    closeButtons.forEach(function (btn) {
      btn.addEventListener('click', closeDesplegable);
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeDesplegable();
    });

    backdropDesplegableEl = document.createElement('div');
    backdropDesplegableEl.id = BACKDROP_DESPLEGABLE_ID;
    backdropDesplegableEl.className = 'modal-backdrop fade show dashboard-component-modal-backdrop';
    backdropDesplegableEl.setAttribute('aria-hidden', 'true');
    backdropDesplegableEl.addEventListener('click', closeDesplegable);

    modal._componentClose = closeDesplegable;
    modalDesplegableEl = modal;
    return modal;
  }

  function openDesplegableModal(textarea) {
    var modal = getOrCreateDesplegableModal();
    currentTextarea = textarea;
    var mid = MODAL_DESPLEGABLE_ID;
    var tituloInput = modal.querySelector('#' + mid + '-titulo');
    var iconoFileInput = modal.querySelector('#' + mid + '-icono-file');
    var iconoFeedback = modal.querySelector('#' + mid + '-icono-feedback');
    var contenidoInput = modal.querySelector('#' + mid + '-contenido');
    var imagenFileInput = modal.querySelector('#' + mid + '-imagen-file');
    var imagenFeedback = modal.querySelector('#' + mid + '-imagen-feedback');

    tituloInput.value = '';
    contenidoInput.value = '';
    modal._iconoUrl = '';
    modal._imagenUrl = '';
    if (iconoFileInput) iconoFileInput.value = '';
    if (imagenFileInput) imagenFileInput.value = '';
    if (iconoFeedback) iconoFeedback.innerHTML = '';
    if (imagenFeedback) imagenFeedback.innerHTML = '';

    modal.style.display = 'block';
    modal.offsetHeight; // reflow
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    if (!backdropDesplegableEl.parentNode) {
      document.body.appendChild(backdropDesplegableEl);
    }
    var escapeHandler = function (e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        if (modal._componentClose) modal._componentClose();
      }
    };
    modal._escapeHandler = escapeHandler;
    document.addEventListener('keydown', escapeHandler);
    setTimeout(function () { tituloInput.focus(); }, 100);
  }

  function createDesplegable(textarea) {
    openDesplegableModal(textarea);
  }

  /**
   * Añade los botones de componentes a la barra: inserta después del botón ulist y desplaza los siguientes.
   */
  function addComponentButtonsToWrapper(wrapper) {
    var buttonRow = wrapper.querySelector('.wmd-button-row');
    var textarea = wrapper.querySelector('.wmd-input');
    if (!buttonRow || !textarea) return;

    var ulistLi = buttonRow.querySelector('[id^="wmd-ulist-button"]');
    if (!ulistLi) return;

    // Botón 1: enlace (250px)
    var ourLeft = 250;
    var shiftBy = 25;

    var li = document.createElement('li');
    li.className = 'wmd-button wmd-component-button';
    li.id = 'wmd-component-link-button' + (textarea.id ? '-' + textarea.id : '');
    li.title = 'Insertar botón de enlace (estilo descarga)';
    li.style.left = ourLeft + 'px';
    li.style.width = '20px';
    li.style.height = '20px';
    li.style.cursor = 'pointer';
    li.style.listStyle = 'none';
    li.style.position = 'absolute';
    li.style.display = 'inline-block';
    li.setAttribute('aria-label', 'Insertar botón de enlace');

    var span = document.createElement('span');
    span.className = 'wmd-component-icon wmd-component-link';
    span.setAttribute('role', 'img');
    span.setAttribute('aria-hidden', 'true');
    span.textContent = '🔗';
    span.style.fontSize = '14px';
    span.style.lineHeight = '20px';
    span.style.display = 'inline-block';
    span.style.width = '20px';
    span.style.textAlign = 'center';
    li.appendChild(span);

    li.addEventListener('click', function (e) {
      e.preventDefault();
      createLinkButton(textarea);
    });

    ulistLi.parentNode.insertBefore(li, ulistLi.nextSibling);

    // Botón 2: desplegable (275px), justo después del de enlace
    var liDesp = document.createElement('li');
    liDesp.className = 'wmd-button wmd-component-button';
    liDesp.id = 'wmd-component-desplegable-button' + (textarea.id ? '-' + textarea.id : '');
    liDesp.title = 'Insertar desplegable (acordeón con título e icono opcional)';
    liDesp.style.left = (ourLeft + shiftBy) + 'px';
    liDesp.style.width = '20px';
    liDesp.style.height = '20px';
    liDesp.style.cursor = 'pointer';
    liDesp.style.listStyle = 'none';
    liDesp.style.position = 'absolute';
    liDesp.style.display = 'inline-block';
    liDesp.setAttribute('aria-label', 'Insertar desplegable');

    var spanDesp = document.createElement('span');
    spanDesp.className = 'wmd-component-icon wmd-component-desplegable';
    spanDesp.setAttribute('role', 'img');
    spanDesp.setAttribute('aria-hidden', 'true');
    spanDesp.textContent = '\u25BE';
    spanDesp.style.fontSize = '14px';
    spanDesp.style.lineHeight = '20px';
    spanDesp.style.display = 'inline-block';
    spanDesp.style.width = '20px';
    spanDesp.style.textAlign = 'center';
    spanDesp.style.letterSpacing = '-0.2em';
    liDesp.appendChild(spanDesp);

    liDesp.addEventListener('click', function (e) {
      e.preventDefault();
      createDesplegable(textarea);
    });

    li.parentNode.insertBefore(liDesp, li.nextSibling);

    // Desplazar todos los elementos que van después en el DOM (heading, hr, spacer3, undo, redo) 50px (dos botones)
    var children = Array.prototype.slice.call(buttonRow.querySelectorAll('li'));
    var lastComponentIndex = children.indexOf(liDesp);
    children.forEach(function (child, index) {
      if (index <= lastComponentIndex) return;
      var left = child.style.left || (window.getComputedStyle && window.getComputedStyle(child).left) || '';
      var num = parseInt(left, 10);
      if (!isNaN(num)) {
        child.style.left = (num + shiftBy + shiftBy) + 'px';
      }
    });
  }

  function init() {
    var wrappers = document.querySelectorAll('.wmd-wrapper');
    wrappers.forEach(addComponentButtonsToWrapper);
  }

  // Ejecutar después de que Pagedown haya creado los editores (window.onload en pagedown_init.js)
  if (document.readyState === 'complete') {
    setTimeout(init, 0);
  } else {
    window.addEventListener('load', function () {
      setTimeout(init, 0);
    });
  }
})();
