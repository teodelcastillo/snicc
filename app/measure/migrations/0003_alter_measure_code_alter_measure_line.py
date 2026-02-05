from django.db import migrations, models
import django.db.models.deletion


def fill_null_line_id(apps, schema_editor):
    """Antes de hacer line nullable: asigna un line_id válido a filas con line_id NULL,
    para que SQLite no falle al recrear la tabla (NOT NULL constraint)."""
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE measure_measure SET line_id = (SELECT id FROM measure_line LIMIT 1) WHERE line_id IS NULL"
        )


class Migration(migrations.Migration):

    dependencies = [
        ('measure', '0002_remove_measure_add_labels'),
    ]

    operations = [
        migrations.RunPython(fill_null_line_id, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='measure',
            name='code',
            field=models.CharField(max_length=12, verbose_name='codigo'),
        ),
        migrations.AlterField(
            model_name='measure',
            name='line',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='measures', to='measure.line', verbose_name='línea/enfoque'),
        ),
    ]

