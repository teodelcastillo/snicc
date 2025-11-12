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
    context = default_context(request)
    return render(request, 'mainv2/staticpage/'+path, context)

def gc_staticpage(request, path):
    context = default_context(request)
    return render(request, 'mainv2/staticpage/gestion-climatica/'+path, context)


# dynamic pages

def landing(request):
    news = Post.objects.filter(status=Post.PostStatus.published, type=Post.PostType.news).order_by('-date')[:3]    
    context = default_context(request, {
        'news': news,
    })
    return render(request, 'mainv2/index.html', context)

def library_front(request):
    qset = Book.objects.all().order_by('-date')[:4]
    context = default_context(request, {
        'books': qset,
        'authors': Author.objects.all().annotate(nbb=Count('book')).order_by('-nbb')[:5],
        'total': {
            c.lower(): Book.objects.filter(category__icontains=c).count()
            for c in Category
        }
    })
    return render(request, 'mainv2/biblioteca.html', context=context)

def library(request):
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
        qset = qset.filter(format=format)
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
        'formats': { f: qset.filter(format=f).count() for f in Book.BookFormat },
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
    page = request.GET.get('page', 1)
    search = request.GET.get('pattern')
    regfilter = request.GET.get('filter')
    if search:
        qset = Regulation.objects.filter(Q(name__icontains=search)|Q(description__icontains=search))
    elif regfilter:
        qset = Regulation.objects.filter(linktype__iexact=regfilter)
    else: 
        qset =Regulation.objects.all()

    qset = qset.order_by('-date')
    pages = Paginator(qset, 6)
    context = default_context(request, {
        'pages' : pages,
        'regfilter': regfilter,
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
    context.update({
        'post': post,
        'html': html,
        'toc': toc,
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
    context.update({
        'parent': parent,
        'status': status,
        'texts': texts,
    })
    return render(request, 'mainv2/planes-de-respuesta.html', context)

def enlaces(request):
    page = request.GET.get('page', 1)
    qset = ExternalLink.objects.all()
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
    path('library/', library_front, name='library-front'),
    # path('library/list/', library, name='library'),
    path('staticpage/gestion-climatica/<str:path>', gc_staticpage, name='staticpage'),
    path('staticpage/<str:path>', staticpage, name='staticpage'),
    path('planes/', planes, name='planes'),
    path('enlaces/', enlaces, name='enlaces'),
    path('scrape', admin_scrape, name='admin_scrape'),
    path('', landing, name='landing'),
]