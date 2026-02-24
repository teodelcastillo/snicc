from django.conf import settings
from django.core.mail import send_mail
from .models import User


"""
Servicio de envío de emails relacionado con códigos de verificación.

Actualmente el flujo principal de autenticación usa email + contraseña,
por lo que este módulo no se utiliza en producción. Se mantiene para que
un equipo técnico futuro pueda reactivar fácilmente:

- Verificación de correo electrónico en el registro.
- Login sin contraseña basado en códigos temporales.
- Flujos de recuperación de contraseña por código.
"""


class Email:
    def __init__(self, user: User):
        self.user = user

    def send_code(self):
        """
        Envía un código de verificación de 4 dígitos al email del usuario.

        Legacy: no es llamado por el flujo actual, pero se conserva para
        una posible reactivación del login/registro por código.
        """
        code = self.user.new_code()
        if settings.EMAIL_HOST:
            send_mail(
                'Código de verificación de cuenta de SNICC',
                (
                    "Para finalizar el inicio de sesión en tu cuenta SNICC, "
                    f"ingresa este código de verificación: {code}"
                ),
                settings.DEFAULT_FROM_EMAIL,
                [self.user.email],
                fail_silently=False,
            )
        else:
            print(f'Code for user {self.user} : {code}', flush=True)
