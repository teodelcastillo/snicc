from django.db import models
from main.models import Named
from random import randint 
from django.conf import settings
from django_renderpdf import helpers as pdfhelpers
import os

# cache

class CacheResponse(models.Model):
    """Stores responses in the db"""
    request = models.CharField(max_length=200, primary_key=True)
    response = models.JSONField(null=True)

class CacheBreaker(models.Model):
    """Removes ALL cache on modification."""
    class Meta:
        abstract = True
    def save(self, *args, **kwargs):
        delete = kwargs.pop('delete_cache', True)
        super().save(*args, **kwargs)
        if delete:
            CacheResponse.objects.all().delete()

# abstract models

def random_color():
    return f'#{randint(0,0xffffff):x}'

class Colored(models.Model):    
    color = models.CharField(max_length=9, default=random_color)
    class Meta:
        abstract = True

class LongNamed(Named, CacheBreaker):
    name = models.CharField(max_length=200, verbose_name='nombre')
    class Meta:
        abstract = True

class Label(LongNamed):
    """Adaptacion, Mitigacion, Perdidas y daños"""
    pass

# metadata

class Pilar(LongNamed, Colored):    
    """Adaptacion, Mitigacion, Perdidas y daños : common version"""
    class Meta:
        verbose_name_plural = 'pilares'

class LineCategory(LongNamed, Colored):
    class Meta:
        verbose_name = 'categoría'

class Line(LongNamed, Colored):
    description = models.TextField(default='', blank=True, verbose_name='descripción', help_text='HTML permitido')
    category = models.ForeignKey(LineCategory, null=True, on_delete=models.SET_NULL, verbose_name='categoría')
    icon = models.ImageField(upload_to="icon/", blank=True, null=True)

    class Meta:
        verbose_name = 'línea/enfoque'
        verbose_name_plural = 'líneas/enfoques'

    def measure_count(self):
        return Measure.objects.filter(action__line=self).count()

class Action(LongNamed, Colored):
    description = models.TextField(default='', blank=True, verbose_name='descripción', help_text='HTML permitido')    
    class Meta:
        verbose_name = 'línea de acción'
        verbose_name_plural = 'Líneas de acción'

    line = models.ForeignKey(Line, on_delete=models.CASCADE, verbose_name='línea/enfoque')
    ingei = models.TextField(blank=True, null=True)


# metas ?

class CodeLongNamed(LongNamed):
    code = models.CharField(max_length=10)
    class Meta:
        abstract = True
        ordering = ('code',)
        
    def full_name(self):
        return self.code + ' ' + self.name

class Meta_0(CodeLongNamed):
    pass

class Meta_1(CodeLongNamed):
    meta_0 = models.ForeignKey(Meta_0, on_delete=models.CASCADE)

class Meta_2(CodeLongNamed):
    meta_1 = models.ForeignKey(Meta_1, on_delete=models.CASCADE)


# measures        

DEFAULT_TEXT_FIELDS = [
    'Descripción',
    'Metas',
    'Alcance geográfico o poblacional',
    'Riesgos climáticos asociados',
    'Reducción estimada de emisiones al 2030 (MtCO2e)',
    'Autoridad de aplicación',
    'Período de ejecución',
    'Estimación de gastos al 2030',
    'Financiamiento',
    'Instrumentos y herramientas de implementación',
    'Necesidades y barreras',
    'Indicadores para el monitoreo',
    'Análisis enfoque de género y diversidad',
    'Análisis enfoque de gestión integral del riesgo',
    'Análisis enfoque de salud',
    'Análisis enfoque de transición justa',
    'Cobeneficios entre adaptación y mitigación',
    'Relación con la Ley 27.520',
]

class ActiveMeasureManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

    def namelist(self):
        return self.values_list('name', flat=True)

class MeasureField(CacheBreaker):
    name = models.CharField(max_length=200, verbose_name='nombre')
    is_active = models.BooleanField(default=True, blank=True, verbose_name='activa')
    objects = models.Manager()
    active = ActiveMeasureManager()
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = 'detalle de medida'
        verbose_name_plural = 'detalles de medidas'

class Measure(LongNamed):
    class Status(models.TextChoices):
        prog = ('En programación', 'En programación')
        inicial = ('En implementación inicial', 'En implementación inicial')
        avanzada = ('En implementación avanzada', 'En implementación avanzada')
        adefinir = ('A definir', 'A definir')

    class Scope(models.TextChoices):
        adefinir = ('A definir', 'A definir')
        regional = ('Regional', 'Regional')
        national = ('Nacional', 'Nacional')

    MEASURE_COLOR = {
        Status.prog: "#33c45a",
        Status.inicial: "#f9ff59",
        Status.avanzada: "#ff9159",
        Status.adefinir: "#a1a1a1",
    }

    class Meta:
        verbose_name = 'medida'

    is_active = models.BooleanField(default=False, blank=True, verbose_name='activa')
    action = models.ForeignKey(Action, on_delete=models.CASCADE, verbose_name = 'línea de acción')
    code = models.CharField(max_length=6, verbose_name='codigo') # e.g. "GR-10"
    labels = models.ManyToManyField(Label, verbose_name='pilares', blank=True)
    pilares = models.ForeignKey(Pilar, null=True, on_delete=models.SET_NULL)
    year = models.IntegerField(default=2024, verbose_name='meta')
    status = models.CharField(choices=Status, default=Status.adefinir, max_length=27, verbose_name='estado de implementación')
    scope = models.CharField(choices=Scope, default=Scope.adefinir, max_length=10, verbose_name='alcance')
    add_labels = models.TextField(null=True, blank=True, verbose_name='etiquetas de fila')
    fields = models.JSONField(null=True, blank=True, verbose_name='datos internos')
    last_modified = models.DateTimeField(auto_now=True)
    national_objectives = models.ManyToManyField(Meta_2, verbose_name='metas de adaptación', blank=True)

    # manager
    objects = models.Manager()
    active = ActiveMeasureManager()

    @property
    def color(self):
        return self.MEASURE_COLOR[self.status]

    @property
    def verbose_labels(self):
        labels = self.labels.values_list('name', flat=True)
        if len(labels) > 1:            
            return ', '.join(labels[:len(labels)-1])+' y '+labels[len(labels)-1]
        return labels[0]

    @property
    def pdffile(self):
        return os.path.join(settings.MEDIA_ROOT, 'measure', f'{self.id}.pdf')

    def write_pdf(self):
        fields = list()
        if self.fields:
            for k in MeasureField.active.namelist():
                if k in self.fields:
                    fields.append((k,self.fields[k]))

        with open(self.pdffile, 'wb') as pdffile:
            pdfhelpers.render_pdf(
                template='measure/export/measure.html',
                file_=pdffile,
                # url_fetcher=pdfhelpers.django_url_fetcher(),
                context=dict(instance=self, fields=fields),
            )

    # def save(self, **kwargs):
    #     if self.id:
    #         pil = ' y '.join(self.labels.values_list('name', flat=True))
    #         try:
    #             self.pilares = Pilar.objects.get(name=pil)            
    #         except Pilar.DoesNotExist:
    #             pass
    #         super().save(**kwargs)
    #         self.write_pdf()
