/* Menu mobile */
$('.js-menu-toggle').click(function(e) {
    var $this = $(this);
    if ( $('body').hasClass('show-sidebar') ) {
        $('body').removeClass('show-sidebar');
        $this.removeClass('active');
    } else {
        $('body').addClass('show-sidebar');	
        $this.addClass('active');
    }
    e.preventDefault();
});

(function() {
    /* Cambio de idioma */
    $('#idioma_dropdown .dropdown-item').click(function(){
        $('#idioma_dropdown .dropdown-item').removeClass('disabled active');
        $(this).addClass('disabled active');
        $('#idioma_snic').text($(this).attr('data-idioma-verbose'))
        setCookie( 'idioma_snic', $(this).attr('data-idioma'), 30 ); // recordar idioma por 30 dias
        location.reload();
        console.log('idioma cookie')
    });
    /* Inicializacion del idioma */
    var lang = getCookie('idioma_snic');
    if(!lang) {
        $('#idioma_dropdown .dropdown-item[data-idioma="es"]').addClass('disabled active');
    } else {
        $('#idioma_dropdown .dropdown-item[data-idioma="'+lang+'"]').addClass('disabled active');
        $('#idioma_snic').text($('#idioma_dropdown .dropdown-item[data-idioma="'+lang+'"]').attr('data-idioma-verbose'));
    }

    /* Tooltips bs SNIC */
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    })
    
})();

/* Gestion de cookies */
function setCookie(c_name, value, exdays, path) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : ("; expires=" + exdate.toUTCString()));
    document.cookie = c_name + "=" + c_value + ((path == null) ? "; path=/" : "; path=" + path);
}

function getCookie(c_name, c_default) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
    if (typeof c_default != 'undefined') return c_default;
    return false;
}