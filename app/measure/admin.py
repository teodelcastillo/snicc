from django.contrib import admin
from .models import *

# Register your models here.
@admin.action(description='Establecer el estado como '+Measure.Status.adefinir)
def set_status_adef(model, request, qset):
    qset.update(status=Measure.Status.adefinir)
@admin.action(description='Establecer el estado como '+Measure.Status.prog)
def set_status_prog(model, request, qset):
    qset.update(status=Measure.Status.prog)
@admin.action(description='Establecer el estado como '+Measure.Status.avanzada)
def set_status_avan(model, request, qset):
    qset.update(status=Measure.Status.avanzada)
@admin.action(description='Establecer el estado como '+Measure.Status.inicial)
def set_status_inic(model, request, qset):
    qset.update(status=Measure.Status.inicial)
@admin.action(description='Activar')
def set_active(model, request, qset):
    qset.update(is_active=True)
@admin.action(description='Desactivar')
def set_inactive(model, request, qset):
    qset.update(is_active=False)

class LineAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']

class MeasureAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'status', 'is_active')
    list_filter = ('is_active', 'action__line', 'labels')
    search_fields = ('name','code')
    actions = [set_active, set_inactive, set_status_adef, set_status_inic, set_status_avan, set_status_prog]

    fieldsets = (
        (None, {"fields": ('code', 'name', 'is_active', 'year', 'status', 'scope')}),
        ('Relaciones', {"fields": ('action', 'pilares', 'national_objectives')}),
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
