var fs = require('fs');

var app = angular.module('steem', [
	'ionic', 
	'ngStorage', 
	'ngCordova'
	//'ionic.contrib.ui.ionThread'
]);
var steemRPC = require("steem-rpc");
if (localStorage.getItem("socketUrl") === null) {
  localStorage.setItem("socketUrl", "wss://steemit.com/wspa");
}
window.Api = steemRPC.Client.get({url:localStorage.socketUrl}, true);
window.steemJS = require("steemjs-lib");

require('./services')(app);
require('./controllers')(app);

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    template: fs.readFileSync(__dirname + '/templates/menu.html', 'utf8'),
    //templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        //templateUrl: 'templates/settings.html'
        template: fs.readFileSync(__dirname + '/templates/settings.html', 'utf8'),
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.send', {
    url: '/send',
    views: {
      'menuContent': {
        //templateUrl: 'templates/settings.html'
        template: fs.readFileSync(__dirname + '/templates/send.html', 'utf8'),
        controller: 'SendCtrl'

      }
    }
  })

  .state('app.follow', {
    url: '/follow',
    views: {
      'menuContent': {
        //templateUrl: 'templates/follow.html',
        template: fs.readFileSync(__dirname + '/templates/follow.html', 'utf8'),
        controller: 'FollowCtrl'
      }
    }
  })


  .state('app.exchange', {
    url: '/exchange/:username',
    views: {
      'menuContent': {
      	template: fs.readFileSync(__dirname + '/templates/exchange.html', 'utf8'),
        //templateUrl: 'templates/exchange.html',
        controller: 'ExchangeCtrl'
      }
    }
  })

  .state('app.profile', {
    url: '/profile/:username',
    views: {
      'menuContent': {
        //templateUrl: 'templates/profile.html',
        template: fs.readFileSync(__dirname + '/templates/profile.html', 'utf8'),
        controller: "ProfileCtrl"
      }
    }
  })

  .state('app.posts', {
    url: '/posts',
    views: {
      'menuContent': {
        //templateUrl: 'templates/posts.html',
        template: fs.readFileSync(__dirname + '/templates/posts.html', 'utf8'),
        controller: 'PostsCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/single',
    views: {
      'menuContent': {
        //templateUrl: 'templates/post.html',
        template: fs.readFileSync(__dirname + '/templates/post.html', 'utf8'),
        controller: 'PostCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/posts');
  $ionicConfigProvider.navBar.alignTitle('left')
});

app.run(function($ionicPlatform, $rootScope, $localStorage, $interval, $ionicPopup, $ionicLoading, $cordovaSplashscreen) {
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
    setTimeout(function() {
      (new Steem(localStorage.socketUrl)).getCurrentMedianHistoryPrice(function(e,r){
        $rootScope.$storage.base = r.base.substring(r.base.length-4,-4);
        (new Steem(localStorage.socketUrl)).getDynamicGlobalProperties(function(e,r){
          $rootScope.$storage.steem_per_mvests = (Number(r.total_vesting_fund_steem.substring(0, r.total_vesting_fund_steem.length - 6)) / Number(r.total_vesting_shares.substring(0, r.total_vesting_shares.length - 6))) * 1e6;
        });
      });
    }, 10);
    if (!$rootScope.$storage.view) {
      $rootScope.$storage.view = 'compact';
    }
    if (!$rootScope.$storage.filter) {
      $rootScope.$storage.filter = "trending";
    }
    if (navigator.splashscreen) {
      navigator.splashscreen.hide();
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

    $rootScope.$on('show:loading', function(event, args){
      console.log('show:loading');
      $ionicLoading.show({
        noBackdrop : true,
        template: '<ion-spinner></ion-spinner>'
      });
    });
    $rootScope.$on('hide:loading', function(event, args){
      console.log('hide:loading');
      $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
      console.log(fromState, toState);
    });

  });
});