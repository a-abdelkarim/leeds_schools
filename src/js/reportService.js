import config from "./config.js";
import { Urban_Schools_obj } from "./main.js";

export async function createReport(){
    const cycles = [0, 1, 2, 3];
    const gender = ["ذكور", "إناث"];

    const emirateFeatures = await loadAllData(Urban_Schools_obj.config.emaraLayerUrl);
    const municipalityFeatures = await loadAllData(Urban_Schools_obj.config.muniLayerUrl);
    const regionFeatures = await loadAllData(Urban_Schools_obj.config.regLayerUrl);
    const subRegionFeatures = await loadAllData(Urban_Schools_obj.config.subRegLayerUrl);
    const schoolsFeatures = await loadAllData(Urban_Schools_obj.config.schoolLayerUrl);

    const response = await fetch(`${Urban_Schools_obj.config.serverURL}reports`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            emiratesFeatures: emirateFeatures,
            municipalitiesFeatures: municipalityFeatures,
            regionsFeatures: regionFeatures,
            subRegionsFeatures: subRegionFeatures,
            schoolsFeatures: schoolsFeatures,
            cycles: cycles,
            gender: gender,
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to send data');
    }
    const responseData = await response.json();
    return responseData;
}

export function updateReport() {

}

export async function getReport() {
    let cycle = $("#cycle").val();
    let gender = $("#gendar").val();
    
    await Urban_Schools_obj.readReport(cycle, gender)
}
 
export function loadAllEmirates() {

}

export async function loadAllData(serviceUrl) {
    return new Promise((resolve, reject) => {
        Urban_Schools_obj.executeQuery(serviceUrl,
            "1=1",
            null,
            true,
            ['*'],
            false,
            function (_features) {
                resolve(_features);
            },
            function (error) {
                reject(error);
            }
        );
    });
}


export async function getEmiratesData(emirateFeatures) {

}

export async function getSchoolsData(cycle, gender) {
    let schools = [];
    let totalSchools = 0;
    let totalCapacity = 0;
    let totalOperatingCapacity = 0;

    var whereCycle = ''
    var wheregender = ''
    var where = ''

    if (cycle.length !== 0) {

        if (cycle.includes(0)) {
            if (whereCycle.length == 0) {
                whereCycle += `${Urban_Schools_obj.config.kinderField} > 0 AND ${Urban_Schools_obj.config.kinderField} IS NOT NULL  `
            } else {
                whereCycle += ` OR ${Urban_Schools_obj.config.kinderField} > 0 AND ${Urban_Schools_obj.config.kinderField} IS NOT NULL  `
            }
        }
        if (cycle.includes(1)) {
            if (whereCycle.length == 0) {
                whereCycle += `${Urban_Schools_obj.config.cOneField} > 0 AND ${Urban_Schools_obj.config.cOneField} IS NOT NULL `
            } else {
                whereCycle += ` OR ${Urban_Schools_obj.config.cOneField} > 0 AND ${Urban_Schools_obj.config.cOneField} IS NOT NULL`
            }
        }
        if (cycle.includes(2)) {
            if (whereCycle.length == 0) {
                whereCycle += `${Urban_Schools_obj.config.cTwoField} > 0 AND ${Urban_Schools_obj.config.cTwoField} IS NOT NULL `
            } else {
                whereCycle += ` OR ${Urban_Schools_obj.config.cTwoField} > 0 AND ${Urban_Schools_obj.config.cTwoField} IS NOT NULL  `
            }
        }

        if (cycle.includes(3)) {
            if (whereCycle.length == 0) {
                whereCycle += `${Urban_Schools_obj.config.cThreeField} > 0 AND ${Urban_Schools_obj.config.cThreeField} IS NOT NULL`
            } else {
                whereCycle += ` OR ${Urban_Schools_obj.config.cThreeField} > 0 AND ${Urban_Schools_obj.config.cThreeField} IS NOT NULL `
            }
        }

        where += whereCycle
    }
    if (gender.length !== 0) {

        for (var i = 0; i < gender.length; i++) {
            if (gender.length > 1) {
                wheregender = ''
            } else {
                wheregender += `(${Urban_Schools_obj.config.genderField} LIKE N'%${gender[i]}%' OR ${Urban_Schools_obj.config.genderField} LIKE N'%مشترك%')`
            }
        }

        if (where.length == 0) {
            where += wheregender
        } else {
            if (wheregender.length > 0) {
                where += ' AND ' + wheregender
            }
        }
    }
    
    if (cycle.length == 0 && gendar.length == 0) {
        where = '1=1'
    }

    await Urban_Schools_obj.getSchool(where, function (data) {

        if (data != undefined) {
            totalSchools = data.Total_School;
            totalCapacity = data.Total_capacity;
            totalOperatingCapacity = data.TotalOperatingCapacity;
            schools = data.schools;
        } else {
            console.log(error)
        }
        
        Urban_Schools_obj.AppendSchoolDataList(data, async function () {
            addFeatureLayer(data, cycle, async function () {})
        })
    })

    return {totalSchools, totalCapacity, totalOperatingCapacity, schools};
}


export async function createEmirateReports(emirateFeatures, cycles, gender, schoolFeatures) {
    const emirateReports = [];
    let updatedCount = 0;
    let round = 1;
    
    for (let g of gender) {
        for (let c of cycles) {
            let cycleServiceURl;
            for (let emirateFeature of emirateFeatures) {
                let EmirateData = {attributes: {}}
                EmirateData.attributes.id = emirateFeature.attributes.EMIRATEID;
                EmirateData.attributes.level = 0;
                EmirateData.attributes.area_id = `${EmirateData.attributes.level}-${EmirateData.attributes.id}`;
                EmirateData.attributes.name_en = emirateFeature.attributes.EMIRATESNAME;
                EmirateData.attributes.name_ar = emirateFeature.attributes.EMIRATESNAME;
                EmirateData.attributes.total_citizens = emirateFeature.attributes.CITIZENTOTAL;
                EmirateData.attributes.gender = g;
                EmirateData.attributes.cycle = c;

                let standardsResults = await calcStandards(
                    emirateFeature, 
                    Urban_Schools_obj.config.schoolLayerUrl, 
                    EmirateData,
                    c,
                    schoolFeatures
                )
                
                emirateReports.push(standardsResults);

                updatedCount++
                if (updatedCount === 1000) {
                    round++
                    sleep(2000);
                    updatedCount = 0;
                }
            }
        }
    }

    return emirateReports;
}


export async function createMunicipalityReports(municipalityFeatures, cycles, gender, schoolFeatures) {
    const municipalityReports = [];
    let updatedCount = 0;
    let round = 1;

    for (let g of gender) {
        for (let c of cycles) {
            for (let municipalityFeature of municipalityFeatures) {
                let municipalityData = {attributes: {}}
                await Urban_Schools_obj.addFeatureToView(municipalityFeature.geometry);
                // let { totalSchools, totalCapacity, totalOperatingCapacity, schools } = await getSchoolsData(cycles, gender);
                municipalityData.attributes.id = municipalityFeature.attributes.MUNICIPALITYID;
                municipalityData.attributes.level = 1;
                municipalityData.attributes.area_id = `${municipalityData.attributes.level}-${municipalityData.attributes.id}`;
                municipalityData.attributes.name_en = municipalityFeature.attributes.NAMEAR;
                municipalityData.attributes.name_ar = municipalityFeature.attributes.NAMEAR;
                municipalityData.attributes.emirate_id = municipalityFeature.attributes.EMIRATENAMEAR;
                municipalityData.attributes.total_citizens = municipalityFeature.attributes.CITIZENTOTAL;
                municipalityData.attributes.gender = g;
                municipalityData.attributes.cycle = c;
                let standardsResults = await calcStandards(
                    municipalityFeature, 
                    Urban_Schools_obj.config.schoolLayerUrl, 
                    municipalityData,
                    c,
                    schoolFeatures
                )
                municipalityReports.push(standardsResults);

                updatedCount++
                if (updatedCount === 1000) {
                    round++
                    console.log("start sleeping zzzzz")
                    sleep(2000);
                    updatedCount = 0;
                    console.log("waked up .......")
                }
            }
        }
    }

    return municipalityReports;
}


export async function createRegionReports(regionFeatures, cycles, gender, schoolFeatures) {
    const regionsReports = [];
    let updatedCount = 0;
    let round = 1; 

    for (let g of gender) {
        for (let c of cycles) {
            for (let regionFeature of regionFeatures) {
                let regionData = {attributes: {}}
                // await Urban_Schools_obj.addFeatureToView(regionFeature.geometry);
                // let { totalSchools, totalCapacity, totalOperatingCapacity, schools } = await getSchoolsData(cycles, gender);
                regionData.attributes.id = regionFeature.attributes.ID;
                regionData.attributes.level = 2;
                regionData.attributes.area_id = `${regionData.attributes.level}-${regionData.attributes.id}`;
                // regionData.attributes.schools_count = totalSchools;
                // regionData.attributes.capacity = totalCapacity;
                // regionData.attributes.schools = schools;
                // regionData.attributes.total_operating_capacity = totalOperatingCapacity;
                regionData.attributes.name_en = regionFeature.attributes.NAMEEN ;
                regionData.attributes.name_ar = regionFeature.attributes.NAMEAR ;
                regionData.attributes.emirate_id = regionFeature.attributes.EMIRATEID ;
                regionData.attributes.municipality_id = regionFeature.attributes.MUNICIPALITYID;
                regionData.attributes.total_citizens = regionFeature.attributes.CITIZENTOTAL;
                regionData.attributes.gender = g;
                regionData.attributes.cycle = c;
                // await Urban_Schools_obj.view.graphics.removeAll();
                // await Urban_Schools_obj.createReport(regionData);
                let standardsResults = await calcStandards(
                    regionFeature, 
                    Urban_Schools_obj.config.schoolLayerUrl, 
                    regionData,
                    c,
                    schoolFeatures
                )
                regionsReports.push(standardsResults);

                updatedCount++
                // console.log("regions: ", round, updatedCount)
                if (updatedCount === 1000) {
                    round++
                    console.log("start sleeping zzzzz")
                    sleep(2000);
                    updatedCount = 0;
                    console.log("waked up .......")
                }
            }
        }
    }

    return regionsReports
}


export async function createSubRegionReports(subRegionFeatures, cycles, gender, schoolFeatures) {
    const subRegionReports = [];
    let updatedCount = 0;
    let round = 1;
    // console.log(schoolFeatures)

    for (let g of gender) {
        for (let c of cycles) {
            for (let subRegionFeature of subRegionFeatures) {
                let subRegionData = {attributes: {}}
                // await Urban_Schools_obj.addFeatureToView(subRegionFeature.geometry);
                // let { totalSchools, totalCapacity, totalOperatingCapacity, schools } = await getSchoolsData(cycles, gender);
                subRegionData.attributes.id = subRegionFeature.attributes.ID;
                subRegionData.attributes.level = subRegionFeature.attributes.FCSCClassification === 'Urban'? 3: 4;
                subRegionData.attributes.area_id = `${subRegionData.attributes.level}-${subRegionData.attributes.id}`;
                // subRegionData.attributes.schools_count = totalSchools;
                // subRegionData.attributes.capacity = totalCapacity;
                // subRegionData.attributes.schools = schools;
                // subRegionData.attributes.total_operating_capacity = totalOperatingCapacity;
                subRegionData.attributes.name_en = subRegionFeature.attributes.NAMEEN ;
                subRegionData.attributes.name_ar = subRegionFeature.attributes.NAMEAR ;
                subRegionData.attributes.emirate_id = subRegionFeature.attributes.EMIRATEID ;
                subRegionData.attributes.municipality_id = subRegionFeature.attributes.MUNICIPALITYID;
                subRegionData.attributes.region_id = subRegionFeature.attributes.DISTRICTID;
                subRegionData.attributes.total_citizens = subRegionFeature.attributes.CITIZENTOTAL;
                subRegionData.attributes.gender = g;
                subRegionData.attributes.cycle = c;
                // await Urban_Schools_obj.view.graphics.removeAll();
                // await Urban_Schools_obj.createReport(subRegionData);
                let standardsResults = await calcStandards(
                    subRegionFeature, 
                    Urban_Schools_obj.config.schoolLayerUrl, 
                    subRegionData,
                    c,
                    schoolFeatures
                )
                subRegionReports.push(standardsResults);
                updatedCount++
                // console.log("sub regions: ", round, updatedCount)
                console.log(0)
                if (updatedCount === 1000) {
                    round++
                    console.log("start sleeping zzzzz")
                    sleep(2000);
                    // updatedCount = 0;
                    console.log("waked up .......")
                }
            }
        }
    }

    if (updatedCount === 1000) {
        sleep(2000);
        updatedCount = 0;
    }

    return subRegionReports;
}



function addFeatureLayer(data, cycle, callBack){
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

    getServiceArea_0(cycle, function () {
        callBack();
    })

    function getServiceArea_0(cycle, callBack) {
        if (cycle.includes(0)) {
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
                        }
                        })
        
                    }
                    } else {
                        Urban_Schools_obj.NotCoverdAreaKinderGarden = Urban_Schools_obj.view.graphics.items[0].geometry
        
                        // Urban_Schools_obj.graphicsLayer_KinderGarden10Min.add(graphic)
                        // data.AreagraphicKinderGarden = geometryEngine.geodesicArea(Urban_Schools_obj.NotCoverdAreaKinderGarden, "square-kilometers")
                    }
        
                    Urban_Schools_obj.IntersectPopulationGrid(Urban_Schools_obj.NotCoverdAreaKinderGarden, data, function (res) {
                    data.KG_population = res,
                        callBack(data)
                    })
        
                })
            })
        } else {
            callBack()
        }
    }
    // console.log(data)
}


async function calcSchoolBasedPopulation(totalCitizens, average, totalSchools) {
    let schoolBasedPopulation = ((parseInt(totalCitizens) / average ) - totalSchools).toFixed(3);
    
    let result;
    if (parseInt(schoolBasedPopulation) == 0 || parseInt(schoolBasedPopulation) < 0) {
        result = 1 * 0.3;
    } else {
        result = parseInt(schoolBasedPopulation) * 0.3;
    }

    return parseInt(result);
}

async function calcNotCoveredArea(areaKM) {

    let result;
    if (Math.ceil(areaKM) <= 4) {
        result = 1 * 0.1;
    } else if (Math.ceil(areaKM) > 4.1 && Math.ceil(areaKM) <= 5) {
        result = 2 * 0.1;
    } else if (Math.ceil(areaKM) > 5.1 && Math.ceil(areaKM) <= 6) {
        result = 3 * 0.1;
    } else if (Math.ceil(areaKM) > 6.1 && Math.ceil(areaKM) <= 7) {
        result = 4 * 0.1
    } else if (Math.ceil(areaKM) > 7.1 && Math.ceil(areaKM) <= 8) {
        result = 5 * 0.1
    } else if (Math.ceil(areaKM) > 8.1 && Math.ceil(areaKM) <= 9) {
        result = 6 * 0.1
    } else if (Math.ceil(areaKM) > 9.1 && Math.ceil(areaKM) <= 10) {
        result = 7 * 0.1
    } else if (Math.ceil(areaKM) > 10.1 && Math.ceil(areaKM) <= 11) {
        result = 8 * 0.1
    } else if (Math.ceil(areaKM) > 11.1) {
        result = 9 * 0.1
    }
    
    return result;
}


async function calcStandards(feature, schoolLayerUrl, featureData, cycle, schoolFeatures) {
    let serviceUrl = await getServiceAreaUrl(cycle);
    let serviceFeatures = await loadAllData(serviceUrl);

    const {schoolIds, intersectedServices} = await Urban_Schools_obj.getIntersectedServiceArea(feature, serviceFeatures);

    if (schoolIds.length > 0 && intersectedServices.length > 0) {

        // console.log(schoolIds, intersectedServices)
        const {coveredSchools, nonCoveredSchools} = await Urban_Schools_obj.getCoveredNonCoveredSchools(
            schoolIds, 
            feature, 
            schoolLayerUrl,
            schoolFeatures
        )
    
        featureData.attributes.in_area_schools = JSON.stringify(coveredSchools);
        featureData.attributes.out_area_schools = JSON.stringify(nonCoveredSchools);
        
    
        // calc standards
        const schoolBasedPopulation = await calcSchoolBasedPopulation(
            featureData.attributes.total_citizens, 
            Urban_Schools_obj.config.standardAverages[cycle.toString()],
            coveredSchools.concat(nonCoveredSchools).length
               
        )
        featureData.attributes.number_schools_citizens = schoolBasedPopulation.toString();
        
        // calc not covered area
        let notCoveredArea = await Urban_Schools_obj.calcNotCoveredArea(feature, intersectedServices)
        featureData.attributes.not_coverd_area = notCoveredArea;
        
        // calc covered area
        let coveredArea = await Urban_Schools_obj.calcCoveredArea(feature, intersectedServices)
        featureData.attributes.coverd_area = coveredArea;
    
        // calc covered area capacity rate
        let coveredTotalCapacity = 0;
        let coveredTotalOperatingCapacity = 0;
    
        coveredSchools.forEach(school => {
            coveredTotalCapacity += school.capacity;
            coveredTotalOperatingCapacity += school.operatingCapacity;
        });
    
        featureData.attributes.coverd_area_occupancy_rate = coveredTotalOperatingCapacity / coveredTotalCapacity;
    
        // calc covered area capacity rate
        let notCoveredTotalCapacity = 0;
        let notCoveredTotalOperatingCapacity = 0;
    
        nonCoveredSchools.forEach(school => {
            notCoveredTotalCapacity += school.capacity;
            notCoveredTotalOperatingCapacity += school.operatingCapacity;
        });
    
        featureData.attributes.not_coverd_area_occupancyrate = notCoveredTotalOperatingCapacity / notCoveredTotalCapacity
    }

    return featureData
}


async function getServiceAreaUrl(cycle) {
    if (cycle == 0) {
        return Urban_Schools_obj.config.servKinderLayerUrl;
    } else if (cycle == 1) {
        return Urban_Schools_obj.config.servCycleOneLayerUrl;
    } else if (cycle == 2) {
        return Urban_Schools_obj.config.servCycleTwoLayerUrl;
    } else if (cycle == 3) {
        return Urban_Schools_obj.config.servCycleThreeLayerUrl;
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};
 

$(document).ready(()=>{
    $("#syncDataSubmitBtn").click(createReport);
    $("#generateReport").click(getReport);
});