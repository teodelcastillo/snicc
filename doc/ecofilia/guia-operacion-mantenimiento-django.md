# Guía de operación y mantenimiento de SNICC (Django)

Este documento está dirigido al **equipo técnico** responsable de despliegues, mantenimiento y actualizaciones de SNICC en los distintos entornos.

- Se enfoca en **Django** y sus comandos de administración.
- **No cubre en detalle** la configuración de Docker, `docker-compose` ni Nginx (eso se gestiona con la infraestructura existente).
- Complementa otros documentos específicos (por ejemplo, la **configuración de email en producción**).

---

## 1. Arquitectura lógica (vista rápida)

- **Aplicación web**: framework Django.
- **Base de datos**: manejada por el equipo de infraestructura (motor y backups quedan fuera del alcance de este documento).
- **Servidor web / proxy**: Nginx, administrado por infraestructura.
- **Contenedores**: la aplicación corre en contenedores Docker en producción, gestionados por el equipo de infraestructura.

Desde la perspectiva de este documento, lo importante es que:

- Siempre que se quiera **operar Django**, se debe ejecutar `python manage.py ...`:
  - Directamente en el servidor o entorno virtual, o
  - Desde el contenedor de la aplicación (por ejemplo, `docker compose exec <servicio_django> python manage.py ...`).

> El nombre real del servicio/contendor (por ejemplo `django`, `web`, `app`) depende del `docker-compose.yml` definido por el equipo de infraestructura.

---

## 2. Formas de ejecutar comandos de Django

Los comandos de administración de Django siguen esta forma general:

```bash
python manage.py <comando> [opciones]
```

### 2.1. Entornos sin Docker

Situación típica: entorno de desarrollo local o servidor donde la app corre directamente en Python.

```bash
cd /ruta/al/proyecto
source venv/bin/activate     # si se usa entorno virtual
python manage.py migrate
```

### 2.2. Entornos con Docker / docker-compose

En producción (y en algunos staging) es habitual que la app corra dentro de un contenedor. En esos casos, la forma más común es:

```bash
docker compose exec <servicio_django> python manage.py <comando>
```

Ejemplos:

```bash
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser
docker compose exec django python manage.py check
```

> **Importante**: este documento asume que el `docker compose` y los servicios están definidos y gestionados por el equipo de infraestructura. Aquí solo se muestra cómo **invocar comandos de Django** desde ese entorno.

---

## 3. Tareas típicas de despliegue

En cada despliegue de una nueva versión de SNICC se recomienda seguir al menos este flujo lógico (adaptado al procedimiento formal del equipo de infraestructura):

1. **Actualizar código y reconstruir contenedores**  
   - Paso realizado según los procedimientos estándar del equipo (pull de git, build de imágenes, etc.).

2. **Aplicar migraciones de base de datos**
   - Ver sección 4.

3. **Actualizar archivos estáticos (si corresponde)**
   - Ver sección 5.

4. **Revisión rápida de salud**
   - Ver sección 6.

5. **Pruebas básicas de funcionalidad**
   - Acceso a la app, login, flujos principales definidos por el equipo funcional.

---

## 4. Migraciones de base de datos

Las migraciones de Django permiten mantener el esquema de base de datos sincronizado con el código.

### 4.1. Antes del despliegue (entornos de prueba)

En entornos de desarrollo o prueba:

```bash
python manage.py makemigrations   # sólo necesario cuando se cambian modelos
python manage.py migrate
```

En entornos contenedorizados:

```bash
docker compose exec django python manage.py makemigrations
docker compose exec django python manage.py migrate
```

> Habitualmente, **`makemigrations` lo realiza el equipo de desarrollo** y se versiona en git. El equipo de operación suele ejecutar solo `migrate` con las migraciones ya incluidas en el código.

### 4.2. En producción

Con la nueva versión del código ya desplegada:

```bash
docker compose exec django python manage.py migrate
```

Recomendaciones:

- Ejecutar siempre `migrate` **una sola vez por despliegue** (aun si no hay cambios, el comando no tendrá efecto).
- Supervisar la salida por si hubiera errores de esquema o permisos en la base de datos.

### 4.3. Verificando el estado de las migraciones

Para revisar qué migraciones están aplicadas:

```bash
docker compose exec django python manage.py showmigrations
```

- Las migraciones marcadas con `[X]` están aplicadas.
- Las que aparecen sin marca están pendientes.

---

## 5. Archivos estáticos

Si la nueva versión incluye cambios en CSS, JS o imágenes servidas por Django, puede ser necesario volver a generar los archivos estáticos.

### 5.1. Comando principal

```bash
docker compose exec django python manage.py collectstatic --noinput
```

Puntos a tener en cuenta:

- `collectstatic` copia todos los estáticos a la carpeta configurada en `STATIC_ROOT` (definida en `settings.py`).
- El parámetro `--noinput` evita preguntas interactivas (obligatorio en entornos automatizados).
- Este comando suele correrse:
  - En el primer despliegue del sistema.
  - Cuando se modifican activos estáticos (consultar con el equipo de desarrollo).

---

## 6. Chequeos de salud y diagnósticos básicos

### 6.1. Chequeo general de configuración

```bash
docker compose exec django python manage.py check
```

Uso:

- Verifica la configuración de Django y alerta sobre problemas comunes (config incorrectas, apps mal definidas, etc.).
- Recomendado después de:
  - Cambios de versión.
  - Cambios de configuración (variables de entorno, `settings.py`).

### 6.2. Consola interactiva (shell)

```bash
docker compose exec django python manage.py shell
```

Uso:

- Permite ejecutar Python interactivo con el contexto de Django cargado.
- Útil para diagnósticos puntuales (por ejemplo, contar registros, revisar estados).

> **Advertencia**: la shell permite modificar datos. En producción debe ser usada solo por personal autorizado y, preferentemente, con participación del equipo de desarrollo.

---

## 7. Gestión de usuarios administrativos

Los usuarios administrativos tienen acceso al panel de administración de Django (`/admin/`).

### 7.1. Crear un superusuario

```bash
docker compose exec django python manage.py createsuperuser
```

El comando pedirá:

- Nombre de usuario.
- Correo electrónico.
- Contraseña (dos veces).

Cuándo usarlo:

- Primer despliegue del sistema.
- Alta de nuevos administradores técnicos, si se decide gestionar por Django.

### 7.2. Cambiar contraseña de un usuario

```bash
docker compose exec django python manage.py changepassword <nombre_usuario>
```

Cuándo usarlo:

- Cuando un administrador pierde u olvida su contraseña y no hay recuperación automática disponible.

---

## 8. Limpieza y tareas de mantenimiento

### 8.1. Limpiar sesiones expiradas

Si el proyecto utiliza las sesiones de Django (configuración por defecto), se pueden eliminar las sesiones expiradas con:

```bash
docker compose exec django python manage.py clearsessions
```

Cuándo usarlo:

- Regularmente (por ejemplo, programado por el equipo de infraestructura), si se detecta crecimiento excesivo de la tabla de sesiones.

### 8.2. Copias de seguridad

- Las copias de seguridad de la base de datos y de los volúmenes de archivos son responsabilidad del equipo de infraestructura.
- Desde la perspectiva de Django, no hay un comando específico para backup; se recomienda:
  - Coordinar con la administración de base de datos.
  - Documentar los puntos de restauración conocidos antes de cambios mayores.

---

## 9. Glosario de comandos de Django

Resumen de comandos estándar más usados en la operación de SNICC.  
En todos los casos, reemplazar `python manage.py` por `docker compose exec django python manage.py` cuando corra dentro de contenedores.

| Comando | Cuándo usarlo | Entorno típico | Notas |
|--------|----------------|----------------|-------|
| `manage.py check` | Después de cambios de código o configuración para verificar que todo esté en orden. | Todos | No modifica datos. Seguro en producción. |
| `manage.py migrate` | Tras desplegar una versión que incluye nuevas migraciones de base de datos. | Staging / Producción | Ejecutar una vez por despliegue. Puede modificar el esquema. |
| `manage.py showmigrations` | Ver qué migraciones están aplicadas o pendientes. | Todos | Útil para diagnóstico cuando `migrate` falla. |
| `manage.py collectstatic --noinput` | Cuando cambian CSS/JS/imagenes estáticas o en el primer despliegue. | Staging / Producción | Copia archivos estáticos. No toca la base de datos. |
| `manage.py createsuperuser` | Crear un usuario administrador para el panel `/admin/`. | Staging / Producción | Comando interactivo. Crear solo los necesarios. |
| `manage.py changepassword <usuario>` | Cambiar contraseña de un usuario existente. | Producción | Afecta solo al usuario indicado. |
| `manage.py shell` | Diagnósticos avanzados o tareas puntuales con soporte del equipo de desarrollo. | Staging / Producción (con cuidado) | Puede modificar datos. Usar con precaución. |
| `manage.py clearsessions` | Limpieza de sesiones expiradas. | Producción | Reduce tamaño de la tabla de sesiones. |

> Además de estos, puede haber **comandos personalizados** específicos de SNICC (por ejemplo, para importaciones masivas, sincronización, etc.). Se listan con:
>
> ```bash
> python manage.py help
> ```
>
> y su uso debe estar documentado por el equipo de desarrollo.

---

## 10. Buenas prácticas operativas

- **No ejecutar comandos peligrosos en producción sin entender el impacto.**  
  Cuando haya dudas, coordinar con el equipo de desarrollo.

- **Usar siempre el entorno correcto.**  
  Verificar que se está dentro del contenedor/servidor correspondiente al entorno (desarrollo, prueba, producción) antes de ejecutar un comando.

- **Registrar operaciones sensibles.**  
  Para acciones como `migrate`, `createsuperuser`, `changepassword` o uso de `shell`, dejar constancia (fecha, persona, motivo).

- **Mantener consistencia entre entornos.**  
  Probar primero las migraciones y comandos en un entorno de prueba que refleje lo más posible la configuración de producción.

- **Revisar logs ante cualquier error.**  
  Ante problemas al ejecutar comandos de Django, revisar los logs de la aplicación y del contenedor/servidor correspondiente y, si es necesario, escalar al equipo de desarrollo.

Con estas pautas, el equipo técnico dispone de una referencia básica para operar y mantener SNICC desde la perspectiva de Django, coordinándose con los responsables de infraestructura (Docker, Nginx, base de datos y backups).

