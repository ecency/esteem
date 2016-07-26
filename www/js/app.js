angular.module('steem', ['ionic', 'steem.controllers', 'steem.services', 'ngStorage', 'ngCordova', 'ionic.contrib.ui.ionThread', 'youtube-embed'])

.run(function($ionicPlatform, $rootScope, $localStorage, $interval, $ionicPopup) {
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
    if (!$rootScope.$storage.socket) {
      $rootScope.$storage.socket = "wss://steemit.com/wstmp3";  
    }
    
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

  .state('app.followers', {
    url: '/followers',
    views: {
      'menuContent': {
        templateUrl: 'templates/followers.html',
        controller: 'FollowersCtrl'
      }
    }
  })

  .state('app.following', {
    url: '/following',
    views: {
      'menuContent': {
        templateUrl: 'templates/following.html',
        controller: 'FollowingCtrl'
      }
    }
  })

  .state('app.profile', {
    url: '/profile/:username',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: "ProfileCtrl"
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
