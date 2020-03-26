const publicExports = {
    arraySum: (array) => {
        let sum = 0;
        for (let value of array) {
            sum = sum + value;
        }
        return sum;
    },
    arraysAverage: (array) => {
        return publicExports.arraySum(array) / array.length;
    }

};


module.exports = publicExports;