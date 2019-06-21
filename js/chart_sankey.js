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
// var color = d3.scaleOrdinal(d3.schemeCategory20); 
var prevCol = "";
var prevColR = "";
var Color1_H = "#7aa5fa";


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
d3.json("data/data_sankey.json", function(error, graph) {
  
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
		div_link.transition()		
			.duration(200)		
			.style("opacity", .9);		
		div_link.html(Math.round(d.value/d.source.value*100) + "% of the men in the <strong>"  +  d.source.name + "</strong> Category matched with " + Math.round(d.value/d.target.value*100) + "% of the women in the <strong>"  +  d.target.name + "</strong> Category.")	// define text of the tooltip
			.style("left", (d3.event.pageX) + "px")		
			.style("top", (d3.event.pageY - 28) + "px")
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
      .style("fill", checkPositionAndColorize); // Color
	  // .on("mouseover", function(d) {		
            // div_node.transition()		
                // .duration(200)		
                // .style("opacity", .9);		
            // div_node.html(d.name)	// define text of the tooltip
                // .style("left", (d3.event.pageX) + "px")		
                // .style("top", (d3.event.pageY - 28) + "px")
		// })		
	   // .on("mouseover",nodeMouseover)
	   // .on("mouseout", function(d) {		
			// div_node.transition()		
				// .duration(500)
				// .style("opacity", 0)
			// d3.select(this).style("fill", "#334594");
		// });

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
	
	function nodeMouseover(node, i){
		// console.log(node.name);
		var col = d3.select(this).style("fill");
		console.log(col)
		d3.selectAll(".link").style("stroke", col).style("stroke-opacity", 0.2);
		d3.selectAll(".link").filter(function(d) { return d.source.name != graph.nodes[i].name && d.target.name != graph.nodes[i].name }).style("stroke-opacity", 0.0).style("stroke", "#000");
		d3.select(this).style("fill", "#334594");
		// d3.select(this.parentNode).moveToFront();
		// this.__data__.targetLinks.sort(function(a,b){
		  // return parseFloat(b.value) - parseFloat(a.value);
		// });

		// this.__data__.sourceLinks.sort(function(a,b){
		  // return parseFloat(b.value) - parseFloat(a.value);
		// });


		// var thiz = this.__data__;
		// var targetData = "";
		// var testArray = [];
		// for (var i = 0; i < this.__data__.targetLinks.length; i++){
		  // var objToPush = {};
		  // objToPush[this.__data__.targetLinks[i].source.name] = this.__data__.targetLinks[i].value;
		  // testArray.push(objToPush);
		// }
		// var newTarData = combineKeyData(testArray.slice(0, 10));
		// for (var prprt in newTarData){
		  // targetData += "<tr><td class='cou-name'>" + prprt + " : </td><td class='cou-val'>" + formatNumber(newTarData[prprt]) + "</td></tr>";
		// }
		  
		// var sourceData = "";
		// var newArray = [];
		// for (var z = 0; z < this.__data__.sourceLinks.length; z++){
		  // var srcObjToPush = {};
		  // srcObjToPush[this.__data__.sourceLinks[z].target.name] = this.__data__.sourceLinks[z].value;
		  // newArray.push(srcObjToPush);
		// }
		// var newSrcData = combineKeyData(newArray.slice(0, 10));
		// for (var proprt in newSrcData){
		  // sourceData += "<tr><td class='cou-name'>" + proprt + " : </td><td class='cou-val'>" + formatNumber(newSrcData[proprt]) + "</td></tr>";
		// }

		// var tipText = "";
		// if (this.__data__.targetLinks.length>0){
		  // tipText = targetData;
		// }
		// else {tipText = sourceData;}

		// var eX = this.__data__.x;
		// var plchldrWidth = $(".l-box.asylumseekers.chart").width();
		// var tipPos = getTopLeft(thiz.type_id, "tooltip", d3.event);
		// var marLeft = parseInt($("#chart").css('margin-left'));
		// var chartWidth = $("#chart").width();

		// if(eX == 0 && width > 525){
		  // eX = 0 - marLeft;
		// }
		// else if(eX == 0 && width <= 525){
		  // eX = 25;
		// }
		// else if(eX !== 0 && width < 525){
		  // eX = width - $(".sank_tooltip").width() - 45;
		// }
		// else{
		  // var tipWidth = $(".sank_tooltip").width();//(d3.select(".sank_tooltip").style("width")).replace(/\px/g, '');
		  // eX= chartWidth;//plchldrWidth - tipWidth - marLeft - (plchldrWidth*10/100);      
		// }

		// var heightSum = tipPos.top + $(".sank_tooltip").height();
		// var tipTop;
		// d3.select("#sank_" + continentStrip(node.name)).select("rect")[0][0].__data__.y < 405 ?
		// tipTop = d3.select("#sank_" + node.name).select("rect")[0][0].__data__.y + (d3.select("#sank_" + node.name).select("rect")[0][0].__data__.dy/2) :
		// tipTop = 400;

		// d3.select(".sank_tooltip").style("top",tipTop + "px").style("left",eX+"px").style("display","block").style("background-color","rgba(255,255,255,0.96)").style("z-index","5");
		// d3.select(".tooltip-country").text(this.__data__.name).style("color", col);
		
		// if(this.__data__.targetLinks.length > 0){
		  // d3.select(".tooltip-value").html("<strong>" + formatNumber(this.__data__.value) + "</strong>" + " people have asked for asylum in " + "<strong>" + this.__data__.name + "</strong>" + ".</br></br>" + "<strong>Top countries</strong>");
		// }
		// else{
		  // d3.select(".tooltip-value").html("<strong>" + formatNumber(this.__data__.value) + "</strong>" + " people have asked for asylum in other countries" + ".</br></br>" + "<strong>Top countries</strong>");
		// }
		// d3.select(".data-table").html(tipText).style("color", "rgba(51,51,51,.9");
  
	}
	function nodeMouseout(){
		d3.selectAll(".link").style("stroke-opacity", 0.05).style("stroke", "#000");
		d3.select(this).style("display","none").style("z-index","-1");
    }

	function getTopLeft(id, className, event){
		var ttid;
		if(className){
		  ttid = "."+ className;
		}
		else { ttid = "#"+ id; }
		var offset = $("#my_dataviz").offset();
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