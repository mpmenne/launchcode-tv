var launchCodeTvApp = angular.module('app', ['uiRouterExample', 'iso.directives']);

angular.module("uiRouterExample", ["ui.router"]).config(function ($stateProvider, $urlRouterProvider) {

  var app = this;
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html'
//        controller: 'SummaryCtrl'
    })
    .state('videoList', {
      url: '/videos',
      templateUrl: 'templates/home.html',
      controller: 'SummaryCtrl'
    })
    .state('theatre', {
      url: '/videos/:videoName?lesson',
      templateUrl: 'templates/theatre.html',
      controller: 'TheatreCtrl'
    })
});


launchCodeTvApp.controller('SummaryCtrl', function ($scope, $http, $filter, $location) {
  var app = this;

  $scope.launchCodeVideos = [];
  $scope.launchCodeVideoSeries = [];
  $scope.selectedSeries = "";
  $scope.selectedVideo = '';

  $http.get('rest/videos1.json')
    .success(function (data) {
      $scope.launchCodeVideos = data;
    }).error(function (data) {
      alert("There was a problem retrieving the videos");
    });

  $http.get('rest/lessons1.json')
    .success(function (data) {
      $scope.launchCodeVideoSeries = data;
    }).error(function (data) {
      alert("There was a problem retrieving the lessons");
    });

  $scope.selectSeries = function (name) {
    $scope.selectedVideo = '';
    $scope.selectedSeries = name;
    console.log("Series has changed to " + $scope.selectedSeries);
    $location.path("/home")
  }

  $scope.selectVideo = function(name) {
    $scope.selectedVideo = name;
  }
});

launchCodeTvApp.filter('videoFilter', function ($http) {
  var lessons = [];

  $http.get('rest/lessons1.json')
    .success(function (data) {
      lessons = data;
    }).error(function (data) {
      alert("There was a problem retrieving the lessons");
    });

  return function (items, search) {
    var selectedLesson = {};
    for (var i = 0; i < lessons.length; i++) {
      if (lessons[i].name === search) {
        selectedLesson = lessons[i];
      }
    }

    if (!lessons || !search) {
      return items;
    }

    var result = [];
    angular.forEach(items, function (value, key) {
      console.log("searching" + search + " ..... " + value.key + " key " + key);

      if (selectedLesson.videos && selectedLesson.videos.indexOf(value.key) != -1) {
        result.push(value);
      } else if (!selectedLesson) {
        result.push(value);
      }
    });

    return result;
  }
});

launchCodeTvApp.controller('TheatreCtrl', function ($scope, $http, $stateParams, $sce, $q) {
  var app = this;

  $scope.videos = [];
  $scope.lessons = [];
  $scope.currentlyShowingVideo = {};
  $scope.relatedVideos = [];
  $scope.currentLesson = {};
  $scope.nextVideoLessonName = "";
  $scope.nextVideoLessonUrlName = "";
  $scope.previousVideoLessonName = "";
  $scope.previousVideoLessonUrlName = "";

  $scope.addVideoPlayer = function () {
    angular.element('#videoPlayer').append("<iframe frameborder='0' src='" + $scope.currentlyShowingVideo.url + "'></iframe>");
    angular.element('#videoPlayer').append("<h1>" + $scope.currentlyShowingVideo.title + "</h1>");
  };

  $scope.getVideoByName = function (videoName) {
    var matches = _.filter($scope.videos, function (video) {
      return videoName === video.key
    });

    if (matches) {
      return matches[0];
    }

    return {};
  };

  $scope.getLessonForVideo = function (lessonName) {
    var matches = _.filter($scope.lessons, function (lesson) {
      return lessonName === lesson.name;
    });

    if (matches) {
      return matches[0];
    } else {
      console.log("didn't find a lesson for this video");
      return {};
    }
  };

  $scope.getVideosForLesson = function (lesson) {
    var videos = [];

    for (var i = 0; i < lesson.videos.length; i++) {
      var fullVideo = $scope.getVideoByName(lesson.videos[i]);

      if (fullVideo.key === $scope.currentlyShowingVideo.key) {
        fullVideo.current = true;
      }

      videos.push(fullVideo);
    }

    return videos;
  };

  $scope.findNextLessonVideo = function () {
    var videosForLesson = $scope.getVideosForLesson($scope.currentLesson);
    if (!videosForLesson) {
      return {};
    }

    for (var i = 0; i < videosForLesson.length; i++) {
      if (videosForLesson[i].current) {
        return videosForLesson[i + 1];
      }
    }
  };

  $scope.findPreviousLessonVideo = function () {
    var videosForLesson = $scope.getVideosForLesson($scope.currentLesson);
    if (!videosForLesson) {
      return {};
    }

    for (var i = 0; i < videosForLesson.length; i++) {
      if (videosForLesson[i].current) {
        return videosForLesson[i - 1];
      }
    }
  };

  // We use promises to as callbacks for when the HTTP call returns from the service
  var videosPromise = $q.defer();
  var lessonPromise = $q.defer();

  // $q.all simply waits until all of the specified HTTP requests have completed
  var all = $q.all([videosPromise.promise, lessonPromise.promise]);

  // this is the promise callback.  this gets called when both the video and lesson HTTP calls return
  all.then(function (promiseData) {
    $scope.videos = promiseData[0];
    $scope.lessons = promiseData[1];
    $scope.currentlyShowingVideo = $scope.getVideoByName($stateParams["videoName"]);

    if ($stateParams["lesson"]) {
      $scope.currentLesson = $scope.getLessonForVideo($stateParams["lesson"]);
      $scope.relatedVideos = $scope.getVideosForLesson($scope.currentLesson);

      if ($scope.findNextLessonVideo()) {
        $scope.nextVideoLessonName = $scope.findNextLessonVideo().title;
        $scope.nextVideoLessonUrlName = $scope.findNextLessonVideo().key;
      }

      if ($scope.findPreviousLessonVideo()) {
        $scope.previousVideoLessonName = $scope.findPreviousLessonVideo().title;
        $scope.previousVideoLessonUrlName = $scope.findPreviousLessonVideo().key;
      }
    }

    $scope.addVideoPlayer();
    console.log("all done!!!!  videos: " + $scope.videos.length + "  lessons: " + $scope.lessons.length);
  });

  $http.get('rest/videos1.json').success(function (data) {
    videosPromise.resolve(data);
  }).error(function () {
    alert("There was a problem retrieving the videos");
  });

  $http.get('rest/lessons1.json').success(function (lessonData) {
    lessonPromise.resolve(lessonData);
  }).error(function () {
    alert("There was a problem retrieving the lesson");
  });
});