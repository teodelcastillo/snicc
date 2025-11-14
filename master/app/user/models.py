from django.contrib import admin
from django.db import models
from django.contrib.auth.models import AbstractUser
from main.models import Language, Profile, Provincia
from django.utils import timezone
from random import randint

# Create your models here.

class User(AbstractUser):
    class UserGender(models.TextChoices):
        male = 'Varon'
        female = 'Mujer'
        no = 'No'
        otro = 'Otro'

    profile = models.ForeignKey(Profile, blank=True, null=True, on_delete=models.SET_NULL, verbose_name='perfil')
    gender = models.CharField(choices=UserGender, max_length=20, default=UserGender.no)
    country = models.CharField(null=True, blank=True, max_length=10)
    province = models.ForeignKey(Provincia, blank=True, null=True, on_delete=models.SET_NULL)
    city = models.CharField(null=True, blank=True, max_length=50)
    phone = models.CharField(null=True, blank=True, max_length=20)
    lang = models.ForeignKey(Language, blank=True, null=True, on_delete=models.SET_NULL, verbose_name='idioma')

    @admin.display(boolean=True)
    def editor(self):
        return hasattr(self, 'access')

    @property
    def is_writer(self):
        """User can write initial posts in the default language."""
        # assumes access
        return self.access.all_lang or self.access.langs.contains(Language.default())

    # codes

    def new_code(self)->str:
        code, _ = UserCode.objects.get_or_create(user=self)
        return code.randomize()

    def check_code(self, value:str)->bool:
        return hasattr(self, 'code') and self.code.is_valid() and self.code.code == value
            
            
def random_code()->str:
    return f'{randint(1,9999):04}'

CODE_EXPIRATION_MINUTES = 10

class UserCode(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='code')
    code = models.CharField(max_length=4, default=random_code)
    creation = models.DateTimeField(auto_now=True)

    def is_valid(self):
        return self.creation + timezone.timedelta(minutes=CODE_EXPIRATION_MINUTES) > timezone.now()

    def randomize(self):
        # should auto-update creation date 
        self.code = random_code()
        self.save()
        return self.code


# admin 

class EditorAccess(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='access')
    all_lang = models.BooleanField(default=False, blank=True, verbose_name='todos los idiomas')
    langs = models.ManyToManyField(Language, verbose_name='idiomas', blank=True)
    can_delete = models.BooleanField(default=False, blank=True, verbose_name='puede eliminar')
    measures = models.BooleanField(default=False, blank=True, verbose_name='medidas')
    
    def can_edit(self, postversion):
        return (self.all_lang or self.langs.contains(postversion.lang))

    def __str__(self):
        return f'access/{self.user}/'