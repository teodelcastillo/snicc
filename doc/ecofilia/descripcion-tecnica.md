# SNICC — Descripción Técnica de la Aplicación

**Sistema Nacional de Información sobre Cambio Climático**

Fecha de elaboración: 10 de febrero de 2026

---

## 1. Descripción General

SNICC es un portal web de gestión de contenidos orientado a la información sobre cambio climático en Argentina. La plataforma permite la publicación de noticias, recursos, documentos de biblioteca, normativa, planes provinciales de respuesta y medidas climáticas. Soporta contenido multilingüe con versionado, autenticación por código de verificación por email, y un panel de edición para gestores de contenido.

---

## 2. Stack Tecnológico

### 2.1 Backend

| Tecnología | Versión / Detalle | Propósito |
|---|---|---|
| **Python** | 3.x (última disponible en imagen Docker) | Lenguaje principal |
| **Django** | >= 5.0 | Framework web (MTV: Model-Template-View) |
| **SQLite3** | Incluido en Python | Base de datos por defecto |
| **PostgreSQL** | Soportado (no activo) | Base de datos alternativa (configuración comentada en Docker Compose) |

### 2.2 Frontend

| Tecnología | Propósito |
|---|---|
| **HTML5 / CSS3 / JavaScript** | Estructura, estilos e interactividad |
| **Bootstrap** | Framework CSS para UI responsiva |
| **jQuery** | Manipulación del DOM y AJAX |
| **D3.js / C3.js** | Visualizaciones de datos |
| **Chart.js** | Gráficos |
| **bootstrap-select.js** | Selects avanzados con Bootstrap |

### 2.3 Herramientas de contenido

| Tecnología | Propósito |
|---|---|
| **Markdown** | Formato de autoría de contenido |
| **django-pagedown** | Widget de editor Markdown en el dashboard |

### 2.4 Librerías Python

| Paquete | Propósito |
|---|---|
| `django-cors-headers` | Manejo de CORS (Cross-Origin Resource Sharing) |
| `sqlparse` | Parsing de SQL |
| `markdown` | Renderizado de Markdown a HTML |
| `pandas` | Procesamiento de datos y generación de estadísticas |
| `django-renderpdf` | Generación de PDFs desde templates |
| `pypdf` | Manipulación y concatenación de PDFs |
| `ipython` | Shell interactivo para depuración |

### 2.5 DevOps e Infraestructura

| Tecnología | Propósito |
|---|---|
| **Docker** | Contenedorización de la aplicación |
| **Docker Compose** | Orquestación multi-contenedor (producción y desarrollo) |
| **Nginx** | Proxy inverso, servicio de archivos estáticos, terminación SSL |
| **SSL/TLS** | Certificados en directorio `cert/` (HTTPS en producción) |

### 2.6 Calidad de código

| Herramienta | Propósito |
|---|---|
| **Ruff** | Linter de Python (configurado en `pyproject.toml`, line-length=140) |

---

## 3. Arquitectura de la Aplicación

### 3.1 Patrón arquitectónico

La aplicación sigue el patrón **MTV (Model-Template-View)** de Django:

- **Models** (`models.py`): Capa de datos y lógica de negocio.
- **Templates** (`templates/`): Capa de presentación HTML.
- **Views** (`views.py`, `viewsv2.py`): Controladores que conectan datos con presentación.
- **URLs** (`urls.py`): Enrutamiento de peticiones HTTP a vistas.

### 3.2 Estructura de directorios

```
snicc/
├── app/                          # Directorio principal de la aplicación Django
│   ├── snicc/                    # Configuración del proyecto Django
│   │   ├── settings.py           # Configuración global
│   │   ├── urls.py               # Rutas raíz
│   │   ├── wsgi.py               # Punto de entrada WSGI (producción)
│   │   └── asgi.py               # Punto de entrada ASGI (async)
│   ├── main/                     # App: gestión de contenido principal
│   ├── user/                     # App: autenticación y usuarios
│   ├── dashboard/                # App: panel de edición
│   ├── measure/                  # App: medidas climáticas
│   ├── init/                     # Scripts de inicialización y datos CSV
│   └── manage.py                 # Script de gestión Django
├── doc/                          # Documentación
├── section/                      # Páginas HTML estáticas
├── md/                           # Documentos Markdown de contenido
├── cert/                         # Certificados SSL
├── requirements.txt              # Dependencias Python
├── pyproject.toml                # Configuración Ruff
├── Dockerfile                    # Imagen Docker de producción
├── docker-compose.yml            # Docker Compose producción
├── dev.docker-compose.yml        # Docker Compose desarrollo
├── nginx-config.conf             # Configuración Nginx
├── .env / dot.env                # Variables de entorno
└── legacy.db                     # Base de datos SQLite legacy
```

### 3.3 Puntos de entrada

| Punto de entrada | Descripción |
|---|---|
| `app/manage.py` | Script principal de gestión Django (migraciones, servidor de desarrollo, etc.) |
| `app/snicc/wsgi.py` | Aplicación WSGI para servidores de producción |
| `app/snicc/asgi.py` | Aplicación ASGI para soporte asíncrono |
| `docker-compose.yml` | Despliegue en producción (`docker compose up -d`) |
| `dev.docker-compose.yml` | Despliegue en desarrollo (`docker compose -f dev.docker-compose.yml up -d`) |

---

## 4. Módulos de la Aplicación (Apps Django)

### 4.1 `main` — Gestión de Contenido Principal

**Estado: ACTIVO**

Módulo central que gestiona el contenido del portal: publicaciones (noticias y recursos), libros de biblioteca, normativa, planes provinciales, enlaces externos e internos, y traducciones estáticas.

**Funcionalidades:**
- Publicaciones multilingües con versionado y categorías.
- Biblioteca de libros/documentos con autores y formatos.
- Normativa (leyes, decretos, resoluciones).
- Planes provinciales de respuesta con mapa interactivo.
- Enlaces internos y externos con traducciones.
- Sistema de traducción estática para interfaz de usuario.
- Perfiles temáticos (adaptación, mitigación, bosques, etc.).
- Buscador de contenido (posts, libros, normativa).

**Archivos clave:**
| Archivo | Descripción |
|---|---|
| `models.py` | Modelos: Post, Book, Plan, Regulation, Language, Profile, etc. |
| `viewsv2.py` | Vistas activas (v2): landing, post, search, library, regulations, etc. |
| `views.py` | Vistas legacy (v1) — ver sección de módulos obsoletos |
| `urls.py` / `urlsv2.py` | Rutas activas y legacy |
| `util.py` | Utilidades de scraping de traducciones |
| `templatetags/snicc_i18n.py` | Tags de template: traducciones (`ts`, `translate`) y filtro `semicolon_to_br` (punto y coma → salto de línea en metas por año) |
| `admin.py` | Configuración del panel de administración Django |

**Rutas activas (v2, prefijo `/main/`):**

| Ruta | Vista | Descripción |
|---|---|---|
| `/main/` | `landing` | Página de inicio con últimas noticias |
| `/main/post/<slug>` | `post` | Detalle de publicación con tabla de contenidos |
| `/main/search/` | `search` | Búsqueda de posts, libros y normativa |
| `/main/news/` | `news` | Listado de noticias con paginación |
| `/main/library/` | `library` | Catálogo de biblioteca |
| `/main/regulations/` | `regulations` | Listado de normativa |
| `/main/planes/` | `planes` | Mapa de planes provinciales |
| `/main/enlaces/` | `enlaces` | Listado de enlaces externos |
| `/main/staticpage/<path>` | `staticpage` | Páginas estáticas |
| `/main/staticpage/gestion-climatica/<path>` | `gc_staticpage` | Páginas de gestión climática |
| `/main/scrape` | `admin_scrape` | Admin: scraping de traducciones |

---

### 4.2 `measure` — Medidas Climáticas

**Estado: ACTIVO**

Módulo dedicado a la gestión, visualización y exportación de medidas climáticas nacionales. Incluye una estructura jerárquica de líneas estratégicas, acciones y medidas, con metadatos anuales y estados de implementación.

**Funcionalidades:**
- Listado y filtrado de medidas climáticas.
- Detalle de medida con campos dinámicos (JSON).
- Exportación a PDF (individual y múltiple) y CSV.
- Estadísticas de implementación (gráficos de barras apiladas, tortas).
- Caching de respuestas JSON para rendimiento.
- Gestión de metas por año (MeasureYearMeta).
- Informes de progreso (ProgressReport) y documentos metodológicos.
- Módulo MYE (Monitoreo y Evaluación).
- Flags de visibilidad por medida para controlar la UI.

**Ficha de detalle de medida (metas por año):**
- La **tarjeta "Metas por año"** renderiza solo el campo **descripción breve** de cada meta anual.
- La sección **Información general → Metas / Años** renderiza el campo **descripción** de cada meta anual.
- En ambos textos se aplica el filtro de template `semicolon_to_br` (en `main/templatetags/snicc_i18n.py`): el carácter `;` se convierte en salto de línea (`<br>`); el resto del texto se escapa para evitar XSS.

**Archivos clave:**
| Archivo | Descripción |
|---|---|
| `models.py` | Modelos: Measure, Line, Action, Pilar, Label, ImplementationStatus, etc. |
| `views.py` | Vistas: listado, detalle, filtros JSON, exportaciones |
| `load.py` | Scripts de carga de medidas desde CSV |
| `urls.py` | Rutas del módulo |
| `admin.py` | Configuración del admin |

**Rutas activas (prefijo `/measure/`):**

| Ruta | Vista | Descripción |
|---|---|---|
| `/measure/list/` | `measure_list` | Listado de medidas |
| `/measure/<id>/` | `measure_detail_view` | Detalle de medida |
| `/measure/<id>/pdf` | `one_measure_pdf` | PDF de una medida |
| `/measure/<id>/data.json` | `measure_fields` | Campos JSON de la medida |
| `/measure/filter.json` | `measure_filter_json` | Filtro de medidas (cacheado) |
| `/measure/filter-simple.json` | `measure_list_json` | Listado simple JSON |
| `/measure/details.json` | `filter_details` | Detalles de filtro (cacheado) |
| `/measure/lines.json` | `line_details` | Detalles de líneas (cacheado) |
| `/measure/action/<id>/` | `action_details` | Detalles de acción (cacheado) |
| `/measure/export.pdf` | `many_measures_pdf` | PDF múltiple |
| `/measure/export.csv` | `many_measures_csv` | Exportación CSV |
| `/measure/recalc/` | `measure_pdf_recalc` | Recalcular PDFs (staff) |
| `/measure/mye/` | `mye_overview` | Módulo MYE |

---

### 4.3 `user` — Autenticación y Usuarios

**Estado: ACTIVO**

Módulo que extiende el sistema de usuarios de Django con autenticación clásica mediante email y contraseña, gestión de perfiles y permisos de edición.

Además, mantiene lógica legacy para autenticación por código de verificación enviado por email, que actualmente no se usa en el flujo principal pero puede reactivarse por un equipo técnico futuro.

**Funcionalidades:**
- Registro de usuarios con selección de perfil temático.
- Login clásico mediante email y contraseña.
- Gestión de perfil de usuario (género, país, provincia, ciudad, teléfono, idioma).
- Control de acceso para editores (EditorAccess).
- Lógica de envío de emails de verificación y códigos temporales disponible para flujos opcionales (ej. verificación de correo o login sin contraseña).

**Archivos clave:**
| Archivo | Descripción |
|---|---|
| `models.py` | Modelos: User, UserCode, EditorAccess |
| `views.py` | Vistas: login clásico, registro, perfil, validación de código (legacy) |
| `email.py` | Servicio de envío de emails para códigos de verificación (legacy) |
| `countries.py` | Lista de países |
| `urls.py` | Rutas del módulo |

**Rutas activas (prefijo `/user/`):**

| Ruta | Vista | Descripción |
|---|---|---|
| `/user/login/` | `snicc_login` | Login por email y contraseña |
| `/user/register/` | `register` | Registro de usuario |
| `/user/register/profile/` | `register_profile` | Selección de perfil tras registro |
| `/user/profile/` | `profile` | Gestión de perfil |
| `/user/<case>/<id>/code/` | `validate_code` | Validación de código de verificación (flujo legacy / opcional) |

---

### 4.4 `dashboard` — Panel de Edición

**Estado: ACTIVO**

Módulo que proporciona una interfaz de edición de contenido para usuarios con rol de editor. Permite crear, editar, traducir y eliminar publicaciones, así como gestionar medidas climáticas.

**Funcionalidades:**
- Creación y edición de publicaciones (con editor Markdown).
- Traducción de publicaciones a múltiples idiomas.
- Historial de versiones y restauración.
- Comparación de versiones (diff).
- Eliminación de publicaciones (con permisos).
- Listado y gestión de publicaciones.
- Edición y previsualización de medidas climáticas.

**Archivos clave:**
| Archivo | Descripción |
|---|---|
| `views.py` | Vistas: edición de posts, traducciones, historial, medidas |
| `forms.py` | Formularios: PostForm, NewPostForm, PostVersionForm, MarkdownWidget |
| `urls.py` | Rutas del módulo |

**Rutas activas (prefijo `/editor/`):**

| Ruta | Vista | Descripción |
|---|---|---|
| `/editor/new/` | `post_edit` | Crear nueva publicación |
| `/editor/post/<id>/edit/` | `post_edit` | Editar publicación |
| `/editor/post/<id>/<lang>/edit/` | `edit_translation` | Editar traducción |
| `/editor/post/<id>/<lang>/history/` | `history` | Historial de versiones |
| `/editor/version/<id>/restore` | `restore` | Restaurar versión |
| `/editor/version/<id>/diff` | `show_diff` | Mostrar diff de versión |
| `/editor/post/<id>/delete/` | `delete` | Eliminar publicación |
| `/editor/post/list` | `postlist` | Listado de publicaciones |
| `/editor/measure/` | `measure_list` | Listado de medidas (editor) |
| `/editor/measure/<id>/` | `measure_preview` | Previsualización de medida |
| `/editor/measure/<id>/edit/` | `measure_edit` | Editar medida |

---

### 4.5 `init` — Scripts de Inicialización

**Estado: ACTIVO (uso interno)**

Módulo auxiliar que contiene scripts de inicialización de datos y archivos CSV para carga masiva. No es una app Django registrada, sino un paquete de utilidades.

**Archivos clave:**
| Archivo | Descripción |
|---|---|
| `profile.py` | Creación de páginas de perfil temático |
| `extract.py` | Utilidades de extracción de datos |
| `book.py` | Inicialización de libros |
| `*.csv` | Datos CSV para carga masiva |

---

## 5. Módulos Obsoletos, Inactivos o en Desuso

### 5.1 Vistas Legacy v1 (`main/views.py`)

**Estado: OBSOLETO / EN DESUSO**

Las vistas originales del módulo `main` bajo el namespace `posts/` han sido reemplazadas por las vistas v2 (`viewsv2.py`) bajo el namespace `main/`. Las rutas legacy todavía están registradas en `urls.py` pero no se utilizan activamente.

**Rutas legacy (prefijo `/posts/`):**

| Ruta | Vista | Estado |
|---|---|---|
| `/posts/<id>/` | `summary` | Reemplazado por `mainv2:landing` |
| `/posts/<id>/<slug>` | `post` | Reemplazado por `mainv2:post` |
| `/posts/search` | `search` | Reemplazado por `mainv2:search` |
| `/posts/mye` | `mye` | Reemplazado por `measure:mye_overview` |
| `/posts/` | `landing` | Reemplazado por `mainv2:landing` |

### 5.2 Código comentado y funciones duplicadas

| Ubicación | Descripción | Estado |
|---|---|---|
| `main/viewsv2.py:58-68` | Función `library_front()` comentada | Inactivo |
| `main/viewsv2.py:131-178` | Implementación duplicada de `library()` | Código muerto |
| `main/viewsv2.py:349` | Ruta comentada: `library/list/` | Inactivo |
| `measure/models.py:277-285` | Método `save()` comentado en Measure | Inactivo |
| `measure/load.py:167-179` | Función `metas()` comentada, reemplazada por `metas_medidas()` | Obsoleto |

### 5.3 Template legacy

| Archivo | Descripción | Estado |
|---|---|---|
| `main/templates/main/mye.html` | Template MYE original | Reemplazado por `mainv2/staticpage/mye.html` |

### 5.4 Tareas pendientes (TODOs)

| Ubicación | Descripción |
|---|---|
| `main/viewsv2.py:11` | `# TODO : profiles` — Manejo de perfiles incompleto |
| `main/viewsv2.py:247` | `# TODO : perform an union on books and regulations` — Búsqueda unificada pendiente |
| `main/viewsv2.py:275` | `# TODO : translate title` — Traducción de títulos pendiente |
| `dashboard/views.py:93` | `# TODO : do not save when title and body are unchanged` — Optimización pendiente |
| `user/email.py:4` | `# TODO : email stuff` — Configuración de email incompleta |

### 5.5 Dependencias comentadas

En `requirements.txt` se observan paquetes alternativos comentados que no están en uso:

| Paquete | Estado | Notas |
|---|---|---|
| `django-mdeditor` | Comentado | Alternativa a django-pagedown, no utilizado |
| `martor` | Comentado | Alternativa a django-pagedown, no utilizado |

---

## 6. Configuración del Entorno

### 6.1 Variables de entorno

| Variable | Descripción |
|---|---|
| `HOST_PORT` | Puerto del host para Docker (default: 8080) |
| `EMAIL_HOST` | Servidor SMTP |
| `EMAIL_PORT` | Puerto SMTP (default: 465) |
| `EMAIL_HOST_USER` | Usuario del servidor de email |
| `EMAIL_HOST_PASSWORD` | Contraseña del servidor de email |
| `DATABASE_FILE` | Nombre del archivo SQLite (default: `db.sqlite3`) |

### 6.2 Configuración Django destacada

| Parámetro | Valor |
|---|---|
| Idioma | `es-ar` (Español Argentina) |
| Zona horaria | `America/Argentina/Buenos_Aires` |
| Modelo de usuario | `user.User` (personalizado) |
| Tamaño máximo de archivo | 30 MB por archivo, 35 MB por request |
| CORS | Habilitado para todos los orígenes (desarrollo) |
| Archivos estáticos | `/code/static` |
| Archivos media | `/code/media` |

### 6.3 Despliegue

**Producción (`docker-compose.yml`):**
- Servicio Django en puerto 8000 (interno).
- Servicio Nginx con SSL en puertos configurables.
- Volúmenes para código, estáticos, media y certificados.
- Red: `snicc`.

**Desarrollo (`dev.docker-compose.yml`):**
- Servicio Django únicamente, sin Nginx.
- Puerto 8000 expuesto directamente.

---

## 7. Middleware

La aplicación utiliza la cadena estándar de middleware de Django:

| Orden | Middleware | Propósito |
|---|---|---|
| 1 | `SecurityMiddleware` | Headers de seguridad HTTP |
| 2 | `SessionMiddleware` | Gestión de sesiones |
| 3 | `CorsMiddleware` | Manejo de CORS |
| 4 | `CommonMiddleware` | Middleware común de Django |
| 5 | `CsrfViewMiddleware` | Protección CSRF |
| 6 | `AuthenticationMiddleware` | Autenticación de usuarios |
| 7 | `MessageMiddleware` | Sistema de mensajes |
| 8 | `XFrameOptionsMiddleware` | Protección contra clickjacking |

---

## 8. Sistema de Fixtures y Datos Iniciales

La aplicación utiliza fixtures JSON para cargar datos iniciales:

### App `main`
| Fixture | Contenido |
|---|---|
| `lang.json` | Idiomas disponibles |
| `provincias.json` | Provincias argentinas |
| `profile.json` / `perfil.json` | Perfiles temáticos |
| `books.json` | Libros iniciales |
| `main.json` | Datos generales |
| `main_medidas.json` | Datos de medidas (main) |
| `meta.json` | Metadatos |
| `en.json` | Traducciones al inglés |

### App `measure`
| Fixture | Contenido |
|---|---|
| `labels.json` | Etiquetas (Adaptación, Mitigación, etc.) |
| `pilares.json` | Pilares estratégicos |
| `linecategories.json` | Categorías de líneas |
| `lines.json` | Líneas estratégicas |
| `measurefields.json` | Campos de medidas |
| `metas.json` | Metas nacionales (jerarquía Meta_0/1/2) |

### App `user`
| Fixture | Contenido |
|---|---|
| `groups.json` | Grupos de permisos |

---

## 9. Funcionalidades Principales

1. **Contenido multilingüe** — Publicaciones, libros, normativa y enlaces con versiones en múltiples idiomas.
2. **Editor Markdown** — Creación de contenido con editor Markdown integrado (django-pagedown).
3. **Autenticación por código** — Login sin contraseña, mediante código temporal por email.
4. **Roles y permisos** — Administradores y editores con permisos granulares por idioma y módulo.
5. **Medidas climáticas** — Estructura jerárquica de líneas, acciones y medidas con seguimiento de implementación.
6. **Exportación PDF y CSV** — Generación de reportes en PDF y CSV para medidas.
7. **Visualización de datos** — Gráficos estadísticos de implementación (D3.js, C3.js, Chart.js).
8. **Caching** — Respuestas JSON cacheadas para rendimiento en el módulo de medidas.
9. **Gestión de biblioteca** — Catálogo de libros/documentos con autores, formatos y categorías.
10. **Planes provinciales** — Mapa interactivo de planes de respuesta por provincia.
11. **Traducción de interfaz** — Sistema de traducción estática para la UI del portal.
12. **Versionado de contenido** — Historial de versiones con diff y restauración.
