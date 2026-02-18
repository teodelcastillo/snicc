import os
import tempfile
from unittest.mock import patch

from django.test import TestCase, override_settings
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


def _fake_write_pdf_success(self):
    """Escribe un PDF mínimo para tests sin WeasyPrint."""
    pdf_dir = os.path.dirname(self.pdffile)
    if pdf_dir:
        os.makedirs(pdf_dir, exist_ok=True)
    with open(self.pdffile, "wb") as f:
        f.write(b"%PDF-1.0 fake content for test")


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
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

    def test_pdf_export_serves_existing_file(self):
        """Descarga con archivo existente: devuelve PDF."""
        _fake_write_pdf_success(self.measure)
        self.assertTrue(os.path.exists(self.measure.pdffile))
        url = reverse('measure:pdf-export', args=[self.measure.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertGreater(len(response.content), 0)

    def test_pdf_export_generates_on_demand_when_missing(self):
        """Descarga con archivo faltante: regenera on-demand y devuelve PDF."""
        self.assertFalse(os.path.exists(self.measure.pdffile))
        with patch.object(Measure, 'write_pdf', _fake_write_pdf_success):
            url = reverse('measure:pdf-export', args=[self.measure.id])
            response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn(b'%PDF', response.content)

    def test_pdf_export_returns_503_when_generation_fails(self):
        """Descarga con regeneración fallida: respuesta controlada 503."""
        self.assertFalse(os.path.exists(self.measure.pdffile))

        def raise_error(self):
            raise RuntimeError("WeasyPrint no disponible")

        with patch.object(Measure, 'write_pdf', raise_error):
            url = reverse('measure:pdf-export', args=[self.measure.id])
            response = self.client.get(url)
        self.assertEqual(response.status_code, 503)
        self.assertIn(b"No se pudo generar", response.content)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class MeasurePdfRecalcTestCase(TestCase):
    """Tests para recálculo masivo de PDFs."""

    def setUp(self):
        from user.models import User
        self.staff_user = User.objects.create_user(
            username='staff_test',
            password='testpass123',
            is_staff=True,
            is_superuser=True,
        )
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
        MeasureField.objects.create(name='Descripción', is_active=True)
        self.measure = Measure.objects.create(
            line=self.line,
            action=self.action,
            pilares=self.pilar,
            code='AD-02',
            name='Medida recalc test',
            is_active=True,
            fields={'Descripción': 'Texto'},
        )

    def test_recalc_redirects_and_reports(self):
        """Recálculo masivo redirige y reporta éxitos/fallas."""
        self.client.login(username='staff_test', password='testpass123')
        with patch.object(Measure, 'write_pdf', _fake_write_pdf_success):
            url = reverse('measure:recalc')
            response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse('admin:index'))
