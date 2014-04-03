var launchCodeTvApp = angular.module('app', ['uiRouterExample']);

angular.module("uiRouterExample", ["ui.router"]).config(function($stateProvider, $urlRouterProvider) {

  var app = this;
  $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'SummaryCtrl'
      })
      .state('theatre', {
        url: '/videos/:videoName',
        templateUrl: 'templates/theatre.html',
        controller: 'TheatreCtrl'
      })
});


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

launchCodeTvApp.controller('TheatreCtrl', function($scope, $http, $stateParams, $sce) {
  var app = this;

  $scope.currentlyShowingVideo = {};
  $scope.currentVideoUrl = function() {
    angular.element('#videoPlayer').append("<iframe frameborder='0' src='" + $scope.currentlyShowingVideo.url + "' width='650' height='450'></iframe>")
//    angular.element('#videoPlayer').append("<iframe frameborder='0' src='" + "//www.youtube.com/embed/yJ92wdrlNdg" + "' width='650' height='450'></iframe>")
    angular.element('#videoPlayer').append("<h1>" + $scope.currentlyShowingVideo.title + "</h1>");
//    return $sce.trustAsResourceUrl("http://www.youtube.com/embed/" + $scope.currentlyShowingVideo.thumb.split('/')[1].split('.')[0].split('_')[0]);
    //return $sce.trustAsResourceUrl("http://www.youtube.com/embed/" + videoName);
  }
  $scope.currentLesson = {};

  $http.get('rest/videos.json').success(function(data) {


        function getVideoByName(videoName) {
          var matches = _.filter(data, function(video) {
            return videoName === video.thumb.split('/')[1].split('.')[0].split('_')[0]
          });
          if (matches) {
            return matches[0];
          }
          return {};
        }

        // returns and array of videos matching the filter criteria
        var matches = _.filter(data, function(video) {
          return $stateParams.videoName === video.thumb.split('/')[1].split('.')[0].split('_')[0]
        });
        if (matches) {
          $scope.currentlyShowingVideo = matches[0];
        }

        // we should use a javascript promise here, but I want to keep things simple for those new to angular
        $http.get('rest/lessons.json').success(function(lessonData) {
          var lessonMatches = _.filter(lessonData, function(lesson) {
            return lesson.videos.indexOf($stateParams.videoName);
          });
          if (lessonMatches) {
            $scope.currentLesson = lessonMatches[0];
            // this could probably be done with a closure... this code could be better
            $scope.currentLesson.fullVideos = [];
            for (var i = 0; i < $scope.currentLesson.videos.length; i++) {
              $scope.currentLesson.fullVideos.push(getVideoByName($scope.currentLesson.videos[i]));
              if ($scope.currentLesson.videos[i] === $scope.currentlyShowingVideo.thumb.split('/')[1].split('.')[0].split('_')[0]) {
                console.log("found the current video " + $scope.currentLesson.videos[i]);
                $scope.currentLesson.fullVideos[$scope.currentLesson.fullVideos.length - 1].currentVideo = true;
                $scope.currentVideoUrl($scope.currentLesson.videos[i]);
              }
            }
          }
        }).error(function() { alert("There was a problem retrieving the lesson"); });
      }).error(function() { alert("There was a problem retrieving the videos"); });

});