'use strict';

var app = require('App').module,
    $ = require('jquery'),
    d3 = require('d3'),
    name = 'NetworkCtrl';

require('directive/NetworkGraph');

app.controller(name, function ($scope, $http) {
    $scope.course = '02105';

    $scope.selectCourse = function () {
        $scope.course = $scope.courseInput;
    };

    $http.get('data/compute_full_trimmed.json')
        .success(function (data) {
            $scope.graphData = data;
        });
});

exports.name = name;


