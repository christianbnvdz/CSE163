//Set margins
var margin = {top: 0, right: 0, bottom: 0, left: 0};
//Set visualization's width and height
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

//Add the containing svg element to the visSpace div
var svg = d3.select("#visSpace")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
//Add a g element to group the entire visualization's elements
//g will be used whenever attributes must be given to all elements in
//the visualization
var g = svg.append("g")
           .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

//Load in the json and csv file
d3.json("Mexico.json").then(function(geoData){
d3.csv("mexico.csv").then(function(popData){
  //Get the array of features (states)
  //This array holds the geometry data and properties for each state
  var states = geoData.features;

  //Merge the data into one list
  for (var i = 0; i < popData.length; ++i) {
    var stateName = popData[i].state;
    var stateDensity = +popData[i].density;
    //Search for the state in the geodata state array
    for (var j = 0; j < states.length; ++j) {
      if (stateName == states[j].properties.NAME_1) {
        //Once found, make one of it's properties have the denity value
        states[j].properties.value = stateDensity;
        break;
      }
    }
  }

  //Make a quantized scale for assigning fill color to states
  var colorScale = d3.scaleThreshold()
                     .domain([0, 50, 100, 250, 500, 750, 1000])
                     .range(["rgb(255, 255, 255)", "rgb(255, 180, 180)",
                             "rgb(255, 100, 100)", "rgb(255, 30, 30)",
                             "rgb(200, 0, 0)", "rgb(128, 0, 0)", 
                             "rgb(64, 0, 0)"]);
  //Create the projection
  var projection = d3.geoAlbers()
                     .rotate([102, 0])
                     .center([0, 24])
                     .parallels([17.5, 29.5])
                     .scale(1000)
                     .translate([width/2, height/2]);

  //Create a path generator
  var pathGenerator = d3.geoPath()
                        .projection(projection);

  //Make a group for all the states' paths
  var stateGroup = g.append("g")
                    .attr("stroke", "black");
  //Add path elements for all states
  stateGroup.selectAll("path")
            .data(states)
            .enter()
            .append("path")
            .attr("d", pathGenerator)
            .attr("fill", function(d){return colorScale(d.properties.value);});

});
});
