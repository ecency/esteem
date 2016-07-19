// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('steem', ['ionic', 'steem.controllers', 'steem.services', 'ngStorage', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $localStorage) {
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
    /*var ws = new WebSocket('wss://this.piston.rocks');

    ws.onopen = function () {
        console.log('open');
        this.send("{" +
                                "\"jsonrpc\": \"2.0\", " +
                                "\"method\": \"get_discussions_by_trending\", " +
                                "\"params\": [{\"tag\": \"\", \"limit\": 20, " +
                                "\"filter_tags\": []}], \"id\": 1" +
                        "}");         // transmit "hello" after connecting
    };

    ws.onmessage = function (event) {
        console.log(event.data);    // will be "hello"
        $rootScope.posts = event.data;
        this.close();
    };

    ws.onerror = function () {
        console.log('error occurred!');
    };

    ws.onclose = function (event) {
        console.log('close code=' + event.code);
    };*/
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

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
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
