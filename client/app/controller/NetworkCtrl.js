'use strict';

var app = require('App').module,
    _ = require('lodash'),
    d3 = require('d3'),
    name = 'NetworkCtrl';

require('directive/NetworkGraph');

app.controller(name, function ($scope, $http) {
    $scope.course = '02105';
    $scope.courseNames = [];

    $scope.selectCourse = function () {
        $scope.course = $scope.courseInput;
    };

    $http.get('data/compute_full_trimmed.json')
        .success(function (data) {
            $scope.graphData = data;

            $scope.courseNames = _.map(data.nodes, function (n) {
                return n.name;
            });
        });
});

exports.config = {
    templateUrl: 'app/view/network.html',
    controller: name
};

