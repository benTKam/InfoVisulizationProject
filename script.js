// Set up the SVG container
var margin = { top: 50, right: 50, bottom: 50, left: 50 },
  width = 1200 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

var svg = d3
  .select("#graph-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data from the TSV file
d3.tsv("merged_movies.tsv")
  .then(function(data) {
    console.log(data); // Verify that the data is being loaded correctly
    
    // Define scales for the x and y axes
    var xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, function(d) { return d.startYear; }))
      .range([0, width]);

    var yScale = d3
      .scaleLinear()
      .domain([0, 10])
      .range([height, 0]);

    // Define color scale
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(d3.group(data, function(d) {
        return d.genres.split(",")[0];
      }).keys());

    // Add the x and y axes
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    svg
      .append("g")
      .call(d3.axisLeft(yScale));

    // Add a scatter plot point for each movie
    var scatterPoints = svg
      .selectAll(".scatter-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "scatter-point")
      .attr("cx", function(d) { return xScale(d.startYear); })
      .attr("cy", function(d) { return yScale(d.averageRating); })
      .attr("r", 5)
      .attr("fill", function(d) { return colorScale(d.genres.split(",")[0]); });
  })
  .catch(function(error) {
    console.log(error);
  });
