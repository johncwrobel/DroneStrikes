/*********************************************************************
I started with the code from the example on 9/20 and then modified it
for PHW4. The sections that I got from other sources are marked and 
have the source url.
*********************************************************************/

/* Added margins on right and left, increased bottom margin */
var margin = {top: 20, right: 15, bottom: 100, left: 15};
var width = 500 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;
var padding = 80;
var x_translate = 40;
var aggregatedData;

var variables = ["Maximum Total Reported Killed", "Maximum Civilians Reported Killed", "Maximum Number of Missiles Reported Fired", "Maximum Domestic Buildings"]
var short_variables = ["Total Killed", "Civialian Casualties", "Missiles Fired", "Buildings Destroyed"]
/* Setup axes/scales for bar chart */
var barX = d3.scale.ordinal()
	.rangeRoundBands([30, width - 40 * 2], 0.1);
/* tickFormat("") to form axis with ticks but no labels gotten from
http://stackoverflow.com/questions/19787925/create-a-d3-axis-without-tick-labels */
var barXaxis = d3.svg.axis().tickFormat("").scale(barX).orient("bottom");

var barY = d3.scale.linear().range([height, 0]);
var barYaxis = d3.svg.axis().scale(barY).orient("left");

var smallMultipleX = d3.scale.ordinal()
  .rangeRoundBands([0, width / variables.length], 0.1);
var smallMultipleY = d3.scale.linear().range([100,0]);

// add the tooltip area to the webpage
/*var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);*/

// creating bar chart <- changed this from scatter plot to bar chart
var barchart = d3.select(".barchart")
.append("svg")
.style("width", width + padding)
.style("height", height + margin.bottom)  //svg defalt size: 300*150
.append("g")

var small_multiples = d3.select(".barchart")
  .append("svg")
  .style("width", width+padding)
  .style("height", 130)

var small_multiple_canvases = [];
variables.forEach(function(d) {
  small_multiple_canvases.push(small_multiples.append("g")
    .attr("transform", "translate(" + small_multiple_canvases.length * width / variables.length + "," + 0 + ")"));
});

// creating scatter plot
/*var scatter = d3.select("body")
.append("svg")
.style("width", width + padding) // padding with second scatter
.style("height", height + margin.bottom)  //svg defalt size: 300*150
.append("g")*/

// load data
d3.csv("data/Drone Strike Data.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.fatalities = +d["Maximum Total Reported Killed"];
  });

  /* Created dataset to represent manufacturer -> avg calories data,
  this was adapted from http://learnjsdata.com/group_data.html under
  the "Summarizing Data" section */
  var totalFatalities = d3.nest()
  	.key(function(d) { return d["Country"]; })
  	.rollup(function(v) { return d3.sum(v, function(d) { return d.fatalities; }); })
  	.entries(data);
  aggregatedData = totalFatalities;

    /* Drawing the bar chart - much of this code was copied from my PHW3 with slight modifications */
    barX.domain(d3.range(totalFatalities.length));
    barY.domain([0, d3.max(totalFatalities, function(d) { return d.values; })*1.05]);

    for (k = 0; k < variables.length; k++) {
        aggregatedData = d3.nest()
          .key(function(d) { return d["Country"]; })
          .rollup(function(v) { return d3.sum(v, function(d) { return +d[variables[k]]; }); })
          .entries(data);
          smallMultipleX.domain(d3.range(aggregatedData.length));
          smallMultipleY.domain([0, d3.max(aggregatedData, function(d) { return d.values + 10; })]);
        small_multiple_canvases[k].selectAll("rect")
           .data(aggregatedData)
           .enter()
           .append("rect")
           .attr("x", function(d, i) {
              return smallMultipleX(i) + x_translate;
           })
           .attr("y", function(d) {
              return smallMultipleY(d.values)+5;
           })
           .attr("width", smallMultipleX.rangeBand())
           .attr("height", function(d) {
              return 100 - smallMultipleY(d.values);
           })
           .attr("fill", "black");
        small_multiple_canvases[k].append("text")
          .attr("x",x_translate)
          .attr("y",120)
          .attr("width", width / small_multiple_canvases.length)
          .text(short_variables[k]);
        small_multiple_canvases[k].append("rect")
          .attr("class", variables[k])
          .attr("x",x_translate)
          .attr("y",5)
          .attr("width", width / small_multiple_canvases.length)
          .attr("height", 100)
          .attr("fill", "black")
          .attr("opacity", 0)
          .on("click", function(d) {
            update_barchart(data, $(this).attr("class"));
          });
    };

    barchart.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(" + x_translate + "," + height + ")")
      .attr("fill", "black")
      .call(barXaxis)
    .append("text")
      .attr("class", "xlabel")
      .attr("x", width - 5)
      .attr("y", -6)
      .attr("fill", "black")
      .style("text-anchor", "end")
      .text("Country");

  // y-axis
  barchart.append("g")
      .attr("class", "yaxis")
      .attr("fill", "black")
      .attr("transform", "translate(" + 50 + ",0)")
      .call(barYaxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("fill", "black")
      .style("text-anchor", "end")
      .text(variables[0]);

  // Create bars
    // Modified code from https://github.com/alignedleft/d3-book/blob/master/chapter_09/29_dynamic_labels.html
	barchart.selectAll("rect")
	   .data(totalFatalities)
	   .enter()
	   .append("rect")
	   .attr("x", function(d, i) {
	   		return barX(i) + x_translate;
	   })
	   .attr("y", function(d) {
	   		return barY(d.values);
	   })
	   .attr("width", barX.rangeBand())
	   .attr("height", function(d) {
	   		return height - barY(d.values);
	   })
	   .attr("fill", "black");
  barchart.selectAll(".barLabel")
     .data(totalFatalities)
     .enter()
     .append("text")
     .attr("class", "barLabel")
     .text(function(d) {
        return d.values;
     })
     .attr("font-family", "sans-serif")
     .attr("fill", "black")
     .attr("transform", function(d, i) { return "translate(" + (barX(i) + x_translate + barX.rangeBand() / 2) + "," + barY(d.values) + ")rotate(-45)"; });

	/* Create labels - this code was modified from
	https://github.com/alignedleft/d3-book/blob/master/chapter_09/29_dynamic_labels.html */
	barchart.selectAll(".xLabel")
	   .data(totalFatalities)
	   .enter()
	   .append("text")
	   .attr("class", "xLabel")
	   .text(function(d) {
	   		return d.key;
	   })
	   .attr("text-anchor", "end")
	   .attr("font-family", "sans-serif")
	   .attr("font-size", "11px")
	   .attr("fill", "black")
	   // Code for rotation of labels adapted from http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
	   .attr("transform", function(d, i) { return "translate(" + (barX(i) + x_translate + barX.rangeBand() / 2) + "," + (height + 15) + ")rotate(-45)"; });
});

function update_barchart(data, variable) {
      /* Created dataset to represent manufacturer -> avg calories data,
    this was adapted from http://learnjsdata.com/group_data.html under
    the "Summarizing Data" section */
    aggregatedData = d3.nest()
      .key(function(d) { return d["Country"]; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d[variable]; }); })
      .entries(data);

    /* Drawing the bar chart - much of this code was copied from my PHW3 with slight modifications */
    barX.domain(d3.range(aggregatedData.length));
    barY.domain([0, d3.max(aggregatedData, function(d) { return d.values; })*1.05]);

    // enter selection
    barchart.selectAll("rect")
        .data(aggregatedData)
        .enter().append("div");
    barchart.selectAll(".barLabel")
        .data(aggregatedData)
        .enter().append("div");
    barchart.selectAll(".label")
        .data(aggregatedData)
        .enter().append("div");

    // update selection
    barchart.selectAll("rect")
        .attr("y", function(d) {
          return barY(d.values);
       })
        .attr("height", function(d) {
          return height - barY(d.values);
      });
    barchart.selectAll(".barLabel")
        .text(function(d) {
          return d.values;
        })
        .attr("transform", function(d, i) { return "translate(" + (barX(i) + x_translate + barX.rangeBand() / 2) + "," + barY(d.values) + ")rotate(-45)"; });
    barchart.selectAll(".label")
        .text(variable);

    // exit selection
    barchart.selectAll("rect")
        .data(aggregatedData)
        .exit().remove();
    barchart.selectAll(".barLabel")
        .data(aggregatedData)
        .exit().remove();

    barYaxis.scale(barY);
    barchart.select(".yaxis")
        .transition()
        .call(barYaxis);
    barchart.select(".label")
        .data(aggregatedData)
        .exit().remove();

}