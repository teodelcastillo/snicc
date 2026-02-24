import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Measure, MeasureYearMeta

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Measure)
def regenerate_measure_pdf_on_save(sender, instance, created, **kwargs):
    """Regenera el PDF de la medida cuando se guarda (creación o actualización)."""
    if not instance.is_active:
        return
    try:
        instance.write_pdf()
        logger.debug("PDF regenerado para medida id=%s (%s)", instance.id, instance.name)
    except Exception as e:
        logger.warning(
            "No se pudo regenerar PDF para medida id=%s (%s): %s",
            instance.id,
            instance.name,
            e,
            exc_info=True,
        )


@receiver(post_save, sender=MeasureYearMeta)
def regenerate_measure_pdf_on_meta_save(sender, instance, created, **kwargs):
    """Regenera el PDF de la medida cuando se guarda una meta por año."""
    measure = instance.measure
    if not measure.is_active:
        return
    try:
        measure.write_pdf()
        logger.debug("PDF regenerado para medida id=%s tras cambio de meta", measure.id)
    except Exception as e:
        logger.warning(
            "No se pudo regenerar PDF para medida id=%s tras meta: %s",
            measure.id,
            e,
            exc_info=True,
        )
