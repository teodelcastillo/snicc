$(document).ready(function() {
    compareAccessibilityEnable(true);
    function compareAccessibilityEnable(enable){
        if(enable) {
            if("true" == localStorage.getItem("activeGrayscale")) {
                $("#grayscale").addClass("active");
                $("body").addClass("grayscale");
            }
            if("true" == localStorage.getItem("activeCursorbig")) {
                $("#cursorbig").addClass("active");
                $("body").addClass("cursorbig");
            }
            if("true" == localStorage.getItem("activeDislexia")) {
                $("#dislexia").addClass("active");
                $("body").addClass("dislexia");
            }
            if("true" == localStorage.getItem("activeContrast")) {
                $("#contrast").addClass("active");
                $("body").addClass("contrast");
            }
            if("true" == localStorage.getItem("activeHighlight")) {
                $("#highlight").addClass("active");
                $("body").addClass("highlight");
            }
            if("true" == localStorage.getItem("activeScreenmask")) {
                $("#screenmask").addClass("active");
                $("body").addClass("screenmask");
                addMask();
            }
            if("true" == localStorage.getItem("activeReadguide")) {
                $("#readguide").addClass("active");
                $("body").addClass("readguide");
                addLine();
            }
            if("true" == localStorage.getItem("activeAudio")) {
                $("#audio").addClass("active");
                $("body").addClass("audio");
                activeAudio();
            }
        } else {
            if("true" == localStorage.getItem("activeGrayscale")) {
                $("#grayscale").removeClass("active");
                $("body").removeClass("grayscale");
            }
            if("true" == localStorage.getItem("activeCursorbig")) {
                $("#cursorbig").removeClass("active");
                $("body").removeClass("cursorbig");
            }
            if("true" == localStorage.getItem("activeDislexia")) {
                $("#dislexia").removeClass("active");
                $("body").removeClass("dislexia");
            }
            if("true" == localStorage.getItem("activeContrast")) {
                $("#contrast").removeClass("active");
                $("body").removeClass("contrast");
            }
            if("true" == localStorage.getItem("activeHighlight")) {
                $("#highlight").removeClass("active");
                $("body").removeClass("highlight");
            }
            if("true" == localStorage.getItem("activeScreenmask")) {
                $("#screenmask").removeClass("active");
                $("body").removeClass("screenmask");
                addMask();
            }
            if("true" == localStorage.getItem("activeReadguide")) {
                $("#readline").removeClass("active");
                $("body").removeClass("readline");
            }
            if("true" == localStorage.getItem("activeAudio")) {
                $("#audio").removeClass("active");
                $("body").removeClass("audio");
                speechSynthesis.cancel();
            }
        }
    }
    function activeAudio(){
        var audio = new SpeechSynthesisUtterance("Audio activado");
        //audio.voice = "Google español de Estados Unidos";
        audio.lang = "es-US";
        audio.rate = 1.2;
        audio.volume = 1;
        window.speechSynthesis.speak(audio);
    }
    function toCapitalize(str){
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    function removeMask() {
        $( "#maskAccesibility" ).remove();
        $(".maskRead").fadeOut("slow");
    }
    function addMask() {
        $("<div/>", {
            id: "maskAccesibility",
            class: "",
            title: "Accesibilidad - Mascara"
        }).appendTo("body");
        $("#maskAccesibility").append('<div class="maskRead  uw-zoom-exclude_top"  style="position: fixed !important; z-index: 2147483647 !important;width: 100% !important;background: rgba(0, 0, 0, 0.5); !important; top: 0px; height: 438px;"  uw-cer-popup-wrapper=""> <div style="width: 100% !important; height: 8px !important; position: absolute !important;  background: #232d4f;  bottom: 0px;" ></div></div><div class="maskRead  uw-zoom-exclude_bottom" uw-cer-popup-wrapper=""  style="position: fixed !important; z-index: 2147483647 !important;  width: 100% !important; background: rgba(0, 0, 0, 0.5)  !important;  height: 100%;"> <div style="width: 100% !important; height: 8px !important; position: absolute !important; background: #E7BA61; top: 0px;"></div></div>');
        $(".maskRead").fadeIn("slow");
    }
    function removeLine() {
        $( "#separator" ).remove();
        $(".separator").fadeOut("slow");
    }
    function addLine() {
        $("<div/>", {
            id: "separator",
            class: "separator",
            title: "Accesibilidad - Linea de lectura"
        }).appendTo("main");
        $(".separator").fadeIn("slow")
    }
    /* Jquery listener */
    $("#accesibility_buttons a.dropdown-item[id]").click(function() {
        const idButton = $(this).attr("id");
        if($(this).hasClass('active')) {
            $(this).removeClass('active');
            $("body").removeClass(idButton);
            localStorage.setItem("active"+toCapitalize(idButton), "false");
            if(idButton == "screenmask") {
                removeMask();
            } else if(idButton == "readguide") {
                removeLine();
            } else if(idButton == "audio") {
                speechSynthesis.cancel();
            }
        } else {
            $(this).addClass('active');
            $("body").addClass(idButton);
            localStorage.setItem("active"+toCapitalize(idButton), "true");
            if(idButton == "screenmask") {
                addMask();
            } else if(idButton == "readguide") {
                addLine();
            } else if(idButton == "audio") {
                activeAudio();
            }
        }
    }),
    $(document).on("mouseenter", "div, section>div,div>a>img, img, p, dd, dt, a, h1, h2, h3, h4,h5, h6, span, blockquote,div>h3, h4>a, input[placeholder]", function(e) {
        //var a = $(this).attr("src");
        speechSynthesis.cancel();
        a = $(this).get(0).tagName;
        let t = "";
        t = "DIV" == a ? 0 < $(this).children().length ? "" : $(this).text() : "IMG" == a ? $(this).get(0).alt : "a" == a ? $("a").data("title") : $(this).text(),
        "true" === localStorage.getItem("activeAudio") && "" != t.trim() && (a = new SpeechSynthesisUtterance(t),
        //a.voice = "Google español de Estados Unidos",
        a.lang = "es-US",
        a.rate = 1.2,
        a.volume = 1,
        window.speechSynthesis.speak(a))
    }).mouseleave(function() {
        speechSynthesis.cancel();
    }),
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
    $(document).on("click mousemove", "body", function(e) {
        e.clientX;
        var a = e.clientY
            , t = a - 30
            , i = a + 30;
        localStorage.getItem("activeScreenmask") && ($(".uw-zoom-exclude_top").css("height", t),
        $(".uw-zoom-exclude_bottom").css("top", i)),
        localStorage.getItem("activeReadguide") && $(".separator").css({
            left: 0,
            top: e.pageY + 10
        })
    }),
    $(".reset").on("click", function(e) {
        compareAccessibilityEnable(false);
    });
    /*
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
    function p(a) {
        t.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption").each(function(e) {
            $(this).css({
                "line-height": a
            })
        })
    }
    
    var m = 0;
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

    function h(a) {
        t.find("a, p, li, dd, dt, a, h1, h2, h3, h4, .form-control, .btn, figcaption").each(function(e) {
            $(this).css({
                "letter-spacing": a
            })
        })
    }
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
    }));
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
    });

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
    }))*/
});