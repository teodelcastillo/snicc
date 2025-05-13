# SNICC Installation

See [doc/install.md](doc/install.md) for a detailed procedure with outputs.

## Prerequisites

Install [docker](https://docs.docker.com/get-started/get-docker/).

Clone the git.

```bash
git clone https://github.com/laurent-braud/snicc.git
cd snicc
```

## Run docker image

Copy `dot.env` to `.env`, setting host port as desired.

Run the container.
```bash
docker compose up -d
docker exec django bash
# build static files
python manage.py collectstatic
# install migrations in the database
python manage.py makemigrations
python manage.py migrate
# install initial metadata
python manage.py loaddata lang meta perfil provincias
# install measure hierarchy
python manage.py loaddata ex lines measurefields pilares metas
# create a superuser
python manage.py createsuperuser
exit
```

Navigate to `<SITE>/admin/user/user/1/change/` and give the superuser full editor access ("Todas las secciones", "Todos los idiomas", etc). Save the changes (_guardar_).

Navigate to `<SITE>/editor/new/` and create at least one post _publicado_ under _Información General_. Only title is needed. After that the site should be up and running.

## Install measures

This operation will install data in the portal. 
**Be advised that this data was extracted from existing sources and should be considered as placeholder material.**

```bash
# open the shell
docker exec django bash
mkdir media/measure
python manage.py shell
```

```python
from measure import load
load.measures()
# load inner fields
load.fill_measures()
# load metas
load.metas_medidas()
```

## Create users

Open a browser to `/admin` endpoint and log in with the superuser credentials.

See the [User Guide](doc/user.md) for instructions to create new users.