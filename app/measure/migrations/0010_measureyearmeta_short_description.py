# Generated manually: descripción breve en metas por año

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('measure', '0009_measureyearmeta_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='measureyearmeta',
            name='short_description',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Resumen opcional para mostrar en tarjetas o listados (no en todas las metas).',
                max_length=255,
                verbose_name='descripción breve',
            ),
        ),
    ]
