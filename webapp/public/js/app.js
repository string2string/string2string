'use strict';
/*global angular*/

var app = angular.module('smartboard', [
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'http-auth-interceptor',
  'ui.bootstrap',
  'controllers.board'
]);

function configApp($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/board.html',
      controller: 'BoardCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
}

app.config([
  '$routeProvider', 
  '$locationProvider', 
  configApp
]);

app.run(['$rootScope', function($rootScope) {
  //EDIT THIS URL TO POINT TO YOUR SERVER
  $rootScope.baseUrl = 'hackcooper.cloudapp.net';
}]);
