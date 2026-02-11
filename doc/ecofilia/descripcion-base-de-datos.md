# SNICC — Descripción de la Base de Datos

**Sistema Nacional de Información sobre Cambio Climático**

Fecha de elaboración: 10 de febrero de 2026

---

## 1. Información General

| Parámetro | Valor |
|---|---|
| **Motor** | SQLite3 (`django.db.backends.sqlite3`) |
| **Archivo** | `db.sqlite3` (raíz de `app/`) |
| **Primary Key por defecto** | `BigAutoField` (entero de 64 bits, autoincremental) |
| **ORM** | Django ORM |
| **Soporte alternativo** | PostgreSQL (configurado pero no activo) |

---

## 2. Diagrama de Relaciones (resumen textual)

```
User ──FK──> Profile
User ──FK──> Provincia
User ──FK──> Language
User ──1:1─> UserCode
User ──1:1─> EditorAccess
EditorAccess ──M2M──> Language

Post ──FK──> Post (self-referencial, padre/hijo)
PostVersion ──FK──> Post
PostVersion ──FK──> Language
PostVersion ──FK──> User
PostProfile ──FK──> Post
PostProfile ──FK──> Profile

Book ──FK──> BookFormat
Book ──M2M──> Author
BookVersion ──FK──> Book
BookVersion ──FK──> Language
BookReference ──FK──> Book
BookReference ──FK──> Post

InternalLink ──FK──> Post
InternalLinkVersion ──FK──> InternalLink
InternalLinkVersion ──FK──> Language

ExternalLinkVersion ──FK──> ExternalLink
ExternalLinkVersion ──FK──> Language

Regulation ──> RegulationVersion
RegulationVersion ──FK──> Regulation
RegulationVersion ──FK──> Language

Plan ──FK──> Provincia
PlanVersion ──FK──> Plan
PlanVersion ──FK──> Language

StaticTransVersion ──FK──> StaticTrans
StaticTransVersion ──FK──> Language

Line ──FK──> LineCategory
Action ──FK──> Line
Measure ──FK──> Line
Measure ──FK──> Action
Measure ──FK──> Pilar
Measure ──FK──> ImplementationStatus
Measure ──M2M──> Label
Measure ──M2M──> Meta_2
MeasureYearMeta ──FK──> Measure
Meta_1 ──FK──> Meta_0
Meta_2 ──FK──> Meta_1
```

---

## 3. Tablas del Módulo `main`

### 3.1 `main_provincia`

Provincias argentinas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `code` | CharField(5) | **PK** | Código de provincia |
| `name` | CharField(50) | NOT NULL | Nombre de la provincia |
| `gid` | IntegerField | Nullable | Identificador geográfico |

---

### 3.2 `main_profile`

Perfiles temáticos del portal (adaptación, mitigación, bosques, etc.).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `code` | CharField(20) | **PK** | Código del perfil |
| `name` | CharField(100) | NOT NULL | Nombre del perfil |
| `hidden` | BooleanField | Default: `False` | Si el perfil está oculto |
| `image` | FileField | Nullable, upload: `profile/` | Imagen del perfil |
| `color` | CharField(10) | Default: `#000000` | Color hexadecimal |
| `specific_url` | CharField(50) | Nullable | URL específica del perfil |

---

### 3.3 `main_language`

Idiomas disponibles en el sistema.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `code` | CharField(3) | **PK** | Código ISO del idioma (ej: `es`, `en`) |
| `name` | CharField(40) | NOT NULL | Nombre del idioma |
| `order` | IntegerField | Default: `20` | Orden de visualización |

**Relaciones entrantes:** User, EditorAccess, todas las tablas de versiones (`*Version`).

---

### 3.4 `main_tag`

Etiquetas para categorización de contenido.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(40) | NOT NULL | Nombre de la etiqueta |

---

### 3.5 `main_post`

Publicaciones del portal (noticias y recursos).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `type` | IntegerField | Default: `2` | Tipo: 1=noticia, 2=recurso |
| `parent_id` | BigIntegerField | **FK → main_post**, Nullable | Post padre (jerárquico) |
| `category` | CharField | Default: `ampyd` | Categoría temática |
| `slug` | SlugField(30) | **UNIQUE** | Identificador URL amigable |
| `status` | IntegerField | Default: `1` | Estado: 1=borrador, 2=publicado |
| `image` | FileField | Nullable, upload: `title/` | Imagen principal |
| `date` | DateTimeField | Auto (actualización) | Fecha de última modificación |
| `protected` | BooleanField | Default: `False` | Si está protegido contra edición |

**Relaciones:**
- **Self-referencial:** `parent_id` → `main_post.id` (ON DELETE CASCADE)
- **Tiene muchos:** PostVersion, PostProfile, InternalLink, BookReference

---

### 3.6 `main_postversion`

Versiones de publicaciones en diferentes idiomas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `post_id` | BigIntegerField | **FK → main_post** (CASCADE) | Publicación asociada |
| `lang_id` | CharField | **FK → main_language** (CASCADE) | Idioma de la versión |
| `title` | CharField(100) | NOT NULL | Título de la versión |
| `body` | TextField | Nullable | Contenido en Markdown |
| `date` | DateTimeField | Auto (actualización) | Fecha de última modificación |
| `user_id` | BigIntegerField | **FK → user_user** (SET_NULL), Nullable | Editor que realizó el cambio |
| `short` | CharField(500) | Nullable | Descripción corta / resumen |

**Restricción UNIQUE:** (`lang_id`, `post_id`) — una versión por idioma por post.

---

### 3.7 `main_postprofile`

Tabla intermedia que asocia publicaciones con perfiles temáticos (con valor/puntuación).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `profile_id` | CharField | **FK → main_profile** (CASCADE) | Perfil temático |
| `post_id` | BigIntegerField | **FK → main_post** (CASCADE) | Publicación |
| `value` | IntegerField | Default: `0` | Valor/relevancia |

**Restricción UNIQUE:** (`profile_id`, `post_id`)

---

### 3.8 `main_bookformat`

Formatos disponibles para libros.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(50) | **UNIQUE** | Nombre del formato |

---

### 3.9 `main_author`

Autores de libros.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(150) | NOT NULL | Nombre del autor |

---

### 3.10 `main_book`

Libros y documentos de la biblioteca.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `year` | IntegerField | Default: `2025` | Año de publicación |
| `category` | CharField | Default: `ampyd` | Categoría temática |
| `date` | DateTimeField | Auto (actualización) | Fecha de última modificación |
| `url` | URLField(500) | Nullable | URL externa del recurso |
| `image` | FileField | Nullable, upload: `books/` | Imagen de portada |
| `document` | FileField | Nullable, upload: `books/documents/` | Documento adjunto |
| `comunidad` | BooleanField | Default: `False` | Flag: contenido de comunidad |
| `capacitaciones` | BooleanField | Default: `False` | Flag: contenido de capacitaciones |
| `ciudadania` | BooleanField | Default: `False` | Flag: contenido de ciudadanía |
| `format_type_id` | BigIntegerField | **FK → main_bookformat** (SET_NULL), Nullable | Formato del libro |

**Relaciones:**
- **M2M con Author:** tabla intermedia `main_book_authors`
- **Tiene muchos:** BookVersion, BookReference

---

### 3.11 `main_book_authors`

Tabla intermedia M2M entre Book y Author (generada por Django).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `book_id` | BigIntegerField | **FK → main_book** | Libro |
| `author_id` | BigIntegerField | **FK → main_author** | Autor |

**Restricción UNIQUE:** (`book_id`, `author_id`)

---

### 3.12 `main_bookversion`

Versiones multilingües de libros.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `book_id` | BigIntegerField | **FK → main_book** (CASCADE) | Libro asociado |
| `lang_id` | CharField | **FK → main_language** (CASCADE) | Idioma |
| `title` | CharField(100) | NOT NULL | Título traducido |
| `description` | TextField | Nullable | Descripción traducida |

**Restricción UNIQUE:** (`lang_id`, `book_id`)

---

### 3.13 `main_bookreference`

Tabla intermedia que asocia libros con publicaciones.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `book_id` | BigIntegerField | **FK → main_book** (CASCADE) | Libro |
| `post_id` | BigIntegerField | **FK → main_post** (CASCADE) | Publicación relacionada |

---

### 3.14 `main_internallink`

Enlaces internos asociados a publicaciones.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `parent_id` | BigIntegerField | **FK → main_post** (CASCADE), Nullable | Post padre |
| `image` | FileField | Nullable, upload: `title/` | Imagen del enlace |
| `view` | CharField(50) | Nullable | Nombre de vista Django |
| `viewargs` | CharField(50) | Nullable | Argumentos de la vista |
| `url` | URLField | Nullable | URL externa alternativa |

**Tiene muchos:** InternalLinkVersion

---

### 3.15 `main_internallinkversion`

Versiones multilingües de enlaces internos.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `link_id` | BigIntegerField | **FK → main_internallink** (CASCADE) | Enlace asociado |
| `lang_id` | CharField | **FK → main_language** (CASCADE) | Idioma |
| `title` | CharField(100) | NOT NULL | Título traducido |
| `description` | TextField | Nullable | Descripción traducida |

**Restricción UNIQUE:** (`lang_id`, `link_id`)

---

### 3.16 `main_externallink`

Enlaces externos categorizados.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `url` | URLField | NOT NULL | URL del enlace externo |
| `category` | CharField | Default: `ampyd` | Categoría temática |

**Tiene muchos:** ExternalLinkVersion

---

### 3.17 `main_externallinkversion`

Versiones multilingües de enlaces externos.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `link_id` | BigIntegerField | **FK → main_externallink** (CASCADE) | Enlace asociado |
| `lang_id` | CharField | **FK → main_language** (CASCADE) | Idioma |
| `name` | CharField(100) | NOT NULL | Nombre traducido |
| `description` | TextField | Nullable | Descripción traducida |

**Restricción UNIQUE:** (`lang_id`, `link_id`)

---

### 3.18 `main_regulation`

Normativa (leyes, decretos, resoluciones).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `linktype` | CharField | Default: `Ley` | Tipo: Decreto, Ley, Decisiones administrativas, Resolución |
| `url` | URLField | NOT NULL | URL del documento normativo |
| `date` | DateTimeField | NOT NULL | Fecha de la normativa |

**Tiene muchos:** RegulationVersion

---

### 3.19 `main_regulationversion`

Versiones multilingües de normativa.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `reg_id` | BigIntegerField | **FK → main_regulation** (CASCADE) | Normativa asociada |
| `lang_id` | CharField | **FK → main_language** (CASCADE) | Idioma |
| `name` | CharField(150) | NOT NULL | Nombre de la normativa |
| `description` | TextField | Nullable | Descripción traducida |

---

### 3.20 `main_plan`

Planes provinciales de respuesta al cambio climático.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `provincia_id` | CharField | **FK → main_provincia** (CASCADE) | Provincia |
| `status` | IntegerField | Default: `1` | Estado: 1=no presentado, 2=pre-con análisis, 3=pre-con mapeo, 4=pre-convalidado, 5=convalidado |
| `url` | URLField | Nullable | URL del plan |

**Tiene muchos:** PlanVersion

---

### 3.21 `main_planversion`

Versiones multilingües de planes provinciales.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `plan_id` | BigIntegerField | **FK → main_plan** (CASCADE) | Plan asociado |
| `lang_id` | CharField | **FK → main_language** (CASCADE) | Idioma |
| `authority` | TextField | Nullable | Autoridad responsable |
| `respuesta` | TextField | Nullable | Respuesta/descripción |
| `regulations` | TextField | Nullable | Normativa asociada |
| `contact` | TextField | Nullable | Contacto |

**Restricción UNIQUE:** (`lang_id`, `plan_id`)

---

### 3.22 `main_statictrans`

Textos estáticos de la interfaz (idioma español como base).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `es` | TextField | **UNIQUE** | Texto en español (clave) |

**Tiene muchos:** StaticTransVersion

---

### 3.23 `main_statictransversion`

Traducciones de textos estáticos a otros idiomas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `lang_id` | CharField | **FK → main_language** (CASCADE) | Idioma destino (excluye `es`) |
| `es_id` | BigIntegerField | **FK → main_statictrans** (CASCADE) | Texto original en español |
| `trad` | TextField | NOT NULL | Texto traducido |

**Restricción UNIQUE:** (`lang_id`, `es_id`)

---

## 4. Tablas del Módulo `user`

### 4.1 `user_user`

Usuarios del sistema (extiende AbstractUser de Django).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `username` | CharField(150) | **UNIQUE**, NOT NULL | Nombre de usuario |
| `email` | EmailField | NOT NULL | Correo electrónico |
| `password` | CharField(128) | NOT NULL | Contraseña (hash) |
| `first_name` | CharField(150) | Blank allowed | Nombre |
| `last_name` | CharField(150) | Blank allowed | Apellido |
| `is_staff` | BooleanField | Default: `False` | Si tiene acceso al admin |
| `is_superuser` | BooleanField | Default: `False` | Si es superusuario |
| `is_active` | BooleanField | Default: `True` | Si la cuenta está activa |
| `date_joined` | DateTimeField | Auto | Fecha de registro |
| `last_login` | DateTimeField | Nullable | Último inicio de sesión |
| `profile_id` | CharField | **FK → main_profile** (SET_NULL), Nullable | Perfil temático |
| `gender` | CharField | Default: `No` | Género: Varón, Mujer, No, Otro |
| `country` | CharField(10) | Nullable | Código de país |
| `province_id` | CharField | **FK → main_provincia** (SET_NULL), Nullable | Provincia |
| `city` | CharField(50) | Nullable | Ciudad |
| `phone` | CharField(20) | Nullable | Teléfono |
| `lang_id` | CharField | **FK → main_language** (SET_NULL), Nullable | Idioma preferido |

**Relaciones:**
- **1:1 con UserCode** (código de verificación)
- **1:1 con EditorAccess** (permisos de edición)
- **M2M con Group** (grupos Django, tabla `user_user_groups`)
- **M2M con Permission** (permisos Django, tabla `user_user_user_permissions`)

---

### 4.2 `user_usercode`

Códigos temporales de verificación para autenticación.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `user_id` | BigIntegerField | **FK → user_user** (CASCADE), **UNIQUE** | Usuario asociado |
| `code` | CharField(4) | Default: aleatorio | Código de 4 dígitos |
| `creation` | DateTimeField | Auto (actualización) | Fecha de generación |

**Nota:** El código expira después de 10 minutos.

---

### 4.3 `user_editoraccess`

Permisos de edición para usuarios con rol de editor.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `user_id` | BigIntegerField | **FK → user_user** (CASCADE), **UNIQUE** | Usuario asociado |
| `all_lang` | BooleanField | Default: `False` | Si puede editar en todos los idiomas |
| `can_delete` | BooleanField | Default: `False` | Si puede eliminar contenido |
| `measures` | BooleanField | Default: `False` | Si puede editar medidas |

**Relación M2M:** `user_editoraccess_langs` (idiomas permitidos para edición)

---

### 4.4 `user_editoraccess_langs`

Tabla intermedia M2M entre EditorAccess y Language.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `editoraccess_id` | BigIntegerField | **FK → user_editoraccess** | Acceso de editor |
| `language_id` | CharField | **FK → main_language** | Idioma permitido |

**Restricción UNIQUE:** (`editoraccess_id`, `language_id`)

---

## 5. Tablas del Módulo `measure`

### 5.1 `measure_cacheresponse`

Caché de respuestas JSON para optimización de rendimiento.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `request` | CharField(200) | **PK** | Clave de la petición (URL/parámetros) |
| `response` | JSONField | Nullable | Respuesta JSON cacheada |

---

### 5.2 `measure_label`

Etiquetas de clasificación de medidas (ej: Adaptación, Mitigación, Pérdidas y daños).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(200) | NOT NULL | Nombre de la etiqueta |

**Relación M2M con Measure:** tabla intermedia `measure_measure_labels`

---

### 5.3 `measure_pilar`

Pilares estratégicos del plan climático.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(200) | NOT NULL | Nombre del pilar |
| `color` | CharField(9) | Default: aleatorio | Color hexadecimal |

---

### 5.4 `measure_linecategory`

Categorías de líneas estratégicas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(200) | NOT NULL | Nombre de la categoría |
| `color` | CharField(9) | Default: aleatorio | Color hexadecimal |

---

### 5.5 `measure_line`

Líneas estratégicas del plan climático.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(200) | NOT NULL | Nombre de la línea |
| `color` | CharField(9) | Default: aleatorio | Color hexadecimal |
| `description` | TextField | Default: vacío | Descripción de la línea |
| `category_id` | BigIntegerField | **FK → measure_linecategory** (SET_NULL), Nullable | Categoría |
| `icon` | ImageField | Nullable, upload: `icon/` | Ícono de la línea |

**Tiene muchos:** Action, Measure

---

### 5.6 `measure_action`

Acciones dentro de una línea estratégica.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(200) | NOT NULL | Nombre de la acción |
| `color` | CharField(9) | Default: aleatorio | Color hexadecimal |
| `description` | TextField | Default: vacío | Descripción de la acción |
| `line_id` | BigIntegerField | **FK → measure_line** (CASCADE) | Línea estratégica |
| `ingei` | TextField | Nullable | Información INGEI |

**Tiene muchos:** Measure

---

### 5.7 `measure_meta_0`

Nivel superior de la jerarquía de metas nacionales.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `code` | CharField(10) | NOT NULL | Código de la meta |
| `name` | CharField(200) | NOT NULL | Nombre de la meta |

**Tiene muchos:** Meta_1

---

### 5.8 `measure_meta_1`

Nivel intermedio de la jerarquía de metas nacionales.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `code` | CharField(10) | NOT NULL | Código de la meta |
| `name` | CharField(200) | NOT NULL | Nombre de la meta |
| `meta_0_id` | BigIntegerField | **FK → measure_meta_0** (CASCADE) | Meta padre |

**Tiene muchos:** Meta_2

---

### 5.9 `measure_meta_2`

Nivel inferior de la jerarquía de metas nacionales. Se vincula con medidas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `code` | CharField(10) | NOT NULL | Código de la meta |
| `name` | CharField(200) | NOT NULL | Nombre de la meta |
| `meta_1_id` | BigIntegerField | **FK → measure_meta_1** (CASCADE) | Meta padre |

**Relación M2M con Measure:** tabla intermedia `measure_measure_national_objectives`

---

### 5.10 `measure_measurefield`

Definición de campos dinámicos disponibles para medidas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(200) | NOT NULL | Nombre del campo |
| `is_active` | BooleanField | Default: `True` | Si el campo está activo |

---

### 5.11 `measure_implementationstatus`

Estados de implementación de las medidas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(80) | **UNIQUE** | Nombre del estado |
| `order` | PositiveSmallIntegerField | Default: `0` | Orden de visualización |
| `color` | CharField(9) | Default: `#a1a1a1` | Color hexadecimal |
| `card_category` | CharField | Default: `other` | Categoría: `implementation`, `completed`, `other` |

**Valores predefinidos:**

| Nombre | Orden | Color | Categoría |
|---|---|---|---|
| En programación | 0 | `#33c45a` | other |
| En implementación inicial | 1 | `#f9ff59` | implementation |
| En implementación avanzada | 2 | `#ff9159` | implementation |
| Completada | 3 | `#0f8b48` | completed |
| A definir | 4 | `#a1a1a1` | other |

---

### 5.12 `measure_measure`

Medidas climáticas nacionales. Tabla principal del módulo de medidas.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `name` | CharField(255) | NOT NULL | Nombre de la medida |
| `is_active` | BooleanField | Default: `False` | Si la medida está activa/visible |
| `code` | CharField(12) | NOT NULL | Código identificador |
| `line_id` | BigIntegerField | **FK → measure_line** (SET_NULL), Nullable | Línea estratégica |
| `action_id` | BigIntegerField | **FK → measure_action** (SET_NULL), Nullable | Acción |
| `pilares_id` | BigIntegerField | **FK → measure_pilar** (SET_NULL), Nullable | Pilar estratégico |
| `status_id` | BigIntegerField | **FK → measure_implementationstatus** (PROTECT), Nullable | Estado de implementación |
| `scope` | CharField | Default: `A definir` | Alcance: `A definir`, `Regional`, `Nacional` |
| `fields` | JSONField | Nullable | Campos dinámicos (datos flexibles) |
| `last_modified` | DateTimeField | Auto (actualización) | Última modificación |
| `show_alcance_estado` | BooleanField | Default: `True` | Visibilidad: alcance y estado |
| `show_periodo_meta` | BooleanField | Default: `True` | Visibilidad: período y meta |
| `show_metas_por_ano` | BooleanField | Default: `True` | Visibilidad: metas por año |
| `show_alcance_geografico` | BooleanField | Default: `True` | Visibilidad: alcance geográfico |
| `show_riesgos_climaticos` | BooleanField | Default: `True` | Visibilidad: riesgos climáticos |

**Relaciones:**
- **M2M con Label:** tabla `measure_measure_labels`
- **M2M con Meta_2:** tabla `measure_measure_national_objectives`
- **Tiene muchos:** MeasureYearMeta

**Managers:**
- `objects` — Manager por defecto (todas las medidas)
- `active` — Manager filtrado (`is_active=True`)

---

### 5.13 `measure_measure_labels`

Tabla intermedia M2M entre Measure y Label.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `measure_id` | BigIntegerField | **FK → measure_measure** | Medida |
| `label_id` | BigIntegerField | **FK → measure_label** | Etiqueta |

**Restricción UNIQUE:** (`measure_id`, `label_id`)

---

### 5.14 `measure_measure_national_objectives`

Tabla intermedia M2M entre Measure y Meta_2 (objetivos nacionales).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `measure_id` | BigIntegerField | **FK → measure_measure** | Medida |
| `meta_2_id` | BigIntegerField | **FK → measure_meta_2** | Objetivo nacional |

**Restricción UNIQUE:** (`measure_id`, `meta_2_id`)

---

### 5.15 `measure_measureyearmeta`

Metas anuales asociadas a cada medida.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `measure_id` | BigIntegerField | **FK → measure_measure** (CASCADE) | Medida asociada |
| `year` | IntegerField | NOT NULL | Año de la meta |
| `short_description` | CharField(255) | Default: vacío | Descripción corta |
| `description` | TextField | Default: vacío | Descripción detallada |

**Restricción UNIQUE:** (`measure_id`, `year`)

---

### 5.16 `measure_progressreport`

Informes de progreso de Monitoreo y Evaluación (MYE).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `year` | IntegerField | NOT NULL | Año del informe |
| `title` | CharField(200) | Default: vacío | Título del informe |
| `file` | FileField | upload: `measure/progress_reports` | Archivo del informe |
| `created_at` | DateTimeField | Auto (creación) | Fecha de creación |

---

### 5.17 `measure_methodologydocument`

Documentos metodológicos de MYE.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | BigAutoField | **PK** | Identificador único |
| `title` | CharField(200) | Default: vacío | Título del documento |
| `file` | FileField | upload: `measure/methodology` | Archivo del documento |
| `created_at` | DateTimeField | Auto (creación) | Fecha de creación |

---

## 6. Tablas de Django (sistema)

Además de las tablas de la aplicación, Django genera automáticamente las siguientes tablas del sistema:

| Tabla | Descripción |
|---|---|
| `django_migrations` | Registro de migraciones ejecutadas |
| `django_content_type` | Tipos de contenido para el sistema de permisos |
| `auth_permission` | Permisos del sistema |
| `auth_group` | Grupos de usuarios |
| `auth_group_permissions` | Permisos asignados a grupos |
| `user_user_groups` | Grupos asignados a usuarios |
| `user_user_user_permissions` | Permisos directos asignados a usuarios |
| `django_admin_log` | Registro de acciones en el panel de administración |
| `django_session` | Sesiones de usuario activas |

---

## 7. Resumen de Relaciones

### 7.1 Relaciones Foreign Key (FK)

| Origen | Destino | Tipo de eliminación |
|---|---|---|
| User → Profile | main_profile | SET_NULL |
| User → Provincia | main_provincia | SET_NULL |
| User → Language | main_language | SET_NULL |
| Post → Post (padre) | main_post | CASCADE |
| PostVersion → Post | main_post | CASCADE |
| PostVersion → Language | main_language | CASCADE |
| PostVersion → User | user_user | SET_NULL |
| PostProfile → Post | main_post | CASCADE |
| PostProfile → Profile | main_profile | CASCADE |
| Book → BookFormat | main_bookformat | SET_NULL |
| BookVersion → Book | main_book | CASCADE |
| BookVersion → Language | main_language | CASCADE |
| BookReference → Book | main_book | CASCADE |
| BookReference → Post | main_post | CASCADE |
| InternalLink → Post | main_post | CASCADE |
| InternalLinkVersion → InternalLink | main_internallink | CASCADE |
| InternalLinkVersion → Language | main_language | CASCADE |
| ExternalLinkVersion → ExternalLink | main_externallink | CASCADE |
| ExternalLinkVersion → Language | main_language | CASCADE |
| RegulationVersion → Regulation | main_regulation | CASCADE |
| RegulationVersion → Language | main_language | CASCADE |
| Plan → Provincia | main_provincia | CASCADE |
| PlanVersion → Plan | main_plan | CASCADE |
| PlanVersion → Language | main_language | CASCADE |
| StaticTransVersion → StaticTrans | main_statictrans | CASCADE |
| StaticTransVersion → Language | main_language | CASCADE |
| Line → LineCategory | measure_linecategory | SET_NULL |
| Action → Line | measure_line | CASCADE |
| Meta_1 → Meta_0 | measure_meta_0 | CASCADE |
| Meta_2 → Meta_1 | measure_meta_1 | CASCADE |
| Measure → Line | measure_line | SET_NULL |
| Measure → Action | measure_action | SET_NULL |
| Measure → Pilar | measure_pilar | SET_NULL |
| Measure → ImplementationStatus | measure_implementationstatus | PROTECT |
| MeasureYearMeta → Measure | measure_measure | CASCADE |
| UserCode → User | user_user | CASCADE |
| EditorAccess → User | user_user | CASCADE |

### 7.2 Relaciones Many-to-Many (M2M)

| Modelo A | Modelo B | Tabla intermedia |
|---|---|---|
| Book | Author | `main_book_authors` |
| Measure | Label | `measure_measure_labels` |
| Measure | Meta_2 | `measure_measure_national_objectives` |
| EditorAccess | Language | `user_editoraccess_langs` |

### 7.3 Relaciones One-to-One (1:1)

| Modelo A | Modelo B | Propósito |
|---|---|---|
| User | UserCode | Código de verificación temporal |
| User | EditorAccess | Permisos de edición |

---

## 8. Patrón de Versionado Multilingüe

La base de datos implementa un patrón consistente para contenido multilingüe:

1. **Tabla principal** (ej: `Post`, `Book`, `Plan`) contiene los datos agnósticos al idioma.
2. **Tabla de versión** (ej: `PostVersion`, `BookVersion`, `PlanVersion`) contiene los datos traducidos, con:
   - FK hacia la tabla principal (CASCADE)
   - FK hacia `Language` (CASCADE)
   - Restricción UNIQUE sobre (`lang`, `entidad_principal`) para garantizar una sola versión por idioma

Este patrón se aplica a: Post, Book, InternalLink, ExternalLink, Regulation, Plan y StaticTrans.

---

## 9. Notas Técnicas

1. **Campos JSON:** `Measure.fields` almacena datos dinámicos flexibles como JSONField, permitiendo campos configurables por medida.
2. **Caching:** La tabla `CacheResponse` almacena respuestas JSON completas para endpoints de alto tráfico, con invalidación automática via el mixin `CacheBreaker`.
3. **Soft references:** Muchas FK usan `SET_NULL` en lugar de `CASCADE` para preservar datos relacionados al eliminar.
4. **PROTECT:** La FK `Measure → ImplementationStatus` usa `PROTECT` para prevenir eliminación accidental de estados de implementación que tengan medidas asociadas.
5. **Custom managers:** `Measure` tiene un manager `active` que filtra automáticamente solo medidas con `is_active=True`.
6. **Uploads:** Los archivos se organizan en subdirectorios: `title/`, `profile/`, `books/`, `books/documents/`, `icon/`, `measure/progress_reports`, `measure/methodology`.
