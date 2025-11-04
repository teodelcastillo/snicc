from markdown import markdown, Markdown
from django.db import models
from django.core.exceptions import ObjectDoesNotExist

class Named(models.Model):
    name = models.CharField(max_length=40, verbose_name='nombre')    
    def __str__(self):
        return self.name
    class Meta:
        abstract = True

# meta

class Provincia(Named):
    gid = models.IntegerField(null=True)
    code = models.CharField(primary_key=True, max_length=5, verbose_name='código')
    name = models.CharField(max_length=50, verbose_name='nombre')

    class Meta:
        ordering = ['name']

class Profile(Named):
    code = models.CharField(primary_key=True, max_length=20, verbose_name='código')
    name = models.CharField(max_length=100, verbose_name='nombre')
    hidden = models.BooleanField(default=False, blank=True, verbose_name='oculto')
    image = models.FileField(upload_to='profile', null=True)
    color = models.CharField(default='#000000', max_length=10)
    specific_url = models.CharField(max_length=50, null=True, blank=True, help_text='relevant post slug')

    class Meta:
        verbose_name = 'perfil'
        verbose_name_plural = 'perfiles'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # create a stars profile for existing posts
        if not self.hidden:
            for p in Post.objects.exclude(stars__profile=self):
                p.stars.get_or_create(profile=self)

# lang

DEFAULT_LANGUAGE_CODE = 'es'

class Language(Named):
    """Main language class."""
    code = models.CharField(max_length=3, primary_key=True, verbose_name='código')
    order = models.IntegerField(default=20)

    class Meta:
        ordering = ('order', 'name',)
        verbose_name = 'idioma'

    @classmethod
    def default(cls):
        return cls.objects.get_or_create(order=1, code=DEFAULT_LANGUAGE_CODE, name='Español')[0]

    def is_default(self):
        return self.code == DEFAULT_LANGUAGE_CODE

class LanguageVersion(models.Model):
    """Abstract class for all translations. Language choices are all but the default language."""
    lang = models.ForeignKey(Language, on_delete=models.CASCADE) #, limit_choices_to=~models.Q(code=DEFAULT_LANGUAGE_CODE))
    class Meta:
        abstract = True

class Versioned:
    """Abstract class for objects having translations. Assumes there is a 'versions' attribute to locate languages."""
    def get_version(self, lang:Language|str):
        # if lang.is_default():
        #     return self        
        if isinstance(lang,str):
            lang = Language.objects.get(code=lang)
        try:
            return self.versions.filter(lang=lang).latest('date')
        except ObjectDoesNotExist:
            return self.versions.filter(lang='es').latest('date')

class VersionedNoDate:
    """Abstract class for objects having translations. Assumes there is a 'versions' attribute to locate languages."""
    def get_version(self, lang:Language|str):
        # if lang.is_default():
        #     return self        
        if isinstance(lang,str):
            lang = Language.objects.get(code=lang)
        try:
            return self.versions.get(lang=lang)
        except ObjectDoesNotExist:
            return self.versions.get(lang='es')



# tags

class Tag(Named):
    class Meta:
        ordering = ('name',)
        verbose_name = 'etiqueta'
        verbose_name_plural = 'etiquetas'

# post categories

class Category(models.TextChoices):
    adaptacion = 'Adaptación'
    perdidas = 'Pérdidas y daños'
    mitigacion = 'Mitigación'
    capacitacion = 'Capacitación'
    normativas = 'Normativas'

class CategoryExtended(models.TextChoices):
    adaptacion = 'Adaptación', 'Adaptación'
    perdidas = 'Pérdidas y daños', 'Pérdidas y daños'
    mitigacion = 'Mitigación', 'Mitigación'
    capacitacion = 'Capacitacion', 'Capacitación'
    normativas = 'Normativas', 'Normativas'    
    apyd = 'Adaptación, Pérdidas y daños', 'Adaptación y Pérdidas y daños'
    mpyd = 'Mitigación, Pérdidas y daños', 'Mitigación y Pérdidas y daños'
    am = 'Adaptación, Mitigación', 'Adaptación y Mitigación'
    ampyd = 'Adaptación, Mitigación, Pérdidas y daños', 'Adaptación, Mitigación y Pérdidas y daños'

# posts

MAX_HISTORY = 20

class Post(models.Model, Versioned):
    """Main object. Contains no text, but has date and language versions."""

    class PostStatus(models.IntegerChoices):
        draft = (1, 'borrador')
        published = (2, 'publicado')

    class PostType(models.IntegerChoices):
        news = (1, 'novedad')
        resource = (2, 'recurso')

    class Meta:
        verbose_name = 'recurso/novedad'
        verbose_name_plural = 'recursos/novedades'

    # metadata
    type = models.IntegerField(choices=PostType, default=PostType.resource, verbose_name='typo',
                               help_text='Las publicaciones establecidas como "novedad" aparecerán en la sección de novedades, la más reciente primero.')
    parent = models.ForeignKey('Post', null=True, blank=True, on_delete=models.SET_NULL, 
                               verbose_name='padre',
                               related_name='children', help_text="solo para recursos")
    category = models.CharField(choices=CategoryExtended, max_length=50, default=CategoryExtended.ampyd, verbose_name='categoria')
    slug = models.SlugField(max_length=30, unique=True, help_text="autoset")
    # tags = models.ManyToManyField(Tag, blank=True)
    status = models.IntegerField(choices=PostStatus, default=PostStatus.draft, verbose_name='estado')
    image = models.FileField(upload_to='title', null=True, blank=True, verbose_name='imagen')
    date = models.DateTimeField(auto_now=True)
    protected = models.BooleanField(blank=True, default=False, help_text='Special post, should never be deleted.')

    def lang_list(self):
        return Language.objects.filter(postversion__post=self)

    def is_draft(self):
        return self.status == self.PostStatus.draft
    
    def is_published(self):
        return self.status == self.PostStatus.published

    def ordered_children(self):
        return self.children.order_by('slug')

    @property
    def is_news(self):
        return self.type == self.PostType.news

    @property
    def is_resource(self):
        return self.type == self.PostType.resource

    @property
    def content(self):
        # should always exist
        return self.versions.filter(lang__code=DEFAULT_LANGUAGE_CODE).latest('date')
    
    def content_lang(self, lang_code:str=DEFAULT_LANGUAGE_CODE):
        return self.versions.filter(lang__code=lang_code).latest('date')

    def __str__(self):
        return self.content.title if self.content else 'none'

    def parents(self):
        if self.parent:
            return self.parent.parents() + [self.parent]
        return []

class PostVersion(LanguageVersion):
    """Language and date version of the Post."""
    title = models.CharField(max_length=100, verbose_name='título')
    body = models.TextField(verbose_name='texto', blank=True, null=True) 
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='versions')
    date = models.DateTimeField(auto_now=True)
    user = models.ForeignKey('user.User', null=True, on_delete=models.SET_NULL)
    short = models.CharField(max_length=500, verbose_name='texto de la tarjeta', help_text='Descripción breve, 500 caracteres como máximo', null=True, blank=True)

    class Meta:
        ordering = ['-date']

    def html(self):
        if self.body:
            md = Markdown(extensions=['tables'])
            return md.convert(self.body)
        return ''

    def html_toc(self):
        if self.body:
            md = Markdown(extensions=['tables', 'toc'])
            html = md.convert(self.body)
            return html, md.toc_tokens
        return '', []

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # post date is content date
        if self.lang.is_default:
            self.post.date = self.date
            self.post.save(update_fields=['date'])

POST_PROFILE_MAX_VALUE = 5

class PostProfile(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='stars')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='stars')
    value = models.IntegerField(default=0)
    class Meta:
        unique_together = ["profile", "post"]

    def __str__(self):
        return str(self.post)+'/'+str(self.profile)


# Normativas

class Regulation(models.Model, VersionedNoDate):
    class Meta:
        verbose_name = 'normativa'
        verbose_name_plural = 'normativas'

    class LinkType(models.TextChoices):
        decreto = 'Decreto'
        ley = 'Ley'
        administrativo = 'Decisiones administrativas'
        resolucion = 'Resolucion'

    linktype = models.CharField(choices=LinkType, max_length=30, default=LinkType.ley)    
    url = models.URLField()
    date = models.DateTimeField()

    def __str__(self):
        return self.versions.get(lang__code='es').name

class RegulationVersion(LanguageVersion):
    reg = models.ForeignKey(Regulation, on_delete=models.CASCADE, related_name='versions')
    name = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)


# Books

def upload_image_path(instance, filename):
    return 'book/'+instance.id+'_'+filename
    
class Author(models.Model):
    class Meta:
        verbose_name = 'autor'
        verbose_name_plural = 'autores'

    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name
    
class Book(models.Model, VersionedNoDate):
    class Meta:
        verbose_name = 'libro'

    def __str__(self):
        try: 
            return self.versions.get(lang__code='es').title
        except :
            return 'Missing es version'

    class BookFormat(models.TextChoices):
        documento = 'Documento'
        infografia = 'Infografía'

    year = models.IntegerField(default=2025)
    category = models.CharField(choices=CategoryExtended, max_length=50, default=CategoryExtended.ampyd)
    date = models.DateTimeField(auto_now=True)
    url = models.URLField(null=True, blank=True)
    # title = models.CharField(max_length=100)
    # description = models.TextField(null=True)
    authors = models.ManyToManyField(Author, blank=True)
    image = models.FileField(upload_to='books', blank=True, null=True)
    # specific book categories
    comunidad = models.BooleanField(default=False, blank=True)
    capacitaciones = models.BooleanField(default=False, blank=True)
    ciudadania = models.BooleanField(default=False, blank=True)
    format = models.CharField(choices=BookFormat, null=True, max_length=20)

class BookVersion(LanguageVersion):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='versions')
    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    class Meta:
        unique_together = ('lang', 'book')

class BookReference(models.Model):
    """Manytomany link"""
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='posts')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='books')

    class Meta:
        ordering = ['book']
        verbose_name = 'Documentación complementaria'
        verbose_name_plural = 'Documentación complementaria'

    def __str__(self):
        return f'{self.post} -> {self.book}'

# Links

class InternalLink(models.Model, VersionedNoDate):
    """Link from a Post to a specific view or url"""
    parent = models.ForeignKey(Post, null=True, on_delete=models.CASCADE, related_name='links')
    image = models.FileField(upload_to='title', null=True, blank=True)
    # not an UrlField
    view = models.CharField(max_length=50, null=True, blank=True, help_text='Exactly one of this or "url" must be set.')
    viewargs = models.CharField(max_length=50, null=True, blank=True)
    url = models.URLField(null=True, blank=True, help_text='Exactly one of this or "view" must be set.')

    def __str__(self):
        if self.view:
            return f'{self.parent} -> {self.view}'
        return f'{self.parent} -> {self.url}'

class InternalLinkVersion(LanguageVersion):
    link = models.ForeignKey(InternalLink, on_delete=models.CASCADE, related_name='versions')
    title = models.CharField(max_length=100, verbose_name='titulo')    
    description = models.TextField(null=True, blank=True, verbose_name='texto de la tarjeta', help_text='Descripción breve, 500 caracteres como máximo')
    class Meta:
        unique_together = ('lang', 'link')

class ExternalLink(models.Model, VersionedNoDate):
    class Meta:
        verbose_name = 'enlace de interés'
        verbose_name_plural = 'enlace de interés'
    url = models.URLField()
    category = models.CharField(choices=CategoryExtended, max_length=50, default=CategoryExtended.ampyd)

    def __str__(self):
        return self.url

class ExternalLinkVersion(LanguageVersion):
    link = models.ForeignKey(ExternalLink, on_delete=models.CASCADE, related_name='versions')
    name = models.CharField(max_length=100)    
    description = models.TextField(null=True, blank=True)
    class Meta:
        unique_together = ('lang', 'link')

# Planes

class Plan(models.Model, VersionedNoDate):
    class Meta:
        verbose_name_plural = 'planes'
        
    class PlanStatus(models.IntegerChoices):
        nopres = (1, 'No presentado')
        precon_ana = (2, 'En proceso de preconvalidación (análisis ANA-SsA)')
        precon_map = (3, 'En proceso de preconvalidación (análisis MAP-GNCC)')
        precon = (4, 'En proceso de preconvalidación')
        convalidado = (5, 'Convalidado')
    
    provincia = models.ForeignKey(Provincia, on_delete=models.CASCADE)
    status = models.IntegerField(choices=PlanStatus, default=PlanStatus.nopres)
    url = models.URLField(null=True, blank=True)

class PlanVersion(LanguageVersion):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name='versions')
    authority = models.TextField(null=True, blank=True)
    respuesta = models.TextField(null=True, blank=True)
    regulations = models.TextField(null=True, blank=True)
    contact = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('lang', 'plan')

class StaticTrans(models.Model, Versioned):
    class Meta:
        verbose_name = 'traducción estática'
        verbose_name_plural = 'traducciones estáticas'
    es = models.TextField(verbose_name='Español', unique=True)
    def __str__(self):
        return self.es

    def traducciones_actuales(self):
        trads = self.versions.values_list('lang', flat=True)
        if trads:
            return ', '.join(trads)
        return '-'    

class StaticTransVersion(models.Model):
    lang = models.ForeignKey(Language, on_delete=models.CASCADE, limit_choices_to=~models.Q(code=DEFAULT_LANGUAGE_CODE))
    es = models.ForeignKey(StaticTrans, on_delete=models.CASCADE, related_name='versions')
    trad = models.TextField()

    class Meta:
        unique_together = ('lang', 'es')