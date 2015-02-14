'use strict';
/*global angular*/

var api = angular.module('controllers.api', []);

function Api($http, $location) {
  console.log('hello world');
  console.log($location.path);
}

api.controller('ApiCtrl', ['$http', '$location', Api])