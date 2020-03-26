const socket = new WebSocket("ws://localhost:3000/echo");

const ctx = document.getElementById('chartjs').getContext('2d');

const plotPPMChartJs = (data) => {

  const lineChartJs = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.years,
      datasets: [{
        label: "Average CO2 PPM per Year",
        borderColor: "rgb(75, 192, 192)",
        fill: false,
        lineTension: 0.1,
        data: data.averageYearlyPpms
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Visualization of CO2 PPM from 1958-2018'
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Year'
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'PPM'
          }
        }]
      }
    }
  });
};

const plotPPMD3Js = (data) => {

  let margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
  let svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  let x = d3.scaleLinear()
      .domain([d3.min(data.years, function (d) {
        return d;
      }), d3.max(data.years, function (d) {
        return d;
      })])
      .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  let y = d3.scaleLinear()
      .domain([d3.min(data.averageYearlyPpms, function (d) {
        return d;
      }), d3.max(data.averageYearlyPpms, function (d) {
        return d;
      })])
      .range([height, 0]);
  svg.append("g")
      .call(d3.axisLeft(y));

  svg.append("path")
      .datum(data.years)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
          .x(function (d, idx) {
            return x(data.years[idx])
          })
          .y(function (d, idx) {
            return y(data.averageYearlyPpms[idx])
          })
      )
};

const plotPPMHighcharts = (data) => {
  let avgPpms = data.averageYearlyPpms.map(Number);
  Highcharts.chart('highcharts', {

    title: {
      text: 'Visualization of CO2 PPM from 1958-2018'
    },

    yAxis: {
      title: {
        text: 'PPM'
      }
    },

    xAxis: {
      title: {
        text: 'Years'
      }
    },

    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle'
    },

    plotOptions: {
      series: {
        allowPointSelect: true,
        label: {
          connectorAllowed: false
        },
        pointStart: data.years[0]

      }
    },

    series: [{
      name: 'Average CO2 PPM per Year',
      data: avgPpms
    }],

    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }

  });
};

google.charts.load('current', {packages: ['corechart', 'line']});

const plotPPMGoogle = () => {

  let data = new google.visualization.DataTable();
  data.addColumn('number', 'Years');
  data.addColumn('number', 'Average CO2 PPM per Year');

  data.addRows([
    [0, 0],   [1, 10],  [2, 23],  [3, 17],  [4, 18],  [5, 9],
    [6, 11],  [7, 27],  [8, 33],  [9, 40],  [10, 32], [11, 35],
    [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
    [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
    [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
    [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
    [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
    [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
    [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
    [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
    [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
    [66, 70], [67, 72], [68, 75], [69, 80]
  ]);

  let options = {
    hAxis: {
      title: 'Years'
    },
    vAxis: {
      title: 'Parts per million'
    }
  };

  let chart = new google.visualization.LineChart(document.getElementById('chart_div'));

  chart.draw(data, options);
};
google.charts.setOnLoadCallback(plotPPMGoogle);

socket.onopen = () => {
  socket.onmessage = (event) => {
    const message = event.data;
    const parseData = JSON.parse(message);
    console.info("[WEBSOCKET MSG RECEIVED]", parseData);

    if (parseData.name === "CalcCO2Stats") {
      plotPPMChartJs(parseData.data);
      plotPPMD3Js(parseData.data);
      plotPPMHighcharts(parseData.data);
      plotPPMGoogle();
    } else if (parseData.name === "CurrentCO2Stats") {
      document.getElementById("currentCO2Ppm").innerText = parseData.data;
    }
  };

  socket.send("CalcCO2Stats");
  console.info("[WEBSOCKET MSG SENT]", "CalcCO2Stats");
  socket.send("CurrentCO2Stats");
  console.info("[WEBSOCKET MSG SENT]", "CurrentCO2Stats");

};
