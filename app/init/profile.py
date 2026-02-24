from main.models import *

def pages():
    for profile in Profile.objects.filter(hidden=False):
        post, _ = Post.objects.get_or_create(
            slug = 'informacion-para-'+profile.code,
            status = Post.PostStatus.published,
            type = Post.PostType.resource,
            image = profile.image,
            protected = True,
        )
        PostVersion.objects.get_or_create(
            post = post,
            title = 'Información para '+profile.name,
            lang = Language.default()
        )

            
