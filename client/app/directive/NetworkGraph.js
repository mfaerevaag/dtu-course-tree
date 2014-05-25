var app = require('App').module,
    $ = require('jquery'),
    d3 = require('d3');

app.directive('networkGraph', function () {
    return {
        restrict: 'E',

        templateUrl: 'app/view/networkGraphTmpl.html',

        scope: {
            data: '=',
            course: '='
        },

        link: function (scope, element, attrs) {

            scope.$watch('[data,course]', function(vals) {
                var data = vals[0];
                var course = vals[1];

                if (!data || !course) return null;

                return scope.render(data, course);
            }, true);

            scope.render = function (data, course) {
                var width = 1000,
                    height = 500,
                    distance = 120,
                    radius = 10;

                var max_depth = 2;
                var bfs_queue = [];

                var color = d3.scale.category20();

                var force = d3.layout.force()
                        .charge(-120*15)
                        .linkDistance(distance)
                        .size([width, height]);

                var svg = d3.select(element.find('.graphContainer')[0])
                        .attr("width", width)
                        .attr("height", height);

                var json_data;
                var data_graph;
                var plot_graph = {nodes:[],links:[]};

                data_graph = {links:[],nodes:[]};

                // Kloner alle nodes
                for(var i = 0; i < data.nodes.length; i++)
                {
                    var node = data.nodes[i];
                    data_graph.nodes[i] = JSON.parse((JSON.stringify(node)));
                    data_graph.nodes[i].children = [];
                    data_graph.nodes[i].parents = [];
                    data_graph.nodes[i].visited = false;
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

                function SearchCourse(name)
                {
                    if(FindCourse(name, data_graph) === -1)
                    {
                        alert("Course not found :-(");
                        return;
                    }

                    PlotCourse(name);
                }


                function AddToPlot(course_name)
                {
                    for(var i = 0; i < data_graph.nodes.length; i++)
                    {
                        data_graph.nodes[i].visited = false;
                    }

                    var index = FindCourse(course_name, data_graph);
                    //NEW
                    bfs_queue.push({name:course_name, group:0, depth:0});

                    plot_graph.nodes.push({name:course_name, group:0, depth:0});
                    var data_index = FindCourse(course_name, data_graph);
                    data_graph.nodes[data_index].visited = true;

                    while(bfs_queue.length > 0)
                    {
                        //1st unqueue
                        var node = bfs_queue.shift();

                        if(node.depth >= max_depth)
                        {continue;}

                        var data_index = FindCourse(node.name, data_graph);
                        var plot_index = FindCourse(node.name, plot_graph);

                        //2ND add parent+child nodes and links
                        //Adding parents
                        for(var i = 0; i < data_graph.nodes[data_index].parents.length; i++)
                        {
                            var parent_name = data_graph.nodes[data_index].parents[i].name;
                            var parent_data_index = FindCourse(parent_name, data_graph);


                            if(!data_graph.nodes[parent_data_index].visited)
                            {
                                data_graph.nodes[parent_data_index].visited = true;
                                var parent = {name: parent_name, group:node.depth*2 + 1, depth:node.depth+1};
                                var last_index = -1 + plot_graph.nodes.push(parent);
                                var link = {source:plot_index, target:last_index, value:1};
                                var link_index = -1 + plot_graph.links.push(link);
                                bfs_queue.push(parent);
                            }else
                            {
                                var parent_plot_index = FindCourse(parent_name, plot_graph);
                                var link = {source:plot_index, target:parent_plot_index, value:1};
                                var link_index = -1 + plot_graph.links.push(link);
                            }
                        }

                        //3rd add children
                        for(var i = 0; i < data_graph.nodes[data_index].children.length; i++)
                        {
                            var child_name = data_graph.nodes[data_index].children[i].name;
                            var child_data_index = FindCourse(child_name, data_graph);

                            if(!data_graph.nodes[child_data_index].visited)
                            {
                                data_graph.nodes[child_data_index].visited = true;
                                var child = {name: child_name, group:node.depth*2 +1, depth:node.depth+1};
                                var last_index = -1 + plot_graph.nodes.push(child);
                                var link = {source:last_index, target:plot_index, value:1};
                                var link_index = -1 + plot_graph.links.push(link);
                                bfs_queue.push(child);
                            }
                            else
                            {
                                var child_plot_index = FindCourse(child_name, plot_graph);
                                var link = {source:child_plot_index, target:plot_index, value:1};
                                var link_index = -1 + plot_graph.links.push(link);
                            }
                        }
                    }
                }

                function PlotCourse(course_name){
                    plot_graph = {links:[],nodes:[]}; // Reset plot_graph

                    AddToPlot(course_name);

                    ClearSvg();
                    test_d3();

                }

                function ClearSvg()
                {
                    svg.selectAll("*").remove();
                }

                var test_d3 = function() {
                    force
                        .nodes(plot_graph.nodes)
                        .links(plot_graph.links)
                        .start();

                    var node = svg.selectAll(".node")
                            .data(plot_graph.nodes)
                            .enter().append("g")
                            .call(force.drag);

                    var link = svg.selectAll(".link")
                            .data(plot_graph.links)
                            .enter().append("line")
                            .attr("class", "link")
                            .style('marker-start', 'url(#start-arrow)')
                            .style("stroke-width", function(d) { return Math.sqrt(d.value)*4; });

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

                        PlotCourse(d.name);
                    });

                    force.on("tick", function() {
                        link.attr("x1", function(d) {
                            var width = 70;

                            return d.source.x + width/2;

                            // if(d.target.x < d.source.x + width/2)
                            //     return d.source.x;
                            // else
                            //     return d.source.x + width;
                        })
                            .attr("y1", function(d) { //return d.source.y;
                                var height = 24;

                                return d.source.y + height/2;

                                // if(d.target.y < d.source.y + height/2)
                                //     return d.source.y;
                                // else
                                //     return d.source.y + height;
                            })
                            .attr("x2", function(d) {
                                var width = 70;
                                return d.target.x + width/2;

                                // if(d.source.x < d.target.x + width/2)
                                //     return d.target.x;
                                // else
                                //     return d.target.x + width;

                            })
                            .attr("y2", function(d) { //return d.target.y;

                                var height = 24;
                                return d.target.y + height/2;

                                // if(d.source.y < d.target.y + height/2)
                                //     return d.target.y;
                                // else
                                //     return d.target.y + height;
                            });

                        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
                    });
                };

                SearchCourse(course);
            };
        }
    };
});
