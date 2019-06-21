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
var color = d3.scaleOrdinal(d3.schemeCategory20);
var prevCol = "";
var prevColR = "";

// Text Scale
var textScale = d3.scaleLinear()
    .range([70, 130]);

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
	// .on("mouseover", function(){mouseOverLink(this);})
    // .on("mouseover", function(d) {		
		// div_link.transition()		
			// .duration(200)		
			// .style("opacity", .9);		
		// div_link.html(d.name)	// define text of the tooltip
			// .style("left", (d3.event.pageX) + "px")		
			// .style("top", (d3.event.pageY - 28) + "px")
	// })
	.on("mouseover", function(){mouseOverLink(this);})
	// .on("mouseout", function(d) {		
		// div_link.transition()		
			// .duration(500)
			// .style("opacity", 0)
	// });
	.on("mouseout", linkMouseout);

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
	  .attr("rx", 4)
	  .attr("ry", 4)
      // .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
      .style("fill", checkPositionAndColorize)
	  // .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
	  .on("mouseover", function(d) {		
            div_node.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div_node.html(d.name)	// define text of the tooltip
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
	
	function linkMouseout(){
		d3.selectAll(".link").style("stroke-opacity", 0.05);
		d3.select(".tooltip_link").style("display","none").style("z-index","-1");
    }
	function mouseOverLink(obj){
		d3.select(obj).style("stroke-opacity", 0.5);
		var tipPos = getTopLeft(obj.id, null, d3.event);
		var heightSum = tipPos.top + 50 + $(".tooltip_link").height();
		var tipTop;
		heightSum > $("#chart").height() ? tipTop = tipPos.top - (heightSum - $("#chart").height()) - 50 : tipTop = tipPos.top + 50;
		var plchldrWidth = $(".l-box.asylumseekers.chart").width()/2;
		var marLeft = parseInt($("#chart").css('margin-left'));
		d3.select(".tooltip_link").style("top",tipTop +"px").style("left",plchldrWidth - 120 - marLeft +"px").style("display","block").style("background-color","rgba(255,255,255,.9)").style("z-index","5").html("<strong>" + formatNumber(obj.__data__.value) + "</strong>" + " people from " + "<strong>" + obj.__data__.source.name + "</strong>" + " asked for asylum in " + "<strong>" + obj.__data__.target.name + "</strong>");
    }
	function getTopLeft(id, className, event){
		var ttid;
		if(className){
		  ttid = "."+ className;
		}
		else { ttid = "#"+ id; }
		var offset = $("#chart").offset();
		var tipPosition = {"top": event.pageY - offset.top, "left": 0};
		return tipPosition;
	}
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