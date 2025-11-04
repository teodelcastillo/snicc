!function() {
    var e = "./assets/";
    window.jQuery || ((e = document.createElement("script")).type = "text/javascript",
    e.src = scriptsCDNPathQA + "jquery.min.js",
    document.getElementsByTagName("body")[0].appendChild(e)),
    setTimeout(function() {
        setTimeout(function() {
            $("head").append('<link rel="stylesheet" href="https://kit-pro.fontawesome.com/releases/v5.13.0/css/pro.min.css" type="text/css" />'),
            $("<div/>", {
                id: "accessibility",
                class: "",
                title: "Menu Accesibilidad"
            }).appendTo("body");
            $("#accessibility").append(' <nav class="menu-container"><a href="#"  class="menu-btn"><i class="icon fad fa-universal-access fa-2x" aria-hidden="true"></i> </a><li class="menu-slide"><ul class="accesibility"><li class="icon-box-simple-reset reset"><input type="checkbox" id="reset" name="reset"><i class="fas fa-reply-all fa-2x icons col-md-2" aria-hidden="true"></i><span>Restablecer</span></li><li class="escala icon-box BlackAndWhite"><input type="checkbox" id="escala" name="escala"><i class="fas fa-adjust fa-2x icons col-md-2" aria-hidden="true"></i><span>Cambiar escala de grises</span></li><li class="lector icon-box"><input type="checkbox" id="lector" name="lector"><i class="fas fa-assistive-listening-systems fa-2x icons col-md-2" aria-hidden="true"></i><span class="col-md-8">Usar un lector de pantalla</span></li><li class="cursor icon-box cCursor"><input type="checkbox" id="cursor" name="cursor"><i class="fas fa-mouse-pointer fa-2x icons col-md-2" aria-hidden="true"></i><span class="col-md-8">Cambiar tamaño de cursor</span></li><li class="contraste icon-box"><input type="checkbox" id="contraste" name="contraste"><i class="fas fa-palette InvertContrast fa-2x icons col-md-2" aria-hidden="true"></i><span class="col-md-8">Cambiar el contraste de color</span></li><li class="icon-box mask activeMask"><input type="checkbox" id="mask" name="mask"><i class="fas fa-grip-lines fa-2x fa-2x icons col-md-2" aria-hidden="true"></i><span class="col-md-8">Mascara de lectura</span></li><li class="icon-box guia activeLineRead"><input type="checkbox" id="guia" name="guia"><i class="fas fa-underline  fa-2x icons col-md-2" aria-hidden="true"></i><span class="col-md-8">Guia de Lectura</span></li><li class="icon-box dislexia"><input type="checkbox" id="dislexia" name="dislexia"><i class="fas fa-italic fa-2x icons col-md-2" aria-hidden="true"></i><span class="col-md-8">Cambio de tipografia dislexia</span></li><li class="icon-box spacing_v"><input type="checkbox" id="spacing_v" name="spacing_v"><i class="fas fa-text-height icons col-md-2 fa-2x" aria-hidden="true"></i><span class="col-md-6">Espaciado vertical</span><div class="col-md-12"><div id="progressAccess">  <div class ="s1 stepping"></div>  <div class ="s2 stepping"></div>  <div class ="s3 stepping"></div></div></div></li><li class="icon-box spacing_h"><input type="checkbox" id="spacing_h" name="spacing_h"><i class="fas fa-text-width icons col-md-2 fa-2x " aria-hidden="true"></i><span class="col-md-6">Espaciado Horizontal</span><div class="col-md-12"><div id="progressAccess">  <div class ="sh1 stepping horizon"></div>  <div class ="sh2 stepping horizon"></div>  <div class ="sh3 stepping horizon"></div></div></div></li><li class="icon-box icon-box-active "><div class="col-md-3 icon-box-simple pull-left dec-font icon-box-active"><i class="fas fa-text-size "></i><i class="fas fa-minus "></i></div> &nbsp; &nbsp;<div  class="col-md-3 icon-box-simple pull-left inc-font icon-box-active "><i class="fas fa-text-size "></i><i class="fas fa-plus"></i></div><span  class="col-md-8" >Cambiar tamaño</span></li><li class="icon-box resaltar"><input type="checkbox" id="resaltar" name="resaltar"><i class="fas fa-highlighter fa-2x icons col-md-2" aria-hidden="true"></i><span class="col-md-8">Resaltar Enlaces</span></li></ul></div>');
            var a = 800;
            $(window).scroll(function() {
                var e = $(window).scrollTop();
                a <= e && (a += 800,
                function() {
                    "true" == localStorage.getItem("activeGrayScale") && u();
                    "true" == localStorage.getItem("activeContrast") && f();
                    "true" == localStorage.getItem("lsDislexia") && v()
                }())
            });
            var g = new Array;
            $(document).ready(function() {
                var e;
                "true" == localStorage.getItem("activeGrayScale") ? ($("#escala").prop("checked", !0),
                $(".escala").addClass("icon-box-active"),
                u()) : $(".escala").removeClass("icon-box-active"),
                "true" == localStorage.getItem("activeContrast") ? ($("#Contraste").prop("checked", !0),
                $(".contraste").addClass("icon-box-active"),
                f()) : $(".contraste ").removeClass("icon-box-active"),
                "true" == localStorage.getItem("activeAudio") ? ($("#lector").prop("checked", !0),
                $(".lector").addClass("icon-box-active"),
                0 == ctrlPermisao && ($("#lector").trigger("change"),
                e = new SpeechSynthesisUtterance("Usted tiene el audio activado"),
                window.speechSynthesis.speak(e))) : ($(".lector").remove("icon-box-active"),
                speechSynthesis.cancel()),
                "true" == localStorage.getItem("activeCursor") ? ($("#cursor").prop("checked", !0),
                $(".cursor").addClass("icon-box-active"),
                c()) : $(".cursor").remove("icon-box-active"),
                "true" == localStorage.getItem("activeMask") ? ($("#mask").prop("checked", !0),
                $(".mask").addClass("icon-box-active"),
                n()) : $(".mask").remove("icon-box-active"),
                "true" == localStorage.getItem("activeLineRead") ? ($("#guia").prop("checked", !0),
                $(".guia").addClass("icon-box-active"),
                r()) : $(".guia").remove("icon-box-active");
                var t = $("body")
                  , a = $(".font-changer")
                  , i = $(window).width()
                  , s = $(".container").width();
                function c() {}
                function c() {
                    null == localStorage.getItem("activeCursor") || "false" == localStorage.getItem("activeCursor") ? (localStorage.setItem("activeCursor", !0),
                    $("body").addClass("cursor-big"),
                    $("a").addClass("cursor_pointer"),
                    $(".cursor").addClass("icon-box-active")) : (localStorage.setItem("activeCursor", !1),
                    $("body").removeClass("cursor-big"),
                    $("a").removeClass("cursor_pointer"),
                    $(".cursor").removeClass("icon-box-active"))
                }
                $(".inc-font").on("click", function(e) {
                    parseInt(t.find("p").css("font-size")) + 1 <= 26 && t.find("p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption, blockquote").each(function(e) {
                        $(this).css({
                            "font-size": parseInt($(this).css("font-size")) + 1
                        }),
                        $(this).is("p, h2, h3, h4") && $(this).css({
                            "margin-bottom": parseInt($(this).css("margin-bottom")) + 2
                        })
                    }),
                    e.preventDefault()
                }),
                $(document).on("mouseenter", "div, section>div,div>a>img, img, p, dd, dt, a, h1, h2, h3, h4, span, blockquote,div>h3, h4>a", function(e) {
                    var a = $(this).attr("src");
                    $("#show").css("background-image", 'url("' + a + '")'),
                    0 == ctrlPermisao && $("#lector").trigger("change");
                    a = $(this).get(0).tagName;
                    let t = "";
                    t = "DIV" == a ? 0 < $(this).children().length ? "" : $(this).text() : "IMG" == a ? $(this).get(0).alt : "a" == a ? $("a").data("title") : $(this).text(),
                    "true" === localStorage.getItem("activeAudio") && "" != t.trim() && (a = new SpeechSynthesisUtterance(t),
                    window.speechSynthesis.speak(a))
                }).mouseleave(function() {
                    speechSynthesis.cancel()
                }),
                $(".dec-font").on("click", function(e) {
                    11 <= parseInt(t.find("p").css("font-size")) - 1 && t.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption, blockquote").each(function(e) {
                        $(this).css({
                            "font-size": parseInt($(this).css("font-size")) - 1
                        }),
                        $(this).is("p, h2, h3, h4") && $(this).css({
                            "margin-bottom": parseInt($(this).css("margin-bottom")) - 2
                        })
                    }),
                    e.preventDefault()
                }),
                $("#barra-accesibilidad").hover(function() {
                    b(!0)
                }, function() {
                    b(!1)
                }),
                $(".BlackAndWhite").click(function() {
                    "null" == localStorage.getItem("activeGrayScale") ? (localStorage.setItem("activeGrayScale", !0),
                    $(".escala").removeClass("icon-box-active"),
                    u()) : "true" == localStorage.getItem("activeGrayScale") ? (localStorage.setItem("activeGrayScale", !1),
                    $(".escala").removeClass("icon-box-active"),
                    u()) : (localStorage.setItem("activeGrayScale", !0),
                    u(),
                    $(".escala").addClass("icon-box-active"))
                }),
                $(document).on("click mousemove", "body", function(e) {
                    e.clientX;
                    var a = e.clientY
                      , t = a - 30
                      , i = a + 30;
                    localStorage.getItem("activeMask") && ($(".uw-zoom-exclude_top").css("height", t),
                    $(".uw-zoom-exclude_bottom").css("top", i)),
                    localStorage.getItem("activeLineRead") && $(".separator").css({
                        left: 0,
                        top: e.pageY + 10
                    })
                }),
                $(".cCursor").click(function() {
                    c()
                });
                var o = 0;
                function n() {
                    0 == o && (o = 1,
                    function() {
                        $("<div/>", {
                            id: "maskAccesibility",
                            class: "",
                            title: "Mascara Accesibilidad"
                        }).appendTo("body");
                        $("#maskAccesibility").append('<div class="maskRead  uw-zoom-exclude_top"  style="position: fixed !important; z-index: 2147483647 !important;width: 100% !important;background: rgba(0, 0, 0, 0.5); !important; top: 0px; height: 438px;"  uw-cer-popup-wrapper=""> <div style="width: 100% !important; height: 8px !important; position: absolute !important;  background: #B38D5D;  bottom: 0px;" ></div></div><div class="maskRead  uw-zoom-exclude_bottom" uw-cer-popup-wrapper=""  style="position: fixed !important; z-index: 2147483647 !important;  width: 100% !important; background: rgba(0, 0, 0, 0.5)  !important;  height: 100%;"> <div style="width: 100% !important; height: 8px !important; position: absolute !important; background: #7A1B33; top: 0px;"></div></div>')
                    }()),
                    null == localStorage.getItem("activeMask") || "false" == localStorage.getItem("activeMask") ? (localStorage.setItem("activeMask", !0),
                    $(".maskRead").fadeIn("slow"),
                    $(".mask").addClass("icon-box-active")) : (localStorage.setItem("activeMask", !1),
                    $(".maskRead").fadeOut("slow"),
                    $(".mask").removeClass("icon-box-active"))
                }
                $(".activeMask").click(function() {
                    n()
                });
                var l = 0;
                function r() {
                    0 == l && (l = 1,
                    $("<div/>", {
                        id: "separator",
                        class: "separator",
                        title: "Linea de lectura Accesibilidad"
                    }).appendTo("body"));
                    let e = $("guia");
                    e.val(e.prop("checked")),
                    null == localStorage.getItem("activeLineRead") || "false" == localStorage.getItem("activeLineRead") ? (localStorage.setItem("activeLineRead", !0),
                    $(".separator").fadeIn("slow"),
                    $(".guia").addClass("icon-box-active")) : (localStorage.setItem("activeLineRead", !1),
                    $(".separator").fadeOut("slow"),
                    $(".guia").removeClass("icon-box-active"))
                }
                $(".dislexia").on("click", function(e) {
                    "true" == localStorage.getItem("lsDislexia") ? localStorage.setItem("lsDislexia", !1) : localStorage.setItem("lsDislexia", !0),
                    v()
                }),
                $(".resaltar").on("click", function(e) {
                    var a;
                    "true" == localStorage.getItem("lsResaltar") ? localStorage.setItem("lsResaltar", !1) : localStorage.setItem("lsResaltar", !0),
                    a = $("body"),
                    "true" == localStorage.getItem("lsResaltar") ? a.find("a").each(function(e) {
                        $(".resaltar").addClass("icon-box-active"),
                        $(this).addClass("highlight-accessibility")
                    }) : a.find("a").each(function(e) {
                        $(".resaltar").removeClass("icon-box-active"),
                        $(this).removeClass("highlight-accessibility")
                    })
                }),
                $(".reset").on("click", function(e) {
                    "true" == localStorage.getItem("reset") ? localStorage.setItem("lsreset", !1) : localStorage.setItem("lsreset", !0),
                    function() {
                        "true" == localStorage.getItem("activeGrayScale") && ($("#escala").prop("checked", !1),
                        $(".escala").removeClass("icon-box-active"),
                        u());
                        "true" == localStorage.getItem("activeContrast") && ($("#Contraste").prop("checked", !0),
                        $(".contraste").removeClass("icon-box-active"),
                        f());
                        "true" == localStorage.getItem("activeAudio") && ($("#lector").prop("checked", !0),
                        $(".lector").removeClass("icon-box-active"),
                        localStorage.setItem("activeAudio", !1));
                        "true" == localStorage.getItem("activeCursor") && ($("#cursor").prop("checked", !0),
                        $(".cursor").removeClass("icon-box-active"),
                        activateCursor());
                        "true" == localStorage.getItem("activeMask") && ($("#mask").prop("checked", !0),
                        $(".mask").removeClass("icon-box-active"),
                        activateMask());
                        "true" == localStorage.getItem("activeLineRead") && ($("#guia").prop("checked", !0),
                        $(".guia").removeClass("icon-box-active"),
                        activateGuide())
                    }()
                }),
                $(".activeLineRead").click(function() {
                    r()
                }),
                $(".resaltar").click(function() {
                    $("body").find("href").css("background-color", "yellow"),
                    null == localStorage.getItem("highlight") || "false" == localStorage.getItem("highlight") ? (localStorage.setItem("highlight", !0),
                    $("body").find("href").css("background-color", "yellow")) : (localStorage.setItem("highlight", !1),
                    $("body").find("href").remove("background-color", "yellow"))
                }),
                $(".InvertContrast").click(function() {
                    null == localStorage.getItem("activeContrast") || "false" == localStorage.getItem("activeContrast") ? (localStorage.setItem("activeContrast", !0),
                    $(".contraste").addClass("icon-box-active")) : (localStorage.setItem("activeContrast", !1),
                    $(".contraste").removeClass("icon-box-active")),
                    f(),
                    $.each($("img"), function(e, a) {
                        g[e] = "imagen_" + e,
                        $("h3").addClass("imgBW")
                    })
                }),
                $(".lector").on("click", function(e) {
                    $(this).prop("checked"),
                    ctrlPermisao = 1;
                    var a;
                    "true" == localStorage.getItem("activeAudio") ? (localStorage.setItem("activeAudio", !1),
                    $(".lector").removeClass("icon-box-active")) : (localStorage.setItem("activeAudio", !0),
                    $(".lector").addClass("icon-box-active"),
                    a = new SpeechSynthesisUtterance("Audio Activado"),
                    window.speechSynthesis.speak(a))
                });
                var d = 0;
                $(".spacing_v").on("click", function(e) {
                    0 == d ? (p("200%"),
                    $(".s1").addClass("stepping_active"),
                    $(".spacing_v").addClass("icon-box-active"),
                    d++) : 1 == d ? (p("300%"),
                    $(".s2").addClass("stepping_active"),
                    d++) : 2 == d ? (p("400%"),
                    $(".s3").addClass("stepping_active"),
                    d++) : (d = 0,
                    p("normal"),
                    $(".stepping").removeClass("stepping_active"),
                    $(".spacing_v").removeClass("icon-box-active"))
                });
                var m = 0;
                function p(a) {
                    t.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption").each(function(e) {
                        $(this).css({
                            "line-height": a
                        })
                    })
                }
                function h(a) {
                    t.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption").each(function(e) {
                        $(this).css({
                            "letter-spacing": a
                        })
                    })
                }
                $(".spacing_h").on("click", function(e) {
                    0 == m ? (h("5px"),
                    $(".sh1").addClass("stepping_active"),
                    $(".spacing_h").addClass("icon-box-active"),
                    m++) : 1 == m ? (h("8px"),
                    $(".sh2").addClass("stepping_active"),
                    m++) : 2 == m ? (h("10px"),
                    $(".sh3").addClass("stepping_active"),
                    m++) : (m = 0,
                    h("normal"),
                    $(".stepping").removeClass("stepping_active"),
                    $(".spacing_h").removeClass("icon-box-active"))
                });
                a = $(".font-changer");
                $(".font-changer").length && ($(".nm-font").on("click", function(e) {
                    t.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption").each(function(e) {
                        $(this).css({
                            "font-size": "1.2em"
                        }),
                        $(this).is("p, h2, h3, h4") && $(this).css({
                            "margin-bottom": "1.4em"
                        })
                    })
                }),
                $(".md-font").on("click", function(e) {
                    t.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption").each(function(e) {
                        $(this).css({
                            "font-size": "1.5em"
                        }),
                        $(this).is("p, h2, h3, h4") && $(this).css({
                            "margin-bottom": "2em"
                        })
                    })
                }),
                $(".lg-font").on("click", function(e) {
                    t.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn").each(function(e) {
                        $(this).css({
                            "font-size": "2em"
                        }),
                        $(this).is("p, h2, h3, h4") && $(this).css({
                            "margin-bottom": "3em"
                        })
                    })
                }),
                a.stop().css({
                    left: i / 2 - s / 2 - (a.width() + 20)
                }),
                $(window).on("resize", function() {
                    i = $(window).width(),
                    s = $(".container").width(),
                    $(window).innerWidth() <= 1024 ? a.stop().animate({
                        left: "-50px"
                    }) : a.stop().animate({
                        left: i / 2 - s / 2 - (a.width() + 20)
                    })
                }))
            });
            function u() {
                "true" == localStorage.getItem("activeGrayScale") ? ($(".container").addClass("imgBW"),
                $.each($("img"), function(e, a) {
                    g[e] = "imagen_" + e,
                    $("img").addClass("imgBW")
                })) : ($(".container").removeClass("imgBW"),
                $.each($("img"), function(e, a) {
                    g[e] = "imagen_" + e,
                    $("img").removeClass("imgBW")
                }))
            }
            function v() {
                var e = $("body");
                "true" == localStorage.getItem("lsDislexia") ? e.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption, blockquote").each(function(e) {
                    $(".dislexia").addClass("icon-box-active"),
                    $(this).addClass("dislexia_active")
                }) : e.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption, blockquote").each(function(e) {
                    $(".dislexia").removeClass("icon-box-active"),
                    $(this).removeClass("dislexia_active")
                })
            }
            function f() {
                var e = $("body");
                "true" == localStorage.getItem("activeContrast") ? (e.find(".btn").each(function(e) {
                    $(this).css({
                        filter: "invert(1)"
                    })
                }),
                $.each($("img"), function(e, a) {
                    g[e] = "imagen_" + e,
                    $("img").css({
                        filter: "invert(1)"
                    })
                })) : (e.find(".btn").each(function(e) {
                    $(this).css({
                        filter: "invert(0)"
                    })
                }),
                $.each($("img"), function(e, a) {
                    g[e] = "imagen_" + e,
                    $("img").css({
                        filter: "invert(0"
                    })
                }))
            }
            document.getElementById("tipografia-slider");
            var t = !1;
            function b(e) {
                $(window).width() < 1534 && e ? ($("#ul-barra-accesibilidad li").css({
                    "border-left-style": "none"
                }),
                t = !0) : $(window).width() < 1534 && !e && !t && ($("#ul-barra-accesibilidad li").css({
                    "border-left-style": "solid"
                }),
                t = !1)
            }
        }, 400)
    }, 400)
}();