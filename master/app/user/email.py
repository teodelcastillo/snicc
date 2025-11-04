from django.conf import settings
from django.core.mail import send_mail
from .models import User
                # TODO : email stuff
                

class Email:
    def __init__(self, user:User):
            self.user = user

    def send_code(self):
        code = self.user.new_code()
        if settings.EMAIL_HOST:
            send_mail(
                'Código de verificación de cuenta de SNICC', 
                f"Para finalizar el inicio de sesión en tu cuenta SNICC, ingresa este código de verificación: {code}", 
                settings.DEFAULT_FROM_EMAIL, 
                [self.user.email], 
                fail_silently=False
            )
        else:
            print(f'Code for user {self.user} : {code}', flush=True)
            