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
        return self.measures.count()

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

class ImplementationStatus(models.Model):
    """Estado de implementación de una medida. Gestionable desde el admin (crear, editar, eliminar)."""
    name = models.CharField(max_length=80, unique=True, verbose_name='nombre')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='orden')
    color = models.CharField(max_length=9, default='#a1a1a1', verbose_name='color')

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'estado de implementación'
        verbose_name_plural = 'estados de implementación'

    def __str__(self):
        return self.name


class Measure(LongNamed):
    class Scope(models.TextChoices):
        adefinir = ('A definir', 'A definir')
        regional = ('Regional', 'Regional')
        national = ('Nacional', 'Nacional')

    class Meta:
        verbose_name = 'medida'

    # Override LongNamed.name for measures (255 chars)
    name = models.CharField(max_length=255, verbose_name='nombre')
    is_active = models.BooleanField(default=False, blank=True, verbose_name='activa')
    line = models.ForeignKey(
        Line,
        on_delete=models.SET_NULL,
        related_name='measures',
        verbose_name='línea/enfoque',
        null=True,
        blank=True,
    )
    action = models.ForeignKey(
        Action,
        on_delete=models.SET_NULL,
        related_name='measure_set',
        null=True,
        blank=True,
        verbose_name='línea de acción'
    )
    code = models.CharField(max_length=12, verbose_name='codigo') # e.g. "GR-10"
    labels = models.ManyToManyField(Label, verbose_name='pilares', blank=True)
    pilares = models.ForeignKey(Pilar, null=True, on_delete=models.SET_NULL)
    status = models.ForeignKey(
        ImplementationStatus,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='measures',
        verbose_name='estado de implementación',
    )
    scope = models.CharField(choices=Scope, default=Scope.adefinir, max_length=10, verbose_name='alcance')
    fields = models.JSONField(null=True, blank=True, verbose_name='datos internos')
    last_modified = models.DateTimeField(auto_now=True)
    national_objectives = models.ManyToManyField(Meta_2, verbose_name='metas de adaptación', blank=True)

    # manager
    objects = models.Manager()
    active = ActiveMeasureManager()

    @property
    def color(self):
        return (self.status.color if self.status else '#a1a1a1')

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


class MeasureYearMeta(models.Model):
    """Meta por año para una medida. Una medida puede tener varias metas (ej. 2023, 2024, 2030)."""
    measure = models.ForeignKey(
        Measure,
        on_delete=models.CASCADE,
        related_name='target_years',
        verbose_name='medida',
    )
    year = models.IntegerField(verbose_name='año meta')

    class Meta:
        ordering = ['year']
        verbose_name = 'meta por año'
        verbose_name_plural = 'metas por año'
        constraints = [
            models.UniqueConstraint(fields=['measure', 'year'], name='unique_measure_year'),
        ]

    def __str__(self):
        return f"{self.measure.code} - {self.year}"


class ProgressReport(models.Model):
    """
    Reporte de progreso del monitoreo (MYE). Carga año a año desde el admin;
    se muestra el más reciente primero en el dropdown.
    """
    class Meta:
        verbose_name = 'reporte de progreso'
        verbose_name_plural = 'reportes de progreso'
        ordering = ['-year', '-created_at']

    year = models.IntegerField(verbose_name='año')
    title = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='título',
        help_text='Opcional. Ej: "Reporte de Progreso 2024". Si está vacío se usa "Reporte de Progreso {año}".',
    )
    file = models.FileField(
        upload_to='measure/progress_reports',
        verbose_name='archivo PDF',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha de carga')

    def __str__(self):
        return self.title or f'Reporte de Progreso {self.year}'

    def display_title(self):
        return self.title or f'Reporte de Progreso {self.year}'
