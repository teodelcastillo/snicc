# Generated manually: múltiples metas por año por medida

from django.db import migrations, models
import django.db.models.deletion


def copy_year_to_target_years(apps, schema_editor):
    Measure = apps.get_model('measure', 'Measure')
    MeasureYearMeta = apps.get_model('measure', 'MeasureYearMeta')
    for m in Measure.objects.all():
        year_val = getattr(m, 'year', None)
        if year_val is not None:
            MeasureYearMeta.objects.get_or_create(measure=m, year=year_val)


class Migration(migrations.Migration):

    dependencies = [
        ('measure', '0006_alter_measure_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='MeasureYearMeta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField(verbose_name='año meta')),
                ('measure', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='target_years', to='measure.measure', verbose_name='medida')),
            ],
            options={
                'verbose_name': 'meta por año',
                'verbose_name_plural': 'metas por año',
                'ordering': ['year'],
            },
        ),
        migrations.RunPython(copy_year_to_target_years, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='measure',
            name='year',
        ),
        migrations.AddConstraint(
            model_name='measureyearmeta',
            constraint=models.UniqueConstraint(fields=('measure', 'year'), name='unique_measure_year'),
        ),
    ]
