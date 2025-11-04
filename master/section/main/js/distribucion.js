var f = "distribucion-sector";
var sector_id = "all";
var join_todos = true;
var sector_nombre = "all";
var subactividad_nombre = "all";

var chart,
  indicador_id,
  ano,
  dis_sector_id,
  evo_sector_id,
  last_f,
  last_evo_sector_id;

var arrSectores = {};
arrSectores[1] =
  "Agricultura, ganadería, silvicultura y otros usos de la tierra";
arrSectores[2] = "Energía";
arrSectores[3] = "Procesos industriales y uso de productos";
arrSectores[4] = "Residuos";

var arrSectoresNombre = {};
arrSectoresNombre[
  "Agricultura, ganadería, silvicultura y otros usos de la tierra"
] = 1;
arrSectoresNombre["Energía"] = 2;
arrSectoresNombre["Procesos industriales y uso de productos"] = 3;
arrSectoresNombre["Residuos"] = 4;

var arrSubActividad = {};
arrSubActividad["Aguas residuales domésticas"] = 26;
arrSubActividad["Aguas residuales industriales"] = 27;
arrSubActividad["Cambio de carbono en suelos"] = 5;
arrSubActividad["Eliminación de residuos sólidos"] = 28;
arrSubActividad["Emisiones fugitivas"] = 13;
arrSubActividad["Excretas en pasturas"] = 4;
arrSubActividad["Fermentación entérica"] = 2;
arrSubActividad["Gestión de estiércol"] = 3;
arrSubActividad["Incineración de residuos"] = 29;
arrSubActividad["Industrias de la energía"] = 12;
arrSubActividad["Industrias manufactureras y de la construcción"] = 11;
arrSubActividad["Otros industria de los minerales"] = 14;
arrSubActividad["Otros industrias de los metales"] = 15;
arrSubActividad["Otros sectores"] = 9;
arrSubActividad["Pastizales"] = 8;
arrSubActividad["Producción de ácido nítrico"] = 16;
arrSubActividad["Producción de aluminio"] = 17;
arrSubActividad["Producción de amoníaco"] = 18;
arrSubActividad["Producción de cal"] = 19;
arrSubActividad["Producción de carburo"] = 20;
arrSubActividad["Producción de cemento"] = 21;
arrSubActividad["Producción de ceniza de sosa"] = 22;
arrSubActividad["Producción de hierro y acero"] = 23;
arrSubActividad["Producción fluoroquímica"] = 25;
arrSubActividad["Producción petroquímica y de negro de humo"] = 24;
arrSubActividad["Tierras de cultivo"] = 6;
arrSubActividad["Tierras forestales"] = 7;
arrSubActividad["Transporte"] = 10;
arrSubActividad["Uso de suelos"] = 1;

function updateTextInput(val) {
  $("#textInput").val("AÑO " + val);
  ver_resultado();
}
function selecAnio(div) {
  let valor = $("#select_ano").val();

  if ($(div).hasClass("restar_anio")) {
    if (valor > 1990) {
      valor = valor - 1;
    }
  }

  if ($(div).hasClass("sumar_anio")) {
    if (valor < 2018) {
      valor = parseInt(valor) + 1;
    }
  }

  $("#textInput").val("AÑO " + valor);

  $("#select_ano").val(valor);

  ver_resultado();
}

function round(value, amount = 2) {
  if (typeof value == "number") {
    return value.toFixed(amount).replace(".", ",");
  }

  if (typeof value == "string") {
    return parseFloat(value.replace(",", "."))
      .toFixed(amount)
      .replace(".", ",");
  }
}

function toComma(value) {
  return String(value).replace(".", ",");
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function correctDecimals(d, cant) {
  return d.toFixed(cant);
}

$(document).ready(function () {
  // MONITOREO

  $("#nav .nav_monitoreo .monitoreo_select").click(function () {
    $("#nav .nav_monitoreo .monitoreo_select").removeClass("activo");
    $(this).addClass("activo");

    f = "monitoreo";
    monitoreo_id = $(this).attr("data-monitoreo");

    ver_resultado();
    return false;
  });

  $(".nav_monitoreo .monitoreo h2.access").click(function () {
    $parent = $(this).parent(".main.monitoreo");

    if (!$parent.hasClass("activo")) {
      $(".nav_monitoreo .monitoreo")
        .not($parent)
        .removeClass("activo")
        .slideUp();
      $parent.addClass("activo").children(".content").slideDown();
      $(".nav_monitoreo .main.back").slideDown();
      $(".mini_home").hide();
    } else {
      $(".nav_monitoreo .main").removeClass("activo").show();
      $(".nav_monitoreo .main").find(".activo").removeClass("activo");
      $(".nav_monitoreo .main .content").slideUp();
      $(".nav_monitoreo .main .labels").slideUp();
      $(".nav_monitoreo .main .categorias").slideUp();
      $(".nav_monitoreo .main.back").slideUp();
    }

    // SI ELIGIÓ LA OPCION ENERGÍA MUESTRO ESA MINIHOME
    if ($parent.hasClass("energia")) {
      $(".home_monitoreo").hide();
      $(".home_monitoreo_energia").show();

      $("#body .info h1").addClass("monitoreo");

      $(".content.monitoreo .home_monitoreo_energia #chart_title").html(
        "PLAN DE ACCIÓN NACIONAL DE ENERGÍA"
      );
      $(".content.monitoreo .home_monitoreo_energia #chart_subtitle").html(
        "MEDIDAS DE MITIGACIÓN"
      );

      $(".monitoreo_zocalo").show(); // mostrar zocalo en energia
    }

    if ($parent.hasClass("transporte")) {
      $(".home_monitoreo").hide();
      $(".home_monitoreo_transporte").show();

      $("#body .info h1").addClass("monitoreo");

      $(".content.monitoreo .home_monitoreo_transporte #chart_title").html(
        "PLAN DE ACCIÓN NACIONAL DE ENERGÍA"
      );
      $(".content.monitoreo .home_monitoreo_transporte #chart_subtitle").html(
        "MEDIDAS DE MITIGACIÓN"
      );

      $(".monitoreo_zocalo").show(); // mostrar zocalo en movilidad
    }

    if ($parent.hasClass("bosques")) {
      $(".home_monitoreo").hide();
      $(".home_monitoreo_bosques").show();

      $("#body .info h1").addClass("monitoreo");

      $(".content.monitoreo .home_monitoreo_bosques #chart_title").html(
        "PLAN DE ACCIÓN NACIONAL DE ENERGÍA"
      );
      $(".content.monitoreo .home_monitoreo_bosques #chart_subtitle").html(
        "MEDIDAS DE MITIGACIÓN"
      );

      $(".monitoreo_zocalo").show(); // mostrar zocalo en biodiversidad
    }
  });

  // CLICKEAR EL BOTON DE BACK ES COMO SI CLICKEARA EN EL ACTIVO
  $(".nav_monitoreo .main.back").on("click", function () {
    $(".nav_monitoreo .monitoreo.activo h2").click();
  });

  $(".nav_monitoreo .slider").click(function () {
    if ($(this).next(".categorias").is(":hidden")) {
      $(".categorias").not(this).parents(".updownarrow").removeClass("activo");
      $(".categorias").not(this).slideUp();
    }

    $(this)
      .next(".categorias")
      .slideToggle(function () {
        if ($(this).is(":visible")) {
          $(this).parents(".updownarrow").addClass("activo");
        } else {
          $(this).parents(".updownarrow").removeClass("activo");
        }
      });
  });

  $(".nav_monitoreo .categorias h4").click(function () {
    if ($(this).next(".labels").is(":hidden")) {
      $(".nav_monitoreo .categorias .labels").not(this).slideUp();
      $(".nav_monitoreo .categorias h4").not(this).removeClass("activo");
    }

    $(this)
      .next(".labels")
      .slideToggle(function () {
        if ($(this).is(":visible")) {
          $(this).prev("h4.categoria").addClass("activo");
        } else {
          $(this).prev("h4.categoria").removeClass("activo");
        }
      });
  });

  $(".nav_monitoreo .categorias .labels h5.categoria").click(function () {
    if ($(this).next(".labels").is(":hidden")) {
      $("h5.categoria").next(".labels").not($(this).next(".labels")).slideUp();
      $("h5.categoria").not(this).removeClass("activo");
    }

    $(this)
      .next(".labels")
      .slideToggle(function () {
        if ($(this).is(":visible")) {
          $(this).prev("h5.categoria").addClass("activo");
        } else {
          $(this).prev("h5.categoria").removeClass("activo");
        }
      });
  });

  $("p.categoria").click(function () {
    if ($(this).next(".labels").is(":hidden")) {
      $("p.categoria").next(".labels").not($(this).next(".labels")).slideUp();
      $("p.categoria").not(this).removeClass("activo");
    }

    $(this)
      .next(".labels")
      .slideToggle(function () {
        if ($(this).is(":visible")) {
          $(this).prev("p.categoria").addClass("activo");
        } else {
          $(this).prev("p.categoria").removeClass("activo");
        }
      });
  });

  // $('#select_ano').click(function(){
  //     if($('.select.tipo_de_gases').hasClass('activo')) {
  //         $('.main.select.tipo_grafico').css('display','block');
  //     }
  // })

  $(".main.select.tipo_grafico h3.slider.tipo_de_gases").click(function () {
    $(".updownarrowmain.select_grafico").click();
  });

  var lastYear = 2018;
  for (i = 1990; i <= lastYear; i++) {
    // $("#select_ano").append("<option value='"+i+"'>"+i+"</option>");
  }

  //$("#nav .select.ano select").val( lastYear );
  //$("#nav .select.ano span").html( lastYear );
  //$("#nav .select.ano select option").show();

  $("#nav").on("click", ".updownarrowmain", function () {
    $(this)
      .toggleClass("activo")
      .siblings(".content_distribucion_evolucion")
      .slideToggle();
    // $(this).addClass('activo').siblings(".content_distribucion_evolucion").show();
  });

  // SLIDES DE CATEGORIAS
  $("#nav .distribucion").on("click", "h3.slider", function () {
    f = $(this).attr("data-f");

    if (f != "distribucion-sector") {
      if (f != "ano") {
        $(".porsectores .labels label").removeClass("activo");
      }

      $("#nav .main.distribucion .select .sectores").css("display", "none");
    } else {
      $("#nav .main.distribucion .select .sectores").css("display", "block");
    }
    if (f == "distribucion-gases") {
      $(".main.select.tipo_grafico").css("display", "block");
    } else {
      $(".main.select.tipo_grafico").css("display", "none");
    }
    if (f == "ano") {
      if ($("#nav .main .select").hasClass("activo")) {
        f = $("#nav .main .select.activo h3.slider").attr("data-f");
        if ($(".select.tipo_de_gases").hasClass("activo")) {
          $(".main.select.tipo_grafico").css("display", "block");
          f = "distribucion-gases";
        }
      }
    }

    if (!$(this).parent(".select").parent(".updownarrow").hasClass("anobox")) {
      // $("#nav .select.ano select").val( '2014' );
      // $("#nav .select.ano span").html( '2014' );
      $("#nav .select.ano select option").show();

      $(".distribucion .select")
        .removeClass("activo")
        .children(".labels:visible")
        .slideUp();

      // CUANDO CLICKEA LOS SLIDERS QUE NO SON EL Año
      f = $(this).attr("data-f");

      // if(f == 'distribucion-gases' || f == 'distribucion-gases-sector' || f == 'distribucion-sankey')
      if (f == "distribucion-sankey") {
        // $("#nav .select.ano select").val( '2014' );
        // $("#nav .select.ano select option").hide().filter("[value=2014]").show();
        // $("#nav .select.ano span").html( '2014' );
      }
    }

    $(this)
      .parent(".select")
      .toggleClass("activo")
      .children(".labels")
      .slideToggle();
  });

  $("#nav .evolucion").on("click", "h3.slider", function () {
    f = $(this).attr("data-f");
  });

  // RADIO BUTTONS
  $("#nav").on("click", "label.sec", function () {
    $("#nav label.sec").removeClass("activo");
    $(this).addClass("activo");
  });

  // RADIO BUTTONS DE DISTRIBUCION
  $("#nav .nav_emisiones").on("click", "label.sec", function () {
    f = "distribucion-sector";
  });

  // SELECTOR DE AÑO
  $("#nav").on("change", "select.ano", function () {
    $("#nav .select.ano span").html($(this).val());
  });

  // $('select.ano option').click(function(){
  //     console.log('select ano');
  //     if( $('.nav_emisiones .select').hasClass('activo') ) {

  //         $('.nav_emisiones .select.activo').click();
  //         console.log('select ano select');
  //       }

  //       if( $('.nav_emisiones label.sec').hasClass('activo') ) {
  // console.log('select ano label');
  //         $('.nav_emisiones .sec.activo').click();

  //       }
  // });

  $("#nav .main.distribucion").on("click", "#btn-ver_resultado", function () {
    if ($(".nav_emisiones div.select.porsectores").hasClass("activo")) {
      if ($(".nav_emisiones label.sec").hasClass("activo")) {
        console.log("select ano label");
        $(".nav_emisiones .sec.activo").click();
      } else {
        $("#monitor_title_anio").show();
        $(".main.distribucion div.select.activo h3.slider_h3").click();
        console.log("select ano select");
      }
    }
    ver_resultado();
  });

  $("#nav .main.evolucion").on("click", "#btn-ver_resultado", function () {
    f = "evolucion-sector";
    ver_resultado();
  });

  $("#nav .main.provincial").on("click", "#btn-ver_resultado", function () {
    f = "desagregacion-provincial";
    ver_resultado();
  });

  // $(".select.porsectores").addClass('activo').children(".labels").slideToggle();;

  $("#nav .main.evolucion").on(
    "change",
    "input[name=evo_sector_id]",
    function () {
      f = "evolucion-sector";
    }
  );

  ////////////////////////////////////
  // BOTONES DE ARRIBA DE LA SELECCION LATERAL
  ////////////////////////////////////

  $("#nav").on("click", ".emisionesindicadores", function () {
    // COLORES BOTONES
    $(".emisionesindicadores").removeClass("activo");
    $(this).addClass("activo");

    // COLOR DEL BORDECITO DE LA CAJA
    var opcion = $(this).data("opcion");
    $(this).parent().removeClass().addClass(opcion);

    $("#body > .content").hide();

    if ($(this).hasClass("indicadores")) {
      $("#body > .content.nomonitoreo").show();

      $("#nav .nav_emisiones").hide();
      $("#nav .nav_indicadores").show();
      $("#nav .nav_monitoreo").hide();

      // COLOR TITULO PRINCIPAL DEL GRAFICO
      $("#body .info h1").addClass("indicadores");
      $("#body .info h1").removeClass("emisiones");
      $("#body .info h1").removeClass("monitoreo");
    } else if ($(this).hasClass("emisiones")) {
      $("#body > .content.nomonitoreo").show();

      $("#nav .nav_emisiones").show();
      $("#nav .nav_indicadores").hide();
      $("#nav .nav_monitoreo").hide();

      // COLOR TITULO PRINCIPAL DEL GRAFICO
      $("#body .info h1").addClass("emisiones");
      $("#body .info h1").removeClass("indicadores");
      $("#body .info h1").removeClass("monitoreo");

      //$("#nav .nav_emisiones").children("input[type=radio]").first().click();
      $("#dis_sec_all").click();
    } else if ($(this).hasClass("monitoreo")) {
      $("#body > .content.monitoreo").show();

      $("#nav .nav_emisiones").hide();
      $("#nav .nav_indicadores").hide();
      $("#nav .nav_monitoreo").show();

      // COLOR TITULO PRINCIPAL DEL GRAFICO
      $("#body .info h1").removeClass("emisiones");
      $("#body .info h1").removeClass("indicadores");
      $("#body .info h1").addClass("monitoreo");

      init_monitoreo();
    }
  });

  $("#nav .nav_indicadores").on("click", "h3.slider", function () {
    $("#nav .nav_indicadores .select").removeClass("activo");
    $(this).parent(".select").addClass("activo");

    // f = $(this).attr('data-f');
    f = "indicador";
    indicador_id = $(this).attr("data-indicador");

    ver_resultado();
  });
  // ARRANCO CON EL GRAFICO DE SECTORES
  $(".select.porsectores").addClass("activo").children(".labels").show();
  ver_resultado();

  function parseURL(url) {
    var parser = document.createElement("a"),
      searchObject = {},
      queries,
      split,
      i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, "").split("&");
    for (i = 0; i < queries.length; i++) {
      split = queries[i].split("=");
      searchObject[split[0]] = split[1];
    }
    return {
      protocol: parser.protocol,
      host: parser.host,
      hostname: parser.hostname,
      port: parser.port,
      pathname: parser.pathname,
      search: parser.search,
      searchObject: searchObject,
      hash: parser.hash,
    };
  }

  var URLactual = window.location;
  var parseURL = parseURL(URLactual);
  if (parseURL.hash == "#monitor") {
    $("button.monitoreo").click();
  }
});

function volver() {
  // ME FIJO LOS VALORES DE F Y VOY AL ANTERIOR

  if (f == "evolucion-sector-subactividad") {
    f = "evolucion-sector";
  }

  if (f == "evolucion-sector-subactividad-categoria") {
    f = "evolucion-sector-subactividad";
  }

  graficar();
}

function ver_monitoreo() {
  $("#chart_title").html("Monitoreo");
}

function monitor_mostrarPlan(obj) {
  item = $(obj).parent("div.monitoreo_item").data("monitoreo");

  $(".nav_monitoreo .monitoreo." + item + " h2.access").click();
}
function abrirMenu(obj) {
  var data_clase = $(obj).parents("div.hme_content").data("plan");

  if (
    $("." + data_clase)
      .parent("div.select")
      .hasClass("activo") == false
  ) {
    $("." + data_clase).click();

    data_clase = $(obj).data("plan");

    $("." + data_clase).click();
  } else {
    if ($(".categorias").parent("div.select").hasClass("activo") == true) {
      data_clase = $(obj).data("plan");

      $("." + data_clase).click();
    }
  }
}

function abrir_desplegable(obj) {
  var data_clase = $(obj).parent("div.sectores").data("label");

  if ($("." + data_clase).hasClass("activo") == true) {
    $(
      "#nav .main.distribucion .content_distribucion .select .labels ." +
        data_clase +
        " .labels"
    ).css("display", "none");
    $("." + data_clase).removeClass("activo");
    $(
      "#nav .main.distribucion .content_distribucion .select .labels ." +
        data_clase +
        " .titulo_sec .plusminus"
    ).text("+");
  } else {
    if (
      $("#nav .main.distribucion .content_distribucion .select .labels")
        .children()
        .hasClass("activo") == true
    ) {
      $("#nav .main.distribucion .content_distribucion .select .labels")
        .children()
        .removeClass("activo");
      $(
        "#nav .main.distribucion .content_distribucion .select .labels .sectores .labels"
      ).css("display", "none");
      $(
        "#nav .main.distribucion .content_distribucion .select .labels .sectores .titulo_sec .plusminus"
      ).text("+");
    }
    $("." + data_clase).addClass("activo");
    $(
      "#nav .main.distribucion .content_distribucion .select .labels ." +
        data_clase +
        " .labels"
    ).css("display", "block");
    $(
      "#nav .main.distribucion .content_distribucion .select .labels ." +
        data_clase +
        " .titulo_sec .plusminus"
    ).text("-");
  }
}

function tipo_de_grafico(obj) {
  f = "distribucion-gases";
  var div = $(obj).parent();

  if ($(div).children().hasClass("activo")) {
    $(div).children().removeClass("activo");
  }
  //console.log('aaaa');
  $(obj).addClass("activo");
  $("#grafico").click();
}

/*
function controlUnidad(unidad){
    if(unidad == 'm3')
    {
        return 'm<sup>3</sup>';
    }else{
        return unidad;
    }
}
*/
function ver_resultado() {
  // DATOS DEL FILTRO
  ano = $("#select_ano").val();
  dis_sector_id = $("input[type=radio][name=dis_sector_id]")
    .filter(":checked")
    .val();
  evo_sector_id = $("input[type=radio][name=evo_sector_id]")
    .filter(":checked")
    .val();
  var selec_checked = $("input[type=radio][name=tipo_de_grafico]")
    .filter(":checked")
    .val();
  $("#text_box_treemap").hide();
  $(".container_canvas_organismo").hide();

  if (
    f == "distribucion-sector" ||
    f == "distribucion-gases" ||
    f == "distribucion-gases-sector" ||
    f == "distribucion-sankey"
  ) {
    // CAMBIO DATOS DUROS DE PANTALLA
    $("#chart_ano").html(ano);
    $(".container_canvas svg").css("display", "none");
  }

  // GRAFICO 1
  // DISTRIBUCION DE GEI ENTRE TODOS LOS SECTORES. TORTA
  if (f == "distribucion-sector" && dis_sector_id == "all") {
    $("#chart_title").html("Distribución de GEI");
  } else {
    $("#chart_bubble").hide();
    $(".container_canvas").hide();
  }

  // CAJA DE EMISIONES NO ASIGNADAS
  $("#box_chart_emisiones_no_asignadas").hide();

  // CAJA DE TOTAL ANUAL NETO
  $(".box_chart_totalanualneto").hide();

  // CUANDO MUESTRO EL SANKEY ESCONDO LOS GRAFICOS
  if (f == "distribucion-sankey") {
    console.log("-- distribucion-sankey");

    $("#chart").hide();
    $("#chart").html("");
    $("#chart_psd3").hide();

    $("#chart_descripcion").hide();

    $("#chart_descripcion_inner").hide();

    $("#chart_agricultura_disclaimer").hide();

    $("#chart_sankey").show();
    $("#chart_back").hide();

    $("#box_chart_sector").show();
    $("#chart_sector").show();

    $("#chart_title").html("Distribución de GEI por uso final");
    $("#chart_sector").html("Todos");

    graficar();
  } else if (f == "desagregacion-provincial") {
    $("#chart_title").html("Desagregación Provincial");

    $("#box_chart_totalanual").hide();
    $("#chart").hide();
    $("#chart_psd3").hide();

    $("#chart_descripcion").hide();

    $("#chart_descripcion_inner").hide();

    $("#chart_agricultura_disclaimer").hide();

    $("#chart_sankey").hide();

    $("#chart_provincial").show();

    $("#box_chart_emisiones_no_asignadas").show();

    $("#box_chart_sector").show();
    $("#chart_sector").html("Todos");

    $("#chart_unidad").html("MtCO₂e");

    $("#chart_ano").html("2010 - 2018");
  } else {
    $("#chart").show();
    $("#chart_psd3").hide();
    $("#chart_sankey").hide();
    $("#chart_provincial").hide();
    graficar();
  }
  if (f == "distribucion-gases" || f == "ano") {
    $("#monitor_title_anio").css("display", "block");
    if ($(".select.tipo_de_gases").hasClass("activo")) {
      $(".main.select.tipo_grafico").css("display", "block");
      $("#grafico").click();
    }
  } else {
    $(".main.select.tipo_grafico").css("display", "none");
  }
  ///NUEVO GRAFICO MOSAICO
  if (f == "distribucion-categoria-clave" || f == "distribucion-subactividad") {
    $("#chart_sector").hide();
    $("#box_chart_sector").hide();
    $("#chart_ano").html(ano);
  }
  // Ocultar gráficos de anillo
  $("#chart2").remove(); //2016
  $("#chart3").remove(); //2017
  $("#chart4").remove(); //2018
  $("#chart5").remove(); //2019
  $("#chart6").remove(); //2020
  $(".fecha").remove();
  $("#chart").css("width", "100%");
  $("#chart").css("margin", "0");
  /*$("#chart").css("display", "block");*/
  $("#chart").css("padding", "0");
  $("#body .content").css("text-align", "left");
  $("#chart_custom_legend").html("");
  $("#chart_custom_legend").hide();
}

function init_monitoreo() {
  // CUANDO TOCAN LA SOLAPA DE MONITOREO ARRANCO DE CERO
  $(".nav_monitoreo .monitoreo.activo h2").click();
  $(".content.monitoreo > div").hide();
  $(".content.monitoreo .home_monitoreo").show();
  $(".main.back").hide(); // TODO: REVISAR EL FUNCIONAMIENTO - oculta el botón volver al ingresar por primera vez a la pestaña monitoreo
  $(".monitoreo_zocalo").hide(); // ocultar zocalo en la pestaña del mandala de monitoreo
}

function get_chart_width() {
  // ESTE ES EL ESPACIO QUE TENGO DISPONIBLE
  var width = $("#body .content").width();

  // console.log(width);

  return width;
}

function get_chart_height() {
  // ESTE ES EL ESPACIO QUE TENGO DISPONIBLE
  var height =
    $(document).height() -
    $("footer").height() -
    $("footer").height() -
    $("#body .info").height() * 2 -
    17 -
    17 -
    50;

  var exceso = 0;

  if (height > 600) {
    exceso = height - 600;
    height = 600;
  }

  if (exceso > 0) {
    $("#chart").css({ marginTop: exceso / 2 + "px" });
  }

  height = height < 400 ? 400 : height;

  return height;
}

function graficar() {
  $("#chart_sankey #chart_sankey_graph").html("");
  $("#unidad_de_medida").hide();
  $("#chart_psd3").hide();

  $("#chart_provincial").hide();

  $("#chart_agricultura_disclaimer").hide();

  $("#box_chart_subactividad").hide();
  $("#box_chart_totalanual").hide();

  // $("#box_chart_sector").hide();
  $("#chart_unidad").html("MtCO₂e");

  $("#chart_back").hide();

  if (f != "indicador") $("#chart_descripcion").hide();

  // DISTRIBUCION DE GEI ENTRE TODOS LOS SECTORES. CORONA
  if (f == "distribucion-sector" && dis_sector_id == "all") {
    $("#box_chart_totalanual").show();
    $(".ley").css("display", "block");
    $("#box_chart_sector").css("display", "block");
    $("#monitor_title_anio").css("display", "block");
    $("#chart_sector").html("Todos");
  }

  if (f == "distribucion-sector" && dis_sector_id != "all") {
    // GRAFICO CORONA
    $("#box_chart_sector").show();
    $("#monitor_title_anio").css("display", "none");
    $("#chart_title").html("Distribución de GEI por sector");
    $("#chart_sector").html(arrSectores[dis_sector_id]);
    $(".ley").css("display", "block");
    $("#monitor_title_anio").css("display", "block");
    $("#box_chart_totalanual").show();
  }

  if (f == "distribucion-gases") {
    $("#box_chart_sector").show();
    $(".ley").css("display", "block");
    $("#chart_title").html("Distribución de GEI por tipo de gases");
    $("#chart_sector").html("Todos");
  }

  if (f == "distribucion-gases-sector") {
    $("#box_chart_sector").show();
    $(".ley").css("display", "block");
    $("#chart_title").html("Distribución de GEI por tipo de gases por sector");
    $("#chart_sector").show();
    $("#chart_sector").html("Todos");
  }

  if (f == "evolucion-sector" && evo_sector_id == "all") {
    $("#box_chart_sector").show();
    $(".ley").css("display", "block");
    $("#chart_sector").html("Todos");
    $("#monitor_title_anio").css("display", "block");
    $("#chart_title").html("Evolución de GEI");
    $("#chart_ano").html("1990 - 2018");
    sector_id = evo_sector_id;
  }

  if (f == "evolucion-sector" && evo_sector_id != "all") {
    sector_id = evo_sector_id;

    $("#box_chart_sector").show();
    $("#chart_sector").html(arrSectores[sector_id]);
    $(".ley").css("display", "block");
    $("#monitor_title_anio").css("display", "block");
    $("#chart_title").html("Evolución de GEI por sector");
    $("#chart_ano").html("1990 - 2018");
  }

  if (f == "evolucion-sector-subactividad" && evo_sector_id != "all") {
    sector_id = evo_sector_id;
    $("#chart_title").html("Evolución de GEI por sector - subactividad");
    $(".ley").css("display", "block");
    $("#monitor_title_anio").css("display", "block");
    $("#chart_ano").html("1990 - 2018");

    $("#box_chart_sector").show();
    $("#chart_sector").html(arrSectores[sector_id]);

    $("#chart_back").show();
  }

  if (
    f == "evolucion-sector-subactividad-categoria" &&
    evo_sector_id != "all"
  ) {
    sector_id = evo_sector_id;
    $("#chart_title").html("Evolución de GEI por subactividad - categoría");
    $(".ley").css("display", "block");
    $("#monitor_title_anio").css("display", "block");
    $("#chart_ano").html("1990 - 2018");

    $("#box_chart_sector").show();
    $("#chart_sector").html(arrSectores[sector_id]);

    $("#box_chart_subactividad").show();
    // LA SUBACTIVIDAD ESTA ADENTRO DEL AJAX

    $("#chart_back").show();
  }

  //////////////////////////////////////////
  // INDICADORES
  //////////////////////////////////////////

  if (f == "indicador") {
    $(".ley").css("display", "block");

    $("#box_chart_sector").hide();

    $("#monitor_title_anio").css("display", "block");

    if (indicador_id == 5) {
      $("#chart_ano").html("2004 - 2018");
    } else {
      $("#chart_ano").html("1990 - 2018");
    }
  }

  if (f == "monitoreo") {
    $("#monitor_title_anio").css("display", "none");

    $("#box_chart_sector").hide();

    // if(monitoreo_id == 36)
    // {
    //     $("#chart_ano").html("2014 - 2018");
    // }
    // if(monitoreo_id == 37)
    // {
    //     $("#monitor_title_anio").css("display","none");

    // }
    // else
    // {
    //     $("#chart_ano").html("2015 - 2018");
    // }
  }

  var char_height = get_chart_height();
  var char_width = get_chart_width();

  //////////////////////////////////////////
  // MONITOREOSround
  //////////////////////////////////////////

  // if(f ==  "distribucion-sector" && $("input[type=radio][name=dis_sector_id]").filter(':checked').val() == 'all')
  if (f == "distribucion-sector" && dis_sector_id == "all") {
    $(".container_canvas").hide();

    var params = {
      sector_id: "all",
      ano: $("#select_ano").val(),
      f: f,
    };

    $.getJSON(
      "informe/distribucion-sectores/" + params.ano,
      {},
      function (data) {
        totalActividades =
          parseFloat(data.sector_1[1]) +
          parseFloat(data.sector_2[1]) +
          parseFloat(data.sector_3[1]) +
          parseFloat(data.sector_4[1]);
        $("#totalActividades").html(round(totalActividades));

        console.log(totalActividades);

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            // iris data from R
            columns: [
              data.sector_1,
              data.sector_2,
              data.sector_3,
              data.sector_4,
            ],

            type: "pie",

            onmouseover: function (d) {
              var title = eval("data.sector_" + (d.index + 1) + "[0]");

              // En Distribución de gei-> Agricultura, ganadería, silvicultura y otros usos del suelo,
              // en el box aclaratorio agregar entre paréntesis (AGSyOUT) al lado del título en verde clarito
              if (d.index == 0) {
                title += " (AGSyOUT)";
              }

              html =
                "<h2 style='color:" +
                data.colores[d.index] +
                "''>" +
                title +
                "</h2>" +
                data.descripciones[d.index];

              $("#chart_descripcion").show().html(html);
            },

            onmouseleave: function (d) {
              $("#chart_descripcion").html("").hide();
            },
          },

          pie: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.1%");
                return toComma(percentFormat(ratio));
              },
            },
          },

          color: {
            pattern: data.colores,
          },

          legend: {
            item: {
              onclick: function () {},
            },
          },

          onrendered: function () {
            /*                     d3.selectAll("#chart .c3-chart-arc text").each(function(v) {
                          var label = d3.select(this);
                          var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                          x = pos[0] + 7;
                          y = pos[1] - 7;
                          pos = [x, y];
                          label.attr("transform", "translate("+ pos[0] +","+ pos[1] +")");
                      });
   */
            d3.selectAll(".c3-chart-arc text").each(function (v) {
              // var label = d3.select(this);
              // var data = label[0][0].innerHTML;

              // console.log( d3.select(this).text() );

              d3.select(this).text(toComma(d3.select(this).text()));
            });
          },

          tooltip: {
            contents: function (
              d,
              defaultTitleFormat,
              defaultValueFormat,
              color
            ) {
              var $$ = this,
                config = $$.config,
                titleFormat = config.tooltip_format_title || defaultTitleFormat,
                nameFormat =
                  config.tooltip_format_name ||
                  function (name) {
                    return name;
                  },
                valueFormat = config.tooltip_format_value || defaultValueFormat,
                text,
                i,
                title,
                value,
                name,
                bgcolor;

              for (i = 0; i < d.length; i++) {
                if (!(d[i] && (d[i].value || d[i].value === 0))) {
                  continue;
                }

                if (!text) {
                  title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                  text =
                    "<table class='" +
                    $$.CLASS.tooltip +
                    "'>" +
                    (title || title === 0
                      ? "<tr><th colspan='2'>" + title + "</th></tr>"
                      : "");
                  text = "<table class='" + $$.CLASS.tooltip + "'>";
                }

                name = nameFormat(d[i].name);
                value = valueFormat(
                  d[i].value,
                  d[i].ratio,
                  d[i].id,
                  d[i].index
                );
                bgcolor = $$.levelColor
                  ? $$.levelColor(d[i].value)
                  : color(d[i].id);

                text += "<tr>";
                text +=
                  "<td colspan='2' align='center'><span style='background-color:" +
                  bgcolor +
                  "'></span>" +
                  name +
                  "</td>";
                text += "</tr><tr>";
                text +=
                  "<td align='center'>" + value.replace(".", ",") + "</td>";
                text +=
                  "<td align='center'>" + round(d[i].value) + " MtCO₂e</td>";
                text += "</tr>";
              }
              return text + "</table>";
            },
          },
        });
      }
    );
  }

  // if(f ==  "distribucion-sector" && $("input[type=radio][name=dis_sector_id]").filter(':checked').val() != 'all')
  if (f == "distribucion-sector" && dis_sector_id != "all") {
    $(".container_canvas").hide();
    var graph_data, totalActividades, colors_pattern;

    var params = {
      sector_id: dis_sector_id,
      ano: $("#select_ano").val(),
      f: f,
    };

    char_height -= 40;
    char_side = char_height <= char_width ? char_height : char_width;

    $("#chart").hide();
    $("#chart_psd3").html("").show();

    $.getJSON(
      "informe/distribucion-sector/" + params.ano + "/" + params.sector_id,
      {},
      function (resp) {
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        console.log(resp);
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        graph_data = resp.graph_data;

        totalActividades = resp.totalActividades;

        $("#totalActividades").html(round(totalActividades));

        if (dis_sector_id == 1) {
          // En Distribución de gei-> Agricultura, ganadería, silvicultura y otros usos del suelo,
          // en el box aclaratorio agregar entre paréntesis (AGSyOUT) al lado del título en verde clarito

          resp.sector.nombre += " (AGSyOUT)";

          $("#chart_agricultura_disclaimer").show();
          $("#chart_agricultura_disclaimer #act_1").html(
            Math.round(resp.actividad["1"])
          );
          $("#chart_agricultura_disclaimer #act_2").html(
            Math.round(resp.actividad["2"])
          );
          $("#chart_agricultura_disclaimer #act_3").html(
            Math.round(resp.actividad["3"])
          );

          var totalActividadesNeto =
            parseFloat(resp.actividad["1"]) +
            parseFloat(resp.actividad["2"]) +
            parseFloat(resp.actividad["3"]);

          console.log(totalActividadesNeto);

          $("#chart_agricultura_disclaimer #act_total").html(
            toComma(parseInt(totalActividadesNeto))
          );

          $(".box_chart_totalanualneto").show();

          $("#totalActividadesNeto").html(round(totalActividadesNeto));

          //colors_range = d3.scale.ordinal().range([resp.sector.color, '#93b8a5', '#41b87b', '#9ba06a', '#27b8a7', '#f47060', '#c7df86', '#f19f9c', '#f8bb99', '#9da0a0', '#91709e', '#6d5575', '#0000ff', '#00ffff', '#ff00ff', '#333333'])
          //colors_range = d3.scale.ordinal().range([resp.sector.color, '#35a09c', '#54b49d', '#6db0a0', '#53ede3', '#76ffee', '#98e5d6', '#87fae1', '#92ffd5', '#6af7d5', '#56b67b', '#9aa06a', '#c8de87', '#0fb64f'])
          //colors_range = d3.scale.ordinal().range([resp.sector.color, '#35a09c', '#54b49d', '#6db0a0', '#53ede3', '#76ffee', '#98e5d6', '#87fae1', '#35a09c', '#6af7d5', '#04d1c9', '#14c1ba', '#25b0ab', '#45908d', '#3d9894', '#35a09c'])
          colors_range = d3.scale
            .ordinal()
            .range([
              resp.sector.color,
              "#45908D",
              "#489993",
              "#4BA199",
              "#4EAA9F",
              "#51B2A5",
              "#54BBAB",
              "#58C4B2",
              "#5BCEB9",
              "#5FD8C0",
              "#63E3C7",
              "#65E8CA",
              "#66EDCE",
              "#68F2D1",
              "#6AF7D5",
              "#6CF8D9",
              "#6EFADE",
              "#70FBE2",
              "#72FCE6",
              "#74FEEB",
              "#76FFEF",
            ]);
        } else if (dis_sector_id == 2) {
          //colors_range = d3.scale.ordinal().range([resp.sector.color, '#f4515c', '#ffb3b7', '#ffa3a8', '#ff8c92', '#ff737b', '#ff616c', '#f19f9c', '#f8bb99', '#9da0a0', '#91709e', '#6d5575', '#0000ff', '#00ffff', '#ff00ff', '#333333']);
          colors_range = d3.scale
            .ordinal()
            .range([
              resp.sector.color,
              "#f4515c",
              "#ffb3b7",
              "#ffa3a8",
              "#ff8c92",
              "#ff737b",
              "#ff616c",
              "#f19f9c",
            ]);
        } else if (dis_sector_id == 3) {
          console.log(resp.sector.color);
          colors_range = d3.scale
            .ordinal()
            .range([
              resp.sector.color,
              "#fb8b65",
              "#fba565",
              "#ff9780",
              "#f75646",
            ]);
        } else if (dis_sector_id == 4) {
          console.log(resp.sector.color);
          colors_range = d3.scale
            .ordinal()
            .range([resp.sector.color, "#8782b4", "#9b78aa", "#715b85"]);
        }
        if (resp.sector.nombre == "Procesos industriales y uso de productos") {
          var agregarPIUP = " (PIUP)";
        } else {
          var agregarPIUP = "";
        }
        html =
          "<h2 style='color:" +
          resp.sector.color +
          "'>" +
          resp.sector.nombre +
          agregarPIUP +
          "</h2>" +
          resp.sector.descripcion;

        $("#chart_descripcion").show().html(html);

        // Create config

        resultado = $("input[type=radio][name=dis_sector_id]")
          .filter(":checked")
          .data("resultado");

        var total = 0;

        var config = {
          containerId: "chart_psd3",

          width: char_side,

          height: char_side,

          data: graph_data,

          label: function (d) {
            angle = d.endAngle - d.startAngle;

            threshold = 0.001;

            if (angle < 0.15) {
              return "";
            } else {
              if (resultado == "unidad") {
                respuesta = d.data.value;
              } else {
                cantidad = graph_data.length;

                total = totalActividades;

                console.log(total);
                total = (d.data.value / total) * 100;

                respuesta = toComma(total.toFixed(1) + "%");
              }

              return respuesta;
            }
          },

          onmouseover: function (d) {
            var title = eval("data.sector_" + (d.index + 1) + "[0]");

            // En Distribución de gei-> Agricultura, ganadería, silvicultura y otros usos del suelo,
            // en el box aclaratorio agregar entre paréntesis (AGSyOUT) al lado del título en verde clarito

            title += " (AGSyOUT)";

            html =
              "<h2 style='color:" +
              data.colores[d.index] +
              "''>" +
              title +
              "</h2>" +
              data.descripciones[d.index];

            $("#chart_descripcion").show().html(html);
          },

          onmouseleave: function (d) {
            $("#chart_descripcion").html("").hide();
          },

          tooltip: function (d) {
            // return "<p>There are " + d.value + " medical colleges in " + d.label + ".</p>";

            // console.log(d);
            // console.log(d.endAngle - d.startAngle);

            perc = (d.value * 100) / totalActividades;
            perc = Math.round(perc * 100) / 100;

            text = "<table class=''><tr><th>" + d.label + "</th></tr>";
            text += "<tr>";
            // text += "<td align='center'>" + perc + "%</td>";
            text += "<td align='center'>" + round(d.value) + " MtCO₂e</td>";
            text += "</tr>";
            text + "</table>";

            return text;
          },

          donutRadius: 0,

          strokeWidth: 1,

          transition: "linear",

          transitionDuration: 100,

          labelColor: "white",

          colors: colors_range,
        };
        $("#chart").hide();
        // Draw chart
        var samplePie = new psd3.Pie(config);
      }
    );
  }

  var selec_checked = $("input[type=radio][name=tipo_de_grafico]")
    .filter(":checked")
    .val();

  if (f == "distribucion-gases") {
    $(".monitor_title_anio").css("display", "block");

    var params = {
      ano: $("#select_ano").val(),
      f: f,
    };

    $.getJSON("informe/distribucion-gases/" + params.ano, {}, function (data) {
      if (selec_checked == "barras") {
        $("#chart_bubble").hide();
        $(".container_canvas").hide();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",

            columns: [data.gases, data.valores],

            groups: [["Gases"]],

            type: "bar",

            color: function (color, d) {
              return data.colores[d.x];
            },
          },

          legend: {
            show: false,
          },

          bar: {
            width: {
              ratio: 0.5, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
          },

          tooltip: {
            contents: function (
              d,
              defaultTitleFormat,
              defaultValueFormat,
              color
            ) {
              var $$ = this,
                config = $$.config,
                titleFormat = config.tooltip_format_title || defaultTitleFormat,
                nameFormat =
                  config.tooltip_format_name ||
                  function (name) {
                    return name;
                  },
                valueFormat = config.tooltip_format_value || defaultValueFormat,
                text,
                i,
                title,
                value,
                name,
                bgcolor;

              for (i = 0; i < d.length; i++) {
                if (!(d[i] && (d[i].value || d[i].value === 0))) {
                  continue;
                }

                if (!text) {
                  title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                  text =
                    "<table class='" +
                    $$.CLASS.tooltip +
                    "'>" +
                    (title || title === 0
                      ? "<tr><th colspan='2'>" + title + "</th></tr>"
                      : "");
                  text = "<table class='" + $$.CLASS.tooltip + "'>";
                }

                // console.log(d);

                name = nameFormat(d[i].name);
                value = valueFormat(
                  d[i].value,
                  d[i].ratio,
                  d[i].id,
                  d[i].index
                );
                bgcolor = $$.levelColor
                  ? $$.levelColor(d[i].value)
                  : color(d[i].id);

                text += "<tr>";
                text += "<td align='center'>" + value + " MtCO₂e</td>";
                text += "</tr>";
              }
              return text + "</table>";
            },
          },
        });
      } else {
        $("#totalActividades").html(round(totalActividades));
        $("#chart").hide();
        $("#chart_psd3").hide();
        $("#chart_sankey").hide();
        $("#chart_bubble").show();
        $(".container_canvas").css("display", "block");
        $(".container_canvas").css("height", "788px");
        ancho = $("#chart_bubble").width();
        valor = ancho / 5;

        var radios = [];
        mayor = 0;
        porcentaje = 0;
        count = 0;
        for (i = 1; i < data.valores.length; i++) {
          if (data.valores[i] > mayor) {
            mayor = data.valores[i];
            if (mayor > 130) {
              resto = mayor - 130;
              porcentaje = resto / mayor;
              count = 1;
            }
          }
        }
        if (count != 0) {
          for (i = 1; i < data.valores.length; i++) {
            valor_total = data.valores[i] * porcentaje;
            radios.push(data.valores[i] - valor_total);
          }
        }

        var ctx = $("#chart_bubble");
        var popData = {
          datasets: [
            {
              data: [
                {
                  x: 0,
                  y: 0,
                  r: 0,
                },
                {
                  x: data.gases[1],
                  y: data.valores[1],
                  r: radios[0],
                },
                {
                  x: data.gases[2],
                  y: data.valores[2],
                  r: data.valores[2],
                },
                {
                  x: data.gases[3],
                  y: data.valores[3],
                  r: data.valores[3],
                },
                {
                  x: data.gases[4],
                  y: data.valores[4],
                  r: data.valores[4],
                },
                {
                  x: data.gases[5],
                  y: data.valores[5],
                  r: data.valores[5],
                },
              ],
              backgroundColor: [
                "",
                data.colores[0],
                data.colores[1],
                data.colores[2],
                data.colores[3],
                data.colores[4],
              ],
              label: ["Gases"],
            },
          ],
        };

        chart_bubble = new Chart(ctx, {
          type: "bubble",
          data: popData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 0,
            },
            scaleOverride: true,
            scales: {
              xAxes: [
                {
                  type: "category",
                  labels: [
                    "",
                    data.gases[1],
                    data.gases[2],
                    data.gases[3],
                    data.gases[4],
                    data.gases[5],
                  ],
                },
              ],
              yAxes: [
                {
                  ticks: {
                    min: 0,
                    max: mayor + 100,
                    display: false,
                  },
                },
              ],
            },

            responsive: true,
            legend: false,
            tooltips: {
              callbacks: {
                label: function (t, d) {
                  return (
                    d.datasets[t.datasetIndex].label +
                    " " +
                    t.xLabel +
                    " " +
                    t.yLabel +
                    " MtCO2e"
                  );
                },
              },
            },
          },
        });
      }
    });
  }

  if (f == "distribucion-gases-sector") {
    $(".main.select.tipo_grafico").css("display", "block");

    var params = {
      ano: $("#select_ano").val(),
      f: f,
    };

    $.getJSON(
      "informe/distribucion-gases-sector/" + params.ano,
      {},
      function (data) {
        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",

            // {
            //     "column_1":["x","CO\u2082","CH\u2084","N\u2082O","HFC","PFC","SF\u2086"]
            //     "column_2":["Agricultura, ganader\u00eda, silvicultura y otros usos de la tierra","46.635190","57.449208","40.256062",0,0,0],
            //     "column_3":["Energ\u00eda","184.399021","7.383652","1.694523",0,0,0],
            //     "column_4":["Procesos industriales y uso de productos","15.526682","0.191289","0.085720","0.613176","0.159765","0.001777"],
            //     "column_5":["Residuos","0.030545","13.145365","0.723403",0,0,0],
            // }

            columns: [
              data.column_1,
              data.column_2,
              data.column_3,
              data.column_4,
              data.column_5,
            ],

            groups: [
              [
                "Agricultura, ganadería, silvicultura y otros usos de la tierra",
                "Energía",
                "Procesos industriales y uso de productos",
                "Residuos",
              ],
            ],

            type: "bar",
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
          },

          color: {
            pattern: ["#54bdb4", "#f44652", "#f87652", "#9189b8"],
          },

          tooltip: {
            contents: function (
              d,
              defaultTitleFormat,
              defaultValueFormat,
              color
            ) {
              var $$ = this,
                config = $$.config,
                titleFormat = config.tooltip_format_title || defaultTitleFormat,
                nameFormat =
                  config.tooltip_format_name ||
                  function (name) {
                    return name;
                  },
                valueFormat = config.tooltip_format_value || defaultValueFormat,
                text,
                i,
                title,
                value,
                name,
                bgcolor;

              for (i = 0; i < d.length; i++) {
                if (!(d[i] && (d[i].value || d[i].value === 0))) {
                  continue;
                }

                if (!text) {
                  title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                  text =
                    "<table class='" +
                    $$.CLASS.tooltip +
                    "'>" +
                    (title || title === 0
                      ? "<tr><th colspan='2'>" + title + "</th></tr>"
                      : "");
                  text = "<table class='" + $$.CLASS.tooltip + "'>";
                }

                name = nameFormat(d[i].name);
                value = valueFormat(
                  d[i].value,
                  d[i].ratio,
                  d[i].id,
                  d[i].index
                );
                bgcolor = $$.levelColor
                  ? $$.levelColor(d[i].value)
                  : color(d[i].id);

                text += "<tr>";
                text +=
                  "<td align='left'><span style='background-color:" +
                  bgcolor +
                  "'></span>" +
                  name +
                  "</td>";
                // text += "<td>" + d[i].value + " MtCOâ‚‚e</td>";
                // text += "<td>" + value.toFixed(2).toString().replace('.',',') + " MtCOâ‚‚e</td>";
                text += "<td>" + round(value) + " MtCO₂e</td>";
                text += "</tr>";
              }
              return text + "</table>";
            },
          },
        });
      }
    );
  } else {
    $(".main.select.tipo_grafico").css("display", "none");
  }

  if (f == "distribucion-sankey") {
    console.log("distribucion-sankey");

    var colors = {
      residuos: "#9e7eaf",
      rsu: "#9e7eaf",
      ard: "#9e7eaf",
      ari: "#9e7eaf",
      residencial: "#168cb4",
      industrias: "#ee7250",
      pip: "#ee7250",
      minerales: "#ee7250",
      ags: "#61bbb1",
      ganaderia: "#c1ce02",
      agricultura: "#61bbb1",
      energia: "#e63e4b",
      piup: "#ee7250",
      genelectricidad: "#e63e4b",
      prodcombustibles: "#e63e4b",
      combustiblesind: "#e63e4b",
      combustiblesotros: "#e63e4b",
      fuentesmoviles: "#e63e4b",
      emisionesfugitivas: "#e63e4b",
      comercial: "#f3931b",
      transporte: "#e65193",
      epc: "#f8ba19",
      publico: "#868583",
      otros: "#cbba9c",
    };

    ano = $("#select_ano").val();

    sankey_file = "files/sankey." + ano + ".json";

    d3.json(sankey_file, function (error, json) {
      var chart = d3
        .select("#chart_sankey_graph")
        .append("svg")
        .chart("Sankey.Path");

      chart
        .name(label)
        .colorNodes(function (name, node) {
          return color(node, 1) || colors.fallback;
        })
        .colorLinks(function (link) {
          return (
            color(link.target, 4) || color(link.source, 1) || colors.fallback
          );
        })
        .nodeWidth(15)
        .nodePadding(10)
        .spread(true)
        .iterations(0)
        .alignLabel("auto")
        .draw(json);

      //mouseover en los labels
      chart.on("node:mouseover", function (node) {
        document.getElementById("chart_sankey_log").innerHTML = node.data;
      });

      chart.on("node:mouseout", function (node) {
        document.getElementById("chart_sankey_log").innerHTML = "&nbsp;";
      });

      chart.on("link:mouseover", function (link) {
        document.getElementById("chart_sankey_log").innerHTML = link.data;
      });

      chart.on("link:mouseout", function (link) {
        document.getElementById("chart_sankey_log").innerHTML = "&nbsp;";
      });

      function label(node) {
        return node.name.replace(/\s*\(.*?\)$/, "");
      }

      function color(node, depth) {
        var id = node.id.replace(/(_score)?(_\d+)?$/, "");

        if (colors[id]) {
          return colors[id];
        } else if (
          depth > 0 &&
          node.targetLinks &&
          node.targetLinks.length == 1
        ) {
          return color(node.targetLinks[0].source, depth - 1);
        } else {
          return null;
        }
      }
    });
  }

  if (f == "evolucion-sector" && sector_id == "all" && join_todos) {
    $.getJSON("informe/evolucion-sectores", {}, function (data) {
      // EN PRINCIPIO TENGO QUE SUMAR TODOS 22/06
      console.log("llamó informe/evolucion-sectores");
      console.log(data);

      data.column_todos = [];
      data.column_todos[0] = "Todos";

      for (i = 1; i <= 29; i++) {
        data.column_todos[i] =
          parseFloat(data.column_2[i]) +
          parseFloat(data.column_3[i]) +
          parseFloat(data.column_4[i]) +
          parseFloat(data.column_5[i]) +
          0;
      }

      chart = c3.generate({
        size: {
          height: char_height,
        },

        grid: {
          y: {
            lines: [{ value: 0 }], // add the value you want
          },
        },

        axis: {
          x: {
            padding: { right: 0.5, left: 0.5 },
            tick: {
              values: function (d) {
                return [
                  1990, 1992, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008,
                  2010, 2012, 2014, 2016, 2018,
                ];
              },
            },
          },
          y: {
            min: 0,

            padding: { bottom: 0 },
          },
        },

        data: {
          x: "x",

          columns: [
            data.column_1,
            data.column_todos,

            // data.column_1,
            // data.column_2,
            // data.column_3,
            // data.column_4,
            // data.column_5,
          ],

          onclick: function (d, element) {
            join_todos = false;

            $("#chart_back").show();

            // CLICKEA EN UN SECTOR
            f = "evolucion-sector";

            graficar();
          },
        },

        color: {
          pattern: ["#999999"],
        },

        point: {
          r: 3,
        },

        tooltip: {
          format: {
            // title: function (d) { return 'Data ' + d; },
            value: function (value, ratio, id) {
              value = Math.round(value * 100) / 100;

              txt = round(value) + " MtCO₂e";

              return txt;
            },
          },
        },
      });
    });
  }

  if (f == "evolucion-sector" && sector_id == "all" && !join_todos) {
    console.log("evolucion-sector join todos", join_todos);

    join_todos = true;

    $.getJSON("informe/evolucion-sectores", {}, function (data) {
      chart = c3.generate({
        size: {
          height: char_height,
        },

        grid: {
          y: {
            lines: [{ value: 0 }], // add the value you want
          },
        },

        axis: {
          x: {
            padding: { right: 0.5, left: 0.5 },
            tick: {
              values: function (d) {
                return [
                  1990, 1992, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008,
                  2010, 2012, 2014, 2016, 2018,
                ];
              },
            },
          },
          y: {
            min: 0,
            padding: { bottom: 0 },
          },
        },

        data: {
          x: "x",

          columns: [
            data.column_1,
            data.column_2,
            data.column_3,
            data.column_4,
            data.column_5,
          ],

          onclick: function (d, element) {
            $("#chart_back").show();

            // CLICKEA EN UN SECTOR
            f = "evolucion-sector";
            evo_sector_id = arrSectoresNombre[d.id];
            graficar();
          },
        },

        color: {
          pattern: data.colores,
        },

        point: {
          r: 3,
        },

        tooltip: {
          format: {
            // title: function (d) { return 'Data ' + d; },
            value: function (value, ratio, id) {
              value = Math.round(value * 100) / 100;

              txt = round(value) + " MtCO₂e";

              return txt;
            },
          },
        },
      });
    });
  }

  if (f == "evolucion-sector" && sector_id != "all") {
    var params = {
      f: f,
      sector_id: sector_id,
    };

    $.getJSON(
      "informe/evolucion-sector/" + params.sector_id,
      {},
      function (data) {
        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",

            columns: [data.column_1, data.column_2],

            type: "line",

            onclick: function (d, element) {
              $("#chart_back").show();

              // CLICKEA EN UN SECTOR
              f = "evolucion-sector-subactividad";
              sector_id: sector_id;

              graficar();
            },
          },

          axis: {
            x: {
              padding: { right: 0.5, left: 0.5 },
              tick: {
                values: function (d) {
                  return [
                    1990, 1992, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008,
                    2010, 2012, 2014, 2016, 2018,
                  ];
                },
              },
            },

            y: {
              min: 0,
              padding: { bottom: 0 },
              tick: {
                format: function (d) {
                  return toComma(d);
                },
              },
            },
          },

          // point: {show: false},

          color: {
            pattern: data.colores,
          },

          point: {
            r: 3,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " MtCO₂e";

                return txt;
              },
            },
          },
        });
      }
    );
  }

  if (f == "evolucion-sector-subactividad" && sector_id != "all") {
    var params = {
      f: f,
      sector_id: sector_id,
    };

    // $.getJSON("_post/ajax.php",params,function(data){
    $.getJSON(
      "informe/evolucion-sector-subactividad/" + params.sector_id,
      {},
      function (data) {
        var columns = [];

        for (i = 1; i < 20; i++) {
          if (typeof eval("data.column_" + i) != "undefined") {
            columns.push(eval("data.column_" + i));
          }
        }

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",

            columns: columns,

            type: "line",

            // groups: [
            //     data.groups
            // ],

            onclick: function (d, element) {
              // CLICKEA EN UN SECTOR
              f = "evolucion-sector-subactividad-categoria";
              subactividad_nombre = d.id;
              sector_id = sector_id;

              graficar();
            },
          },

          grid: {
            y: {
              lines: [{ value: 0 }], // add the value you want
            },
          },

          color: {
            pattern: [
              "#a8cd53",
              "#ed4d90",
              "#41b87b",
              "#0087a1",
              "#27b8a7",
              "#f47060",
              "#f9ad4e",
              "#f15651",
              "#f8bb99",
              "#9da0a0",
              "#91709e",
              "#6d5575",
              "#0000ff",
              "#00ffff",
              "#ff00ff",
              "#333333",
            ],
          },

          axis: {
            x: {
              padding: { right: 1, left: 1 },
            },

            y: {
              padding: {
                bottom: 0,
              },
              tick: {
                format: function (d) {
                  return toComma(d);
                },
              },
            },
          },

          point: {
            r: 3,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " MtCO₂e";

                return txt;
              },
            },
          },
        });
      }
    );
  }

  if (f == "evolucion-sector-subactividad-categoria") {
    var format = "";

    if (subactividad_nombre == "Producción de cal") format = ".2f";
    if (subactividad_nombre == "Producción de aluminio") format = ".1f";
    if (subactividad_nombre == "Aguas residuales domésticas") format = ".1f";

    var params = {
      f: f,
      sector_id: sector_id,
      subactividad_id: arrSubActividad[subactividad_nombre],
    };

    $("#chart_subactividad").html(subactividad_nombre);

    // $.getJSON("_post/ajax.php",params,function(data){
    $.getJSON(
      "informe/evolucion-sector-subactividad-categoria/" +
        params.sector_id +
        "/" +
        params.subactividad_id,
      {},
      function (data) {
        var columns = [];

        for (i = 1; i < 20; i++) {
          if (typeof eval("data.column_" + i) != "undefined") {
            columns.push(eval("data.column_" + i));
          }
        }

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",

            columns: columns,

            type: "line",

            // groups: [
            //     data.groups
            // ],

            //onclick: function (d, element) { console.log("onclick", d, element); },
          },

          grid: {
            y: {
              lines: [{ value: 0 }], // add the value you want
            },
          },

          color: {
            pattern: [
              "#a8cd53",
              "#ed4d90",
              "#41b87b",
              "#0087a1",
              "#27b8a7",
              "#f47060",
              "#f9ad4e",
              "#f15651",
              "#f8bb99",
              "#9da0a0",
              "#91709e",
              "#6d5575",
              "#0000ff",
              "#00ffff",
              "#ff00ff",
              "#333333",
            ],
          },

          point: {
            r: 3,
          },

          axis: {
            y: {
              padding: {
                bottom: 0,
              },
              tick: {
                format: function (d) {
                  return toComma(d);
                },
              },
            },
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 1000) / 1000;

                txt = round(value) + " MtCO₂e";

                return txt;
              },
            },
          },
        });
      }
    );
  }

  if (f == "indicador") {
    //'.2f';

    var format = "";

    if (
      indicador_id == 3 ||
      indicador_id == 4 ||
      indicador_id == 6 ||
      indicador_id == 8
    )
      format = ".2f";

    var params = {
      f: f,
      indicador_id: indicador_id,
    };

    $.getJSON("informe/indicador/" + params.indicador_id, {}, function (data) {
      $("#box_chart_title").show();
      $("#chart_title").html(data.indicador.nombre);
      $("#chart_unidad").html(data.unidad);
      $("#unidad_de_medida").show();
      $("#chart_descripcion").show().html(data.descripcion);
      console.log(data.column_1);
      char_height = char_height - $("#chart_descripcion").outerHeight() - 34;

      chart = c3.generate({
        size: {
          height: char_height,
        },

        data: {
          x: "x",

          columns: [data.column_1, data.column_2],

          type: "line",
        },

        color: {
          pattern: [data.colores],
        },

        point: {
          r: 3,
        },

        axis: {
          y: {
            padding: { bottom: 0 },
            min: 0,

            tick: {
              format: function (d) {
                if (
                  indicador_id == 3 ||
                  indicador_id == 4 ||
                  indicador_id == 6 ||
                  indicador_id == 7 ||
                  indicador_id == 8
                ) {
                  // Emisiones por unidad de energía

                  return toComma(round(d));
                } else {
                  return toComma(d);
                }
              },
            },
          },

          x: {
            padding: { right: 1, left: 1 },
            tick: {
              values: function (d) {
                if (indicador_id == 5) {
                  return [2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018];
                } else {
                  return [
                    1990, 1992, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008,
                    2010, 2012, 2014, 2016, 2018,
                  ];
                }
              },
            },
          },
        },

        tooltip: {
          format: {
            // title: function (d) { return 'Data ' + d; },
            value: function (value, ratio, id) {
              value = Math.round(value * 1000) / 1000;

              if (indicador_id == 2 || indicador_id == 5) {
                txt = value;
              } else if (indicador_id == 8) {
                txt = round(value, 3);
              } else {
                txt = round(value);
              }

              return txt;
            },
          },
        },
      });
    });
  }

  if (f == "monitoreo") {
    monitoreo_file = "files/" + f + "_" + monitoreo_id + ".json";

    d3.json(monitoreo_file, function (error, data) {
      $("#chart_title").show();
      $(".info .ley").hide();
      $(".content.monitoreo").hide();
      if (
        data.titulo ==
          "PROPORCIÓN DE KILÓMETROS RECORRIDOS POR TRENES ELÉCTRICOS" ||
        data.titulo == "AVANCE DE LA OBRA" ||
        data.titulo == "PARTICIPACIÓN DE LA GENERACIÓN DE ELECTRICIDAD" ||
        data.titulo == "CORTE DE BIODIÉSEL EN GASOIL" ||
        data.titulo == "CORTE DE BIOETANOL EN NAFTA"
      ) {
        var titulo = data.titulo + " (" + data.unidad + ")";
        $("#chart_title").html(titulo);
      } else {
        $("#chart_title").html(data.titulo);
      }

      //$("#chart_title").html(data.titulo );
      $("#chart_descripcion").show().html(data.descripcion);
      $("#body > .content.nomonitoreo").show();

      $("#chart2").remove();
      $("#chart3").remove();
      $("#chart4").remove();
      $("#chart5").remove();
      $("#chart6").remove();

      $(".fecha").remove();
      $("#chart").css("width", "100%");
      $("#chart").css("margin", "0");
      $("#chart").css("display", "block");
      $("#chart").css("padding", "0");
      $("#body .content").css("text-align", "left");
      $("#chart_custom_legend").hide();
      $("#text_box_treemap").hide();
      $(".container_canvas_organismo").hide();

      if (
        monitoreo_id == 1 ||
        monitoreo_id == 2 ||
        monitoreo_id == 3 ||
        monitoreo_id == 4 ||
        monitoreo_id == 9 ||
        monitoreo_id == 11 ||
        monitoreo_id == 12 ||
        monitoreo_id == 13 ||
        monitoreo_id == 14 ||
        monitoreo_id == 15 ||
        monitoreo_id == 16 ||
        monitoreo_id == 17 ||
        monitoreo_id == 18 ||
        monitoreo_id == 19 ||
        monitoreo_id == 20 ||
        monitoreo_id == 22 ||
        monitoreo_id == 24 ||
        monitoreo_id == 41 // TODO:prueba
      ) {
        $(".ley").css("display", "block");
        $("#chart_unidad").html(data.unidad);
        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    // TODO: Cuando es 0 no lo muestra en el gráfico retornando un string vacio. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return numberWithCommas(
                      toComma(correctDecimals(d, data.cantDecimales))
                    );
                  } else {
                    return numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#EE4788"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value);
                // console.log("monitoreo id 1 = " + txt);
                //TODO: Probar funcionamiento
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },

            contents: function (
              d,
              defaultTitleFormat,
              defaultValueFormat,
              color
            ) {
              var $$ = this,
                config = $$.config,
                titleFormat = config.tooltip_format_title || defaultTitleFormat,
                nameFormat =
                  config.tooltip_format_name ||
                  function (name) {
                    return name;
                  },
                valueFormat = config.tooltip_format_value || defaultValueFormat,
                text,
                i,
                title,
                value,
                name,
                bgcolor;
              for (i = 0; i < d.length; i++) {
                if (!(d[i] && (d[i].value || d[i].value === 0))) {
                  continue;
                }

                if (!text) {
                  title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                  text =
                    "<table class='" +
                    $$.CLASS.tooltip +
                    "'>" +
                    (title || title === 0
                      ? "<tr><th colspan='2'>" + title + "</th></tr>"
                      : "");
                }

                name = nameFormat(d[i].name);
                value = valueFormat(
                  d[i].value,
                  d[i].ratio,
                  d[i].id,
                  d[i].index
                );
                bgcolor = $$.levelColor
                  ? $$.levelColor(d[i].value)
                  : color(d[i].id);

                text +=
                  "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                text +=
                  "<td class='name'><span style='background-color:" +
                  bgcolor +
                  "'></span>" +
                  name +
                  "</td>";
                text += "<td class='value'>" + value + "</td>";
                text += "</tr>";
              }
              return text + "</table>";
            },
          },
        });

        if (
          monitoreo_id == 1 ||
          monitoreo_id == 2 ||
          monitoreo_id == 3 ||
          monitoreo_id == 4 ||
          monitoreo_id == 9 ||
          monitoreo_id == 11 ||
          monitoreo_id == 12 ||
          monitoreo_id == 13 ||
          monitoreo_id == 14 ||
          monitoreo_id == 15 ||
          monitoreo_id == 16 ||
          monitoreo_id == 17 ||
          monitoreo_id == 18 ||
          monitoreo_id == 19 ||
          monitoreo_id == 20 ||
          monitoreo_id == 21 ||
          monitoreo_id == 22 ||
          monitoreo_id == 23 ||
          monitoreo_id == 24 ||
          monitoreo_id == 29
        ) {
          $(".c3-axis.c3-axis-y .tick tspan").first().html("");
        }
      }
      if (monitoreo_id == 9 || monitoreo_id == 29) {
        $(".ley").css("display", "block");
        $("#chart_unidad").html(data.unidad);
        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return numberWithCommas(
                      toComma(correctDecimals(d, data.cantDecimales))
                    );
                  } else {
                    return numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#EE4788"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
      }
      if (monitoreo_id == 21 || monitoreo_id == 23) {
        $(".ley").css("display", "block"); // Muestra unidad de medida título
        $("#chart_title").html(data.titulo); //TODO:Muestra el titulo desde el JSON. Probar funcionamiento
        $("#chart_unidad").html(data.unidad);
        $("#unidad_de_medida").show();
        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en el gráfico. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return d; //numberWithCommas(toComma(correctDecimals(d,data.cantDecimales)));
                  } else {
                    return d; //numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#EE4788"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value);

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
      }

      if (monitoreo_id == 35) {
        $(".ley").css("display", "none");

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (data.cantDecimales >= 1) {
                    return d;
                  } else {
                    return numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#4f81bd"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = value;

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
      }
      if (monitoreo_id == 38) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return d;
                  } else {
                    return numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#D177B0"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = value;

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
      }
      /*  if (monitoreo_id == 36) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (data.cantDecimales >= 1) {
                    return d + " " + data.unidad;
                  } else {
                    return numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#8aa335"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = value;

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
      } */
      if (monitoreo_id == 18 || monitoreo_id == 14) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: No muestra el 0 en los gráficos. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return d;
                  } else {
                    return numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#EE4788"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value);
                // return numberWithCommas(toComma(txt));
                //TODO: Probar funcionamiento
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },
        });
      }

      if (monitoreo_id == 5 || monitoreo_id == 7) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [
              data.valores1,
              data.valores2,
              data.valores3,
              data.valores4,
              data.valores5,
              data.anio,
            ],
            type: "bar",
            groups: [["Biogás", "Biomasa", "PAH", "Solar", "Eólica"]],
            order: null,
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: No mostrar 0 en el gráfico. Probar funcionamiento
                    return "";
                  }
                  return numberWithCommas(toComma(correctDecimals(d)));
                },
              },
            },
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0", "#FCE4ED"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // TODO: Probar funcionamiento
                // value = Math.round(value * 100) / 100;
                return value.toLocaleString("es-AR", {
                  maximumFractionDigits: 0,
                });
              },
            },
          },
        });
      }
      //nuevo para monitoreo 36 superficie bajo planes//
      if (monitoreo_id == 36) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores1, data.valores2, data.valores3, data.anio],
            type: "bar",
            groups: [
              [
                "Planes de manejo",
                "Planes de conservación",
                "Planes de manejo y conservación",
              ],
            ],
            order: null,
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                    return "";
                  }
                  return numberWithCommas(toComma(correctDecimals(d)));
                },
              },
            },
          },

          color: {
            pattern: ["#BFD730", "#585961", "#DFEB97"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                return numberWithCommas(toComma(value.toFixed()));
              },
            },
          },
        });
      }

      //  fin //

      //nuevo para monitoreo 37 deforestación evitada//
      if (monitoreo_id == 37) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },
          data: {
            x: "x",
            columns: [
              data.valores1,
              data.valores2,
              data.valores3,
              data.valores4,
              data.anio,
            ],
            type: "bar",
            groups: [
              [
                "Parque Chaqueño",
                "Selva Tucumano-Boliviana",
                "Selva Paranaense",
                "Espinal",
              ],
            ],
            order: null,
          },
          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },
          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              min: data.min,
              padding: { bottom: 0 },
              //min: 0,
              tick: {
                format: function (d) {
                  // if (d === 0) {
                  //   TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                  // return }
                  return numberWithCommas(toComma(correctDecimals(d)));
                },
              },
            },
          },
          grid: {
            y: {
              lines: [{ value: 0, class: "line_deforestacion" }],
            },
          },
          color: {
            pattern: ["#BFD730", "#585961", "#DFEB97", "#B3B0B0", "#F2F7D6"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                return numberWithCommas(toComma(value.toFixed()));
              },
            },
          },
        });
      }

      //  fin //

      if (monitoreo_id == 25 || monitoreo_id == 27) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [
              data.valores1,
              data.valores2,
              data.valores3,
              data.valores4,
              data.anio,
            ],
            type: "bar",
            groups: [
              [
                "Hidroeléctrica",
                "Nuclear",
                "Renovable no convencional",
                "Distribuida",
              ],
            ],
            // order: null,
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos. Probar funcionamiento
                    return "";
                  }
                  return numberWithCommas(toComma(correctDecimals(d)));
                },
              },
            },
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value);
                // return numberWithCommas(toComma(txt));
                //TODO: Probar funcionamiento
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },
        });
      }

      if (monitoreo_id == 34) {
        $(".ley").css("display", "none");

        // $("#chart_unidad").html(data.unidad);

        // $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return d; //numberWithCommas(toComma(correctDecimals(d,data.cantDecimales)));
                  } else {
                    return d; //numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#D177B0"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                //txt = round(value);
                return value; //numberWithCommas(toComma(txt));
              },
            },
          },
        });
      }
      if (monitoreo_id == 32) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return d; //numberWithCommas(toComma(correctDecimals(d,2)));
                  } else {
                    return d; //numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#D177B0"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
      }
      if (monitoreo_id == 33) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return d; //numberWithCommas(toComma(correctDecimals(d,2)));
                  } else {
                    return d; //numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },

          color: {
            pattern: ["#D177B0"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value);
                // return numberWithCommas(toComma(txt));
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },
        });
      }
      if (monitoreo_id == 39 || monitoreo_id == 40) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [data.valores, data.anio],
            type: "bar",
          },

          bar: {
            width: {
              ratio: 0.3, // this makes bar width 50% of length between ticks
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                    return "";
                  }
                  return numberWithCommas(toComma(correctDecimals(d)));
                },
              },
            },
          },

          color: {
            pattern: ["#D177B0"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                return numberWithCommas(toComma(value));
              },
            },
          },
        });
      }
      if (monitoreo_id == 31) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        chart = c3.generate({
          size: {
            height: char_height,
          },

          data: {
            x: "x",
            columns: [
              data.valores1,
              data.valores2,
              data.valores3,
              data.valores4,
              data.valores5,
              data.valores6,
              data.valores7,
              data.valores8,
              data.anio,
            ],
            type: "bar",
            order: null,
          },

          bar: {
            width: {
              ratio: 0.5,
            },
          },

          axis: {
            x: {
              type: "category", // this needed to load string x value
            },
            y: {
              max: data.max,
              padding: { bottom: 0 },
              min: 0,
              tick: {
                format: function (d) {
                  if (d === 0) {
                    //TODO: Oculta el 0 en los gráficos de barra. Probar funcionamiento
                    return "";
                  }
                  if (data.cantDecimales >= 1) {
                    return numberWithCommas(toComma(correctDecimals(d, 2)));
                  } else {
                    return numberWithCommas(toComma(d));
                  }
                },
              },
            },
          },
          //Falta definir colores.
          color: {
            pattern: [
              "#D177B0",
              "#585961",
              "#E8BBD7",
              "#B3B0B0",
              "#F8EBF3",
              "#EDEDEE",
              "#787FBD",
              "#BBBFDE",
            ],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                return numberWithCommas(toComma(value));
              },
            },
          },
        });
      }

      //// grafico anillo bosque - pasa a ser de barra en rama grafico2
      /* if (monitoreo_id == 37) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        c3.chart.internal.fn.additionalConfig = {
          labelArc: {
            // used to add a second arc outside of the pie arc for the label
            innerRadiusRatio: 0.7,
            outerRadiusRatio: 0.7,
          },
          pieExt: {
            radiusRatio: 0.85, // this is the ratio of the svg area the pie will take up
          },
        };

        /* Calculates a hash for a label coordinates to avaid collisions */
      /*
        c3.chart.internal.fn.createHashKey = function (coordinates) {
          return (
            Math.floor(coordinates[0] / 140) * 140 +
            "," +
            Math.floor(coordinates[1] / 24) * 24
          );
        };

        /*
                    Holds hashed value of the label coordinates to try and handle collisions.
                */
      //      c3.chart.internal.fn.labelHash = [];

      /*
                    Adding getLabelSvgArc function to implement a second arc for the lables outside of the pie
                */
      /*    c3.chart.internal.fn.getLabelSvgArc = function () {
          var $$ = this,
            config = $$.api.internal.config;
          var labelarc = $$.d3.svg
            .arc()
            .outerRadius($$.radius * config.labelArc.outerRadiusRatio)
            .innerRadius($$.radius * config.labelArc.innerRadiusRatio);

          var newArc = function (d, withoutUpdate) {
            var updated;
            if (withoutUpdate) {
              return labelarc(d);
            } // for interpolate
            updated = c3.chart.internal.fn.updateAngle(d);
            return updated ? labelarc(updated) : "M 0 0";
          };
          newArc.centroid = labelarc.centroid;
          return newArc;
        };

        c3.chart.internal.fn.updateRadius = function () {
          var $$ = this,
            config = $$.config,
            w = config.gauge_width || config.donut_width;
          $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
          $$.radius = $$.radiusExpanded * config.pieExt.radiusRatio;
          $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
          $$.innerRadius =
            $$.hasType("donut") || $$.hasType("gauge")
              ? $$.radius * $$.innerRadiusRatio
              : 0;
        };

        c3.chart.internal.fn.updateArc = function () {
          var $$ = this;
          $$.svgArc = $$.getSvgArc();
          $$.labelSvgArc = $$.getLabelSvgArc();
          $$.svgArcExpanded = $$.getSvgArcExpanded();
          $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);

          // Draw line from label to midpoint of arc
        };
        if (!$("#chart2").length) {
          $("#body .content").css("text-align", "center");
          $("#chart_descripcion").css("text-align", "left");
          $("#chart_custom_legend").show();
          $("#text_box_treemap").hide();
          $(".container_canvas_organismo").hide();
        }

        chart = c3.generate({
          title: {
            show: false,
            text: "Acumulado 2010-2017",
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_1_1,
              data.donut_1_2,
              data.donut_1_3,
              data.donut_1_4,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [
              ["Parque Chaqueño", "Selva Paranaense", "Yungas", "Espinal"],
            ],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.0019,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.1%");

                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_1_1[1] +
                    data.donut_1_2[1] +
                    data.donut_1_3[1] +
                    data.donut_1_4[1]
                  ).toFixed(2)
                )
              ) +
              " " +
              data.unidad,
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#8aa335", "#364015", "#0b6963", "#bbb18d"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value);

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });

        if (!$("#chart_custom_legend .legend").length) {
          d3.select("#chart_custom_legend")
            .insert("div", ":first-child")
            .attr("class", "legend col-md-2")
            .insert("ul")
            .attr("class", "list-group")
            .selectAll("span")
            .data(["Parque Chaqueño", "Selva Paranaense", "Yungas", "Espinal"])
            .enter()
            .append("li")
            .attr("class", "list-group-item")
            .append("div")
            .attr("class", "legend-label")
            .attr("data-id", function (id) {
              return id;
            })
            .append("div", ".legend-label")
            .html(function (id) {
              var data = chart.data(id);
              return id + "&nbsp&nbsp&nbsp";
            })
            .on("mouseover", function (id) {
              chart.focus(id);
            })
            .on("mouseout", function (id) {
              chart.revert();
            })
            .insert("span", ".legend-label")
            .attr("class", "badge")
            .each(function (id) {
              d3.select(this).style("background-color", chart.color(id));
            })
            .html(function (id) {
              return "&nbsp&nbsp&nbsp&nbsp&nbsp";
            });

          $("#chart_custom_legend .badge").each(function () {
            $(this).insertBefore($(this).parent());
          });

          $("#chart_custom_legend .list-group-item").hover(
            function () {
              $(this)
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            function () {
              $(this)
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .removeClass("c3-target");
            }
          );
        }
      }   */
      //// fin grafico anillo bosque
      // Gráfico Anillo No Fósiles - Generación Eléctrica / Capacidad Instalada (2015 -2020)
      if (monitoreo_id == 26 || monitoreo_id == 28) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#unidad_de_medida").show();

        c3.chart.internal.fn.additionalConfig = {
          labelArc: {
            // used to add a second arc outside of the pie arc for the label
            innerRadiusRatio: 0.7,
            outerRadiusRatio: 0.7,
          },
          pieExt: {
            radiusRatio: 0.85, // this is the ratio of the svg area the pie will take up
          },
        };

        /* Calculates a hash for a label coordinates to avaid collisions */

        c3.chart.internal.fn.createHashKey = function (coordinates) {
          return (
            Math.floor(coordinates[0] / 140) * 140 +
            "," +
            Math.floor(coordinates[1] / 24) * 24
          );
        };

        /*
                    Holds hashed value of the label coordinates to try and handle collisions.
                  */
        c3.chart.internal.fn.labelHash = [];

        /*
                    Adding getLabelSvgArc function to implement a second arc for the lables outside of the pie
                  */
        c3.chart.internal.fn.getLabelSvgArc = function () {
          var $$ = this,
            config = $$.api.internal.config;
          var labelarc = $$.d3.svg
            .arc()
            .outerRadius($$.radius * config.labelArc.outerRadiusRatio)
            .innerRadius($$.radius * config.labelArc.innerRadiusRatio);

          var newArc = function (d, withoutUpdate) {
            var updated;
            if (withoutUpdate) {
              return labelarc(d);
            } // for interpolate
            updated = c3.chart.internal.fn.updateAngle(d);
            return updated ? labelarc(updated) : "M 0 0";
          };
          newArc.centroid = labelarc.centroid;
          return newArc;
        };

        c3.chart.internal.fn.updateRadius = function () {
          var $$ = this,
            config = $$.config,
            w = config.gauge_width || config.donut_width;
          $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
          $$.radius = $$.radiusExpanded * config.pieExt.radiusRatio;
          $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
          $$.innerRadius =
            $$.hasType("donut") || $$.hasType("gauge")
              ? $$.radius * $$.innerRadiusRatio
              : 0;
        };

        c3.chart.internal.fn.updateArc = function () {
          var $$ = this;
          $$.svgArc = $$.getSvgArc();
          $$.labelSvgArc = $$.getLabelSvgArc();
          $$.svgArcExpanded = $$.getSvgArcExpanded();
          $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);

          // Draw line from label to midpoint of arc
        };
        if (!$("#chart2").length) {
          $("#chart").after('<div id="chart2"></div>');
          $("#chart2").after('<div id="chart3"></div>');
          $("#chart3").after('<div id="chart4"></div>');
          $("#chart4").after('<div id="chart5"></div>');
          $("#chart5").after('<div id="chart6"></div>');
          $("#chart").css("width", "40%");
          $("#chart").css("display", "inline-block");
          $("#body .content").css("text-align", "center");
          $("#chart_descripcion").css("text-align", "left");
          $("#chart_custom_legend").show();
          $("#text_box_treemap").hide();
          $(".container_canvas_organismo").hide();
        }
        // Año 2015
        chart = c3.generate({
          title: {
            show: false,
            text: data.anio[1],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_1_1,
              data.donut_1_2,
              data.donut_1_3,
              data.donut_1_4,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [
              [
                "Hidroeléctrica",
                "Nuclear",
                "Renovable no convencional",
                "Distribuida",
              ],
            ],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_1_1[1] +
                    data.donut_1_2[1] +
                    data.donut_1_3[1] +
                    data.donut_1_4[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value) + " " + data.unidad;
                // return numberWithCommas(toComma(txt));
                //TODO: Probar funcionamiento
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },
        });
        // Año 2016
        second_chart = c3.generate({
          bindto: "#chart2",
          title: {
            show: false,
            text: data.anio[2],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_2_1,
              data.donut_2_2,
              data.donut_2_3,
              data.donut_2_4,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [
              [
                "Hidroeléctrica",
                "Nuclear",
                "Renovable no convencional",
                "Distribuida",
              ],
            ],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_2_1[1] +
                    data.donut_2_2[1] +
                    data.donut_2_3[1] +
                    data.donut_2_4[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
            subtitle: "otro",
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value) + " " + data.unidad;
                // return numberWithCommas(toComma(txt));
                //TODO: Probar funcionamiento
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },
        });
        // Año 2017
        third_chart = c3.generate({
          bindto: "#chart3",
          title: {
            show: false,
            text: data.anio[3],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_3_1,
              data.donut_3_2,
              data.donut_3_3,
              data.donut_3_4,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [
              [
                "Hidroeléctrica",
                "Nuclear",
                "Renovable no convencional",
                "Distribuida",
              ],
            ],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_3_1[1] +
                    data.donut_3_2[1] +
                    data.donut_3_3[1] +
                    data.donut_3_4[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0"],
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value) + " " + data.unidad;
                // return numberWithCommas(toComma(txt));
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },

          onrendered: function () {
            d3.selectAll("#chart .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart2 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart3 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart4 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );
          },
        });
        // Año 2018
        fourth_chart = c3.generate({
          bindto: "#chart4",
          title: {
            show: false,
            text: data.anio[4],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_4_1,
              data.donut_4_2,
              data.donut_4_3,
              data.donut_4_4,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [
              [
                "Hidroeléctrica",
                "Nuclear",
                "Renovable no convencional",
                "Distribuida",
              ],
            ],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_4_1[1] +
                    data.donut_4_2[1] +
                    data.donut_4_3[1] +
                    data.donut_4_4[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0"],
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value) + " " + data.unidad;
                // return numberWithCommas(toComma(txt));
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },

          onrendered: function () {
            d3.selectAll("#chart .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart2 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart3 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart4 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );
          },
        });

        // Año 2019

        fifth_chart = c3.generate({
          bindto: "#chart5",
          title: {
            show: false,
            text: data.anio[5],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_5_1,
              data.donut_5_2,
              data.donut_5_3,
              data.donut_5_4,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [
              [
                "Hidroeléctrica",
                "Nuclear",
                "Renovable no convencional",
                "Distribuida",
              ],
            ],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_5_1[1] +
                    data.donut_5_2[1] +
                    data.donut_5_3[1] +
                    data.donut_5_4[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0"],
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value) + " " + data.unidad;
                // return numberWithCommas(toComma(txt));
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },
        });

        // Año 2020

        sixth_chart = c3.generate({
          bindto: "#chart6",
          title: {
            show: false,
            text: data.anio[6],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_6_1,
              data.donut_6_2,
              data.donut_6_3,
              data.donut_6_4,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [
              [
                "Hidroeléctrica",
                "Nuclear",
                "Renovable no convencional",
                "Distribuida",
              ],
            ],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_6_1[1] +
                    data.donut_6_2[1] +
                    data.donut_6_3[1] +
                    data.donut_6_4[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0"],
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // value = Math.round(value * 100) / 100;
                // txt = round(value) + " " + data.unidad;
                // return numberWithCommas(toComma(txt));
                if (value % 1 !== 0) {
                  return value.toLocaleString("es-AR", {
                    maximumFractionDigits: 0,
                  });
                }
                return value.toLocaleString("es-AR"); // devuelve numero sin decimales y con separación de miles
              },
            },
          },
        });

        if (!$("#chart_custom_legend .legend").length) {
          d3.select("#chart_custom_legend")
            .insert("div", ":first-child")
            .attr("class", "legend col-md-2")
            .insert("ul")
            .attr("class", "list-group")
            .selectAll("span")
            .data([
              "Hidroeléctrica",
              "Nuclear",
              "Renovable no convencional",
              "Distribuida",
            ])
            .enter()
            .append("li")
            .attr("class", "list-group-item")
            .append("div")
            .attr("class", "legend-label")
            .attr("data-id", function (id) {
              return id;
            })
            .append("div", ".legend-label")
            .html(function (id) {
              var data = chart.data(id);
              return id + "&nbsp&nbsp&nbsp";
            })
            .on("mouseover", function (id) {
              chart.focus(id);
              second_chart.focus(id);
              third_chart.focus(id);
              fourth_chart.focus(id);
              fifth_chart.focus(id);
              sixth_chart.focus(id);
            })
            .on("mouseout", function (id) {
              chart.revert();
              second_chart.revert();
              third_chart.revert();
              fourth_chart.revert();
              fifth_chart.revert();
              sixth_chart.revert();
            })
            .insert("span", ".legend-label")
            .attr("class", "badge")
            .each(function (id) {
              if (id === "Distribuida") {
                d3.select(this).style("background-color", "#B3B0B0");
              } else {
                d3.select(this).style("background-color", chart.color(id));
              }
            })
            .html(function (id) {
              return "&nbsp&nbsp&nbsp&nbsp&nbsp";
            });

          $("#chart_custom_legend .badge").each(function () {
            $(this).insertBefore($(this).parent());
          });

          $("#chart_custom_legend .list-group-item").hover(
            function () {
              $(this)
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            function () {
              $(this)
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .removeClass("c3-target");
            }
          );
        }
      }
      // =============================================
      // Monitoreo 6 y 8 - T15 - todas las fuentes
      if (monitoreo_id == 6 || monitoreo_id == 8) {
        $(".ley").css("display", "block");

        $("#chart_unidad").html(data.unidad);

        $("#chart_anio").html(data.ano);

        $("#unidad_de_medida").show();

        c3.chart.internal.fn.additionalConfig = {
          labelArc: {
            // used to add a second arc outside of the pie arc for the label
            innerRadiusRatio: 0.7,
            outerRadiusRatio: 0.7,
          },
          pieExt: {
            radiusRatio: 0.85, // this is the ratio of the svg area the pie will take up
          },
        };

        /* Calculates a hash for a label coordinates to avaid collisions */

        c3.chart.internal.fn.createHashKey = function (coordinates) {
          return (
            Math.floor(coordinates[0] / 140) * 140 +
            "," +
            Math.floor(coordinates[1] / 24) * 24
          );
        };

        /*
                    Holds hashed value of the label coordinates to try and handle collisions.
                  */
        c3.chart.internal.fn.labelHash = [];

        /*
                    Adding getLabelSvgArc function to implement a second arc for the lables outside of the pie
                  */
        c3.chart.internal.fn.getLabelSvgArc = function () {
          var $$ = this,
            config = $$.api.internal.config;
          var labelarc = $$.d3.svg
            .arc()
            .outerRadius($$.radius * config.labelArc.outerRadiusRatio)
            .innerRadius($$.radius * config.labelArc.innerRadiusRatio);

          var newArc = function (d, withoutUpdate) {
            var updated;
            if (withoutUpdate) {
              return labelarc(d);
            } // for interpolate
            updated = c3.chart.internal.fn.updateAngle(d);
            return updated ? labelarc(updated) : "M 0 0";
          };
          newArc.centroid = labelarc.centroid;
          return newArc;
        };

        c3.chart.internal.fn.updateRadius = function () {
          var $$ = this,
            config = $$.config,
            w = config.gauge_width || config.donut_width;
          $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
          $$.radius = $$.radiusExpanded * config.pieExt.radiusRatio;
          $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
          $$.innerRadius =
            $$.hasType("donut") || $$.hasType("gauge")
              ? $$.radius * $$.innerRadiusRatio
              : 0;
        };

        c3.chart.internal.fn.updateArc = function () {
          var $$ = this;
          $$.svgArc = $$.getSvgArc();
          $$.labelSvgArc = $$.getLabelSvgArc();
          $$.svgArcExpanded = $$.getSvgArcExpanded();
          $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);

          // Draw line from label to midpoint of arc
        };
        if (!$("#chart2").length) {
          $("#chart").after('<div id="chart2"></div>');
          $("#chart2").after('<div id="chart3"></div>');
          $("#chart3").after('<div id="chart4"></div>');
          $("#chart4").after('<div id="chart5"></div>'); // Gráfico nuevo 2019
          $("#chart5").after('<div id="chart6"></div>'); // Gráfico nuevo 2020
          $("#chart").css("width", "40%");
          $("#chart").css("display", "inline-block");
          $("#body .content").css("text-align", "center");
          $("#chart_descripcion").css("text-align", "left");
          $("#chart_custom_legend").show();
          $("#text_box_treemap").hide();
          $(".container_canvas_organismo").hide();
        }
        // Graficos anillo - Trancición Energética - todas las fuentes - Generación y Capacidad (2015-2020)
        // Año 2015
        chart = c3.generate({
          title: {
            show: false,
            text: data.anio[1],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_1_1,
              data.donut_1_2,
              data.donut_1_3,
              data.donut_1_4,
              data.donut_1_5,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [["Biogás", "Biomasa", "PAH", "Solar", "Eólica"]],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_1_1[1] +
                    data.donut_1_2[1] +
                    data.donut_1_3[1] +
                    data.donut_1_4[1] +
                    data.donut_1_5[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0", "#FCE4ED"],
          },
          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                //TODO: Revisar funcionamiento
                // value = Math.round(value * 100) / 100;
                if (value % 1 !== 0) {
                  // si tiene decimales , no los muestra y redondea
                  return (
                    value.toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    }) +
                    " " +
                    data.unidad
                  );
                }
                return value.toLocaleString("es-AR") + " " + data.unidad;
              },
            },
          },
        });
        // Año 2016
        second_chart = c3.generate({
          bindto: "#chart2",
          title: {
            show: false,
            text: data.anio[2],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_2_1,
              data.donut_2_2,
              data.donut_2_3,
              data.donut_2_4,
              data.donut_2_5,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [["Biogás", "Biomasa", "PAH", "Solar", "Eólica"]],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_2_1[1] +
                    data.donut_2_2[1] +
                    data.donut_2_3[1] +
                    data.donut_2_4[1] +
                    data.donut_2_5[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
            subtitle: "otro",
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0", "#FCE4ED"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // TODO: Revisar funcionamiento
                // value = Math.round(value * 100) / 100;
                if (value % 1 !== 0) {
                  // si tiene decimales , no los muestra y redondea
                  return (
                    value.toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    }) +
                    " " +
                    data.unidad
                  );
                }
                return value.toLocaleString("es-AR") + " " + data.unidad;
              },
            },
          },
        });
        // Año 2017
        third_chart = c3.generate({
          bindto: "#chart3",
          title: {
            show: false,
            text: data.anio[3],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_3_1,
              data.donut_3_2,
              data.donut_3_3,
              data.donut_3_4,
              data.donut_3_5,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [["Biogás", "Biomasa", "PAH", "Solar", "Eólica"]],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_3_1[1] +
                    data.donut_3_2[1] +
                    data.donut_3_3[1] +
                    data.donut_3_4[1] +
                    data.donut_3_5[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0", "#FCE4ED"],
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // TODO: Revisar funcionamiento
                // value = Math.round(value * 100) / 100;
                if (value % 1 !== 0) {
                  // si tiene decimales , no los muestra y redondea
                  return (
                    value.toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    }) +
                    " " +
                    data.unidad
                  );
                }
                return value.toLocaleString("es-AR") + " " + data.unidad;
              },
            },
          },

          onrendered: function () {
            d3.selectAll("#chart .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart2 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart3 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart4 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );
          },
        });
        // Año 2018
        fourth_chart = c3.generate({
          bindto: "#chart4",
          title: {
            show: false,
            text: data.anio[4],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_4_1,
              data.donut_4_2,
              data.donut_4_3,
              data.donut_4_4,
              data.donut_4_5,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [["Biogás", "Biomasa", "PAH", "Solar", "Eólica"]],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_4_1[1] +
                    data.donut_4_2[1] +
                    data.donut_4_3[1] +
                    data.donut_4_4[1] +
                    data.donut_4_5[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0", "#FCE4ED"],
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // TODO: Revisar funcionamiento
                if (value % 1 !== 0) {
                  // si tiene decimales , no los muestra y redondea
                  return (
                    value.toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    }) +
                    " " +
                    data.unidad
                  );
                }
                return value.toLocaleString("es-AR") + " " + data.unidad;
              },
            },
          },

          onrendered: function () {
            d3.selectAll("#chart .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart2 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart3 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart4 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );
          },
        });
        // Año 2019
        fifth_chart = c3.generate({
          bindto: "#chart5",
          title: {
            show: false,
            text: data.anio[5],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_5_1,
              data.donut_5_2,
              data.donut_5_3,
              data.donut_5_4,
              data.donut_5_5,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [["Biogás", "Biomasa", "PAH", "Solar", "Eólica"]],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_5_1[1] +
                    data.donut_5_2[1] +
                    data.donut_5_3[1] +
                    data.donut_5_4[1] +
                    data.donut_5_5[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0", "#FCE4ED"],
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // TODO: Revisar funcionamiento
                if (value % 1 !== 0) {
                  // si tiene decimales , no los muestra y redondea
                  return (
                    value.toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    }) +
                    " " +
                    data.unidad
                  );
                }
                return value.toLocaleString("es-AR") + " " + data.unidad;
              },
            },
          },

          onrendered: function () {
            d3.selectAll("#chart .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart2 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart3 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart4 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );
          },
        });
        // Año 2020
        sixth_chart = c3.generate({
          bindto: "#chart6",
          title: {
            show: false,
            text: data.anio[6],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
          size: {
            height: 500,
          },

          data: {
            columns: [
              data.donut_6_1,
              data.donut_6_2,
              data.donut_6_3,
              data.donut_6_4,
              data.donut_6_5,
            ],
            type: "donut",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            groups: [["Biogás", "Biomasa", "PAH", "Solar", "Eólica"]],
            order: null,
          },

          donut: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                var percentFormat = d3.format(",.2%");
                return toComma(percentFormat(ratio));
              },
            },
            title:
              numberWithCommas(
                toComma(
                  (
                    data.donut_6_1[1] +
                    data.donut_6_2[1] +
                    data.donut_6_3[1] +
                    data.donut_6_4[1] +
                    data.donut_6_5[1]
                  ).toFixed(0)
                )
              ) +
              " " +
              data.unidad,
          },

          color: {
            pattern: ["#EE4788", "#585961", "#F6A3C3", "#B3B0B0", "#FCE4ED"],
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                // TODO: Revisar funcionamiento
                if (value % 1 !== 0) {
                  // si tiene decimales , no los muestra y redondea
                  return (
                    value.toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    }) +
                    " " +
                    data.unidad
                  );
                }
                return value.toLocaleString("es-AR") + " " + data.unidad;
              },
            },
          },

          onrendered: function () {
            d3.selectAll("#chart .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart2 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart3 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );

            d3.selectAll("#chart4 .c3-chart-arc.c3-target-Solar text").each(
              function (v) {
                var label = d3.select(this);
                var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
                x = pos[0] + 7;
                y = pos[1] - 7;
                pos = [x, y];
                label.attr(
                  "transform",
                  "translate(" + pos[0] + "," + pos[1] + ")"
                );
              }
            );
          },
        });

        // fin seccion de gráficos de anillo por filas

        if (!$("#chart_custom_legend .legend").length) {
          d3.select("#chart_custom_legend")
            .insert("div", ":first-child")
            .attr("class", "legend col-md-2")
            .insert("ul")
            .attr("class", "list-group")
            .selectAll("span")
            .data(["Biogás", "Biomasa", "PAH", "Solar", "Eólica"])
            .enter()
            .append("li")
            .attr("class", "list-group-item")
            .append("div")
            .attr("class", "legend-label")
            .attr("data-id", function (id) {
              return id;
            })
            .append("div", ".legend-label")
            .html(function (id) {
              var data = chart.data(id);
              return id + "&nbsp&nbsp&nbsp";
            })
            .on("mouseover", function (id) {
              chart.focus(id);
              second_chart.focus(id);
              third_chart.focus(id);
              fourth_chart.focus(id);
              fifth_chart.focus(id);
              sixth_chart.focus(id);
            })
            .on("mouseout", function (id) {
              chart.revert();
              second_chart.revert();
              third_chart.revert();
              fourth_chart.revert();
              fifth_chart.revert();
              sixth_chart.revert();
            })
            .insert("span", ".legend-label")
            .attr("class", "badge")
            .each(function (id) {
              d3.select(this).style("background-color", chart.color(id));
            })
            .html(function (id) {
              return "&nbsp&nbsp&nbsp&nbsp&nbsp";
            });

          $("#chart_custom_legend .badge").each(function () {
            $(this).insertBefore($(this).parent());
          });

          $("#chart_custom_legend .list-group-item").hover(
            function () {
              $(this)
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            function () {
              $(this)
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .removeClass("c3-target");
            }
          );
        }
      }

      if (monitoreo_id == 10) {
        $(".ley").css("display", "block"); //TODO:Probar funcionamiento. Son los que muestran en el gráfico la unidad de medida en el título
        $("#chart_unidad").html(data.unidad);
        $("#unidad_de_medida").show();

        c3.chart.internal.fn.additionalConfig = {
          labelArc: {
            // used to add a second arc outside of the pie arc for the label
            innerRadiusRatio: 0.7,
            outerRadiusRatio: 0.7,
          },
          pieExt: {
            radiusRatio: 0.85, // this is the ratio of the svg area the pie will take up
          },
        };

        /* Calculates a hash for a label coordinates to avaid collisions */

        c3.chart.internal.fn.createHashKey = function (coordinates) {
          return (
            Math.floor(coordinates[0] / 140) * 140 +
            "," +
            Math.floor(coordinates[1] / 24) * 24
          );
        };

        /*
                    Holds hashed value of the label coordinates to try and handle collisions.
                  */
        c3.chart.internal.fn.labelHash = [];

        /*
                    Adding getLabelSvgArc function to implement a second arc for the lables outside of the pie
                  */
        c3.chart.internal.fn.getLabelSvgArc = function () {
          var $$ = this,
            config = $$.api.internal.config;
          var labelarc = $$.d3.svg
            .arc()
            .outerRadius($$.radius * config.labelArc.outerRadiusRatio)
            .innerRadius($$.radius * config.labelArc.innerRadiusRatio);

          var newArc = function (d, withoutUpdate) {
            var updated;
            if (withoutUpdate) {
              return labelarc(d);
            } // for interpolate
            updated = c3.chart.internal.fn.updateAngle(d);
            return updated ? labelarc(updated) : "M 0 0";
          };
          newArc.centroid = labelarc.centroid;
          return newArc;
        };

        c3.chart.internal.fn.updateRadius = function () {
          var $$ = this,
            config = $$.config,
            w = config.gauge_width || config.donut_width;
          $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
          $$.radius = $$.radiusExpanded * config.pieExt.radiusRatio;
          $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
          $$.innerRadius =
            $$.hasType("donut") || $$.hasType("gauge")
              ? $$.radius * $$.innerRadiusRatio
              : 0;
        };

        c3.chart.internal.fn.updateArc = function () {
          var $$ = this;
          $$.svgArc = $$.getSvgArc();
          $$.labelSvgArc = $$.getLabelSvgArc();
          $$.svgArcExpanded = $$.getSvgArcExpanded();
          $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);

          // Draw line from label to midpoint of arc
        };
        // Gráficos anillo - T15 - todas las fuentes -Participación de la generación energética (2015-2020)
        if (!$("#chart2").length) {
          $("#chart").after('<div id="chart2"></div>'); // año 2016
          $("#chart2").after('<div id="chart3"></div>'); // año 2017
          $("#chart3").after('<div id="chart4"></div>'); // año 2018
          $("#chart4").after('<div id="chart5"></div>'); // año 2019
          $("#chart5").after('<div id="chart6"></div>'); // año 2020
          $("#chart").css("width", "40%");
          $("#chart").css("display", "inline-block");
          $("#body .content").css("text-align", "center");
          $("#chart_descripcion").css("text-align", "left");
          $("#chart_custom_legend").show();
          $("#text_box_treemap").hide();
          $(".container_canvas_organismo").hide();
        }
        // Año 2015
        chart = c3.generate({
          title: {
            show: false,
            text: data.anio[1],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },

          data: {
            columns: [data.valores1, data.resto1],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          pie: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#585961", "#EE4788"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;
                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
        // Año 2016
        second_chart = c3.generate({
          bindto: "#chart2",
          title: {
            show: false,
            text: data.anio[2],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },

          data: {
            columns: [data.valores2, data.resto2],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          pie: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#585961", "#EE4788"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;
                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
        // Año 2017
        third_chart = c3.generate({
          bindto: "#chart3",
          title: {
            show: false,
            text: data.anio[3],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },
          data: {
            columns: [data.valores3, data.resto3],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          color: {
            pattern: ["#585961", "#EE4788"],
          },

          pie: {
            label: {
              show: true,
              threshold: 0.0001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },

          onrendered: function () {
            d3.selectAll(
              ".c3-chart-arc.c3-target-Participación-de-la-generación-renovable-no-convencional text"
            ).each(function (v) {
              var label = d3.select(this);
              var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
              pos = [12, -160];
              // pos[0] is x, pos[1] is y. Do some position changes and update value
              label.attr(
                "transform",
                "translate(" + pos[0] + "," + pos[1] + ") rotate(3)"
              );
              label.style({ fill: "black", "font-size": "13px" });
            });

            d3.selectAll(
              ".c3-chart-arc.c3-target-Resto-de-generación-de-electricidad text"
            ).each(function (v) {
              var label = d3.select(this);
              label.remove();
            });

            d3.selectAll(".c3-chart-arc").attr("transform", "rotate(-3)");
          },
        });
        // Año 2018
        fourth_chart = c3.generate({
          bindto: "#chart4",
          title: {
            show: false,
            text: data.anio[4],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },
          data: {
            columns: [data.valores4, data.resto4],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          color: {
            pattern: ["#585961", "#EE4788"],
          },

          pie: {
            label: {
              show: true,
              threshold: 0.0001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },

          onrendered: function () {
            d3.selectAll(
              ".c3-chart-arc.c3-target-Participación-de-la-generación-renovable-no-convencional text"
            ).each(function (v) {
              var label = d3.select(this);
              var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
              pos = [12, -160];
              // pos[0] is x, pos[1] is y. Do some position changes and update value
              label.attr(
                "transform",
                "translate(" + pos[0] + "," + pos[1] + ") rotate(3)"
              );
              label.style({ fill: "black", "font-size": "13px" });
            });

            d3.selectAll(
              ".c3-chart-arc.c3-target-Resto-de-generación-de-electricidad text"
            ).each(function (v) {
              var label = d3.select(this);
              label.remove();
            });

            d3.selectAll(".c3-chart-arc").attr("transform", "rotate(-3)");
          },
        });

        // Año 2019
        fifth_chart = c3.generate({
          bindto: "#chart5",
          title: {
            show: false,
            text: data.anio[5],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },
          data: {
            columns: [data.valores5, data.resto5],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          color: {
            pattern: ["#585961", "#EE4788"],
          },

          pie: {
            label: {
              show: true,
              threshold: 0.0001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },

          onrendered: function () {
            d3.selectAll(
              ".c3-chart-arc.c3-target-Participación-de-la-generación-renovable-no-convencional text"
            ).each(function (v) {
              var label = d3.select(this);
              var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
              pos = [12, -160];
              // pos[0] is x, pos[1] is y. Do some position changes and update value
              label.attr(
                "transform",
                "translate(" + pos[0] + "," + pos[1] + ") rotate(3)"
              );
              label.style({ fill: "black", "font-size": "13px" });
            });

            d3.selectAll(
              ".c3-chart-arc.c3-target-Resto-de-generación-de-electricidad text"
            ).each(function (v) {
              var label = d3.select(this);
              label.remove();
            });

            d3.selectAll(".c3-chart-arc").attr("transform", "rotate(-3)");
          },
        });

        // Año 2020
        sixth_chart = c3.generate({
          bindto: "#chart6",
          title: {
            show: false,
            text: data.anio[6],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },
          data: {
            columns: [data.valores6, data.resto6],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          color: {
            pattern: ["#585961", "#EE4788"],
          },

          pie: {
            label: {
              show: true,
              threshold: 0.0001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },

          onrendered: function () {
            d3.selectAll(
              ".c3-chart-arc.c3-target-Participación-de-la-generación-renovable-no-convencional text"
            ).each(function (v) {
              var label = d3.select(this);
              var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
              pos = [12, -160];
              // pos[0] is x, pos[1] is y. Do some position changes and update value
              label.attr(
                "transform",
                "translate(" + pos[0] + "," + pos[1] + ") rotate(3)"
              );
              label.style({ fill: "black", "font-size": "13px" });
            });

            d3.selectAll(
              ".c3-chart-arc.c3-target-Resto-de-generación-de-electricidad text"
            ).each(function (v) {
              var label = d3.select(this);
              label.remove();
            });

            d3.selectAll(".c3-chart-arc").attr("transform", "rotate(-3)");
          },
        });

        if (!$("#chart_custom_legend .legend").length) {
          d3.select("#chart_custom_legend")
            .insert("div", ":first-child")
            .attr("class", "legend col-md-2")
            .insert("ul")
            .attr("class", "list-group")
            .selectAll("span")
            .data(["Participación de la generación de electricidad"])
            .enter()
            .append("li")
            .attr("class", "list-group-item")
            .append("div")
            .attr("class", "legend-label")
            .attr("data-id", function (id) {
              return id;
            })
            .append("div", ".legend-label")
            .html(function (id) {
              var data = chart.data(id);
              return id + "&nbsp&nbsp&nbsp";
            })
            .on("mouseover", function (id) {
              chart.focus(id);
              second_chart.focus(id);
              third_chart.focus(id);
              fourth_chart.focus(id);
              fifth_chart.focus(id);
              sixth_chart.focus(id);
            })
            .on("mouseout", function (id) {
              chart.revert();
              second_chart.revert();
              third_chart.revert();
              fourth_chart.revert();
              fifth_chart.revert();
              sixth_chart.revert();
            })
            .insert("span", ".legend-label")
            .attr("class", "badge")
            .each(function (id) {
              d3.select(this).style("background-color", chart.color(id));
            })
            .html(function (id) {
              return "&nbsp&nbsp&nbsp&nbsp&nbsp";
            });

          $("#chart_custom_legend .badge").each(function () {
            $(this).insertBefore($(this).parent());
          });

          $("#chart_custom_legend .list-group-item").hover(
            function () {
              $(this)
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            function () {
              $(this)
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .removeClass("c3-target");
            }
          );
        }
      }
      if (monitoreo_id == 30) {
        $(".ley").css("display", "block");
        $("#chart_title").html(data.titulo);
        $("#chart_unidad").html(data.unidad);
        $("#unidad_de_medida").show();

        c3.chart.internal.fn.additionalConfig = {
          labelArc: {
            // used to add a second arc outside of the pie arc for the label
            innerRadiusRatio: 0.7,
            outerRadiusRatio: 0.7,
          },
          pieExt: {
            radiusRatio: 0.85, // this is the ratio of the svg area the pie will take up
          },
        };

        /* Calculates a hash for a label coordinates to avaid collisions */

        c3.chart.internal.fn.createHashKey = function (coordinates) {
          return (
            Math.floor(coordinates[0] / 140) * 140 +
            "," +
            Math.floor(coordinates[1] / 24) * 24
          );
        };

        /*
                    Holds hashed value of the label coordinates to try and handle collisions.
                  */
        c3.chart.internal.fn.labelHash = [];

        /*
                    Adding getLabelSvgArc function to implement a second arc for the lables outside of the pie
                  */
        c3.chart.internal.fn.getLabelSvgArc = function () {
          var $$ = this,
            config = $$.api.internal.config;
          var labelarc = $$.d3.svg
            .arc()
            .outerRadius($$.radius * config.labelArc.outerRadiusRatio)
            .innerRadius($$.radius * config.labelArc.innerRadiusRatio);

          var newArc = function (d, withoutUpdate) {
            var updated;
            if (withoutUpdate) {
              return labelarc(d);
            } // for interpolate
            updated = c3.chart.internal.fn.updateAngle(d);
            return updated ? labelarc(updated) : "M 0 0";
          };
          newArc.centroid = labelarc.centroid;
          return newArc;
        };

        c3.chart.internal.fn.updateRadius = function () {
          var $$ = this,
            config = $$.config,
            w = config.gauge_width || config.donut_width;
          $$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
          $$.radius = $$.radiusExpanded * config.pieExt.radiusRatio;
          $$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
          $$.innerRadius =
            $$.hasType("donut") || $$.hasType("gauge")
              ? $$.radius * $$.innerRadiusRatio
              : 0;
        };

        c3.chart.internal.fn.updateArc = function () {
          var $$ = this;
          $$.svgArc = $$.getSvgArc();
          $$.labelSvgArc = $$.getLabelSvgArc();
          $$.svgArcExpanded = $$.getSvgArcExpanded();
          $$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);

          // Draw line from label to midpoint of arc
        };

        // Gráficos de torta Energía - No Fósiles - Participación de la generación (2015 - 2020)
        if (!$("#chart2").length) {
          $("#chart").after('<div id="chart2"></div>');
          $("#chart2").after('<div id="chart3"></div>');
          $("#chart3").after('<div id="chart4"></div>');
          $("#chart4").after('<div id="chart5"></div>');
          $("#chart5").after('<div id="chart6"></div>');
          $("#chart").css("width", "40%");
          $("#chart").css("display", "inline-block");
          $("#body .content").css("text-align", "center");
          $("#chart_descripcion").css("text-align", "left");
          $("#chart_custom_legend").show();
          $("#text_box_treemap").hide();
          $(".container_canvas_organismo").hide();
        }
        // Año 2015
        chart = c3.generate({
          title: {
            show: false,
            text: data.anio[1],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },

          data: {
            columns: [data.valores1, data.resto1],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          pie: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#EE4788", "#585961"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
        // Año 2016
        second_chart = c3.generate({
          bindto: "#chart2",
          title: {
            show: false,
            text: data.anio[2],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },

          data: {
            columns: [data.valores2, data.resto2],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          pie: {
            label: {
              threshold: 0.001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          color: {
            pattern: ["#EE4788", "#585961"],
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },
        });
        // Año 2017
        third_chart = c3.generate({
          bindto: "#chart3",
          title: {
            show: false,
            text: data.anio[3],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },
          data: {
            columns: [data.valores3, data.resto3],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          color: {
            pattern: ["#EE4788", "#585961"],
          },

          pie: {
            label: {
              show: true,
              threshold: 0.0001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },

          onrendered: function () {
            d3.selectAll(
              ".c3-chart-arc.c3-target-Participación-de-la-generación-renovable-no-convencional text"
            ).each(function (v) {
              var label = d3.select(this);
              var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
              pos = [12, -160];
              // pos[0] is x, pos[1] is y. Do some position changes and update value
              label.attr(
                "transform",
                "translate(" + pos[0] + "," + pos[1] + ") rotate(3)"
              );
              label.style({ fill: "black", "font-size": "13px" });
            });

            d3.selectAll(
              ".c3-chart-arc.c3-target-Resto-de-generación-de-electricidad text"
            ).each(function (v) {
              var label = d3.select(this);
              label.remove();
            });

            d3.selectAll(".c3-chart-arc").attr("transform", "rotate(-3)");
          },
        });
        // año 2018
        fourth_chart = c3.generate({
          bindto: "#chart4",
          title: {
            show: false,
            text: data.anio[4],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },
          data: {
            columns: [data.valores4, data.resto4],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          color: {
            pattern: ["#EE4788", "#585961"],
          },

          pie: {
            label: {
              show: true,
              threshold: 0.0001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },

          onrendered: function () {
            d3.selectAll(
              ".c3-chart-arc.c3-target-Participación-de-la-generación-renovable-no-convencional text"
            ).each(function (v) {
              var label = d3.select(this);
              var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
              pos = [12, -160];
              // pos[0] is x, pos[1] is y. Do some position changes and update value
              label.attr(
                "transform",
                "translate(" + pos[0] + "," + pos[1] + ") rotate(3)"
              );
              label.style({ fill: "black", "font-size": "13px" });
            });

            d3.selectAll(
              ".c3-chart-arc.c3-target-Resto-de-generación-de-electricidad text"
            ).each(function (v) {
              var label = d3.select(this);
              label.remove();
            });

            d3.selectAll(".c3-chart-arc").attr("transform", "rotate(-3)");
          },
        });

        // Año 2019
        fifth_chart = c3.generate({
          bindto: "#chart5",
          title: {
            show: false,
            text: data.anio[5],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },
          data: {
            columns: [data.valores5, data.resto5],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          color: {
            pattern: ["#EE4788", "#585961"],
          },

          pie: {
            label: {
              show: true,
              threshold: 0.0001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },

          onrendered: function () {
            d3.selectAll(
              ".c3-chart-arc.c3-target-Participación-de-la-generación-renovable-no-convencional text"
            ).each(function (v) {
              var label = d3.select(this);
              var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
              pos = [12, -160];
              // pos[0] is x, pos[1] is y. Do some position changes and update value
              label.attr(
                "transform",
                "translate(" + pos[0] + "," + pos[1] + ") rotate(3)"
              );
              label.style({ fill: "black", "font-size": "13px" });
            });

            d3.selectAll(
              ".c3-chart-arc.c3-target-Resto-de-generación-de-electricidad text"
            ).each(function (v) {
              var label = d3.select(this);
              label.remove();
            });

            d3.selectAll(".c3-chart-arc").attr("transform", "rotate(-3)");
          },
        });

        // Año 2020
        sixth_chart = c3.generate({
          bindto: "#chart6",
          title: {
            show: false,
            text: data.anio[6],
            position: "top-center",
            padding: {
              top: 0,
              right: 0,
              bottom: 20,
              left: 0,
            },
          },
          size: {
            height: 400,
          },
          data: {
            columns: [data.valores6, data.resto6],
            type: "pie",
            onmouseover: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            onmouseout: function (d) {
              $('.legend-label[data-id="' + d.id + '"]')
                .parent()
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .addClass("c3-target");
            },
            order: null,
          },

          color: {
            pattern: ["#EE4788", "#585961"],
          },

          pie: {
            label: {
              show: true,
              threshold: 0.0001,
              format: function (value, ratio, id) {
                return (
                  numberWithCommas(
                    toComma(correctDecimals(value, data.cantDecimales))
                  ) + "%"
                );
              },
            },
          },

          legend: {
            show: false,
          },

          tooltip: {
            format: {
              // title: function (d) { return 'Data ' + d; },
              value: function (value, ratio, id) {
                value = Math.round(value * 100) / 100;

                txt = round(value) + " " + data.unidad;

                return numberWithCommas(toComma(txt));
              },
            },
          },

          onrendered: function () {
            d3.selectAll(
              ".c3-chart-arc.c3-target-Participación-de-la-generación-renovable-no-convencional text"
            ).each(function (v) {
              var label = d3.select(this);
              var pos = label.attr("transform").match(/-?\d+(\.\d+)?/g);
              pos = [12, -160];
              // pos[0] is x, pos[1] is y. Do some position changes and update value
              label.attr(
                "transform",
                "translate(" + pos[0] + "," + pos[1] + ") rotate(3)"
              );
              label.style({ fill: "black", "font-size": "13px" });
            });

            d3.selectAll(
              ".c3-chart-arc.c3-target-Resto-de-generación-de-electricidad text"
            ).each(function (v) {
              var label = d3.select(this);
              label.remove();
            });

            d3.selectAll(".c3-chart-arc").attr("transform", "rotate(-3)");
          },
        });

        if (!$("#chart_custom_legend .legend").length) {
          d3.select("#chart_custom_legend")
            .insert("div", ":first-child")
            .attr("class", "legend col-md-2")
            .insert("ul")
            .attr("class", "list-group")
            .selectAll("span")
            .data(["Participación de la generación de electricidad"])
            .enter()
            .append("li")
            .attr("class", "list-group-item")
            .append("div")
            .attr("class", "legend-label")
            .attr("data-id", function (id) {
              return id;
            })
            .append("div", ".legend-label")
            .html(function (id) {
              var data = chart.data(id);
              return id + "&nbsp&nbsp&nbsp";
            })
            .on("mouseover", function (id) {
              chart.focus(id);
              second_chart.focus(id);
              third_chart.focus(id);
              fourth_chart.focus(id);
              fifth_chart.focus(id);
              sixth_chart.focus(id);
            })
            .on("mouseout", function (id) {
              chart.revert();
              second_chart.revert();
              third_chart.revert();
              fourth_chart.revert();
              fifth_chart.revert();
              sixth_chart.revert();
            })
            .insert("span", ".legend-label")
            .attr("class", "badge")
            .each(function (id) {
              d3.select(this).style("background-color", chart.color(id));
            })
            .html(function (id) {
              return "&nbsp&nbsp&nbsp&nbsp&nbsp";
            });

          $("#chart_custom_legend .badge").each(function () {
            $(this).insertBefore($(this).parent());
          });

          $("#chart_custom_legend .list-group-item").hover(
            function () {
              $(this)
                .siblings(".list-group-item")
                .addClass("c3-defocused")
                .addClass("c3-target");
            },
            function () {
              $(this)
                .siblings(".list-group-item")
                .removeClass("c3-defocused")
                .removeClass("c3-target");
            }
          );
        }
      }
    });
  }

  function wrap(text, width) {
    text.each(function () {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 1.1,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")
          .attr("class", "tspan_text");

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .attr("class", "tspan_text_" + lineNumber)
            .text(word);
        }
      }
    });
  }

  function wrap_2(text, width) {
    text = $(".toolCircle");
    text.each(function () {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 1.1,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")
          .attr("class", "tspan");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .attr("class", "tspan_2")
            .text(word);
        }
      }
    });
  }

  function wrap_3(text, width) {
    text = $(".labels_2 text");
    text.each(function () {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 1.1,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")
          .attr("class", "indicador");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight - dy + "em")
            .attr("class", "indicador_2")
            .text(word);
        }
      }
    });
  }
  function wrap_5(text, width) {
    text = $(".labels text");
    text.each(function () {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 0.001, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = -1.8,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")
          .attr("class", "chart_indicador");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight - dy + "em")
            .attr("class", "chart_indicador_2")
            .text(word);
        }
      }
    });
  }

  function wrap_4(text, width, text_class) {
    text = $(text_class);
    text.each(function () {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 1.1,
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")
          .attr("class", "tspan_interior");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .attr("class", "tspan_interior_2")
            .text(word);
        }
      }
    });
  }

  //////////////////////////////////////////
  // MOSAICO
  //////////////////////////////////////////
  if (f == "distribucion-categoria-clave_2") {
    var el_id = "container_canvas";
    var obj = document.getElementById(el_id);
    var divWidth = obj.offsetWidth;
    var margin = { top: 30, right: 0, bottom: 20, left: 0 },
      width = divWidth - 25,
      height = 600 - margin.top - margin.bottom,
      formatNumber = d3.format(","),
      transitioning;
    // sets x and y scale to determine size of visible boxes
    var x = d3.scaleLinear().domain([0, width]).range([0, width]);
    var y = d3.scaleLinear().domain([0, height]).range([0, height]);
    var treemap = d3
      .treemap()
      .size([width, height])
      .paddingInner(0)
      .round(false);
    var svg = d3
      .select("#" + el_id)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");
    var grandparent = svg.append("g").attr("class", "grandparent");
    grandparent
      .append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top)
      .attr("fill", "#bbbbbb");
    grandparent
      .append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em");

    d3.json("files/categoria_principal_2016_2.json", function (data) {
      var root = d3.hierarchy(data);
      console.log(root);
      treemap(
        root
          .sum(function (d) {
            return d.value;
          })
          .sort(function (a, b) {
            return b.height - a.height || b.value - a.value;
          })
      );
      display(root);
      function display(d) {
        // write text into grandparent
        // and activate click's handler
        grandparent
          .datum(d.parent)
          .on("click", transition)
          .select("text")
          .text(name(d));
        // grandparent color
        grandparent
          .datum(d.parent)
          .select("rect")
          .attr("fill", function () {
            return "#4f81bd";
          });
        var g1 = svg
          .insert("g", ".grandparent")
          .datum(d)
          .attr("class", "depth");
        var g = g1.selectAll("g").data(d.children).enter().append("g");
        // add class and click handler to all g's with children
        g.filter(function (d) {
          return d.children;
        })
          .classed("children", true)
          .on("click", transition);
        g.selectAll(".child")
          .data(function (d) {
            return d.children || [d];
          })
          .enter()
          .append("rect")
          .attr("class", "child")
          .call(rect);
        // add title to parents
        g.append("rect")
          .attr("class", "parent")
          .call(rect)
          .append("title")
          .text(function (d) {
            return d.data.name;
          });
        /* Adding a foreign object instead of a text object, allows for text wrapping */
        g.append("foreignObject")
          .call(rect)
          .attr("class", "foreignobj")
          .append("xhtml:div")
          .attr("dy", ".75em")
          .html(function (d) {
            return (
              "" +
              '<p class="title"> ' +
              d.data.name +
              "</p>" +
              "<p>" +
              formatNumber(d.value) +
              "</p>"
            );
          })
          .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS
        function transition(d) {
          if (transitioning || !d) return;
          transitioning = true;
          var g2 = display(d),
            t1 = g1.transition().duration(650),
            t2 = g2.transition().duration(650);
          // Update the domain only after entering new elements.
          x.domain([d.x0, d.x1]);
          y.domain([d.y0, d.y1]);
          // Enable anti-aliasing during the transition.
          svg.style("shape-rendering", null);
          // Draw child nodes on top of parent nodes.
          svg.selectAll(".depth").sort(function (a, b) {
            return a.depth - b.depth;
          });
          // Fade-in entering text.
          g2.selectAll("text").style("fill-opacity", 0);
          g2.selectAll("foreignObject div").style("display", "none");
          /*added*/
          // Transition to the new view.
          t1.selectAll("text").call(text).style("fill-opacity", 0);
          t2.selectAll("text").call(text).style("fill-opacity", 1);
          t1.selectAll("rect").call(rect);
          t2.selectAll("rect").call(rect);
          /* Foreign object */
          t1.selectAll(".textdiv").style("display", "none");
          /* added */
          t1.selectAll(".foreignobj").call(foreign);
          /* added */
          t2.selectAll(".textdiv").style("display", "block");
          /* added */
          t2.selectAll(".foreignobj").call(foreign);
          /* added */
          // Remove the old node when the transition is finished.
          t1.on("end.remove", function () {
            this.remove();
            transitioning = false;
          });
        }
        return g;
      }
      function text(text) {
        text
          .attr("x", function (d) {
            return x(d.x) + 6;
          })
          .attr("y", function (d) {
            return y(d.y) + 6;
          });
      }
      function rect(rect) {
        var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
        console.log(colorScale);

        rect
          .attr("x", function (d) {
            return x(d.x0);
          })
          .attr("y", function (d) {
            return y(d.y0);
          })
          .attr("width", function (d) {
            return x(d.x1) - x(d.x0);
          })
          .attr("height", function (d) {
            return y(d.y1) - y(d.y0);
          })
          .attr("fill", function (d) {
            var color = "#eeee";

            if (d.data.color) {
              color = d.data.color;
            } else {
              color = colorScale(d.data.name);
            }

            return color;
          });
      }
      function foreign(foreign) {
        /* added */ foreign
          .attr("x", function (d) {
            return x(d.x0);
          })
          .attr("y", function (d) {
            return y(d.y0);
          })
          .attr("width", function (d) {
            return x(d.x1) - x(d.x0);
          })
          .attr("height", function (d) {
            return y(d.y1) - y(d.y0);
          });
      }
      function name(d) {
        return (
          breadcrumbs(d) +
          (d.parent
            ? " - Haga clic para alejar"
            : " - Haga clic dentro del cuadrado para acercar")
        );
      }
      function breadcrumbs(d) {
        var res = "";
        var sep = " > ";
        d.ancestors()
          .reverse()
          .forEach(function (i) {
            res += i.data.name + sep;
          });
        return res
          .split(sep)
          .filter(function (i) {
            return i !== "";
          })
          .join(sep);
      }
    });
  }
  if (f == "distribucion-categoria-clave" || f == "distribucion-subactividad") {
    var treemap = $(".container_canvas svg");
    var width = $(".container_canvas").width() - 34;
    var height = 788; //$(".container_canvas").height();

    $("#chart_title").html("10 CATEGORÍAS PRINCIPALES POR NIVEL");
    if (treemap) {
      $(".container_canvas svg").remove();
    }

    $("#chart").hide();
    $("#chart_psd3").hide();
    $("#chart_sankey").hide();
    //$("#chart_bubble").show();
    $(".container_canvas").css("display", "block");

    var canvas = d3
      .select(".container_canvas")
      .append("svg")
      .attr(
        "style",
        "position: relative;width:95%;height:788px;margin-top:1%;margin:0px auto;min-width: 934px;"
      )
      .attr("class", "treemap");

    var width = $(".container_canvas svg").width();
    var tool = d3
      .select(".container_canvas")
      .append("div")
      .attr("class", "toolTip");
    // var div = d3.select(".container_canvas").append("div")
    // .attr("class", "tooltip")
    // .style("opacity", 0);

    //var box_text = d3.select(container).append("p");

    //$(box_text).text("aca");

    var params = {
      sector_id: "all",
      ano: $("#select_ano").val(),
      f: f,
    };

    var texto = "";

    // $(".container_canvas").mousemove(function(event){
    //     var x = event.pageX - this.offsetLeft;
    //     var y = event.pageY - this.offsetTop;

    // });
    var ano = $("#select_ano").val();
    var archivo = "categoria_principal_" + ano + ".json";
    var unidad = "%";
    //var unidad = 'MtCO₂e';

    if (f == "distribucion-subactividad") {
      $("#chart_title").html("Por Subactividad");
      archivo = "sub_" + ano + ".json";
      unidad = "MtCO₂e";
    }
    var width_rect;

    d3.json("files/" + archivo + "", function (data) {
      //Buscar los 10 mayores y graficar esos 10

      // for (var x = 0; x < data.children.length; x++) {

      //     for (var i = 0; i < data.children.length-x-1; i++) {
      //         if(data.children[i] < data.children[i+1]){
      //             var tmp = data.children[i+1];
      //             data.children[i+1] = data.children[i];
      //             data.children[i] = tmp;
      //         }
      //     }
      // }

      // data.children.length = data.children.length - 20;

      var color = d3.scale.category10();
      var treemap = d3.layout.treemap().size([width, 750]).nodes(data);

      var cells = canvas
        .selectAll(".cell")
        .data(treemap)
        .enter()
        .append("g")
        .attr("class", "cell");

      var toolTip = d3
        .select(".container_canvas")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      cells
        .append("rect")
        .attr("x", function (d) {
          return d.x;
        })
        .attr("y", function (d) {
          return d.y;
        })
        .attr("width", function (d) {
          return d.dx;
        })
        .attr("height", function (d) {
          return d.dy;
        })
        .attr("fill", function (d) {
          return d.children ? null : d.color;
        })
        .attr("stroke", "#fff")
        .on("mouseover", (d, i) => {
          $(".text_box_treemap p").text(d.descripcion);
          $(".text_box_treemap h2").text(d.name);
          $(".text_box_treemap h2").attr(
            "style",
            "color:" + d.color + ";display:block"
          );
          $(".text_box_treemap").attr("style", "display:block");
          $(".container_canvas svg").on("mousemove", function (event) {
            var x = "";
            var y = "";
            var parentOffset = $(this).parent().offset();
            x = event.pageX - parentOffset.left + 30;
            y = event.pageY - parentOffset.top + 100;
            width_rect = $(this).width();
            width_rect = d.dx;
            toolTip
              .transition()
              .duration(0.1)
              .style("left", x)
              .style("top", y)
              .style("position", "absolute")
              .attr("data-value", d.value)
              .style("opacity", 0.9);
            toolTip
              .attr("id", "tooltip")
              .attr(
                "style",
                "font-size: 12px;box-shadow: 7px 7px 12px -9px #777777;"
              )
              .html(function () {
                const valor = d.value.toString().replace(".", ",");
                return (
                  "<span style='width:100%;color:#000000;background-color: #fff;padding: 10px 6px 10px;'>" +
                  valor +
                  " " +
                  unidad +
                  "</span>"
                );
              });
          });
        })
        .on("mouseout", function (d) {
          toolTip.transition().duration(0.1).style("opacity", 0);
        });

      cells
        .append("text")
        .attr("text-anchor", "middle")
        .attr("class", function (d, i) {
          return "container_tspan_" + i;
        })
        .attr("style", "font-size:12px;fill:#fff;")
        .text(function (d) {
          return d.name;
        })
        .attr("x", function (d) {
          return d.x + d.dx / 2;
        })
        .attr("y", function (d) {
          if (f == "distribucion-subactividad") {
            position = d.y + d.dy - 27;
          } else {
            position = d.y + d.dy - 60;
          }
          return position;
        })
        .call(wrap, 115);

      let height = parseInt(
        cells.select("text").node().getBoundingClientRect().height
      );

      cells
        .select("text")
        .attr("transform", "translate(0, " + -height / 2 + ")");
      let yTrack = 100;
      yTrack += parseInt(height / 2) + 10;

      if (f == "distribucion-categoria-clave") {
        for (i = 0; i <= 22; i++) {
          var rectanguloH = parseInt(
            $(".container_tspan_" + i)
              .parent()
              .children("rect")
              .first()
              .height()
          );

          //var cuadroTexto = $('.container_tspan_'+i).height();
          console.log(rectanguloH);
          var posicionTexto = rectanguloH / 2 - 35;

          if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text_4")
          ) {
            $(".container_tspan_" + i + " .tspan_text_4").attr(
              "dy",
              54.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_3").attr(
              "dy",
              40.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_2").attr(
              "dy",
              27.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_1").attr(
              "dy",
              14.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              0.1 - posicionTexto
            );
          } else if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text_3")
          ) {
            $(".container_tspan_" + i + " .tspan_text_3").attr(
              "dy",
              54.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_2").attr(
              "dy",
              40.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_1").attr(
              "dy",
              27.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              14.1 - posicionTexto
            );
          } else if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text_2")
          ) {
            $(".container_tspan_" + i + " .tspan_text_2").attr(
              "dy",
              54.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_1").attr(
              "dy",
              40.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              27.1 - posicionTexto
            );
          } else if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text_1")
          ) {
            $(".container_tspan_" + i + " .tspan_text_1").attr(
              "dy",
              54.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              40.1 - posicionTexto
            );
          } else if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text")
          ) {
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              54.1 - posicionTexto
            );
          }
        }
      } else {
        for (i = 0; i <= 26; i++) {
          var rectanguloH = parseInt(
            $(".container_tspan_" + i)
              .parent()
              .children("rect")
              .first()
              .height()
          );
          var posicionTexto = rectanguloH / 2 - 18;
          if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text_3")
          ) {
            $(".container_tspan_" + i + " .tspan_text_1").attr(
              "dy",
              1.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_2").attr(
              "dy",
              13.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_3").attr(
              "dy",
              25.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              10.1 - posicionTexto
            );
            continue;
          }
          if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text_2")
          ) {
            $(".container_tspan_" + i + " .tspan_text_2").attr(
              "dy",
              24.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text_1").attr(
              "dy",
              12.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              0.1 - posicionTexto
            );
            continue;
          }
          if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text_1")
          ) {
            $(".container_tspan_" + i + " .tspan_text_1").attr(
              "dy",
              24.1 - posicionTexto
            );
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              9.1 - posicionTexto
            );
            continue;
          }
          if (
            $(".container_tspan_" + i)
              .children()
              .hasClass("tspan_text")
          ) {
            $(".container_tspan_" + i + " .tspan_text").attr(
              "dy",
              24.1 - posicionTexto
            );
            continue;
          }
        }
      }
    });
  }

  if (f == "distribucion-organismo_aplicacion") {
    $("#chart").hide();
    $("#chart_psd3").hide();
    $("#chart_sankey").hide();
    //$("#chart_bubble").show();
    $(".container_canvas_organismo").css("display", "block");
    $("#box_chart_sector").css("display", "none");
    $("#chart_title").html("Por Organismo de Aplicación");
    $(".box_resto").css("display", "block");
    var chart_organizmo = $(".container_canvas_organismo svg");

    if (chart_organizmo) {
      $(".container_canvas_organismo svg").remove();
    }

    var ano = $("#select_ano").val();

    $("#chart_ano").html(ano);

    var archivo = "organismo_" + ano;

    d3.json("files/" + archivo + ".json", function (data_json) {
      //$('.box_resto .box_texto p').text('Deforestación total '+data_json.deforestacion+' '+data_json.unidad);

      var svg = d3
        .select(".container_canvas_organismo")
        .append("svg")
        .attr("width", "850")
        .attr("height", "780px")
        .append("g");

      svg.append("g").attr("class", "slices");
      svg.append("g").attr("class", "labels");
      svg.append("g").attr("class", "lines");
      svg2 = svg.append("g").attr("class", "chart2");
      svg3 = svg.append("g").attr("class", "chart3");

      var width = 850;
      var height = 650;
      var radius = Math.min(width, height) / 2;
      var donutWidth = 75;
      var radius2 = radius - 10;

      var color_donut_1 = [
        "#1f92d1",
        "#6fd0f1",
        "#0873b9",
        "#1b8fb6",
        "#28beef",
      ];
      var total =
        data_json.donut_1_1[1] +
        data_json.donut_1_2[1] +
        data_json.donut_1_3[1] +
        data_json.donut_1_4[1] +
        data_json.donut_1_5[1];
      var data = [
        data_json.donut_1_1[1],
        data_json.donut_1_2[1],
        data_json.donut_1_3[1],
        data_json.donut_1_4[1],
        data_json.donut_1_5[1],
      ];
      var data_3 = [data_json.donut_1_1[1]];
      //var total_deforestacion = data[4] + data[3];
      var sustitutos_sao = data_json.sustitutos_sao;
      var efluentes_liquidos_industriales =
        data_json.efluentes_liquidos_industriales;
      var consumo_electrico_industrial = data_json.consumo_electrico_industrial;
      var consumo_electrico_transporte = data_json.consumo_electrico_transporte;
      var deforestacion = data_json.deforestacion;

      $(".sustitutos_sao").text(
        ((sustitutos_sao / total) * 100).toFixed(2).replace(".", ",") + " %"
      );
      $(".efluentes_liquidos_industriales").text(
        ((efluentes_liquidos_industriales / total) * 100)
          .toFixed(2)
          .replace(".", ",") + " %"
      );
      $(".consumo_electrico_industrial").text(
        ((consumo_electrico_industrial / total) * 100)
          .toFixed(2)
          .replace(".", ",") + " %"
      );
      $(".consumo_electrico_transporte").text(
        ((consumo_electrico_transporte / total) * 100)
          .toFixed(2)
          .replace(".", ",") + " %"
      );
      $(".emision_deforestacion").text(
        ((deforestacion / total) * 100).toFixed(2).replace(".", ",") + " %"
      );

      //$('p.resto_titulo').text('Deforestación total '+((data_json.deforestacion/total)*100).toFixed(2)+' %');

      var pie = d3.layout
        .pie()
        .sort(null)
        .value((d) => d);
      var arc = d3.svg
        .arc()
        .innerRadius(radius * 0.3)
        .outerRadius(radius - 90);
      var arc2 = d3.svg
        .arc()
        .innerRadius(donutWidth + 80)
        .outerRadius(radius2 - 60);
      var arc3 = d3.svg
        .arc()
        .innerRadius(donutWidth + 100)
        .outerRadius(90);

      var outerArc = d3.svg
        .arc()
        .outerRadius(radius * 0.9)
        .innerRadius(radius * 0.9);

      svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      svg
        .append("text")
        .attr("class", "toolCircle")
        .attr("dy", -15)
        .text(function () {
          return (
            total.toFixed(0) +
            " MtCO₂e EMISIONES TOTALES (" +
            data_json.anio +
            ")"
          );
        })
        .style("font-size", ".9em")
        .style("text-anchor", "middle")
        .call(wrap_2, 50);

      $(".tspan").attr("x", "0px");
      var dy = $(".tspan").attr("dy");
      $(".tspan").attr("y", "-50px");
      $(".tspan").attr(
        "style",
        "font-size:13px;fill:#4f81bd;font-family:'GothamBold';"
      );
      $(".tspan_2").attr("x", "0px");
      $(".tspan_2").attr("dy", dy);
      $(".tspan_2").attr(
        "style",
        "font-size:13px;fill:#4f81bd;font-family:'GothamBold';"
      );

      svg
        .selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("class", function (d, i) {
          return "path_chart_" + i;
        })
        .attr("fill", "#c7ebfc")
        .attr("style", "stroke-width: 1.5px;stroke: white;")
        .append("text");
      svg.append("g").classed("labels", true);
      svg.append("g").classed("lines", true);

      svg
        .selectAll(".text_tspan")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("class", "text_interior")
        .attr("text-anchor", "middle")
        .attr("style", "font-size:13px;fill:#fff;font-family:'GothamBold';")
        .attr("transform", function (d) {
          var pos = arc.centroid(d);
          return "translate(" + pos + ")";
        })
        .text(function (d, i) {
          let indicador = "";
          if (i == 0) {
            indicador = "TRANSPORTE";
          }
          if (i == 1) {
            indicador = "ENERGÍA";
          }
          if (i == 2) {
            indicador = "INDUSTRIA";
          }
          if (i == 3) {
            indicador = "RESIDUOS";
            //$(".barra_residuos").width(((d.data/total_deforestacion)*100).toFixed(2)+"%");
          }
          if (i == 4) {
            indicador = "AGRO Y DEFORESTACIÓN";
            //$(".barra_agro").width(((d.data/total_deforestacion)*100).toFixed(2)+"%");
          }
          return (
            indicador +
            " " +
            ((d.data / total) * 100).toFixed(2).replace(".", ",") +
            "%"
          );
        })
        .call(wrap_4, 80, ".text_interior")
        .append("tspan")
        .attr("with", "25px")
        .attr("height", "25px")
        .attr("fill", function (d, i) {
          return "url(#id_icono_" + i + ")";
        });

      $(".tspan_interior").attr("x", "0px");
      var dy = $(".tspan_interior").attr("dy");
      $(".tspan_interior").attr(
        "style",
        "font-size:13px;fill:#4f81bd;font-family:'GothamBold';"
      );
      $(".tspan_interior_2").attr("x", "0px");
      $(".tspan_interior_2").attr("dy", dy);
      $(".tspan_interior_2").attr(
        "style",
        "font-size:13px;fill:#4f81bd;font-family:'GothamBold';"
      );

      svg2
        .selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc2)
        .attr("fill", function (d, i) {
          return color_donut_1[i];
        })
        .attr("style", "stroke-width: 1.5px;stroke: white;");
      svg2.append("g").classed("labels_2", true);
      svg2.append("g").classed("lines_2", true);

      svg3
        .selectAll("path")
        .data(pie(data_3))
        .enter()
        .append("path")
        .attr("d", arc3)
        .attr("fill", "#4f81bd");

      if (parseInt(ano) < 2015) {
        $(".text_chart_3 .chart_indicador").attr("dy", "-13.8em");
        $(".text_chart_3 .chart_indicador").attr("x", "-215");
        $(".text_chart_3 .chart_indicador_2").attr("x", "-215");
        if (ano == "2013" || ano == "2012" || ano == "2010") {
          $(".text_chart_3 .chart_indicador").attr("x", "-290");
          $(".text_chart_3 .chart_indicador_2").attr("x", "-290");
        }
        if (parseInt(ano) < 2010) {
          $(".text_chart_3 .chart_indicador").attr("dy", "-2.8em");
        }
        if (parseInt(ano) < 2008) {
          $(".text_chart_3 .chart_indicador").attr("dy", "1.8em");
          $(".text_chart_3 .chart_indicador").attr("x", "-150px");
          $(".text_chart_3 .chart_indicador_2").attr("x", "-150px");
        }
        if (parseInt(ano) < 2007) {
          $(".text_chart_3 .chart_indicador").attr("dy", "4.8em");
          $(".text_chart_3 .chart_indicador").attr("x", "-160px");
          $(".text_chart_3 .chart_indicador_2").attr("x", "-160px");
          if (ano == "2003" || ano == "2002" || ano == "2001") {
            $(".text_chart_3 .chart_indicador").attr("dy", "6.1em");
            $(".text_chart_3 .chart_indicador").attr("x", "-190px");
            $(".text_chart_3 .chart_indicador_2").attr("x", "-190px");
          }
        }
        if (parseInt(ano) < 1999) {
          $(".text_chart_3 .chart_indicador").attr("dy", "3.8em");
          $(".text_chart_3 .chart_indicador").attr("x", "-170px");
          $(".text_chart_3 .chart_indicador_2").attr("x", "-170px");
          if (ano == "1993" || ano == "1992" || ano == "1991") {
            $(".text_chart_3 .chart_indicador").attr("dy", "6.1em");
            $(".text_chart_3 .chart_indicador").attr("x", "-190px");
            $(".text_chart_3 .chart_indicador_2").attr("x", "-190px");
          }
        }
      } else {
        $(".text_chart_3 .chart_indicador").attr("dy", "-13.8em");
        $(".text_chart_3 .chart_indicador").attr("x", "-150px");
        $(".text_chart_3 .chart_indicador_2").attr("x", "-150px");
      }

      $(".text_chart_0 .chart_indicador").attr("dy", "-2.8em");
      $(".text_chart_0 .chart_indicador_2").attr("x", "-50px");
      $(".text_chart_0 .chart_indicador").attr("x", "-50px");
      $(".text_chart_1 .chart_indicador_2").attr("x", "-50px");
      $(".text_chart_1 .chart_indicador").attr("x", "-50px");

      //$('text_chart_0 .indicador1').attr('x','10px');
      //$('.indicador'+i+' tspan').attr('y','-10px');

      var label = svg
        .select(".labels_2")
        .selectAll(".indicadores_2")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("class", function (d, i) {
          return "indicador" + i;
        })
        .attr("dy", ".35em")
        .attr("style", "dominant-baseline:text-before-edge")
        .html(function (d, i) {
          let indicador = "";
          if (i == 0) {
            indicador = "ORGANISMO DE APLICACIÓN DE TRANSPORTE";
          }
          if (i == 1) {
            indicador = "ORGANISMO DE APLICACIÓN DE ENERGÍA";
          }
          if (i == 2) {
            indicador = "ORGANISMO DE APLICACIÓN DE PRODUCCIÓN";
          }
          if (i == 3) {
            indicador = "ORGANISMO DE APLICACIÓN DE AMBIENTE";
          }
          if (i == 4) {
            indicador = "ORGANISMO DE APLICACIÓN DE AGROINDUSTRIA";
          }
          return indicador; //((d.data/total)*100).toFixed(2)+"%";
        })
        .attr("transform", function (d, i) {
          var pos = outerArc.centroid(d); ///arc.centroid(d);
          if (i == 2) {
            if (pos[0] < 10) {
              pos[0] = radius * 0.2 * (midAngle(d) < Math.PI ? 1 : -1);
              $(".indicador" + i).attr("x", "50px");
              $(".indicador_" + i).attr("x", "50px");
              $(".indicador" + i + " tspan").attr("y", "-10px");
            } else {
              pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
              $(".indicador" + i).attr("x", "5px");
            }

            $(".indicador" + i).attr(
              "style",
              "font-size:13px;font-family:'GothamBold';"
            );
          } else {
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);

            $(".indicador" + i).attr("x", "5px");
            $(".indicador" + i).attr(
              "style",
              "font-size:13px;font-family:'GothamBold';"
            );
          }

          return "translate(" + pos + ")";
        })
        .style("text-anchor", "middle")
        .attr("fill", function (d, i) {
          return color_donut_1[i];
        })
        .call(wrap_3, 150);

      $("text.indicador1 .indicador").attr("x", "40px");
      $("text.indicador1 .indicador_2").attr("x", "40px");
      $("text.indicador2 .indicador").attr("y", "10px");
      $("text.indicador4 .indicador").attr("x", "-40px");
      $("text.indicador4 .indicador_2").attr("x", "-40px");
      //$('.indicador_2').attr('x','5px');
      var dy2 = $("tspan.indicador").attr("dy");
      $(".indicador_2").attr("dy", dy2);
      $(".indicador_2").attr(
        "style",
        "font-size:13px;font-family:'GothamBold';"
      );
      $("tspan.indicador").attr("dy", "0.1em");
      $("text.indicador2 tspan.indicador").attr("dy", "0.1em");
      if (parseInt(ano) < 2015) {
        //$('text.indicador3 tspan.indicador').attr('dy','-5.9em');
        //$('text.indicador2 tspan.indicador').attr('dy','-2.9em');
        $("text.indicador2 tspan.indicador").attr("dy", "-0.9em");
      }
      if (parseInt(ano) < 2005) {
        $("text.indicador2 tspan.indicador").attr("x", "30");
        $("text.indicador2 tspan.indicador_1").attr("x", "30");
        $("text.indicador2 tspan.indicador_2").attr("x", "30");
      }
      var polyline = svg
        .select(".lines_2")
        .selectAll("polyline")
        .data(pie(data))
        .enter()
        .append("polyline")
        .attr("points", function (d, i) {
          var pos = outerArc.centroid(d);
          pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);

          if (i == 0) {
            pos[0] = pos[0] - 50;
          }
          if (i == 1) {
            pos[0] = pos[0] - 15;
          }
          if (i == 2) {
            if (ano >= "2015") {
              pos[0] = -5;
            } else {
              if (parseInt(ano) < 2005) {
                pos[0] = pos[0] - 25;
              } else {
                pos[0] = pos[0] - 50;
              }
            }
          }
          if (i == 3) {
            if (pos[0] > 0) {
              pos[0] = pos[0] - 50;
            } else {
              pos[0] = pos[0] + 60;
            }
          }

          if (i == 4) {
            pos[0] = pos[0] + 18;
            //     if(parseInt(ano) < 2015) {

            //         pos[1] = pos[1] + 3;

            //     }
          }

          return [arc.centroid(d), outerArc.centroid(d), pos];
        })
        .attr("stroke", function (d, i) {
          return color_donut_1[i];
        });

      var projection = d3.geo
        .albers()
        .center([-54, -8.4])
        .parallels([11.5, -38])
        .scale(550)
        .rotate([55, -5, -5])
        .translate([width / 2 - 450, height / 2 - 40]);

      var path = d3.geo.path().projection(projection);

      svg
        .selectAll(".shadows")
        .data(pie(data))
        .enter()
        .append("circle")
        .attr("d", path)
        .attr("class", "shadows")
        .attr("r", 4)
        .attr("cx", 2)
        .attr("cy", 2)
        .attr("transform", function (d) {
          var pos = arc.centroid(d);
          return "translate(" + pos + ")";
        })
        .attr("opacity", 0.3)
        .attr("fill", "#fad959");

      svg
        .selectAll(".icono")
        .data(pie(data))
        .enter()
        .append("image")
        .attr("d", path)
        .attr("class", function (d) {
          return "icono";
        })
        .attr("r", 1)
        .attr("transform", function (d) {
          var pos = arc.centroid(d);
          return "translate(" + pos + ")";
        });

      d3.selectAll(".icono")
        .attr("xlink:href", function (d, i) {
          let icono = "";
          if (i == 0) {
            icono = "transporte";
          }
          if (i == 1) {
            icono = "energia";
          }
          if (i == 2) {
            icono = "industria";
          }
          if (i == 3) {
            icono = "residuos";
          }
          if (i == 4) {
            icono = "agronomia";
          }

          return "img/" + icono + ".png";
        })
        .attr("height", function (d, i) {
          var altura = 50;
          var porcentaje = ((d.data / total) * 100).toFixed(2);
          if (i == 3 && porcentaje < 3.4) {
            altura = 0;
          }
          return altura;
        })
        .attr("width", "50")
        .attr("x", "-20.5")
        .attr("y", "-45.5");

      d3.selectAll(".conector_icon2")
        .attr("xlink:href", "img/conector.png")
        .attr("height", "200")
        .attr("width", "150")
        .attr("x", "-20.5")
        .attr("y", "-45.5");

      function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      }
    });
  } else {
    $(".box_resto").css("display", "none");
  }
}

// FUNCIONALIDAD AGREGADA

// Al hacer click en el boton volver -> Mostrar mandala con lineas estratégicas y cerrar todos los menus

$(document).ready(function () {
  $("#scroll-top-btn").click(function () {
    $(".content.nomonitoreo").hide();
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      "slow"
    );
    init_monitoreo();
    $(".content.monitoreo").show();
  });
  $(".monitoreo_zocalo").hide(); // ocultar zocalo en home con el mandala de lineas estratégicas
});

// FUNCIONALIDAD DEL MANDALA LINEAS ESTRATEGICAS

// TRANSICION ENERGETICA
function showEnergia() {
  $(".home_monitoreo").hide();
  $(".home_monitoreo_energia").show();
  $(".main.monitoreo.energia").addClass("activo");
  $(".content.content_energia").slideDown().addClass("slow");
  $(".main.monitoreo.transporte").hide();
  $(".main.monitoreo.bosques").hide();
  $(".main.monitoreo.industria").hide();
  $(".main.monitoreo.infraestructura").hide();
  $(".main.monitoreo.agricultura").hide();
  $(".main.back").show();
  $(".monitoreo_zocalo").show(); // mostrar zocalo
}
// MOVILIDAD SOSTENIBLE
function showMovilidad() {
  $(".home_monitoreo").hide();
  $(".home_monitoreo_transporte").show();
  $(".main.monitoreo.transporte").addClass("activo");
  $(".content.content_movilidad").slideDown().addClass("slow");
  $(".main.monitoreo.energia").hide();
  $(".main.monitoreo.bosques").hide();
  $(".main.monitoreo.industria").hide();
  $(".main.monitoreo.infraestructura").hide();
  $(".main.monitoreo.agricultura").hide();
  $(".main.back").show();
  $(".monitoreo_zocalo").show(); // mostrar zocalo
}

//BIODIVERSIDAD
function showBiodiversidad() {
  $(".home_monitoreo").hide();
  $(".home_monitoreo_bosques").show();
  $(".main.monitoreo.bosques").addClass("activo");
  $(".content.content_biodiversidad").slideDown().addClass("slow");
  $(".main.monitoreo.energia").hide();
  $(".main.monitoreo.transporte").hide();
  $(".main.monitoreo.industria").hide();
  $(".main.monitoreo.infraestructura").hide();
  $(".main.monitoreo.agricultura").hide();
  $(".main.back").show();
  $(".monitoreo_zocalo").show(); // mostrar zocalo
}

// BOTON VOLVER AL MANDALA LINEAS ESTRATEGICAS
$(".main.back").on("click", function () {
  $(".content.content_energia").slideUp().addClass("slow");
  $(".content.monitoreo").show();
  $(".main.monitoreo.transporte").show();
  $(".main.monitoreo.bosques").show();
  $(".main.monitoreo.industria").show();
  $(".main.monitoreo.infraestructura").show();
  $(".main.monitoreo.agricultura").show();
  $(".main.monitoreo.energia").show();
  $(".main.back").hide();
  $(".monitoreo_zocalo").hide(); // ocultar zocalo
});
