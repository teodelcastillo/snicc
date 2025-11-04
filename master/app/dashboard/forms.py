from django import forms
from main.models import Post, PostVersion
from pagedown.widgets import PagedownWidget

# Form widgets

class MarkdownWidget(PagedownWidget):
    class Media:
        extend = False # we don't want previous css
        css = {
            'all': ('pagedown/widget.css','pagedown.css',),
        }
        js = ('pagedown/Markdown.Converter.js',
              'pagedown-extra/pagedown/Markdown.Converter.js',
              'pagedown/Markdown.Sanitizer.js',
              'pagedown/Markdown.Editor.js',
              'pagedown-extra/Markdown.Extra.js',
              'pagedown_init.js'
        )

class SlugSourceWidget(forms.TextInput):
    """Adds a bit of javascript to auto-fill a slug field.
    Do not forget to add this to the target slug widget :
    attrs={'oninput':'stop_populating()'}
    """
    target_field = 'slug' # name of the slug field in the form

    class Media:
        js = ('dashboard/slugsource.js',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attrs['oninput'] = f'populate_slug(this.value, "{self.target_field}");' 

# Post forms

class PostForm(forms.ModelForm):
    title = forms.CharField(label='Titulo')
    short = forms.CharField(widget=forms.Textarea, help_text='Descripción breve, 500 caracteres como máximo', required=False, label='Tarjeta')
    body = forms.CharField(widget=MarkdownWidget, required=False, label='texto')
    class Meta:
        model = Post
        fields = ['image', 'category', 'type', 'slug', 'status', 'parent' ]
        widgets = {'body': MarkdownWidget}

class NewPostForm(PostForm):
    """Same, but slug auto-fills"""
    title = forms.CharField(widget=SlugSourceWidget)
    class Meta:
        model = Post
        fields = ['image', 'category', 'type', 'slug', 'status', 'parent' ]        
        widgets = {'body': MarkdownWidget, 'slug': forms.TextInput(attrs={'oninput':'stop_populating()'})}

class PostVersionForm(forms.ModelForm):
    check_diff = forms.BooleanField(initial=True, required=False)

    class Meta:
        model = PostVersion
        fields = ['title','short',  'body']
        widgets = {'body': MarkdownWidget, 'short':forms.Textarea}

    def is_valid(self, post):
        """Compares original and translation posts."""

        diffs = {
            '#' : 'subtitles',
            '![': 'images', 
        }

        if 'check_diff' in self.data and self.data['check_diff']:
            trans = self.data['body']
            original = post.content.body
            for pat, error in diffs.items():
                if trans.count(pat) != original.count(pat):
                    self.add_error('body', f'Number of {error} may differ from the original post. Look again or uncheck "check diff".')

        return super().is_valid()