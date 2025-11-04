import csv
from .models import *
import pandas as pd
# from io import StringIO
# import re

LABELS = {
    'Adaptación' : [1],
    'Mitigación' : [2],
    'Pérdidas y daños' : [3],
    'Adaptación y Mitigación': [1,2],
    'Adaptación y Pérdidas y daños': [1,3],
    'Mitigación y Pérdidas y daños': [2,3],
    'Adaptación, Mitigación y Pérdidas y daños': [1,2,3],
} 

def label_cat():    
    Label.objects.bulk_create([
        Label(name='Adaptación'),
        Label(name='Mitigación'),
        Label(name='Pérdidas y daños'),
    ])
    LineCategory.objects.bulk_create([
        LineCategory(name='Enfoques transversales'),
        LineCategory(name='Líneas instrumentales'),
        LineCategory(name='Líneas estratégicas'),
    ])

PILARES = { p.name:p for p in Pilar.objects.all() }


def measures(csvfile='init/MyE.csv', delete=True):
    # Código de medida,Línea/enfoque,Línea de acción,Título de medida,"Adaptación, Mitigación o Pérdidas y daños",Columna1,Etiquetas de fila,Cuenta de Código de medida
    if delete:
        Measure.objects.all().delete()
    
    with open(csvfile) as f :
        reader = csv.reader(f)
        reader.__next__() # skip first row
        for row in reader:
            line, _ = Line.objects.get_or_create(name=row[1].strip())
            action, _ = Action.objects.get_or_create(name=row[2].strip(), line=line)
            measure = Measure.objects.create(
                action = action,
                pilares = PILARES[row[4]],
                code = row[0],
                name = row[3],
            )
            measure.labels.add(*LABELS[row[4]])
    for line in Line.objects.all():
        if line.measure_count() == 0:
            line.delete()
    for action in Action.objects.all():
        if action.measure_set.count() == 0:
            action.delete()
    

def fill_measure(csvfile='init/medidas_details.csv'):
    df = pd.read_csv(csvfile)
    df.rename({"0":0,"1":1}, inplace=True, axis=1)
    df.fillna('', inplace=True)
    # return df
    df[1] = df[1].str.replace('\\n', ' ')
    measure = False
    for _, row in df.iterrows():
        if row[0] == 'Medida':
            try:
                if measure:
                    # save the last
                    measure.fields = fields
                    try:
                        measure.save()
                        measure.write_pdf()
                    except Exception as e:
                        print(fields, flush=True)
                        print(f'Could not save {measure.name} : {e}')
                
                name = row[1].replace('\n', ' ') if type(row[1]) is str else 'nope'
                measure = Measure.objects.get(code=name[1:6])
                fields = dict()
            except Measure.DoesNotExist:
                # print('Measure not found : '+name)
                measure = False
        elif measure and row[0] in DEFAULT_TEXT_FIELDS:
            fields[row[0]] = row[1]
        elif measure and row[0] == 'Estado de implementación':
            for status in Measure.Status:
                if row[1].lower().startswith(status.lower()):
                    measure.status = status

    # do not forget the last one
    if measure:
        measure.fields = fields
        measure.save()
        measure.write_pdf()
        print(measure)


METAS = """
0,1,code,2,Responsable BTR,Marco UEA (párrafo 9),Marco UEA (párrafo 10)
1. Percepción de la sociedad sobre los impactos del cambio climático y las medidas de adaptación,1.1 Interés por el cambio climático,1.1.1,Aumentar el nivel de alto interés por el cambio climático como un desafío que involucra al conjunto de la sociedad.,Luz,,
,1.2 Información y conocimiento sobre cambio climático,1.2.1,"Aumentar la información y el conocimiento sobre cambio climático, especialmente entre la población con menos nivel educativo y socioeconómico.",Luz,,
,,1.2.2,"Aumentar el conocimiento y el uso de los recursos institucionales sobre cambio climático (webs, mapas de riesgo, plataformas, etc.).",Luz,,
,,1.2.3,Aumentar la proporción de la población interesada e informada sobre el cambio climático.,Luz,,
,,1.2.4,"Informar a la sociedad sobre las medidas de adaptación existentes a nivel nacional, provincial y/o local.",Luz,,
,1.3 Percepción y Actitudes,1.3.1,Visibilizar impactos negativos específicos del cambio climático según los diferentes sectores y las regiones del país.,Luz,,
,,1.3.2,Mejorar la percepción sobre la importancia de las medidas de adaptación al cambio climático.,Luz,,
,,1.3.3,Generar una mayor conciencia sobre la vulnerabilidad de las mujeres y LGTBI+ frente al cambio climático.,Luz,,
,,1.3.4,"Reducir el peso de las visión tecnocrática sobre la participación política, aumentando la percepción sobre la importancia de la participación ciudadana.",Luz,,
,,1.3.5,Mejorar el posicionamiento de las fuentes gubernamentales como actores sociales creíbles sobre el cambio climático.,Luz,,
2. Involucramiento social,2.1 Cambio cultural,2.1.1,"Aumentar la proporción de la población que cambia sus hábitos culturales, incrementando su resiliencia y promoviendo una ciudadanía responsable.",Luz,,
,2.2 Participación ciudadana,2.2.1,"Aumentar la cantidad de personas que se involucran activamente en temas de cambio climático y en defensa de un desarrollo equitativo intergeneracional, justo, solidario y compatible con los Objetivos de Desarrollo Sostenible.",Luz,,
3. Disminución de la Vulnerabilidad,3.1 Capacidad institucional,3.1.1,"(Aplicación del conocimiento) Aumentar la cantidad de áreas del gobierno a nivel nacional, provincial y local que aplican conocimientos sobre riesgos climáticos, incorporan la adaptación como tema transversal y saben planificar y compañar medidas de adaptación.",Luz,,
,,3.1.2,"(Planes de respuesta y sectoriales) Aumentar la cantidad de planes de respuesta y sectoriales que tienen un análisis de riesgo climático, medidas de adaptación y un sistema de monitoreo.",Luz,,
,,3.1.3,(Sistema Nacional de Información) Fortalecer la puesta en marcha y el funcionamiento del sistema de monitoreo y evaluación agregado para la adaptación.,Luz,,
,3.2 Energía,3.2.1,"Mejorar el mantenimiento de las redes de transmisión, la distribución de energía eléctrica y la diversificación de generación energética para soportar y enfrentar eventos climáticos extremos en el NOA, Cuyo y Patagonia.",Anita,,
,3.3 Agua,3.3.1,"Aumentar la disponibilidad de agua en cantidad y calidad en contexto urbano, especialmente en barrios populares, en todo el país.",Anita,,
,,3.3.2,Mejorar el manejo sostenible del agua y su acceso en áreas rurales en todo el país (en cantidad y calidad).,Anita,,
,3.4 Salud,3.4.1,"Disminuir daños físicos a personas, infecciones y afectaciones a la salud mental por inundaciones en las regiones Centro, NEA y NOA.",Anita,,
,,3.4.2,"Disminuir enfermedades y afectaciones al confort de la población urbana, especialmente en barrios populares, relacionadas con olas de calor en la región Centro.",Anita,,
,,3.4.3,Disminuir enfermedades endémicas generadas por cambios en el clima en las regiones Centro y NOA.,Anita,,
,"3.5 Agricultura,
ganadería
y pesca",3.5.1,"Mejorar la resiliencia y capacidad de adaptación de los sistemas productivos de la agricultura familiar, campesina e indígena para autoconsumo y venta ante inundaciones, sequías, cambios en los caudales de ríos, aumento de temperaturas, entre otras amenazas, en todo el país.",Anita,,
,3.6 Vivienda y hábitat,3.6.1,"Disminuir daños y/o pérdidas de viviendas debido a inundaciones en las regiones Centro, Cuyo, NEA y NOA.",Anita,,
,,3.6.2,Disminuir daños y/o pérdidas de viviendas debido a incendios de interfase en la región Patagonia.,Anita,,
,3.7 Producción industrial,3.7.1,"Mejorar la resiliencia y capacidad de adaptación de los sistemas productivos industriales ante inundaciones, sequías, aumento de temperaturas, entre otras amenazas, en todo el país.",Anita,,
,"3.8 Turismo, deporte y patrimonio cultural",3.8.1,"Disminuir las pérdidas de ingresos en la actividad turística, la afectación a actividades recreativas y deporte y al patrimonio cultural, debido a eventos climáticos extremos en el NOA, bajantes extraordinarias en el NEA, incendios y menor disponibilidad de agua y nieve en la región Patagonia.",Anita,,
,,3.8.2,"Disminuir las pérdidas de ingresos en la actividad turística debido al aumento del nivel mar, aumento de ondas de tormenta y sudestadas en la región Centro.",Anita,,
,3.9 Movilidad,3.9.1,"Mejorar la transitabilidad y la conectividad física de personas, insumos y servicios (p.ej. salud) en caso de eventos extremos (inundaciones, aludes, nevadas, etc.) en todo el país.",Anita,,
,,3.9.2,Mejorar la transitabilidad fluvial de insumos en caso de bajantes extraordinarias del Río Paraná.,Anita,,
,3.10 Servicios ecosistémicos,3.10.1,Disminuir los daños en ecosistemas debido a incendios en todas las regiones.,Anita,,
"4. Integración de comunidades y grupos sociales en situación de vulnerabilidad, enfoque de género y enfoque intergeneracional",4.1 Comunidades y grupos sociales en situación de vulnerabilidad,4.1.1,Mejorar la capacidad adaptativa de comunidades y grupos sociales en situación de vulnerabilidad en todo el país.,Anita,,
,4.2 Enfoque de género,4.2.1,Aumentar las medidas de adaptación y acciones género transformadoras en todo el país.,Anita,,
,4.3 Enfoque intergeneracional,4.3.1,Aumentar las medidas de adaptación y acciones que tienen un enfoque intergeneracional en todo el país.,Anita,,
5. Generación de cobeneficios,5.1 Mitigación,5.1.1,Aumentar las medidas de adaptación que evidencian co-beneficios con la mitigación de GEI.,Anita,,
"""


# def metas(csv=METAS):
#     # Yes, this would be simpler with csv module
#     pat = re.compile(r'([\d\.]*) (.*)')
#     df = pd.read_csv(StringIO(csv), dtype=str).fillna('')
#     for _,row in df.iterrows():
#         if row["0"]:
#             mat = pat.match(row["0"])
#             meta0, _ = Meta_0.objects.get_or_create(code=mat[1], name=mat[2])
#         if row["1"]:
#             mat = pat.match(row["1"])
#             meta1, _ = Meta_1.objects.get_or_create(code=mat[1], name=mat[2], meta_0=meta0)
#         meta2 = Meta_2.objects.get_or_create(code=row["code"], name=row["2"], meta_1=meta1)
    
def metas_medidas(csvfile='init/metasmedidas.csv'):
    df = pd.read_csv(csvfile, dtype=str).fillna('')
    codes = df.columns[9:]
    for _,row in df.iterrows():
        try:
            measure = Measure.objects.get(name=row['Título de medida'])
        except Measure.DoesNotExist:
            # print(f"Medida {row['Título de medida']} not found")
            continue
        for code in codes:
            if row[code]:
                measure.national_objectives.add(Meta_2.objects.get(code=code))

