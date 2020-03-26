const fetch = require('node-fetch');
const commonHelpers = require('../common/commonHelpers.js');


module.exports = {
    calculate: async () => {
        const response = await fetch('https://datahub.io/core/co2-ppm/r/0.csv');
        const responseText = await response.text();

        const responseTextLines = responseText.split("\n");
        const linesWithOutHeader = responseTextLines.slice(1);

        const years = [];
        const averageYearlyPpms = [];
        let ppmsByYear = []; // e.g. [ [317.21, 318.2, ...], [319.12, 318.123, ...] ]

        for (let i = 0; i < linesWithOutHeader.length; i++) {
            const line = linesWithOutHeader[i];

            if (line.length > 0) { // This is necessary because the csv file ends with \n
                const date = line.split(",")[0];
                const year = Number.parseInt(date.split("-")[0]);
                const ppm = Number.parseFloat(line.split(",")[2]);
                if (ppm > 0) { //dataset contains negative numbers because of missing values
                    if (i === 0 || (years[years.length - 1] !== year)) {
                        years.push(year);
                        ppmsByYear.push([]);
                    }
                    ppmsByYear[ppmsByYear.length - 1].push(ppm);
                }

            }
        }

        for (let x of ppmsByYear) {
            averageYearlyPpms.push(commonHelpers.arraysAverage(x).toFixed(2));
        }

        return {
            "years": years,
            "averageYearlyPpms": averageYearlyPpms
        }
    }
};