let updateSideMenuStatistics, updateCapacityChart, updateCountryRankingChart;
document.addEventListener("DOMContentLoaded", function(){
    const sideMenuUIElements = {
        menuElem: $(".sidePanelContainer"),
        menuToggleBtnElem: $('.btn-toggle-panel'),
        totalSchoolsElem: $("#SUM_School"),
        totalCapacityElem: $("#Capacity"),
        totalCitizensElem: $("#SUM_POPULATION"),
        schoolsInfoBtnElem: $("#_info"),
        schoolsInfoModalElem: $("#schoolsInfoModal"),
        operatingCapacityChartElem: $('#barChart_div'),
        countryRankingChartElem: $('#country-ranking-chart')

    }
    
    // UI Toggle Handlers
    const toggleSideMenu = () => {
        sideMenuUIElements.menuElem.toggleClass('expanded');
        toggleSideMenuBtn();
    }
    
    const toggleSideMenuBtn = () => {
        sideMenuUIElements.menuToggleBtnElem.toggleClass('expanded');
        sideMenuUIElements.menuToggleBtnElem.toggleClass("btn-danger");
        
        if (sideMenuUIElements.menuElem.hasClass("expanded")) {
            sideMenuUIElements.menuToggleBtnElem.html('<i class="bi bi-x-circle"></i>');
        } else {
            sideMenuUIElements.menuToggleBtnElem.html('<i class="bi bi-clipboard-data"></i>');
        }
    }

    // data methods
    updateSideMenuStatistics = () => {
        sideMenuUIElements.totalCapacityElem.text(globalObject.statistics.totalCapacity);
        sideMenuUIElements.totalSchoolsElem.text(globalObject.statistics.totalSchools);
        sideMenuUIElements.totalCitizensElem.text(globalObject.statistics.totalCitizens);  
    };

    updateCapacityChart = () => {
        var content = '<canvas id="barChart"></canvas>';
        sideMenuUIElements.operatingCapacityChartElem.empty();
        sideMenuUIElements.operatingCapacityChartElem.append(content);

        let schoolsCapacity = []
        let schoolsOperatingCapacity = [];
        let schoolsNames = [];

        for (let i = 0; i < globalObject.schoolsData.length; i++) {
            if (globalObject.schoolsData[i]['operating_capacity'] != null) {
                schoolsOperatingCapacity.push(globalObject.schoolsData[i]['operating_capacity'])
            } else {
                schoolsOperatingCapacity.push(0)
            }

            if (globalObject.schoolsData[i]['capacity'] != null) {
                schoolsCapacity.push(globalObject.schoolsData[i]['capacity'])
            } else {
                schoolsCapacity.push(0)
            }

            schoolsNames.push(globalObject.schoolsData[i]['Establishment'])
        }

        var ctx = document.getElementById("barChart").getContext('2d');

        const datasets = {
            labels: schoolsNames,
            datasets: [
            {
                label: "Operating Capacity",
                backgroundColor: "#e75050",
                data: schoolsOperatingCapacity
            },
            {
                label: "Capacity",
                backgroundColor: "#4bb859",
                data: schoolsCapacity

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

        globalObject.schoolsCapacityChart = {
            data: datasets,
            options: options
        }
    }


    updateCountryRankingChart = () => {
        var content = '<canvas id="rankingBarChart"></canvas>';
        sideMenuUIElements.countryRankingChartElem.empty();
        sideMenuUIElements.countryRankingChartElem.append(content);

        let ranking = [];
        let schoolsNames = [];

        for (let i = 0; i < globalObject.schoolsData.length; i++) {
            if (globalObject.schoolsData[i]['country_ranking'] != null) {
                ranking.push(globalObject.schoolsData[i]['country_ranking'])
            } else {
                ranking.push(0)
            }

            schoolsNames.push(globalObject.schoolsData[i]['Establishment'])
        }

        var ctx = document.getElementById("rankingBarChart").getContext('2d');

        // Define color ranges
        const getColorForRank = (rank) => {
            if (rank >= 1 && rank <= 2) return "#1fda2d";
            if (rank >= 3 && rank <= 4) return "#7fe321";
            if (rank >= 5 && rank <= 6) return "#b6eb11";
            if (rank >= 7 && rank <= 8) return "#f2950e";
            if (rank >= 9 && rank <= 10) return "#f2420e"; 
            return "#cccccc"; // Default color (optional)
        };

        // Generate the backgroundColor array based on ranking
        const backgroundColors = ranking.map(rank => getColorForRank(rank));

        const datasets = {
            labels: schoolsNames,
            datasets: [
                {
                    label: "Country Ranking",
                    backgroundColor: backgroundColors,
                    data: ranking
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

        globalObject.countryRankingChart = {
            data: datasets,
            options: options
        }
    }

    // Assign Elements Handlers
    sideMenuUIElements.menuToggleBtnElem.on('click', toggleSideMenu)
    sideMenuUIElements.schoolsInfoBtnElem.on('click', function(event){
        var _columns = [
            { name: 'Establishment', title: "Establishment", breakpoints: "xs sm md" },
            { name: 'Phase', title: "Phase", breakpoints: "xs sm md" },
            { name: 'Status', title: "Status", breakpoints: "xs sm md" },
            { name: "Cluster", title: "Cluster", breakpoints: "xs sm md" },
            { name: 'UPRN', title: "UPRN", breakpoints: "xs sm md" },
            { name: 'capacity', title: "Capacity", breakpoints: "xs sm md" },
            { name: 'operating_capacity', title: "Operating Capacity", breakpoints: "all" },
            { name: 'grade', title: "Grade", breakpoints: "all" },
            { name: 'establishment_year', title: "Establishment Year", breakpoints: "all" },
            { name: 'school_type', title: "School Type", breakpoints: "all" },
            { name: 'population_served', title: "Population Served", breakpoints: "all" },
            { name: "country_ranking", title: "Rankin", breakpoints: "all" },
            { name: 'average_grade', title: "Average Grade",  breakpoints: "all" },
            { name: 'Website', title: "Website",  breakpoints: "all" },
        ];
        sideMenuUIElements.schoolsInfoModalElem.modal('show');
        $('#table_SchoolInfo').empty();
        $('#table_SchoolInfo').footable({
            "columns": _columns,
            "rows": eval(globalObject.schoolsData)
        });
    });
});

