const customColors = {
  "Comedy": "#1f77b4",
  "Action": "#aec7e8",
  "Biography": "#ff7f0e",
  "Drama": "#ffbb78",
  "Adventure": "#2ca02c",
  "Animation": "#98df8a",
  "Crime": "#d62728",
  "Fantasy": "#ff9896",
  "Documentary": "#9467bd",
  "Horror": "#c5b0d5",
  "Thriller": "#8c564b",
  "Mystery": "#c49c94",
  "Romance": "#e377c2",
  "Family": "#f7b6d2",
  "Sci-Fi": "#7f7f7f",
  "Music": "#c7c7c7",
  "History": "#bcbd22"
};

let margin = { top: 50, right: 50, bottom: 50, left: 100 },
  width = 3500 - margin.left - margin.right,
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
    // Define an array of the distinct genre values
    const distinctGenres = [...new Set(data.map(d => d.genres.split(",")[0]))];

    // Count the number of movies for each genre
    const genreCounts = {};
    data.forEach(function (d) {
      const genre = d.genres.split(",")[0];
      if (genreCounts[genre]) {
        genreCounts[genre]++;
      } else {
        genreCounts[genre] = 1;
      }
    });

    // Sort the genres by their counts
    distinctGenres.sort(function (a, b) {
      return genreCounts[b] - genreCounts[a];
    });

    // Create a string containing the sorted genres and their counts
    let genreList = "";
    distinctGenres.forEach(function (genre) {
      genreList += "<li>" + genre + ": " + genreCounts[genre] + "</li>";
    });

    // Display the genre list in a div
    d3.select("#genre-list")
      .html("<ul>" + genreList + "</ul>");
    console.log(genreList);
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

  // Increment the current year by 1
  currentYear++;
  if (currentYear > 2023) {
    currentYear = 1990;
  }
});

let selectedGenre = '';

// sort graph by genre
document.getElementById("sort-by-genre-button").addEventListener("click", function () {
  // Define an array of the distinct genre values
  const distinctGenres = [...new Set(data.map(d => d.genres.split(",")[0]))];
  let colorScale = d3.scaleOrdinal()
    .domain(distinctGenres)
    .range(Object.values(customColors));

  // Get the index of the currently selected genre
  let currentIndex = distinctGenres.indexOf(selectedGenre);

  // Increment the index to select the next genre, or reset to 0 if at the end
  currentIndex = (currentIndex + 1) % distinctGenres.length;

  // Set the selected genre to the new index
  selectedGenre = distinctGenres[currentIndex];

  // Filter the data by the selected genre
  const filteredData = data.filter(d => d.genres.split(",")[0] === selectedGenre)
    .map(d => {
      return {
        ...d,
        color: colorScale(d.genres.split(".")[0])
      };
    });
  d3.select('#tooltip')
    .style('display', 'block')
    .html('<span class="tooltip-header">' + " Genre: " + selectedGenre + '</span>');
  // Call the updateScatterPlot function with the filtered data
  updateScatterPlot(filteredData);
});

// Add event listener to the "filter-top-100" button
d3.select("#filter-top-100").on("click", function () {
  // Sort the data by average rating
  data.sort(function (a, b) {
    return b.averageRating - a.averageRating;
  });

  // Filter the top 100 items
  let filteredData = data.slice(0, 100);

  // Update the scatter plot with the filtered data
  updateScatterPlot(filteredData);
});

// Update the scatter plot with the given data
function updateScatterPlot(data) {
  // Define scales for the x and y axes
  let xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, function (d) { return d.startYear; }))
    .range([0, width - 100]);

  let yScale = d3
    .scaleLinear()
    .domain([0, 10])
    .range([height, 0]);

  let distinctGenres = [...new Set(data.map(d => d.genres.split(",")[0]))];
  let colorScale = d3.scaleOrdinal()
    .domain(distinctGenres)
    .range(Object.values(customColors));

  // Remove the existing scatter plot points
  svg.selectAll(".scatter-point").remove();

  // Add the new scatter plot points
  let dataPoints = svg
    .selectAll(".scatter-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "scatter-point")
    .attr("r", 3)
    .attr("fill", function (d) { return colorScale(d.genres.split(",")[0]); });

  // Define the force simulation layout
  let simulation = d3.forceSimulation(data)
    .force("x", d3.forceX(function (d) { return xScale(d.startYear); }).strength(1))
    .force("y", d3.forceY(function (d) { return yScale(d.averageRating); }).strength(1))
    .force("collide", d3.forceCollide().radius(5).strength(1));

  // Update the position of the points on each tick of the simulation
  simulation.on("tick", function () {
    dataPoints
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
  });
  // Add tooltip functionality
  dataPoints.on('mouseover', (event, d) => {
    d3.select(event.currentTarget).style("stroke", "white");
    d3.select('#tooltip')
      .style('display', 'block')
      .html('<span class="tooltip-header">' + "Title: " + d.primaryTitle + " Genre: " + d.genres + '</span>');
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
    .data(distinctGenres)
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
    .text(d => d)
    .style("fill", "white");
}