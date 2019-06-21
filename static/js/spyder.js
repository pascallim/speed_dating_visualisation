//Possible options for the RadarChart function
w: 600, //Width of the circle
h: 600, //Height of the circle
margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
levels: 3, //How many levels or inner circles should be drawn
maxValue: 0, //What is the value that the biggest circle will represent
labelFactor: 1.25, //How much farther than the radius of the outer circle should the labels be placed
wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
opacityArea: 0.35, //The opacity of the area of the blob
dotRadius: 4, //The size of the colored circles of each blog
opacityCircles: 0.1, //The opacity of the circles of each blob
strokeWidth: 2, //The width of the stroke around each blob
roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
color: d3.scale.category10() //Color function
