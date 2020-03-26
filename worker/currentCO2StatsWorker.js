const fetch = require('node-fetch');


module.exports = {
  calculate: async () => {
    const response = await fetch('http://hqcasanova.com/co2/');
    return await response.text();
  }
};

