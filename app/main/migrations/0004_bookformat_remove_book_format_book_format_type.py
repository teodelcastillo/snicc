# BookFormat + migración de datos desde Book.format (evita perder "Documento"/"Infografia")

import django.db.models.deletion
from django.db import migrations, models


def create_formats_from_existing_data(apps, schema_editor):
    """Crea un BookFormat por cada valor distinto en Book.format y asigna format_type."""
    Book = apps.get_model('main', 'Book')
    BookFormat = apps.get_model('main', 'BookFormat')
    # Valores que tenía el CharField en 0001: 'Documento', 'Infografia'
    seen = set()
    for book in Book.objects.exclude(format__isnull=True).exclude(format=''):
        name = (book.format or '').strip()
        if not name or name in seen:
            continue
        seen.add(name)
        BookFormat.objects.get_or_create(name=name)
    # Asegurar que existan al menos los dos originales (por si no hay libros aún)
    BookFormat.objects.get_or_create(name='Documento')
    BookFormat.objects.get_or_create(name='Infografia')


def populate_format_type(apps, schema_editor):
    """Asigna format_type a cada Book según su format (string) existente."""
    Book = apps.get_model('main', 'Book')
    BookFormat = apps.get_model('main', 'BookFormat')
    for book in Book.objects.exclude(format__isnull=True).exclude(format=''):
        name = (book.format or '').strip()
        if not name:
            continue
        try:
            fmt = BookFormat.objects.get(name=name)
            book.format_type = fmt
            book.save(update_fields=['format_type_id'])
        except BookFormat.DoesNotExist:
            pass


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_book_document_alter_book_url_alter_plan_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='BookFormat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
            options={
                'verbose_name': 'formato de libro',
                'verbose_name_plural': 'formatos de libro',
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='book',
            name='format_type',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='books',
                to='main.bookformat',
                verbose_name='formato',
            ),
        ),
        migrations.RunPython(create_formats_from_existing_data, noop),
        migrations.RunPython(populate_format_type, noop),
        migrations.RemoveField(
            model_name='book',
            name='format',
        ),
    ]
