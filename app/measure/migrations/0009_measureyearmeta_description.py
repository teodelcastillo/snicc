# Generated manually: descripción en metas por año

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('measure', '0008_implementationstatus_card_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='measureyearmeta',
            name='description',
            field=models.TextField(
                blank=True,
                default='',
                help_text='Qué se espera alcanzar en este año.',
                verbose_name='descripción',
            ),
        ),
    ]
