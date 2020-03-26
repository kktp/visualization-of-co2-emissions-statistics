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

socket.onopen = () => {
  socket.onmessage = (event) => {
    const message = event.data;
    const parseData = JSON.parse(message);
    console.info("[WEBSOCKET MSG RECEIVED]", parseData);

    if (parseData.name === "CalcCO2Stats") {
      plotPPMChartJs(parseData.data);
      plotPPMD3Js(parseData.data);
    } else if (parseData.name === "CurrentCO2Stats") {
      document.getElementById("currentCO2Ppm").innerText = parseData.data;
    }
  };

  socket.send("CalcCO2Stats");
  console.info("[WEBSOCKET MSG SENT]", "CalcCO2Stats");
  socket.send("CurrentCO2Stats");
  console.info("[WEBSOCKET MSG SENT]", "CurrentCO2Stats");

};
