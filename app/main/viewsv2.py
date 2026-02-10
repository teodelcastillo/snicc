import json
from django.shortcuts import render, redirect
from .models import *
from django.urls import path
from django.db.models import Q, F, Count
from django.core.paginator import Paginator, EmptyPage
from .util import scrape

def get_lang_profile(request):
    """Returns user's language and profile."""
    # TODO : profiles
    # if request.user.is_authenticated:
    #     return request.user.lang or Language.default(), request.user.profile
    profile_code = request.session.get('profile')
    profile = Profile.objects.get(code=profile_code) if profile_code else None

    try:
        lang = Language.objects.get(code=request.COOKIES.get('idioma_snic', 'es'))
    except Language.DoesNotExist:
        lang = Language.objects.get(code='es')
     
    return lang, profile

def default_context(request, add=None):
    lang, profile = get_lang_profile(request)
    res = dict(
        languages = Language.objects.all(),
        lang = lang,
        profile = profile
    )
    if add:
        res.update(add)
    return res


# static pages

def staticpage(request, path):
    if path == 'mye.html':
        return redirect('measure:mye')
    context = default_context(request)
    return render(request, 'mainv2/staticpage/'+path, context)

def gc_staticpage(request, path):
    context = default_context(request)
    return render(request, 'mainv2/staticpage/gestion-climatica/'+path, context)


# dynamic pages

# IDs de los posts pilares del home (enlaces por ID para que no se rompan si cambia el slug)
LANDING_PILLAR_POST_IDS = (16, 12, 31, 13)  # que-es-el-cambio-climatico, sobre-adaptacion, sobre-mitigacion, sobre-perdidas-y-danos


def landing(request):
    news = Post.objects.filter(status=Post.PostStatus.published, type=Post.PostType.news).order_by('-date')[:3]
    pillar_posts = {p.pk: p for p in Post.objects.filter(pk__in=LANDING_PILLAR_POST_IDS)}
    context = default_context(request, {
        'news': news,
        'post_que': pillar_posts.get(16),
        'post_adapt': pillar_posts.get(12),
        'post_mit': pillar_posts.get(31),
        'post_pyda': pillar_posts.get(13),
    })
    return render(request, 'mainv2/index.html', context)

#def library_front(request):
#    qset = Book.objects.all().order_by('-date')[:4]
#    context = default_context(request, {
#        'books': qset,
#        'authors': Author.objects.all().annotate(nbb=Count('book')).order_by('-nbb')[:5],
#        'total': {
#            c.lower(): Book.objects.filter(category__icontains=c).count()
#            for c in Category
#        }
#    })
#    return render(request, 'mainv2/biblioteca.html', context=context)

def library(request):
    page = request.GET.get('page', 1)
    sort = request.GET.get('sort', 'recent')
    catfilter = request.GET.getlist('filter')
    author = request.GET.get('author')
    search = request.GET.get('pattern')
    bookcat = request.GET.get('bookcat')
    format = request.GET.get('format')

    # ordenar según criterio
    order_map = {
        'recent': '-date',
        'date': '-date',
        'author': 'authors__name',
        'title': 'versions__title',
    }
    order = order_map.get(sort, '-date')

    # queryset base
    qset = Book.objects.all()
    if format:
        qset = qset.filter(format_type__name=format)
    if bookcat:
        qset = qset.filter(**{bookcat: True})
    if search:
        qset = qset.filter(
            Q(authors__name__icontains=search) |
            Q(versions__title__icontains=search) |
            Q(versions__description__icontains=search)
        )
    for cat in catfilter:
        qset = qset.filter(category__icontains=cat)
    if author:
        qset = qset.filter(authors__id=author)

    qset = qset.distinct().order_by(order)

    try:
        books = Paginator(qset, 8).page(page)
    except EmptyPage:
        books = Paginator(qset, 8).page(1)

    context = default_context(request, {
        'books': books,
        'catfilter': catfilter,
        'bookcat': bookcat,
        'pattern': search,
        'format': format,
        'formats': {f.name: qset.filter(format_type=f).count() for f in BookFormat.objects.all()},
        'author': Author.objects.get(id=author) if author else None,
        'authors': Author.objects.all().annotate(
            nbb=Count('book', filter=Q(book__in=qset))
        ).exclude(nbb=0).order_by('-nbb')[:5],
        'total': {
            c.lower(): qset.filter(category__icontains=c).count()
            for c in Category
        },
        'current_sort': sort,
    })

    return render(request, 'mainv2/biblioteca.html', context)
    page = request.GET.get('page', 1)
    # find the correct query filter
    order = {
        'date': '-date',
        'author': 'authors__name',
        'title': 'versions__title',
    }[request.GET.get('order', 'date')]
    catfilter = request.GET.getlist('filter')
    author = request.GET.get('author')    
    search = request.GET.get('pattern')
    bookcat = request.GET.get('bookcat')
    format = request.GET.get('format')
    qset = Book.objects.all()
    if format: 
        qset = qset.filter(format_type__name=format)
    if bookcat: # comunidad, capacitationes, ciudadania
        qset = qset.filter(**{bookcat:True})
    if search : 
        qset = qset.filter(
                Q(authors__name__icontains=search)|
                Q(versions__title__icontains=search)|
                Q(versions__description__contains=search)
            )
    for cat in catfilter:
        qset = qset.filter(category__icontains=cat)
    if author: 
        qset = qset.filter(authors__id=author)        
    qset = qset.distinct().order_by(order)
    try:
        books = Paginator(qset, 8).page(page)
    except EmptyPage:
        books = Paginator(qset, 8).page(1)
    context = default_context(request, {
        'books': books,
        'catfilter': catfilter,
        'bookcat': bookcat,
        'pattern': search,
        'format': format,
        'formats': { f.name: qset.filter(format_type=f).count() for f in BookFormat.objects.all() },
        'author': Author.objects.get(id=author) if author else None,
        # 'authors': Counter(qset.values_list('authors__name', flat=True)),
        'authors': Author.objects.all().annotate(nbb=Count('book', filter=Q(book__in=qset))).exclude(nbb=0).order_by('-nbb')[:5],
        'total': {
            c.lower(): qset.filter(category__icontains=c).count()
            for c in Category
        }
    })
    return render(request, 'mainv2/biblioteca-filtro.html', context=context)

def news(request):
    page = request.GET.get('page', 1)
    newsfilter = request.GET.get('filter')
    qset = Post.objects.filter(status=Post.PostStatus.published, type=Post.PostType.news)
    if newsfilter:
        qset = qset.filter(category__iexact=newsfilter)
    qset = qset.order_by('-date')
    pages = Paginator(qset, 8)
    context = default_context(request, {
        'news': pages.page(page),
        'newsfilter': newsfilter,
        'total': {
            c.lower(): Post.objects.filter(status=Post.PostStatus.published, type=Post.PostType.news, category__icontains=c).count()
            for c in Category
        }

    })
    return render(request, 'mainv2/novedades.html', context)

def regulations(request):
    try:
        page = int(request.GET.get('page', 1))
    except (TypeError, ValueError):
        page = 1
    search = request.GET.get('pattern')
    regfilter = request.GET.get('filter')
    if search:
        qset = Regulation.objects.filter(
            Q(versions__name__icontains=search) | Q(versions__description__icontains=search)
        ).distinct()
    elif regfilter:
        qset = Regulation.objects.filter(linktype__iexact=regfilter)
    else:
        qset = Regulation.objects.all()

    qset = qset.order_by('-date')
    pages = Paginator(qset, 6)
    context = default_context(request, {
        'pages': pages,
        'regfilter': regfilter,
        'pattern': search,
        'regs': pages.page(page),
        'total': {
            lt.lower(): Regulation.objects.filter(linktype=lt).count()
            for lt in Regulation.LinkType
        }
    })
    return render(request, 'mainv2/normativas.html', context)

def post(request, slug):
    # print(request.META, flush=True)
    context = default_context(request)
    post = Post.objects.get(slug=slug)
    html, toc = post.get_version(context['lang']).html_toc()
    # Número de columnas para las cards: 1 card → 50% ancho (2 cols); 2–4 cards → mismo número de cols
    cards_count = post.ordered_children().filter(status=Post.PostStatus.published).count() + post.links.count()
    cards_cols = 2 if cards_count == 1 else min(4, max(1, cards_count))
    context.update({
        'post': post,
        'html': html,
        'toc': toc,
        'cards_cols': cards_cols,
    })
    return render(request, 'mainv2/post.html', context)

def search(request):
    pattern = request.GET.get('pattern')
    postfilter = request.GET.get('filter')    
    page = request.GET.get('page', 1)
    found = Post.objects.filter(status=Post.PostStatus.published).filter(
        Q(versions__body__icontains=pattern)| 
        Q(versions__title__icontains=pattern)
        ).distinct()
    # TODO : perform an union on books and regulations. This 
    # books = Book.objects.filter(Q(title__icontains=pattern)|Q(description__icontains=pattern))
    # qset = found.union(books)
    qset = found
    if postfilter:
        qset = qset.filter(category__iexact=postfilter)
    posts = Paginator(qset, 6).get_page(page)

    context = default_context(request, {
        'count': found.count(),
        'pattern': pattern,
        'posts': posts,
        'postfilter': postfilter,        
        'total': {
            c.lower(): found.filter(category=c).count()
            for c in Category
        }
    })
    return render(request, 'mainv2/buscar.html', context)

def planes(request):
    context = default_context(request)
    lang = context['lang']
    status = { p.provincia.gid : p.status for p in Plan.objects.all() }
    texts = {}
    for p in Plan.objects.all():
        pv:PlanVersion = p.get_version(lang)
        texts[str(p.provincia.gid)] = {
            # TODO : translate title
            'authority': {"title": "Autoridad de aplicación", "text": pv.authority},
            'plan': {"title": "Plan de respuesta", "text": pv.respuesta},
            'regulations': {"title": "Normativa provincial", "text": pv.regulations},
            'contact': {"title": "Contacto", "text": pv.contact},
            'url': p.url if p.url else '',
        }
    try:
        parent = Post.objects.get(slug='ley-n-27520')
    except Post.DoesNotExist:
        parent = None
    caba_texts_gid = islas_texts_gid = None
    for p in Plan.objects.select_related('provincia').all():
        if p.provincia.gid is None:
            continue
        name = (p.provincia.name or '').lower()
        if 'ciudad' in name and 'buenos aires' in name:
            caba_texts_gid = p.provincia.gid
        if 'tierra del fuego' in name or 'islas del atlántico' in name or 'islas del atlantico' in name:
            islas_texts_gid = p.provincia.gid
    if caba_texts_gid is None:
        caba_texts_gid = 6
    if islas_texts_gid is None:
        islas_texts_gid = 24
    # El GeoJSON usa gid=1 para CABA; en el admin CABA puede ser provincia.gid=6. Duplicamos bajo clave 1
    # para que el front use feature.properties.gid sin lógica especial (igual que el resto de provincias).
    if caba_texts_gid is not None and caba_texts_gid in status:
        status[1] = status[caba_texts_gid]
        texts['1'] = texts[str(caba_texts_gid)]
    context.update({
        'parent': parent,
        'status': status,
        'texts': texts,
        'caba_texts_gid': caba_texts_gid,
        'islas_texts_gid': islas_texts_gid,
    })
    return render(request, 'mainv2/planes-de-respuesta.html', context)

def enlaces(request):
    page = request.GET.get('page', 1)
    # Excluir enlaces que ya se muestran como tarjetas destacadas (SIMARCC, INGEI, Planes de Respuesta)
    qset = ExternalLink.objects.exclude(
        Q(url__icontains='simarcc.ambiente.gob.ar')
        | Q(url__icontains='inventariogei.ambiente.gob.ar')
        | Q(url__icontains='main/planes')
    )
    links = Paginator(qset, 6).get_page(page)
    context = default_context(request, {
        'qset': links,
        'total': {
            c.lower(): qset.filter(category__icontains=c).count()
            for c in Category
        }
    })
    return render(request, 'mainv2/enlaces-de-interes.html', context)

# admin stuff

def admin_scrape(request):
    if request.user.is_staff:
        scrape()
        return redirect('/admin/main/statictrans/')
    return redirect('mainv2:landing')

# urls

app_name='main'
urlpatterns = [
    # posts
    path('post/<str:slug>', post, name='post'),
    path('search/', search, name='search'),
    path('regulations/', regulations, name='regulations'),
    path('news/', news, name='news'),
    path('library/', library, name='library'),
    # path('library/list/', library, name='library'),
    path('staticpage/gestion-climatica/<str:path>', gc_staticpage, name='staticpage'),
    path('staticpage/<str:path>', staticpage, name='staticpage'),
    path('planes/', planes, name='planes'),
    path('enlaces/', enlaces, name='enlaces'),
    path('scrape', admin_scrape, name='admin_scrape'),
    path('', landing, name='landing'),
]