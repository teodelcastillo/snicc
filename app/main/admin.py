from django.contrib import admin
from .models import *

admin.site.site_header = 'SNIC admin'
admin.site.register(Language)

class PostVersionInline(admin.TabularInline):
    model = PostVersion

class PostAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'type']
    # inlines = [
    #     PostVersionInline
    # ]

# admin.site.register(Post, PostAdmin)

admin.site.register(Author)

class BookVersionInline(admin.TabularInline):
    model = BookVersion

class BookAdmin(admin.ModelAdmin):
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