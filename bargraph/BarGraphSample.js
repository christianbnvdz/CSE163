/* ----------------------------------------------------------------------------
File: BarGraphSample.js
Contructs the Bar Graph using D3
80 characters perline, avoid tabs. Indet at 4 spaces. See google style guide on
JavaScript if needed.
-----------------------------------------------------------------------------*/ 

// Search "D3 Margin Convention" on Google to understand margins.
// Add comments here in your own words to explain the margins below
/* margin is a variable that holds an object of containing information for the 
   visualizations margins. They are specified clockwise, like css margins. The
   values specify, in pixels, the left, right, bottom, and top margins with respect
   to the parent container. 10px top, 40px right, 150px bottom, and 50px left
   margins. width referns to the actual width of the visualization with respect
   to the width of the container and the margins. Same goes with height. The
   width is 760 px and the height is 500px for the svg container. The margins
   are then subtracted appropriately and the result is the width of the
   visualizations actual width and height.*/
var margin = {top: 10, right: 40, bottom: 150, left: 50},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    

// Define SVG. "g" means group SVG elements together. 
/* SVG means scalable vector graphics. These are included with the svg tag.*/
// Add comments here in your own words to explain this segment of code
/* First, we select the body element and we are returned a selection object
   containing it. Then we append an svg element to the body element. 
   From there, we give the width attribute to the
   svg element of 760, assumed to be px. The height attribute is also set to 500px.
   Then, we append g to the svg element. After this, the g element is transformed
   to move in the x direction, right, by the amount specified by the left margin,
   50px. It is also translated in the y direction, down, by 10px as specified by
   margin top. Finally, the g element selection is assigned to the svg variable.*/
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* --------------------------------------------------------------------
SCALE and AXIS are two different methods of D3. See D3 API Refrence and 
look up SVG AXIS and SCALES. See D3 API Refrence to understand the 
difference between Ordinal vs Linear scale.
----------------------------------------------------------------------*/ 

// Define X and Y SCALE.
/* X scale = the scaling function for the x values
   Y scale = the scaling function for the y values*/
// Add comments in your own words to explain the code below
/* For xScale function, we are creating a band scale with a range of 0 to width,
   rounded. Padding is specified to be 0.1 surrounding the bands. For y scale
   function, a linear scale is created with a range from height to 0, this is so
   that the larger values are at the top and the smaller values are at the 
   bottom. The y values grow as they go towards the bottom of the html page.*/
var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);

var yScale = d3.scaleLinear().range([height, 0]);

// Define X and Y AXIS
// Define tick marks on the y-axis as shown on the output with an interval of 5 and $ sign
/* The xAxis is a generator for a bottom axis given the xScale. This axis will
   be meant to go at the bottom of the visualization and it will show values on
   xScale's domain. The yAxis is a generator for a left axis given the yScale.
   It is meant to go on the left side of the visualization. The values on the yScale
   will be on the yAxis. There are 5 ticks total and the tick format is set to
   have a $ at the front of the value.*/
var xAxis = d3.axisBottom(xScale);

var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat( function(d) { return "$" + d });

/* --------------------------------------------------------------------
To understand how to import data. See D3 API refrence on CSV. Understand
the difference between .csv, .tsv and .json files. To import a .tsv or
.json file use d3.tsv() or d3.json(), respectively.
----------------------------------------------------------------------*/ 

// data.csv contains the country name(key) and its GDP(value)
// d.key and d.value are very important commands
// You must provide comments here to demonstrate your understanding of these commands
/* After the csv is loaded in, the callback function is called*/

/* I had to change the code a bit since d3 v5 changes how loading in csv works.
   So now, you load in the csv, then you use the .then function on the 'promise'
   that .csv returns. Also, error handling is done automatically. */
d3.csv("GDP2020TrillionUSDollars.csv").then(function(data){
    /* for every data entry in the data array, set the value of the key to the
       country string. set the value of the value to the numerical representation
       of the gdp. +d.gdp will cast the string to a float.*/
    data.forEach(function(d) {
        d.key = d.country;
        d.value = +d.gdp;
    });

    // Return X and Y SCALES (domain). See Chapter 7:Scales (Scott M.) 
    /* Make the xScale domain be the keys, country name. Remember that the 
       xScale is a band scale and it want's discrete values as it's domain. 
       For the yScale, the domain ranges from 0 to the maximum gdp value in
       the data array.*/
    xScale.domain(data.map(function(d){ return d.key; }));
    yScale.domain([0,d3.max(data, function(d) {return d.value; })]);
    
    // Creating rectangular bars to represent the data. 
    // Add comments to explain the code below
    /* The svg variable, which contains the g element, is the element that
       will have rects selected from it. Since there are none, the selection
       returned will be empty. The data is then bound to the empty selection,
       which causes the enter property of the selection to be filled with
       enterNode's that have the data binded to them. The .enter() function
       then returns the selection of the enter property. Then, the append("rect")
       will make those enterNodes into rect elements. For all of those rect 
       elements, a transition will be applied, lasting 1000ms, delayed by 200ms
       after each element so that they don't all transition at once. The
       transition will gradually cause the rects/bars to reach the specified
       x attribute of the key (country name), y attribute of teh value (gdp),
       the width of the xScale bandwidth, and the height of the total height
       - yScale(d.value). */
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .transition().duration(1000)
        .delay(function(d,i) {return i * 200;})
        .attr("x", function(d) {
            return xScale(d.key);
        })
        .attr("y", function(d) {
            return yScale(d.value);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) {
			      return height- yScale(d.value);
        });
        // create increasing to decreasing shade of blue as shown on the output
    /*  I've created a linear scale to assign color to the bars. The domain
        is from the smallest data value to the largest data value. The output range
        then gives us 255 for the smallest value in our data array and 127 for
        the largest value in our dataset. The rect is then given the rgb color
        of whatever color results from the color scale.*/
    var colorScale = d3.scaleLinear()
                     .domain([d3.min(data, function(d){return d.value}),
                              d3.max(data, function(d){return d.value})])
                     .range([255, 127]);
		svg.selectAll("rect")
        .attr("fill", function(d){
            return "rgb(0, 0, " + colorScale(d.value) + ")";
        });
    
    // Label the data values(d.value)
    /* First I created text elements for all data values, I applied the same
       transitions as exist for the bars. The x value and y values are the same
       as with the bars except they are adjusted a bit so they are centered at
       the top of the bar. The fill is set to white, the text is anchored in the
       middle so they can be centered easily into the bars, and the text is the
       gdp value.*/
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .transition().duration(1000)
        .delay(function(d,i) {return i * 200;})
        .attr("x", function(d) {
          return xScale(d.key) + 20;
        })
        .attr("y", function(d) {
          return yScale(d.value) + 15;
        })
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .text(function(d) {
          return "" + d.value;
        });
    
    // Draw xAxis and position the label at -60 degrees as shown on the output 
    /* A new g element is appended inside the visualization g element. It is given
       the class x and axis. Then a transformation is applied that will move it
       to the bottom of the visualizations bars. Then the xAxis is generated
       from the xAxis generator. Then all the text in that g element is selected
       and they are all moved according to -0.8am and 0.25 em. Then the text is
       anchored at the end of the text. This allows us to rotate the text -60 degrees
       with the end being anchored in place. The font size is set to 10px.*/
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("dx", "-.8em")
        .attr("dy", ".25em")
        .style("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("transform", "rotate(-60)");
        
    
    // Draw yAxis and position the label
    /* Append a g element to the visualization. Give it the class of y and axis.
       I don't know why above we gave it a class of x if there isn't one in the css
       but ill put a class of y on this one as well. Generate the yAxis with .call*/
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    /* Append a text element to the visualization. Rotate it -90 degrees so it's
       text is going from top to bottom. The x and y are conceptually switched.
       So the x is no refering to the y visually, since we rotated it first.
       The text is anchored in the middle, so we move it down to half the height
       of the y axis. Then we move the text left by 35 so that we can get it out
       of the way of the yAxis. The text is then set.*/ 
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", -35)
        .style("text-anchor", "middle")
        .text("Trillions of US Dollars ($)")
        
});
