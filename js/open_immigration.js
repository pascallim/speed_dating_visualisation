function initSankey(){
  $( document ).ready(function() {
  var sankey;
  var graph = {"nodes" : [], "links" : []};
  var placeholder = d3.select(".l-box.asylumseekers:not(.full)");
  placeholder.append("div").classed("full",true);
  placeholder.append("div").attr("class", "title_box").html("Asylum applications in Europe January 2018 - February 2019");
  var totalNum = placeholder.append("div").attr("class", "totalNumber");
  var labCont = placeholder.append("div").attr("class", "labels");
  labCont.append("div").attr("class", "labLeft").html("Country of origin");
  labCont.append("div").attr("class", "labRight").html("Destination");
  var chrt = placeholder.append("div").attr("id", "chart");
  var tip = chrt.append("div").attr("class", "sank_tooltip");
  tip.append("div").attr("class", "tooltip-country");
  tip.append("div").attr("class", "tooltip-value");
  tip.append("table").attr("class", "data-table");
  var linkTip = chrt.append("div").attr("class", "linkTip");
  placeholder.append("div").attr("class", "title_box").html("Asylum applications in Europe 2018");
  placeholder.append("div").html("Click on the fields heading to sort the table by category and value").style("padding", "3px");
  placeholder.append("div").attr("class", "applicants_table");
  var units = "persons";
  var continents = ["World", "Africa", "Asia", "Europe", "North & Central America", "Oceania", "S. America & Caribbean"];
  var coloredCountries = ["Syria", "Afghanistan", "Iraq", "Kosovo", "Albania", "Eritrea", "Pakistan", "Germany", "Hungary", "Sweden", "Italy", "Austria", "France", "Belgium"];
  var colors = ["#ef1941", "#feb800", "#2b4043", "#21c0d3", "#ff4800", "#00b7af", "#0626a", "#008b9e", "#f34500", "#00b3ac", "#21c0d3", "#00626a", "#ef1941", "#feb800"];
  var dataset;
  var vpwidth = $("#chart").width();
  var margin = {top: 10, right: 0, bottom: 10, left: 0},
      width = vpwidth - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

  var textScale = d3.scale.linear()
    .range([85, 200]);

  var formatNumber = d3.format(",.0f"),    // zero decimal places
      format = function(d) { return formatNumber(d) + " " + units; },
      color = ["#aad801", "#4bc6df"];
  var tableTemplate;

  //------RESIZE
/*  d3.select(window)
        .on("resize", sizeChange);*/

  function sizeChange(){
    //d3.selectAll(".clear").remove();
    vpwidth = $("#chart").width();
    width = vpwidth - margin.left - margin.right;
    drawSankey(graph.nodes, graph.links);
    
  }


  // append the svg canvas to the page
  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var gi = svg.append("g");
  var gi2 = svg.append("g").attr("class", "nodesg");


  d3.csv("data/migr_asyappctzm.csv", function(error, data) {
    dataset = data;
    calcData(data);
  });

  function calcData(data){
      graph = {"nodes" : [], "links" : []};
      data.forEach(function (d) {
        if(d["2018M01"] != 0 && d["Y2018M01"] != ":"){
          graph.nodes.push({ "name": d.CITIZEN });
          graph.nodes.push({ "name": d.GEO });
          graph.links.push({"source": d.CITIZEN,
                            "target": d.GEO,
                            "value": (+d["2018M01"]) + (+d["2018M02"]) + (+d["2018M03"]) + (+d["2018M04"]) + (+d["2018M05"]) + (+d["2018M06"])
                             + (+d["2018M07"]) + (+d["2018M08"]) + (+d["2018M09"]) + (+d["2018M10"]) + (+d["2018M11"]) + (+d["2018M12"]) + (+d["2019M01"]) + (+d["2019M02"]) });
        }
        
       });

       graph.nodes = d3.keys(d3.nest()
         .key(function (d) { return d.name; })
         .map(graph.nodes));

       // loop through each link replacing the text with its index from node
       graph.links.forEach(function (d, i) {
         graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
         graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
       });


       //now loop through each nodes to make nodes an array of objects
       // rather than an array of strings
       graph.nodes.forEach(function (d, i) {
         graph.nodes[i] = { "name": d };
       });
              
       drawSankey(graph.nodes, graph.links);
       
  }

  
  function drawSankey(nodes, links){
    d3.select("#chart").selectAll("g").remove();
    d3.select("#chart").selectAll("path").remove();
    sankey = d3.sankey()
      .nodeWidth(20)
      .nodePadding(0)
      .size([width, height])
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(0);
    var path = sankey.link();

    //total number
    var tot = d3.sum(nodes, function(d) { return d.x == 0 ? d.value : 0; });
    d3.select(".totalNumber").html(formatNumber(tot));

    //links
    svg.selectAll(".link")
        .data(links)
      .enter().append("path")
        //.attr("id", function(d) { return "link"+ d.id; })
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .attr("class", "link")
        .attr("d", path)
        .on("mouseover", function(){mouseOverLink(this);})
        .on("mouseout", linkMouseout);
        //.sort(function(a, b) { return b.source.value - a.source.value; });

    //nodes
    var node = svg.append("g").selectAll(".node")
        .data(nodes.sort(function (a,b) {return d3.ascending(a.value, b.value); }))
      .enter().append("g")
        .attr("class", "node")
        .attr("id", function(d){ return "sank_" + continentStrip(d.name); })
        .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; });

    node.append("rect")
        .attr("height", function(d) { return Math.max(3, d.dy); })
        .attr("width", sankey.nodeWidth())
        .style("fill", checkPositionAndColorize)
        .on("mouseover",nodeMouseover)
        .on("mouseout",nodeMouseout);

    textScale.domain(d3.extent(nodes, function(d){return d.value;}));

    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .style("font-size", function(){ return textSize = textScale(this.__data__.value).toString() + "%"; })
        .style("opacity", function(){ 
          if(this.__data__.x > 20 && this.__data__.value > 35000){
            return 1;
          }
          else if(this.__data__.x < 20 && this.__data__.value > 20000){
            return 1;
          }
          else return 0;
        })
      .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");
  }

    
  function nodeMouseover(node, i){
    console.log(node.name);
    var col = d3.select("#sank_" + continentStrip(node.name)).select("rect").style("fill");
    d3.selectAll(".link").style("stroke", col).style("stroke-opacity", 0.2);
    d3.selectAll(".link").filter(function(d) { return d.source.name != graph.nodes[i].name && d.target.name != graph.nodes[i].name }).style("stroke-opacity", 0.0).style("stroke", "#000");
    d3.select(this).style("stroke", "#000");
    d3.select(this.parentNode).moveToFront();
    this.__data__.targetLinks.sort(function(a,b){
      return parseFloat(b.value) - parseFloat(a.value);
    });

    this.__data__.sourceLinks.sort(function(a,b){
      return parseFloat(b.value) - parseFloat(a.value);
    });


    var thiz = this.__data__;
    var targetData = "";
    var testArray = [];
    for (var i = 0; i < this.__data__.targetLinks.length; i++){
      var objToPush = {};
      objToPush[this.__data__.targetLinks[i].source.name] = this.__data__.targetLinks[i].value;
      testArray.push(objToPush);
    }
    var newTarData = combineKeyData(testArray.slice(0, 10));
    for (var prprt in newTarData){
      targetData += "<tr><td class='cou-name'>" + prprt + " : </td><td class='cou-val'>" + formatNumber(newTarData[prprt]) + "</td></tr>";
    }
      
    var sourceData = "";
    var newArray = [];
    for (var z = 0; z < this.__data__.sourceLinks.length; z++){
      var srcObjToPush = {};
      srcObjToPush[this.__data__.sourceLinks[z].target.name] = this.__data__.sourceLinks[z].value;
      newArray.push(srcObjToPush);
    }
    var newSrcData = combineKeyData(newArray.slice(0, 10));
    for (var proprt in newSrcData){
      sourceData += "<tr><td class='cou-name'>" + proprt + " : </td><td class='cou-val'>" + formatNumber(newSrcData[proprt]) + "</td></tr>";
    }

    var tipText = "";
    if (this.__data__.targetLinks.length>0){
      tipText = targetData;
    }
    else {tipText = sourceData;}

    var eX = this.__data__.x;
    var plchldrWidth = $(".l-box.asylumseekers.chart").width();
    var tipPos = getTopLeft(thiz.type_id, "tooltip", d3.event);
    var marLeft = parseInt($("#chart").css('margin-left'));
    var chartWidth = $("#chart").width();

    if(eX == 0 && width > 525){
      eX = 0 - marLeft;
    }
    else if(eX == 0 && width <= 525){
      eX = 25;
    }
    else if(eX !== 0 && width < 525){
      eX = width - $(".sank_tooltip").width() - 45;
    }
    else{
      var tipWidth = $(".sank_tooltip").width();//(d3.select(".sank_tooltip").style("width")).replace(/\px/g, '');
      eX= chartWidth;//plchldrWidth - tipWidth - marLeft - (plchldrWidth*10/100);      
    }

    var heightSum = tipPos.top + $(".sank_tooltip").height();
    var tipTop;
    d3.select("#sank_" + continentStrip(node.name)).select("rect")[0][0].__data__.y < 405 ?
    tipTop = d3.select("#sank_" + node.name).select("rect")[0][0].__data__.y + (d3.select("#sank_" + node.name).select("rect")[0][0].__data__.dy/2) :
    tipTop = 400;
    //heightSum > $("#chart").height() - 30 ? tipTop = tipPos.top - (heightSum - $("#chart").height()) - 70 : tipTop = tipPos.top;
    

    d3.select(".sank_tooltip").style("top",tipTop + "px").style("left",eX+"px").style("display","block").style("background-color","rgba(255,255,255,0.96)").style("z-index","5");
    d3.select(".tooltip-country").text(this.__data__.name).style("color", col);
    
    if(this.__data__.targetLinks.length > 0){
      d3.select(".tooltip-value").html("<strong>" + formatNumber(this.__data__.value) + "</strong>" + " people have asked for asylum in " + "<strong>" + this.__data__.name + "</strong>" + ".</br></br>" + "<strong>Top countries</strong>");
    }
    else{
      d3.select(".tooltip-value").html("<strong>" + formatNumber(this.__data__.value) + "</strong>" + " people have asked for asylum in other countries" + ".</br></br>" + "<strong>Top countries</strong>");
    }
    d3.select(".data-table").html(tipText).style("color", "rgba(51,51,51,.9");
  
  }

  function mouseOverLink(obj){
    d3.select(obj).style("stroke-opacity", 0.5);
    var tipPos = getTopLeft(obj.id, null, d3.event);
    var heightSum = tipPos.top + 50 + $(".linkTip").height();
    var tipTop;
    heightSum > $("#chart").height() ? tipTop = tipPos.top - (heightSum - $("#chart").height()) - 50 : tipTop = tipPos.top + 50;
    var plchldrWidth = $(".l-box.asylumseekers.chart").width()/2;
    var marLeft = parseInt($("#chart").css('margin-left'));
    d3.select(".linkTip").style("top",tipTop +"px").style("left",plchldrWidth - 120 - marLeft +"px").style("display","block").style("background-color","rgba(255,255,255,.9)").style("z-index","5").html("<strong>" + formatNumber(obj.__data__.value) + "</strong>" + " people from " + "<strong>" + obj.__data__.source.name + "</strong>" + " asked for asylum in " + "<strong>" + obj.__data__.target.name + "</strong>");
  }

  function linkMouseout(){
    d3.selectAll(".link").style("stroke-opacity", 0.05);
    d3.select(".linkTip").style("display","none").style("z-index","-1");
  }

  function nodeMouseout(){
    d3.selectAll(".link").style("stroke-opacity", 0.05).style("stroke", "#000");
    d3.selectAll("rect").style("stroke", "none");
    d3.select(".sank_tooltip").style("display","none").style("z-index","-1");
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

  function combineKeyData(data) {
      var output = {}, item;
      // iterate the outer array to look at each item in that array
      for (var i = 0; i < data.length; i++) {
          item = data[i];
          // iterate each key on the object

          for (var prop in item) {
              if (item.hasOwnProperty(prop)) {
                  // if this keys doesn't exist in the output object, add it
                  if (!(prop in output)) {
                      output[prop] = 0;
                  }
                  // add data onto the end of the key's array
                  output[prop] += item[prop];
              }
          }
      }
      return output;
  }

  var prevCol = "";
  var prevColR = "";
  function checkPositionAndColorize(obj){
    if(obj.x == 0 && prevCol == "") {
        prevCol = "#353535";
        return "#353535";
      }
      else if(obj.x == 0 && prevCol == "#353535"){
        prevCol = "#ff9b0b";
        return "#ff9b0b";
      }
      else if(obj.x == 0 && prevCol == "#ff9b0b"){
        prevCol = "#353535";
        return "#353535";
      }
      else if(obj.x !== 0 && prevColR == "") {
        prevColR = "#353535";
        return "#353535";
      }
      else if(obj.x !== 0 && prevColR == "#353535"){
        prevColR = "#ff9b0b";
        return "#ff9b0b";
      }
      else if(obj.x !== 0 && prevColR == "#ff9b0b"){
        prevColR = "#353535";
        return "#353535";
      }
  }

  function continentStrip(continent){
      var str = continent.replace(/\s+/g, '');
      var str2 = str.replace(/\.+/g, '');
      var str3 = str.replace(/\'+/g, '');
      var strFin = str3.replace(/\-/g, '');
      return strFin;
  }

  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };


  //------------------------------------------- TABLE ---------------------------------------//
  d3.csv("data/table_data.csv", function(d){
    return {
      name: d.name,
      applicants : +d.applicants,
      decisions_total: +d.decisions_total,
      population: +d.population,
      positive: +d.positive

    };
  }, function(error, data) {
    for (var i = 0; i < data.length; i++){
      data[i].appls_per_milllion = Math.round((1000000*data[i].applicants)/data[i].population);
      data[i].positive_rate = ((data[i].positive*100)/data[i].decisions_total).toFixed(1);
      if(data[i].positive_rate == "NaN"){
        data[i].positive_rate = 0;
      }
    }

    var applsMax = d3.max(data, function(d){ return d.applicants;});
    var decMax = d3.max(data, function(d){ return d.decisions_total;});
    var applspmlnMax = d3.max(data, function(d){ return d.appls_per_milllion;});

    tempData = {
      tabData: data,
      applicantsMax: applsMax,
      decisionsMax: decMax,
      appls_per_milllionMax: applspmlnMax
    };

    $.ajax({
      url: './template/table.html'
    }).done( function ( template ) {
        tableTemplate = template;
        drawTable();
        $("#ap_tbl").tablesorter();

    });

  });
  
  function drawTable(){
    var elem = $(".applicants_table");
    var ractive = new Ractive({
      el: elem,
      template: tableTemplate,
      //data: tempData
      data: {
        as_applicants: tempData,
        format: function ( num ) {
          return num.toFixed( 1 );
        }
      }
    });

  }

});
}
