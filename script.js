var margin = { top: 50, right: 50, bottom: 50, left: 50 },
  width = 1800 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

var svg = d3
  .select("#graph-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data from the TSV file
d3.tsv("20006.tsv")
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
    const distinctValues = [...new Set(data.map(d => d.genres.split(",")[0]))];
    var colorScale = d3.scaleOrdinal().domain(distinctValues)              
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
    var scatterPoints = svg
      .selectAll(".scatter-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "scatter-point")
      .attr("cx", function(d) { return xScale(d.startYear); })
      .attr("cy", function(d) { return yScale(d.averageRating); })
      .attr("r", 5)
      .attr("fill", function(d) { return colorScale(d.genres.split(",")[0]); })
      scatterPoints.on('mouseover', (event, d) => {
        d3.select(event.currentTarget).style("stroke", "black");
        d3.select('#tooltip')
          .style('display', 'block')
          .html('<h1 class="tooltip-header">' + "Title: " + d.primaryTitle + " Genre: " + d.genres + '</h1>');
        })
        .on('mouseleave', (event) => {  //when mouse isn’t over point
          d3.select('#tooltip').style('display', 'none'); // hide tooltip
          d3.select(event.currentTarget) //remove the stroke from point
              .style("stroke", "none");


      });
      // Add a legend for each genre color represented
var legend = d3.select('#legend') // Position the legend in the top right corner

var legendRectSize = 18; // The size of each legend rectangle
var legendSpacing = 4; // The spacing between each legend rectangle

var legendItems = legend.selectAll(".legend-item")
.data(distinctValues)
.enter()
.append("g")
.attr("class", "legend-item")
.attr("transform", function(d, i) {
  var height = legendRectSize + legendSpacing;
  var offset = height * distinctValues.length / 2;
  var x = 0;
  var y = i * height - offset;
  return "translate(" + x + "," + y + ")";
});

legendItems.append("rect")
.attr("width", legendRectSize)
.attr("height", legendRectSize)
.style("fill", colorScale);

legendItems.append("text")
.attr("x", legendRectSize + legendSpacing)
.attr("y", legendRectSize - legendSpacing)
.text(function(d) { return d; });
  })
  .catch(function(error) {
    console.log(error);
  });


// Create the legend
