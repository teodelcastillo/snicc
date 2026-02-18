from django.db.models import Count, Q, Prefetch
from django.shortcuts import render, redirect, get_object_or_404
from .models import *
from django.urls import path
from django.http import JsonResponse, HttpResponse, HttpRequest
from main.views import base_context
from main.viewsv2 import default_context
from collections import Counter
import re
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
    years_list = [
        {'year': y.year, 'short_description': y.short_description or '', 'description': y.description or ''}
        for y in m.target_years.all().order_by('year')
    ]
    return JsonResponse(dict(
        fields=fields,
        years=years_list,
        status=m.status.name if m.status else None,
        name=m.name,
    ))

def _status_color_dict():
    return dict(
        ImplementationStatus.objects.values_list('name', 'color')
    )

def _status_dict():
    return {name: None for name in ImplementationStatus.objects.values_list('name', flat=True).order_by('order')}

RESPONSABLE_FIELD_NAME = 'Autoridad de aplicación'


def _is_responsable_field_active():
    return MeasureField.active.filter(name=RESPONSABLE_FIELD_NAME).exists()

def stacked_bar(qset):
    """Pandas black magic."""
    pilares = list(Pilar.objects.values_list('name', flat=True))
    statuses = list(_status_dict().keys())
    pilstatset = set(pilares).union(statuses)

    vals = Counter(qset.values_list('pilares__name', 'line__name'))
    vals.update(Counter(qset.values_list('status__name', 'line__name')))
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

    colors = {x[0]: x[1] for x in Pilar.objects.values_list('name', 'color')}
    colors.update(_status_color_dict())
    
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
        try:
            years_int = [int(y) for y in years if y]
            if years_int:
                fil['target_years__year__in'] = years_int
        except (ValueError, TypeError):
            pass

    cat_id = request.GET.get('cat')
    if cat_id:
        lineqset = lineqset.filter(category_id=cat_id)
        fil['line__category_id'] = cat_id

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
        fil['status__name__in'] = statuses

    lines = request.GET.getlist('line')
    if lines:
        fil['line_id__in'] = lines

    qset = qset.filter(**fil)
    if years and fil.get('target_years__year__in'):
        qset = qset.distinct()
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
    d = _status_dict().copy()
    d.update(Counter(qset.values_list('status__name', flat=True)))
    return {
        'colors': _status_color_dict(),
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
    d = Counter(qset.values_list('status__name', flat=True))
    status_colors = _status_color_dict()
    status_keys = list(_status_dict().keys())
    verbose, simple = list(), dict()
    tmpsum = 0
    for status in status_keys:
        if status in d:
            v = d[status]
            tmpsum += v
            deg = (tmpsum - v/2) * 360/total
            rad = math.radians(deg-90)
            x_text = 38 * math.cos(rad)
            y_text = -38 * math.sin(rad)
            verbose.append({'name': status, 'value': v, 'percent': round(100*v/total, 2), 'color': status_colors.get(status, '#ffffff'),
                            'degrees_text': deg, 'x_text': x_text, 'y_text': y_text})
            simple[status] = v if v else 0
        else:
            verbose.append({'name': status, 'value': None, 'color': status_colors.get(status, '#ffffff'),
                            'degrees_text': 0, 'x_text': 0, 'y_text': 0})
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
        linestat.update(Counter(qset.values_list('line__name', flat=True)))
        res = {'stats': {'lines': {
            'data': linestat,
            'colors':linecolors,
            'keys': list(linecolors.keys()),
        }}}
    else:
        # categories
        catcolors = {cat.name:cat.color for cat in LineCategory.objects.all()}
        catstats = {cat:None for cat in catcolors.keys()}    
        catstats.update(Counter(qset.values_list('line__category__name', flat=True)))
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
    tmpfil = {'measures__' + k: v for k, v in fil.items()}
    lineqset = lineqset.annotate(mcount=Count('measures', filter=Q(**tmpfil))).filter(mcount__gt=0)

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
                    'measures': [
                        {'id': x['id'], 'code': x['code'], 'name': x['name'], 'status': x['status__name'] or ''}
                        for x in measure_set.values('id', 'code', 'name', 'status__name')
                    ],
                })

    return {'actions': actionres, 'lines': lineres, 'status':make_status_stats(qset)}

@json_cache
def measure_filter_json(request):
    return measure_filter(request)

def measure_list(request):
    context = base_context(request)
    context.update({
        'years': MeasureYearMeta.objects.values_list('year', flat=True).distinct().order_by('year'),
        'linecat': LineCategory.objects.all(),
        'lines': Line.objects.all(),
        'actions': Action.objects.all(),
        'pilares': Pilar.objects.all(),
        'statuses': ImplementationStatus.objects.all().order_by('order'),
    })

    if request.GET:
        context['res'] = measure_filter(request)

    return render(request, 'measure/list.html', context=context)

def action_details_dict(action:Action, fil={}):
    """fil : measure filter dict"""

    def measure_det(m):
        return {
            'code': m.code,
            'id': m.id,
            'name': m.name,
            'pilares': m.pilares.name,
            'autoritad': m.fields.get('Autoridad de aplicación') if m.fields else '',
            'scope': m.scope,
            'status': m.status.name if m.status else '',
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
    for m in qset.order_by('line__name', 'action__name'):
        if m.fields:
            writer.writerow([m.line, m.action, m.name, m.status.name if m.status else '', m.pilares, m.fields.get('Autoridad de aplicación', ''),])
        else:
            writer.writerow([m.line, m.action, m.name, m.status.name if m.status else '', m.pilares, '',])
    return res

# recalc

@staff_member_required
def measure_pdf_recalc(request):
    for m in Measure.active.all():
        m.write_pdf()

    return redirect('admin:index')


def mye_overview(request):
    """
    Vista principal del módulo MyE en la versión mainv2.
    Renderiza la página con información agregada para los
    contadores iniciales (el detalle dinámico se completa vía JS).
    """
    context = default_context(request)

    measures = Measure.active.select_related('pilares', 'line', 'status').all()
    total_measures = measures.count()

    # Tarjetas fijas: Total, En Implementación, Completadas (según card_category del estado)
    implementation_count = measures.filter(status__card_category='implementation').count()
    completadas = measures.filter(status__card_category='completed').count()
    percent_implementation = round((implementation_count / total_measures) * 100) if total_measures > 0 else 0

    count_by_status = Counter(measures.values_list('status__name', flat=True))
    avanzada = count_by_status.get('En implementación avanzada', 0)
    inicial = count_by_status.get('En implementación inicial', 0)

    top_pilar = (Pilar.objects
                 .annotate(num=Count('measure', filter=Q(measure__is_active=True)))
                 .order_by('-num')
                 .first())
    top_pilar_name = top_pilar.name if top_pilar else ""
    top_pilar_count = top_pilar.num if top_pilar else 0

    prog = count_by_status.get('En programación', 0)
    indef = count_by_status.get('A definir', 0)
    status_candidates = [
        ("En implementación", implementation_count),
        ("En programación", prog),
        ("Completadas", completadas),
        ("A definir", indef),
    ]
    pred_status_name, pred_status_count = status_candidates[0]
    for name, count in status_candidates[1:]:
        if count > pred_status_count:
            pred_status_name = name
            pred_status_count = count

    context.update({
        'total_measures': total_measures,
        'implementation_count': implementation_count,
        'percent_implementation': percent_implementation,
        'programming_count': prog,
        'completed_count': completadas,
        'top_pilar_name': top_pilar_name,
        'top_pilar_count': top_pilar_count,
        'pred_status_name': pred_status_name,
        'pred_status_count': pred_status_count,
    })

    category_icons = {
        'enfoques transversales': 'bi-globe',
        'líneas estratégicas': 'bi-building',
        'líneas instrumentales': 'bi-gear-fill',
    }

    lines_prefetch = Prefetch(
        'line_set',
        queryset=Line.objects.annotate(
            active_measure_count=Count('measures', filter=Q(measures__is_active=True))
        ).order_by('name'),
        to_attr='prefetched_lines',
    )

    line_categories_qs = (
        LineCategory.objects
        .prefetch_related(lines_prefetch)
        .annotate(
            line_total=Count('line', distinct=True),
            active_measure_total=Count(
                'line__measures',
                filter=Q(line__measures__is_active=True),
                distinct=True,
            ),
        )
        .order_by('name')
    )

    line_categories = []
    for category in line_categories_qs:
        prefetched_lines = getattr(category, 'prefetched_lines', [])
        line_categories.append({
            'id': category.id,
            'name': category.name,
            'color': category.color,
            'icon_class': category_icons.get(category.name.strip().lower(), 'bi-diagram-3'),
            'line_total': category.line_total or 0,
            'measure_total': category.active_measure_total or 0,
            'lines': [
                {
                    'id': line.id,
                    'name': line.name,
                    'description': line.description,
                    'measure_count': getattr(line, 'active_measure_count', 0) or 0,
                    'color': line.color,
                    'icon_url': line.icon.url if line.icon else None,
                }
                for line in prefetched_lines
            ],
        })

    line_category_columns = [[], []]
    for index, category in enumerate(line_categories):
        line_category_columns[index % 2].append(category)
    line_category_columns = [column for column in line_category_columns if column]

    context['line_categories'] = line_categories
    context['line_category_columns'] = line_category_columns
    context['show_responsable_field'] = _is_responsable_field_active()
    context['progress_reports'] = ProgressReport.objects.all().order_by('-year', '-created_at')
    context['latest_progress_report'] = context['progress_reports'].first()
    context['methodology_doc'] = MethodologyDocument.objects.order_by('-created_at').first()

    return render(request, 'mainv2/staticpage/mye.html', context)

def measure_list_json(request):
    """
    Devuelve un listado simple de medidas activas con los campos principales,
    usado por el módulo MyE (mye.html) para renderizar las cards dinámicamente.

    Incluye información de pilares, línea, categoría y descripción corta.
    """
    measures = (
        Measure.active
        .select_related('pilares', 'line__category', 'status')
        .prefetch_related('labels', 'target_years')
        .all()
    )

    responsable_field_active = _is_responsable_field_active()

    data = []
    for measure in measures:
        fields = measure.fields or {}
        description = fields.get('Descripción', '')
        responsable = fields.get(RESPONSABLE_FIELD_NAME, '') if responsable_field_active else ''
        label_names = list(measure.labels.values_list('name', flat=True))
        pilar_name = measure.pilares.name if measure.pilares else ", ".join(label_names)
        pilares_payload = None
        if measure.pilares:
            pilares_payload = {
                "id": measure.pilares.id,
                "name": measure.pilares.name,
                "color": measure.pilares.color,
            }
        line_name = measure.line.name if measure.line else ''
        line_category = measure.line.category.name if measure.line and measure.line.category else ''
        line_id = measure.line.id if measure.line else None

        years_list = [
            {'year': y.year, 'short_description': y.short_description or '', 'description': y.description or ''}
            for y in measure.target_years.all().order_by('year')
        ]
        status_card_category = (measure.status.card_category if measure.status else 'other')
        data.append({
            "id": measure.id,
            "code": measure.code or "",
            "name": measure.name,
            "status": measure.status.name if measure.status else None,
            "status_card_category": status_card_category,
            "description": description,
            "years": years_list,
            "pilar": pilar_name,
            "pilares": pilares_payload,
            "linea": line_name,
            "linea_id": line_id,
            "linea_categoria": line_category,
            "responsable": responsable,
            "scope": measure.scope,
            "scope_label": measure.get_scope_display(),
            "labels": label_names,
        })

    status_config = [
        {"name": s.name, "order": s.order, "color": s.color}
        for s in ImplementationStatus.objects.order_by('order', 'name')
    ]
    return JsonResponse({"measures": data, "status_config": status_config})


def _measure_field_sections(measure: Measure):
    """Return ordered sections for detail view."""
    field_values = measure.fields or {}
    ordered_keys = list(MeasureField.active.namelist())

    sections = [
        {'name': key, 'value': field_values.get(key)}
        for key in ordered_keys
        if field_values.get(key)
    ]

    extra_sections = [
        {'name': key, 'value': value}
        for key, value in field_values.items()
        if value and key not in ordered_keys
    ]
    return sections, extra_sections


def _split_multiline(value):
    if not value:
        return []
    parts = re.split(r'[\r\n;]+', value)
    cleaned = [part.strip("•- \t") for part in parts if part.strip("•- \t")]
    return cleaned


def _progress_style_by_name():
    return {
        'En implementación avanzada': {
            'badge_class': 'bg-success text-white',
            'dot_class': 'bg-success',
            'text_class': 'text-success',
            'chip_class': 'badge-status-implementation',
        },
        'En implementación inicial': {
            'badge_class': 'bg-warning text-dark',
            'dot_class': 'bg-warning',
            'text_class': 'text-warning',
            'chip_class': 'badge-status-implementation',
        },
        'En programación': {
            'badge_class': 'bg-info text-dark',
            'dot_class': 'bg-info',
            'text_class': 'text-info',
            'chip_class': 'badge-status-programming',
        },
        'Completada': {
            'badge_class': 'bg-success text-white',
            'dot_class': 'bg-success',
            'text_class': 'text-success',
            'chip_class': 'badge-status-completed',
        },
        'A definir': {
            'badge_class': 'bg-secondary',
            'dot_class': 'bg-secondary',
            'text_class': 'text-secondary',
            'chip_class': 'badge-status-default',
        },
    }


PROGRESS_STYLE = _progress_style_by_name()


def measure_detail_view(request, id):
    """
    Página de detalle de una medida activa.
    """
    measure = get_object_or_404(
        Measure.active.prefetch_related('target_years').select_related(
            'pilares',
            'line__category',
            'status',
        ),
        pk=id,
    )

    sections, extra_sections = _measure_field_sections(measure)
    field_values = measure.fields or {}
    show_responsable_field = _is_responsable_field_active()
    responsable_value = field_values.get(RESPONSABLE_FIELD_NAME) if show_responsable_field else None
    labels = list(measure.labels.values_list('name', flat=True))
    related_measures = list(
        Measure.active
        .filter(line=measure.line)
        .exclude(id=measure.id)
        .select_related('status')
        .only('id', 'name', 'status')[:6]
    )

    metas = _split_multiline(field_values.get('Metas'))
    financiamiento = _split_multiline(field_values.get('Financiamiento'))
    instrumentos = _split_multiline(field_values.get('Instrumentos y herramientas de implementación'))
    necesidades = _split_multiline(field_values.get('Necesidades y barreras'))
    indicadores = _split_multiline(field_values.get('Indicadores para el monitoreo'))
    resultados = _split_multiline(field_values.get('Resultados esperados'))
    seguimiento_extra = _split_multiline(field_values.get('Seguimiento'))

    status_name = measure.status.name if measure.status else 'A definir'
    progress_style = PROGRESS_STYLE.get(status_name, PROGRESS_STYLE['A definir'])

    alcance_geografico_val = field_values.get('Alcance geográfico o poblacional')
    riesgos_climaticos_val = field_values.get('Riesgos climáticos asociados')
    show_alcance_estado = getattr(measure, 'show_alcance_estado', True)
    show_periodo_meta = getattr(measure, 'show_periodo_meta', True)
    show_metas_por_ano = getattr(measure, 'show_metas_por_ano', True)
    show_alcance_geografico = getattr(measure, 'show_alcance_geografico', True)
    show_riesgos_climaticos = getattr(measure, 'show_riesgos_climaticos', True)
    mye_grid_section_count = sum([
        show_alcance_estado,
        show_periodo_meta,
        show_metas_por_ano and bool(measure.target_years.all()),
        show_alcance_geografico and bool(alcance_geografico_val),
        show_riesgos_climaticos and bool(riesgos_climaticos_val),
    ])

    context = default_context(request)
    context.update({
        'measure': measure,
        'status_color': measure.status.color if measure.status else '#262C51',
        'labels': labels,
        'national_objectives': measure.national_objectives.select_related('meta_1__meta_0'),
        'related_measures': related_measures,
        'responsable': responsable_value,
        'execution_period': field_values.get('Período de ejecución'),
        'description': field_values.get('Descripción'),
        'metas': metas,
        'alcance_geografico': alcance_geografico_val,
        'riesgos_climaticos': riesgos_climaticos_val,
        'show_alcance_estado': show_alcance_estado,
        'show_periodo_meta': show_periodo_meta,
        'show_metas_por_ano': show_metas_por_ano,
        'show_alcance_geografico': show_alcance_geografico,
        'show_riesgos_climaticos': show_riesgos_climaticos,
        'mye_grid_section_count': mye_grid_section_count,
        'reduccion_emisiones': field_values.get('Reducción estimada de emisiones al 2030 (MtCO2e)'),
        'estimacion_gastos': field_values.get('Estimación de gastos al 2030'),
        'financiamiento': financiamiento,
        'instrumentos': instrumentos,
        'necesidades': necesidades,
        'indicadores': indicadores,
        'analisis_genero': field_values.get('Análisis enfoque de género y diversidad'),
        'analisis_riesgo': field_values.get('Análisis enfoque de gestión integral del riesgo'),
        'analisis_salud': field_values.get('Análisis enfoque de salud'),
        'analisis_transicion': field_values.get('Análisis enfoque de transición justa'),
        'cobeneficios': field_values.get('Cobeneficios entre adaptación y mitigación'),
        'relacion_ley': field_values.get('Relación con la Ley 27.520'),
        'objetivo_general': field_values.get('Objetivo general'),
        'resultados_esperados': resultados,
        'seguimiento_extra': seguimiento_extra,
        'field_sections': sections,
        'extra_sections': extra_sections,
        'progress_style': progress_style,
        'show_responsable_field': show_responsable_field,
    })

    return render(request, 'mainv2/staticpage/mye_detail.html', context)


app_name='measure'
urlpatterns = [
    path('list/', measure_list, name='list'),
    path('<int:id>/pdf', one_measure_pdf, name='pdf-export'),
    path('<int:id>/data.json', measure_fields, name='detail_fields'),
    path('<int:id>/', measure_detail_view, name='detail_view'),
    path('filter.json', measure_filter_json, name='filter'),
    path('details.json', filter_details, name='details'),
    path('filter-simple.json', measure_list_json, name='filter_simple'),
    path('lines.json', line_details, name='line_details'),
    path('export.pdf', many_measures_pdf, name='concat-pdf-export'),
    path('export.csv', many_measures_csv, name='csv-export'),
    path('action/<int:id>/', action_details, name='action_details'),
    path('recalc/', measure_pdf_recalc, name='recalc'),
    path('mye/', mye_overview, name='mye'),

]