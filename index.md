---
layout: page
custom_css:
- d3.slider
custom_js:
- d3.min
- d3.slider
- topojson.v1.min
- queue.v1.min
- colorbrewer
- jquery.min
- d3-legend.min
---

<style type="text/css">
.counties {
  fill: none;
}

.states {
  fill: none;
  stroke: #fff;
  stroke-linejoin: round;
}

#tooltip-container {
  float: right;
  position: relative;
  width: 60%;
  height: 2rem;
  text-align:right;
}

#tooltip {
  position: relative;
  background-color: #fff;
  color: #000;
  display: none;
}

.tooltip_key {
  font-weight: bold;
}

.tooltip_value {
  float: right;
}

#widget-container {
	float: left;
	margin-bottom: 6rem;
	position: relative;
	width: 100%;
	margin-top: -2.5rem;
}


</style>

<div id="map-container"></div>
<div id="tooltip-container"><div id="tooltip"></div></div>
<div id="widget-container">
<div style="text-align:left; padding-bottom:1rem" id="colgroup">
<select id="sample" class="select">
<optgroup label="College sample">
            <option value="0">All colleges</option>
            <option value="1">Public colleges</option>
            <option value="2">Public four year colleges</option>
            <option value="3" selected>Public two year colleges</option>
</optgroup>
</select>
<select id="weight" class="select">
<optgroup label="Weighting">
            <option value="0">Across state lines</option>
            <option value="1" selected>Compare within state only</option>
</optgroup>
</select>
</div>
<div id="slider"></div></div>


<script type="text/javascript">

// wait until all is loaded
queue()
    .defer(d3.json, "{{ site.siteurl }}/data/us.json")
    .defer(d3.tsv, "{{ site.siteurl }}/data/mapdata_wide.tsv")
	.defer(d3.tsv, "{{ site.siteurl }}/data/countynames.tsv")
    .await(ready);

function ready(error, us, data, names) {

	// init variables for first load
	var year = "1997"
		school = "3"
		weight = "1";

	// concatenate to make data column name (this is how right
	// cost/decile value are selected
	var	dataColumn = year + school + weight;

	// map dimensions
	var width = 1120
		height = 695;

	// set projection
	var projection = d3.geo.albers()
		.scale(1545)
		.translate([width / 2, height / 2]);

	// color domain/labels are backwards so red is means higher costs
	var colorDomain = [9,8,7,6,5,4,3,2,1,0];
	var legendLabels = [
		["> $27k","$24k - $27k","$21k - $24k","$18k - $21k","$15k - $18k",
		"$12k - $15k","$9k - $12k","$6k - $9k","$3k - $6k","< $3k"],
		["> $9k","$8k - $9k","$7k - $8k","$6k - $7k","$5k - $6k","$4k - $5k",
		"$3k - $4k","$2k - $3k","$1k - $2k","< $1k"],
		["> $9k","$8k - $9k","$7k - $8k","$6k - $7k","$5k - $6k","$4k - $5k",
		"$3k - $4k","$2k - $3k","$1k - $2k","< $1k"],
		["> $4.5k","$4k - $4.5k","$3.5k - $4k","$3k - $3.5k","$2.5k - $3k","$2k - $2.5k",
		"$1.5k - $2k","$1k - $1.5k","$500 - $1k","< $500"]];

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
			.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
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
		drawMap(year + this.value + weight);
		drawLegend(year + this.value + weight);
	});

	// if weight selector changes, redraw map only
	d3.select("#weight").on("change", function() {
		drawMap(year + school + this.value);
	});

	// if year slider moves, redraw map only
	var axis = d3.svg.axis().ticks(16).tickFormat(d3.format("d"));
	d3.select("#slider").call(d3.slider()
		.axis(axis)
		.min(1997)
		.max(2012)
		.step(1)
		.on("slide", function(evt, value) {
			d3.select("#slidertext").text(value);
			drawMap(value + school + weight);
		}));
}


</script>

While a person who wishes to attend college has, in theory, thousands
of choices, the reality is that his or her options are practically
constrained by where he or she lives. Based on the number and
proximity of postsecondary institutions as well as the tuition charges
of those schools, potential students across the country face different
average tuition costs. These costs have also changed across time.

The interactive maps above show the average weighted college price in constant 2013
dollars for each county in the lower 48 states from 1997
to 2012. Using the selection widgets, you can change the college sample to
include:

* all Title IV colleges
* only public colleges
* only four-year public
* colleges only two-year public colleges

You can also change whether the weighting computation crosses state
lines or only considers in-state
schools. [Visit the methodology page for a more complete explanation of how the weighted averages are computed.]({{
site.baseurl }}/methodology/)

#### Acknowledgements

County-level weighted cost data were computed in [R](https://cran.r-project.org) by the authors using
information gathered from IPEDS.  The interactive maps were
constructed using [D3.js](d3.js), the US TopoJSON file made available
by [Mike Bostocks](https://bost.ocks.org/), and plugins created by
[Susie Lu](http://d3-legend.susielu.com) and
[Bj&oslash;rn Sandvik](https://github.com/MasterMaps/d3-slider).

<br>
<br>


