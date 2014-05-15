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

var data_graph;
var yttap_graph;
var plot_graph = {nodes:[],links:[]};

$.getJSON("data/compute_full_trimmed.json", function(data) {
    data_graph = data;
    yttap_graph = {links:[],nodes:[]};


// Kloner alle nodes
    for(var i = 0; i < data_graph.nodes.length; i++)
    {
        var node = data_graph.nodes[i];
        yttap_graph.nodes[i] = JSON.parse((JSON.stringify(node)));
        yttap_graph.nodes[i].children = [];
        yttap_graph.nodes[i].parents = [];
        yttap_graph.nodes[i].child_count = 0; //Debug-stuff
        yttap_graph.nodes[i].parent_count = 0;
    }

// Kloner links
    for(var i = 0; i < data_graph.links.length; i++)
    {
        var link = data_graph.links[i];
        yttap_graph.links[i] = JSON.parse((JSON.stringify(link)));
        var c = yttap_graph.links[i].source;
        var p = yttap_graph.links[i].target;
        yttap_graph.nodes[c].parents.push(yttap_graph.nodes[p]);
        yttap_graph.nodes[c].parent_count++;
        //Source er child //TODO _IKKE_ parent
        //Target er parent //TODO _IKKE_ child

    }

// Sætter children
    for(var i = 0; i < yttap_graph.nodes.length; i++)
    {
        // if(yttap_graph.nodes[i].name === "02561")
        //     alert(i);

        for(var j = 0; j < yttap_graph.nodes[i].parents.length; j++)
        {
            yttap_graph.nodes[i].parents[j].children.push(yttap_graph.nodes[j]);
            yttap_graph.nodes[i].parents[j].child_count++;
        }
    }

    var index = 131; // Computergrafik (modsat ikke-computergrafik)
    plot_graph.nodes.push(yttap_graph.nodes[index]);

    for(var i = 0; i < plot_graph.nodes[0].parents.length; i++)
    {
        var last_index = plot_graph.nodes.push(plot_graph.nodes[0].parents[i]) - 1;

        var link = {source:0,target:last_index,value:1};
        plot_graph.links.push(link);
    }

});

// d3.json("data/compute_full_trimmed.json", function(error, graph) {
//   force
//     .nodes(graph.nodes)
//     .links(graph.links)
//     .start();

d3.json("data/compute_full_trimmed.json", function(error, graph) {
    force
        .nodes(plot_graph.nodes)
        .links(plot_graph.links)
        .start();

  var node = svg.selectAll(".node")
    .data(plot_graph.nodes)
    .enter().append("g")
    // .filter(function(d) { return d.weight > 7;})
    .call(force.drag);

    var link = svg.selectAll(".link")
        .data(plot_graph.links)
        .enter().append("line")
        // .filter(function(d) { debugger; return node.some(function(n){
        //     return d.source.name === n.name || d.target.name === n.name;
        // })})
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  node.append("rect")
    .attr("class", "node")
    .attr("width", function(d) { return d.name.length * 7 * 2; })
    .attr("height", radius * 2)
    .style("fill", function(d) { return color(d.group); })
    .style("stroke", "rgb(0,0,0)")
    .style("stroke-width", function(d) { return Math.sqrt(d.weight) * 4; });

  node.append("text")
    .attr("class", "label")
    .attr("y", 10)
    .attr("x", function(d) { return d.name.length * 7 / 2; })
    .style("text-anchor", "middle")
    .text(function(d) { return d.name; });

    node.append("text")
        .attr("class", "label")
        .attr("y", 25)
        .attr("x", function(d) { return d.name.length * 7 / 2; })
        .style("text-anchor", "middle")
        .text(function(d) { return "yttap!!!!"; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});
