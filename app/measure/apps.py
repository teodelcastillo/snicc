from django.apps import AppConfig


class MeasureConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'measure'

    def ready(self):
        import measure.signals  # noqa: F401
