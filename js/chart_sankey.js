// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 600 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Color scale used
var prevCol = "";
var prevColR = "";
var click = 0;
var color_click = "rgb(95, 101, 112)";
var node_click = 0;

// Text Scale
var textScale = d3.scaleLinear()
    .range([70, 115]);

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(25)
    .nodePadding(1)
    .size([width, height]);
	
// Define the div for the tooltip
var div_link = d3.select("body").append("div")	
    .attr("class", "tooltip_link")				
    .style("opacity", 0);
var div_node = d3.select("body").append("div")	
    .attr("class", "tooltip_node")				
    .style("opacity", 0);



// load the data
d3.json("data/test.json", function(error, graph) {
  
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
      .sort(function(a, b) { return b.dy - a.dy; })
	  .on("mouseover", function(d) {
		if (d.source.node==node_click && click==1) {
			div_link.transition()		
				.duration(200)		
				.style("opacity", .9);		
			div_link.html(Math.round(d.value/d.source.value*100) + "% of the men in the <strong>"  +  d.source.name + "</strong> Category matched with " + Math.round(d.value/d.target.value*100) + "% of the women in the <strong>"  +  d.target.name + "</strong> Category.")	// define text of the tooltip
				.style("left", (d3.event.pageX) + "px")		
				.style("top", (d3.event.pageY - 28) + "px")
		} else if (click==0) {
			div_link.transition()		
				.duration(200)		
				.style("opacity", .9);		
			div_link.html(Math.round(d.value/d.source.value*100) + "% of the men in the <strong>"  +  d.source.name + "</strong> Category matched with " + Math.round(d.value/d.target.value*100) + "% of the women in the <strong>"  +  d.target.name + "</strong> Category.")	// define text of the tooltip
				.style("left", (d3.event.pageX) + "px")		
				.style("top", (d3.event.pageY - 28) + "px")
		}
		// d3.selectAll(".link").filter(function(d) { return d.source.node != graph.nodes[i].node && d.target.node != graph.nodes[i].node })
	  })
	  .on("mouseout", function(d) {		
		div_link.transition()		
			.duration(500)
			.style("opacity", 0)
		});

  // add in the nodes
  var node = svg.append("g")
    .selectAll(".node")
	.data(graph.nodes.sort(function (a,b) {return d3.ascending(a.value, b.value); }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  // add the rectangles for the nodes
  node
    .append("rect")	
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
	  .attr("rx", 4)
	  .attr("ry", 4)
      .style("fill", checkPositionAndColorize) // Color
	  .on("click", function(d, i) {
			if (click == 0) {
				// Reset Colors
				prevCol = ""
				prevColR = ""
				d3.selectAll("rect").style("fill", checkPositionAndColorize)
				// Change color
				d3.select(this).style("fill", color_click)
				// Show only this node links
				d3.selectAll(".link").style("stroke", "#000").style("stroke-opacity", 0.3)
				d3.selectAll(".link").filter(function(d) { return d.source.node != graph.nodes[i].node && d.target.node != graph.nodes[i].node }).style("stroke-opacity", 0.0).style("stroke", "#000")
				// Change state value
				click = 1
			} else if (click == 1) {
				if (d3.select(this).style("fill") == color_click){
					// Reset Colors
					prevCol = ""
					prevColR = ""
					d3.selectAll("rect").style("fill", checkPositionAndColorize)
					// Show all nodes
					d3.selectAll(".link").style("stroke-opacity", 0.1).style("stroke", "#000");
					// Change state value
					click = 0
					// alert(d3.select(this.parentNode).name)
					// console.log(node_click)
				} else {
					// Reset Colors
					prevCol = ""
					prevColR = ""
					d3.selectAll("rect").style("fill", checkPositionAndColorize)
					// Set color
					d3.select(this).style("fill", color_click)
					// Show all nodes
					d3.selectAll(".link").style("stroke-opacity", 0.1).style("stroke", "#000");
					// Show only this node links
					d3.selectAll(".link").style("stroke", "#000").style("stroke-opacity", 0.3)
					d3.selectAll(".link").filter(function(d) { return d.source.node != graph.nodes[i].node && d.target.node != graph.nodes[i].node }).style("stroke-opacity", 0.0).style("stroke", "#000")
					// node_click = alert(this.parentElement.parentElement.className)
				}
			}
		})		
	   .on("mouseover", function(d) {
			div_node.transition()		
                .duration(200)		
                .style("opacity", .9)	
            div_node.html("There are <strong>" + d.value +  "</strong> persons that have matched in the category '<strong>" + d.name + "</strong>'")	// define text of the tooltip
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px")
	    })
	   .on("mouseout", function(d) {		
			div_node.transition()		
				.duration(500)
				.style("opacity", 0)
		});

  // add in the title for the nodes
	textScale.domain(d3.extent(graph.nodes, function(d){return d.value;}));
    node
      .append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .style("font-size", function(){ return textSize = textScale(this.__data__.value).toString() + "%"; })
        .style("opacity", function(){ 
          if(this.__data__.x > 20 && this.__data__.value > 20){
            return 1;
          }
          else if(this.__data__.x < 20 && this.__data__.value > 20){
            return 1;
          }
          else return 0;
        })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

	// Color the rectangles
	function checkPositionAndColorize(obj){
		if(obj.x == 0 && prevCol == "") {
			prevCol = "#7aa5fa";
			return "#7aa5fa";
		  }
		  else if(obj.x == 0 && prevCol == "#7aa5fa"){
			prevCol = "#b4d5f9";
			return "#b4d5f9";
		  }
		  else if(obj.x == 0 && prevCol == "#b4d5f9"){
			prevCol = "#7aa5fa";
			return "#7aa5fa";
		  }
		  else if(obj.x !== 0 && prevColR == "") {
			prevColR = "#fa7aaf"; 
			return "#fa7aaf";
		  }
		  else if(obj.x !== 0 && prevColR == "#fa7aaf"){
			prevColR = "#fdc9fa";
			return "#fdc9fa";
		  }
		  else if(obj.x !== 0 && prevColR == "#fdc9fa"){
			prevColR = "#fa7aaf";
			return "#fa7aaf";
		  }
	}

});