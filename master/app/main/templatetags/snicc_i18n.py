from django import template
from ..models import StaticTransVersion


register = template.Library()

# @register.simple_tag
@register.filter(name='translate')
def translate(value, lang='es'):
    """
    Object tranlator.
    Use in {% with content=object|translate:lang %}. 

    Assumes object.get_version() method exists."""
    return value.get_version(lang)


@register.simple_tag
def ts(value, lang):
    """ts stands for translate_static"""
    try:
        if lang.code =='es':
            return value
        return StaticTransVersion.objects.get(lang=lang, es__es=value).trad
    except StaticTransVersion.DoesNotExist:
        return value
