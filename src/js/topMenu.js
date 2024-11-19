document.addEventListener('DOMContentLoaded', function() {
    globalObject.filterObject = {
        itFacilities: [],
        schoolType: [],
        grade: [],
        ecoRate: [],
        countryRanking: [],
        averageGrade: [],
        extracurriculars: [],
    }

    const TopMenuUIElements = {
        menuElem : $('.menu'),
        toggleMenuBtnElem : $('.btn-toggle-menu'),
        itFacilitiesInputElem: $('#it-facilities'),
        schoolTypeInputElem: $('#school-type'),
        gradeInputElem: $('#grade'),
        ecoRateInputElem: $('#eco-rate'),
        countryRankingInputElem: $('#country-ranking'),
        averageInputElem: $('#average-grade'),
        extracurricularsInputElem: $('#extracurriculars'),
    }
    
    
    // UI Toggle Handlers
    const toggleTopMenu = () => {
        TopMenuUIElements.menuElem.toggleClass('expanded');
        toggleTopMenuBtn();
    }
    
    const toggleTopMenuBtn = () => {
        TopMenuUIElements.toggleMenuBtnElem.toggleClass('expanded');
        TopMenuUIElements.toggleMenuBtnElem.toggleClass("btn-danger");
        
        if (TopMenuUIElements.menuElem.hasClass("expanded")) {
            TopMenuUIElements.toggleMenuBtnElem.html('<i class="bi bi-x-circle"></i>');
        } else {
            TopMenuUIElements.toggleMenuBtnElem.html('<i class="bi bi-sliders"></i>');
        }
    }

    // UI Change Handlers
    const onChangeGradeInput = async () => {
        let grade = []
        if (TopMenuUIElements.gradeInputElem.val().length > 0) {
            for (i of TopMenuUIElements.gradeInputElem.val()) {
                grade.push(parseInt(i));
            }
        }
        console.log(grade)

        globalObject.filterObject.grade = grade;
        queryBuilder(globalObject.filterObject);
        globalObject.updateStatistics();
    }


    const onChangeExtracurricularsInput = async () => {
        globalObject.filterObject.extracurriculars = TopMenuUIElements.extracurricularsInputElem.val(); 
        queryBuilder(globalObject.filterObject);
        globalObject.updateStatistics();
    }

    const onChangeItFacilitiesInput = async () => {
        globalObject.filterObject.itFacilities= TopMenuUIElements.itFacilitiesInputElem.val(); 
        queryBuilder(globalObject.filterObject);
        globalObject.updateStatistics();
    }

    const onChangeSchoolTypeInput = () => {
        globalObject.filterObject.schoolType = TopMenuUIElements.schoolTypeInputElem.val(); 
        queryBuilder(globalObject.filterObject);
        globalObject.updateStatistics();
    }
    
    const onChangeEcoRateInput = () => {
        globalObject.filterObject.ecoRate = TopMenuUIElements.ecoRateInputElem.val(); 
        queryBuilder(globalObject.filterObject);
        globalObject.updateStatistics();
    }

    const onChangeCountryRankingInput = () => {
        globalObject.filterObject.countryRanking = TopMenuUIElements.countryRankingInputElem.val(); 
        queryBuilder(globalObject.filterObject);
        globalObject.updateStatistics();
    }

    const onChangeAverageGradeInput = () => {
        globalObject.filterObject.averageGrade = TopMenuUIElements.averageInputElem.val(); 
        queryBuilder(globalObject.filterObject);
        globalObject.updateStatistics();
    }

    
    // Assign Elements Handlers
    TopMenuUIElements.toggleMenuBtnElem.on('click', toggleTopMenu);
    TopMenuUIElements.gradeInputElem.on('change', onChangeGradeInput);
    TopMenuUIElements.itFacilitiesInputElem.on('change', onChangeItFacilitiesInput);
    TopMenuUIElements.schoolTypeInputElem.on('change', onChangeSchoolTypeInput);
    TopMenuUIElements.ecoRateInputElem.on('change', onChangeEcoRateInput);
    TopMenuUIElements.countryRankingInputElem.on('change', onChangeCountryRankingInput);
    TopMenuUIElements.averageInputElem.on('change', onChangeAverageGradeInput);
    TopMenuUIElements.extracurricularsInputElem.on('change', onChangeExtracurricularsInput);
    
    // Multi Select
    TopMenuUIElements.itFacilitiesInputElem.select2();
    TopMenuUIElements.schoolTypeInputElem.select2();
    TopMenuUIElements.gradeInputElem.select2();
    TopMenuUIElements.ecoRateInputElem.select2();
    TopMenuUIElements.countryRankingInputElem.select2();
    TopMenuUIElements.averageInputElem.select2();
    TopMenuUIElements.extracurricularsInputElem.select2();
});
