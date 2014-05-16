// based off mbostock’s block #4062045 November 12, 2012
// http://bl.ocks.org/mbostock/4062045

var width = 960,
height = 600,
distance = 100,
radius = 10;

var max_depth = 2;

var color = d3.scale.category20();

var force = d3.layout.force()
  .charge(-120*5)
  .linkDistance(distance)
  .size([width, height]);

var svg = d3.select(".main").append("svg")
  .attr("width", width)
  .attr("height", height);

var json_data;
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
    }

// Kloner links
    for(var i = 0; i < data.links.length; i++)
    {
        var link = data.links[i];
        data_graph.links[i] = JSON.parse((JSON.stringify(link)));
        var c = data_graph.links[i].source;
        var p = data_graph.links[i].target;
        data_graph.nodes[c].parents.push(data_graph.nodes[p]);
    }

// Sætter children
    for(var i = 0; i < data_graph.nodes.length; i++)
    {
        for(var j = 0; j < data_graph.nodes[i].parents.length; j++)
        {
            data_graph.nodes[i].parents[j].children.push(data_graph.nodes[i]);
        }
    }

    PlotCourse("02105",1);
});

function FindCourse(course_name, graph)
{
    for(var i = 0; i < graph.nodes.length; i++)
    {
        if(graph.nodes[i].name === course_name)
        {
            return i;
        }
    }

    return -1;
}

function SearchCourse()
{
    var course_name = $("#input-course-search").val();
    if(FindCourse(course_name, data_graph) === -1)
    {
        alert("Course not found :-(");
        return;
    }

    PlotCourse(course_name,1);
}

function AddChildrenToPlot(course_name, depth)
{
    if(depth > max_depth)
    {return;}

    var data_index = FindCourse(course_name, data_graph);
console.log("child, current depth: "+depth);
    for(var i = 0; i < data_graph.nodes[data_index].children.length; i++)
    {
        var child_name = data_graph.nodes[data_index].children[i].name;
        console.log(""+depth+", "+child_name);

        var plot_index = FindCourse(child_name, plot_graph);
        // console.log("plot_index: "+plot_index+", name: "+child_name);

        var parent_plot_index = FindCourse(course_name, plot_graph);

        if(plot_index === -1)
        {
            var last_index = plot_graph.nodes.push({name:child_name, group:depth*2+1}) - 1;
            var link = {source:last_index,target:parent_plot_index,value:1};
            var link_index = plot_graph.links.push(link);
           // console.log("Adding new link. Source: "+last_index+", target: "+parent_plot_index+", link_index: "+link_index);

        }else
        {
            var link = {source:plot_index,target:parent_plot_index,value:1};
            var link_index = plot_graph.links.push(link);
            // console.log("Adding new link. Source: "+last_index+", target: "+parent_plot_index+", link_index: "+link_index);
        }

        AddChildrenToPlot(child_name, depth + 1);
        if(plot_index === -1)
        {
            AddParentsToPlot(child_name, depth + 1);
        }
    }
}

function AddParentsToPlot(course_name, depth)
{
    console.log("parent, current depth: "+depth);

    if(depth > max_depth)
    {return;}

    var data_index = FindCourse(course_name, data_graph);

    for(var i = 0; i < data_graph.nodes[data_index].parents.length; i++)
    {
        var parent_name = data_graph.nodes[data_index].parents[i].name;
        // console.log(""+depth+", "+parent_name);

        var plot_index = FindCourse(parent_name, plot_graph);
        // console.log("plot_index: "+plot_index+", name: "+parent_name);

        var parent_plot_index = FindCourse(course_name, plot_graph);

        if(plot_index === -1)
        {
            var last_index = plot_graph.nodes.push({name:parent_name, group:depth*2+1}) - 1;
            var link = {source:parent_plot_index,target:last_index,value:1};
            //     var link = {source:0,target:last_index,value:1};
            var link_index = plot_graph.links.push(link);
           // console.log("Adding new link. Source: "+last_index+", target: "+parent_plot_index+", link_index: "+link_index);

        }else
        {
            var link = {source:parent_plot_index,target:plot_index,value:1};
            var link_index = plot_graph.links.push(link);
            // console.log("Adding new link. Source: "+last_index+", target: "+parent_plot_index+", link_index: "+link_index);
        }

        AddParentsToPlot(parent_name, depth + 1);
        if(plot_index === -1)
        {
            AddChildrenToPlot(parent_name, depth + 1);
        }
    }
}



function AddToPlot(course_name, depth)
{
    var index = FindCourse(course_name, data_graph);

    //plot_graph.nodes.push(data_graph.nodes[index]);
    plot_graph.nodes.push({name:course_name, group:depth*2+1}) - 1;

    AddChildrenToPlot(course_name, depth);
    // alert("nodes after children: "+plot_graph.nodes.length);

    AddParentsToPlot(course_name, depth);
    // alert("nodes after parents: "+plot_graph.nodes.length);

}

function PlotCourse(course_name, depth){
    plot_graph = {links:[],nodes:[]}; // Reset plot_graph

    AddToPlot(course_name, depth);

    ClearSvg();
    test_d3();

}

function ClearSvg()
{
    d3.select("svg")
        .remove();
    svg = d3.select(".main").append("svg")
        .attr("width", width)
        .attr("height", height);
}

var test_d3 = function() {
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
        .style("stroke-width", function(d) { return Math.sqrt(d.value)*5; });

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

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
};
