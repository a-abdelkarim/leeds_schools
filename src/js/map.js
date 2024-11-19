document.addEventListener("DOMContentLoaded", function() {
    globalObject.LoadMapModules = function(callBack) {
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
            "esri/layers/GeoJSONLayer",
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
        ], function(Map, 
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
            GeoJSONLayer,
            GeometryService,
            SpatialReference,
            projection,
            Font,
            VectorTileLayer,
            Legend,
            BasemapGallery,
            Fullscreen,
            TextSymbol) {
                globalObject.EsriModules = {};
                globalObject.EsriModules.Map = Map;
                globalObject.EsriModules.MapView = MapView;
                globalObject.EsriModules.GeoJSONLayer = GeoJSONLayer;
                globalObject.EsriModules.GraphicsLayer = GraphicsLayer;
                globalObject.EsriModules.Graphic = Graphic;
                callBack();
        });

    }

    globalObject.initMap = function() {
        globalObject.map = new globalObject.EsriModules.Map({
            basemap: "topo-vector"
        });
        globalObject.view = new globalObject.EsriModules.MapView({
            container: "viewDiv",
            map: globalObject.map,
            center: CONFIGS.MAP.centerPoint,
            zoom: CONFIGS.MAP.zoomLevel
        });
    }

    globalObject.createMapGraphicLayers = function() {
        globalObject.graphicLayers = {};
        globalObject.graphicLayers.schoolsLayer = new globalObject.EsriModules.GraphicsLayer();

    };
    
    globalObject.addMapGraphicLayers = function() {
        globalObject.map.add(globalObject.graphicLayers.schoolsLayer);
    }

    globalObject.loadData = function() {
        globalObject.schoolsLayer = new globalObject.EsriModules.GeoJSONLayer({
            url: CONFIGS.DATA.path,
            renderer: {
                type: "simple", // Use a simple renderer
                symbol: {
                    type: "picture-marker", // Use picture marker symbol
                    url: "./src/imgs/pin.png", // Path to your image
                    width: "32px", // Adjust to desired size
                    height: "32px"
                }
            },
            popupTemplate: {
              title: "{Establishment}", // Show the school name
              content: `
                <b>Address:</b> {Address 1}, {Address 2}, {Address 4}<br>
                <b>Phase:</b> {Phase}<br>
                <b>Status:</b> {Status}<br>
                <b>Capacity:</b> {capacity}<br>
                <b>Grade:</b> {grade}<br>
                <b>Population Served:</b> {population_served}<br><br>
                <a href={Website} target='_blank' style="color: blue;">Visit School Website</a>
              `
            }
        });

        globalObject.map.add(globalObject.schoolsLayer);


    }

    globalObject.filterMap = function(queryString=null) {
        globalObject.schoolsLayer.definitionExpression = '';
    }

    globalObject.updateStatistics = async function() {
        globalObject.statistics = {};
        let totalSchools = 0;
        let totalCapacity = 0;
        let totalCitizens = 0;
        let attributes = [];
    
        try {
            // Wait for the layer to load
            await globalObject.schoolsLayer.when();
    
            // Query features asynchronously and wait for the results
            const featureSet = await globalObject.schoolsLayer.queryFeatures();
    
            // Calculate statistics
            totalSchools = featureSet.features.length;
            featureSet.features.forEach((feature) => {
                attributes.push(feature.attributes);
                totalCapacity += feature.attributes.capacity || 0;
                totalCitizens += feature.attributes.population_served || 0;
            });

            // update features
            globalObject.schoolsData = attributes;
    
            // Update global statistics
            globalObject.statistics.totalSchools = totalSchools;
            globalObject.statistics.totalCapacity = totalCapacity;
            globalObject.statistics.totalCitizens = totalCitizens;
    
            updateSideMenuStatistics();
            updateCapacityChart();
            updateCountryRankingChart();

        } catch (error) {
            console.error("Error updating statistics:", error);
        }
    }

    $("#preloader").css("display", "block");
    globalObject.LoadMapModules(async ()=>{
        globalObject.initMap();
        globalObject.loadData();
        globalObject.filterMap();
        await globalObject.updateStatistics();
        $("#preloader").css("display", "none");
    })
});