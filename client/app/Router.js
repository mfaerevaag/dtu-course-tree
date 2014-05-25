var app = require('App').module,
    router = require('angular-route');

// controllers
var networkCtrl = require('./controller/NetworkCtrl'),
    homeCtrl = require('./controller/HomeCtrl');
    
app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
        .when('/', homeCtrl.config)
        .when('/network', networkCtrl.config);
});
