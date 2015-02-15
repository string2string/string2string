'use strict';
/*global angular*/

var app = angular.module('smartboard', [
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'http-auth-interceptor',
  'ui.bootstrap',
  'controllers.board',
  'controllers.test'
]);

function configApp($routeProvider, $locationProvider) {
  $routeProvider
    // .when('/', {
    //   templateUrl: 'partials/board.html',
    //   controller: 'BoardCtrl'
    // })
    .when('/', {
      templateUrl: 'partials/test.html',
      controller: 'TestCtrl'
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
  $rootScope.baseUrl = 'localhost:3000';
}]);