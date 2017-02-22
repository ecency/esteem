var fs = require('fs');

var app = angular.module('steem', [
	'ionic',
	'ngStorage',
	'ngCordova',
  'rzModule',
  'ion-floating-menu',
  'pascalprecht.translate',
  'ja.qr'
]);

if (localStorage.getItem("socketUrl") === null) {
  localStorage.setItem("socketUrl", "wss://steemd.steemit.com");
} else if (localStorage.getItem("socketUrl") == "wss://steemit.com/wspa") {
  localStorage.socketUrl="wss://steemd.steemit.com";
}

window.steemRPC = require("steem-rpc");
window.Api = window.steemRPC.Client.get({url:localStorage.socketUrl}, true);
window.steemJS = require("steemjs-lib");
window.golosJS = require("golosjs-lib");
window.diff_match_patch = require('diff-match-patch');
window.getSymbol = require('currency-symbol-map');

require('./config')(app);
require('./services')(app);
require('./controllers')(app);


app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $sceDelegateProvider, $logProvider, $compileProvider, $animateProvider, $translateProvider) {
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

  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        //templateUrl: 'templates/settings.html'
        template: fs.readFileSync(__dirname + '/templates/about.html', 'utf8')
      }
    }
  })

	.state('app.market', {
		url: '/market',
		views: {
			'menuContent': {
				//templateUrl: 'templates/settings.html'
				template: fs.readFileSync(__dirname + '/templates/market.html', 'utf8'),
				controller: 'MarketCtrl'
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
    url: '/posts/:tags/:renew',
    views: {
      'menuContent': {
        //templateUrl: 'templates/posts.html',
        template: fs.readFileSync(__dirname + '/templates/posts.html', 'utf8'),
        controller: 'PostsCtrl'
      }
    }
  })

  .state('app.bookmark', {
    url: '/bookmark',
    views: {
      'menuContent': {
        //templateUrl: 'templates/post.html',
        template: fs.readFileSync(__dirname + '/templates/bookmarks.html', 'utf8'),
        controller: 'BookmarkCtrl'
      }
    }
  })

	.state('app.drafts', {
    url: '/drafts',
    views: {
      'menuContent': {
        //templateUrl: 'templates/post.html',
        template: fs.readFileSync(__dirname + '/templates/drafts.html', 'utf8'),
        controller: 'DraftsCtrl'
      }
    }
  })

	.state('app.images', {
    url: '/images',
    views: {
      'menuContent': {
        //templateUrl: 'templates/post.html',
        template: fs.readFileSync(__dirname + '/templates/images.html', 'utf8'),
        controller: 'ImagesCtrl'
      }
    }
  })

  .state('app.notifications', {
    url: '/notifications',
    views: {
      'menuContent': {
        //templateUrl: 'templates/post.html',
        template: fs.readFileSync(__dirname + '/templates/notifications.html', 'utf8'),
        controller: 'NotificationsCtrl'
      }
    }
  })


  .state('app.post', {
    url: '/post/:category/:author/:permlink',
    views: {
      'menuContent': {
        //templateUrl: 'templates/post.html',
        template: fs.readFileSync(__dirname + '/templates/post.html', 'utf8'),
        controller: 'PostCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/posts//');
  $ionicConfigProvider.navBar.alignTitle('left')
  $ionicConfigProvider.backButton.text('').icon('ion-chevron-left');
  $ionicConfigProvider.views.swipeBackEnabled(false);
  $ionicConfigProvider.views.maxCache(2);

  $animateProvider.classNameFilter( /\banimated\b/ );
  $ionicConfigProvider.scrolling.jsScrolling(false);

  if (window.cordova) {
      $logProvider.debugEnabled(false);
      $compileProvider.debugInfoEnabled(false);
  }

  $translateProvider.translations('en-US', require('./locales/en')); //English
  $translateProvider.translations('ru-RU', require('./locales/ru-RU')); //Russian
  $translateProvider.translations('de-DE', require('./locales/de-DE')); //German
  $translateProvider.translations('fr-FR', require('./locales/fr-FR')); //French
  $translateProvider.translations('es-ES', require('./locales/es-ES')); //Spanish
  $translateProvider.translations('el-GR', require('./locales/el-GR')); //Greek
  $translateProvider.translations('bg-BG', require('./locales/bg-BG')); //Bulgarian
  $translateProvider.translations('nl-NL', require('./locales/nl-NL')); //Dutch
  $translateProvider.translations('hu-HU', require('./locales/hu-HU')); //Hungarian
  $translateProvider.translations('cs-CZ', require('./locales/cs-CZ')); //Czech
  $translateProvider.translations('he-IL', require('./locales/he-IL')); //Hebrew
  $translateProvider.translations('pl-PL', require('./locales/pl-PL')); //Polish
  $translateProvider.translations('pt-PT', require('./locales/pt-PT')); //Portuguese
  $translateProvider.translations('pt-BR', require('./locales/pt-BR')); //Portuguese Brazil
  $translateProvider.translations('id-ID', require('./locales/id-ID')); //Indonesian
  $translateProvider.translations('zh-TW', require('./locales/zh-TW')); //Chinese traditional
  $translateProvider.translations('zh-CN', require('./locales/zh-CN')); //Chinese simplified
  $translateProvider.translations('dolan', require('./locales/dol')); //Dolan
  $translateProvider.translations('sv-SE', require('./locales/sv-SE')); //Chinese simplified

  $translateProvider.useSanitizeValueStrategy(null);

  $translateProvider.preferredLanguage('en-US');
  $translateProvider.fallbackLanguage('en-US');

});

app.run(function($ionicPlatform, $rootScope, $localStorage, $interval, $ionicPopup, $ionicLoading, $cordovaSplashscreen, $ionicModal, $timeout, $cordovaToast, APIs, $state, $log, $ionicScrollDelegate, $filter, $translate) {
  $rootScope.$storage = $localStorage;
  $rootScope.log = function(message) {
    $log.info(message);
  };
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
    if (!$rootScope.$storage.users) {
      $rootScope.$storage.users = [];
    }
    
    if (!$rootScope.$storage.socketgolos)
      $rootScope.$storage.socketgolos = "wss://ws.golos.io/";
    if (!$rootScope.$storage.socketsteem)
      $rootScope.$storage.socketsteem = "wss://steemd.steemit.com";


    if (!angular.isDefined($rootScope.$storage.language)) {
      if(typeof navigator.globalization !== "undefined") {
          navigator.globalization.getPreferredLanguage(function(language) {
              $translate.use(language.value).then(function(data) {
                  console.log("SUCCESS -> " + data);
                  if (language.value.indexOf("en") == 0) {
                    $rootScope.$storage.language = 'en';            
                  }
                  $rootScope.$storage.language = language.value;
              }, function(error) {
                  console.log("ERROR -> " + error);
              });
          }, null);
      } else {
        $rootScope.$storage.language = 'en';
      }
    } else {
      $translate.use($rootScope.$storage.language);
    }
    if (!$rootScope.$storage.chain){
      $rootScope.$storage.platformname = "Steem";
      $rootScope.$storage.platformpower = "Steem Power";
      $rootScope.$storage.platformsunit = "Steem";
      $rootScope.$storage.platformdollar = "Steem Dollar";
      $rootScope.$storage.platformdunit = "SBD";
      $rootScope.$storage.platformpunit = "SP";
      $rootScope.$storage.platformlunit = "STEEM";
      $rootScope.$storage.chain = "steem";
      $rootScope.$storage.currency = "usd";
      $rootScope.$storage.currencyRate = 1;
    }
    $rootScope.$storage.languages = [
      {id:'en', name: 'English'}, 
      {id:'es-ES', name: 'Español'}, 
      {id:'el-GR', name: 'Ελληνικά'}, 
      {id:'fr-FR', name: 'Français'}, 
      {id:'de-DE', name: 'Deutsch'}, 
      {id:'ru-RU', name: 'Русский'}, 
      {id:'bg-BG', name: 'Български'}, 
      {id:'nl-NL', name: 'Nederlands'}, 
      {id:'hu-HU', name: 'Magyar'}, 
      {id:'cs-CZ', name: 'Čeština'}, 
      {id:'he-IL', name: 'עברית‎'}, 
      {id:'pl-PL', name: 'Polski‎'}, 
      {id:'pt-PT', name: 'Português'}, 
      {id:'pt-BR', name: 'Português BR'},
      {id:'sv-SE', name: 'Svensk'},
      {id:'id-ID', name: 'Bahasa Indonesia'}, 
      {id:'zh-CN', name: '繁體中文'}, 
      {id:'zh-TW', name: '简体中文'},
      {id:'dolan', name: 'Dolan'}
    ];

    $rootScope.$storage.chains = [{id:'steem', name: 'Steem'}, {id:'golos', name: 'Golos'}];

    if (!$rootScope.$storage.currencies) {
      $rootScope.$storage.currencies = [
        {id:'btc', name: 'BTC', rate: 0, date: "1/1/2016"}, 
        {id:'usd', name: 'USD', rate: 0, date: "1/1/2016"}, 
        {id:'eur', name: 'EUR', rate: 0, date: "1/1/2016"}, 
        {id:'rub', name: 'RUB', rate: 0, date: "1/1/2016"}, 
        {id:'gbp', name: 'GBP', rate: 0, date: "1/1/2016"}, 
        {id:'jpy', name: 'JPY', rate: 0, date: "1/1/2016"}, 
        {id:'krw', name: 'KRW', rate: 0, date: "1/1/2016"}, 
        {id:'inr', name: 'INR', rate: 0, date: "1/1/2016"}, 
        {id:'cny', name: 'CNY', rate: 0, date: "1/1/2016"}, 
        {id:'uah', name: 'UAH', rate: 0, date: "1/1/2016"}, 
        {id:'sek', name: 'SEK', rate: 0, date: "1/1/2016"}, 
        {id:'try', name: 'TRY', rate: 0, date: "1/1/2016"}
      ];
    }

    if (window.cordova) {
      if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
        MobileAccessibility.isVoiceOverRunning(function(bool) {
          if (bool) {
              $rootScope.log("Screen reader: ON");
              $rootScope.voiceOver = bool;
              //$ionicConfigProvider.navBar.alignTitle('center');
          } else {
              $rootScope.log("Screen reader: OFF");
              $rootScope.voiceOver = bool;
              //$ionicConfigProvider.navBar.alignTitle('left');
          }
        });

      } else {
        $rootScope.voiceOver = false;
      }
    } else {
      $rootScope.voiceOver = false;
    }

    if (!$rootScope.$storage.view) {
      $rootScope.$storage.view = 'compact';
    }
    if (!$rootScope.$storage.filter) {
      $rootScope.$storage.filter = "trending";
    }
    if (navigator.splashscreen) {
      setTimeout(function() {
        navigator.splashscreen.hide();
      }, 1000);
    }
    $rootScope.log("app start ready");
    setTimeout(function() {
      if ($rootScope.$storage.pincode) {
        $rootScope.pincheck = true;
        $rootScope.$broadcast("pin:check");
      }
    }, 1000);
    $rootScope.showAlert = function(title, msg) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: msg
      });
      if (msg.indexOf("error")>-1) {
        //window.Api.initPromise.then(function(response) {
        $rootScope.log("broadcast error");
        //});
      }
      return alertPopup/*.then(function(res) {
        $rootScope.log('Thank you ...');
      });*/
    };
    $rootScope.showMessage = function(title, msg) {
      if (title) {
        if (window.cordova) {
          $cordovaToast.showLongBottom(title+": "+msg).then(function(success) {
            // success
            $rootScope.log("toast"+success);
          }, function (error) {
            // error
            $rootScope.log("toast"+error);
          });
        } else {
          $rootScope.showAlert(title, msg);
        }
      }
    };
    $rootScope.$on('show:loading', function(event, args){
      $rootScope.log('show:loading');
      $ionicLoading.show({
        noBackdrop : true,
        template: '<ion-spinner icon="ripple" class="spinner-energized"></ion-spinner>'
      });
    });
    $rootScope.$on('hide:loading', function(event, args){
      $rootScope.log('hide:loading');
      setTimeout(function() {
        $ionicLoading.hide();
      }, 1000);
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      $rootScope.log("from "+fromState.name+" to "+toState.name);
    });

    $ionicPlatform.on('resume', function(){
      $rootScope.log("app resume");
      var steemRPC = require("steem-rpc");
      if (localStorage.getItem("socketUrl") === null) {
        localStorage.setItem("socketUrl", "wss://steemd.steemit.com");
      }
      window.Api = steemRPC.Client.get({url:localStorage.socketUrl}, true);
      window.steemJS = require("steemjs-lib");
      window.golosJS = require("golosjs-lib");

      //if (!angular.isDefined($rootScope.timeint)) {
      window.Api.initPromise.then(function(response) {
        $rootScope.log("Api ready state change: "+angular.toJson(response));
        $rootScope.timeint = $interval(function(){
          window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(response){
            $rootScope.log("get_dynamic_global_properties " + response.head_block_number);
          });
        }, 15000);
      });
      //}
      window.FirebasePlugin.onNotificationOpen(function(data) {
        $rootScope.log(angular.toJson(data));
        if(data.tap){
          //Notification was received on device tray and tapped by the user.
          //console.log(JSON.stringify(data));
          if (data.author && data.permlink) {
            if (!$rootScope.$storage.pincode) {

              var alertPopup = $ionicPopup.confirm({
                title: data.title,
                template: data.body + $filter('translate')('OPENING_POST')
              });

              alertPopup.then(function(res) {
                $rootScope.log('Thank you for seeing alert from tray');
                if (res) {
                  setTimeout(function() {
                    $rootScope.getContentAndOpen({author:data.author, permlink:data.permlink});
                  }, 10);
                } else {
                  $rootScope.log("not sure to open alert");
                }
              });

            } else {
              $rootScope.$storage.notifData = {title:data.title, body: data.body, author: data.author, permlink: data.permlink};
              $rootScope.pinenabled = true;
            }
          }
        } else{
          //Notification was received in foreground. Maybe the user needs to be notified.
          //alert( JSON.stringify(data) );
          if (data.author && data.permlink) {
            $rootScope.showMessage(data.title, data.body+" "+data.permlink);
          } else {
            $rootScope.showMessage(data.title, data.body);
          }
        }
      }, function(error) {
          console.error(error);
      });

      if ($rootScope.$storage.pincode) {
        $rootScope.pincheck = true;
        $rootScope.$broadcast("pin:check");
      }

      if (window.cordova) {
        if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {

          MobileAccessibility.isVoiceOverRunning(function(bool) {
            if (bool) {
                $rootScope.log("Screen reader: ON");
                $rootScope.voiceOver = bool;
                //$ionicConfigProvider.navBar.alignTitle('center');
            } else {
                $rootScope.log("Screen reader: OFF");
                $rootScope.voiceOver = bool;
                //$ionicConfigProvider.navBar.alignTitle('left');
            }
          });
        } else {
          $rootScope.voiceOver = false;
        }
      } else {
        $rootScope.voiceOver = false;
      }

    });
    $ionicPlatform.on('pause', function(){
      $rootScope.log("app pause");
      if (angular.isDefined($rootScope.timeint)) {
        $rootScope.log("cancel interval");
        $interval.cancel($rootScope.timeint);
        $rootScope.timeint = undefined;
        window.Api.close();
      }
    });

    $ionicPlatform.on('offline', function(){
      $rootScope.log("app offline");
    });

    $rootScope.init = function() {
      $rootScope.passcode = "";
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    };

    $rootScope.add = function(value) {
      $rootScope.pinerror = "";
      if($rootScope.passcode.length < 4) {
        $rootScope.passcode = $rootScope.passcode + value;
        if($rootScope.passcode.length == 4) {
          $timeout(function() {
            $rootScope.log("PIN "+$rootScope.passcode);
            if ($rootScope.pintype == 3) {
              if ($rootScope.$storage.pincode == $rootScope.passcode) {
                $rootScope.passcode = "";
                $rootScope.closePin();
              } else {
                $rootScope.pintry += 1;
                $rootScope.pinerror = $filter('translate')('NOT_MATCH')+"("+$rootScope.pintry+")";
                if ($rootScope.pintry>3) {
                  $rootScope.$storage.pincode = undefined;
                  $rootScope.pintry = 0;
                  $rootScope.$broadcast("pin:failed");
                  $rootScope.closePin();
                }
              }
            }
            if ($rootScope.pintype == 0) {
              $rootScope.log("type 0: set pin");
              if ($rootScope.$storage.pincode) {
                $rootScope.pincheck = true;
                $rootScope.$broadcast("pin:check");
                $rootScope.closePin();
              } else {
                $rootScope.$storage.pincode = $rootScope.passcode;
                $rootScope.pinsubtitle = $filter('translate')('CONFIRM_PIN');
                $rootScope.passcode = "";
                $rootScope.pintype = 3;
                $rootScope.pintry = 0;
              }
            }
            if ($rootScope.pintype == 1) {
              $rootScope.log("type 1: check pin");
              if ($rootScope.$storage.pincode == $rootScope.passcode){
                $rootScope.$broadcast('pin:correct');
                $rootScope.passcode = "";
                $rootScope.closePin();
              } else {
                $rootScope.pintry += 1;
                $rootScope.pinerror = $filter('translate')('INCORRECT')+"("+$rootScope.pintry+")";
                if ($rootScope.pintry>3) {
                  $rootScope.$storage.$reset();
                  $rootScope.closePin();
                }
              }
            }

          }, 50);
        }
      }
    };

    $rootScope.delete = function() {
      $rootScope.pinerror = "";
      if($rootScope.passcode.length > 0) {
        $rootScope.passcode = $rootScope.passcode.substring(0, $rootScope.passcode.length - 1);
      }
    }

    $ionicModal.fromTemplateUrl('templates/pincode.html', {
      scope: $rootScope
    }).then(function(modal) {
      $rootScope.pinmodal = modal;
    });
    $rootScope.closePin = function() {
      $rootScope.pinmodal.hide();
      if ($rootScope.pinenabled) {
        if ($rootScope.$storage.notifData) {
          var alertPopup = $ionicPopup.confirm({
            title: $rootScope.$storage.notifData.title,
            template: $rootScope.$storage.notifData.body + $filter('translate')('OPENING_POST')
          });
          alertPopup.then(function(res) {
            $rootScope.log('Thank you for seeing alert from tray');
            if (res) {
              $rootScope.getContentAndOpen({author:$rootScope.$storage.notifData.author, permlink:$rootScope.$storage.notifData.permlink});
              $rootScope.$storage.notifData = undefined;
            } else {
              $rootScope.log("not sure to open alert");
              $rootScope.$storage.notifData = undefined;
            }
            $rootScope.pinenabled = false;
          });
        }
      }
    };
    $rootScope.openPin = function(type) {
      $rootScope.passcode = "";
      if (type == 0) {
        $rootScope.pintype = 0;
        $rootScope.pintitle = $filter('translate')('SET_PIN');
        $rootScope.pinsubtitle = $filter('translate')('SET_PIN');
      }
      if (type == 1) {
        $rootScope.pintype = 1;
        $rootScope.pintry = 0;
        $rootScope.pintitle = $filter('translate')('ENTER_PIN');
        $rootScope.pinsubtitle = $filter('translate')('ENTER_PIN');
      }
      $rootScope.pinmodal.show();
    };
    $rootScope.$on("pin:new", function(){
      $rootScope.pincheck = false;
      $rootScope.openPin(0);
    });
    $rootScope.$on("pin:check", function(){
      $rootScope.pincheck = true;
      $rootScope.openPin(1);
    });


    $ionicModal.fromTemplateUrl('templates/info.html', {
      scope: $rootScope
      //animation: "null"
    }).then(function(modal) {
      $rootScope.infomodal = modal;
    });
    $rootScope.openInfo = function(xx) {
      $rootScope.voters = xx;
      $rootScope.infomodal.show();
    };

    $rootScope.closeInfo = function() {
      $rootScope.infomodal.hide();
      //$rootScope.infomodal.remove();
    };

    String.prototype.replaceAt=function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
    }
		$rootScope.openDraft = function(item){
			item.operation_type = item.post_type;
			$rootScope.$storage.spost = item;
			$state.go('app.posts');
			$rootScope.$broadcast('openPostModal');
		}
    $rootScope.getContentAndOpen = function(item) {

      window.Api.initPromise.then(function(response) {
        window.Api.database_api().exec("get_content", [item.author, item.permlink]).then(function(result){
          var _len = result.active_votes.length;
          for (var j = _len - 1; j >= 0; j--) {
            if (result.active_votes[j].voter === $rootScope.$storage.user.username) {
              if (result.active_votes[j].percent > 0) {
                result.upvoted = true;
              } else if (result.active_votes[j].percent < 0) {
                result.downvoted = true;
              } else {
                result.downvoted = false;
                result.upvoted = false;
              }
            }
          }
          result.json_metadata = angular.fromJson(result.json_metadata);
          var item = result;
          $rootScope.$storage.sitem = item;
          setTimeout(function() {
            //$state.go('app.post');
            $state.go('app.post', {category: item.category, author: item.author, permlink: item.permlink});

          }, 5);

          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        });
      });
      $rootScope.$broadcast('hide:loading');
    };

    $rootScope.reBlog = function(author, permlink) {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('REBLOG_TEXT')
      });
      confirmPopup.then(function(res) {
        if(res) {
          $rootScope.log('You are sure');
          $rootScope.$broadcast('show:loading');
          if ($rootScope.$storage.user) {
              $rootScope.mylogin = new window[$rootScope.$storage.chain+"JS"].Login();
              $rootScope.mylogin.setRoles(["posting"]);
              var loginSuccess = $rootScope.mylogin.checkKeys({
                  accountName: $rootScope.$storage.user.username,
                  password: $rootScope.$storage.user.password || null,
                  auths: {
                      posting: $rootScope.$storage.user.posting.key_auths
                  },
                  privateKey: $rootScope.$storage.user.privatePostingKey || null
                }
              );
              if (loginSuccess) {
                var tr = new window[$rootScope.$storage.chain+"JS"].TransactionBuilder();
                var json;

                json = ["reblog",{account:$rootScope.$storage.user.username, author:author, permlink:permlink}];

                tr.add_type_operation("custom_json", {
                  id: 'follow',
                  required_posting_auths: [$rootScope.$storage.user.username],
                  json: JSON.stringify(json)
                });
                localStorage.error = 0;
                tr.process_transaction($rootScope.mylogin, null, true);

                setTimeout(function() {
                  if (localStorage.error == 1) {
                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('REBLOG_TEXT')+" "+localStorage.errormessage)
                  } else {
                    //$scope.refreshFollowers();
                    $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('REBLOGGED_POST'));
                  }
                  $rootScope.$broadcast('hide:loading');
                }, 3000);
              } else {
                $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL'));
              }
            $rootScope.$broadcast('hide:loading');
          } else {
            $rootScope.$broadcast('hide:loading');
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
          }
        } else {
          $rootScope.log('You are not sure');
        }
      });
    };

    $rootScope.votePost = function(post, type, afterward) {
      post.invoting = true;
      var tt = 1;
      if (type === "upvote") {
        tt = 1;
      }
      if (type === "downvote") {
        tt = -1;
      }
      if (type === "unvote") {
        tt = 0;
      }
      $rootScope.log('voting '+tt);

      if ($rootScope.$storage.user) {
        window.Api.initPromise.then(function(response) {
          $rootScope.log("Api ready:" + angular.toJson(response));
          $rootScope.mylogin = new window[$rootScope.$storage.chain+"JS"].Login();
          $rootScope.mylogin.setRoles(["posting"]);
          var loginSuccess = $rootScope.mylogin.checkKeys({
              accountName: $rootScope.$storage.user.username,
              password: $rootScope.$storage.user.password || null,
              auths: {
                  posting: $rootScope.$storage.user.posting.key_auths
              },
              privateKey: $rootScope.$storage.user.privatePostingKey || null
            }
          );
          if (loginSuccess) {
            var tr = new window[$rootScope.$storage.chain+"JS"].TransactionBuilder();
            tr.add_type_operation("vote", {
                voter: $rootScope.$storage.user.username,
                author: post.author,
                permlink: post.permlink,
                weight: $rootScope.$storage.voteWeight*tt || 10000*tt
            });
            console.log(tr);
            localStorage.error = 0;
            tr.process_transaction($rootScope.mylogin, null, true);
            setTimeout(function() {
              post.invoting = false;
              if (localStorage.error == 1) {
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
              } else {
								if (tt>0){
									post.upvoted = true;
								} else if (tt<0) {
									post.downvoted = true;
								} else {
									post.upvoted = false;
									post.downvoted = false;
								}
                if (afterward === 'fetchContent') {
                  $rootScope.$broadcast(afterward, { any: {author: post.author, permlink: post.permlink} });
                } else {
                  $rootScope.$broadcast(afterward);
                }
              }
              $rootScope.$broadcast('hide:loading');

            }, 3000);
          } else {
            $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL'));
            $rootScope.$broadcast('hide:loading');
            post.invoting = false;
          }
          $rootScope.$broadcast('hide:loading');
          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        });
      } else {
        $rootScope.$broadcast('hide:loading');
        post.invoting = false;
        $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
      }
    };

    $rootScope.isWitnessVoted = function() {
      if ($rootScope.$storage.user && $rootScope.$storage.user.witness_votes.indexOf("good-karma")>-1) {
        return true;
      } else {
        return false;
      }
    };
    $rootScope.voteWitness = function() {
        var confirmPopup = $ionicPopup.confirm({
          title: $filter('translate')('ARE_YOU_SURE'),
          template: $filter('translate')('VOTE_FOR_WITNESS')+" @good-karma"
        });
        confirmPopup.then(function(res) {
          if(res) {
            $rootScope.log('You are sure');
            $rootScope.$broadcast('show:loading');
            if ($rootScope.$storage.user) {
              if ($rootScope.$storage.user.password || $rootScope.$storage.user.privateActiveKey) {
                $rootScope.mylogin = new window[$rootScope.$storage.chain+"JS"].Login();
                $rootScope.mylogin.setRoles(["active"]);
                var loginSuccess = $rootScope.mylogin.checkKeys({
                    accountName: $rootScope.$storage.user.username,
                    password: $rootScope.$storage.user.password || null,
                    auths: {
                        active: $rootScope.$storage.user.active.key_auths
                    },
                    privateKey: $rootScope.$storage.user.privateActiveKey || null
                  }
                );
                if (loginSuccess) {
                  var tr = new window[$rootScope.$storage.chain+"JS"].TransactionBuilder();
                  tr.add_type_operation("account_witness_vote", {
                      account: $rootScope.$storage.user.username,
                      approve: true,
                      witness: "good-karma"
                  });
                  localStorage.error = 0;

                  tr.process_transaction($rootScope.mylogin, null, true);

                  setTimeout(function() {
                    if (localStorage.error === 1) {
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                    } else {
                      //$scope.refreshFollowers();
                      $rootScope.showMessage($filter('translate')('SUCCESS'),$filter('translate')('VOTED_FOR_WITNESS')+' @good-karma');
                      $rootScope.$broadcast('refreshLocalUserData');
                    }
                  }, 3000);
                } else {
                  $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL'));
                }
              } else {
                $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL'));
              }
              $rootScope.$broadcast('hide:loading');
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
            }
          } else {
            $rootScope.log('You are not sure');
          }
        });
    };

    $rootScope.following = function(xx, mtype) {
      $rootScope.$broadcast('show:loading');
      $rootScope.log(xx);
      if ($rootScope.$storage.user) {
          $rootScope.mylogin = new window[$rootScope.$storage.chain+"JS"].Login();
          $rootScope.mylogin.setRoles(["posting"]);
          var loginSuccess = $rootScope.mylogin.checkKeys({
              accountName: $rootScope.$storage.user.username,
              password: $rootScope.$storage.user.password || null,
              auths: {
                  posting: $rootScope.$storage.user.posting.key_auths
              },
              privateKey: $rootScope.$storage.user.privatePostingKey || null
            }
          );
          if (loginSuccess) {
            var tr = new window[$rootScope.$storage.chain+"JS"].TransactionBuilder();
            var json;
            if (mtype === "follow") {
              json = ['follow',{follower:$rootScope.$storage.user.username, following:xx, what: ["blog"]}];
            } else {
              json = ['follow',{follower:$rootScope.$storage.user.username, following:xx, what: []}];
            }

            tr.add_type_operation("custom_json", {
              id: 'follow',
              required_posting_auths: [$rootScope.$storage.user.username],
              json: angular.toJson(json)
            });
            localStorage.error = 0;
            tr.process_transaction($rootScope.mylogin, null, true);

            setTimeout(function() {
              if (localStorage.error == 1) {
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
              } else {
                //$scope.refreshFollowers();
                $rootScope.$broadcast('current:reload');
              }
            }, 3000);
          } else {
            $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL'));
          }
        $rootScope.$broadcast('hide:loading');
      } else {
        $rootScope.$broadcast('hide:loading');
        $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
      }
    };

    setTimeout(function() {
      window.Api.initPromise.then(function(response) {
        window.Api.database_api().exec("get_feed_history", []).then(function(r){
        //$rootScope.log(r);
          $rootScope.$storage.base = r.current_median_history.base.split(" ")[0];
          window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(r){
            $rootScope.log(r);
            $rootScope.$storage.steem_per_mvests = (Number(r.total_vesting_fund_steem.substring(0, r.total_vesting_fund_steem.length - 6)) / Number(r.total_vesting_shares.substring(0, r.total_vesting_shares.length - 6))) * 1e6;
          });
        });
      });
    }, 10);
    if (!angular.isDefined($rootScope.$storage.notifications)) {
      $rootScope.$storage.notifications = [];
    }
    $rootScope.$on('changedChain', function(){
      console.log('changeCHain');
      if ($rootScope.$storage.chain == 'steem'){
        $rootScope.$storage.platformname = "Steem";
        $rootScope.$storage.platformpower = "Steem Power";
        $rootScope.$storage.platformsunit = "Steem";
        $rootScope.$storage.platformdollar = "Steem Dollar";
        $rootScope.$storage.platformdunit = "SBD";
        $rootScope.$storage.platformpunit = "SP";
        $rootScope.$storage.platformlunit = "STEEM";
        $rootScope.$storage.socketsteem = "wss://steemd.steemit.com";
      } else {
        $rootScope.$storage.platformname = "ГОЛОС";
        $rootScope.$storage.platformpower = "СИЛА ГОЛОСА";
        $rootScope.$storage.platformsunit = "Голос";
        $rootScope.$storage.platformdollar = "ЗОЛОТОЙ";
        $rootScope.$storage.platformdunit = "GBG";
        $rootScope.$storage.platformpunit = "СИЛА ГОЛОСА";
        $rootScope.$storage.platformlunit = "ГОЛОС";
        $rootScope.$storage.socketgolos = "wss://ws.golos.io/";
        //$scope.socket = "wss://golos.steem.ws";
      }
      localStorage.socketUrl = $rootScope.$storage["socket"+$rootScope.$storage.chain];
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });
    function checkDate(date, ignore) {
      var eold = 86400000; //1 * 24 * 60 * 60 * 1000; //1 day old
      var now = new Date().getTime();
      var old = new Date(date).getTime();
      return ignore||now-old>=eold;
    }
    $rootScope.$on('changedCurrency', function(event, args){
      var xx = args.currency;
      var ignore = args.enforce;
      console.log(xx);
      var resultObject = $rootScope.$storage.currencies.filter(function ( obj ) {
          return obj.id === xx;
      })[0];
      //searchObj(xx, $rootScope.$storage.currencies);
      if (checkDate(resultObject.date, ignore)) {
        if ($rootScope.$storage.chain == 'steem'){
          APIs.getCurrencyRate("USD", xx ).then(function(res){
            $rootScope.$storage.currencyRate = Number(res.data.query.results.rate.Rate);
            $rootScope.$storage.currencies.filter(function(obj){
              if (obj.id == xx) {
                obj.rate = $rootScope.$storage.currencyRate;
                obj.date = res.data.query.results.rate.Date==="N/A"?new Date() : res.data.query.results.rate.Date;
              }
            });
          });
        } else {
          APIs.getCurrencyRate("XAU", xx ).then(function(res){
            //XAU - 31.1034768g
            //GBG rate in mg. so exchangeRate/31103.4768
            $rootScope.$storage.currencyRate = Number(res.data.query.results.rate.Rate)/31103.4768;
            $rootScope.$storage.currencies.filter(function(obj){
              if (obj.id == xx) {
                obj.rate = $rootScope.$storage.currencyRate;
                obj.date = res.data.query.results.rate.Date==="N/A"?new Date() : res.data.query.results.rate.Date;
              }
            });
            //console.log($rootScope.$storage.currencyRate);
          });
        }
      } else {
        $rootScope.$storage.currencyRate = resultObject.rate;
      }
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });

    if (window.cordova) {
      if (!ionic.Platform.isWindowsPhone()) {
        if (ionic.Platform.isIOS() || ionic.Platform.isIPad()) {
          //window.FirebasePlugin.grantPermission();
        }

        /*window.FirebasePlugin.getToken(function(token) {
            // save this server-side and use it to push notifications to this device
            $rootScope.log("device "+token);
            $rootScope.$storage.deviceid = token;
            if ($rootScope.$storage.user) {
              APIs.saveSubscription(token, $rootScope.$storage.user.username, { device: ionic.Platform.platform() }).then(function(res){
                $rootScope.log(angular.toJson(res));
              });
            } else {
              APIs.saveSubscription(token, "", { device: ionic.Platform.platform() }).then(function(res){
                $rootScope.log(angular.toJson(res));
              });
            }
        }, function(error) {
            console.error(error);
        });*/

        FCMPlugin.getToken(function(token){
          // save this server-side and use it to push notifications to this device
          $rootScope.log("device "+token);
          $rootScope.$storage.deviceid = token;
          if ($rootScope.$storage.user) {
            APIs.saveSubscription(token, $rootScope.$storage.user.username, { device: ionic.Platform.platform() }).then(function(res){
              $rootScope.log(angular.toJson(res));
            });
          } else {
            APIs.saveSubscription(token, "", { device: ionic.Platform.platform() }).then(function(res){
              $rootScope.log(angular.toJson(res));
            });
          }
        });

        /*window.FirebasePlugin.onTokenRefresh(function(token) {
          APIs.updateToken($rootScope.$storage.deviceid, token).then(function(res){
            console.log(angular.toJson(res));
            if (res.status) {
              $rootScope.$storage.deviceid = token  
            }
          });
          if (!$rootScope.$$phase){
            $rootScope.$apply();
          }
        }, function(error) {
          console.error(error);
        });*/
        FCMPlugin.onTokenRefresh(function(token){
          APIs.updateToken($rootScope.$storage.deviceid, token).then(function(res){
            console.log(angular.toJson(res));
            if (res.status) {
              $rootScope.$storage.deviceid = token  
            }
          });
          if (!$rootScope.$$phase){
            $rootScope.$apply();
          }
        });

        /*window.FirebasePlugin.onNotificationOpen(function(data) {
            $rootScope.log(angular.toJson(data));

            //console.log(angular.toJson(data));

            //$rootScope.$storage.notifications.push({title:data.title, message: data.body, author: data.author, permlink: data.permlink, created: new Date()});

            if(data.tap){
              //Notification was received on device tray and tapped by the user.
              if (data.author && data.permlink) {
                if (!$rootScope.$storage.pincode) {

                  var alertPopup = $ionicPopup.confirm({
                    title: data.title,
                    template: data.body + $filter('translate')('OPENING_POST')
                  });

                  alertPopup.then(function(res) {
                    $rootScope.log('Thank you for seeing alert from tray');
                    if (res) {
                      setTimeout(function() {
                        $rootScope.getContentAndOpen({author:data.author, permlink:data.permlink});
                      }, 10);
                    } else {
                      $rootScope.log("not sure to open alert");
                    }
                  });

                } else {
                  $rootScope.$storage.notifData = {title:data.title, body: data.body, author: data.author, permlink: data.permlink};
                  $rootScope.pinenabled = true;
                }
              }
            } else{
              //Notification was received in foreground. Maybe the user needs to be notified.
              //alert( JSON.stringify(data) );
              if (data.author && data.permlink) {
                $rootScope.showMessage(data.title, data.body+" "+data.permlink);
              } else {
                $rootScope.showMessage(data.title, data.body);
              }
            }
        }, function(error) {
            console.error(error);
        });
        */

        //FCMPlugin.onNotification( onNotificationCallback(data), successCallback(msg), errorCallback(err) )
        //Here you define your application behaviour based on the notification data.
        FCMPlugin.onNotification(function(data){
          $rootScope.log(angular.toJson(data));

            //console.log(angular.toJson(data));

            //$rootScope.$storage.notifications.push({title:data.title, message: data.body, author: data.author, permlink: data.permlink, created: new Date()});

            if(data.wasTapped){
              //Notification was received on device tray and tapped by the user.
              if (data.author && data.permlink) {
                if (!$rootScope.$storage.pincode) {

                  var alertPopup = $ionicPopup.confirm({
                    title: data.title,
                    template: data.body + $filter('translate')('OPENING_POST')
                  });

                  alertPopup.then(function(res) {
                    $rootScope.log('Thank you for seeing alert from tray');
                    if (res) {
                      setTimeout(function() {
                        $rootScope.getContentAndOpen({author:data.author, permlink:data.permlink});
                      }, 10);
                    } else {
                      $rootScope.log("not sure to open alert");
                    }
                  });

                } else {
                  $rootScope.$storage.notifData = {title:data.title, body: data.body, author: data.author, permlink: data.permlink};
                  $rootScope.pinenabled = true;
                }
              }
            } else{
              //Notification was received in foreground. Maybe the user needs to be notified.
              //alert( JSON.stringify(data) );
              if (data.author && data.permlink) {
                $rootScope.showMessage(data.title, data.body+" "+data.permlink);
              } else {
                $rootScope.showMessage(data.title, data.body);
              }
            }
        });
      }

    }

  });
});
