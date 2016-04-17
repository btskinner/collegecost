---
layout: page
custom_css:
- d3.slider
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

<div id="map-container"></div>
<div id="tooltip-container"><div id="tooltip"></div></div>
<div id="widget-container">
	<div id="buttons-container">
		<div id="colgroup">
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
		<div id="play">
			<i class="fa fa-play fa-2x" title="Play animation"></i>
		</div>
	</div>
	<div id="slider"></div>
</div>

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
by [Mike Bostock](https://bost.ocks.org/), and plugins created by
[Susie Lu](http://d3-legend.susielu.com) and
[Bj&oslash;rn Sandvik](https://github.com/MasterMaps/d3-slider).

<br>
<br>

