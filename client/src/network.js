var $ = require('jquery'),
    _ = requiore('lodash'),
    d3 = require('d3');

var width = 960,
    height = 600,
    distance = 300,
    radius = 10;

var color = d3.scale.category20();

var force = d3.layout.force()
        .charge(-120)
        .linkDistance(distance)
        .size([width, height]);

var svg = d3.select('.main').append('svg')
        .attr("width", width)
        .attr("height", height);

var data_graph;
var depth = 1;

$.getJSON("data/compute_full_trimmed.json", function(data) {
    data_graph = data;

    // initialize parents and children lists
    _.each(data_graph.nodes, function (n) {
        n.parents = [];
        n.children = [];
    });

    // populate parents and children
    _.each(data_graph.links, function (l) {
        data_graph.nodes[l.source].children.push(l.target);
        data_graph.nodes[l.target].parents.push(l.source);
    });

    UpdateGraph(33);

    var course_ids = _.map(data_graph.nodes, function (n) {
        return n.name;
    });

    $("#input-course-search").typeahead({source:course_ids});
});

function SearchCourse()
{
    var query = $("#input-course-search").val();

    var course = _.find(data_graph.nodes, function(n, i) {
        return n.name == query;
    });

    if (!course) {
        alert('nein nein nein');
        return;
    }

    UpdateGraph(course.index);
}

function ClearSvg()
{
    d3.select("svg")
        .remove();
    svg = d3.select(".main").append("svg")
        .attr("width", width)
        .attr("height", height);
}

function NodeDistance(a, b) {
    return 1337;
}

var UpdateGraph = function(course_index) {
    ClearSvg();

    force.nodes(data_graph.nodes)
        .links(data_graph.links)
        .start();

    var node_data = data_graph.nodes.filter(function(d) {
        //return NodeDistance(d.index, course_index) <= depth;
        var matcher = function(p) { return p == course_index; };

        if (_.any(d.parents, matcher)) {
            d.group = 2;
            return true;
        }
        if (_.any(d.children, matcher)) {
            d.group = 1;
            return true;
        }
        if (d.index == course_index) {
            d.group = 0;
            return true;
        }
        return false;
    });

    var link_data = data_graph.links.filter(function (l) {
        var ns = node_data;
        // only show links to current
        return l.source.index == course_index || l.target.index == course_index;
        return ns.some(function  (n) { return l.source == n;})
            && ns.some(function  (n) { return l.target == n;});
    });

    var node = svg.selectAll(".node")
            .data(node_data)
            .enter().append("g")
            .call(force.drag);

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
        .text(function(d) { return "course name"; });

    node.on('click', function(d) {
        // prevent clicking when dragging
        if (d3.event.defaultPrevented) return;

        UpdateGraph(d.index);
    });

    var link = svg.selectAll(".link")
            .data(link_data)
            .enter().append("line")
            .attr("class", "link")
            .style('marker-start', 'url(#start-arrow)')
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
};
