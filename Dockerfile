FROM python:latest
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r /code/requirements.txt
RUN pip install --force-reinstall --no-cache pypdf