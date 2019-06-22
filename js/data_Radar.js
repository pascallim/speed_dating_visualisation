var margin = {top: 100, right: 100, bottom: 100, left: 100},
  width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
  height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

/*
var data = [
		  [//iPhone
			{axis:"Battery Life",value:0.22},
			{axis:"Brand",value:0.28},
			{axis:"Contract Cost",value:0.29},
			{axis:"Design And Quality",value:0.17},
			{axis:"Have Internet Connectivity",value:0.22},

		  ],[//Samsung
			{axis:"Battery Life",value:0.27},
			{axis:"Brand",value:0.16},
			{axis:"Contract Cost",value:0.35},
			{axis:"Design And Quality",value:0.13},
			{axis:"Have Internet Connectivity",value:0.20},

		  ],[//Nokia Smartphone
			{axis:"Battery Life",value:0.26},
			{axis:"Brand",value:0.10},
			{axis:"Contract Cost",value:0.30},
			{axis:"Design And Quality",value:0.14},
			{axis:"Have Internet Connectivity",value:0.22},
		  ]
		];
*/
//usage:

var color = d3.scale.ordinal()
  .range(["#EDC951","#CC333F","#00A0B0"]);

var radarChartOptions = {
  w: width,
  h: height,
  margin: margin,
  maxValue: 0.5,
  levels: 5,
  roundStrokes: true,
  color: color
};

d3.json("data/data_radar_race.json", function(data_radar) {
    var radar_keys = Object.keys(data_radar)
    var radar1 = data_radar[radar_keys[0]]
    console.log(radar1)
    var expected = radar1[Object.keys(radar1)[0]]
    var perceive = radar1[Object.keys(radar1)[1]]
    var ownView = radar1[Object.keys(radar1)[2]]
    var data = [expected, perceive, ownView]
    RadarChart(".radarChart", data, radarChartOptions);
});

//Call function to draw the Radar chart
