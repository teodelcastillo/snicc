from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('measure', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='measure',
            name='add_labels',
        ),
    ]

