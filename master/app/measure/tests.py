from django.test import Client
from .views import *

# list(CacheResponse.objects.values_list('request', flat=True))
QUERIES = ['/measure/details.json?cat=1', '/measure/details.json?cat=2', '/measure/details.json', '/measure/filter.json']

def cache_queries(queries=QUERIES):
    c = Client()
    for q in queries:
        print(q)
        c.get(q)

    
from measure.models import Measure
al = 'Alcance geográfico o poblacional'
for m in Measure.objects.all():
    print(m)    
    if m.fields and al in m.fields:
        mal = m.fields.get(al, '')
        if mal.startswith('Nacional'):
            m.scope = 'Nacional'
        elif mal.startswith('A def'):
            m.scope = 'A definir'
        else:
            m.scope = 'Regional'
    else:
        m.scope = 'A definir'
    m.save(update_fields=('scope',), delete_cache=False)
