# Generated manually: clasificación de estados para tarjetas MYE (En Implementación / Completadas)

from django.db import migrations, models


def set_card_category_existing(apps, schema_editor):
    ImplementationStatus = apps.get_model('measure', 'ImplementationStatus')
    # Tarjeta "En Implementación": suman estos estados
    for name in ('En implementación inicial', 'En implementación avanzada'):
        ImplementationStatus.objects.filter(name=name).update(card_category='implementation')
    # Tarjeta "Completadas": suma este estado
    ImplementationStatus.objects.filter(name='Completada').update(card_category='completed')
    # "A definir", "En programación" y cualquier otro quedan en 'other' (default del AddField)


class Migration(migrations.Migration):

    dependencies = [
        ('measure', '0007_measureyearmeta_remove_measure_year'),
    ]

    operations = [
        migrations.AddField(
            model_name='implementationstatus',
            name='card_category',
            field=models.CharField(
                choices=[('implementation', 'En Implementación (tarjeta)'), ('completed', 'Completadas (tarjeta)'), ('other', 'Solo Total / otros')],
                default='other',
                help_text='Define si este estado suma en la tarjeta "En Implementación", "Completadas" o solo en Total.',
                max_length=20,
                verbose_name='cuenta en tarjeta',
            ),
        ),
        migrations.RunPython(set_card_category_existing, migrations.RunPython.noop),
    ]
