var launchCodeTvApp = angular.module('app', []);

launchCodeTvApp.controller('SummaryCtrl', function($scope, $http) {
  var app = this;

  $scope.launchCodeVideos = [];

  $http.get('rest/videos.json')
      .success(function(data) {
        $scope.launchCodeVideos = data;
      }).error(function(data) {
        alert("There was a problem retrieving the videos");
      });

});