'use strict';

var app = require('App').module,
    name = 'HomeCtrl';

app.controller(name, function($scope) {
    $scope.pageTitle = 'Lolhej';
});

exports.config = {
    templateUrl: 'app/view/home.html',
    controller: name
};;
