from django.test import TestCase
from django.urls import reverse

from .models import (
    Action,
    Label,
    Line,
    LineCategory,
    Measure,
    MeasureField,
    Pilar,
)


class MeasureViewsTestCase(TestCase):
    def setUp(self):
        self.category = LineCategory.objects.create(
            name='Enfoques transversales',
            color='#123456',
        )
        self.line = Line.objects.create(
            name='Gestión integral del riesgo',
            description='Linea de prueba',
            color='#654321',
            category=self.category,
        )
        self.action = Action.objects.create(
            name='Acción demo',
            line=self.line,
            description='',
        )
        self.pilar = Pilar.objects.create(name='Adaptación', color='#ce380b')
        self.label = Label.objects.create(name='Adaptación')
        MeasureField.objects.create(name='Descripción', is_active=True)
        MeasureField.objects.create(name='Autoridad de aplicación', is_active=True)

        self.measure = Measure.objects.create(
            line=self.line,
            action=self.action,
            pilares=self.pilar,
            code='AD-01',
            name='Medida demo',
            is_active=True,
            fields={
                'Descripción': 'Texto descriptivo',
                'Autoridad de aplicación': 'Autoridad X',
            },
        )
        self.measure.labels.add(self.label)

    def test_measure_fields_endpoint(self):
        url = reverse('measure:detail_fields', args=[self.measure.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['name'], 'Medida demo')
        self.assertIn('Descripción', data['fields'])

    def test_measure_list_json_includes_responsable(self):
        url = reverse('measure:filter_simple')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        payload = response.json()['measures']
        self.assertEqual(len(payload), 1)
        first = payload[0]
        self.assertEqual(first['responsable'], 'Autoridad X')
        self.assertEqual(first['linea'], self.line.name)
        self.assertEqual(first['pilares']['name'], self.pilar.name)
