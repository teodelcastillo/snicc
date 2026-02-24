# Generated manually for: name 255 chars + status as FK (ImplementationStatus)

from django.db import migrations, models
import django.db.models.deletion


def create_implementation_statuses(apps, schema_editor):
    ImplementationStatus = apps.get_model('measure', 'ImplementationStatus')
    defaults = [
        ('En programación', 0, '#33c45a'),
        ('En implementación inicial', 1, '#f9ff59'),
        ('En implementación avanzada', 2, '#ff9159'),
        ('Completada', 3, '#0f8b48'),
        ('A definir', 4, '#a1a1a1'),
    ]
    for name, order, color in defaults:
        ImplementationStatus.objects.get_or_create(
            name=name,
            defaults={'order': order, 'color': color},
        )


def copy_status_to_temp(apps, schema_editor):
    Measure = apps.get_model('measure', 'Measure')
    ImplementationStatus = apps.get_model('measure', 'ImplementationStatus')
    adefinir = ImplementationStatus.objects.filter(name='A definir').first()
    for m in Measure.objects.all():
        old_val = m.status  # current CharField value
        status_obj = ImplementationStatus.objects.filter(name=old_val).first()
        m.status_temp = status_obj or adefinir
        m.save()


class Migration(migrations.Migration):

    dependencies = [
        ('measure', '0002_remove_measure_add_labels'),
    ]

    operations = [
        # 1) Create ImplementationStatus model
        migrations.CreateModel(
            name='ImplementationStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80, unique=True, verbose_name='nombre')),
                ('order', models.PositiveSmallIntegerField(default=0, verbose_name='orden')),
                ('color', models.CharField(default='#a1a1a1', max_length=9, verbose_name='color')),
            ],
            options={
                'verbose_name': 'estado de implementación',
                'verbose_name_plural': 'estados de implementación',
                'ordering': ['order', 'name'],
            },
        ),
        # 2) Seed default statuses (non-destructive: existing labels preserved)
        migrations.RunPython(create_implementation_statuses, migrations.RunPython.noop),
        # 3) Extend Measure.name to 255 chars
        migrations.AlterField(
            model_name='measure',
            name='name',
            field=models.CharField(max_length=255, verbose_name='nombre'),
        ),
        # 4) Add temporary FK for status
        migrations.AddField(
            model_name='measure',
            name='status_temp',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='+',
                to='measure.implementationstatus',
                verbose_name='estado de implementación',
            ),
        ),
        # 5) Copy old CharField status to status_temp by name
        migrations.RunPython(copy_status_to_temp, migrations.RunPython.noop),
        # 6) Remove old status CharField (Django will see it as 'status' in state; we need to remove the field that currently exists)
        migrations.RemoveField(
            model_name='measure',
            name='status',
        ),
        # 7) Rename status_temp -> status
        migrations.RenameField(
            model_name='measure',
            old_name='status_temp',
            new_name='status',
        ),
    ]
