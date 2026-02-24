import os
import uuid
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.core.exceptions import PermissionDenied, ImproperlyConfigured
from .models import *
from django.urls import path
from django.db.models import Q, F
from pagedown.forms import ImageUploadForm

# helper

def get_lang_profile(request):
    """Returns user's language and profile."""
    if request.user.is_authenticated:
        return request.user.lang or Language.default(), request.user.profile
    profile_code = request.session.get('profile')
    profile = Profile.objects.get(code=profile_code) if profile_code else None
    return Language.objects.get(code=request.session.get('lang', DEFAULT_LANGUAGE_CODE)), profile

def base_context(request, **kwargs):
    lang, profile = get_lang_profile(request)
    c = dict(
        lang = lang,
        profile = profile,
        # categories=PostCategory.objects.filter(parent=None, hidden=False),
    )
    c.update(kwargs)
    return c

def tmp_redirect(request):
    return redirect('/main/')


# Pagedown: subida de imágenes en contenido con límite de peso (evita pérdida de calidad)
MAX_IMAGE_SIZE_MB = getattr(settings, 'MAX_IMAGE_SIZE_MB', 20)
MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
PAGEDOWN_IMAGE_UPLOAD_PATH = getattr(settings, 'PAGEDOWN_IMAGE_UPLOAD_PATH', 'pagedown-uploads')
PAGEDOWN_IMAGE_UPLOAD_UNIQUE = getattr(settings, 'PAGEDOWN_IMAGE_UPLOAD_UNIQUE', False)
PAGEDOWN_IMAGE_UPLOAD_ENABLED = getattr(settings, 'PAGEDOWN_IMAGE_UPLOAD_ENABLED', False)


@login_required
@csrf_exempt
def pagedown_image_upload_view(request):
    """Vista de subida de imágenes para el editor markdown (con límite de tamaño)."""
    if request.method != 'POST':
        raise PermissionDenied()
    if not PAGEDOWN_IMAGE_UPLOAD_ENABLED:
        raise ImproperlyConfigured('Image upload is disabled')
    form = ImageUploadForm(request.POST, request.FILES)
    if not form.is_valid():
        return JsonResponse({'success': False, 'error': form.errors})
    image = request.FILES['image']
    if image.size > MAX_IMAGE_BYTES:
        msg = f'La imagen no debe superar {MAX_IMAGE_SIZE_MB} MB (permite mantener buena calidad).'
        return JsonResponse({'success': False, 'error': {'image': [msg]}})
    path_args = [PAGEDOWN_IMAGE_UPLOAD_PATH, image.name]
    if PAGEDOWN_IMAGE_UPLOAD_UNIQUE:
        path_args.insert(1, str(uuid.uuid4()))
    path = os.path.join(*path_args)
    path = default_storage.save(path, image)
    url = default_storage.url(path)
    return JsonResponse({'success': True, 'url': url})

# posts

def landing(request):
    context = base_context(request)
    posts = Post.objects.exclude(type=Post.PostStatus.draft)
    if context['profile']:
        # order by profile adequation, then most recent
        posts = posts.filter(stars__profile=context['profile']) \
            .annotate(nb_stars=F('stars__value')) \
            .order_by('-nb_stars', '-date')
    else:
        posts = posts.order_by('-date')
    context['posts'] = posts
    return render(request, 'main/landing.html', context=context)



def summary(request, id:int):
    context = base_context(request,
        cat_id=id, 
        # posts=Post.objects.filter(category=PostCategory.objects.get(id=id)).exclude(type=Post.PostStatus.draft)
    )
    return render(request, 'main/summary.html', context=context)

def post(request, id:int, slug:str):
    context = base_context(request,
        cat_id = id, 
        # posts = Post.objects.filter(category=PostCategory.objects.get(id=id)).exclude(type=Post.PostStatus.draft),
        post = Post.objects.get(slug=slug),
    )
    context['loop_4_times'] = range(1, 5)
    # fill this afterwards to avoid hitting db for lang
    try:
        context['content'] = context['post'].content_lang(context['lang'].code)
    except PostVersion.DoesNotExist:
        context['content'] = context['post'].content

    return render(request, 'main/post.html', context=context)

# search

def search(request):
    pattern = request.GET.get('pattern')
    if pattern:
        context = base_context(request, postlist = Post.objects.filter(
            Q(tags__name__contains=pattern) | 
            Q(title__contains=pattern)      | 
            Q(body__contains=pattern) 
        ))
    else :
        context = base_context(request, 'Please specify a pattern.')
    return render(request, 'main/search.html', context=context)

# mye

def mye(request):
    context = base_context(request)
    posts = Post.objects.exclude(type=Post.PostStatus.draft)
    if context['profile']:
        # order by profile adequation, then most recent
        posts = posts.filter(stars__profile=context['profile']) \
            .annotate(nb_stars=F('stars__value')) \
            .order_by('-nb_stars', '-date')
    else:
        posts = posts.order_by('-date')
    context['posts'] = posts
    return render(request, 'main/mye.html', context=context)

# urls

app_name='main'
urlpatterns = [
    # posts
    path('<int:id>/', summary, name='summary'),
    path('<int:id>/<str:slug>', post, name='post'),
    path('search', search, name='search'),
    path("mye", mye, name='mye'),
    path('', landing, name='landing'),
]