---
layout: page
custom_css:
- index
custom_js:
- d3.min
- spin.min
- d3.slider
- topojson.v1.min
- queue.v1.min
- colorbrewer
- jquery.min
- d3-legend.min
- index.map
---

<div id="viz-container">
	<div id="map-container"></div>
	<div id="submap-container">
		<div id="buttons-container">
			<select id="sample">
				<optgroup label="College sample">
					<option value="0">All colleges</option>
					<option value="1">Public colleges</option>
					<option value="2">Public four year colleges</option>
					<option value="3" selected>Public two year colleges</option>
				</optgroup>
			</select>
			<select id="weight">
				<optgroup label="Weighting">
					<option value="0">Across state lines</option>
					<option value="1" selected>Compare within state only</option>
				</optgroup>
			</select>
			<div id="play">
				<i class="fa fa-play fa-3x" title="Play animation"></i>
			</div>
		</div>
		<div id="tooltip-container">
			<div id="tooltip"></div>
		</div>
		<div id="slider-container">
			<div id="slider"></div>
		</div>
	</div>
</div>

<div class="posttext" markdown="1">

With thousands of colleges and universities spread across the country,
those who want to attend higher education have an incredible number of
choices. Yet the majority of higher education students---over
two-thirds---attend a school within 50 miles of home. Over half attend
a school within 20 miles[^1]. This fact suggests that despite a
theoretical abundance of choice, most postsecondary students choose
among nearby schools. Because students and schools are not equally
distributed around the nation, some students will have more choices
than others. Also, because schools have different costs of attendance,
it will be more expensive, on average, to go to college in some areas
than others.  

The interactive map above shows the average college price (tuition and
fees) for each county in the lower 48 states for each year from 1997
to 2012. Hovering over a county will show its unique price, which is
a distance-weighted average of the tuition and fees at surrounding
colleges and universities. Within each year, the variation in price
across the country is shown by the differences in color. Blue values
are given to comparatively lower prices, red values to higher. Because
dollar amounts are adjusted to constant 2013 dollars, moving the
slider or clicking the play button shows how these average prices have
increased since the late 1990s.

Using the selection widgets, you can change the college sample to include:

* all colleges
* only public colleges
* only four-year public colleges
* only two-year public colleges

Different college samples will give different ranges of price since
some schools (public two-year colleges) are generally less expensive
than others (public four-year and private universities). You can also
change whether the weighting computation includes all schools or only
those in the same state as the
county. [Visit the methodology page for a more complete explanation of how the weighted averages are computed.]({{
site.baseurl }}{{ site.siteurl }}/methodology/)

##### Acknowledgments

County-level weighted price data were computed in
[R](https://cran.r-project.org) by the authors using information
gathered from [IPEDS](http://nces.ed.gov/ipeds/).  The interactive
maps were constructed using [D3.js](d3.js), the US TopoJSON file made
available by [Mike Bostock](https://bost.ocks.org/), and plugins
created by [Susie Lu](http://d3-legend.susielu.com),
[Bj&oslash;rn Sandvik](https://github.com/MasterMaps/d3-slider), and
[Felix Gnass](http://spin.js.org).

##### Notes
[^1]: Numbers computed by author using the [NCES 2011-2012 National Postsecondary
    Student Aid Study (NPSAS:12)](http://nces.ed.gov/surveys/npsas/)

</div>

