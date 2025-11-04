from difflib import HtmlDiff

from django.contrib.auth.decorators import user_passes_test
from django.forms.models import model_to_dict
from django.shortcuts import redirect, render, reverse
from django.templatetags.l10n import localize
from django.urls import path
from django.utils import timezone
from main.models import Language, Post, PostVersion, Profile, POST_PROFILE_MAX_VALUE
from measure.models import Measure, DEFAULT_TEXT_FIELDS, Line, MeasureField
from django.db.models import F

from .forms import PostForm, PostVersionForm, NewPostForm

# Create your views here.

def has_access(user):
    return hasattr(user, 'access')

def has_measures(user):
    return has_access(user) and user.access.measures

# List

@user_passes_test(has_access)
def postlist(request):
    access = request.user.access
    # language permissions
    if access.all_lang:
        languages = Language.objects.all()
    else:
        languages = access.langs.all()
    posts = Post.objects.all().order_by('-date')
    return render(request, 'dashboard/post_list.html', context={'languages':languages, 'posts': posts})

# Posts

@user_passes_test(has_access)
def post_edit(request, id:int=None):
    # check user permission
    instance = Post.objects.get(id=id) if id else None
    
    if request.method == 'POST':
        form = PostForm(request.POST, files=request.FILES, instance=instance)
        
        if form.is_valid():
            form.save()
            # should we really save a new version ?
            commit_version = True
            if instance:
                oldcontent = instance.content
                commit_version = not (oldcontent.body == form.cleaned_data['body'] and
                                      oldcontent.short == form.cleaned_data['short'] and
                                      oldcontent.title == form.cleaned_data['title'])
            if commit_version:
                form.instance.versions.create(
                    body = form.cleaned_data['body'],
                    title = form.cleaned_data['title'],
                    short = form.cleaned_data['short'],
                    user = request.user,
                    lang = Language.default(),
                )
            # save profile values
            for prof in Profile.objects.filter(hidden=False):
                form.instance.stars.update_or_create(
                    profile=prof,
                    defaults={'value':request.POST.get('prof-'+prof.code, 0)},
                )

            if 'save-back' in request.POST:
                return redirect('mainv2:post', form.instance.slug)
            return redirect('dashboard:postlist')
    else:
        if instance:
            form = PostForm(instance=instance, initial=model_to_dict(instance.content))
        else:
            form = NewPostForm()
    context={
        'form':form, 
        'profiles':Profile.objects.filter(hidden=False),
        'profile_max_value': POST_PROFILE_MAX_VALUE,
    }
    if instance:
        # annotates profiles with the correct value if exists
        # annotates posts with stars, assuming they all exist (see Profile.save())
        context['profiles'] = context['profiles'].filter(stars__post=instance) \
            .annotate(val=F('stars__value'))

    return render(request, 'dashboard/post_edit.html', context=context)

@user_passes_test(has_access)
def edit_translation(request, id:int, lang:str):
    # TODO : do not save when title and body are unchanged
    # check user permission
    lang = Language.objects.get(code=lang)
    access = request.user.access # exists because we tested it
    
    if not (access.all_lang or access.langs.contains(lang)):
        return redirect('dashboard:postlist')

    if lang.is_default():
        return redirect('dashboard:edit', id=id)
    post = Post.objects.get(id=id)
    try:
        pv = post.content_lang(lang_code=lang.code)
    except PostVersion.DoesNotExist:
        pv = None

    if request.method == 'POST':
        form = PostVersionForm(request.POST)
        if form.is_valid(post):
            # filling remaining info
            form.instance.user = request.user
            form.instance.post = post
            form.instance.lang = lang
            form.save()
            return redirect('dashboard:postlist')
    else:
        initial = model_to_dict(pv) if pv else {}
        initial.update({'user':request.user, 'post':post, 'lang':lang})
        form = PostVersionForm(initial=initial)

    return render(request, 'dashboard/translation_edit.html', context={'form':form, 'post':post, 'pv':pv, 'lang':lang})    

# Versioning

@user_passes_test(has_access)
def history(request, id:int, lang:str):
    p = Post.objects.get(id=id)
    return render(request, 'dashboard/post_history.html', context={
        'post':p,
        'history': p.versions.filter(lang__code=lang),
        })

@user_passes_test(has_access)
def restore(request, id:int):
    pv = PostVersion.objects.get(id=id)
    if not request.user.access.can_edit(pv):
        return redirect('dashboard:postlist')
    # create a new, more recent object
    pv.id = None
    pv.user = request.user
    pv.save()
    return redirect('dashboard:history', id=pv.post.id, lang=pv.lang.code)

def localize_datetime(value):
    return localize(timezone.template_localtime(value))

@user_passes_test(has_access)
def show_diff(request, id:int):
    pv = PostVersion.objects.get(id=id)
    current = pv.post.content_lang(lang_code=pv.lang.code)
    
    # edition urls
    restore_url = reverse('dashboard:restore', args=[pv.id])
    if pv.lang.is_default():
        edit_url = reverse('dashboard:edit', args=[pv.post.id])
    else:
        edit_url = reverse('dashboard:translation', args=[pv.post.id, pv.lang.code])

    loc_date = localize_datetime(pv.date)

    diff = HtmlDiff(wrapcolumn=80).make_table(
        pv.body.splitlines(keepends=True), 
        current.body.splitlines(keepends=True),
        fromdesc=f'{loc_date} por {pv.user}<br>(<a href="{restore_url}">restore this version</a>)',
        todesc=f'current version por {current.user}<br>(<a href="{edit_url}">edit this version</a>)',
        )
    return render(request, 'dashboard/post_history_diff.html', context={'diff':diff, 'pv':pv})

@user_passes_test(has_access)
def delete(request, id:int):
    if not request.user.access.can_delete:
        return redirect('dashboard:postlist')
    Post.objects.get(id=id).delete()
    return redirect('dashboard:postlist')

# MEASURES

@user_passes_test(has_measures)
def measure_list(request):
    # qset = Measure.objects.all().order_by('-last_modified')
    lines = Line.objects.all()
    return render(request, 'dashboard/measure/list.html', context={'lines': lines}) #{'measures': qset})

@user_passes_test(has_measures)
def measure_preview(request, id:int):
    instance = Measure.objects.get(id=id)
    if request.method == 'POST' and request.user.is_staff:
        instance.is_active = True
        instance.save()
    inactive = MeasureField.objects.filter(is_active=False).values_list('name', flat=True)
    return render(request, 'dashboard/measure/preview.html', context={'instance':instance, 'inactive':inactive})


@user_passes_test(has_measures)
def measure_edit(request, id:int):
    instance = Measure.objects.get(id=id)
    if request.method == 'POST':
        instance.fields = {f:request.POST.get(f) for f in DEFAULT_TEXT_FIELDS}
        instance.status = request.POST.get('status')
        instance.save()
        return redirect('dashboard:measure_preview', id=instance.id)
    fields = {f:'' for f in DEFAULT_TEXT_FIELDS}
    if instance.fields:
        fields.update(instance.fields)
    inactive = MeasureField.objects.filter(is_active=False).values_list('name', flat=True)
    return render(request, 'dashboard/measure/edit.html', context={'instance': instance, 'fields': fields, 'inactive':inactive})

# URLS

app_name='dashboard'
urlpatterns = [
    path('new/', post_edit, name='new'),
    path('post/<int:id>/edit/', post_edit, name='edit'),
    path('post/<int:id>/<str:lang>/edit/', edit_translation, name='translation'),
    path('post/<int:id>/<str:lang>/history/', history, name='history'),
    path('version/<int:id>/restore', restore, name='restore'),
    path('version/<int:id>/diff', show_diff, name='diff'),
    path('post/<int:id>/delete/', delete, name='delete'),
    path('post/list', postlist, name='postlist'),
    # measures
    path('measure/<int:id>/edit/', measure_edit, name='measure_edit'),
    path('measure/<int:id>/', measure_preview, name='measure_preview'),
    path('measure/', measure_list, name='measure_list'),
]