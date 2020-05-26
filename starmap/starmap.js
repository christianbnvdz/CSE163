/* Code taken directly from Mike Bostock at
 * https://observablehq.com/@mbostock/star-map
 * Adapted to run outside of observablehq.com and simplified
 *
 * Christian Benavidez
 * Visualization at: https://christianbnvdz.github.io/CSE163/starmap/starmap.html
 */

//Specify width and height for svg
//Square svg looks better for this visualization in my opinion
var width = 600;
var height = width;

var svg;

//Append svg to the specified div id
function generateAtID(string){
  svg = d3.select(string)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("font-family", "sans-serif") //attr and style cascades
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .style("margin", "auto") //center svg
            .style("color", "white") 
            .style("background", "radial-gradient(#081f2b 0%, #061616 100%)")
            .style("display", "block");
}

/*Generate it initally for visSpace*/
generateAtID("#visSpace");

var scale = (width - 120) * 0.5;

/*
 * d3.geoProjection takes in a raw projection: geoStereographicRaw, which
 * is basically like taking a rectangular map and joining its edges together
 * so that the countries are on the inside of the sphere. For our star map,
 * this is like creating a dome to project our stars on to.
 * geoStereographicRaw takes in longitude, latitude pairs in radians.
 * The custom projection will flip everything accross the x axis.
 * This is done so that the 0 hour can be at the top of the visualization.
 * The scaling factor above was used so that we could see the hour axis, it's
 * placed on the equator. Clip extent will tell the projection how much of the
 * original map to fold up, discarding the rest. Rotate will rotate the projection
 * such that we view the northern hempisphere. It should be 90, but since we
 * wanted 0H to appear at the top, we inverted the y so we are technically looking
 * at the southern hemisphere. Translate will center the visualization.
 */
var projection = d3.geoProjection((x, y) => d3.geoStereographicRaw(x, -y))
    .scale(scale)
    .clipExtent([[0, 0], [width, height]])
    .rotate([0, -90])
    .translate([width / 2, height / 2])
    ;//.precision(0.1);

//geographic path generator
var path = d3.geoPath(projection);

// Geocircle generator. The radius is specified in degrees and the
 // center is also specified in longitude latitude degrees. In this 
 // case, the center is at longitude 0, latitude 90. This is the
 // top of the northern hemisphere. The radius is 90 degrees, which
 // is enough to go all the way to the equator. No arguments are
 // passed, outline is simply the generated circle specified
 // as the equator.
 //
var outline = d3.geoCircle().radius(90).center([0, 90])();

/*
 * Graticule generator. Graticules are the meridian and parallels that
 * appear on a globe. .stepMinor is used to tell the graticule generator
 * after how many degrees should a meridian and parallel appear. In this
 * case, a meridian graticule should appear after 15 degrees. Out of 360,
 * this will result in 24 meridian graticules. A parallel graticule will 
 * show up every 10 degrees, 18 in total, we only see 9 within a hemisphere.
 * Think about an orange. A meridian is like an orange wedge. A parallel is
 * like a whole circular slice of an orange.
 */
var graticule = d3.geoGraticule().stepMinor([15, 10])();

//The xAxis generator is defined here.
var xAxis = g => g
  .call(g => g.append("g")
      .attr("stroke", "currentColor")
    .selectAll("line")
    .data(d3.range(0, 1440, 5)) // every 5 minutes, tick is generated
    .join("line")
      .datum(d => [
        projection([d / 4, 0]),
        projection([d / 4, d % 60 ? -1 : -2])
      ])
      .attr("x1", ([[x1]]) => x1)
      .attr("x2", ([, [x2]]) => x2)
      .attr("y1", ([[, y1]]) => y1)
      .attr("y2", ([, [, y2]]) => y2))
  .call(g => g.append("g")
    .selectAll("text")
    .data(d3.range(0, 1440, 60)) // every hour
    .join("text")
      .attr("dy", "0.35em")
      .text(d => `${d / 60}h`) // hour text is here
      .attr("font-size", d => d % 360 ? null : 14)
      .attr("font-weight", d => d % 360 ? null : "bold")
      .datum(d => projection([d / 4, -4]))
      .attr("x", ([x]) => x)
      .attr("y", ([, y]) => y));

// The y axis generator is defined here
var yAxis = g => g
  .call(g => g.append("g")
    .selectAll("text")
    .data(d3.range(10, 91, 10)) // every 10°
    .join("text")
      .attr("dy", "0.35em")
      .text(d => `${d}\xB0`) //y axis degree text here
      .datum(d => projection([0, d]))
      .attr("x", ([x]) => x)
      .attr("y", ([, y]) => y));

//specifies the center x,y coordinates of the visualization
//It is not tied to the projection
var cx = width / 2;
var cy = height / 2;

//This will highlight the declination, the parallel ring,
//when hovering over a star
var focusDeclination = svg.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("fill", "none")
      .attr("stroke", "yellow");

//This will highlight the ascenscion, the meridian line,
//when hovering over a star
var focusRightAscension = svg.append("line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", cx)
      .attr("y2", cy)
      .attr("stroke", "yellow");

 //linear scale for the radius, hardcoded values. I am
  //not sure why they're that length.
  var radius = d3.scaleLinear([6, -1], [0, 8]);


//Generate the path element for the graticule using the graticule
//generator. Note that this is a singular path. This is important
//When discussing the outline for the xscale.
function generateGraticule(){
  svg.append("path")
     .attr("d", path(graticule))
     .attr("fill", "none")
     .attr("stroke", "currentColor")
     .attr("stroke-opacity", 0.2);
}

/*Selecting the alternate projection*/
function changeProjection(){
    projection = d3.geoProjection((x, y) => d3.geoStereographicRaw(x, y))
    .clipExtent([[0, 0], [width, height]])
    .translate([width / 2, height / 2])
    ;
  path = d3.geoPath(projection);
}

/*Alternate projection but scaled in*/
function changeProjectionScaled(){
    projection = d3.geoProjection((x, y) => d3.geoStereographicRaw(x, y))
    .scale(scale)
    .clipExtent([[0, 0], [width, height]])
    .translate([width / 2, height / 2])
    ;
  path = d3.geoPath(projection);
}

/*Change to correct projection*/
function changeProjectionBack(){
    projection = d3.geoProjection((x, y) => d3.geoStereographicRaw(x, -y))
    .scale(scale)
    .clipExtent([[0, 0], [width, height]])
    .rotate([0, -90])
    .translate([width / 2, height / 2])
    ;//.precision(0.1);
  path = d3.geoPath(projection);
}

//The outline, the equator is generated.
function generateEquator(){
  svg.append("path")
      .attr("d", path(outline))
      .attr("fill", "none")
      .attr("stroke", "currentColor");
}

function generateXAxis(){
  //Generate x axis
  svg.append("g")
     .call(xAxis);
}

function generateYAxis(){
  //Generate y axis
  svg.append("g")  
     .call(yAxis);
}

/*Function to generate stars in svg*/
function generateStars(data){
  //generate the stars as circles. The larger the magnitude,
  //the larger the radius.
  svg.append("g")
     .attr("stroke", "black")
     .selectAll("circle")
     .data(data)
     .join("circle")
     .attr("r", d => radius(d.magnitude))
     .attr("transform", d => `translate(${projection(d)})`);
   //Voronoi for hovering over the stars. You will be considered as
  //hovering over the nearest star.
  var voronoi = d3.Delaunay.from(data.map(projection)).voronoi([0, 0, width, height]);

  //Generator for the simple browser tooltip for each star.
  function formatTitle({ID, constellation, greek_letter}) {  
    return `HR${ID}${constellation === null ? `` : greek_letter === null ? `
${nominative[constellation]}` : `
${greek_letter.replace(/[a-z]+/g, w => letters[w])
      .replace(/\d/g, c => superscript[c])} ${genitive[constellation]}`}`;
}

  //apply the mouse over and mouse out events to the voronoi cells
  //that tell which star is the closest.
  svg.append("g")
     .attr("pointer-events", "all")
     .attr("fill", "none")
     .selectAll("path")
     .data(data)
     .join("path")
     .on("mouseover", mouseovered)
     .on("mouseout", mouseouted)
     .attr("d", (d, i) => voronoi.renderCell(i))
     .append("title")
     .text(formatTitle);

  //Will display a highlighted line and a circle going through
  //the nearest star.
  function mouseovered(d) {
    const [px, py] = projection(d);
    const dx = px - cx;
    const dy = py - cy;
    const a = Math.atan2(dy, dx);
    focusDeclination.attr("r", Math.hypot(dx, dy));
    focusRightAscension.attr("x2", cx + 1e3 * Math.cos(a)).attr("y2", cy + 1e3 * Math.sin(a));
  }

  //Will hide the highlighted line and circle.
  function mouseouted(d) {
    focusDeclination.attr("r", null);
    focusRightAscension.attr("x2", cx).attr("y2", cy);
  }
}

d3.csv("stars.csv").then(function(data){
  //This will properly convert the properties into the
  //right type and then assign latitude and longitude
  //properties to each star.
  //We need them in Radian hours and declination degrees.
  data.forEach(function(d){
    d3.autoType(d);
    d[0] = (d.RA_hour + d.RA_min / 60 + d.RA_sec / 3600) * 15; // longitude
    d[1] = d.dec_deg + d.dec_min / 60 + d.dec_sec / 3600; // latitude
  });
  //sort ascending by magnitude
  data = data.sort((a, b) => d3.ascending(a.magnitude, b.magnitude));
  //Generate the finished product
  //It shows up last in webpage but we put it
  //first here so that it can have the
  //highlighter.
  generateGraticule();
  generateEquator();
  generateXAxis();
  generateYAxis();
  generateStars(data);
  
  /*Adding in only the graticule*/
  generateAtID("#visSpace1");
  generateGraticule();
  /*generate a different graticule projection*/
  generateAtID("#visSpace1a");
  changeProjection();
  generateGraticule();
  /*change projection back*/
  changeProjectionBack();
  
  /*Graticule plus axies*/
  generateAtID("#visSpace2");
  generateGraticule();
  generateXAxis();
  generateYAxis();
  /*Alternate projection*/
  generateAtID("#visSpace2a");
  changeProjection();
  generateGraticule();
  generateXAxis();
  generateYAxis();
  changeProjectionBack();
  
  /*Axis generated + equator connector*/
  generateAtID("#visSpace3");
  generateGraticule();
  generateEquator();
  generateXAxis();
  generateYAxis();
  /*Alternate*/
  /*generate alternate*/
  generateAtID("#visSpace3a");
  changeProjection();
  generateGraticule();
  generateEquator();
  generateXAxis();
  generateYAxis();
  changeProjectionBack();
  
  /*stars entered but no highlighter*/
  generateAtID("#visSpace4");
  generateGraticule();
  generateEquator();
  generateXAxis();
  generateYAxis();
  generateStars(data);
  /*generate alternate*/
  generateAtID("#visSpace4a");
  changeProjectionScaled();
  generateGraticule();
  generateEquator();
  generateXAxis();
  generateYAxis();
  generateStars(data);
  changeProjectionBack();
});



/*-------------------------------------------------------------------
 *
 * Proper names and symbols for stars. For making the simple tooltip.
 *
 *------------------------------------------------------------------*/

var letters = ({alf: "\u03B1", bet: "\u03B2", gam: "\u03B3", del: "\u03B4", 
                eps: "\u03B5", zet: "\u03B6", eta: "\u03B7", tet: "\u03B8", 
                iot: "\u03B9", kap: "\u03BA", lam: "\u03BB", mu: "\u03BC",
                nu: "\u03BD", xi: "\u03BE", omi: "\u03BF", pi: "\u03C0", 
                ro: "\u03C1", sig: "\u03C3", tau: "\u03C4", ups: "\u03C5", 
                phi: "\u03C6", chi: "\u03C7", psi: "\u03C8", omg: "\u03C9"});

var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹";

var nominative = ({And: "Andromeda", Ant: "Antlia", Aps: "Apus", Aqr: "Aquarius", 
                   Aql: "Aquila", Ara: "Ara", Ari: "Aries", Aur: "Auriga", 
                   Boo: "Bo\u{f6}tes", Cae: "Caelum", Cam: "Camelopardalis", 
                   Cnc: "Cancer", CVn: "Canes Venatici", CMa: "Canis Major", 
                   CMi: "Canis Minor", Cap: "Capricornus", Car: "Carina", 
                   Cas: "Cassiopeia", Cen: "Centaurus", Cep: "Cepheus", Cet: "Cetus",
                   Cha: "Chamaeleon", Cir: "Circinus", Col: "Columba", 
                   Com: "Coma Berenices", CrA: "Corona Austrina", 
                   CrB: "Corona Borealis", Crv: "Corvus", Crt: "Crater", Cru: "Crux",
                   Cyg: "Cygnus", Del: "Delphinus", Dor: "Dorado", Dra: "Draco", 
                   Equ: "Equuleus", Eri: "Eridanus", For: "Fornax", Gem: "Gemini", 
                   Gru: "Grus", Her: "Hercules", Hor: "Horologium", Hya: "Hydra", 
                   Hyi: "Hydrus", Ind: "Indus", Lac: "Lacerta", Leo: "Leo", 
                   LMi: "Leo Minor", Lep: "Lepus", Lib: "Libra", Lup: "Lupus", 
                   Lyn: "Lynx", Lyr: "Lyra", Men: "Mensa", Mic: "Microscopium", 
                   Mon: "Monoceros", Mus: "Musca", Nor: "Norma", Oct: "Octans", 
                   Oph: "Ophiuchus", Ori: "Orion", Pav: "Pavo", Peg: "Pegasus", 
                   Per: "Perseus", Phe: "Phoenix", Pic: "Pictor", Psc: "Pisces", 
                   PsA: "Piscis Austrinus", Pup: "Puppis", Pyx: "Pyxis", 
                   Ret: "Reticulum", Sge: "Sagitta", Sgr: "Sagittarius", 
                   Sco: "Scorpius", Scl: "Sculptor", Sct: "Scutum", Ser: "Serpens", 
                   Sex: "Sextans", Tau: "Taurus", Tel: "Telescopium", 
                   Tri: "Triangulum", TrA: "Triangulum Australe", Tuc: "Tucana",
                   UMa: "Ursa Major", UMi: "Ursa Minor", Vel: "Vela", Vir: "Virgo", 
                   Vol: "Volans", Vul: "Vulpecula"});

var genitive = ({And: "Andromedae", Ant: "Antliae", Aps: "Apodis", Aqr: "Aquarii", 
                 Aql: "Aquilae", Ara: "Arae", Ari: "Arietis", Aur: "Aurigae", 
                 Boo: "Bo\u{f6}tis", Cae: "Caeli", Cam: "Camelopardalis", 
                 Cnc: "Cancri", CVn: "Canum Venaticorum", CMa: "Canis Majoris", 
                 CMi: "Canis Minoris", Cap: "Capricorni", Car: "Carinae", 
                 Cas: "Cassiopeiae", Cen: "Centauri", Cep: "Cephei", Cet: "Ceti", 
                 Cha: "Chamaeleontis", Cir: "Circini", Col: "Columbae", 
                 Com: "Comae Berenices", CrA: "Coronae Australis", 
                 CrB: "Coronae Borealis", Crv: "Corvi", Crt: "Crateris", 
                 Cru: "Crucis", Cyg: "Cygni", Del: "Delphini", Dor: "Doradus", 
                 Dra: "Draconis", Equ: "Equulei", Eri: "Eridani", For: "Fornacis", 
                 Gem: "Geminorum", Gru: "Gruis", Her: "Herculis", Hor: "Horologii", 
                 Hya: "Hydrae", Hyi: "Hydri", Ind: "Indi", Lac: "Lacertae", 
                 Leo: "Leonis", LMi: "Leonis Minoris", Lep: "Leporis",
                 Lib: "Librae", Lup: "Lupi", Lyn: "Lyncis", Lyr: "Lyrae",
                 Men: "Mensae", Mic: "Microscopii", Mon: "Monocerotis", 
                 Mus: "Muscae", Nor: "Normae", Oct: "Octantis", Oph: "Ophiuchi", 
                 Ori: "Orionis", Pav: "Pavonis", Peg: "Pegasi", Per: "Persei", 
                 Phe: "Phoenicis", Pic: "Pictoris", Psc: "Piscium", 
                 PsA: "Piscis Austrini", Pup: "Puppis", Pyx: "Pyxidis", 
                 Ret: "Reticuli", Sge: "Sagittae", Sgr: "Sagittarii", Sco: "Scorpii",
                 Scl: "Sculptoris", Sct: "Scuti", Ser: "Serpentis", Sex: "Sextantis",
                 Tau: "Tauri", Tel: "Telescopii", Tri: "Trianguli", 
                 TrA: "Trianguli Australis", Tuc: "Tucanae", UMa: "Ursae Majoris", 
                 UMi: "Ursae Minoris", Vel: "Velorum", Vir: "Virginis", 
                 Vol: "Volantis", Vul: "Vulpeculae"});

/*------------------------------
 *
 * End of star name information
 *
 *----------------------------*/
