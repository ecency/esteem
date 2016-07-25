// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('steem', ['ionic', 'steem.controllers', 'steem.services', 'ngStorage', 'ngCordova', 'ionic.contrib.ui.ionThread'])

.run(function($ionicPlatform, $rootScope, $localStorage, MyService, $interval, $ionicPopup) {
  $rootScope.$storage = $localStorage;
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    /*var reconnect = $interval(function() {
      MyService.getStats().then(function(dd){
        console.log(dd.head_block_number);
      });
    }, 5000);*/
    $rootScope.showAlert = function(title, msg) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: msg
      });
      return alertPopup/*.then(function(res) {
        console.log('Thank you ...');
      });*/
    };
  });

})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html'
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html'
      }
    }
  })

  .state('app.posts', {
    url: '/posts',
    views: {
      'menuContent': {
        templateUrl: 'templates/posts.html',
        controller: 'PostsCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/single',
    views: {
      'menuContent': {
        templateUrl: 'templates/post.html',
        controller: 'PostCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/posts');
  $ionicConfigProvider.navBar.alignTitle('left')
})
/*.config( ['$compileProvider',function( $compileProvider ){ 
     $compileProvider.imgSrcSanitizationWhitelist(/^\s(https|file|blob|cdvfile):|data:image\//);
   }
 ])*/
;
