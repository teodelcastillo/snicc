from django.contrib import admin
from .models import *

# Register your models here.

def _get_status(name):
    return ImplementationStatus.objects.filter(name=name).first()

@admin.action(description='Establecer el estado como A definir')
def set_status_adef(model, request, qset):
    s = _get_status('A definir')
    if s:
        qset.update(status=s)

@admin.action(description='Establecer el estado como En programación')
def set_status_prog(model, request, qset):
    s = _get_status('En programación')
    if s:
        qset.update(status=s)

@admin.action(description='Establecer el estado como En implementación avanzada')
def set_status_avan(model, request, qset):
    s = _get_status('En implementación avanzada')
    if s:
        qset.update(status=s)

@admin.action(description='Establecer el estado como En implementación inicial')
def set_status_inic(model, request, qset):
    s = _get_status('En implementación inicial')
    if s:
        qset.update(status=s)

@admin.action(description='Establecer el estado como Completada')
def set_status_comp(model, request, qset):
    s = _get_status('Completada')
    if s:
        qset.update(status=s)
@admin.action(description='Activar')
def set_active(model, request, qset):
    qset.update(is_active=True)
@admin.action(description='Desactivar')
def set_inactive(model, request, qset):
    qset.update(is_active=False)

class LineAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']

class ImplementationStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'color')
    list_editable = ('order', 'color')
    ordering = ('order', 'name')


class MeasureYearMetaInline(admin.TabularInline):
    model = MeasureYearMeta
    extra = 1
    ordering = ['year']
    verbose_name = 'meta por año'
    verbose_name_plural = 'metas por año (ej. 2023, 2024, 2030)'


class MeasureAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'status', 'is_active')
    list_filter = ('is_active', 'line', 'labels', 'status')
    search_fields = ('name', 'code')
    actions = [set_active, set_inactive, set_status_adef, set_status_inic, set_status_avan, set_status_prog, set_status_comp]
    inlines = [MeasureYearMetaInline]

    fieldsets = (
        (None, {"fields": ('code', 'name', 'is_active', 'status', 'scope')}),
        ('Relaciones', {"fields": ('line', 'action', 'pilares', 'national_objectives')}),
        # ('Datos', {"fields": ('fields',)})
    )

class ActionAdmin(admin.ModelAdmin):
    @admin.display(
        boolean=True,
        ordering="-ingei",
        description="INGEI",
    )    
    def has_ingei(self, obj):
        return obj.ingei is not None

    list_display = ('name', 'has_ingei')

admin.site.register(ImplementationStatus, ImplementationStatusAdmin)
admin.site.register(Pilar)
admin.site.register(Line, LineAdmin)
admin.site.register(LineCategory)
admin.site.register(Action, ActionAdmin)
admin.site.register(Measure, MeasureAdmin)

class MeasureFieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    actions = [set_active, set_inactive]
    change_list_template = 'admin/measurefield/change_list.html'
admin.site.register(MeasureField, MeasureFieldAdmin)

admin.site.register(Meta_0)
admin.site.register(Meta_1)
admin.site.register(Meta_2)


class ProgressReportAdmin(admin.ModelAdmin):
    list_display = ('year', 'display_title', 'file', 'created_at')
    list_filter = ('year',)
    ordering = ('-year', '-created_at')
    search_fields = ('title',)

    def display_title(self, obj):
        return obj.display_title()
    display_title.short_description = 'título'
    display_title.admin_order_field = 'title'


admin.site.register(ProgressReport, ProgressReportAdmin)
