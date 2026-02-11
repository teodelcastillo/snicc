# Configuración de correo electrónico en producción

Este documento describe cómo configurar el envío de correos en SNICC para que el **registro de usuarios** y el **inicio de sesión por código** funcionen correctamente en producción.

---

## 1. Por qué es necesario

En SNICC, el registro y el login no usan contraseña: el usuario recibe un **código de verificación por correo electrónico**. Si el servidor no puede enviar correos:

- El usuario se registra pero **nunca recibe el código**.
- No puede completar el registro ni iniciar sesión después.

Por eso es obligatorio configurar un servidor SMTP en producción si se quiere permitir registro e inicio de sesión de usuarios.

---

## 2. Variables de entorno requeridas

Django lee la configuración de correo desde variables de entorno. Deben estar definidas en el entorno donde corre la aplicación (contenedor Docker, servidor, etc.):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `EMAIL_HOST` | Servidor SMTP | `smtp.gmail.com`, `smtp.office365.com`, `mail.dominio.gob.ar` |
| `EMAIL_PORT` | Puerto SMTP (465 SSL, 587 TLS) | `465` o `587` |
| `EMAIL_HOST_USER` | Usuario/cuenta del servidor SMTP | `noreply@dominio.gob.ar` |
| `EMAIL_HOST_PASSWORD` | Contraseña o “app password” de esa cuenta | `********` |

En `app/snicc/settings.py` se usa además:

- `EMAIL_USE_SSL = True` (puerto 465).
- `DEFAULT_FROM_EMAIL` = mismo valor que `EMAIL_HOST_USER`.

Si `EMAIL_HOST` no está definido, la aplicación **no envía correos** y solo imprime el código en la consola del servidor (útil solo para desarrollo).

---

## 3. Configuración con Docker (producción)

### 3.1 Archivo `.env` en la raíz del proyecto

En la misma carpeta donde está `docker-compose.yml`, crear o editar el archivo `.env` (no versionado en git). Ejemplo:

```env
# Puerto del servidor web
HOST_PORT=8080
HOST_PORT_SSL=8443

# Base de datos (si aplica)
DATABASE_FILE=db_despliegue.sqlite3

# Correo: obligatorio para registro e inicio de sesión de usuarios
EMAIL_HOST=smtp.dominio.gob.ar
EMAIL_PORT=465
EMAIL_HOST_USER=noreply@dominio.gob.ar
EMAIL_HOST_PASSWORD=contraseña_segura_de_la_cuenta
```

**Importante:** El `docker-compose.yml` ya pasa estas variables al contenedor Django (`environment: EMAIL_HOST: ${EMAIL_HOST}`, etc.). No hace falta tocar el código; solo asegurarse de que el `.env` exista y tenga valores correctos antes de levantar los contenedores.

### 3.2 Levantar los contenedores

```bash
docker compose up -d
```

Django leerá `EMAIL_*` desde el entorno inyectado por Docker. Si `EMAIL_HOST` está definido, los correos con el código de verificación se enviarán por SMTP.

---

## 4. Servidores SMTP habituales

### 4.1 SMTP genérico (dominio propio o institucional)

Ejemplo para un servidor tipo `mail.dominio.gob.ar` o `smtp.dominio.gob.ar`:

```env
EMAIL_HOST=smtp.dominio.gob.ar
EMAIL_PORT=465
EMAIL_HOST_USER=noreply@dominio.gob.ar
EMAIL_HOST_PASSWORD=contraseña_de_la_cuenta
```

- Puerto **465**: SSL (en settings está `EMAIL_USE_SSL = True`).
- Puerto **587**: suele usarse con STARTTLS; en ese caso habría que ajustar en `settings.py` (`EMAIL_USE_TLS = True` y quitar `EMAIL_USE_SSL` si aplica).

Confirmar con el área de sistemas el host, puerto, usuario y contraseña correctos.

### 4.2 Gmail

1. Activar “verificación en dos pasos” en la cuenta de Google.
2. Crear una “Contraseña de aplicación” en [Cuenta de Google → Seguridad → Contraseñas de aplicaciones](https://myaccount.google.com/apppasswords).
3. Usar esa contraseña en `EMAIL_HOST_PASSWORD`.

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_HOST_USER=tu-cuenta@gmail.com
EMAIL_HOST_PASSWORD=contraseña_de_16_caracteres_de_la_app
```

### 4.3 Microsoft 365 / Office 365

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_HOST_USER=tu-cuenta@dominio.onmicrosoft.com
EMAIL_HOST_PASSWORD=contraseña_de_la_cuenta
```

Con puerto 587 suele usarse STARTTLS; verificar en `settings.py` que coincida `EMAIL_USE_TLS` / `EMAIL_USE_SSL` con lo que ofrezca el servidor.

---

## 5. Producción sin Docker

Si la aplicación corre con `python manage.py runserver`, con Gunicorn/uWSGI o similar **sin** Docker:

1. **Opción A – Exportar variables en el shell antes de arrancar:**

   ```bash
   export EMAIL_HOST=smtp.dominio.gob.ar
   export EMAIL_PORT=465
   export EMAIL_HOST_USER=noreply@dominio.gob.ar
   export EMAIL_HOST_PASSWORD=contraseña_segura
   python manage.py runserver ...
   ```

2. **Opción B – Cargar un archivo `.env` con python-dotenv:**

   - Instalar: `pip install python-dotenv`
   - Al inicio de `app/snicc/settings.py` o de `manage.py`:

     ```python
     from pathlib import Path
     import os
     from dotenv import load_dotenv
     load_dotenv(Path(__file__).resolve().parent.parent / '.env')
     ```

   Así las variables definidas en `.env` estarán en `os.environ` y Django las usará.

3. **Opción C – Variables en systemd, supervisor o panel de hosting:**  
   Definir allí `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER` y `EMAIL_HOST_PASSWORD` para el proceso que ejecuta la aplicación.

---

## 6. Comprobar que el correo está configurado

1. **Revisar que las variables llegan a Django:**  
   En la consola del contenedor o del proceso:

   ```bash
   docker compose exec django python -c "from django.conf import settings; print('EMAIL_HOST:', settings.EMAIL_HOST)"
   ```

   Si imprime `EMAIL_HOST: None`, las variables no están definidas en el entorno (revisar `.env` y `docker-compose.yml`).

2. **Probar el flujo de registro:**  
   Ir a la URL de registro, completar el formulario con un correo real y enviar. Debe:
   - Redirigir a la pantalla “Ingresá el código recibido en tu email”.
   - Llegar un correo con el código al buzón indicado.

3. **Revisar logs del contenedor/servidor:**  
   Si `send_mail` falla (SMTP rechazado, timeout, etc.), Django mostrará la excepción en los logs. Eso ayuda a corregir host, puerto, usuario o contraseña.

---

## 7. Resumen rápido

| Paso | Acción |
|------|--------|
| 1 | Definir en el entorno (p. ej. en `.env`) `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`. |
| 2 | Con Docker: dejar que `docker-compose.yml` inyecte esas variables y levantar con `docker compose up -d`. |
| 3 | Sin Docker: exportar las variables o cargar `.env` con python-dotenv antes de ejecutar la app. |
| 4 | Probar registro con un correo real y verificar que llega el código. |

Con esto, el registro y el inicio de sesión por código en producción quedarán operativos.
