var app = require('App').module,
    router = require('angular-route');

// controllers
var networkCtrl = require('./controller/NetworkCtrl'),
    homeCtrl = require('./controller/HomeCtrl');
    
app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/view/home.html',
            controller: homeCtrl.name
        })
        .when('/network', {
            templateUrl: 'app/view/network.html',
            controller: networkCtrl.name
        });
});
