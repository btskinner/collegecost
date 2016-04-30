// loader settings
var opts = {
    lines: 13
    , length: 28
    , width: 14
    , radius: 42
    , scale: 1
    , corners: 1
    , color: '#000'
    , opacity: 0.5
    , rotate: 0
    , direction: 1
    , speed: 1
    , trail: 60
    , fps: 20
    , zIndex: 2e9
    , className: 'spinner'
    , top: '50%'
    , left: '50%'
    , shadow: false
    , hwaccel: false
    , position: 'absolute'
}

var target = document.getElementById('map-container');

// initial function while waiting for load
function init() {

    // trigger loader
    var spinner = new Spinner(opts).spin(target);

    // wait until load all
    queue()
	.defer(d3.json, "/collegecost/data/us.json")
	.defer(d3.tsv, "/collegecost/data/mapdata_wide.tsv")
	.defer(d3.tsv, "/collegecost/data/countynames.tsv")
	.await(function(error, us, data, names) {
	    spinner.stop();
	    ready(us, data, names);
	});
}

// start the spinner, load data, kill spinner, load map
init();

// primary wrapper function
function ready(us, data, names) {

    // init variables for first load
    var minyear = "1997"
    , maxyear = "2012"
    , year = minyear
    , school = "3"
    , weight = "1"
    , currentFrame = 0
    , frameLength = +maxyear - +minyear
    , interval
    , playTime = 1000
    , isPlaying = false;

    // concatenate to make data column name (this is how right
    // cost/decile value are selected
    var	dataColumn = year + school + weight;

    // map dimensions
    var width = 1120
    , height = 695;

    // set projection
    var projection = d3.geo.albers()
	.scale(1545)
	.translate([width / 2, height / 2]);

    // color domain/labels are backwards so red is means higher costs
    var colorDomain = [9,8,7,6,5,4,3,2,1,0];
    var legendLabels = [
	["> $27k","$24k - $27k","$21k - $24k","$18k - $21k","$15k - $18k",
	 "$12k - $15k","$9k - $12k","$6k - $9k","$3k - $6k","< $3k"]
	, ["> $9k","$8k - $9k","$7k - $8k","$6k - $7k","$5k - $6k","$4k - $5k",
	   "$3k - $4k","$2k - $3k","$1k - $2k","< $1k"]
	, ["> $9k","$8k - $9k","$7k - $8k","$6k - $7k","$5k - $6k","$4k - $5k",
	   "$3k - $4k","$2k - $3k","$1k - $2k","< $1k"]
	, ["> $4.5k","$4k - $4.5k","$3.5k - $4k","$3k - $3.5k","$2.5k - $3k",
	 "$2k - $2.5k","$1.5k - $2k","$1k - $1.5k","$500 - $1k","< $500"]
    ];

    // color function
    var color = d3.scale.ordinal()
	.range(colorbrewer.RdBu[10])
	.domain(colorDomain);

    // project paths
    var path = d3.geo.path()
	.projection(projection);

    // hash to associate names with counties for mouse-over
    var id_name_map = {};
    for (var i = 0; i < names.length; i++) {
	id_name_map[names[i].id] = names[i].name;
    }

    // init map svg
    var svg = d3.select("#map-container").append("svg")
	.attr("width", width)
	.attr("height", height);

    // function to draw map
    function drawMap(dataColumn) {

	// init mapping function for getting decile by id
	var decById = d3.map();

	// for each row in data, peel off last digit of value in
	// selected column -- this is decile pasted to cost to save room in
	// data file -- and associate with id (fips)
	data.forEach(function(d) {
	    decById.set(d.id, +String(d[dataColumn]).slice(-1));
	});

	// similar to above -- associate cost (values in selected
	// column, less last value) with id
	var id_cost_map = {};
	for (var i = 0; i < names.length; i++) {
	    id_cost_map[names[i].id] = String(data[i][dataColumn])
		.slice(0,-1)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

        // clear old so doesn't slow down (will just keep appending otherwise)
	svg.selectAll("g.counties").remove();
	svg.selectAll("g.states").remove();
	svg.selectAll("path").remove();

        // start building map: counties, tooltip, state outlines
	svg.append("g")
	    .attr("class", "counties")
	    .selectAll("path")
	    .data(topojson.feature(us, us.objects.counties).features)
	    .enter().append("path")
	    .style("fill", function(d) { return color(decById.get(d.id)); })
	    .attr("d", path)
	    .on("mousemove", function(d) {
		var html = "";

		html += "<div class=\"tooltip_kv\">";
		html += "<span class=\"tooltip_key\">";
		html += id_name_map[d.id] + ': $' + id_cost_map[d.id];
		html += "</span>";
		html += "</div>";

		$("#tooltip").html(html);
		$(this).attr("stroke", "#000").attr("stroke-width", 2);
		$("#tooltip").show();
	    })
	    .on("mouseout", function() {
                $(this).attr("stroke", "");
                $("#tooltip").hide();
            });

	svg.append("path")
	    .datum(topojson.mesh(us, us.objects.states, function(a, b) {
		return a !== b;
	    }))
	    .attr("class", "states")
	    .attr("d", path);


    }

    // function for drawing the legend; separate from drawMap b/c
    // don't need to redraw every time map changes -- only when school
    // sample changes
    function drawLegend(dataColumn) {

	// clear old
	svg.selectAll("g.legendOrd").remove();

	// build up legend, locate it, and call it
	svg.append("g")
	    .attr("class", "legendOrd")
	    .attr("transform", "translate(0,500)");

	var legendOrd = d3.legend.color()
	    .labels(legendLabels[+dataColumn.slice(-2,-1)])
	    .scale(d3.scale.ordinal()
		   .range(colorbrewer.RdBu[10])
		   .domain([9,8,7,6,5,4,3,2,1,0]));

	svg.select(".legendOrd")
	    .call(legendOrd);

    }

    // draw map and legend for first time
    drawMap(dataColumn);
    drawLegend(dataColumn);

    // if sample selector changes, redraw map and legend
    d3.select("#sample").on("change", function() {
	school = this.value;
	drawMap(year + school + weight);
	drawLegend(year + school + weight);
    });

    // if weight selector changes, redraw map only
    d3.select("#weight").on("change", function() {
	weight = this.value;
	drawMap(year + school + weight);
    });

    // if year slider moves, redraw map only
    var axis = d3.svg.axis().ticks(16).tickFormat(d3.format("d"));
    slider = d3.slider()
	.axis(axis)
	.min(1997)
	.max(2012)
	.step(1)
	.on("slide", function(evt, value) {

	    // stop animation if playing
	    if ( isPlaying ) {
		isPlaying = false;
		d3.select("#play").selectAll("i")
		    .call(function() {
			$(this)
			    .toggleClass("fa-pause fa-play")
			    .attr("title", "Play animation");
		    });
		clearInterval (interval);
	    }

	    // reset the current frame so new animation starts here
	    currentFrame = +value - +minyear

	    // change year
	    year = String(value);

	    // draw the map
	    drawMap(year + school + weight);

	});

    // call slider
    d3.select("#slider").call(slider);

    // play/pause
    d3.select("#play").on("click", function() {
	if ( !isPlaying ) {
	    isPlaying = true;
	    $(this).find("i")
		.toggleClass("fa-play fa-pause")
		.attr("title", "Pause animation");
	    animate();
	} else {
	    isPlaying = false;
	    $(this).find("i")
		.toggleClass("fa-pause fa-play")
		.attr("title", "Play animation");
	    clearInterval (interval);
	}
    });

    // animate
    function animate(){
	interval = setInterval ( function(){

	    // increment current frame
	    currentFrame++;

	    // if it's above max, return to min
	    if (currentFrame == frameLength + 1) currentFrame = 0;

	    // store year
	    var y = +currentFrame + +minyear

	    // move slider button
	    d3.select("#slider .d3-slider-handle")
		.style("left",100*currentFrame/frameLength + "%");

	    // change slider value
	    slider.value(y);

	    // change year
	    year = String(y);

	    // draw the map
	    drawMap(year + school + weight);
	}, playTime);
    }
}
