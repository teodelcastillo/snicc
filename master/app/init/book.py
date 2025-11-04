

from main.models import *
import pandas as pd
from django.utils import timezone

BOOKFILE = '/code/init/Biblioteca.csv'

def book(csvfile=BOOKFILE):
    """
    Converts csv :
        Título,Año,Descripción,Autor,Tipo de archivo,Link sinia,Link externo,Código,Perfil,Clasificación,documentos complementarios,Ubicación en la estructura
        +Link
        
    into model :
        class Book(models.Model):
            class Meta:
                verbose_name = 'libro'

            year = models.IntegerField(default=2025)
            category = models.CharField(choices=Category, max_length=25, default=Category.adaptacion)
            date = models.DateTimeField(auto_now=True)
            url = models.URLField(null=True, blank=True)
            title = models.CharField(max_length=100)
            description = models.TextField(null=True)
            authors = models.ManyToManyField(Author, blank=True)
            image = models.FileField(upload_to='books', blank=True, null=True)
            # specific book categories
            comunidad = models.BooleanField(default=False, blank=True)
            capacitaciones = models.BooleanField(default=False, blank=True)
            ciudadania = models.BooleanField(default=False, blank=True)
    """
    es = Language.default()
    df = pd.read_csv(csvfile)   
    for _, row in df.iterrows():        
        book, _ = Book.objects.get_or_create(
            year = row['Año'],
            # title = row['Título'], 
            # description = row['Descripción'],
            url = row['Link'],
            format = row['Tipo de archivo'],
            category = row['ampyd']
        )
        bookv, _ = BookVersion.objects.get_or_create(
            lang = es,
            book = book,
            title = row['Título'], 
            description = row['Descripción'],
        )
        # classification
        try: 
            for c in row['Clasificación'].split(', '):
                if c == 'Capacitaciones':
                    book.capacitaciones = True
                if c == 'Ciudadanía':
                    book.ciudadania = True
                if c == 'Comunidad Educativa':
                    book.comunidad = True
            book.save()
        except AttributeError: # float
            pass

        try:
            for author in row['Autor'].split(';'):
                a, _ = Author.objects.get_or_create(name=author.strip())
                book.authors.add(a)
        except:
            continue
    BookVersion.objects.filter(description='nan').update(description='')

def reg(csvfile="/code/init/regulations.csv"):

    """
    Tipo de Norma,Título de la norma,Número,Fecha,Link,,Ubicación en la estructura
    ==> 
    class Regulation(models.Model):
        class Meta:
            verbose_name = 'normativa'
            verbose_name_plural = 'normativas'

        class LinkType(models.TextChoices):
            decreto = 'Decreto'
            ley = 'Ley'
            administrativo = 'Administrativo'
            resolucion = 'Resolucion'

        linktype = models.CharField(choices=LinkType, max_length=20, default=LinkType.ley)
        url = models.URLField()
        name = models.CharField(max_length=150)
        description = models.TextField(null=True, blank=True)
        date = models.DateTimeField()
    """
    TYPES = {
        'Decisión Administrativa': Regulation.LinkType.administrativo,
        'Decreto Nacional': Regulation.LinkType.decreto,
        'Ley Nacional': Regulation.LinkType.ley,
        'Resolución COFEMA': Regulation.LinkType.resolucion,
        'Resolución Nacional': Regulation.LinkType.resolucion,
    }
    es = Language.default()
    now = timezone.now()
    df = pd.read_csv(csvfile)
    for _, row in df.iterrows():
        reg, _ = Regulation.objects.get_or_create(
            url = row['Truelink'],
            date = now.replace(year=int(row['Fecha'])),
            linktype = TYPES[row["Tipo de Norma"]]
        )
        RegulationVersion.objects.get_or_create(
            reg = reg,
            lang = es,
            name = row['Número'],
            description = row['Título de la norma'],
        )
