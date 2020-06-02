//set the width and height of the svg
var width = 700;
var height = 400;

//set the start and end year desired for the chart
var startYear = 2000;
var endYear = 2014;

//list the countries to be represented
var selectedCountries = ["Brazil", "Russia", "India", "China",
                         "South Africa", "United States"];

//set margins for the visualization
var margin = {top: 50, right: 120, bottom: 50, left: 50};

//set padding for the yScale so country text doesn't get cut off
var TEXTHEIGHT = 15;

//apply the width and height to a generated svg
var svg = d3
          .select("div")
          .append("svg")
          .attr("width", width)
          .attr("height", height);

//Load in the csv data
d3.csv("BRICSdata.csv").then(function(data) {
  //then do the following
  displayChart(data); 
  otherExecution(data);
});

function displayChart(data)
{
  //organize the data
  var organizedData = organizeData(data);

  //create the x scale, a time scale
  var xScale = d3
               .scaleTime()
               .domain([new Date("" + startYear + "-1-1"), 
                        new Date("" + endYear + "-1-1")])
               .rangeRound([0 + margin.left, width - margin.right]);
  //Get the maximum BTU over all years and countries
  var maxBTU = d3.max(organizedData, function(d) {
                    return d3.max(d.Values, function(dVal) {
                      return dVal.BTU;
                    });
                  });

  //create the y scale, a linear scale
  var yScale = d3
               .scaleLinear()
               .domain([0, maxBTU + TEXTHEIGHT])
               .range([height - margin.bottom, 0]);

  //create the axies
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);
  //generate the x axis
  svg.append("g")
     .attr("transform", "translate(0, " + (height - margin.bottom) + ")")
     .attr("class", "xAxis")
     .call(xAxis);
  //generate the y axis
  svg.append("g")
     .attr("transform", "translate(" + margin.left + ", 0)")
     .call(yAxis);
  //label x axis
  svg.append("text")
     .text("Year")
     .attr("transform", "translate(" + ((width - margin.right) / 2) + ", " 
                                                           + height + ")")
     .style("font-family", "sans-serif");
  //label y axis
  svg.append("text")
     .text("Million BTU's Per Person")
     .attr("transform", "rotate(-90)")
     .attr("x", 0 - ((height - margin.bottom) / 2))
     .attr("y", margin.left - 35)
     .style("text-anchor", "middle")
     .style("font-family", "sans-serif");

  //create x (vertical) gridlines
  svg.append("g")
     .attr("class", "grid")
     .attr("transform", "translate(0, " + (height - margin.bottom) + ")")
     .call(d3.axisBottom(xScale)
             .ticks(endYear - startYear) //As many ticks as there are years
             .tickSize(0 - height) //Ticks grow up to top
             .tickFormat("")); //Nothing
  //create y (horizontal) gridlines
  svg.append("g")
     .attr("class", "grid")
     .call(d3.axisLeft(yScale)
             .tickSize(0 - width + margin.left + margin.right)
             .tickFormat(""))
             .attr("transform", "translate(" + margin.left + ", 0)");

  //generate the lines for each country
  var lineGen = d3.line()
                  .curve(d3.curveBasis) //Curve interpolater, touches start and end
                  .x(function(d) {return xScale(new Date("" + d.Year + "-1-1"));})
                  .y(function(d) {return yScale(d.BTU);});

  //make a g tag for all countries
  var gCountries = svg.selectAll("nonexistant")
                      .data(organizedData)
                      .enter()
                      .append("g");

  //create an ordinal color scale
  var colorScale = d3.scaleOrdinal()
                     .domain(organizedData.map(function(d){d.Country}))
                     .range(d3.schemeCategory10);

  //add a path svg element in all gCountries
  var paths = gCountries.append("path")
              .attr("class", "line")
              .attr("d", function(d){return lineGen(d.Values);})
              .style("stroke", function(d){return colorScale(d.Country)});

  //animate line
  paths.attr("stroke-dasharray", "1000 1000") /*Taken from MarkMcKay animation*/
       .attr("stroke-dashoffset", "1000") /*The dashes left to render*/
       .transition()
       .duration(2000)
       .ease(d3.easeLinear)
       .attr("stroke-dashoffset", 0);

  //Add the name of the country to each path
  gCountries.append("text")
            .datum(function(d) {return {Country: d.Country, Values: d.Values};})
            .text(function(d) {return d.Country})
            .attr("transform", function(d) {return "translate(" + 
                               xScale(new Date("" + endYear + "-1-1")) +
                               ", " +
                               yScale((d.Values[d.Values.length - 1]).BTU) +
                               ")";})
            .style("font-family", "sans-serif")
            .style("stroke", function(d){return colorScale(d.Country)});

}

/*
 * Organize the data into an array containing
 * an object for every country. Each object will keep track of
 * the name of the country and an array of x,y values.
 * Ex: [{Country: "Bangladesh", 
         Values: [{Year: <some date>, BTU: 8}]}]
 */
function organizeData(data)
{
  var organizedData = [];
  
  for (var i = 0; i < data.length; ++i) {
    if (selectedCountries.includes(data[i]["Country Name"])) {
      var pairs = [];

      for (var currYear = startYear; currYear <= endYear; ++currYear) {
        pairs.push({Year: currYear, 
                     BTU: +data[i][currYear]});
      }

      organizedData.push({Country: data[i]["Country Name"],
                           Values: pairs});
    }
  }

  return organizedData;
}

/* Place other stuff here */
function otherExecution(data)
{
  //Get a list of countries
  var countryList = data.map(function (d) {
                      return d["Country Name"];});

  //generate divs where the checkboxes and labels will go
  var checkboxes = d3.select("#countrySelectInput")
                     .selectAll("nonexistent")
                     .data(countryList)
                     .enter()
                     .append("div")
                     .attr("class", "checkboxdiv");

  //generate checkboxes for country select
  checkboxes.each(function(d){
                   d3.select(this).append("input")
                                  .attr("type", "checkbox")
                                  .attr("name", function(d){return d;})
                                  .attr("value", function(d){return d;})
                                  .attr("id", function(d) {return "#" + d;})
                                  .attr("class", "checkbox");
                   d3.select(this).append("label")
                                  .attr("for", function(d){return d;})
                                  .text(function(d) {return d});
                 });

  //checkmark the boxes of the default countries
  for (var i = 0; i < selectedCountries.length; ++i) {
    document.getElementById("#" + selectedCountries[i]).checked = true;
  }

  //Add year select functionality
  var startYearBox = document.getElementById("startYearBox");
  var endYearBox = document.getElementById("endYearBox");
  var submitButton = document.getElementById("submit");

  //assign an event handler to all checkboxes
  var checkboxCollection = document.getElementsByClassName("checkbox");
  for (var i = 0; i < checkboxCollection.length; ++i) {
    checkboxCollection[i].onmouseup = function(e) {
      //add the specific id of the checkbox that triggered it to the array of
      //selected countries 
      if (selectedCountries.includes(this.value)) {
        var ind = selectedCountries.indexOf(this.value);
        selectedCountries.splice(ind, 1);
      } else {
        selectedCountries.push(this.value);
      }
    }
  }

  submitButton.onmouseup = function() { 
    // if the start year is out of range
    if (startYearBox.value < 1971 ||
          startYearBox.value > 2014) {
      startYearBox.value = 2000;
      startYear = 2000;
    } else {
      startYear = startYearBox.value;
    }

    //if the end year is out of range
    if (endYearBox.value > 2014 || 
          endYearBox.value < 1971) {
      endYearBox.value = 2014;
      endYear = 2014;
    } else {
      endYear = endYearBox.value;
    }
    
    //if inputs are valid
    if ((startYear < endYear) &&
        (!isNaN(startYear)) &&
        (!isNaN(endYear))) {
      //remove everything in the chart
      d3.select("div")
        .select("svg")
        .remove();
      //create the svg again
      svg = d3.select("div")
              .append("svg")  
              .attr("width", width)
              .attr("height", height);
      // display the chart
      displayChart(data);
    }
  };
}
