// based off mbostock’s block #4062045 November 12, 2012
// http://bl.ocks.org/mbostock/4062045

var width = 960,
height = 600,
distance = 300,
radius = 10;

var color = d3.scale.category20();

var force = d3.layout.force()
  .charge(-120)
  .linkDistance(distance)
  .size([width, height]);

var svg = d3.select(".main").append("svg")
  .attr("width", width)
  .attr("height", height);

d3.json("data/compute_full.json", function(error, graph) {
  force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

  var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .call(force.drag);

  node.append("rect")
    .attr("class", "node")
    .attr("width", function(d) { return d.name.length * 7 * 2; })
    .attr("height", radius * 2)
    .style("fill", function(d) { return color(d.group); })
    .style("stroke", "rgb(0,0,0)")
    .style("stroke-width", function(d) { return d.weight; });

  node.append("text")
    .attr("class", "label")
    .attr("y", 10)
    .attr("x", function(d) { return d.name.length * 7 / 2; })
    .style("text-anchor", "middle")
    .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});
