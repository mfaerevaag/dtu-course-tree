'use strict';

var app = require('App').module,
    name = 'HomeCtrl';

app.controller(name, function($scope) {
    $scope.pageTitle = 'Velko';
});

exports.name = name;
