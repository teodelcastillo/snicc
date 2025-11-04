var loading = $("#loading");
var categoryFilter = {};
var linesFilter = [];
var pilaresFilter = [];
var statusFilter = [];
var yearFilter = [];
var prevCategoryFilter = {'cat': 1};
var prevLinesFilter = [];
var prevPilaresFilter = [];
var prevStatusFilter = [];
var prevYearFilter = [];
var graphExclude = '';
var graphExcludeSelect = '';

var jsonDataFilter = null;
var statsLines = {
    'data': {}, 
    'colors': {},
    'keys': []
};
var statsPilares = {
    'data': {}, 
    'colors': {},
    'keys': []
};
var statsStatus = {
    'data': {}, 
    'colors': {},
    'keys': []
};
var statsStackedbar = {
    'keys': {},
    'groups': [],
    'colors': {},
    'columns': {},
    'height': 400
};

var chartLines = null;
var chartPilares = null;
var chartStatus = null;
var chartStackedbar = null;

var chartStatusDetails = null;
var chartsActions = {};

var jsonDataActions = null;

var tooltipGraphs = null;
var actionsSelecteds = [];

var isObjectEmpty = (objectName) => {
    return Object.keys(objectName).length === 0 && objectName.constructor === Object;
}
var actionDetailPopup = new bootstrap.Modal(document.getElementById('action_detail_popup'), {
    keyboard: false
});
var ingeiPopup = new bootstrap.Modal(document.getElementById('ingei_popup'), {
    keyboard: false
});

var contentDetailsJson = null;

/* Grafico lineas y enfoques */
async function loadGraphStatsLines() {   
    const isNoEmpty =  Object.keys(statsLines.data).some(function(d){
        return statsLines.data[d] !== null
    });
    console.log(statsLines.data);
    console.log(isNoEmpty);

    chartLines = await c3.generate({
        bindto: '#chart_lineas_enfoques',
        bar: {
            width: {
                ratio: 1
            },   
        },
        padding: {
            left: 0,
            rigth: 0,
            top: 0,
            bottom: 0
        },
        data: {
            selection: {
                enabled: true
            },
            json: isNoEmpty ? [statsLines.data] : [],
            empty: {
              label: {
                text: "No hay datos disponibles"
              }
            },
            keys: {
                value : statsLines.keys
            },
            type: 'bar',
            colors: statsLines.colors,
            labels: false,
            groups: [
                statsLines.keys
            ],
            order: 'null',
            onclick: async function (d, i) {
                
                if(!isObjectEmpty(categoryFilter)) {
                    if(linesFilter.length != 1 || linesFilter.length == 0) {

                        await chartLines.hide();
                        const newArray = linesFilter.filter(dat => !dat.find(value => value === 'line'));
                        linesFilter = [...newArray];
                        linesFilter.push(['line', linesInputs.indexOf(d.id)+1]);
                        await chartLines?.show(d.id);

                        $('#select_cat_' + categoryFilter.cat).selectpicker('val', [d.id]);
                        $('#select_cat_' + categoryFilter.cat).selectpicker('refresh');
                        $(`.content-slice.first .legend-html [data-id="${d.id}"]`).addClass("selected");
                        
                        graphExclude = 'lines';
                        await updateData('filter');

                    } else if(linesFilter.length == 1) {

                        await chartLines.hide();
                        const newArray = linesFilter.filter(dat => !dat.find(value => value === 'line'));
                        linesFilter = [...newArray];
                        await chartLines?.show(statsLines.keys);

                        $('#select_cat_' + categoryFilter.cat).selectpicker('val', []);
                        $('#select_cat_' + categoryFilter.cat).selectpicker('refresh');
                        $(`.content-slice.first .legend-html .selected`).removeClass("selected");

                        graphExclude = '';
                        await updateData('filter');
                    }
                } else {
                    categoryFilter['cat'] = categoriesInputs.indexOf(d.id);
                    $('#selectpicker_title_bar').selectpicker('val', d.id);
                    $('#selectpicker_select_label').selectpicker('val', d.id);
                    $('#selectpicker_title_stackedbar').selectpicker('val', d.id);
                    $(".selectpickers-lineas").selectpicker('val', []);
                    $(".selectpickers-lineas").removeClass('active').selectpicker('hide');
                    $(`.s-lineas [select-group-id="${d.id}"]`).addClass('active').selectpicker('show');
                    $('.selectpicker').selectpicker('refresh');
                    graphExclude = '';
                    await updateData('filter');
                }
            }
        },
        tooltip: {
            show: true,
            grouped: false,
            format: {
                value: function (value) {return value+' medidas';}
            },
            position: function (data, width, height, element) {
                return {left: 0};
            }
        },
        axis: {
            x: {
                show: false,
                type: 'category',
                padding: {
                    rigth: 0,
                    left: 0,
                    top: 0,
                    bottom: 0
                },
                tick: {
                    centered: true,
                    culling: {
                        max: 1
                    },
                    count: 1,
                    fit: true,
                    outer: false,
                    width: 0,
                    culling: false,
                }
            },
            y: {
                show: false,
                padding: {
                    top: 0,
                    bottom: 0,
                    rigth: 0,
                    left: 0,
                },
                tick: {
                    culling: false,
                    outer: false,
                    width: 0,
                }
            }
        },
        legend: {
            show: false,
        }
    });
}

function addLegendGraphLines() {
    d3.select('.content-slice.first .content-graphs')
    .append('div')
    .attr('class', 'legend-html')
    .selectAll('span')
    .data(statsLines.keys)
    .enter()
    .append('div')
    .attr('data-id', function (id) { return id; })
    .each(function (id) {
        d3.select(this).html(function (id, index) { return `<span class="color-legend" style="background-color:${chartLines.color(id)}"></span><span class="text-legend">${id}${isObjectEmpty(categoryFilter) ? '<i class="bi bi-info-circle graph-circle-info" data-bs-toggle="offcanvas" data-bs-target="#graphiquesInfo" aria-controls="graphiquesInfo" data-graph-info="'+id+'"></i>':''}</span>`; });
        $(".content-slice.first .graph-circle-info").click(function(e) {
            var idTarget = e.target.getAttribute('data-graph-info');
            $('.offcanvas-title-graph, .offcanvas-text-graph').hide();
            $('[data-title-offcanvas-graph="'+idTarget+'"], [data-text-offcanvas-graph="'+idTarget+'"]').show();
            e.stopPropagation();
        });
    })
    .on('mouseover', function (id) {
        if($('.content-slice.first .legend-html .selected').length == 0 || $(`.content-slice.first [data-id="${id}"]`).hasClass('selected')) chartLines.focus(id);
    })
    .on('mouseout', function (id) {
        if($('.content-slice.first .legend-html .selected').length == 0 || $(`.content-slice.first [data-id="${id}"]`).hasClass('selected')) chartLines.revert();
    })
    .on('click', async function (id) {
        if(isObjectEmpty(categoryFilter)) {
            categoryFilter['cat'] = categoriesInputs.indexOf(id);
            $('#selectpicker_title_bar').selectpicker('val', id);
            $('#selectpicker_select_label').selectpicker('val', id);
            $('#selectpicker_title_stackedbar').selectpicker('val', id);
            $(".selectpickers-lineas").selectpicker('val', []);
            $(".selectpickers-lineas").removeClass('active').selectpicker('hide');
            $(`.s-lineas [select-group-id="${id}"]`).addClass('active').selectpicker('show');
            $('.selectpicker').selectpicker('refresh');
            graphExclude = '';
            await updateData('filter');
        } else {
            if(!$(this).hasClass('disabled')) {

                var arrSelectpicker =  [];
                var selectpickerVal = $('#select_cat_'+categoryFilter.cat).selectpicker('val');
                arrSelectpicker = [...selectpickerVal];


                if($(`[data-id="${id}"]`).hasClass("selected")) {
                    const index = arrSelectpicker.indexOf(id);
                    if (index > -1) {
                        arrSelectpicker.splice(index, 1);
                    }
                } else {
                    arrSelectpicker.push(id);
                }

                await chartLines.hide();

                if(arrSelectpicker.length == 0 || arrSelectpicker.length == statsLines.keys.length) {
                    const newArray = linesFilter.filter(dat => !dat.find(value => value === 'line'));
                    linesFilter = [...newArray];
                    await chartLines?.show(statsLines.keys);
                    $(`.content-slice.first .legend-html .selected`).removeClass("selected");
                    $('#select_cat_' + categoryFilter.cat).selectpicker('val', []);
                } else {
                    var indexLineFilter = null;
                    const val = ['line', linesInputs.indexOf(id)+1];
                    if($(`[data-id="${id}"]`).hasClass("selected")) {
                        for (const item of linesFilter) {
                            if (item.toString() == val.toString()) {
                                indexLineFilter = linesFilter.indexOf(item);
                            }
                        }
                        if (indexLineFilter > -1) linesFilter.splice(indexLineFilter, 1);
                        $(`[data-id="${id}"]`).removeClass("selected");
                    } else {
                        linesFilter.push(val);
                        $(`[data-id="${id}"]`).addClass("selected");
                    } 
                    await chartLines.show(arrSelectpicker);
                    $('#select_cat_' + categoryFilter.cat).selectpicker('val', arrSelectpicker);
                }
                $('#select_cat_' + categoryFilter.cat).selectpicker('refresh');

                $('#chart_lineas_enfoques .c3-chart-bars .c3-defocused').removeClass("c3-defocused");

                graphExclude = 'lines';
                updateData('filter');
            }
                
        }
    });

    if(!Object.keys(statsLines.data).some(function(d){return statsLines.data[d] !== null})) {
        statsLines.keys.forEach((id) => {
            $(`[data-id="${id}"]`).addClass("disabled")
            .attr('data-bs-toggle', 'tooltip')
            .attr('data-bs-title', 'No hay medidas')
            .attr('data-bs-placement', 'left');
        });
    } else {
        d3.selectAll("#chart_lineas_enfoques .c3-chart-texts text.c3-text-0")[0].forEach((el, i) => {
            if(el.__data__.value == null) {
                $(`[data-id="${el.__data__.id}"]`).addClass("disabled")
                .attr('data-bs-toggle', 'tooltip')
                .attr('data-bs-title', 'No hay medidas')
                .attr('data-bs-placement', 'left');
                $(el).css('opacity', '0');
            }
        });
    }

}

/*  Grafico Pilares */
function loadGraphStatsPilares() {
    
    chartPilares = c3.generate({
        bindto: '#chart_pilares',
        bar: {
            width: {
                ratio: 1
            }
        },
        padding: {
            left: 0,
            rigth: 0,
            top: 0,
            bottom: 0
        },
        data: {
            selection: {
                enabled: true 
            },
            json: [statsPilares.data],
            empty: {
              label: {
                text: "No hay datos disponibles"
              }
            },
            keys: {
                value : statsPilares.keys
            },
            type: 'bar',
            colors: statsPilares.colors,
            labels: {
                format: function (v) {
                    return ''
                }
            },
            order: 'null',
            onclick: async function (d, i) {
                if(pilaresFilter.length != 1 || pilaresFilter.length == 0) {

                    await chartPilares.hide();
                    const newArray = pilaresFilter.filter(dat => !dat.find(value => value === 'pilar'));
                    pilaresFilter = [...newArray];
                    pilaresFilter.push(['pilar', pilaresInputs.indexOf(d.id)+1]);
                    await chartPilares.show(d.id);

                    $('#select_pilares').selectpicker('val', [d.id]);
                    $('#select_pilares').selectpicker('refresh');
                    $(`.content-slice.second .legend-html [data-id="${d.id}"]`).addClass("selected");

                    graphExclude = 'pilares';
                    await updateData('filter');

                } else if(pilaresFilter.length == 1) {

                    await chartPilares.hide();
                    const newArray = pilaresFilter.filter(dat => !dat.find(value => value === 'pilar'));
                    pilaresFilter = [...newArray];
                    await chartPilares.show(statsPilares.keys);

                    $('#select_pilares').selectpicker('val', []);
                    $('#select_pilares').selectpicker('refresh');
                    $(`.content-slice.second .legend-html .selected`).removeClass("selected");

                    graphExclude = '';
                    await updateData('filter');

                }

            }
        },
        tooltip: {
            show: true,
            grouped: false,
            format: {
                value: function (value) {return value+' medidas';}
            }
        },
        axis: {
            x: {
                show: false,
                type: 'category',
                padding: {
                    rigth: 0,
                    left: 0,
                    top: 0,
                    bottom: 0
                },
                tick: {
                    centered: true,
                    culling: {
                        max: 1
                    },
                    count: 1,
                    fit: true,
                    outer: false,
                    width: 0,
                    culling: false,
                }
            },
            y: {
                show: false,
                padding: {
                    top: 0,
                    bottom: 0,
                    rigth: 0,
                    left: 0,
                },
                tick: {
                    culling: false,
                    outer: false,
                    width: 0,
                }
            }
        },
        legend: {
            show: false
        }    
    });

}

function addLegendGraphPilares() {
    d3.select('.content-slice.second .content-graphs')
    .append('div')
    .attr('class', 'legend-html')
    .selectAll('span')
    .data(statsPilares.keys)
    .enter()
    .append('div')
    .attr('data-id', function (id) { return id; })
    .each(function (id) {
        d3.select(this).html(function (id, index) { return `<span class="color-legend" style="background-color:${chartPilares.color(id)}"></span><span class="text-legend">${id}${id == 'Adaptación' || id == 'Mitigación' || id == 'Pérdidas y daños'? '<i class="bi bi-info-circle graph-circle-info" data-bs-toggle="offcanvas" data-bs-target="#graphiquesInfo" aria-controls="graphiquesInfo" data-graph-info="'+id+'"></i>':''}</span>`; });
        $(".content-slice.second .graph-circle-info").click(function(e) {
            var idTarget = e.target.getAttribute('data-graph-info');
            $('.offcanvas-title-graph, .offcanvas-text-graph').hide();
            $('[data-title-offcanvas-graph="'+idTarget+'"], [data-text-offcanvas-graph="'+idTarget+'"]').show();
            e.stopPropagation();
        });
    })
    .on('mouseover', function (id) {
        if(($('.content-slice.second .legend-html .selected').length == 0 || $(`.content-slice.second [data-id="${id}"]`).hasClass('selected')) && !$(`.content-slice.second [data-id="${id}"]`).hasClass('disabled')) chartPilares.focus(id);
    })
    .on('mouseout', function (id) {
        if(($('.content-slice.second .legend-html .selected').length == 0 || $(`.content-slice.second [data-id="${id}"]`).hasClass('selected')) && !$(`.content-slice.second [data-id="${id}"]`).hasClass('disabled')) chartPilares.revert();
    })
    .on('click', async function (id) {


        if(!$(this).hasClass('disabled')) {

            var arrSelectpicker =  [];
            var selectpickerVal = $('#select_pilares').selectpicker('val');
            arrSelectpicker = [...selectpickerVal];


            if($(`[data-id="${id}"]`).hasClass("selected")) {
                const index = arrSelectpicker.indexOf(id);
                if (index > -1) {
                    arrSelectpicker.splice(index, 1);
                }
            } else {
                arrSelectpicker.push(id);
            }

            await chartPilares.hide();
            
            if(arrSelectpicker.length == 0 || arrSelectpicker.length == statsPilares.keys.length) {
                const newArray = pilaresFilter.filter(dat => !dat.find(value => value === 'pilar'));
                pilaresFilter = [...newArray];
                await chartPilares?.show(statsPilares.keys);
                $(`.content-slice.second .legend-html .selected`).removeClass("selected");
                $('#select_pilares').selectpicker('val', []);
            } else {
                var indexPilarFilter = null;
                const val = ['pilar', pilaresInputs.indexOf(id)+1];
                if($(`[data-id="${id}"]`).hasClass("selected")) {
                    for (const item of pilaresFilter) {
                        if (item.toString() == val.toString()) {
                            indexPilarFilter = pilaresFilter.indexOf(item);
                        }
                    }
                    if (indexPilarFilter > -1) pilaresFilter.splice(indexPilarFilter, 1);
                    $(`[data-id="${id}"]`).removeClass("selected");
                    $(`[data-id-sbc="${id}"]`).removeClass("selected");
                } else {
                    pilaresFilter.push(val);
                    $(`[data-id="${id}"]`).addClass("selected");
                    $(`[data-id-sbc="${id}"]`).addClass("selected");
                } 
                await chartPilares.show(arrSelectpicker);
                $('#select_pilares').selectpicker('val', arrSelectpicker);
            }
            $('#select_pilares').selectpicker('refresh');

            $('#chart_pilares .c3-chart-bars .c3-defocused').removeClass("c3-defocused");

            graphExclude = 'pilares';
            updateData('filter');
        }
    });
    
    d3.selectAll("#chart_pilares .c3-chart-texts text.c3-text")[0].forEach((el, i) => {
        if(el.__data__.value == null) {
            $(`[data-id="${el.__data__.id}"]`).addClass("disabled")
            .attr('data-bs-toggle', 'tooltip')
            .attr('data-bs-title', 'No hay medidas')
            .attr('data-bs-placement', 'right');
            chartPilares.unload(el.__data__.id);
        }
    });
}

/*  Grafico estado implementacion */
function loadGraphStatsStatus() {

    chartStatus = c3.generate({
        bindto: '#chart_semaforo',
        bar: {
            width: {
                ratio: 1
            }
        },
        donut: {
            label: {
                format: function (value, ratio) {
                  return value;
                }
            },
            threshold: 0.1,
            expand: false,
        },
        padding: {
            left: 0,
            rigth: 0,
            top: 0,
            bottom: 0
        },
        data: {
            selection: {
                enabled: false
            },
            json: [statsStatus.data],
            empty: {
              label: {
                text: "No hay datos disponibles"
              }
            },
            keys: {
                value : statsStatus.keys
            },
            type : 'donut',
            colors: statsStatus.colors,
            labels: true,
            order: 'null',
            onclick: async function (d, i) {
                if(statusFilter.length != 1 || statusFilter.length == 0) {

                    await chartStatus.hide();
                    const newArray = statusFilter.filter(dat => !dat.find(value => value === 'status'));
                    statusFilter = [...newArray];
                    statusFilter.push(['status', d.id]);
                    await chartStatus.show(d.id);

                    $('#select_estado').selectpicker('val', [d.id]);
                    $('#select_estado').selectpicker('refresh');
                    $(`.content-slice.third .legend-html [data-id="${d.id}"]`).addClass("selected");

                    graphExclude = 'status';
                    await updateData('filter');
             
                } else if(statusFilter.length == 1) {
                    
                    await chartStatus.hide();
                    const newArray = statusFilter.filter(dat => !dat.find(value => value === 'status'));
                    statusFilter = [...newArray];
                    await chartStatus.show(statsStatus.keys);

                    $('#select_estado').selectpicker('val', []);
                    $('#select_estado').selectpicker('refresh');
                    $(`.content-slice.third .legend-html .selected`).removeClass("selected");

                    graphExclude = '';
                    await updateData('filter');
                    
                }

            },
            onmouseover: function (d, i) {
            },
            onmouseout: function (d, i) {
            }
        },
        tooltip: {
            show: true,
            grouped: false,
            format: {
                value: function (value) {return value+' medidas';}
            }
        },
        legend: {
            show: false,
            position: 'bottom'
        }
    });
    
}

function addLegendGraphStatus() {
    d3.select('.content-slice.third .content-graphs')
    .append('div')
    .attr('class', 'legend-html')
    .selectAll('span')
    .data(statsStatus.keys)
    .enter()
    .append('div')
    .attr('data-id', function (id) { return id; })
    .each(function (id) {
        d3.select(this).html(function (id, index) { return `<span class="color-legend" style="background-color:${chartStatus.color(id)}"></span><span class="text-legend">${(id == 'En implementación avanzada' ? 'Avanzada': id == 'En implementación inicial' ? 'Inicial' : id)}</span>`; });
    })
    .on('mouseover', function (id) {
        if(($('.content-slice.third .legend-html .selected').length == 0 || $(`.content-slice.third [data-id="${id}"]`).hasClass('selected')) && !$(`.content-slice.third [data-id="${id}"]`).hasClass('disabled')) chartStatus.focus(id);
    })
    .on('mouseout', function (id) {
        if(($('.content-slice.third .legend-html .selected').length == 0 || $(`.content-slice.third [data-id="${id}"]`).hasClass('selected')) && !$(`.content-slice.third [data-id="${id}"]`).hasClass('disabled')) chartStatus.revert();
    })
    .on('click', async function (id) {

        if(!$(this).hasClass('disabled')) {

            var arrSelectpicker =  [];
            var selectpickerVal = $('#select_estado').selectpicker('val');
            arrSelectpicker = [...selectpickerVal];


            if($(`[data-id="${id}"]`).hasClass("selected")) {
                const index = arrSelectpicker.indexOf(id);
                if (index > -1) {
                    arrSelectpicker.splice(index, 1);
                }
            } else {
                arrSelectpicker.push(id);
            }

            await chartStatus.hide();

            if(arrSelectpicker.length == 0 || arrSelectpicker.length == statsStatus.keys.length) {
                const newArray = statusFilter.filter(dat => !dat.find(value => value === 'status'));
                statusFilter = [...newArray];
                await chartStatus?.show(statsStatus.keys);
                await $(`.content-slice.third .legend-html .selected`).removeClass("selected");
                await $('#select_estado').selectpicker('val', []);
            } else {
                var indexStatusFilter = null;
                const val = ['status', id];
                if($(`[data-id="${id}"]`).hasClass("selected")) {
                    for (const item of statusFilter) {
                        if (item.toString() == val.toString()) {
                            indexStatusFilter = statusFilter.indexOf(item);
                        }
                    }
                    if (indexStatusFilter > -1) statusFilter.splice(indexStatusFilter, 1);
                    $(`[data-id="${id}"]`).removeClass("selected");
                    $(`[data-id-sbc="${id}"]`).removeClass("selected");
                } else {
                    statusFilter.push(val);
                    $(`[data-id="${id}"]`).addClass("selected");
                    $(`[data-id-sbc="${id}"]`).addClass("selected");
                } 
                await chartStatus.show(arrSelectpicker);
                await $('#select_estado').selectpicker('val', arrSelectpicker);
            }
            await $('#select_estado').selectpicker('refresh');

            await $('#chart_semaforo .c3-chart-bars .c3-defocused').removeClass("c3-defocused");

            graphExclude = 'status';
            await updateData('filter');
        } 

    });

    d3.selectAll("#chart_semaforo .c3-chart-arcs .c3-chart-arc > text")[0].forEach((el, i) => {
        if(el.__data__.value == null || el.__data__.value == 0) {
            $(`[data-id="${el.__data__.data.id}"]`).addClass("disabled")
            .attr('data-bs-toggle', 'tooltip')
            .attr('data-bs-title', 'No hay medidas')
            .attr('data-bs-placement', 'top');
            chartStatus.unload(el.__data__.data.id);
        }
    });
}

async function loadDetailStatusGraph() {
    var totalMeasures = await getTotalMeasures();

    chartStatusDetails = c3.generate({
        bindto: '#chart_status_measures',
        donut: {
            label: {
                format: function (value, ratio) {
                  return value;
                },
                threshold: 0.1
            },
            expand: false,
            title: ''
        },
        data: {
            selection: {
                enabled: false
            },
            json: [jsonDataActions.status.data],
            empty: {
              label: {
                text: "No hay datos disponibles"
              }
            },
            keys: {
                value : jsonDataActions.status.keys
            },
            type : 'donut',
            colors: jsonDataActions.status.colors,
            labels: true,
            order: 'null',
            onclick: async function (d, i) {
            },
            onmouseover: function (d, i) {
            },
            onmouseout: function (d, i) {
            }
        },
        /*onrendered: async () => {
            //if(document.getElementById("content_status_graph").clientWidth > 300) {
                await d3.select("#chart_status_measures .c3-chart-arcs .c3-chart-arcs-title").attr('transform', 'translate(0, -6)').html('<tspan x="0" dy=".6em">'+totalMeasures+'</tspan><tspan x="0" dy="1.2em">medidas</tspan>');
            //}
        },*/
        tooltip: {
            show: true,
            grouped: false,
            format: {
                value: function (value) {return value+' medidas';}
            }
        },
        legend: {
            show: false,
            position: 'bottom'
        }
    });
    setTimeout(async function () {
        await d3.select("#chart_status_measures .c3-chart-arcs .c3-chart-arcs-title").attr('transform', 'translate(0, -6)').html('<tspan x="0" dy=".6em">'+totalMeasures+'</tspan><tspan x="0" dy="1.2em">medidas</tspan>');
    }, 200);
}

async function getActionsSelectedsDataGraph() {
    const countObj = actionsSelecteds.reduce((acc, curr) => {
        return {
            ["A definir"]: acc["A definir"] + curr.stats_simple["A definir"],
            ["En implementación avanzada"]: acc["En implementación avanzada"] + curr.stats_simple["En implementación avanzada"],
            ["En implementación inicial"]: acc["En implementación inicial"] + curr.stats_simple["En implementación inicial"],
            ["En programación"]: acc["En programación"] + curr.stats_simple["En programación"]
        };
    }, {
        ["A definir"]: 0,
        ["En implementación avanzada"]: 0,
        ["En implementación inicial"]: 0,
        ["En programación"]: 0
    });
    return countObj;
}

async function getTotalMeasures() {
    return actionsSelecteds.length ? await actionsSelecteds.reduce((n, {total}) => n + total, 0): await jsonDataActions.actions.reduce((n, {total}) => n + total, 0);
}

async function updateDetailStatusGraph() {
    var data = {};
    var totalMeasures = await getTotalMeasures();
    if(actionsSelecteds.length) {
        data = await getActionsSelectedsDataGraph();
    } else {
        data = jsonDataActions.status.data;
    }
    await chartStatusDetails.unload();
    await chartStatusDetails.load({
        json: [
            data
        ],
        keys: {
            value: jsonDataActions.status.keys,
        },
        transition: {
            duration: 200
        }
    });
    
    setTimeout(async function () {
        d3.select("#chart_status_measures .c3-chart-arcs .c3-chart-arcs-title").attr('transform', 'translate(0, -6)').html('<tspan x="0" dy=".6em">'+totalMeasures+'</tspan><tspan x="0" dy="1.2em">medidas</tspan>');
    }, 200);
}


/* Grafico Stackedbar Lineas y enfoques */
function loadGraphStatsStackedBar() {
    const widthWindow = document.body.clientWidth;
    const isEmptyStacked = statsStackedbar.keys.length == 1;

    chartStackedbar = c3.generate({
        bindto: '#stacked_bar_chart',
        bar: {
            width: 25,
            space: 0.5
        },
        size: {
            width: isEmptyStacked ? undefined : widthWindow <= 1024 ? widthWindow - 80 : undefined,
            height: isEmptyStacked ? 240 : widthWindow <= 480 ? statsStackedbar.height + (statsStackedbar.keys.length*35) : widthWindow <= 1024 ? statsStackedbar.height + (statsStackedbar.keys.length*20) : statsStackedbar.height
        },
        padding: {
            left: isEmptyStacked ? 0 : widthWindow <= 1024 ? 0 : widthWindow <= 1680 ? 260 : 300,
            bottom: 0,
            top: 5
        },
        data: {
            stack: {
                normalize: true
            },
            x: 'x',
            empty: {
                label: {
                  text: "No hay datos disponibles"
                }
            },
            columns: statsStackedbar.values,
            selection: {
                enabled: true,
                multiple: true,
                draggable: true
            },
            groups: statsStackedbar.groups,
            type: 'bar',
            colors: statsStackedbar.colors,
            labels: true,
            order: statsStackedbar.groups,
            onclick: async function (d, i) {

                if(statsStackedbar.groups[0].some(v => d.id.includes(v))) {
                    // Pilares
                    if(pilaresFilter.length != 1 || pilaresFilter.length == 0) {
                        await chartPilares.hide();
                        const newArray = pilaresFilter.filter(dat => !dat.find(value => value === 'pilar'));
                        pilaresFilter = [...newArray];
                        pilaresFilter.push(['pilar', pilaresInputs.indexOf(d.id)+1]);

                        await chartPilares.show(d.id);
    
                        $('#select_pilares').selectpicker('val', [d.id]);
                        $('#select_pilares').selectpicker('refresh');
                        $(`#stacked_bar_chart_legends .legend-html [data-id-sbc="${d.id}"]`).addClass("selected");
                        $(`.content-slice.second .legend-html [data-id="${d.id}"]`).addClass("selected");
    
                        graphExclude = 'pilares';
                        await updateData('filter');
    
                    } else if(pilaresFilter.length == 1) {
    
                        await chartPilares.hide();
                        const newArray = pilaresFilter.filter(dat => !dat.find(value => value === 'pilar'));
                        pilaresFilter = [...newArray];

                        await chartPilares.show(statsPilares.keys);
    
                        $('#select_pilares').selectpicker('val', []);
                        $('#select_pilares').selectpicker('refresh');
                        $(`#stacked_bar_chart_legends .legend-left .legend-html .selected`).addClass("selected");
                        $(`.content-slice.second .legend-html .selected`).removeClass("selected");
    
                        graphExclude = '';
                        await updateData('filter');
    
                    }

                } else if (statsStackedbar.groups[1].some(v => d.id.includes(v))) {
                    // Status
                    if(statusFilter.length != 1 || statusFilter.length == 0) {
                        await chartStatus.hide();
                        const newArray = statusFilter.filter(dat => !dat.find(value => value === 'status'));
                        statusFilter = [...newArray];
                        statusFilter.push(['status', d.id]);
    
                        await chartStatus.show(d.id);
    
                        $('#select_estado').selectpicker('val', [d.id]);
                        $('#select_estado').selectpicker('refresh');
                        $(`#stacked_bar_chart_legends .legend-html [data-id-sbc="${d.id}"]`).addClass("selected");
                        $(`.content-slice.third .legend-html [data-id="${d.id}"]`).addClass("selected");

                        graphExclude = 'status';
                        await updateData('filter');
                 
                    } else if(statusFilter.length == 1) {
                        await chartStatus.hide();
                        const newArray = statusFilter.filter(dat => !dat.find(value => value === 'status'));
                        statusFilter = [...newArray];
                        await chartStatus.show(statsStatus.keys);
    
                        $('#select_estado').selectpicker('val', []);
                        $('#select_estado').selectpicker('refresh');
                        $(`#stacked_bar_chart_legends .legend-right .legend-html .selected`).removeClass("selected");
                        $(`.content-slice.third .legend-html .selected`).removeClass("selected");

                        graphExclude = '';
                        await updateData('filter');
                        
                    }

                }
            },
        },
        grid: {
            y: {
                show: false
            },
            x: {
                show: false
            }
        },
        onrendered: () => {
            placeTextStackedbarToCenter();
        },
        axis: {
            rotated: true,
            x: {
                type: 'category',
                tick: {
                    centered: 0,
                    multiline: true,
                    width: isEmptyStacked ? 0 : widthWindow <= 480 ? 180 : widthWindow <= 1024 ? 350: widthWindow <= 1680 ? 180 : 215,
                },
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                }
            },
            y: {
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                }
            }
        },
        tooltip: {
            show: true,
            grouped: false,
        },
        legend: {
            show: false
        },
        transition: {
            duration: 100
        }
    });
    if(widthWindow <= 480) {
        placeAxisStackedbarToTopTwoLines();
    } else {
        placeAxisStackedbarToTop();
    }
    setTimeout(() => {
        chartStackedbar.flush();
    }, 200);

}
function addLegendGraphStackedbar() {
    d3.select('#stacked_bar_chart_legends .legend-left')
    .insert('div', 'c3-title')
    .attr('class', 'legend-html')
    .selectAll('span')
    .data(statsStackedbar.groups[0])
    .enter()
    .append('div')
    .attr('data-id-sbc', function (id) { return id; })
    .attr('class', function (id) { return $('#select_pilares').selectpicker('val').includes(id) ? 'selected': '';})
    .each(function (id) {
        d3.select(this).html(function (id, index) { return `<span class="color-legend" style="background-color:${chartStackedbar.color(id)}"></span><span class="text-legend"${id.length > 22 ? `data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="${id}"`:''}>${id}${id == 'Adaptación' || id == 'Mitigación' || id == 'Pérdidas y daños'? '<i class="bi bi-info-circle graph-circle-info" data-bs-toggle="offcanvas" data-bs-target="#graphiquesInfo" aria-controls="graphiquesInfo" data-graph-info="'+id+'"></i>':''}</span>`; });
        $("#stacked_bar_chart_legends .graph-circle-info").click(function(e) {
            var idTarget = e.target.getAttribute('data-graph-info');
            $('.offcanvas-title-graph, .offcanvas-text-graph').hide();
            $('[data-title-offcanvas-graph="'+idTarget+'"], [data-text-offcanvas-graph="'+idTarget+'"]').show();
            e.stopPropagation();
        });
    })
    .on('mouseover', function (id) {
        if(($('#stacked_bar_chart_legends .legend-left .legend-html .selected').length == 0 || $(`#stacked_bar_chart_legends .legend-left [data-id-sbc="${id}"]`).hasClass('selected')) && !$(`#stacked_bar_chart_legends .legend-left [data-id-sbc="${id}"]`).hasClass('disabled')) chartStackedbar.focus(id);
    })
    .on('mouseout', function (id) {
        if(($('#stacked_bar_chart_legends .legend-left .legend-html .selected').length == 0 || $(`#stacked_bar_chart_legends .legend-left [data-id-sbc="${id}"]`).hasClass('selected')) && !$(`#stacked_bar_chart_legends .legend-left [data-id-sbc="${id}"]`).hasClass('disabled')) chartStackedbar.revert();
    })
    .on('click', async function (id) {

        if(!$(this).hasClass('disabled')) {

            var arrSelectpicker =  [];
            var selectpickerVal = $('#select_pilares').selectpicker('val');
            arrSelectpicker = [...selectpickerVal];


            if($(`[data-id="${id}"]`).hasClass("selected")) {
                const index = arrSelectpicker.indexOf(id);
                if (index > -1) {
                    arrSelectpicker.splice(index, 1);
                }
            } else {
                arrSelectpicker.push(id);
            }

            await chartPilares.hide();
            await chartStackedbar.hide(statsStackedbar.groups[0]);
            
            if(arrSelectpicker.length == 0 || arrSelectpicker.length == statsPilares.keys.length) {
                const newArray = pilaresFilter.filter(dat => !dat.find(value => value === 'pilar'));
                pilaresFilter = [...newArray];
                await chartPilares?.show(statsPilares.keys);
                await chartStackedbar?.show(statsPilares.keys);
                $(`.content-slice.second .legend-html .selected`).removeClass("selected");
                $(`#stacked_bar_chart_legends .legend-left .legend-html .selected`).removeClass("selected");
                $('#select_pilares').selectpicker('val', []);
            } else {
                var indexPilarFilter = null;
                const val = ['pilar', pilaresInputs.indexOf(id)+1];
                if($(`[data-id="${id}"]`).hasClass("selected")) {
                    for (const item of pilaresFilter) {
                        if (item.toString() == val.toString()) {
                            indexPilarFilter = pilaresFilter.indexOf(item);
                        }
                    }
                    if (indexPilarFilter > -1) pilaresFilter.splice(indexPilarFilter, 1);
                    $(`[data-id="${id}"]`).removeClass("selected");
                    $(`[data-id-sbc="${id}"]`).removeClass("selected");
                } else {
                    pilaresFilter.push(val);
                    $(`[data-id="${id}"]`).addClass("selected");
                    $(`[data-id-sbc="${id}"]`).addClass("selected");
                } 
                await chartPilares.show(arrSelectpicker);
                await chartStackedbar.show(arrSelectpicker);
                $('#select_pilares').selectpicker('val', arrSelectpicker);
            }
            await $('#select_pilares').selectpicker('refresh');

            await $('#chart_pilares .c3-chart-bars .c3-defocused').removeClass("c3-defocused");
            await $('#stacked_bar_chart .c3-chart-bars .c3-defocused').removeClass("c3-defocused");

            graphExclude = 'pilares';
            updateData('filter');
        }
    });

    d3.select('#stacked_bar_chart_legends .legend-right')
    .insert('div', 'c3-title')
    .attr('class', 'legend-html')
    .selectAll('span')
    .data(statsStackedbar.groups[1])
    .enter()
    .append('div')
    .attr('data-id-sbc', function (id) { return id; })
    .attr('class', function (id) { return $('#select_estado').selectpicker('val').includes(id) ? 'selected': '';})
    .each(function (id) {
        d3.select(this).html(function (id, index) { return `<span class="color-legend" style="background-color:${chartStackedbar.color(id)}"></span><span class="text-legend">${(id == 'En implementación avanzada' ? 'Avanzada': id == 'En implementación inicial' ? 'Inicial' : id)}</span>`; });
    })
    .on('mouseover', function (id) {
        if(($('#stacked_bar_chart_legends .legend-right .legend-html .selected').length == 0 || $(`#stacked_bar_chart_legends .legend-right [data-id-sbc="${id}"]`).hasClass('selected')) && !$(`#stacked_bar_chart_legends .legend-right [data-id-sbc="${id}"]`).hasClass('disabled')) chartStackedbar.focus(id);
    })
    .on('mouseout', function (id) {
        if(($('#stacked_bar_chart_legends .legend-right .legend-html .selected').length == 0 || $(`#stacked_bar_chart_legends .legend-right [data-id-sbc="${id}"]`).hasClass('selected')) && !$(`#stacked_bar_chart_legends .legend-right [data-id-sbc="${id}"]`).hasClass('disabled')) chartStackedbar.revert();
    })
    .on('click', async function (id) {

        if(!$(this).hasClass('disabled')) {

            var arrSelectpicker =  [];
            var selectpickerVal = $('#select_estado').selectpicker('val');
            arrSelectpicker = [...selectpickerVal];


            if($(`[data-id="${id}"]`).hasClass("selected")) {
                const index = arrSelectpicker.indexOf(id);
                if (index > -1) {
                    arrSelectpicker.splice(index, 1);
                }
            } else {
                arrSelectpicker.push(id);
            }

            await chartStatus.hide();
            await chartStackedbar.hide(statsStackedbar.groups[1]);

            if(arrSelectpicker.length == 0 || arrSelectpicker.length == statsStatus.keys.length) {
                const newArray = statusFilter.filter(dat => !dat.find(value => value === 'status'));
                statusFilter = [...newArray];
                await chartStatus?.show(statsStatus.keys);
                await $(`.content-slice.third .legend-html .selected`).removeClass("selected");
                $(`#stacked_bar_chart_legends .legend-right .legend-html .selected`).removeClass("selected");
                await $('#select_estado').selectpicker('val', []);
            } else {
                var indexStatusFilter = null;
                const val = ['status', id];
                if($(`[data-id="${id}"]`).hasClass("selected")) {
                    for (const item of statusFilter) {
                        if (item.toString() == val.toString()) {
                            indexStatusFilter = statusFilter.indexOf(item);
                        }
                    }
                    if (indexStatusFilter > -1) statusFilter.splice(indexStatusFilter, 1);
                    $(`[data-id="${id}"]`).removeClass("selected");
                    $(`[data-id-sbc="${id}"]`).removeClass("selected");
                } else {
                    statusFilter.push(val);
                    $(`[data-id="${id}"]`).addClass("selected");
                    $(`[data-id-sbc="${id}"]`).addClass("selected");
                } 
                await chartStatus.show(arrSelectpicker);
                await chartStackedbar.show(arrSelectpicker);
                await $('#select_estado').selectpicker('val', arrSelectpicker);
            }
            await $('#select_estado').selectpicker('refresh');

            await $('#stacked_bar_chart .c3-chart-bars .c3-defocused').removeClass("c3-defocused");

            graphExclude = 'status';
            await updateData('filter');
        } 

    });

    for (const [key, value] of Object.entries(statsPilares.data)) {
        if(value == null) {
            $(`[data-id-sbc="${key}"]`).addClass("disabled")
            .attr('data-bs-toggle', 'tooltip')
            .attr('data-bs-title', 'No hay medidas')
            .attr('data-bs-placement', 'top');
        }
    }
    for (const [key, value] of Object.entries(statsStatus.data)) {
        if(value == null) {
            $(`[data-id-sbc="${key}"]`).addClass("disabled")
            .attr('data-bs-toggle', 'tooltip')
            .attr('data-bs-title', 'No hay medidas')
            .attr('data-bs-placement', 'top');
        }
    }
}

function placeTextStackedbarToCenter() {
    centersText = d3.selectAll("#stacked_bar_chart .c3-chart-bars .c3-bar")[0].map((el) => el.getBBox().width / 2 + 10 );
    d3.selectAll("#stacked_bar_chart .c3-chart-texts text.c3-text")[0].forEach((el, i) => {
        d3.select(el).attr('transform', `translate(-${centersText[i]}, 0)`);
    });
}

async function placeAxisStackedbarToTop() {
    if(chartStackedbar != null) {
        if($(".tick-text").length) await $( ".tick-text" ).remove();
        var stackedbarTitles = [...statsStackedbar.keys];
        stackedbarTitles.splice(0, 1);
        d3.selectAll("#stacked_bar_chart .c3-axis.c3-axis-x .tick")[0].forEach((el, i) => {
            d3.select("#stacked_bar_chart .c3-chart-texts")
            .append("g").attr("class", "tick-text").attr('transform', d3.select(el).attr("transform"))
            .append("text").attr('x', d3.select(el).select("text").attr("x")).attr('y', d3.select(el).select("text").attr("y"))
            .text(stackedbarTitles[i]);
        });
    }
}

async function placeAxisStackedbarToTopTwoLines() {
    if(chartStackedbar != null) {
        if($(".tick-text").length) await $( ".tick-text" ).remove();
        var stackedbarTitles = [...statsStackedbar.keys];
        stackedbarTitles.splice(0, 1);
        d3.selectAll("#stacked_bar_chart .c3-axis.c3-axis-x .tick")[0].forEach((el, i) => {
            d3.select("#stacked_bar_chart .c3-chart-texts")
            .append("g").attr("class", "tick-text").attr('transform', d3.select(el).attr("transform"))
            .append("text").attr('x', d3.select(el).select("text").attr("x")).attr('y', d3.select(el).select("text").attr("y"))
            .node().innerHTML = d3.select(el).select("text").node().innerHTML;
        });
    }
}

function toogleGroups(index, action, el) {
    const group = statsStackedbar.groups[index];
    if(action == 'show') {
        chartStackedbar?.show(group);
    } else {
        chartStackedbar?.hide(group);
    }
    $(el).removeClass("active");
    $(`#${action == 'show' ? 'hide':'show'}_${index}`).addClass("active");
}


function hideTooltip(chartId) {
    d3.select(`#${chartId} .c3-tooltip-container`).style('display', 'none');
}

function clone(selector) {
    var node = d3.select(selector).node();
    return d3.select(node.parentNode.insertBefore(node.cloneNode(true), node.nextSibling));
}

async function placeTextLineasEnfoquesToLeft() {
    if(chartLines != null) {
        centers = d3.selectAll("#chart_lineas_enfoques .c3-chart-bars .c3-bar")[0].map((el) => el.getBBox().height/2);
        left = d3.select("#chart_lineas_enfoques .c3-chart-bars .c3-bar")[0][0].getBBox().width/2+16;
        d3.selectAll("#chart_lineas_enfoques .c3-chart-texts text.c3-text-0")[0].forEach((el, i) => {
            d3.select(el)
            .attr('transform', `translate(0, ${centers[i]})`);

            if($(`#chart_lineas_enfoques text[c3-id="${el.__data__.id}"]`).length) {
                d3.select(`#chart_lineas_enfoques text[c3-id='${el.__data__.id}']`).attr('transform', `translate(-${left}, ${centers[i]})`);
                d3.select(el).attr('transform', `translate(0, ${centers[i]})`);
            } else {
                clone(el).attr('transform', `translate(-${left}, ${centers[i]})`).attr('class', 'c3-text c3-text-clone').html(statsLines.data[statsLines.keys[i]]).
                attr('c3-id', el.__data__.id);
            }
        });
    }
}

async function placeTextStatusMeasures() {
    if(document.getElementById("content_status_graph").clientWidth > 300) {
        d3.select("#chart_status_measures .c3-chart-arcs .c3-chart-arcs-title").attr('transform', 'translate(0, -6)').html('<tspan x="0" dy=".6em">'+totalMeasures+'</tspan><tspan x="0" dy="1.2em">medidas</tspan>');
    }
}

async function resizeBarsGraph() {
    /*const isEmptyLines =  !$("#chart_lineas_enfoques .c3-text.c3-empty").attr("style");
    const isEmptyPilares =  !$("#chart_pilares .c3-text.c3-empty").attr("style");
    const isEmptyStatus =  !$("#chart_semaforo .c3-text.c3-empty").attr("style");*/
    const isNoEmptyLines =  Object.keys(statsLines.data).some(function(d){
        return statsLines.data[d] !== null
    });
    const isNoEmptyPilares =  Object.keys(statsPilares.data).some(function(d){
        return statsPilares.data[d] !== null
    });
    const isNoEmptyStatus =  Object.keys(statsLines.data).some(function(d){
        return statsLines.data[d] !== null
    });
    console.log(isNoEmptyLines);
    console.log(isNoEmptyPilares);
    console.log(isNoEmptyStatus);

    if(!isNoEmptyLines || !isNoEmptyPilares || !isNoEmptyStatus) {
        await $("#chart_lineas_enfoques").addClass("empty-graph");
        await $("#chart_pilares").addClass("empty-graph");
        await $("#chart_semaforo").addClass("empty-graph");
        await chartStatus?.resize({height: 240, width: 240});
        await chartPilares?.resize({height: 240, width: 240});
        await chartLines?.resize({height: 240, width: 240});
    } else {
        const widthWindow = document.body.clientWidth;
        $("#chart_lineas_enfoques").removeClass("empty-graph");
        $("#chart_pilares").removeClass("empty-graph");
        $("#chart_semaforo").removeClass("empty-graph");
        if(widthWindow <= 480) {
            await chartStatus?.resize({height: widthWindow - 185, width: widthWindow - 185});
            await chartPilares?.resize({height: 240, width: widthWindow - 80});
            await chartLines?.resize({height: 240, width: widthWindow/4});
        } else if(widthWindow <= 768) {
            await chartStatus?.resize({height: 240, width: 240});
            await chartPilares?.resize({height: 240, width: widthWindow - 80});
            await chartLines?.resize({height: 240, width: 70});
        } else if(widthWindow <= 1024) {
            await chartStatus?.resize({height: 200, width: 200});
            await chartPilares?.resize({height: 240, width: pilaresFilter.length == 0 || pilaresFilter.length > 5 ? 240: pilaresFilter.length * 40});
            await chartLines?.resize({height: 240, width: widthWindow/7});
        } else if(widthWindow <= 1680) {
            await chartStatus?.resize({height: 200, width: 200});
            await chartPilares?.resize({height: 240, width: pilaresFilter.length == 0 || pilaresFilter.length > 5 ? 240: pilaresFilter.length * 40});
            await chartLines?.resize({height: 240, width: 50});
        } else {
            await chartStatus?.resize({height: 240, width: 240});
            await chartPilares?.resize({height: 240, width: pilaresFilter.length == 0 || pilaresFilter.length > 5 ? 360: pilaresFilter.length * 60});
            await chartLines?.resize({height: 240, width: 70});
        }
    }
}
async function resizeStackedBarGraph() {
    if(statsStackedbar.keys.length == 1) {
        await $("#stacked_bar_chart").addClass("empty-graph");
        chartStackedbar?.resize({height: 240, width: undefined});
        chartStackedbar.internal.config.axis_x_tick_width = 0;
        chartStackedbar.internal.config.padding_left = 0;
    } else {
        $("#stacked_bar_chart").removeClass("empty-graph");
        const widthWindow = document.body.clientWidth;
        await chartStackedbar?.resize({
            width: widthWindow <= 1024 ? widthWindow - 80 : undefined,
            height: widthWindow <= 480 ? statsStackedbar.height + (statsStackedbar.keys.length*35) : widthWindow <= 1024 ? statsStackedbar.height + (statsStackedbar.keys.length*20) : statsStackedbar.height
        });
        chartStackedbar.internal.config.axis_x_tick_width = widthWindow <= 480 ? 180 : widthWindow <= 1024 ? 350: widthWindow <= 1680 ? 180 : 215;
        chartStackedbar.internal.config.padding_left = widthWindow <= 1024 ? 0 : widthWindow <= 1680 ? 260 : 300;
    }
}

async function resizeStatusDetailsGraph() {
    const widthTabContent = document.getElementById("content_status_graph").clientWidth;
    if(document.body.clientWidth <= 860) {
        chartStatusDetails.resize({height: 288,width: 288});
    } else if(document.body.clientWidth <= 1280) {
        chartStatusDetails.resize({height: widthTabContent*0.85,width: widthTabContent*0.85});
    } else {
        chartStatusDetails.resize({height: widthTabContent*0.6,width: widthTabContent*0.6});
    }
    
    
}

window.onresize = async function() {
    if($( "#nav-general-tab" ).hasClass( "active" )) {  
        if($( "#pills-bars-list-tab" ).hasClass( "active" )) {
            if(document.body.clientWidth.clientWidth <= 1024) {
                if(document.body.clientWidth.clientWidth <= 480) {
                    placeAxisStackedbarToTopTwoLines();
                } else {
                    placeAxisStackedbarToTop();
                }
            }
            await resizeStackedBarGraph();
        } else {
            resizeBarsGraph();
        }
    } else {
        resizeStatusDetailsGraph();
    }
}


async function clearData(jsonTypeTab) {
    if(jsonTypeTab == 'filter') {
        if(graphExclude != 'lines') {
            chartLines = null;
            statsLines = {
                'data': {},
                'colors': {},
                'keys': []
            };
            $(".content-slice.first .legend-html").remove();
        }
        if(graphExclude != 'pilares') {
            chartPilares = null;
            statsPilares = {
                'data': {}, 
                'colors': {},
                'keys': []
            };
            await $(".content-slice.second .legend-html").remove();
        }
        if(graphExclude != 'status') {
            chartStatus = null;
            statsStatus = {
                'data': {}, 
                'colors': {},
                'keys': []
            };
            await $(".content-slice.third .legend-html").remove();
        }
        chartStackedbar = null;
        statsStackedbar = {
            'keys': {},
            'colors': {},
            'columns': {},
            'height': 400
        };

        jsonDataFilter = null;
        await $("#stacked_bar_chart_legends .legend-html").remove();
        $(".show-all").removeClass('active');
        $(".hide-all").addClass('active');
    } else {
        chartStatusDetails = null;
        statsStatus = {
            'data': {}, 
            'colors': {},
            'keys': []
        };
        actionsSelecteds = [];
        $("#measures_selecteds, #filter_status_text").text(actionsSelecteds.length);
    }
}

async function loadData(jsonTypeTab) {
    if(jsonTypeTab == 'filter') {
        await clearData('filter');
        await getData('filter');
        if(typeof jsonDataFilter != "undefined" && jsonDataFilter != null) {
            loadGraphStatsLines();
            setTimeout(async () => {
                addLegendGraphLines();
            }, 200);
            loadGraphStatsPilares();
            setTimeout(async () => {
                addLegendGraphPilares();
            }, 200);
            loadGraphStatsStatus();
            setTimeout(async () => {
                addLegendGraphStatus();
            }, 200);
            setTimeout(async () => {
                await resizeBarsGraph();
            }, 0);
    
            loadGraphStatsStackedBar();
            addLegendGraphStackedbar();
            await resizeStackedBarGraph();
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('.disabled'));
            tooltipGraphs = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        } else {
            alert("No hay datos");
        }
    } else {
        await clearData('details');
        await getData('details');
        await loadDetailStatusGraph();
        await $('#total_actions').text(jsonDataActions.actions.length);
        await resizeStatusDetailsGraph();
        await loadActionCards();
    }
}


async function updateData(jsonTypeTab) {
    if(jsonTypeTab == 'filter') {
        await clearData('filter');
        await getData('filter');
        if(typeof jsonDataFilter != null) {
            if(graphExclude != 'lines') {
                loadGraphStatsLines();
                setTimeout(async () => {
                    addLegendGraphLines();
                }, 200);
            }
            if(graphExclude != 'pilares') {
                loadGraphStatsPilares();
                addLegendGraphPilares();
            }
            if(graphExclude != 'status') {
                loadGraphStatsStatus();
                addLegendGraphStatus();
            }

            setTimeout(async () => {
                await resizeBarsGraph();
            }, 0);
    
            loadGraphStatsStackedBar();
            addLegendGraphStackedbar();
            tooltipGraphs.map(function (tooltipTriggerEl) {
                tooltipTriggerEl.dispose();
            });
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('.disabled'));
            tooltipGraphs = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

        } else {
            alert("No hay datos");
        }
    } else {
        await clearData('details');
        await getData('details');
        await loadDetailStatusGraph();
        await resizeStatusDetailsGraph();
        await loadActionCards();
    }
}

async function loadActionCards()  {
    var contentGraph = document.getElementById('content_actions_graphs');
    contentGraph.innerHTML= '';
    var contentHtml = '';

    jsonDataActions.actions.forEach(function (action, index) {
        const urlOptions = new URLSearchParams(categoryFilter).toString() + (linesFilter.length ? '&' + new URLSearchParams(linesFilter).toString() :'') + (pilaresFilter.length ? '&' + new URLSearchParams(pilaresFilter).toString():'') + (statusFilter.length ? '&' + new URLSearchParams(statusFilter).toString():'') + (yearFilter.length ? '&' + new URLSearchParams(yearFilter).toString():'');

        
        contentHtml +=   `<div class="col">`;
        
        contentHtml +=          `<div class="links-content-status dropdown">`;
        contentHtml +=          `    <div class="btn-option-action" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-three-dots-vertical"></i></div>`;
        contentHtml +=          `    <ul class="dropdown-menu dropdown-menu-end">`;
        contentHtml +=          `        <li><div class="btn btn-primary btn-dpd-action" onclick="window.event.cancelBubble = true;openDetailPopup(['${encodeURI(JSON.stringify(action))}']);" onmouseover="mouseOverLinks('card_${action.id}')" onmouseout="mouseOutLinks('card_${action.id}')"><i class="bi bi-file-earmark"></i>Detalles</div></li>`;
        contentHtml +=          `        <li><a class="btn btn-primary btn-dpd-action" href="/measure/export.pdf?${urlOptions}&action=${action.id}" onmouseover="mouseOverLinks('card_${action.id}')" onmouseout="mouseOutLinks('card_${action.id}')" target="_blank"><i class="bi bi-download"></i>Descargar </a></li>`;

        if(actions_html_ingei.hasOwnProperty(action.name)) {
            contentHtml +=                `<li><div class="btn btn-primary btn-dpd-action" onclick="window.event.cancelBubble = true;openINGEIPopup('${action.name}');" onmouseover="mouseOverLinks('card_${action.id}')" onmouseout="mouseOutLinks('card_${action.id}')"><i class="bi bi-clipboard-pulse"></i>INGEI</div></li>`;
        }        
        contentHtml +=          `    </ul>`;
        contentHtml +=          `</div>`;

        contentHtml +=    `<label class="card" for="check_action_${action.id}" id="card_${action.id}">`;
        contentHtml +=        `<div class="card-header">`;
        contentHtml +=          `<div class="">${action.name}</div>`;
        contentHtml +=        `</div>`;

        contentHtml +=        `<div class="row g-0">`;
        contentHtml +=            `<div class="col-md-8 content-measure-graph">`;

        contentHtml +=                `<div class="action-measure-graph" id="action_graph_${action.id}">`;
        

        let totalP = 0;
        let comma = '';
        var backgroundGradient = '';
        var contenDonutTextHtml = '';
        action.stats.forEach(async function (statGraph, index) {
            if(statGraph.value != null) {
                if(totalP > 0) comma = ', ';

                const slice = `${statGraph.color} ${totalP}% ${(totalP += (statGraph.percent)) - .25}%`;

                contenDonutTextHtml +=   `<span class="donut-element" style="left: calc(50% + ${statGraph.x_text}%);bottom: calc(50% + ${statGraph.y_text}%);color:${statGraph.name == 'En programación'? '#000': '#FFF'}">`;
                contenDonutTextHtml +=   statGraph.value;
                contenDonutTextHtml +=   `<div class="c3-tooltip-container" style="position: absolute; pointer-events: none; display: none;"><table class="c3-tooltip"><tbody><tr><td class="name"><span style="background-color:${statGraph.color}"></span>${statGraph.name}</td><td class="value">${statGraph.value} ${statGraph.value > 1 ? 'medidas': 'medida'}</td></tr></tbody></table></div>`;
                contenDonutTextHtml +=   `</span>`;


                const separator = `white ${totalP - .25}% ${totalP}%`;
       
                backgroundGradient += `${comma}${slice}, ${separator}`;
                
            }
        });
        
         contenDonutTextHtml += `<div class="title-graph-status">${totalP == 0 ? 'No hay':action.total} <span>medidas</span></div>`;

            contentHtml +=                `<div class="donut-graph" style="background: conic-gradient(${backgroundGradient})" />`;
            contentHtml +=                      contenDonutTextHtml;
            contentHtml +=                `</div>`;

            
        contentHtml +=                `</div>`;

        contentHtml +=            `</div>`;
        contentHtml +=            `<div class="col-md-4">`;
        contentHtml +=                `<div class="card-body">`;
        
        action.measures.forEach(function (measure) {
            contentHtml += `<a class="card-text" href="/measure/${measure.id}/pdf" data-measure-id="${measure.id}" target="_blank" onmouseover="mouseOverLinks('card_${action.id}')" onmouseout="mouseOutLinks('card_${action.id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="${measure.name}">`;
            contentHtml += `   <span class="circle-color" style="background-color:${jsonDataActions.status.colors[measure.status]}"></span>`;
            contentHtml += `   <span>${measure.code}</span>`;
            contentHtml += `   <span class="measure-name">${measure.name}</span>`;
            contentHtml += `</a>`;
        });

        contentHtml +=                `</div>`;
        contentHtml +=            `</div>`;
        contentHtml +=        `</div>`;
        
        contentHtml +=        `<div class="card-footer text-body-secondary">`;
        contentHtml +=               `<input class="form-check-input" type="checkbox" value="${action.id}" id="check_action_${action.id}">`;
        contentHtml +=            `</div>`;
        contentHtml +=        `</div>`;

        contentHtml +=    `</label>`;
        contentHtml +=`</div>`;
    });

    contentGraph.innerHTML= contentHtml;
    $('.card-footer input:checkbox').change(async function () {
        var idAction = $(this).val();
        var cardAction = $(this).parents(".card");
        if($(this).prop("checked")) {
            await cardAction.addClass('checked');
            actionsSelecteds.push(jsonDataActions.actions.find(a => a.id.toString() === idAction));
        } else {
            await cardAction.removeClass('checked');
            actionsSelecteds = actionsSelecteds.filter(function( obj ) {
                return obj.name !== jsonDataActions.actions.find(a => a.id.toString() === idAction).name;
            });
        }
        await updateDetailStatusGraph();
        if(actionsSelecteds.length) {
            $("#title_status").removeClass('no-select');
            if(actionsSelecteds.length != jsonDataActions.actions.length) $('#check_all_actions').prop('checked', false);
        } else {
            $("#title_status").addClass('no-select');
            $('#check_all_actions').prop('checked', false);
        }
        $("#measures_selecteds, #filter_status_text").text(actionsSelecteds.length);

    });
    var tooltipTriggerListCardText = [].slice.call(document.querySelectorAll('a.card-text'))
    var tooltipListCards = tooltipTriggerListCardText.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function mouseOverLinks(cardId) { document.getElementById(cardId).classList.add("border-none"); }
function mouseOutLinks(cardId) { document.getElementById(cardId).classList.remove("border-none"); }

async function saveDetailPDF() {
    if($('#body_detail').length != undefined) {
        await $('#body_detail .accordion-collapse').addClass('show');
        await $('#body_detail .collapsed').removeClass('collapsed');
        $('#measures_detail_content').printElement({printMode: 'window'});
    }
   
}

async function openDetailPopup(actions, forPrint = false) {

    contentDetailsJson = null;
    var contentGraph = '';
    var action = null;
    if(actions.length == 1) {
        action = JSON.parse(decodeURI(actions[0]));
        await getLinesActionJSON([['action', action.id]]);
        action.stats.forEach(async function (statGraph) {
            if(statGraph.value != null) {
                contentGraph +=   `<div style="background-color:${statGraph.color}; width: ${statGraph.percent}%; color: ${statGraph.name == 'En programación' ? '#000' : '#FFF'}">${statGraph.value}</div>`;
            }
        });
    } else if(actions.length > 1){
        var actionsSelectedForPopup = [];
        actionsSelecteds.forEach(async function (action) {
            actionsSelectedForPopup.push(['action', action.id]);
        });
        await getLinesActionJSON(actionsSelectedForPopup);
        var dataGraph = await getActionsSelectedsDataGraph();
        var total = Object.keys(dataGraph).reduce((sum,key)=>sum+parseFloat(dataGraph[key]||0),0);
        for (const [key, value] of Object.entries(dataGraph)) {      
            contentGraph +=   `<div style="background-color:${jsonDataActions.status.colors[key]}; width: ${value/total*100}%; color: ${key == 'En programación' ? '#000' : '#FFF'}">${value}</div>`;
        }
    } else if(actions.length == 0) {
        if(!forPrint) {
            await getLinesActionJSON();
        } else {
            await getLinesActionJSON(null, true);
        }
            var dataGraph = await contentDetailsJson.status.data;
            var total = Object.keys(contentDetailsJson.status.data).reduce((sum,key)=>sum+parseFloat(contentDetailsJson.status.data[key]||0),0);
            for (const [key, value] of Object.entries(dataGraph)) {      
                contentGraph +=   `<div style="background-color:${contentDetailsJson.status.colors[key]}; width: ${value/total*100}%; color: ${key == 'En programación' ? '#000' : '#FFF'}">${value}</div>`;
            }
    }

    var contentPopup = document.getElementById('measures_detail_content');
    contentPopup.innerHTML= '';
    var contentHtml = '';
    contentPopup.innerHTML = contentHtml;

    contentHtml +=   `<div class="header-detail-popup"  id="header_detail">`;
    contentHtml +=   `    <div class="status-bar-popup">`;

    contentHtml += contentGraph;

    contentHtml +=   `    </div>`;
    contentHtml +=   `    <div class="legends-status-popup">`;
    contentHtml +=   `        <div class="legend-html">`;
    contentDetailsJson.status.keys.forEach(async function (statusName) {
    contentHtml +=   `            <div data-id-status="${statusName}"><span class="color-legend" style="background-color:${statusColors[statusName]}"></span><span class="text-legend">${statusName == 'En implementación inicial' ? 'Inicial':statusName == "En implementación avanzada"? 'Avanzada': statusName}</span></div>`;
    });
    contentHtml +=   `        </div>`;

    contentHtml +=   `        <div class="legend-html">`;
    contentHtml +=   `            <div data-id-status="Adaptación"><span class="color-legend" style="background-color:#4F5C8B"></span><span class="text-legend">Adaptación</span></div>`;
    contentHtml +=   `            <div data-id-status="Mitigación"><span class="color-legend" style="background-color:#74C5D7"></span><span class="text-legend">Mitigación</span></div>`;
    contentHtml +=   `            <div data-id-status="Pérdidas y daños"><span class="color-legend" style="background-color:#946CB3"></span><span class="text-legend">Pérdidas y daños</span></div>`;
    contentHtml +=   `        </div>`;
    contentHtml +=   `    </div>`;
    contentHtml +=   `</div>`;


    contentHtml +=   `<div class="body-detail-popup" id="body_detail">`;
    contentHtml +=   `    <div class="accordion" id="accordion_linea_enfoque">`;
    
    contentDetailsJson.lines.forEach(async function (lineaEnfoque, indexLine) {
        if(lineaEnfoque.actions.length) {
    contentHtml +=   `        <div class="accordion-item">`;
    contentHtml +=   `            <h2 class="accordion-header">`;
    contentHtml +=   `                <button class="accordion-button line" type="button" data-bs-toggle="collapse" data-bs-target="#linea_enfoque_collapse_${indexLine}" aria-expanded="true" aria-controls="linea_enfoque_collapse_${indexLine}">`;
    contentHtml +=   `                    <div class="accordion-line-content">`;
    contentHtml +=   `                        <h4>${lineaEnfoque.name}</h4>`;
    contentHtml +=   `                        <p>${lineaEnfoque.description}</p>`;
    contentHtml +=   `                    </div>`;
    contentHtml +=   `                </button>`;
    contentHtml +=   `            </h2>`;
    contentHtml +=   `            <div id="linea_enfoque_collapse_${indexLine}" class="accordion-collapse collapse show">`;
    contentHtml +=   `                <div class="accordion-body">`;
    contentHtml +=   `                    <div class="accordion">`;

    
                    lineaEnfoque.actions.forEach(async function (actionDetail, indexAction) {
                        contentHtml +=   `<div class="accordion-item">`;
                        contentHtml +=   `    <h2 class="accordion-header">`;
                        contentHtml +=   `        <button class="accordion-button action" type="button" data-bs-toggle="collapse" data-bs-target="#linea-action-collapse-${indexLine}" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">`;
                        contentHtml +=               actionDetail.name;
                        contentHtml +=   `        </button>`;
                        contentHtml +=   `    </h2>`;
                        contentHtml +=   `    <div id="linea-action-collapse-${indexLine}" class="accordion-collapse collapse show">`;
                        contentHtml +=   `        <div class="accordion-body">`;
                        contentHtml +=   `            <div class="paragraph-accordion">`;
                        contentHtml +=                  actionDetail.description;
                        contentHtml +=   `            </div>`;
                        contentHtml +=   `        </div>`;
                        contentHtml +=   `    </div>`;
                        contentHtml +=   `</div>`;
                        


                        const widthWindow = document.body.clientWidth;
                        if(widthWindow <= 768 && forPrint == false) {
                            contentHtml +=   `<div class="measures-table table-medidas-only">`;
                            contentHtml +=   `    <table class="table table-bordered">`;
                            contentHtml +=   `        <thead>`;
                            contentHtml +=   `            <tr>`;
                            contentHtml +=   `                <th scope="col" class="col-medida">Medidas</th>`;
                            contentHtml +=   `            </tr>`;
                            contentHtml +=   `        </thead>`;
                            contentHtml +=   `        <tbody>`;

                                actionDetail.measures.forEach(async function (measureDetail) {
                                    contentHtml +=   `                <tr>`;
                                        contentHtml +=   `                    <td class="col-medida"><div>`;
                                        contentHtml +=   `                     <span class="circle-color" style="background-color:${contentDetailsJson.status.colors[measureDetail.status]}"></span>`;
                                        contentHtml +=   `                     <div>`;
                                        contentHtml +=   `                          <span>${measureDetail.code}</span>`;
                                        contentHtml +=   `                          <span>${measureDetail.name}</span>`;
                                        contentHtml +=   `                     </div>`;
                                        contentHtml +=   `                    </div></td>`;
                                        contentHtml +=   `            </tr>`;

                                });

                            contentHtml +=   `        </tbody>`;
                            
                            contentHtml +=   `    </table>`;
                            contentHtml +=   `</div>`;
                        }
                        contentHtml +=   `<div class="measures-table">`;
                        contentHtml +=   `    <table class="table table-bordered">`;
                        contentHtml +=   `        <thead>`;
                        contentHtml +=   `            <tr>`;
                        contentHtml +=   widthWindow <= 768 && forPrint == false ? '':`<th scope="col" class="col-medida">Medidas</th>`;
                        contentHtml +=   `                <th scope="col" class="col-pilares">Pilares</th>`;
                        contentHtml +=   `                <th scope="col" class="col-autoridad">Autoridad de aplicación</th>`;
                        contentHtml +=   `                <th scope="col" class="col-alcance">Alcance geográfico o poblacional</th>`;
                        contentHtml +=   `            </tr>`;
                        contentHtml +=   `        </thead>`;

                        contentHtml +=   `        <tbody>`;
                                    actionDetail.measures.forEach(async function (measureDetail, indexMeasure) {
                                        contentHtml +=   `                <tr>`;
                                        contentHtml +=   widthWindow <= 768 && forPrint == false ? '':`                    <td class="col-medida"><div>`;
                                        contentHtml +=   widthWindow <= 768 && forPrint == false ? '':`                     <span class="circle-color" style="background-color:${contentDetailsJson.status.colors[measureDetail.status]}"></span>`;
                                        contentHtml +=   widthWindow <= 768 && forPrint == false ? '':`                <div>`;
                                        contentHtml +=   widthWindow <= 768 && forPrint == false ? '':`                     <span>${measureDetail.code}</span>`;
                                        contentHtml +=   widthWindow <= 768 && forPrint == false ? '':`                     <span>${measureDetail.name}</span>`;
                                        contentHtml +=   widthWindow <= 768 && forPrint == false ? '':`                </div>`;
                                        contentHtml +=   widthWindow <= 768 && forPrint == false ? '':`                    </div></td>`;
                                        contentHtml +=   `                    <td class="col-pilares"><div class="td-pilares">`;
                                                                pilaresColorsDisunity[measureDetail.pilares].forEach( color => {
                                                                    contentHtml +=   `<span class="circle-color" style="background-color:${color}"></span>`;
                                                                });
                                                                                
                                        contentHtml +=   `                    </div></td>`;
                                        contentHtml +=   `                    <td class="col-autoridad">${measureDetail.autoritad?measureDetail.autoritad:''}</td>`;
                                        contentHtml +=   `                    <td class="col-alcance">${measureDetail.scope?measureDetail.scope:''}</td>`;
                                        contentHtml +=   `                </tr>`;
                                    });

                        contentHtml +=   `        </tbody>`;
                            
                        contentHtml +=   `    </table>`;
                        contentHtml +=   `</div>`;




                    });

    contentHtml +=   `                </div>`;
    contentHtml +=   `            </div>`;
    contentHtml +=   `        </div>`;
    contentHtml +=   `    </div>`;
        }
    });

    contentHtml +=   `    </div>`;
    contentHtml +=   `</div>`;

    contentPopup.innerHTML = contentHtml;
    if(!forPrint ) {
        actionDetailPopup.show();
    } else {
        saveDetailPDF();
    }
    
}

async function openINGEIPopup(actionName) {
    if(actionName != null) {
        const action = jsonDataActions.actions.find(action => action.name == actionName);
        document.getElementById('ingei_popup_title').innerHTML = actionName;
        document.getElementById('nav_monitoreo').innerHTML = actions_html_ingei[actionName];
        addListenerINGEI();
        ingeiPopup.show();
    } else {
        alert('No se encontraron graficos para : ' + actionName);
    }
}

function addListenerINGEI() {
    $("#chart_title").html(document.body.clientWidth <= 860 ? 'Seleccione arriba el grafico a visualizar':'Seleccione a la izquierda el grafico a visualizar');
    $("#chart").hide();
    $("#unidad_de_medida").hide();
    $("#chart_unidad").html("MtCO₂e");
    $("#chart_descripcion").hide();

    $("#nav .nav_monitoreo .monitoreo_select").click(function () {
        $("#nav .nav_monitoreo .monitoreo_select").removeClass("activo");
        $(this).addClass("activo");
    
        f = "monitoreo";
        monitoreo_id = $(this).attr("data-monitoreo");
    
        ver_resultado();
        return false;
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

    // RADIO BUTTONS
    $("#nav").on("click", "label.sec", function () {
    $("#nav label.sec").removeClass("activo");
    $(this).addClass("activo");
    });
}

async function getData(jsonTypeTab, isStatusOnly = false) {
    const urlOptions = new URLSearchParams(categoryFilter).toString() + (linesFilter.length ? '&' + new URLSearchParams(linesFilter).toString() :'') + (pilaresFilter.length ? '&' + new URLSearchParams(pilaresFilter).toString():'') + (statusFilter.length ? '&' + new URLSearchParams(statusFilter).toString():'') + (yearFilter.length ? '&' + new URLSearchParams(yearFilter).toString():'');
    console.log("urlOptions");
    console.log(urlOptions);
    loading.show();
    const url = `/measure/${jsonTypeTab}.json?${urlOptions}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        /* Laurent trying to correct a bug */
        $('#action_detail_popup').modal('hide');

        if(jsonTypeTab == 'filter') {
            jsonDataFilter = await response.json();
            if(graphExclude != 'lines') {
                statsLines = jsonDataFilter.stats.lines;
            }
            if(graphExclude != 'pilares') {
                statsPilares = jsonDataFilter.stats.pilares;
            }
            if(graphExclude != 'status') {
                statsStatus = jsonDataFilter.stats.status;
            }
            statsStackedbar = jsonDataFilter.stats.stackedbar;
            console.log("jsonDataFilter");
            console.log(jsonDataFilter);
            if(jQuery.isEmptyObject(pilaresColorsDisunity)) {
                const newPilaresJsonColors = jsonDataFilter.stats.pilares.colors;
                Object.keys(newPilaresJsonColors).forEach(function(key) {
                    switch (key) {
                        case 'Adaptación y Mitigación':
                            pilaresColorsDisunity[key] = [newPilaresJsonColors['Adaptación'], newPilaresJsonColors['Mitigación']];
                            break;
                        case 'Adaptación y Pérdidas y daños':
                            pilaresColorsDisunity[key] = [newPilaresJsonColors['Adaptación'], newPilaresJsonColors['Pérdidas y daños']];
                            break;
                        case 'Mitigación y Pérdidas y daños':
                            pilaresColorsDisunity[key] = [newPilaresJsonColors['Mitigación'], newPilaresJsonColors['Pérdidas y daños']];
                            break;
                        case 'Adaptación, Mitigación y Pérdidas y daños':
                            pilaresColorsDisunity[key] = [newPilaresJsonColors['Adaptación'], newPilaresJsonColors['Mitigación'], newPilaresJsonColors['Pérdidas y daños']];
                            break;
                        default:
                            pilaresColorsDisunity[key] = [newPilaresJsonColors[key]];
                    }
                }); 
            }
        } else {
            jsonDataActions = await response.json();
            console.log("jsonDataActions");
            console.log(jsonDataActions);
            if(jQuery.isEmptyObject(statusColors)) {
                statusColors = Object.assign({}, jsonDataActions.status.colors);
                var htmlColors = '';
                Object.keys(statusColors).forEach(function(key) {
                    htmlColors += `<div class="legend-item"><span class="color-legend" style="background-color:${statusColors[key]}"></span><span class="text-legend">${key == 'En implementación inicial' ? 'Inicial': key == "En implementación avanzada"? 'Avanzada': key}</span></div>`;
                });
                $('.legend-status-measures .legend-html').html(htmlColors);
            }
        }
        loading.hide();
    } catch (error) {
        console.error(error.message);
        loading.hide();
        alert('Error en la consulta');
    }
}

async function getLinesActionJSON(actionsFilter, forPrint = false) {
    const urlOptions = new URLSearchParams(categoryFilter).toString() + (linesFilter.length ? '&' + new URLSearchParams(linesFilter).toString() :'') + (pilaresFilter.length ? '&' + new URLSearchParams(pilaresFilter).toString():'') + (statusFilter.length ? '&' + new URLSearchParams(statusFilter).toString():'') + (yearFilter.length ? '&' + new URLSearchParams(yearFilter).toString():'') + (actionsFilter?.length ? '&' + new URLSearchParams(actionsFilter).toString():'');
    console.log("getLinesActionJSON urlOptions");
    console.log(urlOptions);
    loading.show();
    const url = `/measure/lines.json?${!forPrint?urlOptions:''}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        contentDetailsJson = await response.json();
        loading.hide();
    } catch (error) {
        console.error(error.message);
        loading.hide();
        alert('Error en la consulta');
    }
}

Array.prototype.equals = function(array) {
    return array instanceof Array && JSON.stringify(this) === JSON.stringify(array) ;
}

/* Listeners */
$('#nav-general-tab').on('shown.bs.tab', async function() {
    if(JSON.stringify(prevCategoryFilter) != JSON.stringify(categoryFilter) || !prevLinesFilter.equals(linesFilter) || !prevPilaresFilter.equals(pilaresFilter) || !prevStatusFilter.equals(statusFilter) || !prevYearFilter.equals(yearFilter) || jsonDataFilter == null ) {
        graphExclude = '';
        await loadData('filter');
    }
    await resizeBarsGraph();
    await resizeStackedBarGraph();
    prevCategoryFilter = { ...categoryFilter };
    prevLinesFilter = [...linesFilter];
    prevPilaresFilter = [...pilaresFilter];
    prevStatusFilter = [...statusFilter];
    prevYearFilter = [...yearFilter];
});
$('#nav-details-tab').on('shown.bs.tab', async function() {
    if(JSON.stringify(prevCategoryFilter) != JSON.stringify(categoryFilter) || !prevLinesFilter.equals(linesFilter) || !prevPilaresFilter.equals(pilaresFilter) || !prevStatusFilter.equals(statusFilter) || !prevYearFilter.equals(yearFilter)  || jsonDataActions == null ) {
        graphExclude = '';
        await loadData('details');
    }
    await resizeBarsGraph();
    await resizeStackedBarGraph();
    prevCategoryFilter = { ...categoryFilter };
    prevLinesFilter = [...linesFilter];
    prevPilaresFilter = [...pilaresFilter];
    prevStatusFilter = [...statusFilter];
    prevYearFilter = [...yearFilter];
});

$('#pills-bars-tab').on('shown.bs.tab', function() {
    resizeBarsGraph();
});
$('#pills-bars-list-tab').on('shown.bs.tab', async function() {
    await resizeStackedBarGraph();
});
$('#sidebar').on('shown.bs.collapse hidden.bs.collapse', async function(e) {
    if($('#nav-general-tab').hasClass('active')) {
        if($( "#pills-bars-list-tab" ).hasClass( "active" )) {
            await resizeStackedBarGraph();
        } else {
            resizeBarsGraph();
        }
    }
    if(e.target.classList.contains('show'))  {
        document.getElementById("nav-tabContent").classList.add("filter-opened");
    } else {
        document.getElementById("nav-tabContent").classList.remove("filter-opened");
    }
});


$('#check_all_actions').change(async function () {
    $('.card-footer input:checkbox').prop('checked', this.checked);
    if($(this).prop("checked")) {
        $('#content_actions_graphs .card').addClass('checked');
        actionsSelecteds = [...jsonDataActions.actions];
    } else {
        $('#content_actions_graphs .card.checked').removeClass('checked');
        actionsSelecteds = [];
    }

    await updateDetailStatusGraph();
    
    if(actionsSelecteds.length) {
        $("#title_status").removeClass('no-select');
    } else {
        $("#title_status").addClass('no-select');
    }
    $("#measures_selecteds, #filter_status_text").text(actionsSelecteds.length);
});

$('#pills-details-tab .nav-link').on('click', async function (e) {
    if(!$(this).hasClass('active')){
        $('#pills-details-tab .nav-link.active').removeClass('active');
        $(this).addClass('active');
        if($(this).attr('id') == 'pills-cards-list-tab') {
            $("#nav-details").removeClass('view-cards');
            $('#content_actions_graphs [data-bs-toggle="tooltip"]').tooltip("disable");
        } else if($(this).attr('id') == 'pills-cards-tab') {
            $("#nav-details").addClass('view-cards');
            $('#content_actions_graphs [data-bs-toggle="tooltip"]').tooltip("enable");
        }
    }
});

function addListenerSelects() {
    $('select.selectpicker-lineas-enfoques').on('changed.bs.select', async function (e, clickedIndex) {
        $(this).parent().find('.dropdown-toggle .filter-option-inner-inner').text($(this).find('option:selected').text());
        if(clickedIndex == 0) {
            categoryFilter = {};
        } else {
            categoryFilter['cat'] = clickedIndex;
        }
        const newArray = linesFilter.filter(dat => !dat.find(value => value === 'line'));
        linesFilter = [...newArray];
        graphExclude = '';
        if($("#nav-general-tab").hasClass('active')) {
            await updateData('filter');
        } else {
            await updateData('details');
        }

        if($(this).attr('id')=="selectpicker_title_bar"){
            $('#selectpicker_select_label').selectpicker('val', e.target.value);
            $('#selectpicker_title_stackedbar').selectpicker('val', e.target.value);
        } else if($(this).attr('id')=="selectpicker_select_label"){
            $('#selectpicker_title_bar').selectpicker('val', e.target.value);
            $('#selectpicker_title_stackedbar').selectpicker('val', e.target.value);
        } else {
            $('#selectpicker_select_label').selectpicker('val', e.target.value);
            $('#selectpicker_title_bar').selectpicker('val', e.target.value);
        }
        $(".selectpickers-lineas").selectpicker('val', []);
        $(".selectpickers-lineas").removeClass('active').selectpicker('hide');
        $(`.s-lineas [select-group-id="${e.target.value}"]`).addClass('active').selectpicker('show');
        $('.selectpicker').selectpicker('refresh');
    });

    $('.selectpickers-lineas').on('changed.bs.select', async function (e, clickedIndex, isSelected, previousValue) {
        if(e.target.value != null) {
            const selectpickerValues = $(this).selectpicker('val');
            if(isSelected == true || isSelected == false) {
                var indexLine = 0;
                if(isSelected) {
                    const selectpickerId = previousValue.length == 0 ? selectpickerValues : selectpickerValues.filter( ( el ) => !previousValue.includes( el ) );
                    indexLine = linesInputs.indexOf(selectpickerId[0])+1;
                    linesFilter.push(['line', indexLine]);
                } else {
                    const selectpickerId = previousValue.filter( ( el ) => !selectpickerValues.includes( el ) );
                    indexLine = linesInputs.indexOf(selectpickerId[0])+1;
                    const newArray = linesFilter.filter(dat => !dat.includes(indexLine));
                    linesFilter = [...newArray];
                }
                graphExclude = 'lines';
            } else {
                const newArray = linesFilter.filter(dat => !dat.find(value => value === 'line'));
                linesFilter = [...newArray];
                await chartLines?.show(statsLines.keys);
                graphExclude = '';
            }
            if($("#nav-general-tab").hasClass('active')) {
                await updateData('filter');
                /* Legends */
                if(selectpickerValues.length == statsLines.keys.length || selectpickerValues.length == 0) {
                    chartLines.show();
                    $(".content-slice.first .legend-html .selected").removeClass('selected');
                } else {
                    const arrayHide = statsLines.keys.filter(x => !selectpickerValues.includes(x));
                    var arrayShow = statsLines.keys.filter(function(val) {
                        return selectpickerValues.indexOf(val) != -1;
                    });
                    chartLines.hide(arrayHide);
                    arrayHide.forEach(function (item) {
                        $(`[data-id="${item}"]`).removeClass('selected');
                    });
                    chartLines.show(arrayShow);
                    arrayShow.forEach(function (item) {
                        $(`[data-id="${item}"]`).addClass('selected');
                    });
                }
            } else {
                await updateData('details');
            }
 
        }
    });
    
    $('.selectpickers').on('changed.bs.select', async function (e, clickedIndex, isSelected, previousValue) {
        if(e.target.value != null) {
            if($(this).is("#select_pilares")) {
                const selectpickerValues = $(this).selectpicker('val');
                if(isSelected == true || isSelected == false) {
                    var indexPilar = 0;
                    if(isSelected) {
                        const selectpickerId = previousValue.length == 0 ? selectpickerValues : selectpickerValues.filter( ( el ) => !previousValue.includes( el ) );
                        indexPilar = pilaresInputs.indexOf(selectpickerId[0])+1;
                        pilaresFilter.push(['pilar', indexPilar]);
                    } else {
                        const selectpickerId = previousValue.filter( ( el ) => !selectpickerValues.includes( el ) );
                        indexPilar = pilaresInputs.indexOf(selectpickerId[0])+1;
                        const newArray = pilaresFilter.filter(dat => !dat.includes(indexPilar));
                        pilaresFilter = [...newArray];
                    }
                    graphExclude = 'pilares';
                } else {
                    const newArray = pilaresFilter.filter(dat => !dat.find(value => value === 'pilar'));
                    pilaresFilter = [...newArray];
                    await chartPilares?.show(statsPilares.keys);
                    graphExclude = '';
                }
    
                /* Legends */
                if(selectpickerValues.length == statsPilares.keys.length || selectpickerValues.length == 0) {
                    await chartPilares?.show(statsPilares.keys);
                    $(".content-slice.second .legend-html .selected").removeClass('selected');
                } else {
                    const arrayHide = statsPilares.keys.filter(x => !selectpickerValues.includes(x));
                    var arrayShow = statsPilares.keys.filter(function(val) {
                        return selectpickerValues.indexOf(val) != -1;
                    });
                    await chartPilares.hide(arrayHide);
                    arrayHide.forEach(function (item) {
                        $(`[data-id="${item}"]`).removeClass('selected');
                    });
                    chartPilares.show(arrayShow);
                    arrayShow.forEach(function (item) {
                        $(`[data-id="${item}"]`).addClass('selected');
                    });
                }
                
                if($("#nav-general-tab").hasClass('active')) {
                    await updateData('filter');
                } else {
                    await updateData('details');
                }
            } else if($(this).is("#select_estado")) {
                const selectpickerValues = $(this).selectpicker('val');
                if(isSelected == true || isSelected == false) {
                    if(isSelected) {
                        const selectpickerId = previousValue.length == 0 ? selectpickerValues : selectpickerValues.filter( ( el ) => !previousValue.includes( el ) );
                        statusFilter.push(['status', selectpickerId[0]]);
                    } else {
                        const selectpickerId = previousValue.filter( ( el ) => !selectpickerValues.includes( el ) );
                        const newArray = statusFilter.filter(el => !el.includes(selectpickerId[0]));
                        statusFilter = [...newArray];
                    }
                    graphExclude = 'status';
                } else {
                    const newArray = statusFilter.filter(el => !el.find(value => value === 'status'));
                    statusFilter = [...newArray];
                    await chartStatus?.show(statsStatus.keys);
                    graphExclude = '';
                }
    
                /* Legends */
                if(selectpickerValues.length == statsStatus.keys.length || selectpickerValues.length == 0) {
                    chartStatus.show();
                    $(".content-slice.third .legend-html .selected").removeClass('selected');
                } else {
                    const arrayHide = statsStatus.keys.filter(x => !selectpickerValues.includes(x));
                    var arrayShow = statsStatus.keys.filter(function(val) {
                        return selectpickerValues.indexOf(val) != -1;
                    });
                    chartStatus.hide(arrayHide);
                    arrayHide.forEach(function (item) {
                        $(`[data-id="${item}"]`).removeClass('selected');
                    });
                    chartStatus.show(arrayShow);
                    arrayShow.forEach(function (item) {
                        $(`[data-id="${item}"]`).addClass('selected');
                    });
                }

                if($("#nav-general-tab").hasClass('active')) {
                    await updateData('filter');
                } else {
                    await updateData('details');
                }
            } else if($(this).is("#select_ano_cumplimiento")) {
                const selectpickerValues = $(this).selectpicker('val');
                if(isSelected == true || isSelected == false) {
                    if(isSelected) {
                        const selectpickerId = previousValue.length == 0 ? selectpickerValues : selectpickerValues.filter( ( el ) => !previousValue.includes( el ) );
                        yearFilter.push(['year', selectpickerId[0]]);
                    } else {
                        const selectpickerId = previousValue.filter( ( el ) => !selectpickerValues.includes( el ) );
                        const newArray = yearFilter.filter(el => !el.includes(selectpickerId[0]));
                        yearFilter = [...newArray];
                    }
                } else {
                    const newArray = yearFilter.filter(el => !el.find(value => value === 'year'));
                    yearFilter = [...newArray];
                }
                graphExclude = '';
                if($("#nav-general-tab").hasClass('active')) {
                    await updateData('filter');
                } else {
                    await updateData('details');
                }
            } else {
                console.log('error selectpickers')
            }
        }
        
    });
}

async function selectGroupPilar(pilar) {

    const selectpickerValues = $("#select_pilares").selectpicker('val');
    
    var noSelectpickerValues = pilaresInputs.filter(x=>!selectpickerValues.includes(x));
    var arrSelectpicker = [];
    if(noSelectpickerValues.length > 0) {
        for(i=0;i<noSelectpickerValues.length;i++){
            if(noSelectpickerValues[i].includes(pilar)){
                arrSelectpicker.push(noSelectpickerValues[i]);
                indexPilar = pilaresInputs.indexOf(noSelectpickerValues[i])+1;
                pilaresFilter.push(['pilar', indexPilar]);
            }
        }
        arrSelectpicker = arrSelectpicker.concat(selectpickerValues);
        if(JSON.stringify(selectpickerValues) != JSON.stringify(arrSelectpicker)) {
            await chartPilares.hide();
            await chartPilares.show(arrSelectpicker);
            console.log(arrSelectpicker);
            console.log(pilaresFilter);
            $('#select_pilares').selectpicker('val', arrSelectpicker);
            $('#select_pilares').selectpicker('refresh');

            graphExclude = 'pilares';
            if($("#nav-general-tab").hasClass('active')) {
                await updateData('filter');
            } else {
                await updateData('details');
            }

            /* Legends */  
            arrSelectpicker.forEach(function (item) {
                $(`[data-id="${item}"]`).addClass('selected');
            });
            
        }
           
    }
}

$(async function () {
    $(".selectpickers-lineas").removeClass('active').selectpicker('hide');
    $(`[select-group-id="${$('.selectpicker-lineas-enfoques').selectpicker('val')}"]`).addClass('active').selectpicker('show');
    if($("#nav-general-tab").hasClass('active')) {
        await loadData('filter');
    } else {
        await loadData('details');
    }
    addListenerSelects();
    $('#download_selecteds_actions').click(async function(e) {
        if(actionsSelecteds.length > 8) {
            $('#download_pdf').click();
        } else {
            var actionParam = [];
            actionsSelecteds.forEach(function (action) {
                actionParam.push(['action',action.id]);
            });
            const urlOptions = new URLSearchParams(categoryFilter).toString() + (linesFilter.length ? '&' + new URLSearchParams(linesFilter).toString() :'') + (pilaresFilter.length ? '&' + new URLSearchParams(pilaresFilter).toString():'') + (statusFilter.length ? '&' + new URLSearchParams(statusFilter).toString():'') + (yearFilter.length ? '&' + new URLSearchParams(yearFilter).toString():'') + '&' + new URLSearchParams(actionParam).toString();
            window.open('/measure/export.pdf?'+urlOptions, '_blank');
        }
    });
    $('#download_pdf').click(function(e) {
        e.preventDefault();
        window.open('/measure/export.pdf?cat=1');
        window.open('/measure/export.pdf?cat=2');
        window.open('/measure/export.pdf?line=7');
        window.open('/measure/export.pdf?line=8&line=9');
        window.open('/measure/export.pdf?line=10&line=12');
        window.open('/measure/export.pdf?line=11');
    });
    // Gestion scroll
    $("main").on('scroll', function() {
        if($("#nav-details-tab").hasClass("active")) {
            var scrollTop = $(this).scrollTop();
            var refScroll = $("#ingei_popup").hasClass("show") || $("#action_detail_popup").hasClass("show") ? $('#body_detail').offset().top : $('#content_actions_graphs').offset().top;
            var scrollBtn = $('#scroll_btn');
            var distancia = (refScroll - scrollTop);
            if (distancia <= 0) {
                scrollBtn.addClass('scroll-top');
            } else {
                scrollBtn.removeClass('scroll-top');
            }
        }
    });

});