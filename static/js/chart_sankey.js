// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 450 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Color scale used
var color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(25)
    .nodePadding(5)
    .size([width, height]);

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load the data
// var data = "{{ url_for('data_function') }}" ;
// data_function as a function in flask : ref (http://www.mydatastack.com/flaskd3part1)
// d3.json(data}, function(error, graph) {
// var data = "{{ url_for('static', filename='/data/data_sankey.json') }}" ;
d3.json("/getJson", function(error, graph) {

  // Constructs a new Sankey generator with the default settings.
  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(0);

  // add in the links
  var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
      .attr("class", "link")
      .attr("d", sankey.link() )
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

  // add in the nodes
  var node = svg.append("g")
    .selectAll(".node")
	.data(graph.nodes.sort(function (a,b) {return d3.ascending(a.value, b.value); }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	  // .call(d3.drag()
        // .subject(function(d) { return d; })
        // .on("start", function() { this.parentNode.appendChild(this); })
        // .on("drag", dragmove));

  // add the rectangles for the nodes
  node
    .append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
	  .attr("rx", 8)
	  .attr("ry", 8)
      .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      // .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
	  .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html(d.name)	// define text of the tooltip
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
		})
	   .on("mouseout", function(d) {
			div.transition()
				.duration(500)
				.style("opacity", 0)
		});

  // add in the title for the nodes
    node
      .append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

  // the function for moving the nodes
  // function dragmove(d) {
    // d3.select(this)
      // .attr("transform",
            // "translate("
               // + d.x + ","
               // + (d.y = Math.max(
                  // 0, Math.min(height - d.dy, d3.event.y))
                 // ) + ")");
    // sankey.relayout();
    // link.attr("d", sankey.link() );
  // }

});
