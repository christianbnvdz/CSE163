    // set the max radius size
    var MAX_RADIUS = 50;

    // radius padding
    var rad_pad = {top: 0, right: 0};

    //Define Margin
    var margin = {top: 50, right: 80, bottom: 50, left: 80}, 
        width = 960 - margin.left -margin.right,
        height = 500 - margin.top - margin.bottom;

    //Define SVG
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Define Scale ranges
    var xScale = d3.scaleLinear()
        .rangeRound([0, width]);

    var yScale = d3.scaleLinear()
        .rangeRound([height, 0]);
    
    var colors = d3.scaleOrdinal()
                   .range(d3.schemeCategory10.concat(d3.schemeAccent));
    
    //Define Tooltip here
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("id", "tooltip");

    //this string is the spacing we insert to make things neat in the tooltip
    var toolFieldSpace = " \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0 ";
    //fill the tooltip with the proper elements
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
    var xAxis = d3.axisBottom(xScale).tickPadding(2);
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
 
      //get max gdp
      var max_gdp = d3.max(data, function(d){return d.gdp;});
      // Define domains for each scale
      xScale.domain([0, d3.max(data, function(d){return d.gdp;}) + rad_pad.right]);
      yScale.domain([0, d3.max(data, function(d){return d.epc;}) + rad_pad.top]);
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
      //This will prevent the tooltip itself from preventing the transition
      d3.select("#tooltip").on("mouseover", circleToolTip);

      //tooltip transition on mouseover function
      function circleToolTip(d, i) {
        //set the tooltip to have those x, y coords
        d3.select("#tooltip")
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
        //transition from transparent to the proper colors
        tooltip.transition()
               .duration(500)
               .style("background-color", colors(d.country))
               .style("border-color", "black")
               .style("color", "black");
        //add in and format the data
        d3.select(".countryField").text(d.country);
        d3.select(".populationField").text(toolFieldSpace + d.population+" Million");
        d3.select(".gdpField").text(toolFieldSpace + "$" + d.gdp + " Trillion");
        d3.select(".epcField").text(toolFieldSpace + d.epc + " Million BTU's");
        d3.select(".totalField").text(toolFieldSpace + d.ec + " Trillion BTU's");
      };
      //Add Tooltip.html with transition and style
      //Then Add .on("mouseout", ....
      circles.on("mouseout", function(d, i) {
        //Transition to a transparent tooltip
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
         .text(function (d) {return d.country; });

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
