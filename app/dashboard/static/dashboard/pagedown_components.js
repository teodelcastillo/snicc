/**
 * Componentes listos para usar en el editor Markdown (Pagedown).
 * Añade botones entre "listas" y "undo/redo" en la barra del editor.
 * Usa un modal propio para pedir URL y texto del botón (sin prompt nativo).
 */
(function () {
  'use strict';

  var MODAL_ID = 'dashboard-link-button-modal';
  var MODAL_DESPLEGABLE_ID = 'dashboard-desplegable-modal';
  var MODAL_DIAGRAMA_ID = 'dashboard-diagrama-modal';
  var BACKDROP_ID = 'dashboard-link-button-modal-backdrop';
  var BACKDROP_DESPLEGABLE_ID = 'dashboard-desplegable-modal-backdrop';
  var BACKDROP_DIAGRAMA_ID = 'dashboard-diagrama-modal-backdrop';
  var currentTextarea = null;
  var modalEl = null;
  var modalDesplegableEl = null;
  var modalDiagramaEl = null;
  var backdropEl = null;
  var backdropDesplegableEl = null;
  var backdropDiagramaEl = null;

  var DIAGRAMA_COLORES = [
    { nombre: 'Púrpura oscuro', valor: '#262C51' },
    { nombre: 'Azul', valor: '#2E6695' },
    { nombre: 'Azul medio', valor: '#5B8DB8' },
    { nombre: 'Naranja / Amarillo', valor: '#E7BA61' },
    { nombre: 'Gris púrpura', valor: '#4A4E69' },
    { nombre: 'Rosa claro', valor: '#E8D5D5' },
    { nombre: 'Lila claro', valor: '#C5CAE9' },
    { nombre: 'Celeste claro', valor: '#B3E5FC' }
  ];

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
   * Crea el modal para "Insertar diagrama circular" (una sola vez).
   */
  function getOrCreateDiagramaModal() {
    if (modalDiagramaEl) return modalDiagramaEl;

    var mid = MODAL_DIAGRAMA_ID;
    var modal = document.createElement('div');
    modal.id = mid;
    modal.className = 'modal fade dashboard-component-modal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', mid + '-title');

    var colorOptions = DIAGRAMA_COLORES.map(function (c) {
      return '<option value="' + escapeHtml(c.valor) + '">' + escapeHtml(c.nombre) + '</option>';
    }).join('');

    modal.innerHTML =
      '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h5 class="modal-title" id="' + mid + '-title">Insertar diagrama circular</h5>' +
            '<button type="button" class="btn-close" data-dismiss aria-label="Cerrar"></button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="mb-3">' +
              '<label for="' + mid + '-titulo" class="form-label">Título del diagrama (opcional)</label>' +
              '<input type="text" class="form-control" id="' + mid + '-titulo" placeholder="Ej: Gabinete Nacional de Cambio Climático (GNCC)">' +
            '</div>' +
            '<div class="mb-3 form-check">' +
              '<input type="checkbox" class="form-check-input" id="' + mid + '-con-centro">' +
              '<label class="form-check-label" for="' + mid + '-con-centro">Incluir círculo central</label>' +
            '</div>' +
            '<div id="' + mid + '-centro-campos" class="mb-3" style="display:none;">' +
              '<div class="row">' +
                '<div class="col-md-8"><label class="form-label">Texto del centro</label><input type="text" class="form-control" id="' + mid + '-centro-texto" placeholder="Ej: Reunión de Ministros"></div>' +
                '<div class="col-md-4"><label class="form-label">Color</label><select class="form-select" id="' + mid + '-centro-color">' + colorOptions + '</select></div>' +
              '</div>' +
            '</div>' +
            '<div class="mb-2 d-flex justify-content-between align-items-center">' +
              '<label class="form-label mb-0">Nodos (círculos)</label>' +
              '<button type="button" class="btn btn-sm btn-outline-primary" id="' + mid + '-add-nodo">Añadir nodo</button>' +
            '</div>' +
            '<div id="' + mid + '-nodos" class="mb-3"></div>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-dismiss>Cancelar</button>' +
            '<button type="button" class="btn btn-primary btn-azul-claro" id="' + mid + '-insert">Insertar</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    var tituloInput = modal.querySelector('#' + mid + '-titulo');
    var conCentroCheck = modal.querySelector('#' + mid + '-con-centro');
    var centroCampos = modal.querySelector('#' + mid + '-centro-campos');
    var centroTexto = modal.querySelector('#' + mid + '-centro-texto');
    var centroColor = modal.querySelector('#' + mid + '-centro-color');
    var nodosContainer = modal.querySelector('#' + mid + '-nodos');
    var addNodoBtn = modal.querySelector('#' + mid + '-add-nodo');
    var insertBtn = modal.querySelector('#' + mid + '-insert');
    var closeButtons = modal.querySelectorAll('[data-dismiss]');

    conCentroCheck.addEventListener('change', function () {
      centroCampos.style.display = this.checked ? 'block' : 'none';
    });

    var nodoIndex = 0;
    function addNodoRow() {
      var id = nodoIndex++;
      var colorOpts = DIAGRAMA_COLORES.map(function (c) {
        return '<option value="' + escapeHtml(c.valor) + '">' + escapeHtml(c.nombre) + '</option>';
      }).join('');
      var row = document.createElement('div');
      row.className = 'border rounded p-2 mb-2 snicc-diagrama-nodo-row';
      row.dataset.nodoId = id;
      row.innerHTML =
        '<div class="row align-items-start">' +
          '<div class="col-md-4"><label class="form-label small">Texto del nodo</label><input type="text" class="form-control form-control-sm" name="nodo-texto" placeholder="Ej: CAE"></div>' +
          '<div class="col-md-2"><label class="form-label small">Color</label><select class="form-select form-select-sm" name="nodo-color">' + colorOpts + '</select></div>' +
          '<div class="col-md-5"><label class="form-label small">Contenido al hacer clic (tooltip/modal)</label><textarea class="form-control form-control-sm" name="nodo-contenido" rows="2" placeholder="Texto o HTML que se muestra al clickear"></textarea></div>' +
          '<div class="col-md-1"><label class="form-label small">&nbsp;</label><button type="button" class="btn btn-sm btn-outline-danger d-block" name="nodo-quitar">Quitar</button></div>' +
        '</div>';
      row.querySelector('[name="nodo-quitar"]').addEventListener('click', function () {
        row.remove();
      });
      nodosContainer.appendChild(row);
    }

    addNodoBtn.addEventListener('click', addNodoRow);

    function closeDiagrama() {
      modal.classList.remove('show');
      modal.style.display = '';
      if (backdropDiagramaEl && backdropDiagramaEl.parentNode) {
        backdropDiagramaEl.parentNode.removeChild(backdropDiagramaEl);
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

    function doInsertDiagrama() {
      var nodos = [];
      nodosContainer.querySelectorAll('.snicc-diagrama-nodo-row').forEach(function (row) {
        var texto = (row.querySelector('[name="nodo-texto"]').value || '').trim();
        if (!texto) return;
        nodos.push({
          texto: texto,
          color: row.querySelector('[name="nodo-color"]').value || DIAGRAMA_COLORES[0].valor,
          contenido: (row.querySelector('[name="nodo-contenido"]').value || '').trim()
        });
      });
      if (nodos.length === 0) {
        nodosContainer.focus();
        return;
      }
      if (!currentTextarea) { closeDiagrama(); return; }

      var titulo = (tituloInput.value || '').trim();
      var conCentro = conCentroCheck.checked;
      var centroT = conCentro ? (centroTexto.value || '').trim() : '';
      var centroC = conCentro ? (centroColor.value || DIAGRAMA_COLORES[0].valor) : '';

      var diagramId = 'snicc-diagrama-' + Date.now();
      var wrapperW = 360;
      var wrapperH = 360;
      var centerX = wrapperW / 2;
      var centerY = wrapperH / 2;
      var radius = 110;
      var nodeSize = 72;
      var nodeHalf = nodeSize / 2;
      var centerSize = 100;
      var centerHalf = centerSize / 2;

      var n = nodos.length;
      var startAngle = -90;
      var html = '<div class="snicc-diagrama-circular" id="' + diagramId + '" style="max-width:100%; margin:1.5rem auto;">';
      if (titulo) {
        html += '<h3 class="snicc-diagrama-titulo" style="text-align:center; color:#262C51; font-size:1.125rem; margin-bottom:1.25rem;">' + escapeHtml(titulo) + '</h3>';
      }
      html += '<div class="snicc-diagrama-wrapper" style="position:relative; width:' + wrapperW + 'px; height:' + wrapperH + 'px; margin:0 auto;">';

      if (conCentro && centroT) {
        html += '<div class="snicc-diagrama-centro" style="position:absolute; left:' + (centerX - centerHalf) + 'px; top:' + (centerY - centerHalf) + 'px; width:' + centerSize + 'px; height:' + centerSize + 'px; border-radius:50%; background-color:' + escapeHtml(centroC) + '; color:#fff; display:flex; align-items:center; justify-content:center; text-align:center; padding:0.5rem; font-size:0.85rem; font-weight:600; z-index:2;">' + escapeHtml(centroT) + '</div>';
      }

      nodos.forEach(function (nod, i) {
        var angleDeg = startAngle + (360 / n) * i;
        var angleRad = (angleDeg * Math.PI) / 180;
        var x = centerX + radius * Math.cos(angleRad) - nodeHalf;
        var y = centerY + radius * Math.sin(angleRad) - nodeHalf;
        var modalId = diagramId + '-modal-' + i;
        html += '<button type="button" class="snicc-diagrama-nodo border-0 rounded-circle text-white text-center d-flex align-items-center justify-content-center" style="position:absolute; left:' + x + 'px; top:' + y + 'px; width:' + nodeSize + 'px; height:' + nodeSize + 'px; background-color:' + escapeHtml(nod.color) + '; font-size:0.75rem; font-weight:500; z-index:3; cursor:pointer; text-decoration:none;" data-bs-toggle="modal" data-bs-target="#' + modalId + '" title="' + escapeHtml(nod.contenido ? 'Ver más' : '') + '">' + escapeHtml(nod.texto) + '</button>';
      });
      html += '</div>';

      nodos.forEach(function (nod, i) {
        var modalId = diagramId + '-modal-' + i;
        var contenidoHtml = nod.contenido ? (nod.contenido.indexOf('<') >= 0 ? nod.contenido : '<p class="mb-0">' + escapeHtml(nod.contenido).replace(/\n/g, '<br>') + '</p>') : '<p class="mb-0 text-muted">Sin contenido.</p>';
        html += '<div class="modal fade snicc-diagrama-modal" id="' + modalId + '" tabindex="-1" aria-hidden="true">' +
          '<div class="modal-dialog modal-dialog-centered modal-sm">' +
            '<div class="modal-content" style="border-radius:16px;">' +
              '<div class="modal-header py-2">' +
                '<h6 class="modal-title">' + escapeHtml(nod.texto) + '</h6>' +
                '<button type="button" class="btn-close btn-close-sm" data-bs-dismiss="modal" aria-label="Cerrar"></button>' +
              '</div>' +
              '<div class="modal-body py-2 snicc-diagrama-modal-body" style="font-size:1rem;">' + contenidoHtml + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      });

      html += '</div>';

      insertAtCursor(currentTextarea, html);

      tituloInput.value = '';
      conCentroCheck.checked = false;
      centroCampos.style.display = 'none';
      centroTexto.value = '';
      centroColor.selectedIndex = 0;
      nodosContainer.innerHTML = '';
      nodoIndex = 0;
      closeDiagrama();
    }

    insertBtn.addEventListener('click', doInsertDiagrama);
    closeButtons.forEach(function (btn) {
      btn.addEventListener('click', closeDiagrama);
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeDiagrama();
    });

    backdropDiagramaEl = document.createElement('div');
    backdropDiagramaEl.id = BACKDROP_DIAGRAMA_ID;
    backdropDiagramaEl.className = 'modal-backdrop fade show dashboard-component-modal-backdrop';
    backdropDiagramaEl.setAttribute('aria-hidden', 'true');
    backdropDiagramaEl.addEventListener('click', closeDiagrama);

    modal._componentClose = closeDiagrama;
    modalDiagramaEl = modal;
    return modal;
  }

  function openDiagramaModal(textarea) {
    var modal = getOrCreateDiagramaModal();
    currentTextarea = textarea;
    var mid = MODAL_DIAGRAMA_ID;
    var nodosContainer = modal.querySelector('#' + mid + '-nodos');
    if (nodosContainer.children.length === 0) {
      modal.querySelector('#' + mid + '-add-nodo').click();
      modal.querySelector('#' + mid + '-add-nodo').click();
    }
    modal.style.display = 'block';
    modal.offsetHeight;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    if (!backdropDiagramaEl.parentNode) {
      document.body.appendChild(backdropDiagramaEl);
    }
    var escapeHandler = function (e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        if (modal._componentClose) modal._componentClose();
      }
    };
    modal._escapeHandler = escapeHandler;
    document.addEventListener('keydown', escapeHandler);
  }

  function createDiagrama(textarea) {
    openDiagramaModal(textarea);
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

    // Botón 3: diagrama circular (300px)
    var liDiagrama = document.createElement('li');
    liDiagrama.className = 'wmd-button wmd-component-button';
    liDiagrama.id = 'wmd-component-diagrama-button' + (textarea.id ? '-' + textarea.id : '');
    liDiagrama.title = 'Insertar diagrama circular (nodos con tooltip/modal al hacer clic)';
    liDiagrama.style.left = (ourLeft + shiftBy + shiftBy) + 'px';
    liDiagrama.style.width = '20px';
    liDiagrama.style.height = '20px';
    liDiagrama.style.cursor = 'pointer';
    liDiagrama.style.listStyle = 'none';
    liDiagrama.style.position = 'absolute';
    liDiagrama.style.display = 'inline-block';
    liDiagrama.setAttribute('aria-label', 'Insertar diagrama circular');

    var spanDiagrama = document.createElement('span');
    spanDiagrama.className = 'wmd-component-icon wmd-component-diagrama';
    spanDiagrama.setAttribute('role', 'img');
    spanDiagrama.setAttribute('aria-hidden', 'true');
    spanDiagrama.textContent = '\u25CB';
    spanDiagrama.style.fontSize = '14px';
    spanDiagrama.style.lineHeight = '20px';
    spanDiagrama.style.display = 'inline-block';
    spanDiagrama.style.width = '20px';
    spanDiagrama.style.textAlign = 'center';
    liDiagrama.appendChild(spanDiagrama);

    liDiagrama.addEventListener('click', function (e) {
      e.preventDefault();
      createDiagrama(textarea);
    });

    liDesp.parentNode.insertBefore(liDiagrama, liDesp.nextSibling);

    // Desplazar todos los elementos que van después en el DOM (heading, hr, spacer3, undo, redo) 75px (tres botones)
    var children = Array.prototype.slice.call(buttonRow.querySelectorAll('li'));
    var lastComponentIndex = children.indexOf(liDiagrama);
    children.forEach(function (child, index) {
      if (index <= lastComponentIndex) return;
      var left = child.style.left || (window.getComputedStyle && window.getComputedStyle(child).left) || '';
      var num = parseInt(left, 10);
      if (!isNaN(num)) {
        child.style.left = (num + shiftBy + shiftBy + shiftBy) + 'px';
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
