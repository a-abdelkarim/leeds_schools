const queryBuilder = (filterObject) => {
    let queryString = '';
    let isFirstCondition = true; // Flag to track the first condition

    if (filterObject.schoolType.length > 0) {
        queryString += ` school_type IN ('${filterObject.schoolType.join("','")}') `;
        isFirstCondition = false; // Set flag to false after the first condition
    }

    if (filterObject.grade.length > 0) {
        if (!isFirstCondition) queryString += ` AND `;
        queryString += ` grade IN (${filterObject.grade.join(",")}) `;
        isFirstCondition = false;
    }

    if (filterObject.ecoRate.length > 0) {
        if (!isFirstCondition) queryString += ` AND `;
        queryString += ` eco_rate IN (${filterObject.ecoRate.join(",")}) `;
        isFirstCondition = false;
    }

    if (filterObject.countryRanking.length > 0) {
        if (!isFirstCondition) queryString += ` AND `;
        queryString += ` country_ranking IN (${filterObject.countryRanking.join(",")}) `;
        isFirstCondition = false;
    }

    if (filterObject.averageGrade.length > 0) {
        if (!isFirstCondition) queryString += ` AND `;
        queryString += ` average_grade IN ('${filterObject.averageGrade.join("','")}') `;
        isFirstCondition = false;
    }

    if (filterObject.extracurriculars.length > 0) {
        if (!isFirstCondition) queryString += ` AND `;
        queryString += ` extracurriculars IN ('${filterObject.extracurriculars.join("','")}') `;
    }

    globalObject.schoolsLayer.definitionExpression = queryString;
}

const updateQueryString = (queryString) => {

}