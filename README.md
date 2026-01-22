# SNICC Installation

See [doc/install.md](doc/install.md) for a detailed procedure with outputs.

## Prerequisites

Install [docker](https://docs.docker.com/get-started/get-docker/).

Clone the git.

```bash
git clone https://github.com/laurent-braud/snicc.git
cd snicc
```

## Ejecutar la imagen (entorno de producción)

Copiá `dot.env` a `.env` y configurá los puertos deseados.

Levantá los contenedores.
```bash
docker compose up -d
docker exec django bash
# compilar archivos estáticos
python manage.py collectstatic
# aplicar migraciones en la base
python manage.py makemigrations
python manage.py migrate
# cargar catálogos iniciales
python manage.py loaddata lang perfil profile provincias
# cargar jerarquía de medidas
python manage.py loaddata linecategories labels lines measurefields pilares metas
# crear un superusuario
python manage.py createsuperuser
exit
```

## Ejecutar el stack de desarrollo

Este stack solo levanta el contenedor de Django (sin nginx) y expone la app en `http://localhost:8000/`.

```bash
docker compose -f dev.docker-compose.yml up -d
docker compose -f dev.docker-compose.yml exec django bash
cd /code
# repetí los mismos comandos de migrate/loaddata que en producción
```

Cuando termines, salí con `exit` y reiniciá el servicio si hace falta con `docker compose -f dev.docker-compose.yml restart django`.

Navigate to `<SITE>/admin/user/user/1/change/` and give the superuser full editor access ("Todas las secciones", "Todos los idiomas", etc). Save the changes (_guardar_).

Navigate to `<SITE>/editor/new/` and create at least one post _publicado_ under _Información General_. Only title is needed. After that the site should be up and running.

## Instalar medidas

Esta operación instala datos en el portal.
**Tené en cuenta que los datos provienen de fuentes existentes y funcionan como contenido placeholder.**

```bash
# abrir el shell
docker exec django bash
mkdir media/measure
python manage.py shell
```

```python
from measure import load
load.measures()
# cargar campos internos
load.fill_measure()
# cargar metas
load.metas_medidas()
```

## Crear usuarios

Abrí un navegador en `/admin` e iniciá sesión con el superusuario.

Consultá la [Guía de Usuario](doc/user.md) para crear nuevos usuarios.