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
d3.csv("Mexico.csv").then(function(popData){
  //Get the array of features (states)
  //This array holds the geometry data and properties for each state
  var states = geoData.features;
  console.log("states from geoData.features:");
  console.log(states);
  /*Strategy taken by Scott Murray D3js book*/
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

  //Keep an array of the output color range
  var colorRange = ["rgb(250, 250, 250)", "rgb(255, 180, 180)", 
                    "rgb(255, 100, 100)", "rgb(255, 30, 30)", 
                    "rgb(200, 0, 0)", "rgb(128, 0, 0)", "rgb(64, 0, 0)"];
  //Make a quantized scale for assigning fill color to states
  var colorScale = d3.scaleThreshold()
                     .domain([0, 50, 100, 250, 500, 750, 1000])
                     .range(colorRange);
  //Create the projection
  /*Projection focus on mexico taken from https://bl.ocks.org/mbostock/9265674 */
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

  //Create a grouping for the legend elements
  var legendGroup = g.append("g");
  //Create dimensions for legend container
  var legendDim = {w: 175, h: 275};
  //Create the x,y position for upper left part of the legend container
  var legendPos = {x: width - margin.right - legendDim.w, 
                   y: height - margin.bottom - legendDim.h};
  //Add the containing legend rect
  legendGroup.append("rect")
             .attr("x", legendPos.x)
             .attr("y", legendPos.y)
             .attr("width", legendDim.w)
             .attr("height", legendDim.h)
             .attr("fill", "lightgrey");
  //Add the 7 color boxes and labels that denote the density
  var legendBoxes = legendGroup.append("g");
  legendBoxes.selectAll("rect")
             .data(colorRange)
             .enter()
             .append("rect")
             .attr("x", legendPos.x + 145)
             .attr("y", function(d, i){return legendPos.y + legendDim.h 
                                              - 30 - (i * 30);})
             .attr("width", 20)
             .attr("height", 20)
             .attr("fill", function(d){return d;});
  //Add legend header
  legendGroup.append("text")
             .attr("x", legendPos.x + 20)
             .attr("y", legendPos.y + 20)
             .text("Population Density")
             .attr("font-family", "sans-serif");
  legendGroup.append("text")
             .attr("x", legendPos.x + 37)
             .attr("y", legendPos.y + 40)
             .text("(Kilometers^2)")
             .attr("font-family", "sans-serif");
  //Create density label array
  var densityLabels = ["No Data", "0 - 50 people per KM^2", 
                       "50 - 100 people per KM^2", 
                       "100 - 250 people per KM^2", "250 - 500 people per KM^2", 
                       "500 - 750 people per KM^2", "750+ people per KM^2"];
  //Add Density labels
  var legendLabels = legendGroup.append("g");
  legendLabels.selectAll("text")
              .data(densityLabels)
              .enter()
              .append("text")
              .attr("x", legendPos.x + 10)
              .attr("y", function(d, i){return legendPos.y + legendDim.h
                                               -16 - (i * 30)})
              .text(function(d){return d;})
              .attr("font-family", "sans-serif")
              .attr("font-size", "10px");
});
});
