from django import forms
from django.contrib import admin
from .models import *

# Extensiones y tamaño máximo para documentos de libros (PDF, Word)
ALLOWED_DOCUMENT_EXTENSIONS = ('.pdf', '.doc', '.docx')
MAX_DOCUMENT_SIZE_MB = 50


class BookAdminForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = '__all__'

    def clean_document(self):
        document = self.cleaned_data.get('document')
        if not document:
            return document
        name = getattr(document, 'name', None) or ''
        ext = '.' + name.rsplit('.', 1)[-1].lower() if '.' in name else ''
        if ext not in ALLOWED_DOCUMENT_EXTENSIONS:
            raise forms.ValidationError(
                'Solo se permiten archivos PDF o Word (.pdf, .doc, .docx).'
            )
        if document.size > MAX_DOCUMENT_SIZE_MB * 1024 * 1024:
            raise forms.ValidationError(
                f'El archivo no debe superar {MAX_DOCUMENT_SIZE_MB} MB.'
            )
        return document
# admin.site.register(Language)

class PostVersionInline(admin.TabularInline):
    model = PostVersion

class PostAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'type']
    # inlines = [
    #     PostVersionInline
    # ]

# admin.site.register(Post, PostAdmin)

admin.site.register(Author)


class BookFormatAdmin(admin.ModelAdmin):
    list_display = ['name']
    ordering = ['name']


admin.site.register(BookFormat, BookFormatAdmin)


class BookVersionInline(admin.TabularInline):
    model = BookVersion

class BookAdmin(admin.ModelAdmin):
    form = BookAdminForm
    search_fields = ['versions__title', ]

    inlines = [
        BookVersionInline
    ]

admin.site.register(Book, BookAdmin)
admin.site.register(BookReference)

class RegVersionInline(admin.TabularInline):
    model = RegulationVersion

class RegAdmin(admin.ModelAdmin):
    inlines = [
        RegVersionInline
    ]

admin.site.register(Regulation, RegAdmin)

class ILVersionInline(admin.TabularInline):
    model = InternalLinkVersion

class ILAdmin(admin.ModelAdmin):
    inlines = [
        ILVersionInline
    ]

admin.site.register(InternalLink, ILAdmin)

class ELVersionInline(admin.TabularInline):
    model = ExternalLinkVersion

class ELAdmin(admin.ModelAdmin):
    inlines = [
        ELVersionInline
    ]


admin.site.register(ExternalLink, ELAdmin)

class PlanVersionInline(admin.StackedInline):
    model = PlanVersion
    class Meta:
        verbose_name_plural = 'planes'

class PlanAdmin(admin.ModelAdmin):
    list_display = ['provincia', 'status']
    inlines = [
        PlanVersionInline
    ]

admin.site.register(Plan, PlanAdmin)



class STVersionInline(admin.StackedInline):
    model = StaticTransVersion    

class STAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(nb=models.Count('versions')).order_by('nb', 'es')
    search_fields = ['es', ]
    list_display = ['es', 'traducciones_actuales']
    
    inlines = [
        STVersionInline
    ]

admin.site.register(StaticTrans, STAdmin)