let margin = { top: 50, right: 50, bottom: 50, left: 50 },
  width = 2000 - margin.left - margin.right,
  height = 1500 - margin.top - margin.bottom;

let svg = d3
  .select("#canvas")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let data;

// Load the data from the TSV file
d3.tsv("20006.tsv")
  .then(function (loadedData) {
    data = loadedData;
    console.log(data); // Verify that the data is being loaded correctly

    // Initialize the scatter plot
    updateScatterPlot(data);
    //updateThemeRiver(data);
  })
  .catch(function (error) {
    console.log(error); // Log any errors
  });

// Add event listener to the filter button
let currentYear = 1990;



d3.select("#filter-button").on("click", function () {
  // Filter data based on currentYear
  let filteredData = data.filter(function (d) {
    return d.startYear <= currentYear;
  });

  // Update the scatter plot with the filtered data
  updateScatterPlot(filteredData);
  //updateThemeRiver(filteredData);

  // Increment the current year by 1
  currentYear++;
  if (currentYear > 2023) {
    currentYear = 1990;
  }
});


// Update the scatter plot with the given data
function updateScatterPlot(data) {
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
    .range(d3.schemeCategory10);

  // Remove the existing scatter plot points
  svg.selectAll(".scatter-point").remove();

  // Add the new scatter plot points
  let dataPoints = svg
    .selectAll(".scatter-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "scatter-point")
    .attr("cx", function (d) { return xScale(d.startYear); })
    .attr("cy", function (d) { return yScale(d.averageRating); })
    .attr("r", 10)
    .attr("fill", function (d) { return colorScale(d.genres.split(",")[0]); });

  // Add tooltip functionality
  dataPoints.on('mouseover', (event, d) => {
    d3.select(event.currentTarget).style("stroke", "black");
    d3.select('#tooltip')
      .style('display', 'block')
      .html('<h1 class="tooltip-header">' + "Title: " + d.primaryTitle + " Genre: " + d.genres + '</h1>');
  })
    .on('mouseleave', (event) => {  //when mouse isn’t over point
      d3.select('#tooltip').style('display', 'none'); // hide tooltip
      d3.select(event.currentTarget)
        .style("stroke", "none");
    });

  // Add the x and y axes
  svg.select(".x-axis").remove();
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  svg.select(".y-axis").remove();
  svg
    .append("g")
    .attr("class", "y-axis")
.call(d3.axisLeft(yScale));

  // Add legend
  let legend = svg.selectAll(".legend")
    .data(distinctValues)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);
}


// Update the theme river graph with the given data
function updateThemeRiver(data) {
  // Define the stack layout
  let genreMap = d3.group(data, d => d.genres.split(",")[0]);

  // Define the stack layout
  let stack = d3.stack()
    .keys([...new Set(data.map(d => d.genres.split(",")[0]))])
    .value((d, key) => {
      let movies = genreMap.get(key);
      return d3.mean(movies, m => m.averageRating);
    });


  // Define scales for the x and y axes
  let xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, function (d) { return d.startYear; }))
    .range([0, width]);

  let yScale = d3
    .scaleLinear()
    .domain([
      d3.min(stack(data), d => d3.min(d, d => d[0])),
      d3.max(stack(data), d => d3.max(d, d => d[1]))
    ])
    .range([height, 0]);

  // Define color scale
  const distinctValues = [...new Set(data.map(d => d.genres.split(",")[0]))];
  let colorScale = d3.scaleOrdinal()
    .domain(distinctValues)
    .range(d3.schemeCategory20b);

  // Remove the existing theme river areas
  svg.selectAll(".theme-river-area").remove();

  // Add the new theme river areas
  let area = d3.area()
    .x((d, i) => xScale(d.data.startYear))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]));

  let themeRiverAreas = svg.selectAll(".theme-river-area")
    .data(stack(data))
    .enter()
    .append("path")
    .attr("class", "theme-river-area")
    .attr("d", area)
    .attr("fill", d => colorScale(d.key))
    .attr("opacity", 0.8);

  // Add tooltip functionality
  themeRiverAreas.on('mouseover', (event, d) => {
    d3.select(event.currentTarget)
    d3.select('#tooltip')
      .style('display', 'block')
      .html('<h1 class="tooltip-header">' + "Genre: " + d.key + '</h1>');
  })
    .on('mouseleave', (event) => {  //when mouse isn’t over area
      d3.select('#tooltip').style('display', 'none'); // hide tooltip
      d3.select(event.currentTarget)
    })
    .on('mousemove', (event, d) => {
      d3.select('#tooltip')
        .style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    });

  // Add x-axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale).ticks(20))
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .style("text-anchor", "end");

  // Add y-axis
  svg.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("text-anchor", "end");

  // Add chart title
  svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Average IMDb Ratings of Top 100 Most Popular Movies Each Year by Genre (2006-2016)");

  // Add legend
  let legend = svg.selectAll(".legend")
    .data(distinctValues)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);
}