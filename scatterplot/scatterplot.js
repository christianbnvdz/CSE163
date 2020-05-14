/*    var scatterdataset = [ {
        "name": "United States",
        "country": "United States",
        "gdp": 14.9,
        "epc": 317,
        "total": 98.9
    }, {

        "name": "China",
        "country": "China",
        "gdp": 5.93,
        "epc": 76,
        "total": 103
    }, {
        "name": "Japan",
        "country": "Japan",
        "gdp": 5.49,
        "epc": 171, 
        "total": 21.7
    }, {
        "name": "Germany",
        "country": "Germany",
        "gdp": 3.28,
        "epc": 171,
        "total": 14.1
    }, {
        "name": "France",
        "country": "France",
        "gdp": 2.54,
        "epc": 170,
        "total": 10.7
    }, {
        "name": "United Kingdom",
        "country": "United Kingdom",
        "gdp": 2.28,
        "epc": 143,
        "total": 8.8
    }, {
        "name": "Brazil",
        "country": "Brazil",
        "gdp": 2.14,
        "epc": 58,
        "total": 11.3
    }, {
        "name": "Italy",
        "country": "Italy",
        "gdp": 2.04,
        "epc": 126,
        "total": 7.6
    }, {
        "name": "India",
        "country": "India",
        "gdp": 1.70,
        "epc": 19,
        "total": 22.9
    }, {
        "name": "Canada",
        "country": "Canada",
        "gdp": 1.57,
        "epc": 385,
        "total": 13.1
    }, {
        "name": "Russian Federation",
        "country": "Russian Federation",
        "gdp": 1.52,
        "epc": 206,
        "total": 29.5
    }, {

        "name": "Spain",
        "country": "Spain",
        "gdp": 1.37,
        "epc": 134,
        "total": 6.1
    }, {
        "name": "Australia",
        "country": "Australia",
        "gdp": 1.14,
        "epc": 270,
        "total": 6.0
    }, {
        "name": "Mexico",
        "country": "Mexico",
        "gdp": 1.04,
        "epc": 65,
        "total": 7.6
    }, {
        "name": "Korea",
        "country": "Korea",
        "gdp": 1.01,
        "epc": 222,
        "total": 10.7
    }]; */

    // set the max raduis size
    var MAX_RADIUS = 50;
    //Define Margin
    var margin = {top: 50, right: 80, bottom: 50, left: 80}, 
        width = 960 - margin.left -margin.right,
        height = 500 - margin.top - margin.bottom;

    //Define Color
    var colors = d3.scaleOrdinal()
                   .range(d3.schemeCategory10.concat(d3.schemeAccent));

    //Define SVG
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Define Scales   
    var xScale = d3.scaleLinear()
        //.domain([0,16]) //Need to redefine this later after loading the data
        .range([0, width]);

    var yScale = d3.scaleLinear()
        //.domain([0,450]) //Need to redfine this later after loading the data
        .range([height, 0]);
    
    //Define Tooltip here
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("id", "tooltip")
                    .attr("class", "hidden");
    // define string with spaces
    var toolFieldSpace = " \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0 ";
    tooltip.html("<p class=\"countryField\"></p>" +
                 "<div>" +
                   "<p class=\"toolField\"> Population :</p>" +
                   "<p class=\"populationField\"></p>" +
                 "</div>" +
                 "<div>" +
                   "<p class=\"toolField\">GDP" + toolFieldSpace + ":</p>" +
                   "<p class=\"gdpField\"></p>" +
                 "</div>" +
                 "<div>" +
                   "<p class=\"toolField\">EPC" + toolFieldSpace + ":</p>" +
                   "<p class=\"epcField\"></p>" +
                 "</div>" +
                 "<div>" +
                   "<p class=\"toolField\">Total" + toolFieldSpace + ":</p>" +
                   "<p class=\"totalField\"></p>" +
                 "</div>");

    //Define Axis
    var xAxis = d3.axisBottom(xScale).tickPadding(1);
    var yAxis = d3.axisLeft(yScale).tickPadding(2);
    
    //Get Data
    d3.csv("scatterdata.csv").then(function(data){
      //Convert the numerical data to numbers
      data.forEach(function(d){
        d.gdp = +d.gdp;
        d.population = +d.population;
        d.epc = +d.epc;
        d.ec = +d.ec;
      });

      //Define radius scale (D3 book, page 128)
      var rScale = d3.scaleSqrt()
                     .domain([0, d3.max(data, function(d){return d.ec;})])
                     .range([0, MAX_RADIUS]);
      // Define domain for xScale and yScale
      xScale.domain([0, d3.max(data, function(d){return d.gdp;}) + 1]);
      yScale.domain([0, d3.max(data, function(d){return d.epc;}) + 20]);
      // Define domain for color scale
      colors.domain(data.map(function(d){return d.country;}));

      //Draw Scatterplot
      svg.selectAll(".dot")
         .data(data)
         .enter().append("circle")
         .attr("class", "dot")
         .attr("r", function(d){return rScale(d.ec);})
         .attr("cx", function(d) {return xScale(d.gdp);})
         .attr("cy", function(d) {return yScale(d.epc);})
         .style("fill", function (d) { return colors(d.country); });
      //Add .on("mouseover", .....
      var circles = d3.selectAll("circle").on("mouseover", circleToolTip);
      d3.select("#tooltip").on("mouseover", circleToolTip);

      function circleToolTip(d, i) {
        var xPos = +d3.select(this).attr("cx");
        var yPos = +d3.select(this).attr("cy");
        tooltip.attr("class", "");
        d3.select("#tooltip")
          .style("left", xPos + "px")
          .style("top", yPos + "px");
        tooltip.transition()
               .duration(1000)
               .style("background-color", colors(d.country))
               .style("border-color", "black")
               .style("color", "black");
        d3.select(".countryField").text(d.country);
        d3.select(".populationField").text(toolFieldSpace + d.population+" Million");
        d3.select(".gdpField").text(toolFieldSpace + "$" + d.gdp + " Trillion");
        d3.select(".epcField").text(toolFieldSpace + d.epc + " Million BTU's");
        d3.select(".totalField").text(toolFieldSpace + d.ec + " Trillion BTU's");
      };
      //Add Tooltip.html with transition and style
      //Then Add .on("mouseout", ....
      circles.on("mouseout", function(d, i) {
        tooltip.transition()
               .duration(250)
               .style("background-color", "transparent")
               .style("border-color", "transparent")
               .style("color", "transparent");
        
      });
      //Scale Changes as we Zoom
      // Call the function d3.behavior.zoom to Add zoom

      //Draw Country Names
      svg.selectAll(".text")
         .data(data)
         .enter().append("text")
         .attr("class","text")
         .style("text-anchor", "start")
         .attr("x", function(d) {return xScale(d.gdp);})
         .attr("y", function(d) {return yScale(d.epc);})
         .style("fill", "black")
         .text(function (d) {return d.name; });

      //x-axis
      svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .call(xAxis)
         .append("text")
         .attr("class", "label")
         .attr("y", 50)
         .attr("x", width/2)
         .style("text-anchor", "middle")
         .attr("font-size", "12px")
         .text("GDP (in Trillion US Dollars) in 2010");
    
      //Y-axis
      svg.append("g")
         .attr("class", "y axis")
         .call(yAxis)
         .append("text")
         .attr("class", "label")
         .attr("transform", "rotate(-90)")
         .attr("y", -50)
         .attr("x", -50)
         .attr("dy", ".71em")
         .style("text-anchor", "end")
         .attr("font-size", "12px")
         .text("Energy Consumption per Capita (in Million BTUs per person)");
    });
