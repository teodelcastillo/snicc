from django.db.models import Count, Q
from django.shortcuts import render, redirect
from .models import *
from django.urls import path
from django.http import JsonResponse, HttpResponse, HttpRequest
from main.views import base_context
from collections import Counter
import pandas as pd
import numpy as np
import math
from pypdf import PdfWriter
import csv
from django.contrib.admin.views.decorators import staff_member_required

# cache

def json_cache(fun):
    """Cache decorator."""
    def cached_fun(request:HttpRequest, *args):
        cr, created = CacheResponse.objects.get_or_create(request=request.get_full_path())
        if created:
            js = fun(request, *args)
            cr.response = js
            cr.save()
        else:
            try:
                js = cr.response
            except Exception as e:
                cr.delete()
                raise e
            if js is None:
                js = fun(request, *args)
                cr.response = js
                cr.save()
        return JsonResponse(js)
    
    return cached_fun

# measures

def measure_fields(request, id):
    m = Measure.objects.get(id=id)
    
    if m.fields :
        fields = {k : m.fields[k] for k in MeasureField.active.namelist() if k in m.fields}
    else:
        fields = {}
    return JsonResponse(dict(
        fields = fields,
        year = m.year,
        status = m.status,
        name = m.name,
    ))

STATUS_COLOR = {
    'En implementación avanzada': '#65AD9D',
    'En implementación inicial': '#D21685',
    'En programación': '#F9E297',
    'A definir': '#3A3669'
}
STATUS_DICT = {x.label:None for x in Measure.Status}

def stacked_bar(qset):
    """Pandas black magic."""
    pilares = list(Pilar.objects.values_list('name', flat=True))
    statuses = list(STATUS_DICT.keys())
    pilstatset = set(pilares).union(statuses)

    vals = Counter(qset.values_list('pilares__name', 'action__line__name'))
    vals.update(Counter(qset.values_list('status', 'action__line__name')))
    # make and pivot the dataframe
    if vals:
        df = pd.DataFrame(vals.values(), index=vals.keys()).unstack().droplevel(0,axis=1)
        # add empty 
        for emptyval in pilstatset.difference(df.index):
            df.loc[emptyval] = None
        keys = list(df.columns)
        # height = (keys.length-1)*((keys.length-1) > 4 ? 70:75)+50; 
        height = len(keys)*70+50 if len(keys) > 4 else len(keys)*75+50
        keys = ['x'] + keys
        # remove nans, include index, convert to list
        arr = df.fillna(np.nan).replace([np.nan], [None]).reset_index().to_numpy().tolist()
        arr = [ keys, ['value'] ] + arr
    else:
        df = pd.DataFrame(columns=['bla'], index=list(pilstatset))
        keys = ['x']
        height = 0
        arr = [ keys ]

    colors = {x[0]:x[1] for x in Pilar.objects.values_list('name', 'color')}
    colors.update(STATUS_COLOR)
    
    # build response
    return {
        'keys': keys,
        'height': height,
        'values': arr,
        'groups': [ pilares, list(statuses), ],
        'colors':colors,
    }


def qset_builder(request):
    """General filter analysis.
    # Filters:

    # Returns:
    """
    qset = Measure.active.all()
    lines = []
    fil = dict()
    lineqset = Line.objects.all()

    years = request.GET.getlist('year')
    if years:
        fil['year__in'] = years

    cat_id = request.GET.get('cat')
    if cat_id:
        lineqset = lineqset.filter(category_id=cat_id)
        fil['action__line__category_id'] = cat_id

    pil = request.GET.getlist('pilar')
    if pil:
        fil['pilares_id__in'] = pil
    else:
        labels = request.GET.getlist('tag')
        if labels:
            fil['labels__in'] = labels

    actions = request.GET.getlist('action')
    if actions:
        fil['action_id__in'] = actions

    statuses = request.GET.getlist('status')
    if statuses:
        fil['status__in'] = statuses

    lines = request.GET.getlist('line')
    if lines:
        # lineqset = lineqset.filter(id__in=lines)
        fil['action__line__in'] = lines

    qset = qset.filter(**fil)
    return qset, lineqset, fil


def make_status_stats(qset):
    """"
    status": {
        "colors": {
                "A definir": "#D9D9D9",
                "En implementación avanzada":"#93C47D",
                "En implementación inicial":"#FFE599",
                "En programación":"#FF9090"
        },
        "data": {
                "A definir": 18,
                "En implementación avanzada": 3,
                "En implementación inicial": 9,
                "En programación": 12
        },
        "keys": ["En programación", "En implementación inicial", "En implementación avanzada", "A definir"]
    }   """
    d = STATUS_DICT.copy()
    d.update(Counter(qset.values_list('status', flat=True)))
    return{
        'colors': STATUS_COLOR,
        'data': d,
        'keys': list(d.keys()),
    }
    
def make_small_status_stats(qset):
    """
    "stats": [
    {
        "name": "En programación",
        "value": 3,
        "percent": 75,
        "degrees_text": (totalPercent - (percent/2)) * 3.6,
        "x_text": 38 * Math.cos( ((degrees_text)-90) * Math.PI/180 ),
        "y_text": -38 * Math.sin( ((degrees_text)-90) * Math.PI/180 ),
        "color": "#FF9090"
    },...]
    "actions"
    """
    total = qset.count()
    d = Counter(qset.values_list('status', flat=True))
    verbose, simple = list(), dict()
    tmpsum = 0
    for status in STATUS_DICT.keys():        
        if status in d:
            v = d[status]
            tmpsum += v
            deg = (tmpsum - v/2) * 360/total
            rad = math.radians(deg-90)
            x_text = 38 * math.cos(rad)
            y_text = -38 * math.sin(rad)
            verbose.append({'name':status, 'value':v, 'percent':round(100*v/total, 2),'color':STATUS_COLOR.get(status,'#ffffff'),
                        'degrees_text':deg, 'x_text':x_text, 'y_text':y_text,})
            simple[status] = v if v else 0
        else:
            verbose.append({'name': status, 'value': None, 'color':STATUS_COLOR.get(status,'#ffffff'),
                         'degrees_text':0, 'x_text':0, 'y_text':0,})
            simple[status] = 0
    return (verbose, simple)

def measure_filter(request):
    """Measure filtering : category ('cat'), line, pilar list ('pilar')."""
    # build qset
    qset, lineqset, fil = qset_builder(request)
    if 'cat' in request.GET:
        # lines
        linecolors = {line.name:line.color for line in lineqset.all()}
        linestat = {line:None for line in linecolors.keys()}    
        linestat.update(Counter(qset.values_list('action__line__name', flat=True)))
        res = {'stats': {'lines': {
            'data': linestat,
            'colors':linecolors,
            'keys': list(linecolors.keys()),
        }}}
    else:
        # categories
        catcolors = {cat.name:cat.color for cat in LineCategory.objects.all()}
        catstats = {cat:None for cat in catcolors.keys()}    
        catstats.update(Counter(qset.values_list('action__line__category__name', flat=True)))
        res = {'stats': {'lines': { # it's lines, but it will work anyway
            'data': catstats,
            'colors':catcolors,
            'keys': list(catcolors.keys()),
        }}}
    # pilares
    pilcolors = {pil.name:pil.color for pil in Pilar.objects.all()}
    pilstat = {pil:None for pil in pilcolors.keys()}
    pilstat.update(Counter(qset.values_list('pilares__name', flat=True)))
    pilares = {
        'data': pilstat,
        'colors': pilcolors,
        'keys': list(pilcolors.keys()),
    }
    # general stats
    total = qset.count()
    status_stats = make_status_stats(qset)
    
    # build response
    res['stats'].update({
            'total': total,
            'pilares': pilares,
            'status': status_stats,
            'stackedbar': stacked_bar(qset),
        },)
    return res

@json_cache
def filter_details(request):
    qset, lineqset, fil = qset_builder(request)
    # remove empty lines
    tmpfil = { 'action__measure__'+k:v for k,v in fil.items()}
    lineqset = lineqset.annotate(mcount=Count('action__measure', filter=Q(**tmpfil))).filter(mcount__gt=0)

    lineres, actionres = [], []
    for line in lineqset:
        lineres.append({'id':line.id, 'name':line.name})
        for action in line.action_set.all():
            measure_set = action.measure_set.filter(is_active=True, **fil)
            if measure_set.exists():
                verbose_stats, simple_stats = make_small_status_stats(measure_set)
                actionres.append({
                    'name': action.name,
                    'id': action.id,
                    'ingei': action.ingei,
                    'total': measure_set.count(),
                    'stats': verbose_stats,
                    'stats_simple': simple_stats,
                    'measures': list(measure_set.values('id', 'code', 'name', 'status')),
                })

    return {'actions': actionres, 'lines': lineres, 'status':make_status_stats(qset)}

@json_cache
def measure_filter_json(request):
    return measure_filter(request)

def measure_list(request):
    context = base_context(request)
    context.update({
        'years': Measure.active.values_list('year', flat=True).distinct().order_by('year'),
        'linecat': LineCategory.objects.all(),
        'lines': Line.objects.all(),
        'actions': Action.objects.all(),
        'pilares': Pilar.objects.all(),
        'statuses': Measure.Status,
    })

    if request.GET:
        context['res'] = measure_filter(request)

    return render(request, 'measure/list.html', context=context)

def action_details_dict(action:Action, fil={}):
    """fil : measure filter dict"""

    def measure_det(m):
        return {
            'code':m.code,
            'id': m.id,
            'name':m.name,
            'pilares':m.pilares.name,
            'autoritad': m.fields.get('Autoridad de aplicación') if m.fields else '',
            'scope': m.scope,
            'status': m.status,
        }

    return {
        'name': action.name,
        'id': action.id,
        'description': action.description,
        'ingei': action.ingei,
        'measures' : [ measure_det(m) for m in action.measure_set.filter(**fil) ]
    }

@json_cache
def action_details(request, id):
    action = Action.objects.get(id=id)
    return action_details_dict(action, qset_builder(request)[2])

@json_cache
def line_details(request):
    def action_filter(line, fil):
        reslist = list()
        for a in line.action_set.all():
            d = action_details_dict(a, fil)
            if d.get('measures'):
                reslist.append(d)
        return reslist
                
    # line = Line.objects.get(id=id)
    qset, lineqset, fil = qset_builder(request)
    return {
        'lines':[{
            'name': line.name,
            'description': line.description,
            'icon': line.icon.url if line.icon else None,
            'actions': action_filter(line, fil),
        } for line in lineqset],
        'status':make_status_stats(qset),
    }

# Export

def one_measure_pdf(request, id):
    m = Measure.active.get(id=id)
    # just copy the file
    with open(m.pdffile, 'rb') as f:
        return HttpResponse(f.read(), content_type="application/pdf")

def many_measures_pdf(request):
    qset = qset_builder(request)[0]
    if qset.count() > 50:
        raise ValueError('Too many measures.')
    pdflist = [ m.pdffile for m in qset ]
    res = HttpResponse(content_type="application/pdf")
    merger = PdfWriter()

    for pdf in pdflist:
        merger.append(pdf)

    merger.write(res)
    merger.close()
    return res

def many_measures_csv(request):
    qset = qset_builder(request)[0]
    res = HttpResponse(content_type="text/csv")
    writer = csv.writer(res)
    writer.writerow(['Línea o enfoque', 'Línea de acción', 'Nombre', 'Estado de implementación', 'Pilares', 'Autoridad de aplicación',])
    for m in qset.order_by('action__line__name', 'action__name'):
        if m.fields:
            writer.writerow([m.action.line, m.action, m.name, m.status, m.pilares, m.fields.get('Autoridad de aplicación', ''),])
        else:
            writer.writerow([m.action.line, m.action, m.name, m.status, m.pilares, '',])
    return res

# recalc

@staff_member_required
def measure_pdf_recalc(request):
    for m in Measure.active.all():
        m.write_pdf()

    return redirect('admin:index')


def mye_overview(request):
    context = base_context(request)

    # Total medidas activas
    measures = Measure.active.all()
    total_measures = measures.count()

    # Conteos por estado
    count_by_status = Counter(measures.values_list('status', flat=True))
    avanzada = count_by_status.get(Measure.Status.avanzada, 0)
    inicial = count_by_status.get(Measure.Status.inicial, 0)
    exec_count = avanzada + inicial
    percent_advanced = round((avanzada / total_measures) * 100) if total_measures > 0 else 0

    # Pilar predominante
    top_pilar = (Pilar.objects
                 .annotate(num=Count('measure', filter=Q(measure__is_active=True)))
                 .order_by('-num')
                 .first())
    top_pilar_name = top_pilar.name if top_pilar else ""
    top_pilar_count = top_pilar.num if top_pilar else 0

    # Estado predominante (agrupado)
    prog = count_by_status.get(Measure.Status.prog, 0)
    indef = count_by_status.get(Measure.Status.adefinir, 0)
    if exec_count >= prog and exec_count >= indef:
        pred_status_name = "En Curso"
        pred_status_count = exec_count
    elif prog >= indef:
        pred_status_name = "En programación"
        pred_status_count = prog
    else:
        pred_status_name = "A definir"
        pred_status_count = indef

    context.update({
        'total_measures': total_measures,
        'percent_advanced': percent_advanced,
        'execution_count': exec_count,
        'top_pilar_name': top_pilar_name,
        'top_pilar_count': top_pilar_count,
        'pred_status_name': pred_status_name,
        'pred_status_count': pred_status_count,
    })

    return render(request, 'mainv2/mye.html', context)

def measure_list_json(request):
    """
    Devuelve un listado simple de medidas activas con los campos principales,
    usado por el módulo MyE (mye.html) para renderizar las cards dinámicamente.
    """
    measures = Measure.active.all().values(
        "id",
        "name",
        "status",
        "description",
        "pilares__name",
        "action__line__name",
    )

    data = []
    for m in measures:
        # Si el campo 'fields' existe, buscamos la autoridad de aplicación
        measure_obj = Measure.objects.get(id=m["id"])
        responsable = ""
        if measure_obj.fields:
            responsable = measure_obj.fields.get("Autoridad de aplicación", "")

        data.append({
            "id": m["id"],
            "name": m["name"],
            "status": m["status"],
            "description": m["description"],
            "pilar": m["pilares__name"],
            "linea": m["action__line__name"],
            "responsable": responsable,
        })

    return JsonResponse({"measures": data})





app_name='measure'
urlpatterns = [
    path('list/', measure_list, name='list'),
    path('<int:id>/pdf', one_measure_pdf, name='pdf-export'),
    path('<int:id>/', measure_fields, name='details'),
    path('filter.json', measure_filter_json, name='filter'),
    path('details.json', filter_details, name='details'),
    path('lines.json', line_details, name='line_details'),
    path('export.pdf', many_measures_pdf, name='concat-pdf-export'),
    path('export.csv', many_measures_csv, name='csv-export'),
    path('action/<int:id>/', action_details, name='action_details'),
    path('recalc/', measure_pdf_recalc, name='recalc'),
    path('mye/', mye_overview, name='mye'),

]