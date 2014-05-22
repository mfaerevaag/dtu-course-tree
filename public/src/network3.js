// based off mbostock’s block #4062045 November 12, 2012
// http://bl.ocks.org/mbostock/4062045

var width = 960,
    height = 600,
    distance = 100,
    radius = 10;

var color = d3.scale.category20();

var force = d3.layout.force()
        .charge(-120*5)
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
    _.each(data_graph.nodes, function (n, i) {
        n.parents = [];
        n.children = [];
        n.index = i;
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

var SearchCourse = function () {
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

var ClearSvg = function () {
    d3.select("svg").remove();

    svg = d3.select(".main").append("svg")
        .attr("width", width)
        .attr("height", height);
}

var Node = function (idx) {
    return _.clone(data_graph.nodes[idx]);
};

var Nodes = function (root, depth) {
    var nodes = [];
    var links = [];
    var id = 0;
    var NextId = function () { return id++; };

    var Inner = function (root, depth) {
        var node = Node(root);

        // base
        if (depth === 0) {
            nodes.push(_.extend(Node(root), { group: depth, index: NextId() }));
            return [root];
        }

        // recursive
        var rn = _.extend(Node(root), { group: depth, index: NextId() });

        var parents = _.chain(node.parents)
                .map(function(p) {
                    return Inner(p, depth - 1 );
                })
                .flatten().uniq().value();

        var children = _.chain(node.children)
                .map(function(c) {
                    return Inner(c, depth - 1 );
                })
                .flatten().uniq().value();

        var mappedParents = _.chain(parents)
                .map(Node)
                .filter(function (p) {
                    return _.contains(nodes, function (n) {
                        return n.name == p.name;
                    });
                })
                .map(function (p) {
                    return _.extend(p, { group: depth, index: NextId() });
                })
                .value();


        var mappedChildren = _.chain(children)
                .map(Node)
                .filter(function (p) {
                    return _.contains(nodes, function (n) {
                        return n.name == p.name;
                    });
                })
                .map(function (p) {
                    return _.extend(p, { group: depth, index: NextId() });
                })
                .value();

        nodes = _.union(nodes, mappedParents, mappedChildren, [rn]);

        _.each(mappedParents, function (n) {
            links.push({ source: n.index, target: rn.index, value: 1 });
        });

        _.each(mappedChildren, function (n) {
            links.push({ source: rn.index, target: n.index, value: 1 });
        });

        return _.union(parents, children);
    };

    Inner(root, depth);
    debugger;
    return { nodes: _.uniq(nodes, function (n) { return n.name; }), 
             links: links };
};

var UpdateGraph = function(root) {

    ClearSvg();

    var graph = Nodes(root, 2);

    force.nodes(graph.nodes)
        .links(graph.links)
        .start();

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

        UpdateGraph(d.index_global);
    });

    var link = svg.selectAll(".link")
            .data(graph.links)
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
