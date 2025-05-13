from django.shortcuts import render, redirect
from .models import *
from django.urls import path
from django.db.models import Q, F

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