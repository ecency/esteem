var fs = require('fs');

var app = angular.module('steem', [
	'ionic', 
	'ngStorage', 
	'ngCordova',
  'wiz.markdown',
  'rzModule',
  'ion-floating-menu',
  'ja.qr'
	//'ionic.contrib.ui.ionThread'
]);

if (localStorage.getItem("socketUrl") === null) {
  localStorage.setItem("socketUrl", "wss://steemit.com/wspa");
}

var steemRPC = require("steem-rpc");
window.Api = steemRPC.Client.get({url:localStorage.socketUrl}, true);
window.steemJS = require("steemjs-lib");
window.diff_match_patch = require('diff-match-patch');

require('./services')(app);
require('./controllers')(app);

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $sceDelegateProvider, $logProvider, $compileProvider, $animateProvider) {
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
    url: '/posts/:tags',
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

  .state('app.single', {
    url: '/single/:category/:author/:permlink',
    views: {
      'menuContent': {
        //templateUrl: 'templates/post.html',
        template: fs.readFileSync(__dirname + '/templates/post.html', 'utf8'),
        controller: 'PostCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/posts/');
  $ionicConfigProvider.navBar.alignTitle('left')
  $ionicConfigProvider.backButton.text('').icon('ion-chevron-left');
  $ionicConfigProvider.views.swipeBackEnabled(false);
  $ionicConfigProvider.views.maxCache(5);

  $animateProvider.classNameFilter( /\banimated\b/ );
  $ionicConfigProvider.scrolling.jsScrolling(false);
  
  if (window.cordova) {
      $logProvider.debugEnabled(false);
      $compileProvider.debugInfoEnabled(false);
  }
  //$sceDelegateProvider.resourceUrlWhitelist(['self', new RegExp('^(http[s]?):\/\/(w{3}.)?youtube\.com/.+$')]);
});

app.run(function($ionicPlatform, $rootScope, $localStorage, $interval, $ionicPopup, $ionicLoading, $cordovaSplashscreen, $ionicModal, $timeout, $cordovaToast, APIs, $state, $log, $ionicScrollDelegate) {
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
    };
   
    $rootScope.$on('show:loading', function(event, args){
      $rootScope.log('show:loading');
      $ionicLoading.show({
        noBackdrop : true,
        template: '<ion-spinner></ion-spinner>'
      });
    });
    $rootScope.$on('hide:loading', function(event, args){
      $rootScope.log('hide:loading');
      $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
      $rootScope.log("from "+fromState.name+" to "+toState.name);
    });

    $ionicPlatform.on('resume', function(){
      $rootScope.log("app resume");
      var steemRPC = require("steem-rpc");
      if (localStorage.getItem("socketUrl") === null) {
        localStorage.setItem("socketUrl", "wss://steemit.com/wspa");
      }
      window.Api = steemRPC.Client.get({url:localStorage.socketUrl}, true);
      window.steemJS = require("steemjs-lib");

      if (!angular.isDefined($rootScope.timeint)) {
        window.Api.initPromise.then(function(response) {
          $rootScope.log("Api ready state change: "+angular.toJson(response));
          $rootScope.timeint = $interval(function(){
            window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(response){
              $rootScope.log("get_dynamic_global_properties " + response.head_block_number);
            });
          }, 15000);
        });
      }
      if ($rootScope.$storage.pincode) {
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
                $rootScope.pinerror = "NOT MATCH"+"("+$rootScope.pintry+")"; 
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
                $rootScope.$broadcast("pin:check");
                $rootScope.closePin();
              } else {
                $rootScope.$storage.pincode = $rootScope.passcode;  
                $rootScope.pinsubtitle = "Confirm PIN";
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
                $rootScope.pinerror = "INCORRECT"+"("+$rootScope.pintry+")"; 
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
            template: $rootScope.$storage.notifData.body + ", opening post"
          });
          alertPopup.then(function(res) {
            $rootScope.log('Thank you for seeing alert from tray');
            if (res) {
              $rootScope.getContentAndOpen($rootScope.$storage.notifData.author, $rootScope.$storage.notifData.permlink);  
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
        $rootScope.pintitle = "Set PIN";
        $rootScope.pinsubtitle = "Set PIN";
      }
      if (type == 1) {
        $rootScope.pintype = 1;
        $rootScope.pintry = 0;
        $rootScope.pintitle = "Enter PIN";
        $rootScope.pinsubtitle = "Enter PIN";
      }
      $rootScope.pinmodal.show();
    };
    $rootScope.$on("pin:new", function(){
      $rootScope.openPin(0);
    });
    $rootScope.$on("pin:check", function(){
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

    $rootScope.getContentAndOpen = function(author, permlink) {
      window.Api.initPromise.then(function(response) {
        window.Api.database_api().exec("get_content", [author, permlink]).then(function(result){
          if (!err) {
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
            $rootScope.$storage.sitem = result;
            $state.go('app.single');
          }
          if (!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        });
      });
      $rootScope.$broadcast('hide:loading');
    };

    $rootScope.reBlog = function(author, permlink) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Are you sure?',
        template: 'Resteem is irreversible, do you want to continue?'
      });
      confirmPopup.then(function(res) {
        if(res) {
          $rootScope.log('You are sure');
          $rootScope.$broadcast('show:loading');
          if ($rootScope.$storage.user) {
              $rootScope.mylogin = new window.steemJS.Login();
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
                var tr = new window.steemJS.TransactionBuilder();
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
                    $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                  } else {
                    //$scope.refreshFollowers();
                    $rootScope.showMessage('Success', 'Reblogged post!');
                  }
                }, 3000);
              } else {
                $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
              }
            $rootScope.$broadcast('hide:loading');
          } else {
            $rootScope.$broadcast('hide:loading');
            $rootScope.showAlert("Warning", "Please, login to Reblog");
          }
        } else {
          $rootScope.log('You are not sure');
        }
      });
    };

    $rootScope.votePost = function(post, type, afterward) {
      //window.Api = window.steemWS.Client.get();
      //$rootScope.log(window.Api);
      //$rootScope.log(window.steemJS);

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
      $rootScope.$broadcast('show:loading');

      if ($rootScope.$storage.user) {
        window.Api.initPromise.then(function(response) {
          $rootScope.log("Api ready:" + angular.toJson(response));
          $rootScope.mylogin = new window.steemJS.Login();
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
            var tr = new window.steemJS.TransactionBuilder();
            tr.add_type_operation("vote", {
                voter: $rootScope.$storage.user.username,
                author: post.author,
                permlink: post.permlink,
                weight: $rootScope.$storage.voteWeight*tt || 10000*tt
            });
            localStorage.error = 0;
            tr.process_transaction($rootScope.mylogin, null, true);
            setTimeout(function() {
              post.invoting = false;
              if (localStorage.error == 1) {
                $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
              } else {
                $rootScope.$broadcast(afterward);  
              }
            }, 3000);
          } else {
            $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
            $rootScope.$broadcast('hide:loading');
            post.invoting = false;
          }
        });
        /*var wif = steem.auth.toWif($rootScope.$storage.user.username, $rootScope.$storage.user.password, 'posting');
        steem.broadcast.vote(wif, $rootScope.$storage.user.username, post.author, post.permlink, $rootScope.$storage.voteWeight*tt, function(err, result) {
            $rootScope.log(err, result);
        });*/
        $rootScope.$broadcast('hide:loading');
      } else {
        $rootScope.$broadcast('hide:loading');
        post.invoting = false;
        $rootScope.showAlert("Warning", "Please, login to Vote");
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
          title: 'Are you sure?',
          template: 'Voting for witness @good-karma'
        });
        confirmPopup.then(function(res) {
          if(res) {
            $rootScope.log('You are sure');
            $rootScope.$broadcast('show:loading');
            if ($rootScope.$storage.user) {
              if ($rootScope.$storage.user.password || $rootScope.$storage.user.privateActiveKey) {
                $rootScope.mylogin = new window.steemJS.Login();
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
                  var tr = new window.steemJS.TransactionBuilder();
                  tr.add_type_operation("account_witness_vote", {
                      account: $rootScope.$storage.user.username,
                      approve: true,
                      witness: "good-karma"
                  });
                  localStorage.error = 0;

                  tr.process_transaction($rootScope.mylogin, null, true);

                  setTimeout(function() {
                    if (localStorage.error === 1) {
                      $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                    } else {
                      //$scope.refreshFollowers();
                      $rootScope.showMessage("Success",'Voted for witness @good-karma');
                      $rootScope.$broadcast('refreshLocalUserData');
                    }
                  }, 3000);
                } else {
                  $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Active private key on Login if you have choosed Advanced mode.");
                }
              } else {
                $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Active private key on Login if you have choosed Advanced mode.");
              }
              $rootScope.$broadcast('hide:loading');
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert("Warning", "Please, login to Vote Witness");
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
          $rootScope.mylogin = new window.steemJS.Login();
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
            var tr = new window.steemJS.TransactionBuilder();
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
                $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
              } else {
                //$scope.refreshFollowers();
                $rootScope.$broadcast('current:reload');
              }
            }, 3000);
          } else {
            $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
          }
        $rootScope.$broadcast('hide:loading');
      } else {
        $rootScope.$broadcast('hide:loading');
        $rootScope.showAlert("Warning", "Please, login to Follow");
      }
    };

    setTimeout(function() {
      window.Api.initPromise.then(function(response) {
        window.Api.database_api().exec("get_feed_history", []).then(function(r){
        //$rootScope.log(r);
          $rootScope.$storage.base = r.current_median_history.base.split(" ")[0];
          window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(r){
            //$rootScope.log(r);
            $rootScope.$storage.steem_per_mvests = (Number(r.total_vesting_fund_steem.substring(0, r.total_vesting_fund_steem.length - 6)) / Number(r.total_vesting_shares.substring(0, r.total_vesting_shares.length - 6))) * 1e6;
          });
        });
      });
    }, 10);

    if (window.cordova) {
      if (!ionic.Platform.isWindowsPhone()) {

        window.FirebasePlugin.getInstanceId(function(token) {
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
        });

        window.FirebasePlugin.onNotificationOpen(function(data) {
            $rootScope.log(angular.toJson(data));
            //console.log(data.tap);
            if(data.tap){
              //Notification was received on device tray and tapped by the user.
              console.log(JSON.stringify(data));
              if (data.author && data.permlink) {
                if (!$rootScope.$storage.pincode) {

                  var alertPopup = $ionicPopup.confirm({
                    title: data.title,
                    template: data.body + ", opening post"
                  });

                  alertPopup.then(function(res) {
                    $rootScope.log('Thank you for seeing alert from tray');
                    if (res) {
                      setTimeout(function() {
                        $rootScope.getContentAndOpen(data.author, data.permlink);    
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
        //FCMPlugin.getToken( successCallback(token), errorCallback(err) );
        //Keep in mind the function will return null if the token has not been established yet.
        /*FCMPlugin.getToken(
          function(token){
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
          },
          function(err){
            $rootScope.log('error retrieving token: ' + err);
          }
        );


        //FCMPlugin.onNotification( onNotificationCallback(data), successCallback(msg), errorCallback(err) )
        //Here you define your application behaviour based on the notification data.
        FCMPlugin.onNotification(
          function(data){
            if(data.wasTapped){
              //Notification was received on device tray and tapped by the user.
              //alert( JSON.stringify(data) );
              if (data.author && data.permlink) {
                if (!$rootScope.$storage.pincode) {

                  var alertPopup = $ionicPopup.confirm({
                    title: data.title,
                    template: data.body + ", opening post"
                  });

                  alertPopup.then(function(res) {
                    $rootScope.log('Thank you for seeing alert from tray');
                    if (res) {
                      $rootScope.getContentAndOpen(data.author, data.permlink);  
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
          },
          function(msg){
            $rootScope.log('onNotification callback successfully registered: ' + msg);
            //alert("msg "+JSON.stringify(msg));
          },
          function(err){
            $rootScope.log('Error registering onNotification callback: ' + err);
          }
        ); */ 
      }
      
    }

  });
});