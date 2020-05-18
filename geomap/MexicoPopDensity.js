//Set margins
var margin = {top: 50, right: 50, bottom: 50, left: 50};
//Set visualization's width and height
var width = 700 - margin.left - margin.right;
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

  //Merge the data into one list
  for (var i = 0; i < popData.length; ++i) {
    var stateName = popData[i].state;
    var stateDensity = +popData[i].density;
    //Search for the state in the geodata state array
    for (var j = 0; j < states.length; ++j) {
      if (stateName == states[j].properties.NAME_1) {
        //Once found, make one of it's properties have the denity value
        states[j].properties.value = stateDensity;
      }
    }
  }
/*
  //Create a path generator
  var pathGenerator = d3.geoPath()
                        ;

  //Make a new grouping that holds all the state's paths
  var geoStateGroup = g.append("g");
  //Add path elements for all geostates
  geoStateGroup.selectAll("path")
               .data(states)
               .enter()
               .append("path")
               .attr("d", pathGenerator)
               .attr("fill", "steelblue")
               .attr("stroke", "white");
*/
});
});
