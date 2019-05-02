

var svg = d3.select('svg')
   .attr('width', 1000)
   .attr('height', 600)

var tooltip = d3.select('body')
   .append('div')
   .attr('class', "tooltip")
   .attr('id', 'tooltip')
   .style('opacity', '0');

var path = d3.geoPath();

var promises = [
   d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"),
   d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json")

];

Promise.all(promises).then((values) => {
   ready(values);
});

var ready = ([us, education]) => {

   var color = d3.scaleThreshold()
      .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
      .range(d3.schemeBlues[9])

   svg.append('g')
      .selectAll('path')
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append('path')
      .attr('class', 'county')
      .attr('data-fips', (d) => {
         return d.id;
      })
      .attr('fill', (d) => {
         var col = education.filter((ele) => {
            if (ele.fips === d.id) {
               d.BOH = ele.bachelorsOrHigher;
               d.AN = ele.area_name;
               return ele
            }
         })

         return color(col[0].bachelorsOrHigher)
      })
      .attr('data-education', (d) => {
         return d.BOH;
      })
      .attr('d', path)
      .on('mouseover', (d) => {
         tooltip.style('opacity', 0.8);
         tooltip.attr('data-education', () => {
            return d.BOH;
         });

         tooltip.html(d.AN + " ID:" + d.BOH + "%")
            .style('left', (d3.event.pageX) + 15 + 'px')
            .style('top', (d3.event.pageY) + 'px');

      })
      .on('mouseout', (d) => {
         tooltip.style('opacity', 0);
      });

   svg.append('path')
      .datum(topojson.mesh(us, us.objects.states, (a, b) => { return a !== b; }))
      .attr('class', 'states')
      .attr('d', path)

   var legend = svg.append('g')
      .attr('id', 'legend')
      .attr('transform', 'translate(0,20)')

   var x = d3.scaleLinear()
      .domain([2.6, 75.1])
      .range([600, 860])


   legend.selectAll('rect')
      .data(color.range().map((d) => {
         d = color.invertExtent(d);
         if (d[0] == null) d[0] = x.domain()[0];
         if (d[1] == null) d[1] = x.domain()[1];
         return d;

      }))
      .enter()
      .append('rect')
      .attr("height", 10)
      .attr("x", function (d) { return x(d[0]); })
      .attr("width", function (d) { return x(d[1]) - x(d[0]); })
      .attr("fill", function (d) { return color(d[0]); });


   legend.call(d3.axisBottom(x)
      .tickSize(13)
      .tickFormat(function (x) { return Math.round(x) + "%"; })
      .tickValues(color.domain()))
      .select(".domain")
      .remove();
}