var $ = require('jquery'),
    angular = require('angularjs');

var graphs = ['home', 'network', 'edge','network1'];

function loadContent(graph) {
    if (graphs.indexOf(graph) < 0) {
        throw graph + " is not a graph."
    }

    $('.main').html('')
    if (graph === 'home') {
        $('.main').load('src/home.html');
        return;
    }

    var file = 'src/' + graph + '.js';
    $.getScript(file);
}

$(function() {
    $('.navbar-nav li').click(function(e) {
        $('li.active').removeClass('active');
        var $this = $(this);
        if (!$this.hasClass('active')) {
            $this.addClass('active');
        }
    });

    graphs.forEach(function(graph) {
        $('#btn-' + graph).bind('click', function() { loadContent(graph) });
    });

    var graph = document.URL.substr(document.URL.indexOf('#') + 1);
    if (graphs.indexOf(graph) > 0) {
        loadContent(graph)
    } else {
        loadContent('home')
    }
});
