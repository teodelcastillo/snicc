"""Scraping static translations from html."""

from glob import glob
import re
import os
from .models import StaticTrans, Language
import pandas as pd

# All html directories (non-recursive search)
TEMPLATES = [
    '/code/main/templates/mainv2/',
    '/code/main/templates/mainv2/staticpages',
    '/code/user/templates/user/',
]

ts_pattern = re.compile(r"{%\s*ts\s*'(.*?)'\s*lang\s*%}")

def scrape(dirs=TEMPLATES):
    for d in dirs:
        for f in glob(os.path.join(d, '*.html')):
            with open(f) as of:
                for occ in ts_pattern.findall(of.read()):
                    StaticTrans.objects.get_or_create(es=occ)


def export_ts_file(csvfile):
    l = []
    for item in StaticTrans.objects.all():
        d = {x.lang.code:x.trad for x in item.versions.all()}
        d['es'] = item.es
        l.append(d)
    pd.DataFrame.from_records(l, columns=Language.objects.values_list('code', flat=True)).to_csv(csvfile, index=False)

def load_ts_file(csvfile):
    """csv columns names are exactly language codes"""
    df = pd.read_csv(csvfile)
    langs = [ Language.objects.get(code=c) for c in df.columns if c != 'es' ]

    for _, row in df.iterrows():
        for lang in langs:
            if row[lang.code]:
                StaticTrans.objects.get(es=row['es']).versions.update_or_create(lang=lang, defaults={'trad': row[lang.code]})