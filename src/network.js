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

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', radius*1.4)
    .attr('markerHeight', radius*1.4)
    .attr('orient', 'auto')
    .attr('stroke', 'rgb(0,0,0)')
    .attr('fill', 'rgb(0,0,0)')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('stroke', 'rgb(130,200,130)')
    .attr('fill', 'rgb(130,200,130)')
    .attr('refX', 4)
    .attr('markerWidth', radius*1.4)
    .attr('markerHeight', radius*1.4)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5');


var data_graph;
var plot_graph = {nodes:[],links:[]};

$.getJSON("data/compute_full_trimmed.json", function(data) {

    data_graph = {links:[],nodes:[]};


// Kloner alle nodes
    for(var i = 0; i < data.nodes.length; i++)
    {
        var node = data.nodes[i];
        data_graph.nodes[i] = JSON.parse((JSON.stringify(node)));
        data_graph.nodes[i].children = [];
        data_graph.nodes[i].parents = [];
        data_graph.nodes[i].child_count = 0; //Debug-stuff
        data_graph.nodes[i].parent_count = 0;
    }

// Kloner links
    for(var i = 0; i < data.links.length; i++)
    {
        var link = data.links[i];
        data_graph.links[i] = JSON.parse((JSON.stringify(link)));
        var c = data_graph.links[i].source;
        var p = data_graph.links[i].target;
        data_graph.nodes[c].parents.push(data_graph.nodes[p]);
        data_graph.nodes[c].parent_count++;
    }

// Sætter children
    for(var i = 0; i < data_graph.nodes.length; i++)
    {
        // if(data_graph.nodes[i].name === "01410")
        //     alert(i);

        for(var j = 0; j < data_graph.nodes[i].parents.length; j++)
        {
            data_graph.nodes[i].parents[j].children.push(data_graph.nodes[i]);
            data_graph.nodes[i].parents[j].child_count++;
        }
    }

    var index = 33; //algo1, da denne har 2 forudsætninger og mange efterfølgere
    plot_graph.nodes.push(data_graph.nodes[index]);

    for(var i = 0; i < plot_graph.nodes[0].children.length; i++)
    {
        var last_index = plot_graph.nodes.push({name:plot_graph.nodes[0].children[i].name, group:1}) - 1;
        var link = {source:last_index,target:0,value:1};
        plot_graph.links.push(link);
    }

    for(var i = 0; i < plot_graph.nodes[0].parents.length; i++)
    {
        var last_index = plot_graph.nodes.push({name:plot_graph.nodes[0].parents[i].name, group:2}) - 1;
        var link = {source:0,target:last_index,value:1};
        plot_graph.links.push(link);
    }

    test_d3();
});

// d3.json("data/compute_full_trimmed.json", function(error, graph) {
//   force
//     .nodes(graph.nodes)
//     .links(graph.links)
//     .start();

var test_d3 = function() {
// d3.json("data/compute_full_trimmed.json", function(error, graph) {
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
        .attr("class", "link")
        .style('marker-start', 'url(#start-arrow)')
        // .attr("marker-end","url(#triangle)")
        // .attr("stroke","black")
    //marker-end="url(#yourMarkerId)" stroke="black" stroke-width="10"
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
};
