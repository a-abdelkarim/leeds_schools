import config from "./config.js";
import { selectedEmariteId, selectedLevel } from "./panel.js";
import { createAppConfigWidget } from "./handleConfigContainer.js";
import { createSyncDataWidget } from "./components/syncData.js";
import { configUiElements, setConfigValues } from "./components/handleConfig.js";
import { alert } from "./atoms.js";
import { createReport } from "./reportService.js";
import { calcTotalCoveredSchools, generateReport, handleRecommendationText } from "./report.js";
import { setAppLang } from "./helpers.js";

var Urban_Schools_obj = {};
Urban_Schools_obj.isResults = false;
var graphicsLayer_Arry = [];
let map, view;
let selectHandler;
let currentFeatureAttrs = {};

const standardAverages = {
    kinderGarten: 7000,
    cycleOne: 8000,
    cycleTwo: 12000,
    cycleThree: 12000
}

export async function initRakSchools() {
    // set app language
    await setAppLang();
    
    require([
        "esri/Map",
        "esri/views/MapView",
        'esri/rest/query',
        "esri/rest/support/Query",
        "esri/views/draw/Draw",
        "esri/Graphic",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/PictureMarkerSymbol",
        "esri/geometry/Point",
        "esri/renderers/SimpleRenderer",
        'esri/Color',
        "esri/geometry/support/geodesicUtils",
        "esri/core/units",
        "esri/geometry/geometryEngine",
        "esri/layers/GraphicsLayer",
        // "esri/graphicsUtils",
        // "esri/map",
        "esri/layers/FeatureLayer",
        // "esri/tasks/StatisticDefinition",
        "esri/tasks/GeometryService",
        "esri/geometry/SpatialReference",
        "esri/geometry/projection",
        "esri/symbols/Font",
        "esri/layers/VectorTileLayer",
        "esri/symbols/TextSymbol",
        "esri/widgets/Legend",
        "esri/widgets/BasemapGallery",
        "esri/widgets/Fullscreen"
    ], function(
        Map, 
        MapView, 
        query, 
        Query, 
        Draw, 
        Graphic, 
        SimpleMarkerSymbol, 
        SimpleLineSymbol, 
        SimpleFillSymbol, 
        PictureMarkerSymbol, 
        Point, 
        SimpleRenderer, 
        Color,
        geodesicUtils,
        Units,
        geometryEngine,
        GraphicsLayer,
        FeatureLayer,
        GeometryService,
        SpatialReference,
        projection,
        Font,
        VectorTileLayer,
        Legend,
        BasemapGallery,
        Fullscreen,
        TextSymbol) {            
            map = new Map({
                basemap: "streets"
            });
            
            view = new MapView({
                container: "viewDiv",
                map: map,
                center: [56.020250512290445, 25.442942037192502],
                zoom: 7,
                // spatialReference: {
                    //     wkid: 3857
                    // }
            }); 
            
            const appConfigWidget = createAppConfigWidget();
            const syncDataWidget = createSyncDataWidget();
            // document.getElementById('viewDiv').appendChild(customWidget);
            view.ui.add(appConfigWidget, "top-left");
            view.ui.add(syncDataWidget, "top-left");

        Urban_Schools_obj.startup = function() {

            // init panel
            const widget = "panel"
            $('#' + widget).append(
                '<div  id="loading">'
                + '<div class="wrapper">'
                + '<div class="circles"></div>'
                + '<div class="circles"></div>'
                + '<div class="circles"></div>'
                + '<div class="shadow"></div>'
                + '<div class="shadow"></div>'
                + '<div class="shadow"></div>'
                + '<span>Loading</span>'
                + '</div>'
                + '</div>'
            );
            $('#loading').hide();

            // select2 init
            $('.js-example-basic-multiple').select2();
            $('.js-example-basic-single').select2();
            var acc = document.getElementsByClassName("accordion");
            var i;

            for (i = 0; i < acc.length; i++) {
                acc[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
                });
            }
        }
        
        Urban_Schools_obj.open = function() {
        }


        
        Urban_Schools_obj.init = function(callBack) {
            // Urban_Schools_obj.destroy();

            Urban_Schools_obj.config = config;
            Urban_Schools_obj.map = map;
            Urban_Schools_obj.view = view;

            //   Urban_Schools_obj._zonesLayer = new FeatureLayer(Urban_Schools_obj.config.servCycleTwoLayerUrl, {
            //     mode: FeatureLayer.MODE_SNAPSHOT, 
            //     outFields: ["*"]
            // });
            // var renderer = new SimpleRenderer(new SimpleFillSymbol().setColor(new Color([56, 168, 0, 0.5]))); 
            // Urban_Schools_obj._zonesLayer.setRenderer(renderer);
            // Urban_Schools_obj._zonesLayer.setDefinitionExpression("Name IN('31','25','27')"); 
            // Urban_Schools_obj.map.add(Urban_Schools_obj._zonesLayer);
            Urban_Schools_obj.Dict_App = {}
            Urban_Schools_obj.graphicsLayer = new GraphicsLayer();
            Urban_Schools_obj.reportGraphicsLayer = new GraphicsLayer();
            Urban_Schools_obj.graphicsLayer_KinderGarden10Min = new GraphicsLayer();
            // Urban_Schools_obj.graphicsLayer_KinderGardenPoint = new GraphicsLayer()

            Urban_Schools_obj.graphicsLayer_CycleOne15min_boy = new GraphicsLayer();
            Urban_Schools_obj.graphicsLayer_CycleOne15min_girl = new GraphicsLayer();

            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy = new GraphicsLayer();
            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl = new GraphicsLayer();

            Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy = new GraphicsLayer();
            Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl = new GraphicsLayer();

            Urban_Schools_obj.map.add(Urban_Schools_obj.reportGraphicsLayer);
            Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl);
            Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy);

            Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl);
            Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy);

            Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer_CycleOne15min_girl);
            Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer_KinderGarden10Min);
            // Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer_KinderGardenPoint)

            Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer_CycleOne15min_boy);
            Urban_Schools_obj.getDomain(Urban_Schools_obj.config.emaraLayerUrl, [Urban_Schools_obj.config.emaraDomainField], function (_domins) {

                var Dict_NAMEAR_EMARET = {};
                $.each(_domins, function (index, value) {
                    Dict_NAMEAR_EMARET[value.code] = value.name;
                });
                Urban_Schools_obj.Dict_App["EMIRATEID"] = Dict_NAMEAR_EMARET;
            })

            Urban_Schools_obj.getDomain(Urban_Schools_obj.config.muniLayerUrl, Urban_Schools_obj.config.muniDomainField, function (_domins) {
                var Dict_NAMEAR = {};
                $.each(_domins, function (index, value) {
                    Dict_NAMEAR[value.code] = value.name;
                });
                Urban_Schools_obj.Dict_App["NAMEAR"] = Dict_NAMEAR;
            })
            Urban_Schools_obj.view.graphics.removeAll()


            // Urban_Schools_obj.loadCycle(function () {

            // })
            $('#searchBtn').click(Urban_Schools_obj.submit)
            $("#advancedSearchSubmitBtn").on('click', Urban_Schools_obj.submit)

            callBack()
        }

        Urban_Schools_obj.submit = async function () {
            // document.getElementById("panel").style.display = "block";

            $('#loading').show();
            $('#table_StandrendNew').empty()
            $('#print').css('display','none')
            $('#recommendation_value').empty()
            $('#label_cycle').empty()
            $('#equation').css('display', 'none')
            var whereCycle = ''
            var whereGendar = ''
            var where = ''
            var cycle = $("#cycle").val()
            var gendar = $("#gendar").val()

            if (cycle.length !== 0) {

            if (cycle.includes("Cycle_0")) {
                if (whereCycle.length == 0) {
                    whereCycle += `${Urban_Schools_obj.config.kinderField} > 0 AND ${Urban_Schools_obj.config.kinderField} IS NOT NULL  `
                } else {
                    whereCycle += ` OR ${Urban_Schools_obj.config.kinderField} > 0 AND ${Urban_Schools_obj.config.kinderField} IS NOT NULL  `
                }
            }
            if (cycle.includes("Cycle_One")) {
                if (whereCycle.length == 0) {
                    whereCycle += `${Urban_Schools_obj.config.cOneField} > 0 AND ${Urban_Schools_obj.config.cOneField} IS NOT NULL `
                } else {
                    whereCycle += ` OR ${Urban_Schools_obj.config.cOneField} > 0 AND ${Urban_Schools_obj.config.cOneField} IS NOT NULL`
                }
            }
            if (cycle.includes("Cycle_Two")) {
                if (whereCycle.length == 0) {
                    whereCycle += `${Urban_Schools_obj.config.cTwoField} > 0 AND ${Urban_Schools_obj.config.cTwoField} IS NOT NULL `
                } else {
                    whereCycle += ` OR ${Urban_Schools_obj.config.cTwoField} > 0 AND ${Urban_Schools_obj.config.cTwoField} IS NOT NULL  `
                }
            }

            if (cycle.includes("Cycle_Three")) {
                if (whereCycle.length == 0) {
                    whereCycle += `${Urban_Schools_obj.config.cThreeField} > 0 AND ${Urban_Schools_obj.config.cThreeField} IS NOT NULL`
                } else {
                    whereCycle += ` OR ${Urban_Schools_obj.config.cThreeField} > 0 AND ${Urban_Schools_obj.config.cThreeField} IS NOT NULL `
                }
            }

            where += whereCycle
            }
            if (gendar.length !== 0) {

                for (var i = 0; i < gendar.length; i++) {
                    if (gendar.length > 1) {
                        // if (i == 0) {
                        //   whereGendar += "(GENDER LIKE N'%" + gendar[i] + "%' OR Gender LIKE N'%مشترك%')"
                        // }
                        // if (i == gendar.length - 1) {
                        //   whereGendar += "OR (GENDER   LIKE N'%" + gendar[i] + "%')"
                        // }
                        whereGendar = ''
                    } else {
                        whereGendar += `(${Urban_Schools_obj.config.genderField} LIKE N'%${gendar[i]}%' OR ${Urban_Schools_obj.config.genderField} LIKE N'%مشترك%')`
                    }
                }

                if (where.length == 0) {
                    where += whereGendar
                } else {
                    if (whereGendar.length > 0) {
                        where += ' AND ' + whereGendar
                    }
                }
            }

            if (cycle.length == 0 && gendar.length == 0) {
                where = '1=1'
            }

            await Urban_Schools_obj.getSchool(where, async function (data) {

            if (data != undefined) {
                $('#SUM_School').text(data.Total_School)
                $('#Capacity').text(data.Total_capacity)
            } else {
                $('#SUM_School').text(0)
                $('#Capacity').text(0)
            }

            if ($('#sub-Regions-none-urban').val() != '-1' && $('#sub-Regions-none-urban').val() != 'all' && $('#sub-Regions-none-urban').val() != null) {
                const garphic = Urban_Schools_obj.SubRegionsFeatures.filter(function (value) {
                    return value['ID'] == $('#sub-Regions-none-urban').val()
                });
                $('#SUM_POPULATION').text(garphic[0].CITIZENTOTAL)
            } else if ($('#sub-Regions-none-urban').val() == 'all') {
                var subregion = $('#sub-Regions-none-urban')[0]

                var citizen = 0
                for (var i = 2; i < subregion.length; i++) {
                    const garphic = Urban_Schools_obj.SubRegionsFeatures.filter(function (value) {
                        return value['ID'] == subregion[i].value;
                    });
                    citizen += garphic[0].CITIZENTOTAL
                }
                $('#SUM_POPULATION').text(citizen);
            }

            if ($('#sub-Regions').val() != '-1' && $('#sub-Regions').val() != 'all' && $('#sub-Regions').val() != null) {
                const garphic = Urban_Schools_obj.SubRegionsFeatures.filter(function (value) {
                    return value['ID'] == $('#sub-Regions').val();
                });
                $('#SUM_POPULATION').text(garphic[0].CITIZENTOTAL);
                
            } else if ($('#sub-Regions').val() == 'all') {
                var subregion = $('#sub-Regions')[0];

                var citizen = 0
                for (var i = 2; i < subregion.length; i++) {
                    const garphic = Urban_Schools_obj.SubRegionsFeatures.filter(function (value) {
                        return value['ID'] == subregion[i].value;
                    });
                    citizen += garphic[0].CITIZENTOTAL
                }
                $('#SUM_POPULATION').text(citizen)
            }

            if ($('#sub-Regions-none-urban').val() == '-1' && $('#sub-Regions').val() == '-1' && $('#Regions').val() != '-1') {
                const garphic = Urban_Schools_obj.RegionsFeatures.filter(function (value) {
                    return value['ID'] == $('#Regions').val()
                });

                $('#SUM_POPULATION').text(garphic[0].CITIZENTOTAL)
            }


            if ($('#Regions').val() == '-1' && $('#Directorate').val() != '-1') {
                const garphic = Urban_Schools_obj.DirectorateFeatures.filter(function (value) {
                    return value['MUNICIPALITYID'] == $('#Directorate').val()
                });
                $('#SUM_POPULATION').text(garphic[0].CITIZENTOTAL)
            }

            if ($('#Directorate').val() == '-1') {
                const garphic = Urban_Schools_obj.EmaraFeatures.filter(function (value) {
                    return value['EMIRATEID'] == selectedEmariteId
                });
                $('#SUM_POPULATION').text(garphic[0].CITIZENTOTAL)
            }


            Urban_Schools_obj.AppendSchoolDataList(data, async function () {
                Urban_Schools_obj.AddFeatureLayer(data, async function () {
                Urban_Schools_obj.AppendSchoolAroundDataList(data, async function () {
                    $('#standerd_info').unbind().click(async function () {
                        $('#table_StandrendNew').empty()
                        $('#print').css('display','none')
                        $('#recommendation_value').empty()
                        
                        $('#equation').css('display', 'none')
                        await Urban_Schools_obj.Appendstanderd_info(data)
                    })
                    Urban_Schools_obj.drawChart(data)

                    Urban_Schools_obj.drawChartNotCoverd(data)
                    $('#loading').hide();
                })

                })
            })
            Urban_Schools_obj.getSchoolmorethan40(data)
            
            $('#div_info').css('display', 'block')
            $('#statistics').css('display', 'block')
            $('.accordion').css('display', 'block')


            $('#_info').unbind().click(function () {
                Urban_Schools_obj.AppendSchoolData(data);
            })

            if (data) Urban_Schools_obj.isResults = true;
            })

        }

        Urban_Schools_obj.getDomain = async function(url, feildName, callBack) {
            $.getJSON(url, {
                f: "json",
            })
                .done(function (data) {
                    $.each(data.fields, function (index, value) {
                        if (value.name == feildName) {
                            var domain = value.domain.codedValues;
                            callBack(domain);
                        }
                    });
            });
        }


        Urban_Schools_obj.getSchoolmorethan40 = function(data){
        $('#barChart_div_morthan40').empty()
        var date=new Date().getFullYear()-40
        Urban_Schools_obj.countSchooleMoreThan40=[]
        Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.schoolLayerUrl,
            Urban_Schools_obj.config.conYearField + " <='"+ date +"'  OR " + Urban_Schools_obj.config.conYearField+ " IS  NULL",
            null,
            true,
            ['*'],
            false,
            function (_features) {

            
            var dataArrayAllschool = []
            var dataArray = []
            for (let i = 0; i < _features.length; i++) {
                if( _features[i].attributes[Urban_Schools_obj.config.conYearField]==null){
                    _features[i].attributes[Urban_Schools_obj.config.yearsField]=''
                } else if(new Date().getFullYear()- _features[i].attributes[Urban_Schools_obj.config.conYearField] >= 40){   
                    _features[i].attributes[Urban_Schools_obj.config.yearsField]=new Date().getFullYear()-  _features[i].attributes[Urban_Schools_obj.config.conYearField]+' عام'
                } 
                _features[i].attributes['Occupancy_rate'] = ((_features[i].attributes[Urban_Schools_obj.config.opCapField] / _features[i].attributes[Urban_Schools_obj.config.CapacityField] * 100)).toFixed(2)
                dataArrayAllschool.push(_features[i].attributes)
            }

            for (let i = 0; i < data._attributes.length; i++) {
                if( data._attributes[i][Urban_Schools_obj.config.conYearField]==null){

                } else if(new Date().getFullYear()- data._attributes[i][Urban_Schools_obj.config.conYearField]>=40){    
                    data._attributes[i][Urban_Schools_obj.config.yearsField]=new Date().getFullYear()-  data._attributes[i][Urban_Schools_obj.config.conYearField]+' عام'
                    data._attributes[i]['Occupancy_rate'] = ((data._attributes[i][Urban_Schools_obj.config.opCapField] / data._attributes[i][Urban_Schools_obj.config.CapacityField] * 100)).toFixed(2)
                    dataArray.push(data._attributes[i])
                    Urban_Schools_obj.countSchooleMoreThan40.push(data._attributes[i])
                } 
            }
            
            
            var _columns = [
                { name: Urban_Schools_obj.config.scNameField, title: " اسم المدرسة ", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.CapacityField, title: " السعة الاجمالية", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.opCapField, title: " السعة التشغيلية", breakpoints: "xs sm md" },
                { name: "Occupancy_rate", title: "% نسبة الاشغال", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.scLocationField, title: " موقع المدرسة ", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.SPEDField, title: "عدد الطلاب أصحاب الهمم", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.kinderField, title: " رياض الاطفال  : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cOneField, title: " المرحلة الاولى : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cTwoField, title: " المرحلة الثانية  : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cThreeField, title: " المرحلة الثالثة :", breakpoints: "all" },
                { name: Urban_Schools_obj.config.genderField, title: " الجنس : ", breakpoints: "all" },
                { name: "years", title: "عمرالبناء : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.conYearField, title: "سنة الانشاء :",  breakpoints: "all" },
            ];
        
            $('#barChart_div_morthan40').append(`<h4> 
            عدد المدارس التي عمرها 40 فما فوق داخل نطاق الدراسة تساوي
            <a style='cursor:pointer; display:inline;' id='scooleMorethane40_inside_btn'>${dataArray.length}</a> مدرسة</h4>`)
            $('#barChart_div_morthan40').append(`<h4> 
            مجموع المدارس التي يتجاوز عمرها 40 فما فوق على مستوى الإمارة تساوي
                <a style='cursor:pointer; display:inline;' id='scooleMorethane40_btn'>${_features.length} </a> مدرسة</h4>`)

            $('#scooleMorethane40_btn').click(function(){
                $('#table_SchoolInfoMoreTahn40').append(`<table id="table_buildingInfo" style="text-align: end;" data-sorting="true"  data-paging="true"  data-paging-limit="5"
                data-state="false" class="table " data-empty="لا يوجد بيانات"></table>`)
                $('#table_buildingInfo').empty();
                $('#table_buildingInfo').footable({
                "columns": _columns,
                "rows": JSON.parse(JSON.stringify(dataArrayAllschool))
                });
                $('#SchoolInfoMoreTahn40_Modal').modal('show')
            })
            $('#scooleMorethane40_inside_btn').click(function(){
                $('#table_SchoolInfoMoreTahn40').append(`<table id="table_buildingInfo" style="text-align: end;" data-sorting="true"  data-paging="true"  data-paging-limit="5"
                data-state="false" class="table " data-empty="لا يوجد بيانات"></table>`)
                $('#table_buildingInfo').empty();
                $('#table_buildingInfo').footable({
                "columns": _columns,
                "rows": dataArray
                });
                $('#SchoolInfoMoreTahn40_Modal').modal('show')

            })
            })


        }


        Urban_Schools_obj.calculatinOperatingCapacity_InArea = function (Operating_capacity, total_capacity) {
            $('#calculation_details').empty()
            var contant = ''
            contant += `<tr>`
            contant += `<td>السعة التشغيلية</td>
            <td>السعة الاجمالية </td>
            <td>وصف المعيار</td>

            <td>المعيار</td>
            <td>النتيجة</td>

            </tr>`

            contant += `<tr><td>${Operating_capacity}</td>`
            contant += `<td> ${total_capacity}</td>`
            contant += `<td>اذا كانت نسبة الاشغال اكبر من 90% بحاجة لبناء مدرسة</td>`

            contant += `<td>(${Operating_capacity + ' /' + total_capacity}) > 0.90  </td>`
            contant += `<td> ${(Operating_capacity / total_capacity).toFixed(2)} > 0.90 </td></tr>`
            $('#calculation_details').append(contant)
            $('#calculation_modal').modal('show')

        }


        Urban_Schools_obj.clearAllGraphicLyer = function () {
        for (var i = 0; i < graphicsLayer_Arry.length; i++) {
            if (Urban_Schools_obj[graphicsLayer_Arry[i]]) {
                Urban_Schools_obj[graphicsLayer_Arry[i]].removeAll()
            }
        }
        }


        Urban_Schools_obj.calculatinOperatingCapacity_OutOfArea = function (Operating_capacity, total_capacity) {
            $('#calculation_details').empty()
            var contant = ''
            contant += `<tr>`
            contant += `<td>السعة التشغيلية</td>
            <td>السعة الاجمالية </td>
            <td>وصف المعيار</td>
            <td>المعيار</td>
            <td>نتيجة المعيار</td>

            </tr>`

            contant += `<tr><td>${Operating_capacity}</td>`
            contant += `<td> ${total_capacity}</td>`
            contant += `<td>اذا كانت نسبة الاشغال اكبر من 75% بحاجة لبناء مدرسة</td>`
            contant += `<td>(${Operating_capacity + ' /' + total_capacity}) > 0.75  </td>`
            contant += `<td> ${(Operating_capacity / total_capacity).toFixed(2)} > 0.75 </td></tr>`
            $('#calculation_details').append(contant)
            $('#calculation_modal').modal('show')


        }


        Urban_Schools_obj.calculatinAreaNotcoverd = function(Areagraphic, Areameasurement) {
            $('#calculation_details').empty()
            var contant = ''
            contant += `<tr>`
            contant += `<td>المساحة الغير مفطاة كم²</td>
            <td>وصف المعيار</td>
            <td> المعيار كم²</td>
            <td>نتيجة المعيار</td>

            </tr>`

            contant += `<tr><td>${Areagraphic.toFixed(3)}</td>`
            contant += `<td>اذا كانت مساحة المنطفة الغير مغطاه اكبر من ${Areameasurement} كم² بحاجة لبناء مدرسة</td>`
            contant += `<td> ${Areagraphic.toFixed(3) + ' > ' + Areameasurement}</td>`
            if (Areagraphic > Areameasurement) {
                contant += `<td> المساحة الغير مغطاه اكبر من${Areameasurement}كم² </td>`
            } else {

                contant += `<td> المساحة الغير مغطاه اقل من${Areameasurement}كم² </td>`
            }
            $('#calculation_details').append(contant)
            $('#calculation_modal').modal('show')


        }


        Urban_Schools_obj.calculatinPopulatinStandred = async function(Area, number, Operating_CapacityResult, Operating_CapacityResultOut,totalSchool,countSchooleMoreThan40Filter) {
            $('#table_StandrendNew').empty()
            $('#print').css('display','none')
            var contant = `<tr style='
                background: #b89b5e;
                color: white;'>
            <td style='border: 0.5px solid white !important; '>معايير
            </td>
            <td colspan="9" style='border: 0.5px solid white !important; '>علامة</td>
            
                </tr>
                
                <tr style='background:#bfd6ea;border: 0.5px solid white !important'> 
                <td style='border: 0.5px solid white !important; background: #b89b5e;color: white;'></td>
                <td style='border: 0.5px solid white !important;'>1</td>
                <td style='border: 0.5px solid white !important;'>2</td> 
                <td style='border: 0.5px solid white !important;'>3</td>
                <td style='border: 0.5px solid white !important;'>4</td>
                <td style='border: 0.5px solid white !important;'>5</td>
                <td style='border: 0.5px solid white !important;'>6</td> 
                <td style='border: 0.5px solid white !important;'>7</td>
                <td style='border: 0.5px solid white !important;'>8</td> 
                <td style='border: 0.5px solid white !important;'>9</td>
                

                </tr>

            
                <tr>
                <td style='background:#bfd6ea;border: 0.5px solid white !important;background: #b89b5e;color: white;'>عدد المدارس بناء على عدد المواطنين
                </td>
                <td style='border: 0.5px solid white !important;' id='row1population'   class="1">0</td>
                <td style='border: 0.5px solid white !important;'  id='row2population'  class="2">1</td>
                <td style='border: 0.5px solid white !important;'  id='row3population'  class="3">2</td> 
                <td style='border: 0.5px solid white !important;'  id='row4population'  class="4">3</td>
                <td style='border: 0.5px solid white !important;'  id='row5population'  class="5">4</td>
                <td style='border: 0.5px solid white !important;'  id='row6population'  class="6">5</td>
                <td style='border: 0.5px solid white !important;'  id='row7population'  class="7">6</td> 
                <td style='border: 0.5px solid white !important;'  id='row8population'  class="8">7</td>
                <td style='border: 0.5px solid white !important;'  id='row9population'  class="9">8</td>
                </tr>`
            contant += `  <tr>
            

                
                </tr> 
                
                <tr style='background:#bfd6ea;'>
                <td style='background:#bfd6ea;border: 0.5px solid white !important;background: #b89b5e;color: white;'> المساحة الغير مغطاه كم2
                </td> 
                <td style='border: 0.5px solid white !important;' id='rowArea0' class="1">  => 4</td>
                <td style='border: 0.5px solid white !important;' id='rowArea1' class="2">4.1 - 5  </td>
                <td style='border: 0.5px solid white !important;' id='rowArea2' class="3">5.1 -6 </td> 
                <td style='border: 0.5px solid white !important;' id='rowArea3' class="4"> 6.1 - 7 </td>
                <td style='border: 0.5px solid white !important;' id='rowArea4' class="5"> 7.1 - 8  </td>
                <td style='border: 0.5px solid white !important;' id='rowArea5' class="6">8.1 - 9  </td>
                <td style='border: 0.5px solid white !important;' id='rowArea6' class="7">9.1 - 10 </td> 
                <td style='border: 0.5px solid white !important;' id='rowArea7' class="8">10.1 - 11 </td>
                <td style='border: 0.5px solid white !important;' id='rowArea8' class="9"> <= 11.1 </td>
                </tr>`
            contant += `  <tr>
            
                
                </tr> 
                
                <tr>
                <td style='background:#bfd6ea;border: 0.5px solid white !important;background: #b89b5e;color: white;' >نسبة الاشغال في المنطقة مغطاه

                </td> 
            
                <td style='border: 0.5px solid white !important;'  id="row1Capacity" class="1">10%</td>
                <td style='border: 0.5px solid white !important;' id="row2Capacity" class="2">20%</td>
                <td style='border: 0.5px solid white !important;' id="row3Capacity" class="3">30% </td> 
                <td style='border: 0.5px solid white !important;' id="row4Capacity" class="4">40%</td>
                <td style='border: 0.5px solid white !important;' id="row5Capacity" class="5">50%</td>
                <td style='border: 0.5px solid white !important;' id="row6Capacity" class="6">60%</td>
                <td style='border: 0.5px solid white !important;' id="row7Capacity" class="7">70%</td> 
                <td style='border: 0.5px solid white !important;' id="row8Capacity" class="8">80%</td>
                <td style='border: 0.5px solid white !important;' id="row9Capacity" class="9"> <=90% </td>
                </tr>`
            contant += `  <tr >
            
            
                </tr> 
                
                <tr style='background:#bfd6ea;'>
                <td style='background:#bfd6ea;border: 0.5px solid white !important;background: #b89b5e;color: white;' >نسبة الاشغال في المنطقة الغير مغطاه
                </td> 
                <td style='border: 0.5px solid white !important;' id="row0CapacityOut" class="1">0%</td>
                <td style='border: 0.5px solid white !important;' id="row1CapacityOut" class="2" >5%</td>
                <td style='border: 0.5px solid white !important;' id="row2CapacityOut" class="3" >15%</td> 
                <td style='border: 0.5px solid white !important;' id="row3CapacityOut" class="4" >25%</td>
                <td style='border: 0.5px solid white !important;' id="row4CapacityOut" class="5" >35%</td>
                <td style='border: 0.5px solid white !important;' id="row5CapacityOut" class="6" >45%</td>
                <td style='border: 0.5px solid white !important;' id="row6CapacityOut" class="7" >55%</td> 
                <td style='border: 0.5px solid white !important;' id="row7CapacityOut" class="8" >65%</td>
                <td style='border: 0.5px solid white !important;' id="row8CapacityOut" class="9" ><=75%</td>

                </tr>
                    `
                    contant += `  <tr>
            
            
                    </tr> 
                    
                    <tr>
                    <td style='background:#bfd6ea;border: 0.5px solid white !important;background: #b89b5e;color: white;' >عدد المدارس اكبر من 40 سنة​
                    </td> 
                    <td style='border: 0.5px solid white !important;' id="row1CountSchooleMorThan40" class="1">1</td>
                    <td style='border: 0.5px solid white !important;' id="row2CountSchooleMorThan40" class="2" >2</td>
                    <td style='border: 0.5px solid white !important;' id="row3CountSchooleMorThan40" class="3" >3</td> 
                    <td style='border: 0.5px solid white !important;' id="row4CountSchooleMorThan40" class="4" >4</td>
                    <td style='border: 0.5px solid white !important;' id="row5CountSchooleMorThan40" class="5" >5</td>
                    <td style='border: 0.5px solid white !important;' id="row6CountSchooleMorThan40" class="6" >6</td>
                    <td style='border: 0.5px solid white !important;' id="row7CountSchooleMorThan40" class="7" >7</td> 
                    <td style='border: 0.5px solid white !important;' id="row8CountSchooleMorThan40" class="8" >8</td>
                    <td style='border: 0.5px solid white !important;' id="row9CountSchooleMorThan40" class="9" >9</td>
        
                    </tr>
                    `
            contant += `  <tr style='background:#bfd6ea;'>
        
                <td style="border-bottom: 1px solid white !important;
                border-top: 1px solid white !important;background: white;"></td>
                <td class="row_border" style="background-color:#4acc4a; color:white; border: 1px solid " colspan="3">20 سنوات</td> 
                <td class="row_border" style="background-color:#ff9300; color:white; border: 1px solid " colspan="3">10 سنوات </td> 
                <td class="row_border" style="background-color:#d11111; color:white; border: 1px solid "  colspan="3">5 سنوات
                </td> 
                <td style="border-bottom: 1px solid white !important;
                border-top: 1px solid white !important;background: white;"></td>
                </tr> 

                <tr>
                <td style="border-bottom: 1px solid white !important;
                border-top: 1px solid white !important;"></td>
                <td class="row_border" style="background-color:#149c149e; color:white;border: 0.5px solid white !important;">منخفض</td>
                <td class="row_border"style="background-color:#149c14c7; color:white;border: 0.5px solid white !important;">متوسطة</td>
                <td class="row_border"style="background-color:#149c14; color:white;border: 0.5px solid white !important;">عالي</td> 

                <td class="row_border" style="background-color:#e286089c; color:white;border: 0.5px solid white !important;" >منخفض</td>
                <td class="row_border" style="background-color:#e28608cc; color:white;border: 0.5px solid white !important;">متوسطة</td>
                <td class="row_border" style="background-color:#e28608; color:white;border: 0.5px solid white !important;">عالي</td> 

                <td class="row_border" style="background-color:#d111118a; color:white;border: 0.5px solid white !important;">منخفض</td>
                <td class="row_border" style="background-color:#d11111cf; color:white;border: 0.5px solid white !important;">متوسطة</td>
                <td class="row_border" style="background-color:#d11111; color:white;border: 0.5px solid white !important;">عالي</td> 
                <td style="border-bottom: 1px solid white !important;
                border-top: 1px solid white !important;"></td>
                
                </tr>
                    `
            $('#equation').css('display', 'none');
            $('#table_StandrendNew').append(contant);
            Urban_Schools_obj.standardsResult = {};
            var Standard1
            var Standard2
            var Standard3
            var Standard4
            var Standard5
            var schoolbasedPopulation = ((parseInt($('#SUM_POPULATION').text()) / number)-totalSchool).toFixed(3)
            if (parseInt(schoolbasedPopulation) == 0 || parseInt(schoolbasedPopulation) < 0) {
                $('#row1population').css('background', '#808080d1')
                Standard1 = $('#row1population')[0].className * 0.3;
            } else {

                $(`#row${parseInt(schoolbasedPopulation)}population`).css('background', '#808080d1')
                Standard1 = $(`#row${parseInt(schoolbasedPopulation)}population`)[0].className * 0.3;
            }

            if (Math.ceil(Area) <= 4) {
                $(`#rowArea0`).css('background', '#808080d1')
                Standard2 = $(`#rowArea0`)[0].className * 0.1;
            } else if (Math.ceil(Area) > 4.1 && Math.ceil(Area) <= 5) {
                $(`#rowArea1`).css('background', '#808080d1')
                Standard2 = $(`#rowArea1`)[0].className * 0.1;
            } else if (Math.ceil(Area) > 5.1 && Math.ceil(Area) <= 6) {
                $(`#rowArea2`).css('background', '#808080d1')
                Standard2 = $(`#rowArea2`)[0].className * 0.1;
            } else if (Math.ceil(Area) > 6.1 && Math.ceil(Area) <= 7) {
                $(`#rowArea3`).css('background', '#808080d1')
                Standard2 = $(`#rowArea3`)[0].className * 0.1
            } else if (Math.ceil(Area) > 7.1 && Math.ceil(Area) <= 8) {
                $(`#rowArea4`).css('background', '#808080d1')
                Standard2 = $(`#rowArea4`)[0].className * 0.1
            } else if (Math.ceil(Area) > 8.1 && Math.ceil(Area) <= 9) {
                $(`#rowArea5`).css('background', '#808080d1')
                Standard2 = $(`#rowArea5`)[0].className * 0.1
            } else if (Math.ceil(Area) > 9.1 && Math.ceil(Area) <= 10) {
                $(`#rowArea6`).css('background', '#808080d1')
                Standard2 = $(`#rowArea6`)[0].className * 0.1
            } else if (Math.ceil(Area) > 10.1 && Math.ceil(Area) <= 11) {
                $(`#rowArea7`).css('background', '#808080d1')
                Standard2 = $(`#rowArea7`)[0].className * 0.1
            } else if (Math.ceil(Area) > 11.1) {
                $(`#rowArea8`).css('background', '#808080d1')
                Standard2 = $(`#rowArea8`)[0].className * 0.1
            }
            
            if (Operating_CapacityResult == 0) {
                $(`#row1Capacity`).css('background', '#808080d1')
                Standard3 = $(`#row1Capacity`)[0].className * 0.1
            } else {
                $(`#row${parseInt(Operating_CapacityResult * 10)}Capacity`).css('background', '#808080d1')
                Standard3 = $(`#row${parseInt(Operating_CapacityResult * 10)}Capacity`)[0].className * 0.1
            }

        
            if (Operating_CapacityResultOut < 0.05) {
                $(`#row0CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row0CapacityOut`)[0].className * 0.1
            } else if (Operating_CapacityResultOut > 0.05 && Operating_CapacityResultOut < 0.15) {
                $(`#row1CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row1CapacityOut`)[0].className * 0.1

            } else if (Operating_CapacityResultOut > 0.15 && Operating_CapacityResultOut < 0.25) {
                $(`#row2CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row2CapacityOut`)[0].className * 0.1

            } else if (Operating_CapacityResultOut > 0.25 && Operating_CapacityResultOut < 0.35) {
                $(`#row3CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row3CapacityOut`)[0].className * 0.1

            } else if (Operating_CapacityResultOut > 0.35 && Operating_CapacityResultOut < 0.45) {
                $(`#row4CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row4CapacityOut`)[0].className * 0.1

            } else if (Operating_CapacityResultOut > 0.45 && Operating_CapacityResultOut < 0.55) {
                $(`#row5CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row5CapacityOut`)[0].className * 0.1

            } else if (Operating_CapacityResultOut > 0.55 && Operating_CapacityResultOut < 0.65) {
                $(`#row6CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row6CapacityOut`)[0].className * 0.1

            } else if (Operating_CapacityResultOut >  0.65&& Operating_CapacityResultOut < 0.75) {
                $(`#row7CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row7CapacityOut`)[0].className * 0.1

            }else if(Operating_CapacityResultOut > 0.75){
                $(`#row8CapacityOut`).css('background', '#808080d1')
                Standard4=$(`#row8CapacityOut`)[0].className * 0.1
            }
            // Standard4 = $(`#row${parseInt(Operating_CapacityResultOut)}CapacityOut`)[0].className * 0.1
            if (parseInt(countSchooleMoreThan40Filter) == 0 ) {
                $('#row1CountSchooleMorThan40').css('background', '#808080d1')
                Standard5 = $('#row1CountSchooleMorThan40')[0].className * 0.4
            } else {

                $(`#row${parseInt(countSchooleMoreThan40Filter)}CountSchooleMorThan40`).css('background', '#808080d1')
                Standard5 = $(`#row${parseInt(countSchooleMoreThan40Filter)}CountSchooleMorThan40`)[0].className * 0.4
            }
            var recommendation_value = parseInt(parseFloat(Standard1) + parseFloat(Standard2) + parseFloat(Standard3) + parseFloat(Standard4)+parseFloat(Standard5))
            $('#recommendation_value').empty()
            $('#recommendation_value').append('نتيجة المعادلة ' + ` =  ${(parseFloat(Standard1) + parseFloat(Standard2) + parseFloat(Standard3) + parseFloat(Standard4)+parseFloat(Standard5)).toFixed(1)} `)
            // $('#recommendation_value').append('نتيجة المعادلة :'+`(0.3 * ${parseFloat(Standard1).toFixed(2)}) +  (0.2 * ${parseFloat(Standard2).toFixed(2)}) + (0.4 * ${parseFloat(Standard3).toFixed(2)}) + (0.1 * ${parseFloat(Standard4).toFixed(2)})  =  ${(parseFloat(Standard1)+parseFloat(Standard2)+parseFloat(Standard3)+parseFloat(Standard4)).toFixed()} ` )

            standardsResult.Standard1 = Standard1;
            standardsResult.Standard2 = Standard2;
            standardsResult.Standard3 = Standard3;
            standardsResult.Standard4 = Standard4;
            standardsResult.Standard5 = Standard5;

            var contant2 = `

                <tr>
                <td style="border: 1px solid white;    background: white;"></td>
                <td  style='border: 0.5px solid white !important;' id="recumanded1"></td>
                <td style='border: 0.5px solid white !important; 'id="recumanded2"></td>
                <td style='border: 0.5px solid white !important; 'id="recumanded3"></td> 

                <td style='border: 0.5px solid white !important; 'id="recumanded4"  ></td>
                <td style='border: 0.5px solid white !important; 'id="recumanded5" ></td>
                <td style='border: 0.5px solid white !important; 'id="recumanded6" "></td> 

                <td  style='border: 0.5px solid white !important;' id="recumanded7" ></td>
                <td style='border: 0.5px solid white !important; 'id="recumanded8" ></td>
                <td style='border: 0.5px solid white !important; 'id="recumanded9" ></td> 
                <td style="border: 1px solid white;    background: white;"></td>
                
                </tr>
                    `

            $('#table_StandrendNew').append(contant2)
            $('#label_cycle').text($('#stages option:selected').html())

            if (parseInt(recommendation_value) == 1) {

                $('#recumanded1').append(`<img style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)
            } else if (parseInt(recommendation_value) == 2) {
                $('#recumanded2').append(`<img style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            }
            else if (parseInt(recommendation_value) == 3) {
                $('#recumanded3').append(`<img style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            }
            else if (parseInt(recommendation_value) == 4) {
                $('#recumanded4').append(`<img  style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            }
            else if (parseInt(recommendation_value) == 5) {
                $('#recumanded5').append(`<img  style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            }
            else if (parseInt(recommendation_value) == 6) {
                $('#recumanded6').append(`<img style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            }
            else if (parseInt(recommendation_value) == 7) {
                $('#recumanded7').append(`<img  style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            }
            else if (parseInt(recommendation_value) == 8) {
                $('#recumanded8').append(`<img  style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            }
            else if (parseInt(recommendation_value) == 9 || parseInt(recommendation_value) > 9) {
                $('#recumanded9').append(`<img  style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            } else {
                $('#recumanded1').append(`<img  style=" width: 30px;" src="/webapps/education_facilities/assets/img/check.png">`)

            }
            $('#equation').css('display', 'none');


            $('#print').unbind().click(function () {
                var divText = document.getElementById("standrd_modal").outerHTML;
                var myWindow = window.open('','','width=900,height=600');
                var doc = myWindow.document;
                doc.open();
                doc.write(divText);
                myWindow.print();
                doc.close();
                // var printcontent =divText.clone();
                // // $('body').empty().html(printcontent);
                // setTimeout(() => {
                //   printcontent.print();
                //   // location.reload()
                // }, 200);

            })

        
        }

        Urban_Schools_obj.calculatinPopulatin = function(Total_School, number, describtion) {
            $('#calculation_details').empty()
            var contant = ''
            contant += `<tr>`
            contant += `<td>عدد السكان</td>
            <td> عدد المدارس</td>
            <td>وصف المعيار</td>
            <td>المعيار</td>
            <td>عدد المدارس حسب المعيار</td>

            </tr>`

            contant += `<tr><td>${$('#SUM_POPULATION').text()}</td>`
            contant += `<td> ${Total_School}</td>`
            contant += `<td> ${describtion}</td>`
            contant += `<td>${$('#SUM_POPULATION').text() + '/' + number}  </td>`
            contant += `<td>${(parseInt($('#SUM_POPULATION').text()) / number).toFixed(3)}  </td>`
            $('#calculation_details').append(contant)
            $('#calculation_modal').modal('show')


        }

        Urban_Schools_obj.Appendstanderd_info = async function(data) {

            var calibrator_Kindergarten = (parseInt($('#SUM_POPULATION').text()) / standardAverages.kinderGarten)
            var calibrator_Cycle_1_boy = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleOne)
            var calibrator_Cycle_1_girl = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleOne)
            var calibrator_Cycle_2_boy = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleTwo)
            var calibrator_Cycle_2_girl = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleTwo)
            var calibrator_Cycle_3_boy = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleThree)
            var calibrator_Cycle_3_girl = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleThree)
            var Recommendations_Kindergarten = ''
            var Recommendations_Cycle_1_boy = ''
            var Recommendations_Cycle_1_girl = ''
            var Recommendations_Cycle_2_boy = ''
            var Recommendations_Cycle_2_girl = ''
            var Recommendations_Cycle_3_boy = ''
            var Recommendations_Cycle_3_girl = ''
            var color = ''
            $('#table_Standrend').empty()
            $('#label_cycle').empty()

            
            

            //__New_________________________******************************************____________________________________

            $('#stages').empty()
            $('#stages').append('<option value="-1">الرجاء اختيار المرحلة</option>')
            if (($('#cycle').val().includes('Cycle_0') || $('#cycle').val().length == 0)) {
                $('#stages').append(' <option value="kinder">رياض الاطفال</option>')
            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
                $('#stages').append(' <option value="Cycle_One_boy">المرحلة الاولى ذكور</option>')
            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {
                $('#stages').append('<option value="Cycle_One_girl">المرحلة الاولى إناث</option>')
            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
                $('#stages').append('<option value="Cycle_Two_boy">المرحلة الثانية ذكور</option>')


            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {
                $('#stages').append(' <option value="Cycle_Two_girl">المرحلة الثانية إناث</option>')
            }
            if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
                $('#stages').append('<option value="Cycle_Three_boy"">المرحلة الثالثة ذكور</option>')
            }
            if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {
                $('#stages').append(' <option value="Cycle_Three_girl">المرحلة الثالثة إناث</option>')

            }
            $('#stages').change(async function () {
                if ($(this).val() == 'kinder') {
                    var Operating_CapacityResultOut;
                    var Operating_CapacityResult;
                    if (data.KG_point.length > 0) {
                        var Operating_capacity = 0;
                        var total_capacity = 0;
                        for (var i = 0; i < data.KG_point.length; i++) {
                            Operating_capacity += data.KG_point[i].attributes[Urban_Schools_obj.config.opCapField];
                            total_capacity += data.KG_point[i].attributes[Urban_Schools_obj.config.CapacityField];
                        }
                        Operating_CapacityResult = Operating_capacity / total_capacity;

                } else {
                    Operating_CapacityResult = 0
                }

                if (Urban_Schools_obj.SchoolsOutOfpolygondataKG.length > 0) {
                    var Operating_capacity = 0
                    var total_capacity = 0
                    for (var i = 0; i < Urban_Schools_obj.SchoolsOutOfpolygondataKG.length; i++) {
                        Operating_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataKG[i][Urban_Schools_obj.config.opCapField]
                        total_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataKG[i][Urban_Schools_obj.config.CapacityField]
                    }
                    Operating_CapacityResultOut = Operating_capacity / total_capacity
                } else {
                    Operating_CapacityResultOut = 0
                }
                const countSchooleMoreThan40Filter = Urban_Schools_obj.countSchooleMoreThan40.filter(
                    school =>school.Kindergarten!=null);
                    await Urban_Schools_obj.calculatinPopulatinStandred(data.AreagraphicKinderGarden, standardAverages.kinderGarten, Operating_CapacityResult,
                    Operating_CapacityResultOut, data.Total_Kindergarten_school,countSchooleMoreThan40Filter.length)
                $('#print').css('display','block')
                } else
                if ($(this).val() == 'Cycle_One_boy') {
                    var Operating_CapacityResultOut
                    var Operating_CapacityResult
                    if (Urban_Schools_obj.attributes_Cycle_OneBoy.length > 0) {
                    var Operating_capacity = 0
                    var total_capacity = 0
                    for (var i = 0; i < Urban_Schools_obj.attributes_Cycle_OneBoy.length; i++) {
                        Operating_capacity += Urban_Schools_obj.attributes_Cycle_OneBoy[i][Urban_Schools_obj.config.opCapField]
                        total_capacity += Urban_Schools_obj.attributes_Cycle_OneBoy[i][Urban_Schools_obj.config.CapacityField]
                    }//
                        Operating_CapacityResult = Operating_capacity / total_capacity > 0.90
                    } else {
                        Operating_CapacityResult = 0;
                    }
                    if (Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy.length > 0) {
                        var Operating_capacity = 0
                        var total_capacity = 0
                        for (var i = 0; i < Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy.length; i++) {
                            Operating_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy[i][Urban_Schools_obj.config.opCapField]
                            total_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy[i][Urban_Schools_obj.config.CapacityField]
                        }
                        Operating_CapacityResultOut = Operating_capacity / total_capacity

                    } else {
                        Operating_CapacityResultOut = 0
                    }

                    const countSchooleMoreThan40Filter = Urban_Schools_obj.countSchooleMoreThan40.filter(
                    school =>school.Cycle_One!=null&&school.Gender.includes('ذكور') 
                    ||school.Cycle_One!=null&&school.Gender.includes('مشترك'));
                    await Urban_Schools_obj.calculatinPopulatinStandred(data.Areagraphic_Cycle_OneBoy, standardAverages.cycleOne, 
                    Operating_CapacityResult, Operating_CapacityResultOut,data.Total_Cycle_1_boy_school,countSchooleMoreThan40Filter.length)
                    $('#print').css('display','block')
                } else
                    if ($(this).val() == 'Cycle_One_girl') {
                        var Operating_CapacityResultOut
                        var Operating_CapacityResult

                        if (Urban_Schools_obj.attributes_Cycle_OneGirl.length > 0) {
                            var Operating_capacity = 0
                            var total_capacity = 0
                            for (var i = 0; i < Urban_Schools_obj.attributes_Cycle_OneGirl.length; i++) {
                                Operating_capacity += Urban_Schools_obj.attributes_Cycle_OneGirl[i][Urban_Schools_obj.config.opCapField]
                                total_capacity += Urban_Schools_obj.attributes_Cycle_OneGirl[i][Urban_Schools_obj.config.CapacityField]
                            }
                            Operating_CapacityResult = Operating_capacity / total_capacity;
                    } else {
                        Operating_CapacityResult = 0;
                    }

                    if (Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl.length > 0) {
                        var Operating_capacity = 0
                        var total_capacity = 0
                        for (var i = 0; i < Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl.length; i++) {
                            Operating_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl[i][Urban_Schools_obj.config.opCapField]
                            total_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl[i][Urban_Schools_obj.config.CapacityField]
                        }
                        Operating_CapacityResultOut = Operating_capacity / total_capacity
                    } else {
                        Operating_CapacityResultOut = 0
                    }
                    const countSchooleMoreThan40Filter = Urban_Schools_obj.countSchooleMoreThan40.filter(
                        school =>school.Cycle_One!=null&&school.Gender.includes('إناث') 
                        ||school.Cycle_One!=null&&school.Gender.includes('مشترك'));
                    await Urban_Schools_obj.calculatinPopulatinStandred(data.Areagraphic_Cycle_OneGirl, standardAverages.cycleOne, 
                        Operating_CapacityResult, Operating_CapacityResultOut,data.Total_Cycle_1_girl_school,countSchooleMoreThan40Filter.length)
                    $('#print').css('display','block')
                    } else
                    if ($(this).val() == 'Cycle_Two_boy') {
                        var Operating_CapacityResultOut
                        var Operating_CapacityResult
                        if (Urban_Schools_obj.attributes_Cycle_TwoBoy.length > 0) {
                            var Operating_capacity = 0
                            var total_capacity = 0
                            for (var i = 0; i < Urban_Schools_obj.attributes_Cycle_TwoBoy.length; i++) {
                                Operating_capacity += Urban_Schools_obj.attributes_Cycle_TwoBoy[i][Urban_Schools_obj.config.opCapField]
                                total_capacity += Urban_Schools_obj.attributes_Cycle_TwoBoy[i][Urban_Schools_obj.config.CapacityField]
                            }
                            Operating_CapacityResult = Operating_capacity / total_capacity
                        } else {
                            Operating_CapacityResult = 0
                        }

                        if (Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy.length > 0) {
                            var Operating_capacity = 0
                            var total_capacity = 0
                            for (var i = 0; i < Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy.length; i++) {
                                Operating_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy[i][Urban_Schools_obj.config.opCapField]
                                total_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy[i][Urban_Schools_obj.config.CapacityField]
                            }

                            Operating_CapacityResultOut = Operating_capacity / total_capacity;
                        } else {
                            Operating_CapacityResultOut = 0;
                        }

                        const countSchooleMoreThan40Filter = Urban_Schools_obj.countSchooleMoreThan40.filter(
                            school =>school.Cycle_Two!=null&&school.Gender.includes('ذكور') 
                            ||school.Cycle_Two!=null&&school.Gender.includes('مشترك')
                        );
                        await Urban_Schools_obj.calculatinPopulatinStandred(data.Areagraphic_Cycle_TwoBoy, standardAverages.cycleTwo, 
                        Operating_CapacityResult, Operating_CapacityResultOut,data.Total_Cycle_2_boy_school,countSchooleMoreThan40Filter.length)
                        $('#print').css('display','block')
                    } else
                        if ($(this).val() == 'Cycle_Two_girl') {
                            var Operating_CapacityResultOut
                            var Operating_CapacityResult
                            if (Urban_Schools_obj.attributes_Cycle_TwoGirl.length > 0) {
                                var Operating_capacity = 0
                                var total_capacity = 0
                                for (var i = 0; i < Urban_Schools_obj.attributes_Cycle_TwoGirl.length; i++) {
                                    Operating_capacity += Urban_Schools_obj.attributes_Cycle_TwoGirl[i][Urban_Schools_obj.config.opCapField]
                                    total_capacity += Urban_Schools_obj.attributes_Cycle_TwoGirl[i][Urban_Schools_obj.config.CapacityField]
                                }//
                                Operating_CapacityResult = Operating_capacity / total_capacity
                        } else {
                            Operating_CapacityResult = 0
                        }

                        if (Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl.length > 0) {
                            var Operating_capacity = 0
                            var total_capacity = 0
                            for (var i = 0; i < Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl.length; i++) {
                                Operating_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl[i][Urban_Schools_obj.config.opCapField]
                                total_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl[i][Urban_Schools_obj.config.CapacityField]
                            }
                            Operating_CapacityResultOut = Operating_capacity / total_capacity
                        } else {
                            Operating_CapacityResultOut = 0
                        }
                        const countSchooleMoreThan40Filter = Urban_Schools_obj.countSchooleMoreThan40.filter(
                            school =>school.Cycle_Two!=null&&school.Gender.includes('إناث') 
                            ||school.Cycle_Two!=null&&school.Gender.includes('مشترك'));
                        await Urban_Schools_obj.calculatinPopulatinStandred(data.Areagraphic_Cycle_TwoGirl, standardAverages.cycleTwo,
                            Operating_CapacityResult, Operating_CapacityResultOut,data.Total_Cycle_2_girl_school,countSchooleMoreThan40Filter.length)
                        $('#print').css('display','block')
                        } else
                        if ($(this).val() == 'Cycle_Three_boy') {
                            var Operating_CapacityResultOut
                            var Operating_CapacityResult
                            if (Urban_Schools_obj.attributes_Cycle_ThreeBoy.length > 0) {
                            let Operating_capacity = 0
                            let total_capacity = 0
                            for (var i = 0; i < Urban_Schools_obj.attributes_Cycle_ThreeBoy.length; i++) {
                                Operating_capacity += Urban_Schools_obj.attributes_Cycle_ThreeBoy[i][Urban_Schools_obj.config.opCapField]
                                total_capacity += Urban_Schools_obj.attributes_Cycle_ThreeBoy[i][Urban_Schools_obj.config.CapacityField]
                            }//
                            Operating_CapacityResult = Operating_capacity / total_capacity
                            } else {
                            Operating_CapacityResult = 0
                            }

                            if (Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy.length > 0) {
                            let Operating_capacity = 0
                            let total_capacity = 0
                            for (var i = 0; i < Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy.length; i++) {
                                Operating_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy[i][Urban_Schools_obj.config.opCapField]
                                total_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy[i][Urban_Schools_obj.config.CapacityField]
                            }
                            Operating_CapacityResultOut = Operating_capacity / total_capacity
                            } else {
                            Operating_CapacityResultOut = 0
                            }
                            const countSchooleMoreThan40Filter = Urban_Schools_obj.countSchooleMoreThan40.filter(
                            school =>school.Cycle_Three!=null&&school.Gender.includes('ذكور') 
                            ||school.Cycle_Three!=null&&school.Gender.includes('مشترك'));
                            await Urban_Schools_obj.calculatinPopulatinStandred(data.Areagraphic_Cycle_ThreeBoy, standardAverages.cycleThree, Operating_CapacityResult, 
                            Operating_CapacityResultOut,data.Total_Cycle_3_boy_school,countSchooleMoreThan40Filter.length)
                            $('#print').css('display','block')
                        } else
                            if ($(this).val() == 'Cycle_Three_girl') {
                            var Operating_CapacityResultOut
                            var Operating_CapacityResult

                            if (Urban_Schools_obj.attributes_Cycle_ThreeGirll.length > 0) {
                                let Operating_capacity = 0
                                let total_capacity = 0
                                for (var i = 0; i < Urban_Schools_obj.attributes_Cycle_ThreeGirll.length; i++) {
                                Operating_capacity += Urban_Schools_obj.attributes_Cycle_ThreeGirll[i][Urban_Schools_obj.config.opCapField]
                                total_capacity += Urban_Schools_obj.attributes_Cycle_ThreeGirll[i][Urban_Schools_obj.config.CapacityField]
                                }//
                                Operating_CapacityResult = Operating_capacity / total_capacity
                            } else {
                                Operating_CapacityResult = 0
                            }


                            if (Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl.length > 0) {
                                let Operating_capacity = 0
                                let total_capacity = 0
                                for (var i = 0; i < Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl.length; i++) {
                                Operating_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl[i][Urban_Schools_obj.config.opCapField]
                                total_capacity += Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl[i][Urban_Schools_obj.config.CapacityField]
                                }
                                Operating_CapacityResultOut = Operating_capacity / total_capacity
                            } else {
                                Operating_CapacityResultOut = 0
                            }
                            const countSchooleMoreThan40Filter = Urban_Schools_obj.countSchooleMoreThan40.filter(
                                school =>school.Cycle_Three!=null&&school.Gender.includes('إناث') 
                                ||school.Cycle_Three!=null&&school.Gender.includes('مشترك'));
                            await Urban_Schools_obj.calculatinPopulatinStandred(data.Areagraphic_Cycle_ThreeGirl, standardAverages.cycleThree,
                                Operating_CapacityResult, Operating_CapacityResultOut,data.Total_Cycle_3_girl_school,countSchooleMoreThan40Filter.length)
                            $('#print').css('display','block')
                            } else if($(this).val()=='-1'){
                            $('#table_StandrendNew').empty();
                            $('#recommendation_value').empty();
                            $('#label_cycle').empty();
                            $('#equation').css('display', 'none');
                            $('#print').css('display','none');
                            }
            })

            $('#standrd_modal').modal('show')
        }

        Urban_Schools_obj.interSectLanduse = function(geo) {
            const counts = {};
            var array = []
            $('#table_LandUse').empty()
            Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.landLayerUrl,
                "",
                geo,
                false,
                [Urban_Schools_obj.config.landField],
                false,

                function (_features) {
                if (_features) {
                    var content = ''
                    content += `<table class="table table-striped">
                    <tr style="text-align:center">
                    <th style="text-align: -webkit-center;">عدد الاراضي</th>
                    <th style="text-align: -webkit-center;" >استخدامات الاراضي</th>
                    </tr>`

                    _features.forEach(element => {
                    array.push(element.attributes[Urban_Schools_obj.config.landField])
                    });
                    array.forEach(function (x) {
                    counts[x] = (counts[x] || 0) + 1;
                    });
                    for (const property in counts) {
                    content += '<tr style="text-align:center"><td>' + `${counts[property]}` + '</td><td>' + `${property}` + '</td></tr>'
                    }

                    $('#table_LandUse').append(content)
                } else {

                    $('#table_LandUse').append('<h3 style="direction: rtl;">لا يوجد نتائج</h3>')


                }

                $('#landeuse_modal').modal('show')
                })

        }

        Urban_Schools_obj.AppendSchoolAroundDataList = function (data, callBack) {

            $('#labelnotcover').css('display', 'none')
            // $('#label_standrd').css('display', 'none')
            $('#TabelListNotCoverd').empty()
            var contant = ''
            contant += `<tr>`
            contant += `<td>اسم المرحلة</td>
            <td>عدد المدراس</td>
            <td>مساحة المنطقة الغير مفطاه كم <sup>2</sup></td>
            <td>عددالسكان</td>
            <td>استخدام الأراضي</td>
            </tr>`



            if (($('#cycle').val().includes('Cycle_0') || $('#cycle').val().length == 0)) {

            contant += `<tr></tr><td >رياض الاطفال</td>
            <td  style="cursor: pointer"   onclick=" puplic_Urban_Schools_obj.AppendSchoolNotCoverd(puplic_Urban_Schools_obj.SchoolsOutOfpolygondataKG)">${data.KinderGardenOfpolygonCount}</td>
            <td>${data.AreagraphicKinderGarden.toFixed(3)}</td>
            <td>${Number(data.KG_population).toFixed()}</td>`
            if (Urban_Schools_obj.NotCoverdAreaKinderGarden != null || Urban_Schools_obj.NotCoverdAreaKinderGarden != undefined) {

                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick="puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.NotCoverdAreaKinderGarden)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`
            } else {
                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick="puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.map.graphics.graphics[0].geometry)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`

            }

            contant += `</tr>`

            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {

            contant += `<tr><td >المرحلة الاولى ذكور</td>
            <td   style="cursor: pointer"  onclick=" Urban_Schools_obj.AppendSchoolNotCoverd(puplic_Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy )">${data.Cycle_OneBoyOfpolygonCount}</td>
            <td>${data.Areagraphic_Cycle_OneBoy.toFixed(3)}</td>
            <td>${Number(data.Cy_1_boy_population).toFixed()}</td>`
            if (Urban_Schools_obj.NotCoverdAreaCy_1_boy != null || Urban_Schools_obj.NotCoverdAreaCy_1_boy != undefined) {

                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick="puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.NotCoverdAreaCy_1_boy)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`
            } else {
                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick="puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.map.graphics.graphics[0].geometry)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`

            }

            contant += `</tr>`

            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

            contant += `<tr><td >المرحلة الاولى إناث</td>
            <td  style="cursor: pointer"  onclick=" puplic_Urban_Schools_obj.AppendSchoolNotCoverd(puplic_Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl)">${data.Cycle_OneGirlOfpolygonCount}</td>
            <td>${data.Areagraphic_Cycle_OneGirl.toFixed(3)}</td>
            <td>${Number(data.Cy_1_girl_population).toFixed()}</td>`
            if (Urban_Schools_obj.NotCoverdAreaCy_1_girl != null || Urban_Schools_obj.NotCoverdAreaCy_1_girl != undefined) {

                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.NotCoverdAreaCy_1_girl)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`
            } else {
                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.map.graphics.graphics[0].geometry)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`

            }

            contant += `</tr>`
            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
            contant += `<tr><td >المرحلة الثانية ذكور</td>
            <td  style="cursor: pointer"  onclick=" puplic_Urban_Schools_obj.AppendSchoolNotCoverd(puplic_Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy)">${data.Cycle_TwoBoyOfpolygonCount}</td>
            <td>${data.Areagraphic_Cycle_TwoBoy.toFixed(3)}</td>
            <td>${Number(data.Cy_2_boy_population).toFixed()}</td>`
            if (Urban_Schools_obj.NotCoverdAreaCy_2_boy != null || Urban_Schools_obj.NotCoverdAreaCy_2_boy != undefined) {

                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" Urban_Schools_obj.interSectLanduse(Urban_Schools_obj.NotCoverdAreaCy_2_boy)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`
            } else {
                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" Urban_Schools_obj.interSectLanduse(Urban_Schools_obj.map.graphics.graphics[0].geometry)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`

            }

            contant += ` </tr>`
            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

            contant += `<tr><td >المرحلة الثانية إناث</td>
            <td  style="cursor: pointer"  onclick=" puplic_Urban_Schools_obj.AppendSchoolNotCoverd(puplic_Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl)">${data.Cycle_TwoGirlOfpolygonCount}</td>
            <td>${data.Areagraphic_Cycle_TwoGirl.toFixed(3)}</td>
            <td>${Number(data.Cy_2_girl_population).toFixed()}</td>`
            if (Urban_Schools_obj.NotCoverdAreaCy_2_girl != null || Urban_Schools_obj.NotCoverdAreaCy_2_girl != undefined) {

                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.NotCoverdAreaCy_2_girl)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`
            } else {
                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.map.graphics.graphics[0].geometry)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`

            }

            contant += ` </tr>`

            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
            contant += `<tr><td >المرحلة الثالثة ذكور</td>
            <td  style="cursor: pointer"  onclick=" puplic_Urban_Schools_obj.AppendSchoolNotCoverd(puplic_Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy )">${data.Cycle_ThreeBoyOfpolygonCount}</td>
            <td>${data.Areagraphic_Cycle_ThreeBoy.toFixed(3)}</td>
            <td>${Number(data.Cy_3_boy_population).toFixed()}</td>`
            if (Urban_Schools_obj.NotCoverdAreaCy_3_boy != null || Urban_Schools_obj.NotCoverdAreaCy_3_boy != undefined) {

                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.NotCoverdAreaCy_3_boy)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`
            } else {
                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.map.graphics.graphics[0].geometry)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`

            }

            contant += ` </tr>`

            }
            if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

            contant += `<tr><td >المرحلة الثالثة إناث</td>
            <td style="cursor: pointer" onclick=" puplic_Urban_Schools_obj.AppendSchoolNotCoverd(puplic_Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl)">${data.Cycle_ThreeGirlOfpolygonCount}</td>
            <td>${data.Areagraphic_Cycle_ThreeGirl.toFixed(3)}</td>
                <td>${Number(data.Cy_3_girl_population).toFixed()}</td>`
            if (Urban_Schools_obj.NotCoverdAreaCy_3_girl != null || Urban_Schools_obj.NotCoverdAreaCy_3_girl != undefined) {

                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.NotCoverdAreaCy_3_girl)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`
            } else {
                contant += `<td><img id="landuseOpenmodal_Kindergarten" onclick=" puplic_Urban_Schools_obj.interSectLanduse(puplic_Urban_Schools_obj.map.graphics.graphics[0].geometry)" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>`

            }

            contant += `</tr>`

            }
            $('#labelnotcover').css('display', 'block')
            // $('#label_standrd').css('display', 'block')

            $('#TabelListNotCoverd').append(contant);
            callBack()
        }

        Urban_Schools_obj.AddFeatureLayer = function(data, callBack) {
            Urban_Schools_obj.deleteGrphicsLayer()
            Urban_Schools_obj.SchoolsOutOfpolygondataKG = [];
            Urban_Schools_obj.SchoolsOutOfpolygon_PointGeometryKG = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy_PointGeometry = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl_PointGeometry = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy_PointGeometry = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl_PointGeometry = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy_PointGeometry = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl = [];
            Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl_PointGeometry = [];
            getServiceArea_0(function () {
                getServiceArea_1(function () {
                getServiceArea_2(function () {
                    getServiceArea_3(function () {
                    callBack()
                    })
                })
                })
            })
            function getServiceArea_0(callBack) {
                if (($('#cycle').val().includes('Cycle_0')) || $('#cycle').val().length == 0) {
                var ArryOfId = [];
                var isWithin
                var isWithin2
                Urban_Schools_obj.KinderGardenOfpolygonCount = 0
                Urban_Schools_obj.AreagraphicKinderGarden = 0
                Urban_Schools_obj.NotCoverdAreaKinderGarden
                for (var i = 0; i < data._KG_attributes.length; i++) {
                    ArryOfId.push(data._KG_attributes[i][Urban_Schools_obj.config.scPkField].toString())

                }
                var where = ''
                if (ArryOfId.length > 1) {
                    where = "Name IN('" + ArryOfId.join("','") + "')";
                } else {
                    where = "Name='" + ArryOfId[0] + "'"

                }
                Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.servKinderLayerUrl,
                    where,
                    false,
                    true,
                    ['*'],
                    false,
                    function (_features) {
                    if (_features) {
                        var _geom = []
                        for (var i = 0; i < _features.length; i++) {
                            _geom.push(_features[i].geometry);
                        }

                        var _ugeom =_geom.length > 0 ? geometryEngine.union(_geom) : undefined;

                        if (_ugeom != undefined) {

                        isWithin = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeom);
                        if (isWithin == null) {

                            isWithin = geometryEngine.difference(_ugeom, Urban_Schools_obj.view.graphics.items[0].geometry);

                            isWithin2 = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithin);
                        } else {
                            isWithin2 = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithin);
                        }

                        }
                        var line = new SimpleLineSymbol();
                        line.width = 2.25;
                        line.color = new Color([0, 38, 115, 0.26]);
                        // line.setStyle("dash");
                        var fill = new SimpleFillSymbol();
                        fill.color = new Color([0, 38, 115, 0.26]);//ازرق
                        fill.outline = line;
                        var graphic = new Graphic(isWithin2, fill)

                        Urban_Schools_obj.graphicsLayer_KinderGarden10Min.add(graphic)

                        data.KG_point.forEach(element => {
                        var marker = new PictureMarkerSymbol();
                        marker.xoffset = 0;
                        marker.yoffset = 1;
                        marker.height = 27;
                        marker.width= 25;
                        if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                            marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                        }
                        var sfont = new Font();
                        sfont.size = 15;
                        var stextSym1 = {};
                        stextSym1.type = "text";
                        stextSym1.font = sfont;
                        stextSym1.align= TextSymbol.ALIGN_START;
                        stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                        stextSym1.verticalAlignment = "top"

                        stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                        stextSym1.xoffset = 0;
                        stextSym1.yoffset = -4;
                        var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);
                        var graphicPoint = new Graphic(new Point(element.geometry), marker);
                        Urban_Schools_obj.graphicsLayer_KinderGarden10Min.add(graphicPoint)
                        Urban_Schools_obj.graphicsLayer_KinderGarden10Min.add(graphicPointText)

                        });


                        Urban_Schools_obj.graphicsLayer_KinderGarden10Min.visible = false
                    } else {
                        // Urban_Schools_obj.NotCoverdAreaKinderGarden = Urban_Schools_obj.view.graphics.items[0].geometry
                    }

                    Urban_Schools_obj.intersectserviceArea(Urban_Schools_obj.config.servKinderLayerUrl, Urban_Schools_obj.view.graphics.items[0].geometry, function (_features) {
                        var _geom = []

                        if (_features.length > 0) {
                        for (var i = 0; i < _features.length; i++) {


                            data.NotContain_KG_point.filter(function (value) {

                            if (value.attributes[Urban_Schools_obj.config.scPkField] == _features[i].attributes[Urban_Schools_obj.config.servPkField]) {
                                _geom.push(_features[i].geometry);
                                Urban_Schools_obj.SchoolsOutOfpolygondataKG.push(value.attributes)
                                Urban_Schools_obj.SchoolsOutOfpolygon_PointGeometryKG.push(value)
                                data.KinderGardenOfpolygonCount++
                                // Urban_Schools_obj.SchoolsOutOfpolygondataKG.push(_features[i])
                            }
                            })

                        }
                        Urban_Schools_obj.SchoolsOutOfpolygon_PointGeometryKG.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }
                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);
                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_KinderGarden10Min.add(graphicPoint)
                            Urban_Schools_obj.graphicsLayer_KinderGarden10Min.add(graphicPointText)

                        });
                        var _ugeom = _geom.length > 0 ? geometryEngine.union(_geom) : undefined;
                        if (_ugeom != undefined) {

                            Urban_Schools_obj.NotCoverdAreaKinderGarden = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeom);
                            if (Urban_Schools_obj.NotCoverdAreaKinderGarden != null) {
                                data.AreagraphicKinderGarden = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaKinderGarden, "square-kilometers")
                            } else {
                                data.AreagraphicKinderGarden = 0
                            }
                        } else {
                            Urban_Schools_obj.NotCoverdAreaKinderGarden = Urban_Schools_obj.view.graphics.items[0].geometry

                            data.AreagraphicKinderGarden = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaKinderGarden, "square-kilometers")
                        }

                        } else {
                            Urban_Schools_obj.NotCoverdAreaKinderGarden = Urban_Schools_obj.view.graphics.items[0].geometry

                            // Urban_Schools_obj.graphicsLayer_KinderGarden10Min.add(graphic)
                            data.AreagraphicKinderGarden = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaKinderGarden, "square-kilometers")
                        }

                        var line = new SimpleLineSymbol();
                        line.width = 5;
                        line.color = new Color([255, 170, 0, 1]);
                        // line.setStyle("dash");
                        var fill = new SimpleFillSymbol();
                        fill.style= "cross";
                        fill.outline = line;
                        fill.color = new Color([0, 168, 132, 0.7]);
                        var graphic;
                        if (isWithin2 != undefined && Urban_Schools_obj.NotCoverdAreaKinderGarden != null) {
                            graphic = new Graphic(geometryEngine.difference(Urban_Schools_obj.NotCoverdAreaKinderGarden, isWithin2)
                                , fill)
                        } else {
                            graphic = new Graphic(Urban_Schools_obj.NotCoverdAreaKinderGarden, fill)
                        }

                        Urban_Schools_obj.graphicsLayer_KinderGarden10Min.add(graphic);
                        Urban_Schools_obj.IntersectPopulationGrid(Urban_Schools_obj.NotCoverdAreaKinderGarden, data, function (res) {
                        data.KG_population = res,
                            callBack()
                        })

                    })
                    })
                } else {
                callBack()
                }
            }

            function getServiceArea_1(callBack) {
                if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField)) || $('#cycle').val().length == 0) {
                var ArryOfId = [];
                var ArryOfIdBoy = []
                var ArryOfIdgirl = []
                Urban_Schools_obj.NotCoverdAreaCy_1_boy
                Urban_Schools_obj.NotCoverdAreaCy_1_girl
                var isWithinboy
                var isWithin2boy
                var isWithingirl
                var isWithin2girl

                Urban_Schools_obj.Cycle_OneBoyOfpolygonCount = 0
                Urban_Schools_obj.Cycle_OneGirlOfpolygonCount = 0
                Urban_Schools_obj.Areagraphic_Cycle_OneBoy = 0
                Urban_Schools_obj.Areagraphic_Cycle_OneGirl = 0
                Urban_Schools_obj.attributes_Cycle_OneBoy = []
                Urban_Schools_obj.attributes_Cycle_OneGirl = []
                for (var i = 0; i < data._cy1_attributes.length; i++) {
                    ArryOfId.push(data._cy1_attributes[i][Urban_Schools_obj.config.scPkField].toString())
                    if (data._cy1_attributes[i][Urban_Schools_obj.config.genderField].includes('ذكور') || data._cy1_attributes[i][Urban_Schools_obj.config.genderField].includes('مشترك')) {
                        ArryOfIdBoy.push(data._cy1_attributes[i][Urban_Schools_obj.config.scPkField].toString())
                        Urban_Schools_obj.attributes_Cycle_OneBoy.push(data._cy1_attributes[i])
                    }
                    if (data._cy1_attributes[i][Urban_Schools_obj.config.genderField].includes('إناث') || data._cy1_attributes[i][Urban_Schools_obj.config.genderField].includes('مشترك')) {
                        ArryOfIdgirl.push(data._cy1_attributes[i][Urban_Schools_obj.config.scPkField].toString())
                        Urban_Schools_obj.attributes_Cycle_OneGirl.push(data._cy1_attributes[i])
                    }

                }
                var where = ''
                if (ArryOfId.length > 1) {
                    where = "Name IN('" + ArryOfId.join("','") + "')";
                } else {
                    where = "Name='" + ArryOfId[0] + "'"
                }

                Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.servCycleOneLayerUrl,
                    where,
                    false,
                    true,
                    ['*'],
                    false,
                    function (_features) {
                    if (_features) {
                        var _geomboy = [];
                        var _geomgirl = [];

                        for (var i = 0; i < _features.length; i++) {
                        if (ArryOfIdBoy.includes(_features[i].attributes[Urban_Schools_obj.config.servPkField])) {
                            _geomboy.push(_features[i].geometry);


                        }
                        if (ArryOfIdgirl.includes(_features[i].attributes[Urban_Schools_obj.config.servPkField])) {

                            _geomgirl.push(_features[i].geometry);

                        }
                        }

                        var _ugeomboy = _geomboy.length > 0 ? geometryEngine.union(_geomboy) : undefined;
                        var _ugeomgirl = _geomgirl.length > 0 ? geometryEngine.union(_geomgirl) : undefined;
                        if (_ugeomboy != undefined) {
                        isWithinboy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeomboy);
                        if (isWithinboy == null) {
                            isWithinboy = geometryEngine.difference(_ugeomboy, Urban_Schools_obj.view.graphics.items[0].geometry);
                            isWithin2boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithinboy);

                        } else {

                            isWithin2boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithinboy);

                        }

                        }

                        if (_ugeomgirl != undefined) {
                        isWithingirl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeomgirl);

                        if (isWithingirl == null) {
                            isWithingirl = geometryEngine.difference(_ugeomgirl, Urban_Schools_obj.view.graphics.items[0].geometry);
                            isWithin2girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithingirl);

                        } else {

                            isWithin2girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithingirl);
                        }

                        }

                        if ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0) {


                        var line = new SimpleLineSymbol();
                        line.width = 2.25;
                        line.color = new Color([0, 38, 115, 0.26]);
                        // line.setStyle("dash");
                        var fill_boy = new SimpleFillSymbol();
                        fill_boy.color = new Color([71, 71, 71, .65]);//اخضر
                        fill_boy.outline = line;
                        var graphic = new Graphic(isWithin2boy, fill_boy)
                        Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.add(graphic)
                        data.Cy_1_boy_point.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width = 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }
                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"
                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);
                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.add(graphicPointText)

                            Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.add(graphicPoint)
                        });

                        Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.visible = false

                        }
                        if ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0) {
                        var fill_girl = new SimpleFillSymbol();
                        fill_girl.color = new Color([76, 0, 115, .65]); //نهدي
                        fill_girl.outline = line;
                        var graphic = new Graphic(isWithin2girl, fill_girl)
                        Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.add(graphic)
                        data.Cy_1_girl_point.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }
                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top";

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);


                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.add(graphicPoint)
                            Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.add(graphicPointText)

                        });

                        Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.visible = false


                        }
                    } else {

                    }
                    Urban_Schools_obj.intersectserviceArea(Urban_Schools_obj.config.servCycleOneLayerUrl, Urban_Schools_obj.view.graphics.items[0].geometry, function (_features) {
                        var _geom = []
                        if (_features.length > 0) {
                        for (var i = 0; i < _features.length; i++) {


                            data.NotContain_Cy_1_boy_point.filter(function (value) {

                            if (value.attributes[Urban_Schools_obj.config.scPkField] == _features[i].attributes[Urban_Schools_obj.config.servPkField]) {
                                _geom.push(_features[i].geometry);
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy.push(value.attributes)
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy_PointGeometry.push(value)
                                data.Cycle_OneBoyOfpolygonCount++
                            }
                            })
                        }
                        Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy_PointGeometry.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }
                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.type = 'text';
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"
                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);
                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.add(graphicPointText)

                            Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.add(graphicPoint)
                        });
                        var _ugeom = _geom.length > 0 ? geometryEngine.union(_geom) : undefined;
                        if (_ugeom != undefined) {

                            Urban_Schools_obj.NotCoverdAreaCy_1_boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeom);
                            if (Urban_Schools_obj.NotCoverdAreaCy_1_boy != null) {

                            data.Areagraphic_Cycle_OneBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_1_boy, "square-kilometers")
                            } else {
                            data.Areagraphic_Cycle_OneBoy = 0
                            }
                        } else {
                            Urban_Schools_obj.NotCoverdAreaCy_1_boy = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_OneBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_1_boy, "square-kilometers")
                        }

                        } else {
                        Urban_Schools_obj.NotCoverdAreaCy_1_boy = Urban_Schools_obj.view.graphics.items[0].geometry
                        data.Areagraphic_Cycle_OneBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_1_boy, "square-kilometers")
                        }

                        var line = new SimpleLineSymbol();
                        line.width = 5;
                        line.color = new Color([255, 170, 0, 1]);
                        var fill = new SimpleFillSymbol();
                        fill.style= "cross";
                        fill.outline = line;
                        fill.color = new Color([0, 168, 132, 0.7]);
                        var graphic
                        if (isWithin2boy != undefined && Urban_Schools_obj.NotCoverdAreaCy_1_boy != null) {
                        graphic = new Graphic(geometryEngine.difference(
                            Urban_Schools_obj.NotCoverdAreaCy_1_boy, isWithin2boy), fill)
                        } else {
                        graphic = new Graphic(Urban_Schools_obj.NotCoverdAreaCy_1_boy, fill)
                        }
                        Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.add(graphic)
                        Urban_Schools_obj.intersectserviceArea(Urban_Schools_obj.config.servCycleOneLayerUrl, Urban_Schools_obj.view.graphics.items[0].geometry, function (_features) {


                        var _geom = []
                        if (_features.length > 0) {
                            for (var i = 0; i < _features.length; i++) {


                            data.NotContain_Cy_1_girl_point.filter(function (value) {

                                if (value.attributes[Urban_Schools_obj.config.scPkField] == _features[i].attributes[Urban_Schools_obj.config.servPkField]) {
                                    _geom.push(_features[i].geometry);
                                    Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl.push(value.attributes)
                                    Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl_PointGeometry.push(value)
                                    data.Cycle_OneGirlOfpolygonCount++
                                }
                            })
                            }
                            Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl_PointGeometry.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;

                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField] >= 40 ){
                                marker.url = "/webapps/education_facilities/assets/img/pin.png";
                                } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }
                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top";

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);


                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.add(graphicPoint)
                            Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.add(graphicPointText)

                            });
                            var _ugeom = _geom.length > 0 ? geometryEngine.union(_geom) : undefined;
                            if (_ugeom != undefined) {
                            Urban_Schools_obj.NotCoverdAreaCy_1_girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeom);
                            if (Urban_Schools_obj.NotCoverdAreaCy_1_girl != null) {
                                data.Areagraphic_Cycle_OneGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_1_girl, "square-kilometers")
                            } else {
                                data.Areagraphic_Cycle_OneGirl = 0
                            }
                            } else {
                            Urban_Schools_obj.NotCoverdAreaCy_1_girl = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_OneGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_1_girl, "square-kilometers")
                            }

                        } else {
                            Urban_Schools_obj.NotCoverdAreaCy_1_girl = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_OneGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_1_girl, "square-kilometers")
                        }


                        var line = new SimpleLineSymbol();
                        line.width = 5;
                        line.color = new Color([255, 170, 0, 1]);
                        var fill = new SimpleFillSymbol();
                        fill.style= "cross";
                        fill.outline = line;
                        fill.color = new Color([0, 168, 132, 0.7]);
                        var graphic
                        if (isWithin2girl != undefined && Urban_Schools_obj.NotCoverdAreaCy_1_girl != null) {
                            graphic = new Graphic(geometryEngine.difference(Urban_Schools_obj.NotCoverdAreaCy_1_girl, isWithin2girl), fill)
                        } else {
                            graphic = new Graphic(Urban_Schools_obj.NotCoverdAreaCy_1_girl, fill)

                        }
                        Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.add(graphic)


                        Urban_Schools_obj.IntersectPopulationGrid(Urban_Schools_obj.NotCoverdAreaCy_1_boy, data, function (resboy) {
                            data.Cy_1_boy_population = resboy
                            Urban_Schools_obj.IntersectPopulationGrid(Urban_Schools_obj.NotCoverdAreaCy_1_girl, data, function (resgirl) {
                            data.Cy_1_girl_population = resgirl
                            callBack()

                            })
                        })


                        })

                    })
                    })

                } else {
                callBack()
                }
            }
            function getServiceArea_2(callBack) {
                if (($('#cycle').val().includes('Cycle_Two')) || $('#cycle').val().length == 0) {
                var ArryOfId = [];
                var ArryOfIdBoy = []
                var ArryOfIdgirl = []
                var isWithinboy
                var isWithin2boy
                var isWithingirl
                var isWithin2girl
                Urban_Schools_obj.NotCoverdAreaCy_2_boy
                Urban_Schools_obj.NotCoverdAreaCy_2_girl
                Urban_Schools_obj.Cycle_TwoBoyOfpolygonCount = 0
                Urban_Schools_obj.Cycle_TwoGirlOfpolygonCount = 0
                Urban_Schools_obj.Areagraphic_Cycle_TwoBoy = 0
                Urban_Schools_obj.Areagraphic_Cycle_TwoGirl = 0
                Urban_Schools_obj.attributes_Cycle_TwoBoy = []
                Urban_Schools_obj.attributes_Cycle_TwoGirl = []
                for (var i = 0; i < data._cy2_attributes.length; i++) {
                    ArryOfId.push(data._cy2_attributes[i][Urban_Schools_obj.config.scPkField].toString())
                    if (data._cy2_attributes[i][Urban_Schools_obj.config.genderField].includes('ذكور') || data._cy2_attributes[i][Urban_Schools_obj.config.genderField].includes('مشترك')) {
                    ArryOfIdBoy.push(data._cy2_attributes[i][Urban_Schools_obj.config.scPkField].toString())
                    Urban_Schools_obj.attributes_Cycle_TwoBoy.push(data._cy2_attributes[i])
                    }
                    if (data._cy2_attributes[i][Urban_Schools_obj.config.genderField].includes('إناث') || data._cy2_attributes[i][Urban_Schools_obj.config.genderField].includes('مشترك')) {
                    ArryOfIdgirl.push(data._cy2_attributes[i][Urban_Schools_obj.config.scPkField].toString())
                    Urban_Schools_obj.attributes_Cycle_TwoGirl.push(data._cy2_attributes[i])

                    }

                }
                var where = ''
                if (ArryOfId.length > 1) {
                    where = `Name IN('${ArryOfId.join("','")}')`;

                } else {
                    where = `Name='${ArryOfId[0]}'`

                }
                Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.servCycleTwoLayerUrl,
                    where,
                    false,
                    true,
                    ['*'],
                    false,
                    function (_features) {

                    if (_features) {
                        // var _ugeomboy = _features[0].geometry;
                        var _geomboy = [];
                        var _geomgirl = [];

                        for (var i = 0; i < _features.length; i++) {
                            if (ArryOfIdBoy.includes(_features[i].attributes[Urban_Schools_obj.config.servPkField])) {
                                _geomboy.push(_features[i].geometry);
                            }

                            if (ArryOfIdgirl.includes(_features[i].attributes[Urban_Schools_obj.config.servPkField])) {
                                _geomgirl.push(_features[i].geometry);
                            }
                        }

                        var _ugeomboy = _geomboy.lenght > 0 ? geometryEngine.union(_geomboy) : undefined;
                        var _ugeomgirl = _geomgirl.length > 0 ? geometryEngine.union(_geomgirl) : undefined;
                        if (_ugeomboy != undefined) {

                        isWithinboy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeomboy);

                        if (isWithinboy == null) {
                            isWithinboy = geometryEngine.difference(_ugeomboy, Urban_Schools_obj.view.graphics.items[0].geometry);
                            isWithin2boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithinboy);
                        } else {

                            isWithin2boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithinboy);

                        }
                        Urban_Schools_obj.NotCoverdAreaCy_2_boy = isWithinboy

                        Urban_Schools_obj.Tabel2data_Cycle_TowBoy = {
                            'name': 'رياض الاطفال',
                            'area': data.Areagraphic_Cycle_TwoBoy,
                            'numberSchools': data.Cycle_TwoBoyOfpolygonCount
                        }
                        }
                        if (_ugeomgirl != undefined) {
                        isWithingirl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeomgirl);

                        if (isWithingirl == null) {
                            isWithingirl = geometryEngine.difference(_ugeomgirl, Urban_Schools_obj.view.graphics.items[0].geometry);
                            isWithin2girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithingirl);

                        } else {

                            isWithin2girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithingirl);

                        }

                        }
                        if ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0) {


                        var line = new SimpleLineSymbol();
                        line.width = 2.25;
                        line.color = new Color([0, 38, 115, 0.26]);
                        line.style = "dash";
                        var fill = new SimpleFillSymbol();
                        fill.color = new Color([230, 0, 0, .65]);//احمر
                        fill.outline = line;
                        var graphic = new Graphic(isWithin2boy, fill)
                        Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.add(graphic)


                        data.Cy_2_boy_point.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width = 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }
                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);

                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.add(graphicPoint)
                            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.add(graphicPointText)

                        });
                        Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.visible = false

                        }

                        if ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0) {
                        var fill_girl = new SimpleFillSymbol();
                        fill_girl.color = new Color([0, 115, 76, .65]);//نهدي
                        fill_girl.outline = line;
                        var graphic = new Graphic(isWithin2girl, fill_girl)
                        Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.add(graphic)

                        data.Cy_2_girl_point.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }

                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);


                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.add(graphicPoint)
                            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.add(graphicPointText)

                        });
                        Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.visible = false

                        }

                    }
                    Urban_Schools_obj.intersectserviceArea(Urban_Schools_obj.config.servCycleTwoLayerUrl, Urban_Schools_obj.view.graphics.items[0].geometry, function (_features) {


                        var _geom = []
                        if (_features.length > 0) {
                        for (var i = 0; i < _features.length; i++) {


                            data.NotContain_Cy_2_boy_point.filter(function (value) {

                            if (value.attributes[Urban_Schools_obj.config.scPkField] == _features[i].attributes[Urban_Schools_obj.config.servPkField]) {
                                _geom.push(_features[i].geometry);
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy.push(value.attributes)
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy_PointGeometry.push(value)
                                data.Cycle_TwoBoyOfpolygonCount++
                            }
                            })
                        }
                        Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy_PointGeometry.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }
                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);

                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.add(graphicPoint)
                            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.add(graphicPointText)

                        });
                        var _ugeom = _geom.length > 0 ? geometryEngine.union(_geom) : undefined;
                        if (_ugeom != undefined) {

                            Urban_Schools_obj.NotCoverdAreaCy_2_boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeom);
                            if (Urban_Schools_obj.NotCoverdAreaCy_2_boy != null) {

                            data.Areagraphic_Cycle_TwoBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_2_boy, "square-kilometers")
                            } else {
                            data.Areagraphic_Cycle_TwoBoy = 0
                            }
                        } else {
                            Urban_Schools_obj.NotCoverdAreaCy_2_boy = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_TwoBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_2_boy, "square-kilometers")
                        }

                        } else {
                        Urban_Schools_obj.NotCoverdAreaCy_2_boy = Urban_Schools_obj.view.graphics.items[0].geometry
                        data.Areagraphic_Cycle_TwoBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_2_boy, "square-kilometers")
                        }

                        var line = new SimpleLineSymbol();
                        line.width = 5;
                        line.color = new Color([255, 170, 0, 1]);
                        var fill = new SimpleFillSymbol();
                        fill.style= "cross";
                        fill.outline = line;
                        fill.color = new Color([0, 168, 132, 0.7]);
                        var graphic
                        if (isWithin2boy != undefined && Urban_Schools_obj.NotCoverdAreaCy_2_boy != null) {
                        graphic = new Graphic(geometryEngine.difference(Urban_Schools_obj.NotCoverdAreaCy_2_boy, isWithin2boy), fill)
                        } else {
                        graphic = new Graphic(Urban_Schools_obj.NotCoverdAreaCy_2_boy, fill)

                        }
                        Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.add(graphic)
                        Urban_Schools_obj.intersectserviceArea(Urban_Schools_obj.config.servCycleTwoLayerUrl, Urban_Schools_obj.view.graphics.items[0].geometry, function (_features) {

                        var _geom = []
                        if (_features.length > 0) {
                            for (var i = 0; i < _features.length; i++) {


                            data.NotContain_Cy_2_girl_point.filter(function (value) {

                                if (value.attributes[Urban_Schools_obj.config.scPkField] == _features[i].attributes[Urban_Schools_obj.config.servPkField]) {
                                _geom.push(_features[i].geometry);
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl.push(value.attributes)
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl_PointGeometry.push(value)

                                data.Cycle_TwoGirlOfpolygonCount++
                                }
                            })
                            }
                            Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl_PointGeometry.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                                marker.url = "/webapps/education_facilities/assets/img/pin.png";
                                } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }

                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);


                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.add(graphicPoint)
                            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.add(graphicPointText)

                            });
                            var _ugeom = _geom.length > 0 ? geometryEngine.union(_geom) : undefined;
                            if (_ugeom != undefined) {

                            Urban_Schools_obj.NotCoverdAreaCy_2_girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeom);

                            if (Urban_Schools_obj.NotCoverdAreaCy_2_girl != null) {

                                data.Areagraphic_Cycle_TwoGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_2_girl, "square-kilometers")
                            } else {
                                data.Areagraphic_Cycle_TwoGirl = 0
                            }
                            } else {
                            Urban_Schools_obj.NotCoverdAreaCy_2_girl = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_TwoGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_2_girl, "square-kilometers")
                            }

                        } else {
                            Urban_Schools_obj.NotCoverdAreaCy_2_girl = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_TwoGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_2_girl, "square-kilometers")
                        }

                        var line = new SimpleLineSymbol();
                        line.width = 5;
                        line.color = new Color([255, 170, 0, 1]);
                        // line.setStyle("dash");
                        var fill = new SimpleFillSymbol();
                        fill.style= "cross";
                        fill.outline = line;
                        fill.color = new Color([0, 168, 132, 0.7]);
                        var graphic
                        if (isWithin2girl != undefined && Urban_Schools_obj.NotCoverdAreaCy_2_girl != null) {
                            graphic = new Graphic(geometryEngine.difference(Urban_Schools_obj.NotCoverdAreaCy_2_girl, isWithin2girl), fill)
                        } else {
                            graphic = new Graphic(Urban_Schools_obj.NotCoverdAreaCy_2_girl, fill)

                        }
                        Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.add(graphic)
                        Urban_Schools_obj.IntersectPopulationGrid(Urban_Schools_obj.NotCoverdAreaCy_2_boy, data, function (resboy) {
                            data.Cy_2_boy_population = resboy
                            Urban_Schools_obj.IntersectPopulationGrid(Urban_Schools_obj.NotCoverdAreaCy_2_girl, data, function (resgirl) {
                            data.Cy_2_girl_population = resgirl

                            callBack()

                            })
                        })

                        })
                    })
                    })
                } else {
                callBack()
                }
            }
            function getServiceArea_3(callBack) {

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField)) || $('#cycle').val().length == 0) {
                var ArryOfId = [];
                var ArryOfIdBoy = []
                var ArryOfIdgirl = []
                var isWithinboy
                var isWithin2boy
                var isWithingirl
                var isWithin2girl
                Urban_Schools_obj.NotCoverdAreaCy_3_boy
                Urban_Schools_obj.NotCoverdAreaCy_3_girl
                Urban_Schools_obj.Cycle_ThreeBoyOfpolygonCount = 0
                Urban_Schools_obj.Cycle_ThreeGirlOfpolygonCount = 0
                Urban_Schools_obj.Areagraphic_Cycle_ThreeBoy = 0
                Urban_Schools_obj.Areagraphic_Cycle_ThreeGirl = 0
                Urban_Schools_obj.attributes_Cycle_ThreeBoy = []
                Urban_Schools_obj.attributes_Cycle_ThreeGirll = []
                for (var i = 0; i < data._cy3_attributes.length; i++) {
                    ArryOfId.push(data._cy3_attributes[i][Urban_Schools_obj.config.scPkField].toString())
                    if (data._cy3_attributes[i][Urban_Schools_obj.config.genderField].includes('ذكور') || data._cy3_attributes[i][Urban_Schools_obj.config.genderField].includes('مشترك')) {
                    ArryOfIdBoy.push(data._cy3_attributes[i][Urban_Schools_obj.config.scPkField].toString())

                    Urban_Schools_obj.attributes_Cycle_ThreeBoy.push(data._cy3_attributes[i])
                    }
                    if (data._cy1_attributes[i][Urban_Schools_obj.config.genderField].includes('إناث') || data._cy3_attributes[i][Urban_Schools_obj.config.genderField].includes('مشترك')) {
                    ArryOfIdgirl.push(data._cy3_attributes[i][Urban_Schools_obj.config.scPkField].toString())
                    Urban_Schools_obj.attributes_Cycle_ThreeGirll.push(data._cy3_attributes[i])
                    }

                }
                var where = ''
                if (ArryOfId.length > 1) {
                    where = "Name IN('" + ArryOfId.join("','") + "')";
                } else {
                    where = "Name='" + ArryOfId[0] + "'"

                }
                Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.servCycleThreeLayerUrl,
                    where,
                    false,
                    true,
                    ['*'],
                    false,
                    function (_features) {
                    if (_features) {

                        var _geomboy = [];
                        var _geomgirl = [];

                        for (var i = 0; i < _features.length; i++) {
                        if (ArryOfIdBoy.includes(_features[i].attributes[Urban_Schools_obj.config.servPkField])) {
                            _geomboy.push(_features[i].geometry);

                        }
                        if (ArryOfIdgirl.includes(_features[i].attributes[Urban_Schools_obj.config.servPkField])) {

                            _geomgirl.push(_features[i].geometry);

                        }
                        }

                        var _ugeomboy = _geomboy.length > 0 ? geometryEngine.union(_geomboy) : undefined;
                        var _ugeomgirl = _geomgirl.length > 0 ? geometryEngine.union(_geomgirl) : undefined;
                        if (_ugeomboy != undefined) {
                        isWithinboy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeomboy);

                        if (isWithinboy == null) {
                            isWithinboy = geometryEngine.difference(_ugeomboy, Urban_Schools_obj.view.graphics.items[0].geometry);
                            isWithin2boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithinboy);

                        } else {

                            isWithin2boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithinboy);

                        }

                        }

                        if (_ugeomgirl != undefined) {
                        isWithingirl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeomgirl);

                        if (isWithingirl == null) {
                            isWithingirl = geometryEngine.difference(_ugeomgirl, Urban_Schools_obj.view.graphics.items[0].geometry);
                            isWithin2girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithingirl);

                        } else {

                            isWithin2girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, isWithingirl);

                        }


                        }
                        if ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0) {

                        var line = new SimpleLineSymbol();
                        line.width = 2.25;
                        line.color = new Color([0, 38, 115, 0.26]);
                        line.style = "dash";
                        var fill = new SimpleFillSymbol();
                        fill.color = new Color([255, 170, 0, .65]);//احمر
                        fill.outline = line;
                        var graphic = new Graphic(isWithin2boy, fill)
                        Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.add(graphic)


                        data.Cy_3_boy_point.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                                marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }

                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);


                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.add(graphicPointText)
                            Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.add(graphicPoint)
                        });
                        Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.visible = false

                        }

                        if ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0) {
                        var fill_girl = new SimpleFillSymbol();
                        fill_girl.color = new Color([0, 255, 197, .65]);//سكني
                        fill_girl.outline = line;
                        var graphic = new Graphic(isWithin2girl, fill_girl)
                        Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.add(graphic)


                        data.Cy_3_girl_point.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }

                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);


                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.add(graphicPointText)

                            Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.add(graphicPoint)
                        });//
                        Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.visible = false
                        }

                    }


                    Urban_Schools_obj.intersectserviceArea(Urban_Schools_obj.config.servCycleTwoLayerUrl, Urban_Schools_obj.view.graphics.items[0].geometry, function (_features) {

                        var _geom = []
                        if (_features.length > 0) {
                        for (var i = 0; i < _features.length; i++) {


                            data.NotContain_Cy_3_boy_point.filter(function (value) {

                            if (value.attributes[Urban_Schools_obj.config.scPkField] == _features[i].attributes[Urban_Schools_obj.config.servPkField]) {
                                _geom.push(_features[i].geometry);
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy.push(value.attributes)
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy_PointGeometry.push(value)
                                data.Cycle_ThreeBoyOfpolygonCount++
                            }
                            })
                        }
                        Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy_PointGeometry.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                            marker.url = "/webapps/education_facilities/assets/img/pin.png";
                            } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }

                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);


                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.add(graphicPointText)
                            Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.add(graphicPoint)
                        });
                        var _ugeom = _geom.length > 0 ? geometryEngine.union(_geom) : undefined;
                        if (_ugeom != undefined) {

                            Urban_Schools_obj.NotCoverdAreaCy_3_boy = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeom);
                            if (Urban_Schools_obj.NotCoverdAreaCy_3_boy != null) {
                            data.Areagraphic_Cycle_ThreeBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_3_boy, "square-kilometers")
                            } else {
                            data.Areagraphic_Cycle_ThreeBoy = 0
                            }
                        } else {
                            Urban_Schools_obj.NotCoverdAreaCy_3_boy = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_ThreeBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_3_boy, "square-kilometers")
                        }

                        } else {
                        Urban_Schools_obj.NotCoverdAreaCy_3_boy = Urban_Schools_obj.view.graphics.items[0].geometry
                        data.Areagraphic_Cycle_ThreeBoy = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_3_boy, "square-kilometers")
                        }

                        var line = new SimpleLineSymbol();
                        line.width = 5;
                        line.color = new Color([255, 170, 0, 1]);
                        // line.setStyle("dash");
                        var fill = new SimpleFillSymbol();
                        fill.style= "cross";
                        fill.outline = line;
                        fill.color = new Color([0, 168, 132, 0.7]);
                        var graphic
                        if (isWithin2boy != undefined && Urban_Schools_obj.NotCoverdAreaCy_3_boy != null) {
                        graphic = new Graphic(geometryEngine.difference(Urban_Schools_obj.NotCoverdAreaCy_3_boy, isWithin2boy), fill)
                        } else {
                        graphic = new Graphic(Urban_Schools_obj.NotCoverdAreaCy_3_boy, fill)

                        }


                        Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.add(graphic)
                        Urban_Schools_obj.intersectserviceArea(Urban_Schools_obj.config.servCycleTwoLayerUrl, Urban_Schools_obj.view.graphics.items[0].geometry, function (_features) {


                        var _geom = []
                        if (_features.length > 0) {
                            for (var i = 0; i < _features.length; i++) {


                            data.NotContain_Cy_3_girl_point.filter(function (value) {

                                if (value.attributes[Urban_Schools_obj.config.scPkField] == _features[i].attributes[Urban_Schools_obj.config.servPkField]) {
                                _geom.push(_features[i].geometry);
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl.push(value.attributes)
                                Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl_PointGeometry.push(value)

                                data.Cycle_ThreeGirlOfpolygonCount++
                                }
                            })
                            }


                            Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl_PointGeometry.forEach(element => {
                            var marker = new PictureMarkerSymbol();
                            marker.xoffset = 0;
                            marker.yoffset = 1;
                            marker.height = 27;
                            marker.width= 25;
                            if(new Date().getFullYear()- element.attributes[Urban_Schools_obj.config.conYearField]>=40){
                
                                marker.url = "/webapps/education_facilities/assets/img/pin.png";
                                } else {
                                marker.url = "/webapps/education_facilities/assets/img/marker.png";          
                            }

                            var sfont = new Font();
                            sfont.size = 15;
                            var stextSym1 = {};
                            stextSym1.type = "text";
                            stextSym1.font = sfont;
                            stextSym1.align= TextSymbol.ALIGN_START;
                            stextSym1.color = new Color([255, 255, 255, 1]);
                            stextSym1.haloColor = "black";
                            stextSym1.haloSize = "1px";
                            stextSym1.verticalAlignment = "top"

                            stextSym1.text = element.attributes[Urban_Schools_obj.config.scNameField];
                            stextSym1.xoffset = 0;
                            stextSym1.yoffset = -4;
                            var graphicPointText = new Graphic(new Point(element.geometry), stextSym1);


                            var graphicPoint = new Graphic(new Point(element.geometry), marker);
                            Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.add(graphicPointText)
                            Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.add(graphicPoint)
                            });//
                            var _ugeom = _geom.length > 0 ? geometryEngine.union(_geom) : undefined;
                            if (_ugeom != undefined) {

                            Urban_Schools_obj.NotCoverdAreaCy_3_girl = geometryEngine.difference(Urban_Schools_obj.view.graphics.items[0].geometry, _ugeom);

                            if (Urban_Schools_obj.NotCoverdAreaCy_3_girl != null) {

                                data.Areagraphic_Cycle_ThreeGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_3_girl, "square-kilometers")
                            } else {

                                data.Areagraphic_Cycle_ThreeGirl = 0
                            }
                            } else {
                            Urban_Schools_obj.NotCoverdAreaCy_3_girl = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_ThreeGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_3_girl, "square-kilometers")
                            }

                        } else {
                            Urban_Schools_obj.NotCoverdAreaCy_3_girl = Urban_Schools_obj.view.graphics.items[0].geometry
                            data.Areagraphic_Cycle_ThreeGirl = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaCy_3_girl, "square-kilometers")
                        }
                        var line = new SimpleLineSymbol();
                        line.width = 5;
                        line.color = new Color([255, 170, 0, 1]);
                        // line.setStyle("dash");
                        var fill = new SimpleFillSymbol();
                        fill.style= "cross";
                        fill.outline = line;
                        fill.color = new Color([0, 168, 132, 0.7]);
                        var graphic
                        if (isWithin2girl != undefined && Urban_Schools_obj.NotCoverdAreaCy_3_girl != null) {
                            graphic = new Graphic(geometryEngine.difference(Urban_Schools_obj.NotCoverdAreaCy_3_girl, isWithin2girl), fill)
                        } else {
                            graphic = new Graphic(Urban_Schools_obj.NotCoverdAreaCy_3_girl, fill)

                        }
                        Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.add(graphic)
                        Urban_Schools_obj.IntersectPopulationGrid(Urban_Schools_obj.NotCoverdAreaCy_3_boy, data, function (resboy) {
                            data.Cy_3_boy_population = resboy
                            Urban_Schools_obj.IntersectPopulationGrid(Urban_Schools_obj.NotCoverdAreaCy_3_girl, data, function (resgirl) {
                            data.Cy_3_girl_population = resgirl

                            callBack()

                            })
                        })

                        })
                    })
                    })
                } else {
                callBack()
                }
            }

        }

        Urban_Schools_obj.intersectserviceArea = function(url, geo, callBack) {

            Urban_Schools_obj.executeQuery(url,
                "",
                geo,
                true,
                ['*'],
                false,
                function (_features) {
                if (_features) {

                    // data.KinderGardenOfpolygonCount=_features.length

                    callBack(_features)
                } else {
                    callBack(_features)
                }
                })

        }  

        Urban_Schools_obj.IntersectPopulationGrid = function(geo, data, callBack) {
            var res = 0

            if (geo != undefined) {

                Urban_Schools_obj.executeQueryPopylation(Urban_Schools_obj.config.popLayerUrl,
                geo,
                function (_features) {

                    if (_features) {
                        res = _features[0].attributes[Urban_Schools_obj.config.scNameField]
                    }
                    callBack(res)

                });
            } else {
                callBack(res)
            }
        }

        Urban_Schools_obj.AppendSchoolNotCoverd = function(schoolData) {
            var capacity_notcverd = [];
            var Total_Operating_Capacity_notcverd = [];
            var school_Name_notcverd = [];
            for (let i = 0; i < schoolData.length; i++) {

        
                // if (data._attributes[i][Urban_Schools_obj.config.opCapField] > data._attributes[i][Urban_Schools_obj.config.CapacityField]) {
                //   data._attributes[i]['Status'] = 'المدرسة فوق نطاق السعة الاستيعابية'
                // } else {
                //   data._attributes[i]['Status'] = 'المدرسة ضمن نطاق السعة الاستيعابية'

                // }
                if( schoolData[i][Urban_Schools_obj.config.conYearField]==null){
                schoolData[i][Urban_Schools_obj.config.yearsField]='-'
                }else if(new Date().getFullYear()- schoolData[i][Urban_Schools_obj.config.conYearField]>=40){
                
                schoolData[i][Urban_Schools_obj.config.yearsField]=new Date().getFullYear()-  schoolData[i][Urban_Schools_obj.config.conYearField]+' عام'
                } else {
                schoolData[i][Urban_Schools_obj.config.yearsField]=new Date().getFullYear()-  schoolData[i][Urban_Schools_obj.config.conYearField]+' عام'

                }
                schoolData[i]['Occupancy_rate'] = ((schoolData[i][Urban_Schools_obj.config.opCapField] / schoolData[i][Urban_Schools_obj.config.CapacityField]) * 100).toFixed(2)
                capacity_notcverd.push(schoolData[i][Urban_Schools_obj.config.CapacityField])
                Total_Operating_Capacity_notcverd.push(schoolData[i][Urban_Schools_obj.config.opCapField])
                school_Name_notcverd.push(schoolData[i][Urban_Schools_obj.config.scNameField])

            }

            let clonedSchoolData = [];
            for (let i = 0; i < schoolData.length; i++) {
                const clonedData = JSON.parse(JSON.stringify(schoolData[i]));
                clonedSchoolData.push(clonedData)
            }   

            var _columns = [
                { name: Urban_Schools_obj.config.scNameField, title: " اسم المدرسة ", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.CapacityField, title: " السعة الاجمالية", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.opCapField, title: " السعة التشغيلية", breakpoints: "xs sm md" },
                { name: "Occupancy_rate", title: "% نسبة الاشغال", breakpoints: "xs sm md" },
                { name: 'region', title: " موقع المدرسة ", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.kinderField, title: " رياض الاطفال  : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cOneField, title: " المرحلة الاولى : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cTwoField, title: " المرحلة الثانية  : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cThreeField, title: " المرحلة الثالثة :", breakpoints: "all" },
                { name: Urban_Schools_obj.config.genderField, title: " الجنس : ", breakpoints: "all" },
                // { name: "Status", title: "توصية : ", breakpoints: "all" },
                { name: "years", title: "عمرالبناء : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.conYearField, title: "سنة الانشاء :",  breakpoints: "all" },
            ];


            $('#NotcovredModal').modal('show')
            $('#table_SchoolInfoNotcovred').empty();
            $('#table_SchoolInfoNotcovred').footable({
                "columns": _columns,
                "rows": clonedSchoolData
            });
            
        }



        Urban_Schools_obj.drawChart = function(data) {
            $('#barChart_div').empty()
            var content = '<canvas id="barChart"></canvas>';

            $('#barChart_div').append(content);
            var capacity = []
            var Total_Operating_Capacity = []
            var school_Name = []
            for (let i = 0; i < data._attributes.length; i++) {

                if (data._attributes[i][Urban_Schools_obj.config.CapacityField] != null) {

                capacity.push(data._attributes[i][Urban_Schools_obj.config.CapacityField])
                } else {
                capacity.push(0)
                }
                if (data._attributes[i][Urban_Schools_obj.config.CapacityField] != null) {

                Total_Operating_Capacity.push(data._attributes[i][Urban_Schools_obj.config.opCapField])
                } else {
                Total_Operating_Capacity.push(0)
                }
                school_Name.push(data._attributes[i][Urban_Schools_obj.config.scNameField])

            }
            var ctx = document.getElementById("barChart").getContext('2d');


            const datasets = {
                labels: school_Name,
                datasets: [
                {
                    label: "السعة التشغيلية",
                    backgroundColor: "#e75050",
                    data: Total_Operating_Capacity
                },
                {
                    label: "السعةالاجمالية",
                    backgroundColor: "#4bb859",
                    data: capacity

                }
                ]
            };
            const options = {
                plugins: {
                labels: {
                    render: () => { }
                }
                },

                responsive: true,

                title: {
                display: false
                },
                legend: {
                display: true,
                position: 'bottom'
                },
                tooltips: {
                mode: 'index',
                intersect: true
                },
                scales: {
                yAxes: [{
                    stacked: false,
                    ticks: {
                    beginAtZero: true,
                    steps: 10,
                    stepValue: 5,

                    }
                }],
                xAxes: [
                    {
                    stacked: true,
                    ticks: { display: false },


                    barThickness: 15,
                    maxBarThickness: 25,
                    barPercentage: 0.5
                    }
                ]
                }
            };


            const chart = new Chart(ctx, {
                // The type of chart we want to create
                type: "bar",
                // The data for our dataset
                data: datasets,
                // Configuration options go here
                options: options
            });

            Urban_Schools_obj.inAreaChart = {
                data: datasets,
                options: options
            }

        }

        Urban_Schools_obj.drawChartNotCoverd = function(data) {
            $('#barChart_divNotcoverd').empty()
            var content = '<canvas id="barChartNotCoverd"></canvas>';

            var array = Urban_Schools_obj.SchoolsOutOfpolygondataKG.concat(Urban_Schools_obj.SchoolsOutOfpolygondataCY3girl)
                .concat(Urban_Schools_obj.SchoolsOutOfpolygondataCY3boy)
                .concat(Urban_Schools_obj.SchoolsOutOfpolygondataCY2girl)
                .concat(Urban_Schools_obj.SchoolsOutOfpolygondataCY2boy)
                .concat(Urban_Schools_obj.SchoolsOutOfpolygondataCY1girl)
                .concat(Urban_Schools_obj.SchoolsOutOfpolygondataCY1boy)
            var val = Array.from(new Set(array.map(JSON.stringify))).map(JSON.parse);

            $('#barChart_divNotcoverd').append(content);
            var capacity = []
            var Total_Operating_Capacity = []
            var school_Name = []
            for (let i = 0; i < val.length; i++) {

                if (val[i][Urban_Schools_obj.config.CapacityField] != null) {

                capacity.push(val[i][Urban_Schools_obj.config.CapacityField])
                } else {
                capacity.push(0)
                }
                if (val[i][Urban_Schools_obj.config.CapacityField] != null) {

                Total_Operating_Capacity.push(val[i][Urban_Schools_obj.config.opCapField])
                } else {
                Total_Operating_Capacity.push(0)
                }
                school_Name.push(val[i][Urban_Schools_obj.config.scNameField])

            }
            var ctx = document.getElementById("barChartNotCoverd").getContext('2d');


            const datasets = {
                labels: school_Name,
                datasets: [
                {
                    label: "السعة التشغيلية",
                    backgroundColor: "#e75050",
                    data: Total_Operating_Capacity
                },
                {
                    label: "السعةالاجمالية",
                    backgroundColor: "#4bb859",
                    data: capacity

                }
                ]
            };
            const options = {
                plugins: {
                labels: {
                    render: () => { }
                }
                },

                responsive: true,

                title: {
                display: false
                },
                legend: {
                display: true,
                position: 'bottom'
                },
                tooltips: {
                mode: 'index',
                intersect: true
                },
                scales: {
                yAxes: [{
                    stacked: false,
                    ticks: {
                    beginAtZero: true,
                    steps: 10,
                    stepValue: 5,

                    }
                }],
                xAxes: [
                    {
                    stacked: true,
                    ticks: { display: false },


                    barThickness: 15,
                    maxBarThickness: 25,
                    barPercentage: 0.5
                    }
                ]
                }
            };


            const chart = new Chart(ctx, {
                // The type of chart we want to create
                type: "bar",
                // The data for our dataset
                data: datasets,
                // Configuration options go here
                options: options
            });

        }

        Urban_Schools_obj.generateToken = function () {

            // Urban_Schools_obj.token = '';
            
            // $.ajax({
            //   'url': 'https://geodev.moid.gov.ae/smoeip/sharing/rest/generateToken',
            //   'type': 'POST',
            //   'data': {
            //     'f': "json",
            //     'username': Urban_Schools_obj.config.username,
            //     'password':  Urban_Schools_obj.config.password,
            //     'client': 'referer',
            //     'referer': 'https://geodev.moid.gov.ae/smoeis/rest/services',
            //   },
            //   success: function (data) {

                // Urban_Schools_obj.token = data.token

                Urban_Schools_obj.init(function () {
                    setTimeout(() => {

                        Urban_Schools_obj.loadEmara(function () {
                            Urban_Schools_obj.loadDirectorate()
                        })
                    }, 2000);
                });
        }

        Urban_Schools_obj.AppendSchoolData = function (data) {
            var capacity = []
            var Total_Operating_Capacity = []
            var school_Name = []
    
            var data2=[]
            for (let i = 0; i < data._attributes.length; i++) {
    
        
            if( data._attributes[i][Urban_Schools_obj.config.conYearField]==null){
                data._attributes[i][Urban_Schools_obj.config.yearsField]='-'
            }else if(new Date().getFullYear()- data._attributes[i][Urban_Schools_obj.config.conYearField]>=40){
            
                data._attributes[i][Urban_Schools_obj.config.yearsField]=new Date().getFullYear()-  data._attributes[i][Urban_Schools_obj.config.conYearField]+' عام'
                data2.push(data._attributes[i])
            } else {
                data._attributes[i][Urban_Schools_obj.config.yearsField]=new Date().getFullYear()-  data._attributes[i][Urban_Schools_obj.config.conYearField]+' عام'
    
            }
            data._attributes[i]['Occupancy_rate'] = ((data._attributes[i][Urban_Schools_obj.config.opCapField] / data._attributes[i][Urban_Schools_obj.config.CapacityField] * 100)).toFixed(2)
            capacity.push(data._attributes[i][Urban_Schools_obj.config.CapacityField])
            Total_Operating_Capacity.push(data._attributes[i][Urban_Schools_obj.config.opCapField])
            school_Name.push(data._attributes[i][Urban_Schools_obj.config.scNameField])
    
            }
            var _columns = [
                { name: Urban_Schools_obj.config.scNameField, title: " اسم المدرسة ", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.CapacityField, title: " السعة الاجمالية", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.opCapField, title: " السعة التشغيلية", breakpoints: "xs sm md" },
                { name: "Occupancy_rate", title: "% نسبة الاشغال", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.SPEDField, title: "عدد الطلاب ذوي الهمم", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.scLocationField, title: " موقع المدرسة ", breakpoints: "xs sm md" },
                { name: Urban_Schools_obj.config.kinderField, title: " رياض الاطفال  : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cOneField, title: " المرحلة الاولى : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cTwoField, title: " المرحلة الثانية  : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.cThreeField, title: " المرحلة الثالثة :", breakpoints: "all" },
                { name: Urban_Schools_obj.config.genderField, title: " الجنس : ", breakpoints: "all" },
                // { name: "Status", title: "توصية : ", breakpoints: "all" },
                { name: "years", title: "عمرالبناء : ", breakpoints: "all" },
                { name: Urban_Schools_obj.config.conYearField, title: "سنة الانشاء :",  breakpoints: "all" },
            ];
            // data._attributes.status='sss'

            let tableArr = []
            for (let i in data._attributes) {
                tableArr.push(i);
            }
    
            $('#myModal').modal('show')
            $('#table_SchoolInfo').empty();
            $('#table_SchoolInfo').footable({
                "columns": _columns,
                "rows": eval(data._attributes)
            });
        }

        Urban_Schools_obj.AppendSchoolDataList = function(data, callBack) {

            $('#table-striped').empty()

            var calibrator_Kindergarten = (parseInt($('#SUM_POPULATION').text()) / standardAverages.kinderGarten)
            var calibrator_Cycle_1_boy = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleOne)
            var calibrator_Cycle_1_girl = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleOne)
            var calibrator_Cycle_2_boy = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleTwo)
            var calibrator_Cycle_2_girl = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleTwo)
            var calibrator_Cycle_3_boy = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleThree)
            var calibrator_Cycle_3_girl = (parseInt($('#SUM_POPULATION').text()) / standardAverages.cycleThree)
            var Recommendations_Kindergarten = ''
            var Recommendations_Cycle_1_boy = ''
            var Recommendations_Cycle_1_girl = ''
            var Recommendations_Cycle_2_boy = ''
            var Recommendations_Cycle_2_girl = ''
            var Recommendations_Cycle_3_boy = ''
            var Recommendations_Cycle_3_girl = ''
            var color = ''


            $('#TabelList').empty()

            var contant = ''
            contant += `<tr>`

            if ($('#sub-Regions').val() == 'all' || $('#sub-Regions-none-urban').val() == 'all') {
                contant += ` <td> <input type="checkbox" class="checkboxs_Thematic" id="select-all"  checked> Thematic map </td>`

            }
            contant += `<td><input type="checkbox" class="checkboxs" id="select-all-school"  > Covered Area</td> `

            contant += ` <td>المنطقة مغطاه<td>
            <td>اسم المرحلة</td>
            <td>عدد المدراس</td>
            <td>عدد الصفوف</td>
            
            </tr>`
            // <td>المعاير</td>
            // <td>توصيات</td>
            // <td>استخدام الأراضي</td>

            if (($('#cycle').val().includes('Cycle_0') || $('#cycle').val().length == 0)) {
                if ((data.Total_Kindergarten_school / Math.ceil(calibrator_Kindergarten)) >= 1) {

                Recommendations_Kindergarten += 'لا يوجد حاجة لبناء مدارس'
                color = 'color:#19a700'
                } else {
                Recommendations_Kindergarten += 'بحاجة لبناء مدارس'
                color = 'color:#ff1d1d'
                }
                contant += `</tr>`
                if ($('#sub-Regions').val() == 'all' || $('#sub-Regions-none-urban').val() == 'all') {
                contant += `<td><input type="checkbox" class="checkboxs_Thematic" id="Kinder_Thematic"  checked></td>`
                }
                contant += `   <td><input type="checkbox" class="checkboxs" id="Kinder_checkbox"  ></td>`
                contant += ` <td><span class="dot" style='background-color: #000CFF;opacity: 0.5'></span><td>
                <td >رياض الاطفال</td>
                <td>${data.Total_Kindergarten_school}</td>
                <td>${data.Total_Kindergarten}</td>
                </tr>`
                // <td>${Math.ceil(calibrator_Kindergarten)}</td>
                // <td><span  style=${color}>${Recommendations_Kindergarten}</span></td>
                // <td><img id="landuseOpenmodal_Kindergarten" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>
            }

            if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
                if ((data.Total_Cycle_1_boy_school / Math.ceil(calibrator_Cycle_1_boy)) >= 1) {

                Recommendations_Cycle_1_boy += 'لا يوجد حاجة لبناء مدارس'
                color = 'color:#19a700'

                } else {
                Recommendations_Cycle_1_boy += 'بحاجة لبناء مدارس'
                color = 'color:#ff1d1d'

                }


                contant += `<tr>`
                if ($('#sub-Regions').val() == 'all' || $('#sub-Regions-none-urban').val() == 'all') {
                contant += ` <td><input type="checkbox" class="checkboxs_Thematic" id="cycle_oneBoy_Thematic"  checked></td>`
                }
                contant += `<td><input type="checkbox" class="checkboxs" id='cycle_oneBoy_checkbox'  ></td>
                <td><span class="dot" style='background-color: #474747;opacity: 0.5'></span><td>
            <td>المرحلة الاولى ذكور</td>
            <td>${data.Total_Cycle_1_boy_school}</td>
            <td>${data.Total_Cycle_1_boy}</td>
            </tr>`
                // <td>${Math.ceil(calibrator_Cycle_1_boy)}</td>
                // <td><span  style=${color}>${Recommendations_Cycle_1_boy}</span></td>
                // <td><img id="landuseOpenmodal_Cycle_1_boy" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>
            }
            if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

                if ((data.Total_Cycle_1_girl_school / Math.ceil(calibrator_Cycle_1_girl)) >= 1) {

                Recommendations_Cycle_1_girl += 'لا يوجد حاجة لبناء مدارس'
                color = 'color:#19a700'

                } else {
                Recommendations_Cycle_1_girl += 'بحاجة لبناء مدارس'
                color = 'color:#ff1d1d'

                }

                contant += `<tr>`
                if ($('#sub-Regions').val() == 'all' || $('#sub-Regions-none-urban').val() == 'all') {
                contant += `<td><input type="checkbox" class="checkboxs_Thematic" id="cycle_oneGirl_Thematic"  checked></td>`
                }
                contant += `<td><input type="checkbox" class="checkboxs" id='cycle_oneGirl_checkbox'  ></td>
                <td><span class="dot"style='background-color: #4C0073;opacity: 0.5'></span><td>
            <td>المرحلة الاولى إناث</td>
            <td>${data.Total_Cycle_1_girl_school}</td>
            <td>${data.Total_Cycle_1_girl}</td>
        

            </tr>`
                // <td>${Math.ceil(calibrator_Cycle_1_girl)}</td>
                // <td><span  style=${color}>${Recommendations_Cycle_1_girl}<span></td>
                // <td><img id="landuseOpenmodal_Cycle_1_girl" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>

            }
            if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
                if ((data.Total_Cycle_2_boy_school / Math.ceil(calibrator_Cycle_2_boy)) >= 1) {

                Recommendations_Cycle_2_boy += 'لا يوجد حاجة لبناء مدارس'
                color = 'color:#19a700'

                } else {
                Recommendations_Cycle_2_boy += 'بحاجة لبناء مدارس'
                color = 'color:#ff1d1d'

                }

                contant += `<tr>`
                if ($('#sub-Regions').val() == 'all' || $('#sub-Regions-none-urban').val() == 'all') {
                contant += ` <td><input type="checkbox" class="checkboxs_Thematic" id="cycle_towBoy_Thematic"  checked></td>`

                }

                contant += ` <td><input type="checkbox" class="checkboxs" id='cycle_towBoy_checkbox'  ></td>
            <td><span class="dot" style='background-color: #E60000;opacity: 0.5'></span><td>
            <td>المرحلة الثانية ذكور</td>
            <td>${data.Total_Cycle_2_boy_school}</td>
            <td>${data.Total_Cycle_2_boy}</td>
        

            </tr>`
                // <td>${Math.ceil(calibrator_Cycle_2_boy)}</td>
                // <td><span  style=${color}>${Recommendations_Cycle_2_boy}<span></td>
                // <td><img id="landuseOpenmodal_Cycle_2_boy" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>
            }
            if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

                if ((data.Total_Cycle_2_girl_school / Math.ceil(calibrator_Cycle_2_girl)) >= 1) {

                Recommendations_Cycle_2_girl += 'لا يوجد حاجة لبناء مدارس'
                color = 'color:#19a700'
                } else {
                Recommendations_Cycle_2_girl += 'بحاجة لبناء مدارس'
                color = 'color:#ff1d1d'
                }

                contant += `<tr>`
                if ($('#sub-Regions').val() == 'all' || $('#sub-Regions-none-urban').val() == 'all') {
                contant += ` <td><input type="checkbox" class="checkboxs_Thematic" id="cycle_towgirl_Thematic"  checked></td>`

                }


                contant += `<td><input type="checkbox" class="checkboxs"  id='cycle_towgirl_checkbox'  ></td>
                    <td><span class="dot" style='background-color: #00734C;opacity: 0.5'></span><td>
                    <td>المرحلة الثانية إناث</td>
                    <td>${data.Total_Cycle_2_girl_school}</td>
                    <td>${data.Total_Cycle_2_girl}</td>
            

                    </tr>`
                // <td>${Math.ceil(calibrator_Cycle_2_girl)}</td>
                // <td><span  style=${color}>${Recommendations_Cycle_2_girl}</span></td>
                // <td><img id="landuseOpenmodal_Cycle_2_girl" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>
            }
            if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
                if ((data.Total_Cycle_3_boy_school / Math.ceil(calibrator_Cycle_3_boy)) >= 1) {

                Recommendations_Cycle_3_boy += 'لا يوجد حاجة لبناء مدارس'
                color = 'color:#19a700'
                } else {
                Recommendations_Cycle_3_boy += 'بحاجة لبناء مدارس'
                color = 'color:#ff1d1d'
                }
                contant += `<tr>`
                if ($('#sub-Regions').val() == 'all' || $('#sub-Regions-none-urban').val() == 'all') {
                contant += ` <td><input type="checkbox" class="checkboxs_Thematic"  id="cycle_threeBoy_Thematic" checked></td>`

                }

                contant += ` <td><input type="checkbox" class="checkboxs" id='cycle_threeBoy_checkbox'   ></td>
            <td><span class="dot" style='background-color: #FFAA00;opacity: 0.5'></span><td>

            <td>المرحلة الثالثة ذكور</td>
            <td>${data.Total_Cycle_3_boy_school}</td>
            <td>${data.Total_Cycle_3_boy}</td>
            

            </tr>`
                // <td>${Math.ceil(calibrator_Cycle_3_boy)}</td>
                // <td><span  style=${color}>${Recommendations_Cycle_3_boy}</span></td>
                // <td><img id="landuseOpenmodal_Cycle_3_boy"  width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>
            }
            if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

                if ((data.Total_Cycle_3_girl_school / Math.ceil(calibrator_Cycle_3_girl)) >= 1) {

                Recommendations_Cycle_3_girl += 'لا يوجد حاجة لبناء مدارس'
                color = 'color:#19a700'
                } else {
                Recommendations_Cycle_3_girl += 'بحاجة لبناء مدارس'
                color = 'color:#ff1d1d'
                }
                contant += `<tr>`
                if ($('#sub-Regions').val() == 'all' || $('#sub-Regions-none-urban').val() == 'all') {
                contant += ` <td><input type="checkbox" class="checkboxs_Thematic"  id="cycle_threegirl_Thematic"  checked></td>`

                }

                contant += ` <td><input type="checkbox" class="checkboxs" id='cycle_threegirl_checkbox'  ></td>
            <td><span class="dot" style='background-color: #00FFC5;opacity: 0.5'></span><td>

            <td>المرحلة الثالثة إناث</td>
            <td>${data.Total_Cycle_3_girl_school}</td>
            <td>${data.Total_Cycle_3_girl}</td>
        

            </tr>`
                // <td>${Math.ceil(calibrator_Cycle_3_girl)}</td>
                // <td><span  style=${color}>${Recommendations_Cycle_3_girl}</span></td>
                // <td><img id="landuseOpenmodal_Cycle_3_girl" width="30px" src="/webapps/education_facilities/assets/img/landuse.png"></td>
                contant += `<tr>
                
                </tr>
                `
                // <td><span class="dot"  style="background:#19a70078"></span>لا يوجد حاجة لبناء مدارس</td>
                // <td><span class="dot" style="background:#ff1d1d8f"></span>بحاجة لبناء مدارس</td>

            }


            $('#TabelList').append(contant)


            if ($('#sub-Regions').val() == 'all') {

                var subregion = $('#sub-Regions')[0]
                // if($('#cycle').val().length == 1 && $('#gendar').val().length==1) {
                for (var i = 2; i < subregion.length; i++) {
                var sub_Att = Urban_Schools_obj.SubRegionsFeatures.find(function (e) { return e.ID == $('#sub-Regions')[0][i].value })
                Recommendations_Kindergarten = ''

                var line = new SimpleLineSymbol();
                line.width = 2.25;
                line.color = new Color([36, 36, 36, 1]);
                line.style = "dash";


                var subreginID = $('#sub-Regions')[0][i].value

                if (($('#cycle').val().includes('Cycle_0') || $('#cycle').val().length == 0)) {
                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Kindergarten_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.kinderGarten)) >= 1) {


                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر
                    } else if ((data['Total_Kindergarten_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.kinderGarten)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {

                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }

                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_0_' + subreginID)
                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID].visible = false

                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {

                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Cycle_1_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleOne)) >= 1) {

                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر

                    } else if ((data['Total_Cycle_1_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleOne)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر

                    }

                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_One_boy' + subreginID)
                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID].visible = false

                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {
                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Cycle_1_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleOne)) >= 1) {

                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر

                    } else if ((data['Total_Cycle_1_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleOne)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }
                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_One_girl' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID])

                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID].visible = false


                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
                    var fill = new SimpleFillSymbol();

                    fill.outline = line;

                    if ((data['Total_Cycle_2_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleTwo)) >= 1) {
                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر

                    } else if ((data['Total_Cycle_2_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleTwo)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر

                    }
                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_Two_boy' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID])

                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID].visible = false



                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Cycle_2_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleTwo)) >= 1) {

                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر

                    } else if ((data['Total_Cycle_2_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleTwo)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }
                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID].add(graphic)

                    graphicsLayer_Arry.push('graphicsLayer_Cycle_Two_girl' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID].visible = false



                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {

                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Cycle_3_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleThree)) >= 1) {
                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر
                    } else if ((data['Total_Cycle_3_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleThree)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }
                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID].add(graphic)

                    graphicsLayer_Arry.push('graphicsLayer_Cycle_Three_boy' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID].visible = false


                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

                    var fill = new SimpleFillSymbol();

                    fill.outline = line;

                    if ((data['Total_Cycle_3_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleThree)) >= 1) {
                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر
                    } else if ((data['Total_Cycle_3_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleThree)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {

                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }


                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_Three_girl' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID].visible = false

                }




                }



                $('#Kinder_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_oneBoy_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_oneGirl_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_towBoy_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_towgirl_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_threegirl_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions')[0][i].value].visible = false
                    }

                }
                })


                $('#cycle_threeBoy_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions')[0][i].value].visible = false
                    }

                }
                })

                $('#select-all').click(function (event) {
                for (var i = 2; i < subregion.length; i++) {

                    if (this.checked) {
                    $('.checkboxs_Thematic').prop('checked', true);

                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions')[0][i].value].visible = true;

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions')[0][i].value].visible = true;

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions')[0][i].value].visible = true;

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions')[0][i].value].visible = true;

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions')[0][i].value].visible = true;

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions')[0][i].value].visible = true;

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions')[0][i].value].visible = true;

                    }

                    } else {

                    $('.checkboxs_Thematic').prop('checked', false);
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions')[0][i].value].visible = false
                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions')[0][i].value].visible = false

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions')[0][i].value].visible = false
                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions')[0][i].value].visible = false

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions')[0][i].value].visible = false

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions')[0][i].value].visible = false

                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions')[0][i].value].visible = false

                    }
                    }
                }
                });
                $('#select-all').click()
            }
            if ($('#sub-Regions-none-urban').val() == 'all') {

                var subregion = $('#sub-Regions-none-urban')[0]
                // if($('#cycle').val().length == 1 && $('#gendar').val().length==1) {
                for (var i = 2; i < subregion.length; i++) {
                var sub_Att = Urban_Schools_obj.SubRegionsFeatures.find(function (e) { return e.ID == $('#sub-Regions-none-urban')[0][i].value })
                Recommendations_Kindergarten = ''

                var line = new SimpleLineSymbol();
                line.width = 2.25;
                line.color = new Color([36, 36, 36, 1]);
                line.style = "dash";


                var subreginID = $('#sub-Regions-none-urban')[0][i].value

                if (($('#cycle').val().includes('Cycle_0') || $('#cycle').val().length == 0)) {
                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Kindergarten_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.kinderGarten)) >= 1) {


                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر
                    } else if ((data['Total_Kindergarten_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.kinderGarten)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {

                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }

                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_0_' + subreginID)
                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + subreginID].visible = false

                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {

                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Cycle_1_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleOne)) >= 1) {

                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر

                    } else if ((data['Total_Cycle_1_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleOne)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر

                    }

                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_One_boy' + subreginID)
                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + subreginID].visible = false

                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cOneField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {
                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Cycle_1_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleOne)) >= 1) {

                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر

                    } else if ((data['Total_Cycle_1_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleOne)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }
                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_One_girl' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID])

                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + subreginID].visible = false


                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {
                    var fill = new SimpleFillSymbol();

                    fill.outline = line;

                    if ((data['Total_Cycle_2_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleTwo)) >= 1) {
                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر

                    } else if ((data['Total_Cycle_2_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleTwo)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر

                    }
                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID].removeAll();
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID] = new GraphicsLayer();
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID].add(graphic);
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_Two_boy' + subreginID);

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID]);

                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + subreginID].visible = false;
                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cTwoField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Cycle_2_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleTwo)) >= 1) {

                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر

                    } else if ((data['Total_Cycle_2_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleTwo)) > 0) {
                        fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                        fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }
                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID]) {

                        Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID].add(graphic)

                    graphicsLayer_Arry.push('graphicsLayer_Cycle_Two_girl' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + subreginID].visible = false
                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('ذكور') || $('#gendar').val().length == 0)) {

                    var fill = new SimpleFillSymbol();

                    fill.outline = line;
                    if ((data['Total_Cycle_3_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleThree)) >= 1) {
                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر
                    } else if ((data['Total_Cycle_3_boy_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleThree)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {
                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }
                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID]) {

                        Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID].add(graphic)

                    graphicsLayer_Arry.push('graphicsLayer_Cycle_Three_boy' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + subreginID].visible = false
                }

                if (($('#cycle').val().includes(Urban_Schools_obj.config.cThreeField) || $('#cycle').val().length == 0) && ($('#gendar').val().includes('إناث') || $('#gendar').val().length == 0)) {

                    var fill = new SimpleFillSymbol();

                    fill.outline = line;

                    if ((data['Total_Cycle_3_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleThree)) >= 1) {
                    fill.color = new Color([190, 255, 232, 0.45]);//اخضر
                    } else if ((data['Total_Cycle_3_girl_school' + subreginID] / Math.ceil(parseInt(sub_Att.CITIZENTOTAL) / standardAverages.cycleThree)) > 0) {
                    fill.color = new Color([76, 0, 115, 0.50]);//برتقالي
                    } else {

                    fill.color = new Color([255, 0, 0, 0.45]);//احمر
                    }


                    var graphic = new Graphic(sub_Att.geometry, fill)
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID]) {

                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID].removeAll()
                    }
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID] = new GraphicsLayer()
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID].add(graphic)
                    graphicsLayer_Arry.push('graphicsLayer_Cycle_Three_girl' + subreginID)

                    Urban_Schools_obj.map.add(Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID])
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + subreginID].visible = false

                }




                }



                $('#Kinder_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_oneBoy_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_oneGirl_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_towBoy_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_towgirl_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                    }

                }
                })

                $('#cycle_threegirl_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                    }

                }
                })


                $('#cycle_threeBoy_Thematic').click(function () {
                for (var i = 2; i < subregion.length; i++) {

                    if ($(this).is(':checked')) {
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    } else {
                    Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                    }

                }
                })

                $('#select-all').click(function (event) {
                for (var i = 2; i < subregion.length; i++) {

                    if (this.checked) {
                    $('.checkboxs_Thematic').prop('checked', true);

                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions-none-urban')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions-none-urban')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions-none-urban')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions-none-urban')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions-none-urban')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions-none-urban')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    }
                    if (Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions-none-urban')[0][i].value]) {
                        Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions-none-urban')[0][i].value].visible = true;
                    }

                    } else {

                        $('.checkboxs_Thematic').prop('checked', false);
                        if (Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions-none-urban')[0][i].value]) {
                            Urban_Schools_obj['graphicsLayer_Cycle_Three_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                        }
                        if (Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions-none-urban')[0][i].value]) {
                            Urban_Schools_obj['graphicsLayer_Cycle_Three_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                        }
                        if (Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions-none-urban')[0][i].value]) {
                            Urban_Schools_obj['graphicsLayer_Cycle_Two_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                        }
                        if (Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions-none-urban')[0][i].value]) {
                            Urban_Schools_obj['graphicsLayer_Cycle_Two_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                        }
                        if (Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions-none-urban')[0][i].value]) {
                            Urban_Schools_obj['graphicsLayer_Cycle_One_girl' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                        }
                        if (Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions-none-urban')[0][i].value]) {
                            Urban_Schools_obj['graphicsLayer_Cycle_One_boy' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                        }
                        if (Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions-none-urban')[0][i].value]) {
                            Urban_Schools_obj['graphicsLayer_Cycle_0_' + $('#sub-Regions-none-urban')[0][i].value].visible = false
                        }
                    }
                }
                });
                $('#select-all').click()
            }




            $('#select-all-school').click(function (event) {
                // for (var i = 1; i < subregion.length; i++) {

                if (this.checked) {
                $('.checkboxs').prop('checked', true);
                Urban_Schools_obj.graphicsLayer_KinderGarden10Min.visible = true;
                Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.visible = true;
                Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.visible = true;
                Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.visible = true;
                Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.visible = true;
                Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.visible = true;
                Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.visible = true;

                } else {

                $('.checkboxs').prop('checked', false);
                Urban_Schools_obj.graphicsLayer_KinderGarden10Min.visible = false
                Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.visible = false
                Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.visible = false
                Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.visible = false
                Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.visible = false
                Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.visible = false
                Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.visible = false


                }
                // }
            });

            $('#Kinder_checkbox').click(function () {
                if ($(this).is(':checked')) {
                Urban_Schools_obj.graphicsLayer_KinderGarden10Min.visible = true;
                } else {
                Urban_Schools_obj.graphicsLayer_KinderGarden10Min.visible = false

                }
            })
            $('#cycle_oneBoy_checkbox').click(function () {
                if ($(this).is(':checked')) {
                Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.visible = true;


                } else {
                Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.visible = false

                }
            })
            $('#cycle_oneGirl_checkbox').click(function () {
                if ($(this).is(':checked')) {
                Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.visible = true;
                } else {
                Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.visible = false

                }
            })
            $('#cycle_towBoy_checkbox').click(function () {
                if ($(this).is(':checked')) {


                Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.visible = true;
                } else {
                Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.visible = false

                }
            })
            $('#cycle_towgirl_checkbox').click(function () {
                if ($(this).is(':checked')) {
                Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.visible = true;
                } else {
                Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.visible = false

                }
            })
            $('#cycle_threeBoy_checkbox').click(function () {
                if ($(this).is(':checked')) {

                Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.visible = true;
                } else {
                Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.visible = false

                }
            })
            $('#cycle_threegirl_checkbox').click(function () {
                if ($(this).is(':checked')) {
                Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.visible = true;
                } else {
                Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.visible = false

                }
            })
            callBack()
        }


        Urban_Schools_obj.getSchool = async function(where, callBack) {
            Urban_Schools_obj.graphicsLayer.removeAll()
            await Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.schoolLayerUrl,
                where,
                null,
                true,
                ['*'],
                false,
                async function (_features) {
                if (_features) {
                    var _geom = [];
                    // let _attributes = []
                    var data = {
                    Total_capacity: 0,
                    Total_School: 0,
                    schools: [],
                    TotalOperatingCapacity: 0,
                    _attributes: new Array(),
                    _KG_attributes: [],
                    _KG_grphic: [],
                    _cy1_attributes: [],
                    _cy2_attributes: [],
                    _cy3_attributes: [],
                    Total_Kindergarten: 0,
                    Total_Cycle_1_boy: 0,
                    Total_Cycle_1_girl: 0,
                    Total_Cycle_2_boy: 0,
                    Total_Cycle_2_girl: 0,
                    Total_Cycle_3_boy: 0,
                    Total_Cycle_3_girl: 0,
                    Total_Kindergarten_school: 0,
                    Total_Cycle_1_boy_school: 0,
                    Total_Cycle_1_girl_school: 0,
                    Total_Cycle_2_boy_school: 0,
                    Total_Cycle_2_girl_school: 0,
                    Total_Cycle_3_boy_school: 0,
                    Total_Cycle_3_girl_school: 0,
                    Cycle_ThreeBoyOfpolygonCount: 0,
                    Cycle_ThreeGirlOfpolygonCount: 0,
                    Areagraphic_Cycle_ThreeBoy: 0,
                    Areagraphic_Cycle_ThreeGirl: 0,
                    Cycle_TwoBoyOfpolygonCount: 0,
                    Cycle_TwoGirlOfpolygonCount: 0,
                    Areagraphic_Cycle_TwoBoy: 0,
                    Areagraphic_Cycle_TwoGirl: 0,
                    Cycle_OneBoyOfpolygonCount: 0,
                    Cycle_OneGirlOfpolygonCount: 0,
                    Areagraphic_Cycle_OneBoy: 0,
                    Areagraphic_Cycle_OneGirl: 0,
                    KinderGardenOfpolygonCount: 0,
                    AreagraphicKinderGarden: 0,
                    SchoolsOutOfpolygondata: []
                    , KG_point: [],
                    Cy_1_boy_point: [],
                    Cy_1_girl_point: [],
                    Cy_2_boy_point: [],
                    Cy_2_girl_point: [],
                    Cy_3_boy_point: [],
                    Cy_3_girl_point: [],
                    NotContain_KG_point: [],
                    NotContain_Cy_1_boy_point: [],
                    NotContain_Cy_1_girl_point: [],
                    NotContain_Cy_2_boy_point: [],
                    NotContain_Cy_2_girl_point: [],
                    NotContain_Cy_3_boy_point: [],
                    NotContain_Cy_3_girl_point: [],
                    KG_population: 0,
                    Cy_1_boy_population: 0,
                    Cy_1_girl_population: 0,
                    Cy_2_boy_population: 0,
                    Cy_2_girl_population: 0,
                    Cy_3_boy_population: 0,
                    Cy_3_girl_population: 0,
                    }

                    for (var i = 0; i < _features.length; i++) {
                    if (Urban_Schools_obj.view.graphics.items[0].geometry.contains(_features[i].geometry)) {
                        // _geom.push(_features[i].geometry);
                        if (_features[i].attributes[Urban_Schools_obj.config.kinderField] != null && _features[i].attributes[Urban_Schools_obj.config.kinderField] > 0) {
                        data.KG_point.push(_features[i])
                        // data.KG_point.push(attributes=_features[i].attributes)
                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.cOneField] != null && _features[i].attributes[Urban_Schools_obj.config.cOneField] > 0) {
                            if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('ذكور') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                                data.Cy_1_boy_point.push(_features[i]);
                            }
                            if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('إناث') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                                data.Cy_1_girl_point.push(_features[i]);
                            }
                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.cTwoField] != null && _features[i].attributes[Urban_Schools_obj.config.cTwoField] > 0) {
                            if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('ذكور') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                                data.Cy_2_boy_point.push(_features[i])
                            }
                            if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('إناث') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                                data.Cy_2_girl_point.push(_features[i])
                            }
                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.cThreeField] != null && _features[i].attributes[Urban_Schools_obj.config.cThreeField] > 0) {
                            if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('ذكور') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                                data.Cy_3_boy_point.push(_features[i])
                            }
                            if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('إناث') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                                data.Cy_3_girl_point.push(_features[i])
                            }
                        }

                        data.geometryKender
                        let clonedAttributes = JSON.parse(JSON.stringify(_features[i].attributes));
                        data._attributes.push(clonedAttributes);
                        data.schools.push({
                            name: _features[i].attributes[Urban_Schools_obj.config.scNameField],
                            capacity: _features[i].attributes[Urban_Schools_obj.config.CapacityField],
                            operatingCapacity: _features[i].attributes[Urban_Schools_obj.config.opCapField],
                        })
                        data.Total_capacity += _features[i].attributes[Urban_Schools_obj.config.totalCapField]
                        data.TotalOperatingCapacity += _features[i].attributes[Urban_Schools_obj.config.opCapField]
                        data.Total_School ++
                        // var marker = new PictureMarkerSymbol();
                        // marker.xoffset = 0;
                        // marker.yoffset = 1;
                        // marker.height = 27;
                        // marker.width= 25;
                        // marker.setUrl("/webapps/education_facilities/assets/img/google-maps.png");
                        // var graphic = new Graphic(new Point(_features[i].geometry), marker);
                        // Urban_Schools_obj.graphicsLayer.add(graphic)
                        // Urban_Schools_obj.map.add(Urban_Schools_obj.graphicsLayer)
                    } else {
                        if (_features[i].attributes[Urban_Schools_obj.config.kinderField] != null && _features[i].attributes[Urban_Schools_obj.config.kinderField] > 0) {
                        data.NotContain_KG_point.push(_features[i])
                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.cOneField] != null && _features[i].attributes[Urban_Schools_obj.config.cOneField] > 0) {
                        if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('ذكور') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data.NotContain_Cy_1_boy_point.push(_features[i])
                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('إناث') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data.NotContain_Cy_1_girl_point.push(_features[i])
                        }

                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.cTwoField] != null && _features[i].attributes[Urban_Schools_obj.config.cTwoField] > 0) {
                        if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('ذكور') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data.NotContain_Cy_2_boy_point.push(_features[i])
                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('إناث') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data.NotContain_Cy_2_girl_point.push(_features[i])
                        }
                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.cThreeField] != null && _features[i].attributes[Urban_Schools_obj.config.cThreeField] > 0) {
                        if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('ذكور') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data.NotContain_Cy_3_boy_point.push(_features[i])
                        }
                        if (_features[i].attributes[Urban_Schools_obj.config.genderField].includes('إناث') || _features[i].attributes[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data.NotContain_Cy_3_girl_point.push(_features[i])
                        }
                        }
                    }

                    }

                    if ($('#sub-Regions').val() == 'all') {
                        for (var i = 0; i < Urban_Schools_obj.SubRegionsFeatures.length; i++) {
                            var arrayregIDIN = 'att_' + Urban_Schools_obj.SubRegionsFeatures[i]['ID']

                            data[arrayregIDIN] = []

                            data['Total_capacity_' + arrayregIDIN] = 0
                            data['Total_School_' + arrayregIDIN] = 0
                            for (var j = 0; j < _features.length; j++) {

                            if (Urban_Schools_obj.SubRegionsFeatures[i].geometry.contains(_features[j].geometry)) {

                                data
                                data[arrayregIDIN].push(_features[j].attributes)
                                if (_features.length > 0) {

                                data['Total_capacity_' + arrayregIDIN] += _features[i].attributes[Urban_Schools_obj.config.totalCapField]
                                data['Total_School_' + arrayregIDIN]++
                                } else {
                                data['Total_capacity_' + arrayregIDIN] = 0
                                data['Total_School_' + arrayregIDIN] = 0
                                }
                            }
                        }
                    }

                    var subregion = $('#sub-Regions')[0]
                    // subregion.concat($('#sub-Regions-none-urban')[0])
                    for (var i = 2; i < subregion.length; i++) {
                        data['_KG_attributes_' + subregion[i].value] = []
                        data['Total_Kindergarten' + subregion[i].value] = 0
                        data['Total_Kindergarten_school' + subregion[i].value] = 0
                        data['att_' + subregion[i].value].filter(function (value) {
                        if (value[Urban_Schools_obj.config.kinderField] != null && value[Urban_Schools_obj.config.kinderField] > 0) {
                            data['Total_Kindergarten' + subregion[i].value] += value[Urban_Schools_obj.config.kinderField]
                            data['Total_Kindergarten_school' + subregion[i].value]++
                            data['_KG_attributes_' + subregion[i].value].push(value)
                        }
                        })


                        const Cycle_One = data['att_' + subregion[i].value].filter(function (value) {
                        data['_cy1_attributes' + subregion[i].value] = []
                        data['_cy1_attributes' + subregion[i].value].push(value)

                        return value[Urban_Schools_obj.config.cOneField] != null && value[Urban_Schools_obj.config.cOneField] > 0
                        });

                        Cycle_One.filter(function (value) {
                        data['Total_Cycle_1_boy' + subregion[i].value] = 0
                        data['Total_Cycle_1_boy_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data['Total_Cycle_1_boy' + subregion[i].value] += value[Urban_Schools_obj.config.cOneField]
                            data['Total_Cycle_1_boy_school' + subregion[i].value]++

                        }
                        });
                        Cycle_One.filter(function (value) {
                        data['Total_Cycle_1_girl' + subregion[i].value] = 0
                        data['Total_Cycle_1_girl_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data['Total_Cycle_1_girl' + subregion[i].value] += value[Urban_Schools_obj.config.cOneField]
                            data['Total_Cycle_1_girl_school' + subregion[i].value]++

                        }
                        });



                        const Cycle_Two = data['att_' + subregion[i].value].filter(function (value) {
                        data['_cy2_attributes' + subregion[i].value] = []
                        data['_cy2_attributes' + subregion[i].value].push(value)

                        return value[Urban_Schools_obj.config.cTwoField] != null && value[Urban_Schools_obj.config.cTwoField] > 0
                        });

                        Cycle_Two.filter(function (value) {
                        data['Total_Cycle_2_boy' + subregion[i].value] = 0
                        data['Total_Cycle_2_boy_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {

                            data['Total_Cycle_2_boy' + subregion[i].value] += value[Urban_Schools_obj.config.cTwoField]
                            data['Total_Cycle_2_boy_school' + subregion[i].value]++

                        }
                        });
                        Cycle_Two.filter(function (value) {
                        data['Total_Cycle_2_girl' + subregion[i].value] = 0
                        data['Total_Cycle_2_girl_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {

                            data['Total_Cycle_2_girl' + subregion[i].value] += value[Urban_Schools_obj.config.cTwoField]
                            data['Total_Cycle_2_girl_school' + subregion[i].value]++


                        }
                        });




                        const Cycle_Three = data['att_' + subregion[i].value].filter(function (value) {
                        data['_cy3_attributes' + subregion[i].value] = []
                        data['_cy3_attributes' + subregion[i].value].push(value)
                        return value[Urban_Schools_obj.config.cThreeField] != null && value[Urban_Schools_obj.config.cThreeField] > 0
                        });

                        Cycle_Three.filter(function (value) {
                        data['Total_Cycle_3_boy' + subregion[i].value] = 0
                        data['Total_Cycle_3_boy_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {


                            data['Total_Cycle_3_boy' + subregion[i].value] += value[Urban_Schools_obj.config.cThreeField]
                            data['Total_Cycle_3_boy_school' + subregion[i].value]++

                        }
                        });
                        Cycle_Three.filter(function (value) {
                        data['Total_Cycle_3_girl' + subregion[i].value] = 0
                        data['Total_Cycle_3_girl_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            // data.Total_Cycle_3_girl += value[Urban_Schools_obj.config.cThreeField]
                            // data.Total_Cycle_3_girl_school++
                            data['Total_Cycle_3_girl' + subregion[i].value] += value[Urban_Schools_obj.config.cThreeField]
                            data['Total_Cycle_3_girl_school' + subregion[i].value]++

                        }
                        });


                    }
                    }
                    if ($('#sub-Regions-none-urban').val() == 'all') {


                    for (var i = 0; i < Urban_Schools_obj.SubRegionsFeatures.length; i++) {
                        var arrayregIDIN = 'att_' + Urban_Schools_obj.SubRegionsFeatures[i]['ID']

                        data[arrayregIDIN] = []

                        data['Total_capacity_' + arrayregIDIN] = 0
                        data['Total_School_' + arrayregIDIN] = 0
                        for (var j = 0; j < _features.length; j++) {


                        if (Urban_Schools_obj.SubRegionsFeatures[i].geometry.contains(_features[j].geometry)) {

                            data
                            data[arrayregIDIN].push(_features[j].attributes)
                            if (_features.length > 0) {

                                data['Total_capacity_' + arrayregIDIN] += _features[i].attributes[Urban_Schools_obj.config.totalCapField]
                                data['Total_School_' + arrayregIDIN]++
                            } else {
                                data['Total_capacity_' + arrayregIDIN] = 0
                                data['Total_School_' + arrayregIDIN] = 0
                            }
                        }

                        }
                    }

                    var subregion = $('#sub-Regions-none-urban')[0]
                    // subregion.concat($('#sub-Regions-none-urban')[0])
                    for (var i = 2; i < subregion.length; i++) {


                        data['_KG_attributes_' + subregion[i].value] = []
                        data['Total_Kindergarten' + subregion[i].value] = 0
                        data['Total_Kindergarten_school' + subregion[i].value] = 0
                        data['att_' + subregion[i].value].filter(function (value) {
                        if (value[Urban_Schools_obj.config.kinderField] != null && value[Urban_Schools_obj.config.kinderField] > 0) {
                            data['Total_Kindergarten' + subregion[i].value] += value[Urban_Schools_obj.config.kinderField]
                            data['Total_Kindergarten_school' + subregion[i].value]++
                            data['_KG_attributes_' + subregion[i].value].push(value)


                        }
                        })


                        const Cycle_One = data['att_' + subregion[i].value].filter(function (value) {
                        data['_cy1_attributes' + subregion[i].value] = []
                        data['_cy1_attributes' + subregion[i].value].push(value)

                        return value[Urban_Schools_obj.config.cOneField] != null && value[Urban_Schools_obj.config.cOneField] > 0
                        });

                        Cycle_One.filter(function (value) {
                        data['Total_Cycle_1_boy' + subregion[i].value] = 0
                        data['Total_Cycle_1_boy_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data['Total_Cycle_1_boy' + subregion[i].value] += value[Urban_Schools_obj.config.cOneField]
                            data['Total_Cycle_1_boy_school' + subregion[i].value]++

                        }
                        });
                        Cycle_One.filter(function (value) {
                        data['Total_Cycle_1_girl' + subregion[i].value] = 0
                        data['Total_Cycle_1_girl_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            data['Total_Cycle_1_girl' + subregion[i].value] += value[Urban_Schools_obj.config.cOneField]
                            data['Total_Cycle_1_girl_school' + subregion[i].value]++

                        }
                        });



                        const Cycle_Two = data['att_' + subregion[i].value].filter(function (value) {
                        data['_cy2_attributes' + subregion[i].value] = []
                        data['_cy2_attributes' + subregion[i].value].push(value)

                        return value[Urban_Schools_obj.config.cTwoField] != null && value[Urban_Schools_obj.config.cTwoField] > 0
                        });

                        Cycle_Two.filter(function (value) {
                        data['Total_Cycle_2_boy' + subregion[i].value] = 0
                        data['Total_Cycle_2_boy_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {

                            data['Total_Cycle_2_boy' + subregion[i].value] += value[Urban_Schools_obj.config.cTwoField]
                            data['Total_Cycle_2_boy_school' + subregion[i].value]++

                        }
                        });
                        Cycle_Two.filter(function (value) {
                        data['Total_Cycle_2_girl' + subregion[i].value] = 0
                        data['Total_Cycle_2_girl_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {

                            data['Total_Cycle_2_girl' + subregion[i].value] += value[Urban_Schools_obj.config.cTwoField]
                            data['Total_Cycle_2_girl_school' + subregion[i].value]++

                        }
                        });

                        const Cycle_Three = data['att_' + subregion[i].value].filter(function (value) {
                        data['_cy3_attributes' + subregion[i].value] = []
                        data['_cy3_attributes' + subregion[i].value].push(value)
                        return value[Urban_Schools_obj.config.cThreeField] != null && value[Urban_Schools_obj.config.cThreeField] > 0
                        });

                        Cycle_Three.filter(function (value) {
                        data['Total_Cycle_3_boy' + subregion[i].value] = 0
                        data['Total_Cycle_3_boy_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {


                            data['Total_Cycle_3_boy' + subregion[i].value] += value[Urban_Schools_obj.config.cThreeField]
                            data['Total_Cycle_3_boy_school' + subregion[i].value]++

                        }
                        });
                        Cycle_Three.filter(function (value) {
                        data['Total_Cycle_3_girl' + subregion[i].value] = 0
                        data['Total_Cycle_3_girl_school' + subregion[i].value] = 0
                        if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                            // data.Total_Cycle_3_girl += value[Urban_Schools_obj.config.cThreeField]
                            // data.Total_Cycle_3_girl_school++
                            data['Total_Cycle_3_girl' + subregion[i].value] += value[Urban_Schools_obj.config.cThreeField]
                            data['Total_Cycle_3_girl_school' + subregion[i].value]++

                        }
                        });


                    }
                    }

                    data._attributes.filter(function (value) {
                    if (value[Urban_Schools_obj.config.kinderField] != null && value[Urban_Schools_obj.config.kinderField] > 0) {
                        data.Total_Kindergarten += value[Urban_Schools_obj.config.kinderField]
                        data.Total_Kindergarten_school++
                        data._KG_attributes.push(value)
                    }
                    })



                    const Cycle_One = data._attributes.filter(function (value) {
                    data._cy1_attributes.push(value)

                    return value[Urban_Schools_obj.config.cOneField] != null && value[Urban_Schools_obj.config.cOneField] > 0
                    });

                    Cycle_One.filter(function (value) {
                    if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                        data.Total_Cycle_1_boy += value[Urban_Schools_obj.config.cOneField]
                        data.Total_Cycle_1_boy_school++

                    }
                    });
                    Cycle_One.filter(function (value) {
                    if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                        data.Total_Cycle_1_girl += value[Urban_Schools_obj.config.cOneField]
                        data.Total_Cycle_1_girl_school++
                    }
                    });

                    const Cycle_Two = data._attributes.filter(function (value) {
                    data._cy2_attributes.push(value)

                    return value[Urban_Schools_obj.config.cTwoField] != null && value[Urban_Schools_obj.config.cTwoField] > 0
                    });

                    Cycle_Two.filter(function (value) {
                    if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                        data.Total_Cycle_2_boy += value[Urban_Schools_obj.config.cTwoField]
                        data.Total_Cycle_2_boy_school++
                    }
                    });
                    Cycle_Two.filter(function (value) {
                    if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                        data.Total_Cycle_2_girl += value[Urban_Schools_obj.config.cTwoField]
                        data.Total_Cycle_2_girl_school++
                    }
                    });

                    const Cycle_Three = data._attributes.filter(function (value) {
                    data._cy3_attributes.push(value)

                    return value[Urban_Schools_obj.config.cThreeField] != null && value[Urban_Schools_obj.config.cThreeField] > 0
                    });

                    Cycle_Three.filter(function (value) {
                    if (value[Urban_Schools_obj.config.genderField].includes('ذكور') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                        data.Total_Cycle_3_boy += value[Urban_Schools_obj.config.cThreeField]
                        data.Total_Cycle_3_boy_school++

                    }
                    });
                    Cycle_Three.filter(function (value) {
                    if (value[Urban_Schools_obj.config.genderField].includes('إناث') || value[Urban_Schools_obj.config.genderField].includes('مشترك')) {
                        data.Total_Cycle_3_girl += value[Urban_Schools_obj.config.cThreeField]
                        data.Total_Cycle_3_girl_school++
                    }
                    });
                }
                callBack(data)


                });
        }

        Urban_Schools_obj.loadCycle = function(callBack) {

            // Urban_Schools_obj.EmaraFeatures = [];
            Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.schoolLayerUrl,
                "1=1",
                null,
                false,
                [Urban_Schools_obj.config.eduField],
                false,
                function (_features) {
                if (_features) {
                    var data = []
                    for (var i = 0; i < _features.length; i++) {
                        data.push(_features[i].attributes[Urban_Schools_obj.config.eduField])
                    }
                    let uniquedata = [...new Set(data)];
                    for (var i = 0; i < uniquedata.length; i++) {

                    if (uniquedata[i] != null) {

                        $("#cycle").append('<option value="' + uniquedata[i] + '">' + uniquedata[i] + '</option>');
                    }
                    }
                }

                callBack()
                });

        }

        Urban_Schools_obj.loadEmara = function(callBack) {
            Urban_Schools_obj.EmaraFeatures = [];
            Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.emaraLayerUrl,
                "1=1",
                null,
                true,
                [Urban_Schools_obj.config.emaraNameField, Urban_Schools_obj.config.emaraIdField, "CITIZENMALE", "CITIZENFEMALE", Urban_Schools_obj.config.CitizenTotalField],
                false,

                function (_features) {
                if (_features) {
                    for (var i = 0; i < _features.length; i++) {
                        var _id = _features[i].attributes[Urban_Schools_obj.config.emaraIdField];
                        var _name = Urban_Schools_obj.Dict_App['EMIRATEID'][_features[i].attributes[Urban_Schools_obj.config.emaraNameField]];
                        var _obj = {}
                        _obj._id = _features[i].attributes[Urban_Schools_obj.config.emaraIdField];
                        _obj[Urban_Schools_obj.config.emaraIdField] = _features[i].attributes[Urban_Schools_obj.config.emaraIdField];
                        _obj[Urban_Schools_obj.config.emaraNameField] = _features[i].attributes[Urban_Schools_obj.config.emaraNameField];
                        _obj[Urban_Schools_obj.config.CitizenTotalField] = _features[i].attributes[Urban_Schools_obj.config.CitizenTotalField];
                        _obj.level = 0;
                        _obj['geometry'] = _features[i].geometry;
                        Urban_Schools_obj.EmaraFeatures.push(_obj);
                        $("#Emara").append('<option value="' + _id + '">' + _name + '</option>');
                    }
                }
                $('#Emara').val(6)
                $('#Emara').change()
                const garphic = Urban_Schools_obj.EmaraFeatures.filter(function (value) {
                    return value[Urban_Schools_obj.config.emaraIdField] == selectedEmariteId
                });

                Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);

                callBack()
                });


            // $('#Emara').change(function () {

        }

        Urban_Schools_obj.loadDirectorate = function() {

            Urban_Schools_obj.DirectorateFeatures = [];
            Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.muniLayerUrl,
                Urban_Schools_obj.config.EmirateFKField + "=" + selectedEmariteId,
                null,
                true,
                [Urban_Schools_obj.config.muniNameField, Urban_Schools_obj.config.muniIdField, "CITIZENMALE", "CITIZENFEMALE", Urban_Schools_obj.config.CitizenTotalField],
                false,

                function (_features) {  
                $("#Directorate").empty()

                $("#Directorate").append('<option value="-1">-- الرجاء الإختيار --</option>');
                if (_features) {
                    for (var i = 0; i < _features.length; i++) {
                        var _id = _features[i].attributes[Urban_Schools_obj.config.muniIdField];
                        var _name = Urban_Schools_obj.Dict_App[Urban_Schools_obj.config.muniNameField][_features[i].attributes[Urban_Schools_obj.config.muniNameField]];
                        var _obj = {};
                        _obj._id = _features[i].attributes[Urban_Schools_obj.config.muniIdField];
                        _obj[Urban_Schools_obj.config.muniIdField] = _features[i].attributes[Urban_Schools_obj.config.muniIdField];
                        _obj[Urban_Schools_obj.config.muniNameField] = _features[i].attributes[Urban_Schools_obj.config.muniNameField];
                        _obj[Urban_Schools_obj.config.CitizenTotalField] = _features[i].attributes[Urban_Schools_obj.config.CitizenTotalField];
                        _obj.level = 1;
                        _obj['geometry'] = _features[i].geometry;
                        Urban_Schools_obj.DirectorateFeatures.push(_obj);
                        $("#Directorate").append('<option value="' + _id + '">' + _name + '</option>');
                    }

                    $('#Directorate').prop('disabled', '')
                }
            });

            $('#Directorate').change(function () {
                Urban_Schools_obj.deleteGrphicsLayer()
                Urban_Schools_obj.graphicsLayer.removeAll()
                // $('#div_info').css('display', 'none')
                // $('#statistics').css('display', 'none')
                // $('.accordion').css('display', 'none')

                $('#Regions').val('-1')
                $('#sub-Regions').val('-1')
                // $('#TabelList').empty()
                // $('#labelnotcover').css('display', 'none')
                // $('#TabelListNotCoverd').empty()
                // $('#barChart_divNotcoverd').empty()

                // $('#barChart_div').empty()
                // $('#barChart_div_morthan40').empty()

                // $('#searchBtn').prop('disabled', 'disabled')

                if ($("#Directorate").val() != '-1') {
                    if (Urban_Schools_obj.autoDirectorateFeatures) {
                        const garphic = Urban_Schools_obj.autoDirectorateFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.muniIdField] == $("#Directorate").val();
                        });
                        // if (selectedLevel === 'muni') {
                            Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);
                        // }
                    } else {
                        const garphic = Urban_Schools_obj.DirectorateFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.muniIdField] == $("#Directorate").val();
                        });
                        Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);
                    }

                Urban_Schools_obj.loadRegions()
                } else {
                Urban_Schools_obj.RegionsFeatures = []
                Urban_Schools_obj.SubRegionsFeatures = []
                $('#Regions').prop('disabled', 'disabled')
                $('#sub-Regions').prop('disabled', 'disabled')
                $('#sub-Regions-none-urban').prop('disabled', 'disabled')

                Urban_Schools_obj.view.graphics.removeAll()
                Urban_Schools_obj.goToLastGraphich("Emara", Urban_Schools_obj.EmaraFeatures, Urban_Schools_obj.config.emaraIdField)
                }
            })
        }

        Urban_Schools_obj.loadRegions = function() {
            Urban_Schools_obj.RegionsFeatures = [];
            Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.regLayerUrl,
                Urban_Schools_obj.config.muniIdField + '=' + $("#Directorate").val() + "AND " + Urban_Schools_obj.config.EmirateFKField+ " =" + selectedEmariteId,
                null,
                true,
                [Urban_Schools_obj.config.regNameField, Urban_Schools_obj.config.regIdField, Urban_Schools_obj.config.muniIdField, "CITIZENMALE", "CITIZENFEMALE", Urban_Schools_obj.config.CitizenTotalField],
                false,

                function (_features) {
                    $("#Regions").empty()
                    $("#Regions").append('<option value="-1">-- الرجاء الإختيار --</option>');
                    if (_features) {
                        for (var i = 0; i < _features.length; i++) {
                            var _id = _features[i].attributes[Urban_Schools_obj.config.regIdField];
                            var _name = _features[i].attributes[Urban_Schools_obj.config.regNameField];
                            var _obj = {};
                            _obj._id = _features[i].attributes[Urban_Schools_obj.config.regIdField];
                            _obj[Urban_Schools_obj.config.regIdField] = _features[i].attributes[Urban_Schools_obj.config.regIdField];
                            _obj[Urban_Schools_obj.config.regNameField] = _features[i].attributes[Urban_Schools_obj.config.regNameField];
                            _obj[Urban_Schools_obj.config.CitizenTotalField] = _features[i].attributes[Urban_Schools_obj.config.CitizenTotalField];
                            _obj.level = 2;
                            _obj["muniId"] = _features[i].attributes[Urban_Schools_obj.config.muniIdField];
                            _obj['geometry'] = _features[i].geometry;
                            Urban_Schools_obj.RegionsFeatures.push(_obj);
                            $("#Regions").append('<option value="' + _id + '">' + _name + '</option>');
                        }
                        $('#Regions').prop('disabled', '')
                    }
                }
            );

            $('#Regions').change(function (evt) {
                Urban_Schools_obj.view.graphics.removeAll()
                Urban_Schools_obj.deleteGrphicsLayer()
                Urban_Schools_obj.clearAllGraphicLyer()
                Urban_Schools_obj.graphicsLayer.removeAll()
                $('#sub-Regions').val('-1')
                // $('#div_info').css('display', 'none')
                // $('#statistics').css('display', 'none')
                // $('.accordion').css('display', 'none')
                // $('#TabelList').empty()
                // $('#labelnotcover').css('display', 'none')
                // $('#TabelListNotCoverd').empty()

                // $('#barChart_div').empty()
                // $('#barChart_div_morthan40').empty()
                // $('#barChart_divNotcoverd').empty()

                if ($("#Regions").val() != '-1') {
                    $("#generateReport").prop("disabled", false);
                    $('#searchBtn').prop('disabled', '');
                    if (Urban_Schools_obj.autoRegionsFeatures){
                        const garphic = Urban_Schools_obj.autoRegionsFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.regIdField] == $("#Regions").val();
                        });
                        // if (selectedLevel === 'reg') {
                            Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);
                        // }
                    } else {

                        const garphic = Urban_Schools_obj.RegionsFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.regIdField] == $("#Regions").val();
                        });
                        Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);
                    }

                    Urban_Schools_obj.loadSubRegionsInfo(function () {
                        Urban_Schools_obj.loadSubRegions();

                    })
                } else {
                    $("#generateReport").prop("disabled", false);
                    Urban_Schools_obj.goToLastGraphich("Directorate", Urban_Schools_obj.DirectorateFeatures, Urban_Schools_obj.config.muniIdField)
                    Urban_Schools_obj.SubRegionsFeatures = [];
                    $('#sub-Regions').prop('disabled', 'disabled');
                    $('#sub-Regions-none-urban').prop('disabled', 'disabled');
                    $('#searchBtn').prop('disabled', 'disabled');
                }
            })

        }

        Urban_Schools_obj.loadSubRegionsInfo = async function(callBack) {
            Urban_Schools_obj.SubRegionsFeatures = [];
            Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.subRegLayerUrl,
                Urban_Schools_obj.config.muniIdField + '=' + $("#Directorate").val() + " AND "+ Urban_Schools_obj.config.EmirateFKField +" = " + selectedEmariteId
                + " AND " + Urban_Schools_obj.config.MunicipalityFKField + " = " + $('#Regions').val(),
                null,
                true,
                ["*"],
                false,

                async function (_features) {
                $("#sub-Regions").empty()
                $("#sub-Regions").append('<option value="-1">-- الرجاء الإختيار --</option>');
                $("#sub-Regions-none-urban").empty()
                $("#sub-Regions-none-urban").append('<option value="-1">-- الرجاء الإختيار --</option>');
                if (_features) {
                    for (var i = 0; i < _features.length; i++) {
                        var _id = _features[i].attributes[Urban_Schools_obj.config.subRegIdField];
                        var _name = _features[i].attributes[Urban_Schools_obj.config.subRegNameField];
                        var _obj = {};
                        _obj._id = _features[i].attributes[Urban_Schools_obj.config.subRegIdField];
                        _obj[Urban_Schools_obj.config.subRegIdField] = _features[i].attributes[Urban_Schools_obj.config.subRegIdField];
                        _obj[Urban_Schools_obj.config.subRegNameField] = _features[i].attributes[Urban_Schools_obj.config.subRegNameField];
                        _obj[Urban_Schools_obj.config.CitizenTotalField] = _features[i].attributes[Urban_Schools_obj.config.CitizenTotalField];
                        _obj[Urban_Schools_obj.config.servPkField] = _features[i].attributes[Urban_Schools_obj.config.servPkField];
                        _obj.level = 4;
                        _obj["muniId"] = _features[i].attributes[Urban_Schools_obj.config.muniIdField];
                        _obj["regId"] =  _features[i].attributes["DISTRICTID"];
                        
                        await Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.SubRegionsLayerUrl_noneUrban,
                            Urban_Schools_obj.config.subRegIdField + '=' + _features[i].attributes[Urban_Schools_obj.config.subRegIdField],
                            null,
                            true,
                            ["*"],
                            false,
            
                            async function (_features_) {
                                _obj["type"] = _features_[0].attributes[Urban_Schools_obj.config.NEWFCSCCLASSIFICATION_noneUrban];
                            });

                        _obj["geometry"] = _features[i].geometry;
                        Urban_Schools_obj.SubRegionsFeatures.push(_obj);
                    }
                }
                    callBack()
                });
        }

        Urban_Schools_obj.loadSubRegions = function() {

            Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.SubRegionsLayerUrl_noneUrban,
                Urban_Schools_obj.config.muniIdField + '=' + $("#Directorate").val() + "AND " + Urban_Schools_obj.config.EmirateFKField + " =" + selectedEmariteId
                + "AND "+ Urban_Schools_obj.config.MunicipalityFKField +" =" + $('#Regions').val(),
                null,
                true,
                [Urban_Schools_obj.config.subRegNameField, Urban_Schools_obj.config.subRegIdField, Urban_Schools_obj.config.NEWFCSCCLASSIFICATION_noneUrban],
                false,

                function (_features) {
                $("#sub-Regions").empty()
                $("#sub-Regions").append('<option value="-1">-- الرجاء الإختيار --</option>');
                $("#sub-Regions").append('<option value="all">الكل</option>');

                $("#sub-Regions-none-urban").empty()
                $("#sub-Regions-none-urban").append('<option value="-1">-- الرجاء الإختيار --</option>');
                $("#sub-Regions-none-urban").append('<option value="all">الكل</option>');

                if (_features) {
                    for (var i = 0; i < _features.length; i++) {
                    var _id = _features[i].attributes[Urban_Schools_obj.config.subRegIdField];
                    var _name = _features[i].attributes[Urban_Schools_obj.config.subRegNameField];
                    // var _obj = {};
                    // _obj[Urban_Schools_obj.config.subRegIdField] = _features[i].attributes[Urban_Schools_obj.config.subRegIdField];
                    // _obj[Urban_Schools_obj.config.subRegNameField] = _features[i].attributes[Urban_Schools_obj.config.subRegNameField];
                    // _obj[Urban_Schools_obj.config.CitizenTotalField] = _features[i].attributes[Urban_Schools_obj.config.CitizenTotalField];
                    // _obj[Urban_Schools_obj.config.servPkField] = _features[i].attributes[Urban_Schools_obj.config.servPkField];


                    // _obj['geometry'] = _features[i].geometry;
                    // Urban_Schools_obj.SubRegionsFeatures.push(_obj);
                    if (_features[i].attributes[Urban_Schools_obj.config.NEWFCSCCLASSIFICATION_noneUrban] == 'Non Urban') {
                        $("#sub-Regions-none-urban").append('<option value="' + _id + '">' + _name + '</option>');
                        // $("#sub-Regions").append('<option value="' + _id + '"hidden> ' + _name + '</option>');
                    } else {

                        $("#sub-Regions").append('<option value="' + _id + '">' + _name + '</option>');
                    }
                    }
                    $('#sub-Regions').prop('disabled', '')
                    $('#sub-Regions-none-urban').prop('disabled', '')

                    $('#sub-Regions-none-urban').prop('disabled', '')

                }
                });

            $('#sub-Regions-none-urban').change(async function () {
                // if ($('#sub-Regions-none-urban').val() != 'all' && $('#sub-Regions-none-urban').val() != '-1') {

                await Urban_Schools_obj.deleteGrphicsLayer();
                await Urban_Schools_obj.clearAllGraphicLyer();
                await Urban_Schools_obj.graphicsLayer.removeAll();
                await Urban_Schools_obj.view.graphics.removeAll();
                // }

                // $('#div_info').css('display', 'none')
                // $('#statistics').css('display', 'none')
                // $('.accordion').css('display', 'none')
                // $('#TabelList').empty()
                // $('#labelnotcover').css('display', 'none')
                // $('#TabelListNotCoverd').empty()

                // $('#barChart_div').empty()
                // $('#barChart_div_morthan40').empty()
                // $('#barChart_divNotcoverd').empty()


                $('#sub-Regions').val('-1')
                if ($('#sub-Regions-none-urban').val() != '-1' && $('#sub-Regions-none-urban').val() != 'all') {

                    if (Urban_Schools_obj.autoSubRegionsFeatures) {
                        const garphic = await Urban_Schools_obj.autoSubRegionsFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.subRegIdField] == $("#sub-Regions-none-urban").val();
                        });
                        await Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);
                    } else {
                        const garphic = await Urban_Schools_obj.SubRegionsFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.subRegIdField] == $("#sub-Regions-none-urban").val();
                        });
                        await Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);
                    }
                } else if ($('#sub-Regions-none-urban').val() == 'all') {
                    var subregion = $('#sub-Regions-none-urban')[0];

                    var _geom = []

                    for (var i = 2; i < subregion.length; i++) {
                        const garphic = await Urban_Schools_obj.SubRegionsFeatures.filter(function (value) {
                        return value[Urban_Schools_obj.config.subRegIdField] == subregion[i].value;
                        });
                        _geom.push(garphic[0].geometry);
                    }
                    var _ugeom = _geom.length > 0 ? geometryEngine.union(_geom) : undefined;

                    await Urban_Schools_obj.zoomAndSelectArea(_ugeom);
                } else {
                    await Urban_Schools_obj.goToLastGraphich("Regions", Urban_Schools_obj.RegionsFeatures, Urban_Schools_obj.config.regIdField)
                }

            })
            $('#sub-Regions').change(async function () {
                // if ($('#sub-Regions').val() != 'all' && $('#sub-Regions').val() != '-1') {

                await Urban_Schools_obj.deleteGrphicsLayer()
                await Urban_Schools_obj.clearAllGraphicLyer()
                await Urban_Schools_obj.graphicsLayer.removeAll()
                // }
                await Urban_Schools_obj.view.graphics.removeAll()

                // $('#div_info').css('display', 'none')
                // $('#statistics').css('display', 'none')
                // $('.accordion').css('display', 'none')


                // $('#TabelList').empty()
                // $('#labelnotcover').css('display', 'none')
                // $('#TabelListNotCoverd').empty()

                // $('#barChart_div_morthan40').empty()
                // $('#barChart_div').empty()
                // $('#barChart_divNotcoverd').empty()
                await $('#sub-Regions-none-urban').val('-1')
                if ($('#sub-Regions').val() != '-1' && $('#sub-Regions').val() != 'all') {
                    if (Urban_Schools_obj.autoSubRegionsFeatures) {
                        $("#generateReport").prop("disabled", false);

                        const garphic = await Urban_Schools_obj.autoSubRegionsFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.subRegIdField] == $("#sub-Regions").val();
                        });
                        Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);
                    } else {

                        const garphic = await Urban_Schools_obj.SubRegionsFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.subRegIdField] == $("#sub-Regions").val();
                        });
                        await Urban_Schools_obj.zoomAndSelectArea(garphic[0].geometry, garphic[0]);
                    }
                } else if ($('#sub-Regions').val() == 'all') {
                    $("#generateReport").prop("disabled", true);

                    var subregion = $('#sub-Regions')[0]
                    var _geom = []

                    for (var i = 2; i < subregion.length; i++) {
                        const garphic = await Urban_Schools_obj.SubRegionsFeatures.filter(function (value) {
                            return value[Urban_Schools_obj.config.subRegIdField] == subregion[i].value;
                        });
                        _geom.push(garphic[0].geometry);
                    }
                    var _ugeom = _geom.length > 0 ? await geometryEngine.union(_geom) : undefined;
                    await Urban_Schools_obj.zoomAndSelectArea(_ugeom);
                } else {
                    await Urban_Schools_obj.goToLastGraphich("Regions", Urban_Schools_obj.RegionsFeatures, Urban_Schools_obj.config.regIdField)
                }
            })
        }

        Urban_Schools_obj.goToLastGraphich = function(Tag_id, features, feaildName) {

            if ('#' + Tag_id) {
                const garphic = features.filter(function (value) {
                return value[feaildName] == $('#' + Tag_id).val();;
                });
                Urban_Schools_obj.zoomAndSelectArea(garphic[0]['geometry'], garphic[0]);
            }
        }

        Urban_Schools_obj.onOpen = function() {
        }

        Urban_Schools_obj.executeQuery = async function(_url, _where, _geom, _returnGeom, _outFields, _distinct, callBack) {
            var query = new Query();
            query.where = _where;
            if (_geom) {
                query.geometry = _geom;
            }

            if (_distinct) {
                query.returnDistinctValues = _distinct
            }

            query.returnGeometry = _returnGeom;
            query.outFields = _outFields;
            query.outSpatialReference = Urban_Schools_obj.view.spatialReference;

            let layer = new FeatureLayer({
                url: _url
            })
            await layer.queryFeatures(query)
                .then((results) => {
                if (results.features.length > 0) {
                    callBack(results.features);
                } else {
                // alert("لا يوجد بيانات!");
                    callBack(false);
                }
                });
        }

        Urban_Schools_obj.executeQueryPopylation = function(_url, _geom, callBack) {
            var query = new Query();
            query.geometry = _geom;

            var statisticDefinition_POPULATIONOFGRID = {};
            statisticDefinition_POPULATIONOFGRID.statisticType = "sum";
            statisticDefinition_POPULATIONOFGRID.onStatisticField = Urban_Schools_obj.config.sumField;
            statisticDefinition_POPULATIONOFGRID.outStatisticFieldName = Urban_Schools_obj.config.scNameField;
            query.outStatistics = [statisticDefinition_POPULATIONOFGRID];

            let layer = new FeatureLayer({
                url: _url
            })
            layer.queryFeatures(query).then((results)=>{
            if (results.features.length > 0) {
                callBack(results.features);
            } else {
                // alert("لا يوجد بيانات!");
                callBack(false);
            }

            })
            // new QueryTask(_url).execute(query, function (results) {
            //   if (results.features.length > 0) {
            //     callBack(results.features);
            //   } else {
            //     // alert("لا يوجد بيانات!");
            //     callBack(false);
            //   }
            // });
        }


        Urban_Schools_obj.zoomAndSelectArea = function(_geom, attrs) {
            currentFeatureAttrs = attrs;

            // Urban_Schools_obj.Areagraphic = 0
            if (Urban_Schools_obj._zoomGraphic) {
                Urban_Schools_obj.view.graphics.remove(Urban_Schools_obj._zoomGraphic);
                // Urban_Schools_obj.mapPic.graphics.remove(Urban_Schools_obj._zoomGraphic);
            }

            if (Urban_Schools_obj._SecGraphic) {
                Urban_Schools_obj.view.graphics.remove(Urban_Schools_obj._SecGraphic);
                // Urban_Schools_obj.mapPic.graphics.remove(Urban_Schools_obj._SecGraphic);
            }
            var symbol = new SimpleFillSymbol("solid",
                new SimpleLineSymbol("solid", new Color([200, 0, 0]), 1), new Color([255, 255, 190, 0.4]));

            Urban_Schools_obj._zoomGraphic = new Graphic(_geom, symbol);
            Urban_Schools_obj.view.graphics.add(Urban_Schools_obj._zoomGraphic);

            // Urban_Schools_obj.mapPic.graphics.add(Urban_Schools_obj._zoomGraphic)
            Urban_Schools_obj.view.extent = _geom.extent;
            // Urban_Schools_obj.mapPic.setExtent(_geom.getExtent().expand(2));
            // $('#AreaGarphic').empty()
            // $('#AreaPolygonGarphic').empty()
            // $('#AreaGarphic').append('<h3 class="AreaGrphicclass">مساحة المنطقة المدروسة :  <span style="font-size: 1.3rem;">' +
            //   (geometryEngine.geodesicArea(_geom, "square-kilometers")).toFixed(4) + ' كم² </span></h3><hr> ')
            // Urban_Schools_obj.Areagraphic = geometryEngine.geodesicArea(_geom, "square-kilometers")
            // $('#AreaPolygonGarphic').append(Urban_Schools_obj.Areagraphic.toFixed(3) + " كم² ")
            // $('#AreaGarphic').removeClass('areagraphicdraw')
            // $('#AreaGarphic').addClass('areagraphicselect')
        }


        Urban_Schools_obj.deleteGrphicsLayer = function() {

            Urban_Schools_obj.graphicsLayer_KinderGarden10Min.removeAll()
            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.removeAll()
            Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.removeAll()
            Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.removeAll()
            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.removeAll()
            Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.removeAll()
            Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.removeAll()
            

            Urban_Schools_obj.graphicsLayer_KinderGarden10Min.visible = false;
            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_boy.visible = false;
            Urban_Schools_obj.graphicsLayer_CycleOne15min_boy.visible = false;
            Urban_Schools_obj.graphicsLayer_CycleThree20Min_boy.visible = false;
            Urban_Schools_obj.graphicsLayer_CycleTwo15Min_girl.visible = false;
            Urban_Schools_obj.graphicsLayer_CycleOne15min_girl.visible = false;
            Urban_Schools_obj.graphicsLayer_CycleThree20Min_girl.visible = false;
        }

        Urban_Schools_obj.initMapControllers = function () {
             // Add legend widget
             var legend = new Legend({
                view: Urban_Schools_obj.view
            });
            Urban_Schools_obj.view.ui.add(legend, "bottom-left");

            // Add basemap gallery widget
            var basemapGallery = new BasemapGallery({
                view: Urban_Schools_obj.view,
                container: document.createElement("div")
            });
            Urban_Schools_obj.view.ui.add(basemapGallery, "top-right");

            // Add fullscreen widget
            var fullscreen = new Fullscreen({
                view: Urban_Schools_obj.view
            });
            Urban_Schools_obj.view.ui.add(fullscreen, "top-left");
        }

        Urban_Schools_obj.destroy = function() {
            // $('#panel').text('');
            $("#loading").remove();
            // $('#barChart_div_morthan40').empty()
            // $('#table_StandrendNew').empty()
            // $('#print').css('display','none')
            // $('#recommendation_value').empty()
            // $('#label_cycle').empty()
            // $('#equation').css('display', 'none')
            // $('#barChart_divNotcoverd').empty()
            // $('#div_info').css('display', 'none')
            // $('#statistics').css('display', 'none')
            // $('.accordion').css('display', 'none')


            // $('#TabelList').empty()
            // $('#labelnotcover').css('display', 'none')
            // $('#TabelListNotCoverd').empty()

            // $('#barChart_div_morthan40').empty()
            // $('#barChart_div').empty()
            // $("#sub-Regions").empty()
            // $("#sub-Regions-none-urban").empty()
            // $('#barChart_div').empty()
            // $('#barChart_div_morthan40').empty()
            // $('#barChart_divNotcoverd').empty()
            // $('#sub-Regions').val('-1')
            // $('#div_info').css('display', 'none')
            // $('#statistics').css('display', 'none')
            // $('.accordion').css('display', 'none')
            // $('#TabelList').empty()
            // $('#labelnotcover').css('display', 'none')
            // $('#TabelListNotCoverd').empty()
            // $("#Regions").empty()
            // $("#Directorate").empty()
            // $('#table-striped').empty()
            // $('#table_SchoolInfo').empty();
            // $('#table_SchoolInfoNotcovred').empty();
            // $('#table_LandUse').empty();
            // $('#calculation_details').empty();


        }

    
        Urban_Schools_obj.enableClickOnView = () => {

        }

        Urban_Schools_obj.selectByLocation = function(event) {
            if (isSearchByLocationMode) {
                const point = new Point({
                    x: event.mapPoint.x,
                    y: event.mapPoint.y,
                    spatialReference: { wkid: 102100 }
                })
                
                // Create a graphic with the point geometry and symbol
                const pointGraphic = new Graphic({
                    geometry: point,
                });

                const selectedEmirateGraphic = Urban_Schools_obj.EmaraFeatures.filter(function (value) {
                    return value[Urban_Schools_obj.config.emaraIdField] == selectedEmariteId
                });
                
                if (!selectedEmirateGraphic[0].geometry.contains(pointGraphic.geometry)) {
                    alert.open("You're out of the Emirate boundaries!");
                } else {
                    $("#latLng").text(`(${event.mapPoint.longitude}, ${event.mapPoint.latitude})`)

                    $("#submitSearchByLocation").click(function(){

                        let layerType = $("#searchByLocation").val();
                        let idField;
                        let features;
                        if (layerType === 'muni') {
                            features = Urban_Schools_obj.autoDirectorateFeatures;
                            idField = Urban_Schools_obj.config.muniIdField;
                        } else if (layerType === 'reg') {
                            features = Urban_Schools_obj.autoRegionsFeatures;
                            idField = Urban_Schools_obj.config.regIdField;
                        } else if (layerType === 'subReg') {
                            features = Urban_Schools_obj.autoSubRegionsFeatures;
                            idField = Urban_Schools_obj.config.subRegIdField;
                        }
                        
                        if (features) {
                            
                            for (let feature of features) {
                                if (feature.geometry.contains(pointGraphic.geometry)) {
                                    $("#searchKeyword").val(`${layerType}-${feature[idField]}`);
                                    $('#searchKeyword').change();
                                    break;
                                }
                            }
                        }
                        isSearchByLocationMode = false;
                        $("#searchModeModal").modal("hide");
                        $('.btn-toggle-menu').click();
                        $('#searchFilter').on('click', function(){
                            $(this).parent().find('a').trigger('click')
                        })
                        // $('.btn-toggle-menu').click();
                        // $('#searchFilter').prop('checked', true);
                        // $("#searchByFilterContentElem").show();
                    })
                }
            }
        }

        Urban_Schools_obj.addFeatureToView = async function(_geom) {
            await Urban_Schools_obj.deleteGrphicsLayer();
            await Urban_Schools_obj.clearAllGraphicLyer();
            await Urban_Schools_obj.graphicsLayer.removeAll();
            // }
            await Urban_Schools_obj.view.graphics.removeAll();
            
            var symbol = new SimpleFillSymbol("solid",
            new SimpleLineSymbol("solid", new Color([200, 0, 0]), 1), new Color([255, 255, 190, 0.4]));
            
            Urban_Schools_obj.reportFeatureGraphic = new Graphic(_geom, symbol);
            Urban_Schools_obj.reportFeatureGraphic.invisible = true;
            await Urban_Schools_obj.view.graphics.add(Urban_Schools_obj.reportFeatureGraphic);

            // await Urban_Schools_obj.view.graphics.removeAll();

        }


        Urban_Schools_obj.createReport = async function (reportDataArray) {
            const featureLayer = new FeatureLayer({
                url: Urban_Schools_obj.config.reportTableUrl
            });
            
            await featureLayer.applyEdits({
                addFeatures: reportDataArray
            }).then((editsResult) => {

            }).catch((error) => {
                console.error("Error:", error);
            });
        }

        Urban_Schools_obj.readReport = async function (cycles, gender) {
            let new_cycles;

            if (cycles.length == 0) {
                new_cycles = [0, 1, 2, 3];
            } else {
                new_cycles = cycles.map((cycle)=>{
                    if (cycle === "Cycle_One") {
                        return 1;
                    } else if (cycle === "Cycle_Two") {
                        return 2;
                    } else if (cycle === "Cycle_Three") {
                        return 3;
                    } else if(cycle === "Cycle_0") {
                        return 0;
                    }
                })
            }
            
            if (gender.length == 0) {
                gender = ["ذكور", "إناث"];
            }
            
            let query = `area_id='${currentFeatureAttrs.level}-${currentFeatureAttrs._id}' and cycle IN (${new_cycles.join()}) and gender IN ('${gender.join("','")}')`;
            if (currentFeatureAttrs.level == 2) {
                query += ` AND municipality_id=${currentFeatureAttrs.muniId}`
            } else if(currentFeatureAttrs.level == 3 || currentFeatureAttrs.level == 4) {
                query += ` AND municipality_id=${currentFeatureAttrs.muniId} AND region_id=${currentFeatureAttrs.regId}`
            }

            await Urban_Schools_obj.executeQuery(Urban_Schools_obj.config.reportTableUrl,
                query,
                false,
                true,
                ['*'],
                false,
                async function (_features) {
                    let structuredFeatures = {
                        c0: {male:null, female:null},
                        c1: {male:null, female:null},
                        c2: {male:null, female:null},
                        c3: {male:null, female:null}
                    }
                    if (_features.length > 0) {
                        for (let feature of _features) {
                            // feature.attributes.totalCoveredSchools = calcTotalCoveredSchools()
                            feature.attributes.recommendationText = await handleRecommendationText(feature.attributes.recommendation_value);
                            if (feature.attributes.cycle === 0){
                                if (feature.attributes.gender === "ذكور"){
                                    structuredFeatures.c0.male = feature;
                                } else if (feature.attributes.gender === "إناث") {
                                    structuredFeatures.c0.female = feature;
                                }
                            } else if (feature.attributes.cycle === 1){
                                if (feature.attributes.gender === "ذكور"){
                                    structuredFeatures.c1.male = feature;
                                } else if (feature.attributes.gender === "إناث") {
                                    structuredFeatures.c1.female = feature;
                                }
                            } else if (feature.attributes.cycle === 2){
                                if (feature.attributes.gender === "ذكور"){
                                    structuredFeatures.c2.male = feature;
                                } else if (feature.attributes.gender === "إناث") {
                                    structuredFeatures.c2.female = feature;
                                }
                            } else if (feature.attributes.cycle === 3){
                                if (feature.attributes.gender === "ذكور"){
                                    structuredFeatures.c3.male = feature;
                                } else if (feature.attributes.gender === "إناث") {
                                    structuredFeatures.c3.female = feature;
                                }
                            }
                        }

                        let {uniqueSchoolIds, uniqueCoveredSchoolsData} = await calcTotalCoveredSchools(structuredFeatures);
                        structuredFeatures.totalCoveredSchoolsData = uniqueCoveredSchoolsData;
                        structuredFeatures.totalCoveredSchoolsIds = uniqueSchoolIds;
                        // calc covered schools capacity and operating capacity
                        structuredFeatures.totalCoveredSchoolsCapacity = 0;
                        structuredFeatures.totalCoveredSchoolsOperatingCapacity = 0;
                        uniqueCoveredSchoolsData.forEach(school => {
                            structuredFeatures.totalCoveredSchoolsCapacity += school.capacity;
                            structuredFeatures.totalCoveredSchoolsOperatingCapacity += school.operatingCapacity;
                        });

                    generateReport(_features[0], structuredFeatures);
                }
            })
        }

        Urban_Schools_obj.getIntersectedServiceArea = async function(geographicArea, serviceFeatures) {
            let schoolIds = []; // added -1 to avoid empty list
            let intersectedServices = []

            for (let _feature of serviceFeatures) {
                let isIntersect = geometryEngine.intersects(_feature.geometry, geographicArea.geometry)
                if (isIntersect) {
                    schoolIds.push(_feature.attributes[Urban_Schools_obj.config.servPkField]);
                    intersectedServices.push(_feature.geometry);
                }
            }

            return {schoolIds, intersectedServices};
        }

        Urban_Schools_obj.getCoveredNonCoveredSchools = async function(schoolIds, geographicArea, schoolsUrl, schoolsFeatures) {
            let coveredSchools = [];
            let nonCoveredSchools = [];
            const schools = schoolsFeatures.filter(function (value) {
                return schoolIds.includes(value.attributes[Urban_Schools_obj.config.scPkField].toString());
            });

            if (schools) {
                for (let _feature of schools) {
                    let schoolData = {
                        name: _feature.attributes[Urban_Schools_obj.config.scNameField],
                        capacity: _feature.attributes[Urban_Schools_obj.config.CapacityField],
                        operatingCapacity: _feature.attributes[Urban_Schools_obj.config.opCapField],
                    }

                    let isIntersect = geometryEngine.intersects(_feature.geometry, geographicArea.geometry)
                    if (isIntersect) {
                        coveredSchools.push(schoolData);
                    } else {
                        nonCoveredSchools.push(schoolData)
                    }
                }
            }

            return {coveredSchools, nonCoveredSchools}
        }
 
        Urban_Schools_obj.unionServices = async function(intersectedServices) {
            let unionServices = null;
            if (intersectedServices.length > 0) {
                unionServices = await geometryEngine.union(intersectedServices)
            }
            return unionServices
        }

        Urban_Schools_obj.calcDifference = async function(firstGeometry, secondGeometry) {
            let difference = null;
            if (firstGeometry && secondGeometry) {
                difference = await geometryEngine.difference(firstGeometry, secondGeometry)
            }
            return difference;
        }

        Urban_Schools_obj.calcNotCoveredArea = async function(area, intersectedServices) {
            let notCoveredArea = null;
            let unionServices = await Urban_Schools_obj.unionServices(intersectedServices);
            let difference = await Urban_Schools_obj.calcDifference(area.geometry, unionServices);
            if (difference) notCoveredArea =  await geometryEngine.geodesicArea(difference, "square-kilometers")
            
            return notCoveredArea;
        }

        Urban_Schools_obj.calcCoveredArea = async function(area, intersectedServices) {
            let coveredArea = null;
            let unionServices = await Urban_Schools_obj.unionServices(intersectedServices);
            let intersection = await geometryEngine.intersect(area.geometry, unionServices);
            if(intersection) coveredArea = await geometryEngine.geodesicArea(intersection, "square-kilometers");
            return coveredArea;
        }

        Urban_Schools_obj.init(function () {
            setTimeout(() => {

                if (selectedEmariteId) {
                    Urban_Schools_obj.loadEmara(function () {
                        Urban_Schools_obj.loadDirectorate();
                    })
                }
                $("#preloader").css("display", "none");
            }, 2000);
        Urban_Schools_obj.startup();
        // Urban_Schools_obj.initMapControllers();
        });

        selectHandler = Urban_Schools_obj.view.on('click', Urban_Schools_obj.selectByLocation);


        puplic_Urban_Schools_obj = Urban_Schools_obj;

    });

}

(function() {
    $("#preloader").css("display", "block")
    initRakSchools();
})();

setConfigValues(configUiElements);

export {Urban_Schools_obj};
