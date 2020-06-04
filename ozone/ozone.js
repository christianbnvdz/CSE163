/*
 * Enhancement Project: Asthma and Ozone in the Air
 * Original Visualzation link: 
 *   https://sureshlodha.github.io/CMPS165_Winter15_FinalProjects/OzoneInTheAir/
 * Orignal Creators: Joanne Chan and Sabina Tomkins, CMPS 165 Winter 2015
 *
 * Christian Benavidez
 * CSE 163 Spring 2020
 * Enhancement Visualzition Link: https://christianbnvdz.github.io/CSE163/ozone/
 *
 * Some of the original comments have been left in.
 */

//Taken from previous assignments
var margin = {top: 20, right: 20, bottom: 20, left: 0};
  width = 1000 - margin.left - margin.right,
  height = 475 - margin.top - margin.bottom;

//Give svg height and width, note that svg actually
//Refers to a g element
var svg = d3.select("#visSpace")
   .append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Taken from: http://shancarter.github.io/ucb-dataviz-fall-2013/classes/interactive-maps/
var projection = d3.geoAlbers()
   .translate([7 * width/10, height / 3])
   .parallels([60, 50])
   .rotate([120, 0])
   .scale(2500);

//Taken from: http://shancarter.github.io/ucb-dataviz-fall-2013/classes/interactive-maps/
var projection2 = d3.geoAlbers()
   .translate([2.65 * width/10, height/3])
   .parallels([60, 50])
   .rotate([120, 0])
   .scale(2500);

// resource: Overstack: Question on Colorbrewer
var color2 = d3.scaleThreshold()
   .domain([1, 50.4, 100.4, 100])
   //Colors taken from Colorbrewer: https://colorbrewer2.org/#type=sequential&scheme=PuRd&n=5
   .range(["#FFFFFF", "#fee0d2", "#fc9272", "#de2d26"]);

var asthma_colors = d3.scaleThreshold()
   .domain([0, 2.994, 4.994, 6.994, 8.994, 10])
   //Colors taken from Colorbrewer: https://colorbrewer2.org/#type=sequential&scheme=PuRd&n=5
   .range(["#FFFFFF", "#f1eef6", "#d7b5d8", "#df65b0", "#dd1c77", "#980043"]);

var path = d3.geoPath().projection(projection);
var path2 = d3.geoPath().projection(projection2);

//Load in county geojson
var countyGeometry = d3.json("ca-counties.json");
//Load in aqi csv
var aqiData = d3.csv("aqi.csv");
//Load in health data
var healthData = d3.json("county_health_data.json");


//Draws the asthma map
function health(adult) {
  healthData.then(function(co) {
     
    console.log(co);  
    function getCountyAdult(d) {
      return (co[d]['RelativeAdult']*100);    
    } 
    function getCountyPed(d) {
      return (co[d]['RelativePed']*100);    
    }    
    function getCountyLC(d) {
      return ((co[d]['LungCancer']/co[d]["Population"])*100);    
    }     

    countyGeometry.then(function(ca) {
      var counties = topojson.feature(ca, ca.objects.counties);

      //Remove all asthma state elements to not clutter the svg
      svg.selectAll(".asthma-states").remove();
      //Taken from: http://shancarter.github.io/ucb-dataviz-fall-2013/classes/interactive-maps/
      svg.selectAll(".county")
         .data(counties.features)
         .enter()
         .append("path")
         .attr("class", "county-border")
         .classed("asthma-states", true)
         .attr("d", path2)
         //http://jsfiddle.net/sam0kqvx/24/ and  http://chimera.labs.oreilly.com/books/1230000000345/ch10.html#_html_div_tooltips
         .on("mouseover", function(d){
           var current_position = d3.mouse(this);
           //Update the tooltip position and value
           d3.select("#tooltip")
             .style("left", current_position[0] + "px")
             .style("top", current_position[1] + "px");

           if (adult == "Adult"){
             d3.select("#tooltip")
               .html(d.properties.name + "<br><br>%Adults with Asthma " + getCountyAdult(d.properties.name).toFixed(2));
           } else if (adult == "child") {
             d3.select("#tooltip")
               .html(d.properties.name + "<br><br>%Pedriatic Asthma Cases " + getCountyPed(d.properties.name).toFixed(2));
           } else {
             d3.select("#tooltip")
               .html(d.properties.name + "<br><br>% Cases of COPD " + getCountyLC(d.properties.name).toFixed(2));
           }
           //Show the tooltip
           d3.select("#tooltip").classed("hidden", false);
         })
         .on("mouseout", function() {
           //Hide the tooltip
           d3.select("#tooltip").classed("hidden", true);
         })
         .style("fill", "black")
         .transition()
         .duration(300)
         .style("fill", function(d){
           if (adult == "Adult") {
             return asthma_colors(getCountyAdult(d.properties.name));
           } else if (adult == "child") {
             return asthma_colors(getCountyPed(d.properties.name));
           } else {
             return asthma_colors(getCountyLC(d.properties.name));
           }
         });
    });  
  });
}
   

//Draws the AQI map
function map(year){
  aqiData.then(function(co){
    console.log("AQI data:");
    console.log(co);  
    function getCountyOzone(county, year){
      for (var i = 0; i < co.length; ++i) {
        if (co[i].County == county) {
          return co[i][year];
        }
      }
    }

    //Taken from http://bl.ocks.org/mbostock/5562380
    countyGeometry.then(function(ca) {
    
      var counties = topojson.feature(ca, ca.objects.counties);

      //Remove all AQI states so as to not clutter the svg
      svg.selectAll(".aqi-states").remove();
      //Taken from: http://shancarter.github.io/ucb-dataviz-fall-2013/classes/interactive-maps/
      svg.selectAll(".county")
         .data(counties.features)
         .enter().append("path")
         .attr("class", "county-border")
         .classed("aqi-states", true)
         .attr("d", path)
         //http://jsfiddle.net/sam0kqvx/24/ and  http://chimera.labs.oreilly.com/books/1230000000345/ch10.html#_html_div_tooltips
         .on("mouseover", function(d) {
           current_position = d3.mouse(this)
           //Get AQI string
           var AQI = Math.round(getCountyOzone(d.properties.name, year));
           if (AQI == 0) {
             AQI = "unavailable";
           }
           //Update the tooltip position and value
           d3.select("#tooltip")
             .style("left", current_position[0] + "px")
             .style("top", current_position[1] +"px")
             .html(d.properties.name + "<br><br>Median AQI: " + AQI )
             .select("#value");
           //Show the tooltip
           d3.select("#tooltip").classed("hidden", false);
         })
         .on("mouseout", function() {
           //Hide the tooltip
           d3.select("#tooltip").classed("hidden", true);
         })
         .style("fill", "black")
         .transition()
         .duration(300)
         .style("fill", function(d) {
           return color2(getCountyOzone(d.properties.name, year)); 
         })
    });
  });
}

//Draws the legends and loads COPD and 2019 AQI map by default.
//Also adds in event handlers for buttons and slider.
function init(){
  //Legend for Asthma
  var gAsthma = svg.append("g");
  var asthPoint = {x: width / 3 - 30, y: 25};
  var asthDim = {w: 200, h: 100};
  //Make grouping rect
  gAsthma.append("rect")
     .attr("x", asthPoint.x)
     .attr("y", asthPoint.y)
     .attr("width", asthDim.w)
     .attr("height", asthDim.h)
     .style("fill", "none");
  //Make asthma legend label
  gAsthma.append("text")
     .text("Reported Cases per 100 People")
     .attr("x", asthPoint.x + 100)
     .attr("y", asthPoint.y - 7)
     .attr("text-anchor", "middle")
     .style("font-size", "14px")
     .style("fill", "purple");
  //Make color container rect
  gAsthma.append("rect")
     .attr("x", asthPoint.x)
     .attr("y", asthPoint.y)
     .attr("width", asthDim.w / 5 + 6)
     .attr("height", asthDim.h + 6)
     .style("fill", "black");
  //Make rect for each one in the athma color range blotches
  ["#980043", "#dd1c77", "#df65b0", "#d7b5d8", "#f1eef6"].forEach(
    function(color, i){
      gAsthma.append("rect")
         .attr("x", asthPoint.x + 3)
         .attr("y", asthPoint.y + 3 + (i * (asthDim.h/5)))
         .attr("width", asthDim.w / 5)
         .attr("height", asthDim.h / 5)
         .style("fill", color);
    });
  //Make a label for each of the asthma colors
  ["> 9", "7 - 8.99", "5 - 6.99", "3 - 4.99", "1 - 2.99"].forEach(
    function(label, i){
      gAsthma.append("text")
        .text(label)
        .attr("text-anchor", "start")
        .attr("x", asthPoint.x + 60)
        .attr("y", asthPoint.y + 15 + (i * (asthDim.h/5 + 1)))
        .style("fill", "black")
        .style("font-size", "12px");
    });

  //Legend for AQI

  //Generate default map to COPD and 2019 AQI
  map("2019");
  health("lungs");

  //Event handler for slider
  d3.select("#aqi-slider")
    .on("mousedown", function() {
      d3.select(this)
        .on("mousemove", function() {
          d3.select("#aqi-selected-year")
            .html("Year: " + this.value);
        });
    })
    .on("mouseup", function() {
      map("" + this.value);
    });
 
    //for State of the Air from American Lung Association
    d3.select("#b16")
        .on("click", function(d,i) {
        console.log("b16");
        health("Adult");
        });
     d3.select("#b17")
        .on("click", function(d,i) {
        console.log("b17");
        health("child");
        });
     d3.select("#b18")
        .on("click", function(d,i) {
        console.log("b18");
        health("lung");
        });
}
