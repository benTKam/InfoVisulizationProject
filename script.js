let margin = { top: 50, right: 50, bottom: 50, left: 50 },
  width = 1800 - margin.left - margin.right,
  height = 1500 - margin.top - margin.bottom;

let svg = d3
  .select("#section-1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// === Scrollytelling boilerplate === //
function scroll(n, offset, func1, func2) {
  const el = document.getElementById(n)
  return new Waypoint({
    element: document.getElementById(n),
    handler: function (direction) {
      direction == 'down' ? func1() : func2();
    },
    //start 75% from the top of the div
    offset: offset
  });
};

// Define the steps of the scroll story
let steps = [
  {
    title: "Step 1",
    description: "This is the description of step 1.",
    startYear: 2000,
    endYear: 2005
  },
  {
    title: "Step 2",
    description: "This is the description of step 2.",
    startYear: 2005,
    endYear: 2010
  },
  {
    title: "Step 3",
    description: "This is the description of step 3.",
    startYear: 2010,
    endYear: 2015
  },
  {
    title: "Step 4",
    description: "This is the description of step 4.",
    startYear: 2015,
    endYear: 2020
  },
];

// Define the current step
let currentStep = 0;

// Load the data from the TSV file
d3.tsv("20006.tsv")
  .then(function (data) {
    console.log(data); // Verify that the data is being loaded correctly



    // Define scales for the x and y axes
    let xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, function (d) { return d.startYear; }))
      .range([0, width]);

    let yScale = d3
      .scaleLinear()
      .domain([0, 10])
      .range([height, 0]);

    // Define color scale
    const distinctValues = [...new Set(data.map(d => d.genres.split(",")[0]))];
    let colorScale = d3.scaleOrdinal().domain(distinctValues)
      .range(d3.schemeSet2);

    // Add the x and y axes
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    svg
      .append("g")
      .call(d3.axisLeft(yScale));

    // Add a scatter plot point for each movie
    let data1 = svg
      .selectAll(".scatter-point")
      .data(data.filter(function(d){
        return d.startYear >= 2000 && d.startYear <= 2005;
      }))
      .enter()
      .append("circle")
      .attr("class", "scatter-point")
      .attr("cx", function (d) { return xScale(d.startYear); })
      .attr("cy", function (d) { return yScale(d.averageRating); })
      .attr("r", 5)
      .attr("fill", function (d) { return colorScale(d.genres.split(",")[0]); })
    data1.on('mouseover', (event, d) => {
      d3.select(event.currentTarget).style("stroke", "black");
      d3.select('#tooltip')
        .style('display', 'block')
        .html('<h1 class="tooltip-header">' + "Title: " + d.primaryTitle + " Genre: " + d.genres + '</h1>');
    })
      .on('mouseleave', (event) => {  //when mouse isn’t over point
        d3.select('#tooltip').style('display', 'none'); // hide tooltip
        d3.select(event.currentTarget)
          .style("stroke", "none");
      })

    // let data2 = 

    // Add legend
    let legend = svg.selectAll(".legend")
      .data(distinctValues)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    // Add colored squares to legend
    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", colorScale);

    // Add text to legend
    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function (d) { return d; });
  })

  .catch(function (error) {
    console.log(error); // Log any errors
  });