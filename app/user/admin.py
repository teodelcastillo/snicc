from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _

from .models import EditorAccess, User, Profile, Provincia

# admin.site.unregister(Group)

class EditorInline(admin.StackedInline):
    model = EditorAccess

class SniccUserAdmin(UserAdmin):
    list_display = ['username', 'editor']
    list_filter = []
    inlines = [
        EditorInline,
    ]
    fieldsets = (
        (None, {"fields": ("username", "password", 'is_staff', 'is_superuser', 'groups')}),


        (_("Personal info"), {"fields": ("lang", "profile", "province")}),
    )
    
admin.site.register(User, SniccUserAdmin)
admin.site.register(Profile)
admin.site.register(Provincia)
