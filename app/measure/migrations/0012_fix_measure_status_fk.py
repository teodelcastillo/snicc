# Data migration: create measure_implementationstatus table if missing, ensure
# "En programación" exists, and fix any measure.status_id that references a
# missing ImplementationStatus (e.g. IntegrityError on pk 251).

from django.db import migrations


# Default statuses (same as 0003_name_255_implementation_status). card_category = 'other'.
DEFAULT_STATUSES = [
    ('En programación', 0, '#33c45a'),
    ('En implementación inicial', 1, '#f9ff59'),
    ('En implementación avanzada', 2, '#ff9159'),
    ('Completada', 3, '#0f8b48'),
    ('A definir', 4, '#a1a1a1'),
]


def create_implementationstatus_table_if_missing(schema_editor):
    """Create measure_implementationstatus table if it was never created (e.g. migration 0003 skipped/faked)."""
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        table_list = connection.introspection.table_names(cursor)
    if "measure_implementationstatus" in table_list:
        return

    vendor = connection.vendor
    with connection.cursor() as cursor:
        if vendor == 'sqlite':
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS measure_implementationstatus (
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(80) NOT NULL UNIQUE,
                    "order" SMALLINT NOT NULL DEFAULT 0,
                    color VARCHAR(9) NOT NULL DEFAULT '#a1a1a1',
                    card_category VARCHAR(20) NOT NULL DEFAULT 'other'
                )
            """)
        elif vendor == 'postgresql':
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS measure_implementationstatus (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(80) NOT NULL UNIQUE,
                    "order" SMALLINT NOT NULL DEFAULT 0,
                    color VARCHAR(9) NOT NULL DEFAULT '#a1a1a1',
                    card_category VARCHAR(20) NOT NULL DEFAULT 'other'
                )
            """)
        else:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS measure_implementationstatus (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(80) NOT NULL UNIQUE,
                    `order` SMALLINT NOT NULL DEFAULT 0,
                    color VARCHAR(9) NOT NULL DEFAULT '#a1a1a1',
                    card_category VARCHAR(20) NOT NULL DEFAULT 'other'
                )
            """)

        placeholders = '?, ?, ?, ?' if vendor == 'sqlite' else '%s, %s, %s, %s'
        order_col = '"order"' if vendor != 'mysql' else '`order`'
        for name, order_val, color in DEFAULT_STATUSES:
            cursor.execute(
                f'INSERT INTO measure_implementationstatus (name, {order_col}, color, card_category) VALUES ({placeholders})',
                [name, order_val, color, 'other'],
            )


def ensure_status_and_fix_measures(apps, schema_editor):
    create_implementationstatus_table_if_missing(schema_editor)

    ImplementationStatus = apps.get_model('measure', 'ImplementationStatus')

    for name, order_val, color in DEFAULT_STATUSES:
        ImplementationStatus.objects.get_or_create(
            name=name,
            defaults={'order': order_val, 'color': color},
        )

    en_programacion = ImplementationStatus.objects.filter(name='En programación').first()
    if not en_programacion:
        return

    connection = schema_editor.connection
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE measure_measure
            SET status_id = %s
            WHERE status_id IS NOT NULL
            AND status_id NOT IN (SELECT id FROM measure_implementationstatus)
            """,
            [en_programacion.id],
        )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('measure', '0011_methodologydocument'),
    ]

    operations = [
        migrations.RunPython(ensure_status_and_fix_measures, noop),
    ]
