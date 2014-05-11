var width = 960,
    height = 600,
    distance = 100,
    radius = 15;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(distance)
    .size([width, height]);

var svg = d3.select(".graph").append("svg")
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
        .attr("width", radius * 5)
        .attr("height", radius)
        .style("fill", function(d) { return color(d.group); });

  node.append("text")
      .attr("class", "label")
      .attr("y", 10)
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});
