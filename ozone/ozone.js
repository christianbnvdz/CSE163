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
var margin = {top: 20, right: 20, bottom: 20, left: 100};
  width = 1000 - margin.left - margin.right,
  height = 475 - margin.top - margin.bottom;

//Give svg height and width, note that svg actually
//Refers to a g element
var svg = d3.select("body")
   .append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Taken from: http://shancarter.github.io/ucb-dataviz-fall-2013/classes/interactive-maps/
var projection = d3.geoAlbers()
   .translate([width/1.75, height / 3])
   .parallels([60, 50])
   .rotate([120, 0])
   .scale(2500);

//Taken from: http://shancarter.github.io/ucb-dataviz-fall-2013/classes/interactive-maps/
var projection2 = d3.geoAlbers()
   .translate([width/4, height/3])
   .parallels([60, 50])
   .rotate([120, 0])
   .scale(2500);

// resource: Overstack: Question on Colorbrewer
var color2 = d3.scaleThreshold()
   .domain([1, 49.4, 99.4, 100])
   //Colors taken from Colorbrewer: https://colorbrewer2.org/#type=sequential&scheme=PuRd&n=5
   .range(["#FFFFFF", "#fee0d2", "#fc9272", "#de2d26"]);

var asthma_colors = d3.scaleThreshold()
   .domain([0, 2.994, 4.994, 6.994, 8.994, 10])
   //Colors taken from Colorbrewer: https://colorbrewer2.org/#type=sequential&scheme=PuRd&n=5
   .range(["#FFFFFF", "#f1eef6", "#d7b5d8", "#df65b0", "#dd1c77", "#980043"]);

var path = d3.geoPath().projection(projection);
var path2 = d3.geoPath().projection(projection2);

//Draws the asthma map
function health(adult) {
  d3.json("county_health_data.json").then(function(co) {
     
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

    d3.json("ca-counties.json").then(function(ca) {
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
               .html("%Adults with Asthma " + getCountyAdult(d.properties.name).toFixed(2));
           } else if (adult == "child") {
             d3.select("#tooltip")
               .html("%Pedriatic Asthma Cases " + getCountyPed(d.properties.name).toFixed(2));
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
  var id = "California_2011_Ozone.json";
  var start = "California_";
    
  var end = "_Ozone.json";
    
  var file = start.concat(year);
  file = file.concat(end);
  id = file; 

  d3.csv("aqi.csv").then(function(co){
     
    console.log(co);  
    function getCountyOzone(county, year){
        for (var i = 0; i < co.length; ++i) {
          if (co[i].County == county) {
            return co[i][year];
          }
        }
    }

    //Taken from http://bl.ocks.org/mbostock/5562380
    d3.json("ca-counties.json").then(function(ca) {
    
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
             .html(d.properties.name + "<br><br>AQI: " + AQI )
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

//Draws the legends and loads COPD and 2011 AQI map by default.
//Also adds in event handlers for buttons.
function init(){
  //AQI legend circles
  svg.append("rect")
     .attr("x", width-120)
     .attr("y", height-210)
     .attr("width", 160)
     .attr("height", 180)
     .attr("fill", "#D8BFD8")
     .style("stroke-size", "1px");

  svg.append("circle")
     .attr("r", 10)
     .attr("cx", width-100)
     .attr("cy", height-180)
     .style("fill", "#de2d26");
    
  svg.append("circle")
     .attr("r", 10)
     .attr("cx", width-100)
     .attr("cy", height-150)
     .style("fill", "#fc9272");
    
  svg.append("circle")
     .attr("r", 10)
     .attr("cx", width-100)
     .attr("cy", height-120)
     .style("fill", "#fee0d2");

  svg.append("circle")
     .attr("r", 10)
     .attr("cx", width-100)
     .attr("cy", height-90)
     .style("fill", "white");

  //AQI legend text
  svg.append("text")
     .attr("class", "label")
     .attr("x", width -85)
     .attr("y", height-180)
     .style("text-anchor", "start")
     .text("Hazardous (100+)");

  svg.append("text")
     .attr("class", "label")
     .attr("x", width -85)
     .attr("y", height-150)
     .style("text-anchor", "start")
     .text("Moderate (50-99)");
    
  svg.append("text")
     .attr("class", "label")
     .attr("x", width -85)
     .attr("y", height-120)
     .style("text-anchor", "start")
     .text("Healthy (1-49)");

  svg.append("text")
     .attr("class", "label")
     .attr("x", width -85)
     .attr("y", height-90)
     .style("text-anchor", "start")
     .text("Data not available");
        
  //AQI legend label
  svg.append("text")
     .attr("class", "label")
     .attr("x", width -52)
     .attr("y", height-40)
     .style("text-anchor", "middle")
     .style("fill", "purple") 
     .attr("font-size", "12px")
     .text("Ozone Air Quality Index");   
 
  //Asthma Legend circles   
  svg.append("rect")
     .attr("x", width-160)
     .attr("y", height-450)
     .attr("width", 180)
     .attr("height", 200)
     .attr("fill", "#D8BFD8")
     .style("stroke-size", "1px");

  svg.append("circle")
     .attr("r", 10)
     .attr("cx", width-130)
     .attr("cy", height-435)
     .style("fill", "#980043");
    
  svg.append("circle")
     .attr("r", 9)
     .attr("cx", width-130)
     .attr("cy", height-400)
     .style("fill", "#dd1c77");
    
  svg.append("circle")
     .attr("r", 9)
     .attr("cx", width-130)
     .attr("cy", height-365)
     .style("fill", "#df65b0");

  svg.append("circle")
     .attr("r", 9)
     .attr("cx", width-130)
     .attr("cy", height-335)
     .style("fill", "#d7b5d8");
    
  svg.append("circle")
     .attr("r", 9)
     .attr("cx", width-130)
     .attr("cy", height-300)
     .style("fill", "#f1eef6");

  //Asthma legend text
  svg.append("text")
     .attr("class", "label")
     .attr("x", width -115)
     .attr("y", height-435)
     .style("text-anchor", "start")
     .text(" > 9.00");

  svg.append("text")
     .attr("class", "label")
     .attr("x", width -115)
     .attr("y", height-400)
     .style("text-anchor", "start")
     .text("7.00 - 8.99");
    
  svg.append("text")
     .attr("class", "label")
     .attr("x", width -115)
     .attr("y", height-365)
     .style("text-anchor", "start")
     .text("5.00 - 6.99");

  svg.append("text")
     .attr("class", "label")
     .attr("x", width -115)
     .attr("y", height-335)
     .style("text-anchor", "start")
     .text("3.00 - 4.99");
    
  svg.append("text")
     .attr("class", "label")
     .attr("x", width -115)
     .attr("y", height-300)
     .style("text-anchor", "start")
     .text("1.00 - 2.99");
        
  //Asthma legend label
  svg.append("text")
     .attr("class", "label")
     .attr("x", width -75)
     .attr("y", height-265)
     .style("text-anchor", "middle")
     .style("fill", "purple") 
     .attr("font-size", "10px")
     .text("Reported Cases per 100 People");
 
  //Generate default map to COPD and 2011 AQI
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
