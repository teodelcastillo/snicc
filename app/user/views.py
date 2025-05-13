from django.shortcuts import render, redirect
from django.urls import path
from django import forms
from user.models import User
from main.models import Provincia, Profile, Language
from main.viewsv2 import default_context
from django.contrib.auth import login
from django.db import IntegrityError
from .countries import COUNTRIES
from .email import Email

# Forms 
class BaseForm(forms.Form):
    name = forms.CharField()
    lastname = forms.CharField()
    country = forms.CharField()
    province = forms.IntegerField(required=False)
    city = forms.CharField()
    gender = forms.CharField()
    phone = forms.CharField(required=False)

class RegisterForm(BaseForm):
    email = forms.EmailField()  

class ProfileForm(BaseForm):
    profile = forms.CharField()
    # lang = forms.CharField()

# Auth

class LoginEmail(forms.Form):
    email = forms.EmailField()

def snicc_login(request):
    error = None
    if request.method == 'POST':
        form = LoginEmail(request.POST)
        if form.is_valid():
            try:
                user = User.objects.get(email=form.cleaned_data['email'])
                Email(user).send_code()
                return redirect('user:code', 'login', user.id)
            except User.DoesNotExist:
                error = 'Unknown user'
        else:
            error = 'Invalid email'

    context = default_context(request, {
        'error' : error
    })

    return render(request, 'user/inicia-sesion.html', context)


def validate_code(request, case, id):
    """
    case : register|login 
    id : user id
    """
    error = False
    if request.method == 'POST':
        digits = request.POST['firstdigit'] + request.POST['seconddigit'] + request.POST['thirddigit'] + request.POST['fourthdigit'] 
        user = User.objects.get(id=id)
        if user.check_code(digits):
            login(request, user)
            if case == 'login':
                return redirect('mainv2:landing')
            elif case == 'register':
                return redirect('user:register-profile')
        else:
            error = True
    context = default_context(request, {
        'case': case,
        'error': error,
        })
    return render(request, 'user/codigo.html', context)

def profile(request):
    if request.method == "POST":
        print(request.POST, flush=True)
        form = ProfileForm(request.POST)
        if form.is_valid():
            user = request.user
            try:
                province = Provincia.objects.get(gid=form.cleaned_data['province'])
            except Provincia.DoesNotExist:
                province = None            
            user.phone = form.cleaned_data['phone']
            user.first_name = form.cleaned_data['name']
            user.last_name = form.cleaned_data['lastname']
            user.gender = form.cleaned_data['gender']
            user.country = form.cleaned_data['country']
            user.province = province
            user.city = form.cleaned_data['city']
            # user.lang = Language.objects.get(code=form.cleaned_data['lang'])
            user.profile = Profile.objects.get(code=form.cleaned_data['profile'])
            user.save()
    else:
        form = ProfileForm()
    
    context = default_context(request, {
        'form': form,
        'countries': COUNTRIES,
        'provinces': Provincia.objects.all(),
        'profiles': Profile.objects.exclude(hidden=True),
    })
    return render(request, 'user/mi-perfil.html', context)

# Register

def register(request):
    context = default_context(request)
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        try:
            if form.is_valid():
                try:
                    province = Provincia.objects.get(gid=form.cleaned_data['province'])
                except Provincia.DoesNotExist:
                    province = None
                user = User.objects.create(
                    username = form.cleaned_data['email'],
                    email = form.cleaned_data['email'],
                    phone = form.cleaned_data['phone'],
                    first_name = form.cleaned_data['name'],
                    last_name = form.cleaned_data['lastname'],
                    gender = form.cleaned_data['gender'],
                    country = form.cleaned_data['country'],
                    province = province,
                    city = form.cleaned_data['city'],
                    lang = context['lang'],
                )
                # validate email
                Email(user).send_code()
                return redirect('user:code', 'register', user.id)
        except IntegrityError :
            form.add_error('email', 'A user with this name already exists.')
    else:
        form = RegisterForm()

    context.update({
        'countries': COUNTRIES,
        'form': form,
        'provinces': Provincia.objects.all()
    })
    return render(request, 'user/registrarse.html', context)

def register_profile(request):
    if request.method == 'POST':
        profile = Profile.objects.get(code=request.POST['profile'])
        request.user.profile = profile
        request.user.save()
        return redirect('mainv2:landing')
    context = default_context(request, {
        'profiles': Profile.objects.exclude(hidden=True)
    })
    return render(request, 'user/registrarse-perfil.html', context)


app_name='user'
urlpatterns = [
    path('register/profile/', register_profile, name='register-profile'),
    path('register/', register, name='register'),
    path('login/', snicc_login, name='login'),
    path('profile/', profile, name='profile'),
    path('<str:case>/<int:id>/code/', validate_code, name='code'),
]