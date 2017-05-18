module.exports = function (app) {
//angular.module('window.steem.controllers', [])

app.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $state, $ionicHistory, $cordovaSocialSharing, ImageUploadService, $cordovaCamera, $ionicSideMenuDelegate, $ionicPlatform, $filter, APIs, $window, $ionicPopover, $cordovaBarcodeScanner) {

  $scope.loginData = {};

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope  }).then(function(modal) {
    $scope.loginModal = modal;
  });

  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.menupopover = popover;
  });

  $scope.qrScanL = function(type) {
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner.scan({
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : $filter('translate')('QR_TEXT'), // supported on Android only
          "formats" : "QR_CODE" // default: all but PDF_417 and RSS_EXPANDED
          //"orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
        }).then(function(barcodeData) {
        //alert(barcodeData);
        if (barcodeData.text) {
          console.log(barcodeData);
          if (type == 'posting') {
            $scope.loginData.privatePostingKey = barcodeData.text;
          } else {
            $scope.loginData.privateActiveKey = barcodeData.text;
          }
        }

      }, function(error) {
        $rootScope.showMessage('Error',angular.toJson(error));
      });
    });
  };

  $scope.openMenuPopover = function($event) {
    $scope.menupopover.show($event);
  };
  $scope.closeMenuPopover = function() {
    $scope.menupopover.hide();
  };

  $rootScope.$on('close:popover', function(){
    console.log('close:popover');
    $scope.menupopover.hide();

    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    //$scope.closeMenuPopover();
    //$scope.fetchPosts();
  });

  $scope.$on('$destroy', function() {
    $scope.menupopover.remove();
  });

  $scope.changeUsername = function(){
    $scope.loginData.username = angular.lowercase($scope.loginData.username);
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  }
  $scope.open = function(item) {
    console.log(item);
    item.json_metadata = item.json_metadata?angular.fromJson(item.json_metadata):{};

    $rootScope.sitem = item;
    

    //$state.go('app.single');*/
    $state.go('app.post', {category: item.category, author: item.author, permlink: item.permlink});
  };

  $rootScope.$on('openComments', function(e, args) {
    $scope.open(args.data);
  });


  $scope.advancedChange = function() {
    $rootScope.log(angular.toJson($scope.loginData.advanced));
    if ($scope.loginData.advanced) {
      $scope.loginData.password = null;
    }
  }
  $scope.closeLogin = function() {
    $scope.loginModal.hide();
  };
  
  $scope.openSignUP = function() {
    $scope.chainurl = $rootScope.$storage.chain=='steem'?'https://steemit.com/create_account':'https://golos.io/create_account';
    window.open($scope.chainurl, '_system', 'location=yes');
    return false;  
  }
  
  $scope.openLogin = function() {
    if ($rootScope.$storage.language == 'ru-RU') {
      $scope.loginData.chain = "golos";
    } else {
      $scope.loginData.chain = "steem";
    }
    setTimeout(function() {
      $scope.loginModal.show();
    }, 1);
  };

  $scope.goProfile = function() {
    $state.go("app.profile", {username:$rootScope.user.username});
    //$ionicSideMenuDelegate.toggleLeft();
  }
  $scope.share = function() {
    var host = "";
    if ($rootScope.$storage.chain == 'steem') {
      host = "https://steemit.com/";
    } else {
      host = "https://golos.io/";
    }
    var link = host+$rootScope.sitem.category+"/@"+$rootScope.sitem.author+"/"+$rootScope.sitem.permlink;
    var message = "Hey! Checkout blog post on Steem "+link;
    var subject = "Via eSteem Mobile";
    var file = null;
    setTimeout(function() {
      $cordovaSocialSharing.share(message, subject, file) // Share via native share sheet
      .then(function(result) {
        // Success!
        $rootScope.log("shared");
      }, function(err) {
        // An error occured. Show a message to the user
        $rootScope.log("not shared");
      });
    }, 300);
  }


  $scope.loginChain = function(x){
    console.log(x);
    $scope.loginData.chain = x;
    $rootScope.$storage.chain = x;

    localStorage.socketUrl = $rootScope.$storage["socket"+$scope.loginData.chain];
    
    console.log(localStorage.socketUrl);

    window.steem.config.set('websocket',localStorage.socketUrl);
    window.steem.config.set('chain_id',localStorage[$scope.loginData.chain+"Id"]);

    if ($scope.loginData.chain == 'golos') {
      window.steem.config.set('address_prefix','GLS');  
    } else {
      window.steem.config.set('address_prefix','STM');  
    }
    window.steem.api.stop();
    $rootScope.$emit('changedCurrency',{currency: $rootScope.$storage.currency, enforce: true});
  }
  
  $scope.doLogin = function() {
    $rootScope.log('Doing login');
    if ($scope.loginData.password || $scope.loginData.privatePostingKey) {
      $rootScope.$broadcast('show:loading');
      $scope.loginData.username = $scope.loginData.username.trim();
      //console.log('doLogin'+$scope.loginData.username+$scope.loginData.password);
      
      if ($scope.loginData.chain !== $rootScope.$storage.chain) {
        
        var socketUrl = $rootScope.$storage["socket"+$scope.loginData.chain];
        //console.log(socketUrl);
        //window.Api = window.steemRPC.Client.get({url:socketUrl}, true);
        window.steem.config.set('websocket',socketUrl); 

      }
      var loginSuccess = false;
      window.steem.api.getAccounts([$scope.loginData.username], function(err, dd){
          //console.log(err, dd);
          dd = dd[0];
          //console.log(dd);
          $scope.loginData.id = dd.id;
          $scope.loginData.owner = dd.owner;
          $scope.loginData.active = dd.active;
          $scope.loginData.reputation = dd.reputation;
          $scope.loginData.posting = dd.posting;
          $scope.loginData.memo_key = dd.memo_key;
          $scope.loginData.post_count = dd.post_count;
          $scope.loginData.voting_power = dd.voting_power;
          $scope.loginData.witness_votes = dd.witness_votes;

          if ($scope.loginData.password) {
            window.steem.api.login($scope.loginData.username, $scope.loginData.password, function(err, result) {
              //console.log(err, result);
              if (result) {
                loginSuccess = true;
              } else {
                loginSuccess = false;
              }

              if (!loginSuccess) {
                  $rootScope.$broadcast('hide:loading');
                  $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('PASSWORD_INCORRECT'));
              } else {
                $rootScope.$storage.user = $scope.loginData;
                $rootScope.user = $scope.loginData;

                $scope.loginData = {};
                var found = false;

                if ($rootScope.$storage.users.length>0){
                  for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
                    var v = $rootScope.$storage.users[i];
                    if (v.username == $rootScope.user.username && v.chain == $rootScope.user.chain){
                      found = true;
                    }
                  }
                }
                if (found) {

                } else {
                  $rootScope.$storage.users.push($rootScope.user);  
                }
                $rootScope.$storage.mylogin = $scope.login;
                APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.user.username, {device: ionic.Platform.platform(), timestamp: $filter('date')(new Date(), 'medium'), appversion: $rootScope.$storage.appversion}).then(function(res){
                  $rootScope.$broadcast('hide:loading');
                  
                  $scope.loginModal.hide();
                  $rootScope.$broadcast('refreshLocalUserData');
                    
                  if ($rootScope.$storage.chain !== $rootScope.user.chain) {
                    $rootScope.$storage.chain = $rootScope.user.chain;  
                    $rootScope.$emit('changedChain');
                    $rootScope.$emit('changedCurrency', {currency: $rootScope.$storage.currency, enforce: true});
                  }

                  setTimeout(function() {
                    //$window.location.reload(true);
                    $state.go('app.posts',{renew:true},{reload: true});
                    $rootScope.$broadcast('fetchPosts');
                  }, 500);

                });
              }
            });  
          } else {
            if (window.steem.auth.isWif($scope.loginData.privatePostingKey)) {
              loginSuccess=true;
            } else {
              loginSuccesss=false;
            }
            if (!loginSuccess) {
                $rootScope.$broadcast('hide:loading');
                $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('PASSWORD_INCORRECT'));
            } else {
              $rootScope.$storage.user = $scope.loginData;
              $rootScope.user = $scope.loginData;

              $scope.loginData = {};
              var found = false;

              if ($rootScope.$storage.users.length>0){
                for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
                  var v = $rootScope.$storage.users[i];
                  if (v.username == $rootScope.user.username && v.chain == $rootScope.user.chain){
                    found = true;
                  }
                }
              }
              if (found) {

              } else {
                $rootScope.$storage.users.push($rootScope.user);  
              }
              $rootScope.$storage.mylogin = $scope.login;
              APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.user.username, {device: ionic.Platform.platform(), timestamp: $filter('date')(new Date(), 'medium'), appversion: $rootScope.$storage.appversion}).then(function(res){
                $rootScope.$broadcast('hide:loading');
                
                $scope.loginModal.hide();
                $rootScope.$broadcast('refreshLocalUserData');
                  
                if ($rootScope.$storage.chain !== $rootScope.user.chain) {
                  $rootScope.$storage.chain = $rootScope.user.chain;  
                  $rootScope.$emit('changedChain');
                  $rootScope.$emit('changedCurrency', {currency: $rootScope.$storage.currency, enforce: true});
                }

                setTimeout(function() {
                  //$window.location.reload(true);
                  $state.go('app.posts',{renew:true},{reload: true});
                  $rootScope.$broadcast('fetchPosts');
                }, 2000);

              });
            }
          }
          
          
          if(!$scope.$$phase) {
            $scope.$apply();
          }


      });
      
    } else {
      $scope.loginModal.hide();
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_FAIL'));
    }
  };

  $scope.selectAccount = function(user) {
    $rootScope.$storage.user = user;
    $rootScope.user = user;

    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    if ($rootScope.$storage.chain !== user.chain) {
      $scope.data = {};
      $rootScope.$storage.chain = user.chain;  
      $rootScope.$emit('changedChain');
    }
    setTimeout(function() {
      $rootScope.$emit('changedCurrency', {currency: $rootScope.$storage.currency, enforce: true});
    
      $rootScope.$broadcast('refreshLocalUserData');  
    }, 500);
    
    
    setTimeout(function() {
      //$window.location.reload(true);
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
      $state.go('app.posts',{renew:true},{reload: true});
    }, 50);
  }

  $rootScope.$on('refreshLocalUserData', function() {
    $rootScope.log('refreshLocalUserData');
    if ($rootScope.user && $rootScope.user.username && $rootScope.user.chain == $rootScope.$storage.chain) {
      window.steem.api.getAccounts([$rootScope.user.username], function(err, dd){
        dd = dd[0];
        if (dd && dd.json_metadata) {
          dd.json_metadata = angular.fromJson(dd.json_metadata);
        }
        angular.merge($rootScope.$storage.user, dd);
        $rootScope.user = $rootScope.$storage.user;

        $scope.mcss = ($rootScope.user.json_metadata && $rootScope.user.json_metadata.profile && $rootScope.user.json_metadata.profile.cover_image) ? {'background': 'url('+$rootScope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed', 'color': 'white', 'box-shadow':'inset 0 0 0 2000px rgba(255,0,150,0.3)'} : {'background': 'rgba(31,83,152,1)', 'color': 'white'};
        
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        if (!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    }
  })

  $scope.openPostModal = function() {
    $state.go('app.posts');
    $rootScope.$broadcast('openPostModal');
  }

  $scope.changeView = function(view) {
    $rootScope.$storage.view = view;
    $rootScope.$broadcast('changeView');
  }
  $scope.changeLight = function(light) {
    $rootScope.$storage.theme = light;
    $rootScope.$broadcast('changeLight');
  }

  $scope.$on("$ionicView.enter", function(){
    $rootScope.$broadcast('refreshLocalUserData');
    $scope.theme = $rootScope.$storage.theme;
  });

  // get app version
  $ionicPlatform.ready(function(){
    if (window.cordova) {
      cordova.getAppVersion.getVersionNumber(function (version) {
        $rootScope.$storage.appversion = version;
      });
    } else {
      $rootScope.$storage.appversion = '1.4.4';
    }
  });

  $scope.logout = function() {
    for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
      var v = $rootScope.$storage.users[i];
      if (v.chain == $rootScope.user.chain && v.username == $rootScope.user.username) {
        $rootScope.$storage.users.splice(i,1);
      }
    };
    if ($rootScope.$storage.users.length>1) {
      $rootScope.$storage.user = $rootScope.$storage.users[0];  
      $rootScope.user = $rootScope.$storage.user;

      for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
        var v = $rootScope.$storage.users[i];
        if (v.chain == $rootScope.$storage.chain) {
          $rootScope.$storage.user = $rootScope.$storage.users[i];  
          $rootScope.user = $rootScope.$storage.user;
        }
      }
    } else {
      $rootScope.$storage.user = undefined;
      $rootScope.$storage.user = null;
      $rootScope.user = undefined;
      $rootScope.user = null;

      $rootScope.$storage.mylogin = undefined;
      $rootScope.$storage.mylogin = null;
    }
    //make sure user credentials cleared.
    if ($rootScope.$storage.deviceid) {
      APIs.deleteSubscription($rootScope.$storage.deviceid).then(function(res){
        $ionicSideMenuDelegate.toggleLeft();
        //$window.location.reload(true);
        $state.go('app.posts',{renew:true},{reload: true});
      });
    } else {
      $ionicSideMenuDelegate.toggleLeft();
      //$window.location.reload(true);
      $state.go('app.posts',{renew:true},{reload: true});
    }
    $rootScope.$storage.filter = undefined;
    $rootScope.$storage.tag = undefined;

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
  };
  $scope.data = {};
  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope,
    animation: 'slide-in-down'
  }).then(function(modal) {
    $scope.smodal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeSmodal = function() {
    $scope.smodal.hide();
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  };

  // Open the login modal
  $scope.openSmodal = function() {
    //if(!$scope.smodal) return;
    $scope.data.searchResult = [];
    $rootScope.$broadcast('close:popover');
    setTimeout(function() {
      $scope.data.type="tag";
      //console.log($scope.data.searchResult);
      $scope.smodal.show();
      window.steem.api.getState("/tags", function(err, res) {
        if (res) {
          angular.forEach(res.tags, function(k,v){
            if (v) {
              if (!(v.indexOf("'")>-1 || v.indexOf("#")>-1)) {
                $scope.data.searchResult.push(k);
              }
            }
          });
        }
      });
    }, 1);
    
  };
  $scope.clearSearch = function() {
    if ($rootScope.$storage.tag) {
      $rootScope.$storage.tag = undefined;
      $rootScope.$storage.taglimits = undefined;
      $rootScope.$broadcast('close:popover');
      //$rootScope.$broadcast('fetchPosts');
      $rootScope.$broadcast('filter:change');
    }
  };
  $scope.showMeExtra = function() {
    if ($scope.showExtra) {
      $scope.showExtra = false;
    } else {
      $scope.showExtra = true;
    }
  }
  $scope.search = function() {
    $rootScope.log('Doing search '+$scope.data.search);
    $scope.data.search = angular.lowercase($scope.data.search);
    setTimeout(function() {
      if ($scope.data.search.length > 1) {
        if ($scope.data.type == "tag"){
          window.steem.api.getTrendingTags($scope.data.search, 15, function(err, result) {
            console.log(err, result);
            $scope.data.searchResult = result;

            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });
        }
        if ($scope.data.type == "user"){
          var ee = [];
          window.steem.api.lookupAccounts($scope.data.search, 15, function(err, result) {
            //console.log(err, result);
            if (result){
              $scope.data.searchResult = result;
            }

            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });
        }
      }
    }, 5);

  };
  $scope.typechange = function() {
    $scope.data.searchResult = undefined;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $rootScope.log("changing search type");
  }
  $scope.openTag = function(xx, yy) {
    $rootScope.log("opening tag "+xx);
    $rootScope.$storage.tag = xx;
    $rootScope.$storage.filter = 'created';
    $rootScope.$storage.taglimits = yy;
    if ($scope.smodal.isShown()){
      $scope.closeSmodal();
    }
    $rootScope.$broadcast('close:popover');
    //$rootScope.$broadcast('filter:change');
    $state.go("app.posts", {tags: xx});
  };
  $scope.openUser = function(xy) {
    $rootScope.log("opening user "+xy);
    $scope.closeSmodal();
    $rootScope.$broadcast('close:popover');
    $state.go("app.profile", {username: xy});
  };
  $scope.testfunction = function() {
    window.steem.api.getAccountHistory($rootScope.user.username, -1, 25, function(err, result) {
      //console.log(err, result);
      $rootScope.log(angular.toJson(response));
    });
  }

})

app.controller('SendCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval, $filter, $q, $timeout, $cordovaBarcodeScanner, $ionicPlatform, $ionicModal, APIs) {

  if ($rootScope.$storage.chain == "steem") {
    $scope.data = {types: [{type: "steem", name:"Steem", id:1},{type: "sbd", name:"Steem Dollar", id:2}, {type: "sp", name:"Steem Power", id:3}], type: "steem", amount: 0.001, etypes: [{type: "approve", name: $filter('translate')("APPROVE"), id:1},{type: "dispute", name: $filter('translate')("DISPUTE"), id:2},{type: "release", name: $filter('translate')("RELEASE"), id:3}]};
  } else {
    $scope.data = {types: [{type: "golos", name: "ГОЛОС", id:1},{type: "gbg", name:"ЗОЛОТОЙ", id:2}, {type: "golosp", name:"СИЛА ГОЛОСА", id:3}], type: "golos", amount: 0.001, etypes: [{type: "approve", name: $filter('translate')("APPROVE"), id:1},{type: "dispute", name: $filter('translate')("DISPUTE"), id:2},{type: "release", name: $filter('translate')("RELEASE"), id:3}]};
  }
  $scope.ttype = 'transfer';
  $scope.changeTransfer = function(type){
    $scope.ttype = type;
    $scope.data.advanced = false;
  }
  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openUModal = function() {
    $scope.modal.show();
  };
  $scope.closeUModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  $scope.showLiquid = function (token) {
    return token.type !== $filter('lowercase')($rootScope.$storage.platformpunit);
  }
  $scope.searchUser = function(query) {
    return window.steem.api.lookupAccounts(query, 15, function(err, result) {
      if (result){
        return result;
      }
    });
  }
  $scope.selectAgent = function(agent) {
    $scope.data.agent = agent;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $scope.closeUModal();
  }
  $scope.getUserAgent = function(query){
    query = angular.lowercase(query);
    $scope.res = [];
    if (query) {
      window.steem.api.lookupAccountNames([query], function(err, result) {
        console.log(err, result);
        if (result) {
          var dd = result[0];
          if (dd && dd.json_metadata) {
            var vv = angular.fromJson(dd.json_metadata);
            if (vv.escrow) {
              console.log('escrow');
              $scope.res.push({name: query, escrow: vv.escrow});
            } else {
              console.log('noescrow');
              $scope.res.push({name: query, escrow: {terms: "-", fees: {"STEEM": 0.001, "SBD": 0.001, "GBG": 0.001, "GOLOS": 0.001}} });
            }
          }
        }
      });
     
      setTimeout(function() {
        if (query && $scope.res) {
          $scope.data.searchResult = $scope.res;
        } else {
          $scope.data.searchResult = [];  
        }
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, 50);   
    }
  }
  $scope.changeUsername = function(typed) {
    $rootScope.log('searching');
    $scope.data.username = angular.lowercase($scope.data.username);
    window.steem.api.lookupAccountNames([$scope.data.username], function(err, result) {
      console.log(err, result);
      if (result) {
        $scope.susers = result[0];
        if (!$scope.$$phase) {
          $scope.$apply();
        }  
      }
    });
  }
  $scope.qrScan = function() {
    $ionicPlatform.ready(function() {
      $cordovaBarcodeScanner.scan({
          "preferFrontCamera" : false, // iOS and Android
          "showFlipCameraButton" : false, // iOS and Android
          "prompt" : $filter('translate')('QR_TEXT'), // supported on Android only
          "formats" : "QR_CODE" // default: all but PDF_417 and RSS_EXPANDED
          //"orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
        }).then(function(barcodeData) {
        //alert(barcodeData);
        if (barcodeData.text.indexOf('?amount')>-1) {
          //steem dollar:blocktrades?amount=12.080

          $scope.data.username = barcodeData.text.split(':')[1].split('?')[0].trim();
          $scope.data.amount = Number(barcodeData.text.split('=')[1]);
          if (barcodeData.text.split(':')[0]==='steem dollar') {
            $scope.data.type = 'sbd';
          }
          if (barcodeData.text.split(':')[0]==='steem') {
            $scope.data.type = 'steem';
          }
          if (barcodeData.text.split(':')[0]==='steem power') {
            $scope.data.type = 'sp';
          }

        } else {
          $scope.data.username = barcodeData.text;
        }
        $scope.changeUsername();
      }, function(error) {
        $rootScope.showMessage('Error',angular.toJson(error));
      });
    });
  };
  $scope.advancedEChange = function(){
    console.log('advancedEChange', $scope.data.advanced);
    $scope.data.etype = "";
    $scope.escrow = {};
    if (!$scope.$$phase){
      $scope.$apply();
    }
  }
  $scope.actionEChange = function(){
    console.log('actionEChange', $scope.data.etype);
    if (!$scope.$$phase){
      $scope.$apply();
    }
  }

  $scope.escrowAction = function(){
    console.log($scope.data.etype);
    if ($scope.data.etype && $scope.escrow.escrow_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('CONFIRMATION'),
        template: ""
      });
      confirmPopup.then(function(res) {
        if(res) {
          $rootScope.log('You are sure');
          $rootScope.$broadcast('show:loading');

          const wif = $rootScope.user.password
          ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
          : $rootScope.user.privateActiveKey;

          if ($scope.data.etype == "approve") {

            window.steem.broadcast.escrowApprove(wif, $scope.escrow.from, $scope.escrow.to, $scope.escrow.agent, $rootScope.user.username, $scope.escrow.escrow_id, true, function(err, result) {
              console.log(err, result);
              if (err) {
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0]);
              } else {
                $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                  $scope.data.type=$rootScope.$storage.chain;
                  $scope.data.amount= 0.001;
                });
              }
            });
          } else if ($scope.data.etype == "dispute") {
            window.steem.broadcast.escrowDispute(wif, $scope.escrow.from, $scope.escrow.to, $scope.escrow.agent, $rootScope.user.username, $scope.escrow.escrow_id, function(err, result) {
              console.log(err, result);
              if (err) {
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0]);
              } else {
                $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                  $scope.data.type=$rootScope.$storage.chain;
                  $scope.data.amount= 0.001;
                });
              }
            });
          } else if ($scope.data.etype == "release") {
            window.steem.broadcast.escrowRelease(wif, $scope.escrow.from, $scope.escrow.to, $scope.escrow.agent, $rootScope.user.username, $scope.escrow.receiver, $scope.escrow.escrow_id, $scope.escrow.sbd_amount+" "+angular.uppercase($rootScope.$storage.platformdunit),
              $scope.escrow.steem_amount+" "+angular.uppercase($rootScope.$storage.platformlunit), function(err, result) {
              console.log(err, result);
              if (err) {
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0]);
              } else {
                $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                  $scope.data.type=$rootScope.$storage.chain;
                  $scope.data.amount= 0.001;
                });
              }
            });
          }
        }
      });
    } 
  }
  $scope.escrow = {};
  $scope.searchEscrowID = function(id){
    if (id.length>3){
      APIs.searchEscrow(id).then(function(res){
        if (res.data.length>0) {
          $scope.escrow = res.data[0];
          $scope.escrow.json_meta = angular.fromJson($scope.escrow.json_meta);  
        }
      });  
    }
  }
  $scope.transfer = function (type) {
    if ($rootScope.user) {

      if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('ACTIVE_KEY_REQUIRED_TEXT'));
      } else {
        if ($scope.data.type === 'sbd' || $scope.data.type === 'gbg') {
          if ($scope.data.amount > Number($scope.balance.sbd_balance.split(" ")[0])) {
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('BALANCE_TEXT'));
          } else {
            $scope.okbalance = true;
          }
        }
        if ($scope.data.type === 'sp' || $scope.data.type === 'steem' || $scope.data.type === 'golos' || $scope.data.type === 'golosp') {
          if ($scope.data.amount > Number($scope.balance.balance.split(" ")[0])) {
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('BALANCE_TEXT'));
          } else {
            $scope.okbalance = true;
          }
        }
        if (!$scope.susers || $scope.susers.name !== $scope.data.username) {
          $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('NONEXIST_USER'));
        } else {
          $scope.okuser = true;
        }
        if ($scope.okbalance && $scope.okuser) {
          var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('CONFIRMATION'),
            template: $filter('translate')('TRANSFER_TEXT')
          });

          confirmPopup.then(function(res) {
            if(res) {
              $rootScope.log('You are sure');
              $rootScope.$broadcast('show:loading');
              
              if (type == 'transfer') {
                const wif = $rootScope.user.password
                ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
                : $rootScope.user.privateActiveKey;

                if ($scope.data.type !== 'sp' && $scope.data.type !== 'golosp') {
                  var tt = $filter('number')($scope.data.amount, 3) +" "+angular.uppercase($scope.data.type);
                  window.steem.broadcast.transfer(wif, $rootScope.user.username, $scope.data.username, tt, $scope.data.memo || "", function(err, result) {
                    console.log(err, result);
                    if (err) {
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
                    } else {
                      $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                        $scope.data.type=$rootScope.$storage.chain;
                        $scope.data.amount= 0.001;
                      });
                    }
                  });
                } else {
                  var tt = $filter('number')($scope.data.amount, 3) + " "+$filter('uppercase')($rootScope.$storage.chain);
                  
                  window.steem.broadcast.transferToVesting(wif, $rootScope.user.username, $scope.data.username, tt, function(err, result) {
                    console.log(err, result);
                    if (err) {
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
                    } else {
                      $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                        $scope.data.type=$rootScope.$storage.chain;
                        $scope.data.amount= 0.001;
                      });
                    }
                });
              }
            }
            if (type == 'escrow') {
              const wif = $rootScope.user.password
              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
              : $rootScope.user.privateActiveKey;
               
              var escrow_id = (new Date().getTime())>>>0;
              var tt = $filter('number')($scope.data.amount, 3) +" "+angular.uppercase($scope.data.type);
              var sbd = ($scope.data.type=='sbd'||$scope.data.type=='gbg')?tt:("0.000 "+angular.uppercase($rootScope.$storage.platformdunit));
              var stem = ($scope.data.type=='steem'||$scope.data.type=='golos')?tt:("0.000 "+angular.uppercase($rootScope.$storage.platformlunit));
              var fe = $scope.data.agent.escrow.fees[angular.uppercase($scope.data.type)]+" "+angular.uppercase($scope.data.type);
              var rt = new Date($scope.data.ratification);
              var et = new Date($scope.data.expiration);
              var jn = {
                terms: $scope.data.agent.escrow.terms, 
                memo: ($scope.data.memo||"")+" "+escrow_id
              }
              
              window.steem.broadcast.escrowTransfer(wif, $rootScope.user.username, $scope.data.username, $scope.data.agent.name, escrow_id, sbd, stem, fe, rt, et, angular.toJson(jn), function(err, result) {
                console.log(err, result);
                if (err) {
                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0]);
                } else {
                  $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED') + " "+$filter('translate')('ESCROW')+" "+$filter('translate')('ID')+": "+escrow_id).then(function(){
                    $scope.data.type=$rootScope.$storage.chain;
                    $scope.data.amount= 0.001;
                  });
                }
              });
            } 
            $rootScope.$broadcast('hide:loading');
          }
        });
      }
    }
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  };


  $scope.refresh = function() {
    $rootScope.$broadcast('show:loading');
    window.steem.api.getAccounts([$rootScope.user.username], function(err, dd){
        console.log(err, dd);
        $scope.balance = dd[0];
        console.log($scope.balance);
        $rootScope.$broadcast('hide:loading');
        if (!$scope.$$phase){
          $scope.$apply();
        }
    });
    $rootScope.$broadcast('hide:loading');
  }
  $scope.$on('$ionicView.beforeEnter', function(){
    window.steem.api.getAccounts([$rootScope.user.username], function(err, dd){
      $scope.balance = dd[0];
      if (!$scope.$$phase){
        $scope.$apply();
      }
    });
  });

});
app.controller('PostsCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval, $ionicScrollDelegate, $ionicModal, $filter, $stateParams, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicPlatform, $cordovaCamera, ImageUploadService, $filter, $ionicHistory, $timeout, APIs, $translate) {

  var formatToPercentage = function (value) {
    return value + '%';
  };

  $scope.pslider = {
    value: $rootScope.$storage.voteWeight/100,
    options: {
      floor: 1,
      ceil: 100,
      hideLimitLabels: true
      //translate: formatToPercentage,
      //showSelectionBar: true,
    }
  };

  $ionicPopover.fromTemplateUrl('popoverSlider.html', {
      scope: $scope
  }).then(function(popover) {
      $scope.tooltipSlider = popover;
  });
  
  $scope.openSlider = function($event, d) {
    $scope.votingPost = d;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $scope.rangeValue = $rootScope.$storage.voteWeight/100;
    $scope.tooltipSlider.show($event);
  };
  $scope.drag = function(v) {
    //console.log(v);
    $rootScope.$storage.voteWeight = v*100;
  }
  $scope.votePostS = function() {
    $scope.tooltipSlider.hide();
    $scope.votePost($scope.votingPost);
  }
  $scope.closeSlider = function() {
    $scope.tooltipSlider.hide();
  };

  $scope.options = {
    loop: false,
    speed: 500,
    /*pagination: false,*/
    showPager: false,
    slidesPerView: 3,
    spaceBetween: 20,
    breakpoints: {
      1024: {
          slidesPerView: 5,
          spaceBetween: 15
      },
      768: {
          slidesPerView: 4,
          spaceBetween: 10
      },
      640: {
          slidesPerView: 3,
          spaceBetween: 5
      },
      320: {
          slidesPerView: 3,
          spaceBetween: 3
      }
    }
  }


  $rootScope.$on('filter:change', function() {
    //$rootScope.$broadcast('show:loading');
    $rootScope.log($rootScope.$storage.filter);
    var type = $rootScope.$storage.filter || "trending";
    var tag = $rootScope.$storage.tag || "";
    console.log(type, $scope.limit, tag);
    $scope.fetchPosts(type, $scope.limit, tag);
  });

  $scope.filterChanged = function(t) {
    var fil = $scope.mymenu[t].custom;
    $rootScope.$storage.filter = fil;
    for (var i = 0, len = $scope.mymenu.length; i < len; i++) {
      var v = $scope.mymenu[i];
      if (v.custom == fil) {
        $rootScope.$storage.filterName = v.text;
      }
    }
    $scope.data = [];
    $scope.error = false;
    $rootScope.$broadcast('filter:change');
  }
  $scope.showFilter = function() {
    var filterSheet = $ionicActionSheet.show({
     buttons: $scope.mymenu,
     titleText: $filter('translate')('SORT_POST_BY'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
        $scope.filterChanged(index);
        return true;
     }
    });
  }

  $ionicPopover.fromTemplateUrl('popoverT.html', {
      scope: $scope
  }).then(function(popover) {
    $scope.tooltip = popover;
  });

  $scope.openTooltip = function($event, d) {
    var tppv = Number(d.pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0]-d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAST_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tpv,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(d.cashout_time, true)+"</div></div>";
    $scope.tooltipText = texth;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $scope.tooltip.show($event);
  };

  $scope.closeTooltip = function() {
      $scope.tooltip.hide();
  };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.tooltip.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
      $scope.tooltipText = undefined;
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });

  $ionicModal.fromTemplateUrl('templates/story.html', { scope: $scope  }).then(function(modal) {
      $scope.modalp = modal;
  });
  $scope.lastFocused;

  $rootScope.$on('openPostModal', function() {

    $rootScope.$broadcast('close:popover');

    $scope.spost = $rootScope.$storage.spost || $scope.spost;

    

    $timeout(function(){
      if (!$scope.spost.operation_type) {
        $scope.spost.operation_type = 'default';
      }
      $scope.tagsChange();

      $scope.modalp.show();
      /*angular.element("textarea").focus(function() {
        $scope.lastFocused = document.activeElement;
        //console.log(document);
      });*/
    }, 10);
    //$scope.modalp.show();
  });

  $rootScope.$on('closePostModal', function() {
    $scope.modalp.hide();
  });

  $scope.closePostModal = function() {
    $rootScope.$emit('closePostModal');
    $scope.modalp.hide();
  };


  $scope.cfocus = function(){
    $scope.lastFocused = document.activeElement;
  }
  //http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
  $scope.insertText = function(text, position) {
    var input = $scope.lastFocused;
    //console.log(input);
    if (input == undefined) { return; }
    var scrollPos = input.scrollTop;
    var pos = 0;
    var browser = ((input.selectionStart || input.selectionStart == "0") ?
                   "ff" : (document.selection ? "ie" : false ) );
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart ("character", -input.value.length);
      pos = range.text.length;
    }
    else if (browser == "ff") { pos = input.selectionStart };

    var front = (input.value).substring(0, pos);
    var back = (input.value).substring(pos, input.value.length);
    input.value = front+text+back;
    pos = pos + text.length;
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart ("character", -input.value.length);
      range.moveStart ("character", pos);
      range.moveEnd ("character", 0);
      range.select();
    }
    else if (browser == "ff") {
      input.selectionStart = pos;
      input.selectionEnd = pos;
      input.focus();
    }
    input.scrollTop = scrollPos;
    angular.element(input).trigger('input');
  }


  $scope.showImg = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('CAPTURE_PICTURE') },
       { text: $filter('translate')('SELECT_PICTURE') },
       { text: $filter('translate')('SET_CUSTOM_URL') },
       { text: $filter('translate')('GALLERY') }
     ],
     titleText: $filter('translate')('INSERT_PICTURE'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
        $scope.insertImage(index);
        return true;
     }
   });
  };
  $scope.insertImage = function(type) {
    var options = {};

    if (type == 0 || type == 1) {
      options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: (type===0)?true:false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
        //correctOrientation:true
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        setTimeout(function() {
          ImageUploadService.uploadImage(imageData).then(function(result) {
            //var url = result.secure_url || '';
            var url = result.imageUrl || '';
            var final = " ![image](" + url + ")";
            /*if ($scope.spost.body) {
              $scope.spost.body += final;
            } else {
              $scope.spost.body = final;
            }*/
            $scope.insertText(final);
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          },
          function(err) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('UPLOAD_ERROR'));
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          });
        }, 10);
      }, function(err) {
        $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('CAMERA_CANCELLED'));
      });
    } else if (type == 2){
      $ionicPopup.prompt({
        title: $filter('translate')('SET_URL'),
        template: $filter('translate')('DIRECT_LINK_PICTURE'),
        inputType: 'text',
        inputPlaceholder: 'http://example.com/image.jpg'
      }).then(function(res) {
        $rootScope.log('Your url is' + res);
        if (res) {
          var url = res.trim();
          var final = " ![image](" + url + ")";
          /*if ($scope.spost.body) {
            $scope.spost.body += final;
          } else {
            $scope.spost.body = final;
          }*/
          $scope.insertText(final);
        }
      });
    } else {
      $scope.gallery = [];
      APIs.fetchImages($rootScope.user.username).then(function(res){
        var imgs = res.data;
        if (imgs.length>0){
          $scope.showgallery = true;
          $scope.gallery.images = imgs;
        } else {
          $scope.showgallery = false;
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('NO_IMAGE'));
          console.log('no images available')
        }
      });
    }
  };
  $scope.closeGallery = function(){
    $scope.showgallery = false;
  }
  $scope.manageGallery = function(){
    $rootScope.$emit('closePostModal');
    $state.go('app.images');
  }
  function slug(text) {
    return getSlug(text, {truncate: 128});
  };
  function createPermlink(title) {
    var permlink;
    var t = new Date();
    var timeformat = t.getFullYear().toString()+(t.getMonth()+1).toString()+t.getDate().toString()+"t"+t.getHours().toString()+t.getMinutes().toString()+t.getSeconds().toString()+t.getMilliseconds().toString()+"z";
    if (title && title.trim() !== '') {
      var s = slug(title);
      permlink = s.toString()+"-"+timeformat;
      if(permlink.length > 255) {
        // STEEMIT_MAX_PERMLINK_LENGTH
        permlink = permlink.substring(permlink.length - 255, permlink.length)
      }
      // only letters numbers and dashes shall survive
      permlink = permlink.toLowerCase().replace(/[^a-z0-9-]+/g, '')
      return permlink;
    }
  };
  //$scope.operation_type = 'default';
  $scope.spost = {};
  $scope.tagsChange = function() {
    $rootScope.log("tagsChange");
    $scope.spost.tags = $filter('lowercase')($scope.spost.tags);
    $scope.spost.category = $scope.spost.tags?$scope.spost.tags.split(" "):[];
    for (var i = 0, len = $scope.spost.category.length; i < len; i++) {
      var v = $scope.spost.category[i];
      if(/^[а-яё]/.test(v)) {
        v = 'ru--' + $filter('detransliterate')(v, true);
        $scope.spost.category[i] = v;
      }
    }

    //console.log($scope.spost.category);
    if ($scope.spost.category.length > 5) {
      $scope.disableBtn = true;
    } else {
      $scope.disableBtn = false;
    }
  }
  $scope.contentChanged = function (editor, html, text) {
    //console.log($scope.spost.body);
    //console.log('editor: ', editor, 'html: ', html, 'text:', text);
  };

  $scope.submitStory = function() {
    //console.log($scope.spost.body);
    $scope.tagsChange();
    if (!$scope.$$phase){
      $scope.$apply();
    }
    if (!$scope.spost.title) {
      $rootScope.showAlert('Missing', 'Title');
      return;
    }
    if ($scope.spost.category.length<1) {
      $rootScope.showAlert('Missing', 'Tags');
      return;
    }
    $rootScope.$broadcast('show:loading');
    if ($rootScope.user) {
      const wif = $rootScope.user.password
      ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
      : $rootScope.user.privatePostingKey;

      var permlink = createPermlink($scope.spost.title);
      var json = $filter("metadata")($scope.spost.body);
      angular.merge(json, {tags: $scope.spost.category, app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' });

      if (!$scope.spost.operation_type) {
        $scope.spost.operation_type = 'default';
      }

      var operations_array = [];
      if ($scope.spost.operation_type !== 'default') {
        operations_array = [
          ['comment', {
            parent_author: "",
            parent_permlink: $scope.spost.category[0],
            author: $rootScope.user.username,
            permlink: permlink,
            title: $scope.spost.title,
            body: $scope.spost.body,
            json_metadata: angular.toJson(json)
          }],
          ['comment_options', {
            allow_curation_rewards: true,
            allow_votes: true,
            author: $rootScope.user.username,
            permlink: permlink,
            max_accepted_payout: $scope.spost.operation_type==='sp'?"1000000.000 "+$rootScope.$storage.platformdunit:"0.000 "+$rootScope.$storage.platformdunit,
            percent_steem_dollars: $scope.spost.operation_type==='sp'?0:10000,
            extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":100 }] }]]
          }]
          ];
          if ($scope.spost.upvote_this) {
            var vote = ['vote', {
              voter: $rootScope.user.username, 
              author: $rootScope.user.username, 
              permlink: permlink, 
              weight: $rootScope.$storage.voteWeight || 10000
            }];
            operations_array.push(vote);
          }
      } else {
        operations_array = [
          ['comment', {
            parent_author: "",
            parent_permlink: $scope.spost.category[0],
            author: $rootScope.user.username,
            permlink: permlink,
            title: $scope.spost.title,
            body: $scope.spost.body,
            json_metadata: angular.toJson(json)
          }],
          ['comment_options', {
            allow_curation_rewards: true,
            allow_votes: true,
            author: $rootScope.user.username,
            permlink: permlink,
            max_accepted_payout: "1000000.000 "+$rootScope.$storage.platformdunit,
            percent_steem_dollars: 10000,
            extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":100 }] }]]
          }]
          ];
          if ($scope.spost.upvote_this) {
            var vote = ['vote', {
              voter: $rootScope.user.username, 
              author: $rootScope.user.username, 
              permlink: permlink, 
              weight: $rootScope.$storage.voteWeight || 10000
            }];
            operations_array.push(vote);
          }
      }
     
      window.steem.broadcast.send({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
        console.log(err, result);
        $scope.replying = false;
        $rootScope.$broadcast('hide:loading');
        if (err) {
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
        } else {
          $scope.closePostModal();
          $rootScope.$emit('closePostModal');
          $rootScope.$broadcast('close:popover');
          //$scope.menupopover.hide();
          $scope.spost = {};
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_SUBMITTED'));
          //$scope.closeMenuPopover();
          $state.go("app.profile", {username: $rootScope.user.username});
        }
      });
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }
  $scope.savePost = function() {
    console.log($scope.modalp);
    $rootScope.$storage.spost = $scope.spost;
    //adddraft
    var dr = {title:$scope.spost.title, body: $scope.spost.body, tags: $scope.spost.tags, post_type: $scope.spost.operation_type};
    APIs.addDraft($rootScope.user.username, dr).then(function(res){
      console.log(res.data);
      //$scope.drafts = res.data;
    });
    $rootScope.$emit('closePostModal');
    $rootScope.$broadcast('close:popover');
    $scope.modalp.hide();
    $rootScope.showMessage($filter('translate')('SAVED'), $filter('translate')('POST_LATER'));
  }
  $scope.clearPost = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: ""
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.log('You are sure');
        $rootScope.$storage.spost = {};
        $scope.spost = {};
        $rootScope.showMessage($filter('translate')('CLEARED'), $filter('translate')('POST'));
      } else {
        $rootScope.log('You are not sure');
      }
    });
  }


  $rootScope.$on('fetchPosts', function(){
    $scope.fetchPosts();
  });

  $rootScope.$on('fetchContent', function(event, args) {
    var post = args.any;
    //console.log(post);
    $scope.fetchContent(post.author, post.permlink);
  });

  $scope.votePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'fetchContent');
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  };

  $scope.downvotePost = function(post) {

    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: $filter('translate')('FLAGGING_TEXT')
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'fetchContent');
      } else {
        $rootScope.log('You are not sure');
      }
    });

  };

  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'fetchContent');
  };


  $rootScope.$on("user:logout", function(){
    $scope.fetchPosts();
    $rootScope.$broadcast('filter:change');
  });

  $scope.loadMore = function() {
    //$rootScope.$broadcast('show:loading');
    $scope.limit += 5;
    //if (!$scope.error) {
    $scope.fetchPosts(null, $scope.limit, null);
    //}
  };
  $scope.refresh = function(){
    $scope.limit = 10;
    //if (!$scope.error) {
    $scope.fetchPosts(null, $scope.limit, null);
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
    console.log('stateChangeSuccess', $stateParams.renew);
    if (from.name == 'app.posts' && to.name == 'app.post') {

    } else {
      if (from.name == 'app.post' && to.name == 'app.posts') {
        $rootScope.sitem = null;
      }
      if (from.name !== 'app.post') {
        if ($stateParams.renew) {
          $scope.data = null;
          $scope.data = [];
        }
        $scope.loadMore();
      }
    }
  });

  $scope.moreDataCanBeLoaded = function(){
    return !$scope.error;
  }

  $rootScope.$on('changeView', function(){
    //$scope.menupopover.hide();
    //$rootScope.$broadcast('close:popover');
    $scope.menupopover.hide();
    if (!$scope.$$phase){
      $scope.$apply();
    }
    if ($rootScope.$storage.view === 'card') {
      for (var i = 0, len = $scope.data.length; i < len; i++) {
        var v = $scope.data[i];
        v.json_metadata = angular.fromJson(v.json_metadata);
      };
    }
  });

  $rootScope.$on('changeLight', function(){
    $scope.menupopover.hide();
    //$rootScope.$broadcast('close:popover');
    if (!$scope.$$phase){
      $scope.$apply();
    }
  });

  function arrayObjectIndexOf(myArray, searchTerm, property) {
    var llen = myArray.length;
    for(var i = 0; i < llen; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
  }
  $scope.data = [];
  $scope.tempData = [];

  $scope.dataChanged = function(newValue) {
    if (newValue) {
      var lenn = newValue.length;
      //var user = $rootScope.$storage.user || null;
      var view = $rootScope.$storage.view;

      if ($rootScope.user){
        for (var i = 0; i < lenn; i++) {
          if (newValue[i] && newValue[i].active_votes) {
            var len = newValue[i].active_votes.length-1;
            for (var j = len; j >= 0; j--) {
              if (newValue[i].active_votes[j].voter === $rootScope.user.username) {
                if (newValue[i].active_votes[j].percent > 0) {
                  newValue[i].upvoted = true;
                } else if (newValue[i].active_votes[j].percent < 0) {
                  newValue[i].downvoted = true;
                } else {
                  newValue[i].downvoted = false;
                  newValue[i].upvoted = false;
                }
              }
            }
          }
          if (view === 'card') {
            if (newValue[i].json_metadata){
              newValue[i].json_metadata = angular.fromJson(newValue[i].json_metadata);
            }
          }
        }
      } else {
        if (view === 'card') {
          for (var i = 0; i < lenn; i++) {
            if (newValue[i].json_metadata){
              newValue[i].json_metadata = angular.fromJson(newValue[i].json_metadata);
            }
          }
        }
      }
      return newValue;
    }
  }

  $scope.fetchContent = function(author, permlink) {
    window.steem.api.getContent(author, permlink, function(err, result) {
      console.log(err, result);
      var len = result.active_votes.length;
      //var user = $rootScope.$storage.user;
      if ($rootScope.user) {
        for (var j = len - 1; j >= 0; j--) {
          if (result.active_votes[j].voter === $rootScope.user.username) {
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
      }
      result.json_metadata = angular.fromJson(result.json_metadata);
      for (var i = 0, len = $scope.data.length; i < len; i++) {
        var v = $scope.data[i];
        if (v.permlink === result.permlink) {
          $scope.data[i] = result;
        }
      }
      $rootScope.$broadcast('hide:loading');
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  }
  $scope.ifExists = function(xx){
    for (var i = 0; i < $scope.data.length; i++) {
      if ($scope.data[i].permlink === xx){
        return true;
      }
    }
    return false;
  }

  $scope.fetchPosts = function(type, limit, tag) {
    type = type || $rootScope.$storage.filter || "trending";
    tag = tag || $rootScope.$storage.tag || "";
    limit = 10;//limit || $scope.limit || 10;

    var params = {};

    if (type === "feed" && $rootScope.user) {
      params = {tag: $rootScope.user.username, limit: limit, filter_tags:[]};
    } else {
      if ($rootScope.$storage.filter === "feed") {
        $rootScope.$storage.filter = "trending";
        type = "trending";
      }
      params = {tag: tag, limit: limit, filter_tags:[]};
    }
    if ($scope.data && $scope.data.length>0) {
      params.start_author = $scope.data[$scope.data.length-1].author;
      params.start_permlink = $scope.data[$scope.data.length-1].permlink;
    }
    if ($scope.error) {
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.log("fetching..."+type+" "+limit+" "+tag);
       
      if ($rootScope.$storage.chain == 'golos' && type == 'feed') {
        params.select_authors = [$rootScope.user.username]; 
        delete params.tags; 
      }
      const snakeCaseRe = /_([a-z])/g;

      function camelCase(str) {
        return str.replace(snakeCaseRe, function (_m, l) {
          return l.toUpperCase();
        });
      }
      var xyz = camelCase("get_discussions_by_"+type);
      //window.steem.api.getDiscussionsBy
      window.steem.api[xyz](params, function(err, response) {
        
        if (response) {
          if (response.length <= 1) {
            $scope.error = true;
          }
          for (var i = 0; i < response.length; i++) {
            response[i].json_metadata = response[i].json_metadata?angular.fromJson(response[i].json_metadata):response[i].json_metadata;
            var permlink = response[i].permlink;
            if (!$scope.ifExists(permlink)) {
              //var user = $rootScope.$storage.user || undefined;
              if ($rootScope.user) {
                //console.log('exist');
                if (response[i] && response[i].active_votes) {
                  var len = response[i].active_votes.length-1;
                  for (var j = 0; j < len; j++) {
                    if (response[i].active_votes[j].voter === $rootScope.user.username) {
                      if (response[i].active_votes[j].percent > 0) {
                        response[i].upvoted = true;
                      } else if (response[i].active_votes[j].percent < 0) {
                        response[i].downvoted = true;
                      } else {
                        response[i].downvoted = false;
                        response[i].upvoted = false;
                      }
                    }
                  }
                }
              }
              $scope.data.push(response[i]);
            }
          }
        }

        if (!$scope.$$phase) {
          $scope.$apply();
        }
        //console.log($scope.data.length);
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $rootScope.$broadcast('hide:loading');
      });
    }
  };

  $scope.$on('$ionicView.loaded', function(){
    $scope.limit = 10;
    //$rootScope.$broadcast('show:loading');
    if (!$rootScope.$storage["socket"+$rootScope.$storage.chain]) {
      $rootScope.$storage["socket"+$rootScope.$storage.chain] = localStorage.socketUrl;
    }
    if (!$rootScope.$storage.view) {
      $rootScope.$storage.view = 'card';
    }
    if (!$rootScope.$storage.filter) {
      $rootScope.$storage.filter = "trending";
    }
    
  });
  
  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.theme = $rootScope.$storage.theme;
    if ($stateParams.tags) {
      $rootScope.$storage.tag = $stateParams.tags;
    }
    //$scope.user = $rootScope.$storage.user || undefined;
    
    if (!angular.isDefined($rootScope.$storage.language)) {
      if(typeof navigator.globalization !== "undefined") {
          navigator.globalization.getPreferredLanguage(function(language) {
              $translate.use((language.value).split("-")[0]).then(function(data) {
                  console.log("SUCCESS -> " + data);
                  $rootScope.$storage.language = language.value.split('-')[0];
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

    $scope.activeMenu = $rootScope.$storage.filter || "trending";
    $scope.mymenu = $rootScope.user ? [
    {text: $filter('translate')('FEED'), custom:'feed'}, 
    {text: $filter('translate')('TRENDING'), custom:'trending'}, 
    {text: $filter('translate')('HOT'), custom:'hot'}, 
    {text: $filter('translate')('NEW'), custom:'created'}, 
    {text: $filter('translate')('ACTIVE'), custom:'active'}, 
    {text: $filter('translate')('PROMOTED'), custom: 'promoted'}, 
    {text:$filter('translate')('VOTES'), custom:'votes'}, 
    {text: $filter('translate')('COMMENTS'), custom:'children'}, 
    {text: $filter('translate')('PAYOUT'), custom: 'payout'}] : 
    [ 
    {text: $filter('translate')('TRENDING'), custom:'trending'}, 
    {text: $filter('translate')('HOT'), custom:'hot'}, 
    {text: $filter('translate')('NEW'), custom:'created'}, 
    {text: $filter('translate')('ACTIVE'), custom:'active'}, 
    {text: $filter('translate')('PROMOTED'), custom: 'promoted'}, 
    {text:$filter('translate')('VOTES'), custom:'votes'}, 
    {text: $filter('translate')('COMMENTS'), custom:'children'}, 
    {text: $filter('translate')('PAYOUT'), custom: 'payout'}];

    for (var i = 0, len = $scope.mymenu.length; i < len; i++) {
      var v = $scope.mymenu[i];
      if (v.custom === $rootScope.$storage.filter) {
        $rootScope.$storage.filterName = v.text;
      }
    }

  });

})

app.controller('PostCtrl', function($scope, $stateParams, $rootScope, $interval, $ionicScrollDelegate, $ionicModal, $filter, $ionicActionSheet, $cordovaCamera, $ionicPopup, ImageUploadService, $ionicPlatform, $ionicSlideBoxDelegate, $ionicPopover, $filter, $state, APIs, $ionicHistory, $ionicPosition, $cordovaFileTransfer, $ionicLoading) {
  $scope.post = $rootScope.sitem;
  $scope.data = {};
  $scope.spost = {};
  $scope.replying = false;

  $ionicPopover.fromTemplateUrl('popoverSliderr.html', {
      scope: $scope
  }).then(function(popover) {
      $scope.tooltipSliderr = popover;
  });
  
  $scope.openSliderr = function($event, d) {
    $scope.votingPost = d;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $scope.rangeValue = $rootScope.$storage.voteWeight/100;
    $scope.tooltipSliderr.show($event);
  };
  $scope.votePostS = function() {
    $scope.tooltipSliderr.hide();
    $scope.upvotePost($scope.votingPost);
  }
  $scope.drag = function(v) {
    //console.log(v);
    $rootScope.$storage.voteWeight = v*100;
  };

  $scope.closeSliderr = function() {
    $scope.tooltipSliderr.hide();
  };

  $scope.isBookmarked = function() {
    var bookm = $rootScope.$storage.bookmark || undefined;
    if (bookm && $rootScope.sitem) {
      var len = bookm.length;
      for (var i = 0; i < len; i++) {
        if (bookm[i] && bookm[i].permlink === $rootScope.sitem.permlink) {
          return true;
        }
      }
    } else {
      return false;
    }
  };
  $scope.options = {
    loop: false,
    speed: 500,
    /*pagination: false,*/
    showPager: false,
    slidesPerView: 3,
    spaceBetween: 20,
    breakpoints: {
      1024: {
          slidesPerView: 5,
          spaceBetween: 15
      },
      768: {
          slidesPerView: 4,
          spaceBetween: 10
      },
      640: {
          slidesPerView: 3,
          spaceBetween: 5
      },
      320: {
          slidesPerView: 3,
          spaceBetween: 3
      }
    }
  }
  $scope.bookmark = function() {
    var book = $rootScope.$storage.bookmark;
    if ($scope.isBookmarked()) {
      var len = book.length;
      var id = undefined;
      for (var i = 0; i < len; i++) {
        if (book[i].permlink === $rootScope.sitem.permlink) {
          id = book[i]._id;
          book.splice(i, 1);
        }
      }
      if (id){
        APIs.removeBookmark(id,$rootScope.user.username).then(function(res){
          $rootScope.$storage.bookmark = book;
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNBOOKMARK'));
        });
      }
    } else {
      if (book) {
        var oo = { author:$rootScope.sitem.author,permlink:$rootScope.sitem.permlink};
        $rootScope.$storage.bookmark.push(oo);
        APIs.addBookmark($rootScope.user.username, oo ).then(function(res){
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
        });
      } else {
        var oo = { author:$rootScope.sitem.author,permlink:$rootScope.sitem.permlink};
        $rootScope.$storage.bookmark = [oo];

        APIs.addBookmark($rootScope.user.username, oo ).then(function(res){
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
        });
      }
      //$rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
    }
  };

  $scope.lastFocused;


  //http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
  $scope.insertText = function(text) {
    console.log(text);
    var input = $scope.lastFocused;
    //console.log(input);
    if (input == undefined) { return; }
    var scrollPos = input.scrollTop;
    var pos = 0;
    var browser = ((input.selectionStart || input.selectionStart == "0") ?
                   "ff" : (document.selection ? "ie" : false ) );
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart ("character", -input.value.length);
      pos = range.text.length;
    }
    else if (browser == "ff") { pos = input.selectionStart };

    var front = (input.value).substring(0, pos);
    var back = (input.value).substring(pos, input.value.length);
    input.value = front+text+back;
    pos = pos + text.length;
    if (browser == "ie") {
      input.focus();
      var range = document.selection.createRange();
      range.moveStart ("character", -input.value.length);
      range.moveStart ("character", pos);
      range.moveEnd ("character", 0);
      range.select();
    }
    else if (browser == "ff") {
      input.selectionStart = pos;
      input.selectionEnd = pos;
      input.focus();
    }
    input.scrollTop = scrollPos;
    //console.log(angular.element(input).val());
    angular.element(input).trigger('input');
  }

  $ionicPopover.fromTemplateUrl('popoverTr.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.tooltip = popover;
   });

   $scope.openTooltip = function($event, d) {
    var tppv = Number(d.pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0]-d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAST_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tpv,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(d.cashout_time, true)+"</div></div>";
    $scope.tooltipText = texth;
    $scope.tooltip.show($event);
   };

   $scope.closeTooltip = function() {
      $scope.tooltip.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.tooltip.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });


  $scope.isImages = function() {
    if ($rootScope.sitem) {
      var len = $rootScope.sitem.json_metadata.image?$rootScope.sitem.json_metadata.image.length:0;
      if (len > 0) {
        $scope.images = $rootScope.sitem.json_metadata.image;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
  $scope.zoomMin = 1;
  $scope.showImages = function(index) {
    $scope.activeSlide = index;
    $rootScope.log(angular.toJson($scope.images[index]));
    $scope.showGalleryModal('templates/gallery_images.html');
  };

  $scope.showGalleryModal = function(templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope
    }).then(function(modal) {
      $scope.modalg = modal;
      $scope.modalg.show();
    });
  }

  $scope.closeGalleryModal = function() {
    $scope.modalg.hide();
    $scope.modalg.remove()
  };

  $scope.updateSlideStatus = function(slide) {
    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
    if (zoomFactor == $scope.zoomMin) {
      $ionicSlideBoxDelegate.enableSlide(true);
    } else {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
  };

  $scope.downloadImage = function(img) {
    //window.open(img, '_system');
    $ionicPlatform.ready(function() {
      // File name only
      var filename = img.split("/").pop();
      var path;
      // Save location
      if (ionic.Platform.isAndroid()) {
        path = cordova.file.externalRootDirectory + 'Download/';
        var targetPath = path + filename;
        
        $cordovaFileTransfer.download(img, targetPath, {}, true).then(function (result) {
            console.log('Success');
            refreshMedia.refresh(targetPath);
            $ionicLoading.show({template : $filter('translate')('DOWNLOAD_COMPLETED'), duration: 1000});
        }, function (error) {
            console.log('Error');
        }, function (progress) {
            // PROGRESS HANDLING GOES HERE
          percentage = Math.floor((progress.loaded / progress.total) * 100);
          $ionicLoading.show({template : $filter('translate')('DOWNLOADING_PICTURE') +' '+ percentage + '%'});
        });

      } else {
        window.plugins.socialsharing.share(null, null, img, null);
      }
      

    });
  }

  $scope.showImg = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('CAPTURE_PICTURE') },
       { text: $filter('translate')('SELECT_PICTURE') },
       { text: $filter('translate')('SET_CUSTOM_URL') },
       { text: $filter('translate')('GALLERY') }
     ],
     titleText: $filter('translate')('INSERT_PICTURE'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
        $scope.insertImage(index);
        return true;
     }
   });
  };
  $scope.insertImage = function(type) {
    var options = {};
    if ($scope.edit) {
      if (type == 0 || type == 1) {
        options = {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: (type===0)?true:false,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
          //correctOrientation:true
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {
          setTimeout(function() {
            ImageUploadService.uploadImage(imageData).then(function(result) {
              //var url = result.secure_url || '';
              var url = result.imageUrl || '';
              var final = " ![image](" + url + ")";
              $rootScope.log(final);
              /*if ($scope.spost.body) {
                $scope.spost.body += final;
              } else {
                $scope.spost.body = final;
              }*/
              $scope.insertText(final);
              if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                $cordovaCamera.cleanup();
              }
            },
            function(err) {
              $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('UPLOAD_ERROR'));
              if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                $cordovaCamera.cleanup();
              }
            });
          }, 10);
        }, function(err) {
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('CAMERA_CANCELLED'));
        });
      } else if (type == 2){
        $ionicPopup.prompt({
          title: $filter('translate')('SET_URL'),
          template: $filter('translate')('DIRECT_LINK_PICTURE'),
          inputType: 'text',
          inputPlaceholder: 'http://example.com/image.jpg'
        }).then(function(res) {
          $rootScope.log('Your url is' + res);
          if (res) {
            var url = res.trim();
            var final = " ![image](" + url + ")";
            $rootScope.log(final);
            /*if ($scope.spost.body) {
              $scope.spost.body += final;
            } else {
              $scope.spost.body = final;
            }*/
            $scope.insertText(final);
          }
        });
      } else {
        $scope.gallery = [];
        APIs.fetchImages($rootScope.user.username).then(function(res){
          var imgs = res.data;
          if (imgs.length>0){
            $scope.showgallery = true;
            $scope.gallery.images = imgs;
          } else {
            $scope.showgallery = false;
            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('NO_IMAGE'));
            console.log('no images available')
          }
        });
      }
    } else {
      if (type == 0 || type == 1) {
        options = {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: (type===0)?true:false,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
          //correctOrientation:true
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {
          setTimeout(function() {
            ImageUploadService.uploadImage(imageData).then(function(result) {
              //var url = result.secure_url || '';
              var url = result.imageUrl || '';
              var final = " ![image](" + url + ")";
              $rootScope.log(final);
              /*if ($scope.data.comment) {
                $scope.data.comment += final;
              } else {
                $scope.data.comment = final;
              }*/
              $scope.insertText(final);
              if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                $cordovaCamera.cleanup();
              }
            },
            function(err) {
              $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('UPLOAD_ERROR'));
              if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                $cordovaCamera.cleanup();
              }
            });
          }, 10);
        }, function(err) {
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('CAMERA_CANCELLED'));
        });
      } else if (type == 2){
        $ionicPopup.prompt({
          title: $filter('translate')('SET_URL'),
          template: $filter('translate')('DIRECT_LINK_PICTURE'),
          inputType: 'text',
          inputPlaceholder: 'http://example.com/image.jpg'
        }).then(function(res) {
          $rootScope.log('Your url is' + res);
          if (res) {
            var url = res.trim();
            var final = " ![image](" + url + ")";
            $rootScope.log(final);
            /*if ($scope.data.comment) {
              $scope.data.comment += final;
            } else {
              $scope.data.comment = final;
            }*/
            $scope.insertText(final);
          }
        });
      } else {
        $scope.gallery = [];
        APIs.fetchImages($rootScope.user.username).then(function(res){
          var imgs = res.data;
          if (imgs.length>0){
            $scope.showgallery = true;
            $scope.gallery.images = imgs;
          } else {
            $scope.showgallery = false;
            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('NO_IMAGE'));
            console.log('no images available')
          }
        });
      }
    }
  };

  $ionicModal.fromTemplateUrl('templates/story.html', {
    scope: $scope  }).then(function(modal) {
    $scope.pmodal = modal;
  });
  $scope.openPostModal = function() {
    //if(!$scope.pmodal) return;
    setTimeout(function() {
      $scope.pmodal.show();
      /*angular.element("textarea").focus(function() {
        $scope.lastFocused = document.activeElement;
        console.log(document);
      });*/
    }, 10);
  };

  $rootScope.$on('closePostModal', function(){
    $scope.pmodal.hide();
  });

  $scope.closeGallery = function(){
    $scope.showgallery = false;
  }
  $scope.manageGallery = function(){
    $scope.modal.hide();
    $state.go('app.images');
  }
  var dmp = new window.diff_match_patch();

  function createPatch(text1, text2) {
      if (!text1 && text1 === '') return undefined;
      var patches = dmp.patch_make(text1, text2);
      var patch = dmp.patch_toText(patches);
      return patch;
  }
  $scope.cfocus = function(){
    $scope.lastFocused = document.activeElement;
  }
  $scope.deletePost = function(xx) {
    $rootScope.log('delete post '+ angular.toJson(xx));
    var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('DELETE_COMMENT')
    });
    confirmPopup.then(function(res) {
        if(res) {
            $rootScope.log('You are sure');
            $rootScope.$broadcast('show:loading');
            if ($rootScope.user) {
              const wif = $rootScope.user.password
              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
              : $rootScope.user.privatePostingKey;

              window.steem.broadcast.deleteComment(wif, xx.author, xx.permlink, function(err, result) {
                console.log(err, result);
                if (err) {
                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
                } else {
                  $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('DELETED_COMMENT'));
                  $state.go('app.posts');
                }
                $rootScope.$broadcast('hide:loading');
              });
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
            }
        } else {
          $rootScope.log('You are not sure');
        }
    });
  }
  $scope.edit = false;
  $scope.editPost = function(xx) {
    console.log(xx);
    $scope.edit = true;
    if (xx.parent_author !== "") {
      $scope.isreplying(xx, true, true);
    } else {
      $scope.openPostModal();  
    }
    
    setTimeout(function() {
      /*angular.element("textarea").focus(function() {
        $scope.lastFocused = document.activeElement;
        //console.log(document);
      });*/
      if (!$scope.spost.body) {
        $scope.spost = xx;
        $scope.patchbody = xx.body;
      }
      var ts = angular.fromJson(xx.json_metadata).tags;
      if (Array.isArray(ts)) {
        $scope.spost.tags = ts.join().replace(/\,/g,' ');  
      } else {
        $scope.spost.tags = ts;
      }
      
    }, 10);
    //console.log($scope.spost.operation_type);
  }

  $scope.submitStory = function() {
    if (!$scope.spost.title) {
      $rootScope.showAlert('Missing', 'Title');
      return;
    }
    if (!$scope.spost.tags) {
      $rootScope.showAlert('Missing', 'Tags');
      return;
    }
    if (!$scope.$$phase){
      $scope.$apply();
    }
    $rootScope.$broadcast('show:loading');
    if ($scope.edit) {
      var patch = createPatch($scope.patchbody, $scope.spost.body)
      // Putting body into buffer will expand Unicode characters into their true length
      if (patch && patch.length < new Buffer($scope.spost.body, 'utf-8').length) {
        $scope.spost.body2 = patch;
      }
      //$rootScope.log(patch);
    } else {
      $scope.spost.body2 = undefined;
    }

    if ($rootScope.user) {

      const wif = $rootScope.user.password
      ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
      : $rootScope.user.privatePostingKey;

      var permlink = $scope.spost.permlink;
      var jjson = $filter("metadata")($scope.spost.body);
      //console.log(jjson);
      //$scope.spost.tags = $filter('lowercase')($scope.spost.tags);
      var json = angular.merge(jjson, {tags: $scope.spost.tags.split(" "), app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' });


      var operations_array = [];
      //simultaneously
      if (!$scope.spost.operation_type) {
        operations_array = [
        ['comment', {
          parent_author: "",
          parent_permlink: $scope.spost.parent_permlink,
          author: $rootScope.user.username,
          permlink: $scope.spost.permlink,
          title: $scope.spost.title,
          body: $scope.spost.body2 || $scope.spost.body,
          json_metadata: angular.toJson(json)
        }]
        ];
      } else {
        operations_array = [
        ['comment', {
          parent_author: "",
          parent_permlink: $scope.spost.parent_permlink,
          author: $rootScope.user.username,
          permlink: $scope.spost.permlink,
          title: $scope.spost.title,
          body: $scope.spost.body2 || $scope.spost.body,
          json_metadata: angular.toJson(json)
        }],
        ['comment_options', {
          allow_curation_rewards: true,
          allow_votes: true,
          author: $rootScope.user.username,
          permlink: $scope.spost.permlink,
          max_accepted_payout: "1000000.000 "+$rootScope.$storage.platformdunit,
          percent_steem_dollars: 10000,
          extensions: $scope.edit ? []:( $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":100 }] }]] )
        }]
        ];
      }
      
      window.steem.broadcast.send({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
        console.log(err, result);
        $scope.replying = false;
        $rootScope.$broadcast('hide:loading');
        if (err) {
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
        } else {
          //$scope.closePostModal();
          $rootScope.$emit('closePostModal');
          $rootScope.$broadcast('close:popover');
          //$scope.menupopover.hide();
          
          $scope.spost = {};
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_SUBMITTED'));
          //$scope.closeMenuPopover();
          if ($scope.edit) {
            $rootScope.$emit('update:content');
          } else {
            $state.go("app.profile", {username: $rootScope.user.username});  
          }
        }
      });
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }
  $scope.addImage = function(url) {
    $scope.data.comment += ' ![image]('+url+') ';
  }
  $scope.reply = function (xx) {
    //$rootScope.log(xx);
    if (!$scope.$$phase){
      $scope.$apply();
    }
    $rootScope.$broadcast('show:loading');
    if ($rootScope.user) {
      if ($scope.editreply) {
        const wif = $rootScope.user.password
        ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
        : $rootScope.user.privatePostingKey;

        var ts = angular.fromJson($scope.post.json_metadata).tags;
        var json;
        if (Array.isArray(ts)) {
          json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || ["esteem"] , app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' };
        } else {
          json = {tags: angular.fromJson($scope.post.json_metadata).tags || ["esteem"] , app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' };
        }

        var operations_array = [];
        operations_array = [
          ['comment', {
            parent_author: $scope.post.parent_author,
            parent_permlink: $scope.post.parent_permlink,
            author: $rootScope.user.username,
            permlink: $scope.post.permlink,
            title: "",
            body: $scope.data.comment,
            json_metadata: angular.toJson(json)
          }]
          ];
        window.steem.broadcast.send({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
          //console.log(err, result);
          $rootScope.$broadcast('hide:loading');
          if (err) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
          } else {
            $scope.closeModal();
            $scope.data.comment = "";

            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
            window.steem.api.getContentReplies($rootScope.sitem.author, $rootScope.sitem.permlink, function(err, result) {
              //console.log(err, result);
              if (result) {
                for (var i = 0; i < result.length; i++) {
                  result[i] = checkVote(result[i]);
                }
                $scope.comments = result;

              }
              if (!$scope.$$phase) {
                $scope.$apply();
              }
            });
          }
        });
      } else {
        const wif = $rootScope.user.password
        ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
        : $rootScope.user.privatePostingKey;

        var t = new Date();
        var timeformat = t.getFullYear().toString()+(t.getMonth()+1).toString()+t.getDate().toString()+"t"+t.getHours().toString()+t.getMinutes().toString()+t.getSeconds().toString()+t.getMilliseconds().toString()+"z";
        var json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || ["esteem"] , app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' };

        var operations_array = [];
        operations_array = [
          ['comment', {
            parent_author: $scope.post.author,
            parent_permlink: $scope.post.permlink,
            author: $rootScope.user.username,
            permlink: "re-"+$scope.post.author.replace(/\./g, "")+"-"+timeformat,
            title: "",
            body: $scope.data.comment,
            json_metadata: angular.toJson(json)
          }],
          ['comment_options', {
            allow_curation_rewards: true,
            allow_votes: true,
            author: $rootScope.user.username,
            permlink: "re-"+$scope.post.author.replace(/\./g, "")+"-"+timeformat,  
            max_accepted_payout: "1000000.000 "+$rootScope.$storage.platformdunit,
            percent_steem_dollars: 10000,
            extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":100 }] }]]
          }]
          ];
        window.steem.broadcast.send({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
          //console.log(err, result);
          $rootScope.$broadcast('hide:loading');
          if (err) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
          } else {
            $scope.closeModal();
            $scope.data.comment = "";

            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
            window.steem.api.getContentReplies($rootScope.sitem.author, $rootScope.sitem.permlink, function(err, result) {
              //console.log(err, result);
              if (result) {
                for (var i = 0; i < result.length; i++) {
                  result[i] = checkVote(result[i]);
                }
                $scope.comments = result;
              }
              if (!$scope.$$phase) {
                $scope.$apply();
              }
            });
          }
        });
      }
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }
  $rootScope.$on("update:content", function(){
    $rootScope.log("update:content");
    setTimeout(function() {
      $scope.getContent($scope.post.author, $scope.post.permlink);  
      $rootScope.$broadcast('hide:loading');
    }, 1);
    $rootScope.$broadcast('hide:loading');
  });
  $ionicModal.fromTemplateUrl('templates/reply.html', {
    scope: $scope  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(item) {
    //if(!$scope.modal) return;
    setTimeout(function() {
      $scope.modal.show();
    }, 5);
  };

  $scope.closeModal = function() {
    $scope.replying = false;
    $scope.modal.hide();
  };

  $scope.isreplying = function(cho, xx, edit) {
    $scope.replying = xx;
    //console.log(cho, $scope.post);
    angular.merge($scope.post, cho);
    if (edit) {
      //$scope.post.author = $scope.post.parent_author;
      $scope.editreply = true;
      $scope.data.comment = cho.body;
      $scope.post.body = "";
    } else {
      $scope.post.author = $scope.post.author;
      $scope.data.comment = "";    
      $scope.editreply = false;
    }
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    if (xx) {
      $scope.openModal();
    } else {
      $scope.closeModal();
    }
  };
  $scope.accounts = {};
  $scope.getContent = function(author, permlink) {
    //console.time('someFunction1');
  
    var url = "/"+$stateParams.category+"/@"+author+"/"+permlink;
    //console.log(url);
    window.steem.api.getContent(author, permlink, function(err, result) {
      //console.log(err, result);
      if (result) {
        var len = result.active_votes.length;
        
        if ($rootScope.user) {
          for (var j = len - 1; j >= 0; j--) {
            if (result.active_votes[j].voter === $rootScope.user.username) {
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
        }
        if ($rootScope.postAccounts && $rootScope.postAccounts.indexOf(result.author) == -1) {
          $rootScope.postAccounts.push(result.author);
        }
        result.json_metadata = result.json_metadata?angular.fromJson(result.json_metadata):{};
        $scope.post = result;
        //console.log(result);
        $rootScope.sitem = result;
        
        setTimeout(function() {
          $scope.$emit('postAccounts');
        }, 10);
      }
    });
  };
  function checkVote(post) {
    var len = post.active_votes.length;
    if ($rootScope.user) {
      for (var j = len - 1; j >= 0; j--) {
        if (post.active_votes[j].voter === $rootScope.user.username) {
          if (post.active_votes[j].percent > 0) {
            post.upvoted = true;
          } else if (post.active_votes[j].percent < 0) {
            post.downvoted = true;
          } else {
            post.downvoted = false;
            post.upvoted = false;
          }
        }
      }
    }
    return post;
  }
  $scope.fetchComments = function(author, permlink){
    $rootScope.fetching = true;
    //console.log(author,permlink);

    window.steem.api.getContentReplies(author, permlink, function(err, dd) {
      //console.log(err, dd);
      if (dd) {
        for (var i = 0; i < dd.length; i++) {
          dd[i] = checkVote(dd[i]);
        }
        //console.log(dd);
        $scope.comments = dd;
        //$rootScope.$storage.comments = dd;
        //console.log(dd.active_votes);
        $rootScope.fetching = false;
        if (!$scope.$$phase){
          $scope.$apply();
        }
        for (var i = 0, len = dd.length; i < len; i++) {
          var v = dd[i];
          if ($rootScope.postAccounts && $rootScope.postAccounts.indexOf(v.author) == -1) {
            $rootScope.postAccounts.push(v.author);
          }
          if (!$scope.$$phase){
            $scope.$apply();
          }
          if (!$rootScope.$$phase){
            $rootScope.$apply();
          }
        }
        
        var p2 = document.querySelector('.my-handle');
        $scope.quotePosition = $ionicPosition.position(angular.element(p2));
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollTo(0,$scope.quotePosition.top, true); 

        setTimeout(function() {
          $scope.$emit('postAccounts');  
        }, 10);
      }
    });
  }
  $scope.$on('postAccounts', function(){
    $rootScope.paccounts = {};
    //console.log(window.Api);
    //window.Api = steemRPC.Client.get({url:localStorage.socketUrl}, true);
    window.steem.api.getAccounts($rootScope.postAccounts, function(err, res){
      //console.log(err, res);
      if (res) {
        for (var i = 0, len = res.length; i < len; i++) {
          var v = res[i];
          if (typeof v.json_metadata === 'string' || v.json_metadata instanceof String) {
            if (v.json_metadata) {
              if (v.json_metadata.indexOf("created_at")>-1) {
                v.json_metadata = angular.fromJson(angular.toJson(v.json_metadata));  
              } else {
                v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):{};
              }
              var key = v.name;
              $rootScope.paccounts[key] = v.json_metadata;
            }
          }
        }
      }
      if (!$scope.$$phase){
        $scope.$apply();
      }
    });
  });
  
  $scope.$on('$ionicView.beforeEnter', function(ev){
    //console.log(ev);
    //if(ev.targetScope !== $scope)
    //  return;
    $rootScope.log('enter postctrl');
    //$scope.user = $rootScope.$storage.user || undefined;
    $rootScope.postAccounts = [];
    $rootScope.paccounts = [];
    //$rootScope.$broadcast('show:loading');
    if ($stateParams.category === '111') {
      var ttemp = $rootScope.sitem;
      $scope.post = ttemp;
      $rootScope.$emit('update:content');
    } else {
      if ($stateParams.author.indexOf('@')>-1){
        $stateParams.author = $stateParams.author.substr(1);
      }
      $scope.getContent($stateParams.author, $stateParams.permlink);
    }
  });
  
  $scope.upvotePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'getContent');
  };
  $rootScope.$on('getContent', function() {
    setTimeout(function() {
      $scope.getContent($rootScope.sitem.author, $rootScope.sitem.permlink);  
    }, 10);
  });
  $scope.downvotePost = function(post) {
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: $filter('translate')('FLAGGING_TEXT')
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'getContent');
      } else {
        $rootScope.log('You are not sure');
      }
    });
  };
  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'getContent');
  };


  $scope.pauseVideo = function() {
    var fr = document.getElementsByTagName("iframe")[0];
    if (fr) {
      var iframe = fr.contentWindow;
      iframe.postMessage('{"event":"command","func":"' + 'pauseVideo' +   '","args":""}', '*');
    }
  }


  $scope.playVideo = function() {
    var fr = document.getElementsByTagName("iframe")[0];
    if (fr) {
      var iframe = fr.contentWindow;
      iframe.postMessage('{"event":"command","func":"' + 'playVideo' +   '","args":""}', '*');
    }
  }


  $scope.$on('$ionicView.beforeLeave', function(){
    $scope.pauseVideo();
  });

})
app.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {

  $scope.removeBookmark = function(index) {
    if ($rootScope.$storage.bookmark) {
      APIs.removeBookmark($rootScope.$storage.bookmark[index]._id,$rootScope.user.username).then(function(res){
        $rootScope.$storage.bookmark.splice(index,1);
        $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNBOOKMARK'));
      });
    }
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.getBookmarks($rootScope.user.username).then(function(res){
      //console.log(res);
      $rootScope.$storage.bookmark = res.data;
    });
  });
});

app.controller('DraftsCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {
  //JSON.stringify({
  $scope.removeDraft = function(_id) {
    APIs.removeDraft(_id,$rootScope.user.username).then(function(res){
      APIs.getDrafts($rootScope.user.username).then(function(res){
        //console.log(res);
        $scope.drafts = res.data;
      });
      $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNDRAFT'));
    });
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.getDrafts($rootScope.user.username).then(function(res){
      //console.log(res);
      $scope.drafts = res.data;
    });
  });
});

app.controller('ImagesCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {
  //JSON.stringify({
  $scope.removeImage = function(_id) {
    APIs.removeImage(_id,$rootScope.user.username).then(function(res){
      APIs.fetchImages($rootScope.user.username).then(function(res){
        //console.log(res);
        $scope.images = res.data;
      });
      $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('IMAGE_REMOVED'));
    });
  };
  $scope.copyImage = function(url){
    cordova.plugins.clipboard.copy(url);
  };
  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.fetchImages($rootScope.user.username).then(function(res){
      //console.log(res);
      $scope.images = res.data;
    });
  });
});

app.controller('NotificationsCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate) {

  $scope.removeNotification = function(index) {
    if ($rootScope.$storage.notifications) {
      $rootScope.$storage.notifications.splice(index,1);
    }
  };
})
app.controller('FollowCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate) {
  $scope.searchu = {};

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = "followers";
    $scope.followers = [];
    $scope.following = [];
    $scope.limit = 100;
    $scope.tt = {ruser:"", duser:""};

    $scope.rfetching = function(){
      window.steem.api.getFollowers($rootScope.user.username, $scope.tt.ruser, "blog", $scope.limit, function(err, res) {
        console.log(err, res);
        if (res && res.length===$scope.limit) {
          $scope.tt.ruser = res[res.length-1].follower;
        }
        //console.log(res);
        var ll = res.length;
        for (var i = 0; i < ll; i++) {
          res[i].id += 1;
          $scope.followers.push(res[i]);
        }
        if (res.length < $scope.limit) {
          if (!$scope.$$phase){
            $scope.$apply();
          }
        } else {
          setTimeout($scope.rfetching, 20);
        }
      });
    };

    $scope.dfetching = function(){
      window.steem.api.getFollowing($rootScope.user.username, $scope.tt.duser, "blog", $scope.limit, function(err, res) {
        console.log(err, res);
        if (res && res.length===$scope.limit) {
          $scope.tt.duser = res[res.length-1].following;
        }
        var ll = res.length;

        //console.log(res);
        for (var i = 0; i < ll; i++) {
          res[i].id += 1;
          $scope.following.push(res[i]);
        }
        if (res.length<$scope.limit) {
          if (!$scope.$$phase){
            $scope.$apply();
          }
        } else {
          setTimeout($scope.dfetching, 20);
        }
      });
    };

    $scope.rfetching();
    $scope.dfetching();

  });

  $scope.$on('$ionicView.leave', function(){
  });
  $scope.isFollowed = function(x) {
    var len = $scope.following.length;
    for (var i = 0; i < len; i++) {
      if ($scope.following[i].following == x) {
        return true;
      }
    }
    return false;
  };
  $scope.isFollowing = function(x) {
    var len = $scope.followers.length;
    for (var i = 0; i < len; i++) {
      if ($scope.followers[i].follower == x) {
        return true;
      }
    }
    return false;
  };
  $scope.change = function(type){
    $scope.active = type;
    console.log(type);

    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $ionicScrollDelegate.$getByHandle('listScroll').scrollTop();
    //$scope.loadMore(type);
  }

  $scope.$on('current:reload', function(){
    $rootScope.log('current:reload');
    //$state.go($state.current, {}, {reload: true});
    $scope.followers = [];
    $scope.following = [];
    $scope.rfetching();
    $scope.dfetching();
  });

  $scope.unfollowUser = function(xx){
    $rootScope.following(xx, "unfollow");
  };
  $scope.followUser = function(xx){
    $rootScope.following(xx, "follow");
  };
  $scope.profileView = function(xx){
    $state.go('app.profile', {username: xx});
  };

})

app.controller('ProfileCtrl', function($scope, $stateParams, $rootScope, $ionicActionSheet, $cordovaCamera, ImageUploadService, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, $state, APIs, $ionicPopover, $filter, $ionicModal) {

  $ionicPopover.fromTemplateUrl('popoverSliderrp.html', {
      scope: $scope
  }).then(function(popover) {
      $scope.tooltipSlider = popover;
  });
  
  $scope.openSlider = function($event, d) {
    $scope.votingPost = d;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $scope.rangeValue = $rootScope.$storage.voteWeight/100;
    $scope.tooltipSlider.show($event);
  };

  $scope.drag = function(v) {
    //console.log(v);
    $rootScope.$storage.voteWeight = v*100;
  }
  $scope.votePostS = function() {
    $scope.tooltipSlider.hide();
    $scope.upvotePost($scope.votingPost);
  };

  $scope.closeSlider = function() {
    $scope.tooltipSlider.hide();
  };

  $scope.translationData = { platformname: $rootScope.$storage.platformname, platformpower: $rootScope.$storage.platformpower, platformsunit:"$1.00" };

  $scope.goBack = function() {
    var viewHistory = $ionicHistory.viewHistory();
    if (!viewHistory.backView) {
      $scope.openMenu();
    } else {
      $ionicHistory.goBack();
    }
  };
  $scope.followUser = function(xx){
    $rootScope.following(xx, "follow");
  };
  $scope.unfollowUser = function(xx){
    $rootScope.log(xx);
    $rootScope.following(xx, "unfollow");
  };

  $scope.$on('current:reload', function(){
    $state.go($state.current, {}, {reload: true});
  });

  $ionicPopover.fromTemplateUrl('popoverPTr.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.tooltip = popover;
   });

   $scope.openTooltip = function($event, d) {
    var tppv = Number(d.pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0]-d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAST_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tpv,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(d.cashout_time, true)+"</div></div>";
    $scope.tooltipText = texth;
    $scope.tooltip.show($event);
   };

   $scope.closeTooltip = function() {
      $scope.tooltip.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.tooltip.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });

  $ionicModal.fromTemplateUrl('my-edit.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalEdit = modal;
  });
  $scope.closeEdits = function() {
    $scope.modalEdit.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modalEdit.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  $scope.edit = {};
  $scope.showEdits = function() {
    //showedits
    $scope.edit = {};
    $scope.edit = $rootScope.user.json_metadata || {};
    $scope.modalEdit.show();
  }
  $scope.saveEdit = function(){
    console.log($scope.edit);
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: ""
    });
    confirmPopup.then(function(res) {
      if(res) {
        if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
          $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
        } else {
          var update = $rootScope.user.json_metadata;
          angular.merge(update, $scope.edit);
          if (update.profilePicUrl) {delete update.profilePicUrl;}
          $rootScope.log('You are sure');
          if ($rootScope.user) {

            const wif = $rootScope.user.password
            ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
            : $rootScope.$storage.user.privateActiveKey;

            window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
              //$rootScope.$storage.user.memo_key
              console.log(err, result);
              $scope.modalEdit.hide();
              if (err) {
                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
              } else {
                $rootScope.$broadcast('refreshLocalUserData');
              }
            });
            $rootScope.$broadcast('hide:loading');
          } else {
            $rootScope.$broadcast('hide:loading');
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
          }
        }
      }
    });
  }
  $scope.showProfile = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('CAPTURE_PICTURE') },
       { text: $filter('translate')('SELECT_PICTURE') },
       { text: $filter('translate')('SET_CUSTOM_URL') },
     ],
     destructiveText: $filter('translate')('RESET'),
     titleText: $filter('translate')('MODIFY_PICTURE'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
      if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
      } else {
        $scope.changeProfileInfo(index, 'profile');
      }
      return true;
     },
     destructiveButtonClicked: function(index){
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('RESET_PICTURE_TEXT')
      });
      confirmPopup.then(function(res) {
        if(res) {
          if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
            $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
          } else {
            var update = {profile: {profile_image:""} };
            angular.merge(update, $rootScope.user.json_metadata);
            if (update.profilePicUrl) {delete update.profilePicUrl;}

            update.profile.profile_image = "";

            $rootScope.log('You are sure');
            if ($rootScope.user) {
              
              const wif = $rootScope.user.password
              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
              : $rootScope.user.privateActiveKey;

              window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
                console.log(err, result);
                $scope.modalEdit.hide();
                if (err) {
                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
                } else {
                  $rootScope.$broadcast('refreshLocalUserData');
                }
              });
              $rootScope.$broadcast('hide:loading');
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
            }
          }
        } else {
          $rootScope.log('You are not sure');
        }
      });
      return true;
     }
   });
  };


  $scope.changeProfileInfo = function(type, which) {
    if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
      $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
    } else {
      var options = {};
      if (type == 0 || type == 1) {
        options = {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: (type===0)?true:false,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: which==='profile'?500:1000,
          targetHeight: 500,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
          //correctOrientation:true
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {
          ImageUploadService.uploadImage(imageData).then(function(result) {
            //var url = result.secure_url || '';
            var url = result.imageUrl || '';
            var update = { profile: { cover_image: "", profile_image: ""} };
            if (which === 'profile') {
              angular.merge(update, $rootScope.user.json_metadata);
              if (update.profilePicUrl) {delete update.profilePicUrl;}
              update.profile.profile_image = url;
            } else {
              angular.merge(update, $rootScope.user.json_metadata);
              update.profile.cover_image = url;
            }

            setTimeout(function() {
              $rootScope.$broadcast('show:loading');
              if ($rootScope.user) {

                const wif = $rootScope.user.password
                ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
                : $rootScope.user.privateActiveKey;

                window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
                  console.log(err, result);
                  $scope.modalEdit.hide();
                  if (err) {
                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0]);
                  } else {
                    $rootScope.$broadcast('refreshLocalUserData');
                  }
                });
              $rootScope.$broadcast('hide:loading');
              } else {
                $rootScope.$broadcast('hide:loading');
                $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
              }
            }, 5);
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          },
          function(err) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('UPLOAD_ERROR'));
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          });
        }, function(err) {
          $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('CAMERA_CANCELLED'));
        });
      } else {
        $ionicPopup.prompt({
          title: $filter('translate')('SET_URL'),
          template: $filter('translate')('DIRECT_LINK_PICTURE'),
          inputType: 'text',
          inputPlaceholder: 'http://example.com/image.jpg'
        }).then(function(res) {
          $rootScope.log('Your url is'+ res);
          if (res) {
            var update = { profile: { profile_image: "", cover_image:"" } };
            if (which==="profile") {
              angular.merge(update, $rootScope.user.json_metadata);
              if (update.profilePicUrl) {delete update.profilePicUrl;}
              update.profile.profile_image = res;
            } else {
              angular.merge(update, $rootScope.user.json_metadata);
              update.profile.cover_image = res;
            }

            setTimeout(function() {
              if ($rootScope.user) {

                const wif = $rootScope.user.password
                ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'active')
                : $rootScope.user.privateActiveKey;
                console.log($rootScope.user.memo_key);
                window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
                  console.log(err, result);
                  $scope.modalEdit.hide();
                  if (err) {
                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
                  } else {
                    //$scope.refreshLocalUserData();
                    $rootScope.$broadcast('refreshLocalUserData');
                  }
                });
                $rootScope.$broadcast('hide:loading');
              } else {
                $rootScope.$broadcast('hide:loading');
                $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
              }
            }, 5);
          }
        });
      }
    }
  };

  $scope.showCover = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: $filter('translate')('CAPTURE_PICTURE') },
       { text: $filter('translate')('SELECT_PICTURE') },
       { text: $filter('translate')('SET_CUSTOM_URL') },
     ],
     destructiveText: $filter('translate')('RESET'),
     titleText: $filter('translate')('MODIFY_COVER_PICTURE'),
     cancelText: $filter('translate')('CANCEL'),
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
      if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
      } else {
        $scope.changeProfileInfo(index, 'cover');
      }
      return true;
     },
     destructiveButtonClicked: function(index){
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('RESET_COVER_PICTURE_TEXT')
      });
      confirmPopup.then(function(res) {
        if(res) {
          if (!$rootScope.user.password && !$rootScope.user.privateActiveKey) {
            $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
          } else {
            var update = {profile: {cover_image:""} };
            angular.merge(update, $rootScope.user.json_metadata);
            update.profile.cover_image = "";

            $rootScope.log('You are sure');
            if ($rootScope.user) {

              const wif = $rootScope.user.password
              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'owner')
              : $rootScope.user.privateOwnerKey;

              window.steem.broadcast.accountUpdate(wif, $rootScope.user.username, undefined, undefined, undefined, $rootScope.user.memo_key, JSON.stringify(update), function(err, result) {
                console.log(err, result);
                $scope.modalEdit.hide();
                if (err) {
                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0])
                } else {
                  //$scope.refreshLocalUserData();
                  $rootScope.$broadcast('refreshLocalUserData');
                }
              });
              $rootScope.$broadcast('hide:loading');
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
            }
          }
        } else {
          $rootScope.log('You are not sure');
        }
      });
      return true;
     }
   });
  };


  $rootScope.$on('profileRefresh', function(){
    $scope.refresh();
  });
  $scope.upvotePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'profileRefresh');
  };
  $scope.downvotePost = function(post) {
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('ARE_YOU_SURE'),
      template: $filter('translate')('FLAGGING_TEXT')
    });
    confirmPopup.then(function(res) {
      if(res) {
        $rootScope.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'profileRefresh');
      } else {
        $rootScope.log('You are not sure');
      }
    });
  };
  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'profileRefresh');
  };

  $scope.isAmFollowing = function(xx) {
    if ($scope.following && $scope.following.indexOf(xx)!==-1) {
      return true;
    } else {
      return false;
    }
  };
  /*$scope.$watch('following', function() {
    console.log('hey, myVar has changed!');
  });*/
  $scope.ifExists = function(xx){
    for (var i = 0; i < $scope.data.profile.length; i++) {
      if ($scope.data.profile[i].permlink === xx){
        return true;
      }
    }
    return false;
  }
  $scope.end = false;
  $scope.clen = 20;
  $scope.moreDataCanBeLoaded = function(){
    return ($scope.data.profile && $scope.data.profile.length>0) && !$scope.end;
  }

  $scope.loadmore = function() {
    //console.log('loadmore');
    var params = {tag: $stateParams.username, limit: 15, filter_tags:[]};
    var len = $scope.data.profile?$scope.data.profile.length:0;

    if (!$scope.$$phase){
      $scope.$apply();
    } else {
      console.log('phased', len);
    }
    if (len < 15) {
      $scope.end = true;
    }
    if (len>0) {
      //delete params.limit;
      var ll = $scope.data.profile.length;
      params.start_author = $scope.data.profile[ll-1].author;
      params.start_permlink = $scope.data.profile[ll-1].permlink;

      if ($scope.end) {
        //$rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('REQUEST_LIMIT_TEXT'));
        $scope.$broadcast('scroll.infiniteScrollComplete');
        //$rootScope.$broadcast('hide:loading');
      } else {
        //console.log(params);
        //$rootScope.log("fetching profile...blog 20 ");
        if ($scope.active == 'blog') {
          if ($rootScope.$storage.chain == 'golos') {
            params.select_authors = [$stateParams.username];
            delete params.tags;   
          }
          window.steem.api.getDiscussionsByBlog(params, function(err, response) {
            //console.log(err, response, params);
            if (response) {
              if (response.length <= 1) {
                $scope.end = true;
              } else {
                $scope.end = false;
              }
              for (var j = 0; j < response.length; j++) {
                var v = response[j];

                v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;

                var found = false;
                for (var i = $scope.data.profile.length-1; i >= 0; i--) {
                  if ($scope.data.profile[i].id === v.id){
                    found = true;
                    //console.log($scope.data.profile[i].id, v.id);
                  }
                }
                if (!found){
                  //console.log(v.id);
                  if ($rootScope.user){
                    if ($rootScope.user.username !== v.author) {
                      v.reblogged = true;
                    }
                    var len = v.active_votes.length;
                    for (var j = len - 1; j >= 0; j--) {
                      if (v.active_votes[j].voter === $rootScope.user.username) {
                        if (v.active_votes[j].percent > 0) {
                          v.upvoted = true;
                        } else if (v.active_votes[j].percent < 0) {
                          v.downvoted = true;
                        } else {
                          v.upvoted = false;
                          v.downvoted = false;
                        }
                      }
                    }
                  }
                  $scope.data.profile.push(v);  
                }
                if(!$scope.$$phase){
                  $scope.$apply();
                }
              }
            }
            if(!$scope.$$phase){
              $scope.$apply();
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
          });
          if(!$scope.$$phase){
            $scope.$apply();
          }
        }
        if ($scope.active == 'posts') {
          window.steem.api.getDiscussionsByComments(params, function(err, response) {
            //console.log(err, response);
            if (response) {
              if (response.length <= 1) {
                $scope.end = true;
              } else {
                $scope.end = false;
              }
              for (var j = 0; j < response.length; j++) {
                var v = response[j];
                v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;
                !$scope.$$phase?$scope.$apply():console.log('phased');
                var found = false;
                for (var i = $scope.data.profile.length-1; i >= 0; i--) {
                  if ($scope.data.profile[i].id === v.id){
                    found = true;
                    //console.log($scope.data.profile[i].id, v.id);
                  }
                }
                if (!found){
                  //console.log(v.id);
                  if ($rootScope.user){
                    if ($rootScope.user.username !== v.author) {
                      v.reblogged = true;
                    }
                    var len = v.active_votes.length;
                    for (var j = len - 1; j >= 0; j--) {
                      if (v.active_votes[j].voter === $rootScope.user.username) {
                        if (v.active_votes[j].percent > 0) {
                          v.upvoted = true;
                        } else if (v.active_votes[j].percent < 0) {
                          v.downvoted = true;
                        } else {
                          v.upvoted = false;
                          v.downvoted = false;
                        }
                      }
                    }
                  }
                  $scope.data.profile.push(v);
                }
                if (response.length <= 1) {
                  $scope.end = true;
                } else {
                  $scope.end = false;
                }
              }
            }
          });
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        if ($scope.active == 'recent-replies') {
          var pp = [, , 20];

          window.steem.api.getRepliesByLastUpdate($scope.data.profile[$scope.data.profile.length-1].author, $scope.data.profile[$scope.data.profile.length-1].permlink, 20, function(err, response) {
            console.log(err, response);
            if (response) {
              if (response.length <= 1) {
                $scope.end = true;
              } else {
                $scope.end = false;
              }
              for (var j = 0; j < response.length; j++) {
                var v = response[j];
                v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;
                !$scope.$$phase?$scope.$apply():console.log('phased');
                var found = false;
                for (var i = $scope.data.profile.length-1; i >= 0; i--) {
                  if ($scope.data.profile[i].id === v.id){
                    found = true;
                    //console.log($scope.data.profile[i].id, v.id);
                  }
                }
                if (!found){
                  //console.log(v.id);
                  if ($rootScope.user){
                    if ($rootScope.user.username !== v.author) {
                      v.reblogged = true;
                    }
                    var len = v.active_votes.length;
                    for (var j = len - 1; j >= 0; j--) {
                      if (v.active_votes[j].voter === $rootScope.user.username) {
                        if (v.active_votes[j].percent > 0) {
                          v.upvoted = true;
                        } else if (v.active_votes[j].percent < 0) {
                          v.downvoted = true;
                        } else {
                          v.upvoted = false;
                          v.downvoted = false;
                        }
                      }
                    }
                  }
                  $scope.data.profile.push(v);
                }
                if (response.length <= 1) {
                  $scope.end = true;
                } else {
                  $scope.end = false;
                }
              }
            }
          });
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        //console.log($scope.profile);
      }
    }

  }
  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.user = {username: $stateParams.username};
    $scope.follower = [];
    $scope.following = [];
    $scope.limit = 15;
    $scope.tt = {duser: "", ruser: ""};

    $scope.refresh = function() {
      if (!$scope.active) {
        $scope.active = "blog";
      }
      if ($scope.active != "blog") {
        $scope.rest = "/"+$scope.active;
      } else {
        $scope.rest = "";
      }

      $scope.nonexist = false;

      window.steem.api.getState("/@"+$stateParams.username+$scope.rest, function(err, res) {
        //console.log(err, res);
        if (res) {
          $scope.data = {profile: []};
          //console.log(res);
          if (Object.keys(res.content).length>0) {
            angular.forEach(res.content, function(v,k){
              v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;
              if ($rootScope.user){
                if ($rootScope.user.username !== v.author) {
                  v.reblogged = true;
                }
                var len = v.active_votes.length;
                for (var j = len - 1; j >= 0; j--) {
                  if (v.active_votes[j].voter === $rootScope.user.username) {
                    if (v.active_votes[j].percent > 0) {
                      v.upvoted = true;
                    } else if (v.active_votes[j].percent < 0) {
                      v.downvoted = true;
                    } else {
                      v.upvoted = false;
                      v.downvoted = false;
                    }
                  }
                }
              }
              $scope.data.profile.push(v);
            });
            $scope.nonexist = false;
            if(!$scope.$$phase){
              $scope.$apply();
            }
          } else {
            $scope.nonexist = true;
          }
        }
      });
    };
    $scope.dfetching = function(){
      window.steem.api.getFollowing($rootScope.user.username, $scope.tt.duser, "blog", $scope.limit, function(err, res) {
        //console.log(err, res);
        if (res && res.length===$scope.limit) {
          $scope.tt.duser = res[res.length-1].following;
        }
        var len = res.length;
        for (var i = 0; i < len; i++) {
          $scope.following.push(res[i].following);
        }
        if (res.length<$scope.limit) {
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        } else {
          setTimeout($scope.dfetching, 20);
        }
      });
    };
    $scope.rfetching = function(){
      window.steem.api.getFollowers($rootScope.user.username, $scope.tt.ruser, "blog", $scope.limit, function(err, res) {
        console.log(err, res);
        if (res && res.length===$scope.limit) {
          $scope.tt.ruser = res[res.length-1].follower;
        }
        var len = res.length;
        for (var i = 0; i < len; i++) {
          $scope.follower.push(res[i].follower);
        }
        if (res.length<$scope.limit) {
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        } else {
          setTimeout($scope.rfetching, 20);
        }
      });
    };
    $scope.getFollows = function(r,d) {      
      if (r) {
        $rootScope.log("rfetching");
        $scope.rfetching();
      }
      if (d) {
        $rootScope.log("dfetching");
        $scope.dfetching();
      }
    };
    $scope.getOtherUsersData = function() {
      console.log("getOtherUsersData");
      window.steem.api.getAccounts([$stateParams.username], function(err, dd){
        //console.log(err, dd);
        dd = dd[0];
        if (dd && dd.json_metadata) {
          dd.json_metadata = angular.fromJson(dd.json_metadata);
        }
        angular.merge($scope.user, dd);
        //console.log(angular.toJson($scope.user));
        //console.log($scope.user.json_metadata.profile.cover_image);

        if ($rootScope.user) {
          $scope.css = ($rootScope.user.username === $scope.user.username && $rootScope.user.json_metadata.profile.cover_image) ? {'background': 'url('+$rootScope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed', 'box-shadow':'inset 0 0 0 2000px rgba(255,0,150,0.3)' } : ($rootScope.user.username !== $scope.user.username && ($scope.user.json_metadata && $scope.user.json_metadata.profile && $scope.user.json_metadata.profile.cover_image)) ? {'background': 'url('+$scope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed', 'box-shadow':'inset 0 0 0 2000px rgba(0,0,0,0.5)'} : null;
        } else {
          $scope.css = null;
        }
        //console.log($scope.css);
        if (!$scope.$$phase){
          $scope.$apply();
        }
      });
      window.steem.api.getFollowCount($stateParams.username, function(err, res) {
        //console.log(err, res);
        $scope.followdetails = res;
      });
      $scope.getFollows(null, "d");
      if(!$scope.$$phase){
        $scope.$apply();
      }
    };

    $scope.refresh();
    if ($rootScope.user) {
      if ($rootScope.user.username !== $stateParams.username) {
        $scope.getOtherUsersData();
      } else {
        $rootScope.log("get follows counts");
        window.steem.api.getFollowCount($stateParams.username, function(err, res) {
          //console.log(err, res);
          if (res)
            $scope.followdetails = res;
        });
      }
    } else {
      if ($stateParams.username) {
        $scope.getOtherUsersData();
      }
    }

    //setTimeout(function() {
      //$scope.css = ($rootScope.$storage.user&& $rootScope.$storage.user.username === $scope.user.username && $rootScope.$storage.user.json_metadata && $rootScope.$storage.user.json_metadata.profile && $rootScope.$storage.user.json_metadata.profile.cover_image) ? {'background': 'linear-gradient(rgba(255, 0, 0, 0.45), rgba(255, 0, 0, 0.45)), url('+$rootScope.$storage.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed'} : ($rootScope.$storage.user && $rootScope.$storage.user.username !== $scope.user.username && ($scope.user.json_metadata && $scope.user.json_metadata.profile && $scope.user.json_metadata.profile.cover_image)) ? {'background': 'url('+$scope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed'} : null;
    //}, 1);

  });
  $scope.openMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }
  $scope.change = function(type){
    $scope.data = undefined;
    console.log(type);
    $scope.data = {profile: []};
    $scope.accounts = [];
    $scope.active = type;
    $scope.end = false;
    
    if(!$scope.$$phase){
      $scope.$apply();
    }

    if (type != "blog") {
      $scope.rest = "/"+type;
    } else {
      $scope.rest = "";
    }
    window.steem.api.getState("/@"+$stateParams.username+$scope.rest, function(err, res) {
      //console.log(err, res);
      if (res.content) {
        if (Object.keys(res.content).length>0) {
          angular.forEach(res.content, function(v,k){
            v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;
            if ($rootScope.user){
              if ($rootScope.user.username !== v.author) {
                v.reblogged = true;
              }
              var len = v.active_votes.length;
              for (var j = len - 1; j >= 0; j--) {
                if (v.active_votes[j].voter === $rootScope.user.username) {
                  if (v.active_votes[j].percent > 0) {
                    v.upvoted = true;
                  } else if (v.active_votes[j].percent < 0) {
                    v.downvoted = true;
                  } else {
                    v.upvoted = false;
                    v.downvoted = false;
                  }
                }
              }
            }
            $scope.data.profile.push(v);
          });
          $scope.nonexist = false;
        } else {
          $scope.nonexist = true;
        }
        if(!$scope.$$phase){
          $scope.$apply();
        }
      }
      if (type==="transfers" || type==="permissions") {
        for (var property in res.accounts) {
          if (res.accounts.hasOwnProperty(property)) {
            $scope.accounts = res.accounts[property];
            //$rootScope.log(angular.toJson(res.accounts[property].transfer_history));

            $scope.transfers = res.accounts[property].transfer_history.slice(Math.max(res.accounts[property].transfer_history.length - 50, 0))//res.accounts[property].transfer_history;
            //console.log(res.transfers);
            $scope.nonexist = false;
          }
        }
        if(!$scope.$$phase){
          $scope.$apply();
        }
      }
    });
  }
  $scope.claim_rewards = function(){
    if ($rootScope.user) {

      const wif = $rootScope.user.password
      ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
      : $rootScope.user.privatePostingKey;

      window.steem.broadcast.claimRewardBalance(wif, $rootScope.user.username, $scope.accounts.reward_steem_balance, $scope.accounts.reward_sbd_balance, $scope.accounts.reward_vesting_balance, function(err, result) {
        console.log(err, result);
        if (err) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+err.message.split(":")[2].split('.')[0]);
          } else {
            $scope.change('transfers');
          }
          $rootScope.$broadcast('hide:loading');
      });

      $rootScope.$broadcast('hide:loading');
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    } else {
      $rootScope.$broadcast('hide:loading');
      post.invoting = false;
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }
})

app.controller('ExchangeCtrl', function($scope, $stateParams, $rootScope, $filter) {
  $scope.username = $stateParams.username;

  var power = 100;
  var precision = 1000;

  function generateBidAsk(bidsArray, asksArray) {
    // Input raw orders (from TOP of order book DOWN), output grouped depth
    function aggregateOrders(orders) {
        if(typeof orders == 'undefined') {
          return [];
        }
        let ttl = 0
        return orders.map( o => {
            ttl += o.sbd;
            return [parseFloat(o.real_price) * power, ttl]
        }).sort((a, b) => { // Sort here to make sure arrays are in the right direction for HighCharts
            return a[0] - b[0];
        });
    }
    var bids = aggregateOrders(bidsArray);

    // Insert a 0 entry to make sure the chart is centered properly
    bids.unshift([0, bids[0][1]]);
    var asks = aggregateOrders(asksArray);
    // Insert a final entry to make sure the chart is centered properly
    asks.push([asks[asks.length - 1][0] * 4, asks[asks.length - 1][1]]);
    
    return {bids, asks};
  }

  function getMinMax(bids, asks) {
      var highestBid = bids.length ? bids[bids.length-1][0] : 0;
      var lowestAsk = asks.length ? asks[0][0] : 1;

      var middle = (highestBid + lowestAsk) / 2;

      return {
          min: Math.max(middle * 0.65, bids[0][0]),
          max: Math.min(middle * 1.35, asks[asks.length-1][0])
      }
  }

  function generateDepthChart(bidsArray, asksArray) {
    var dd = generateBidAsk(bidsArray, asksArray);
    let series = [];
    //console.log(dd);

    var mm = getMinMax(dd.bids, dd.asks);
    //if(process.env.BROWSER) {
        /*if(dd.bids[0]) {
            series.push({step: 'right', name: $filter('translate')('BUY'), color: 'rgba(0,150,0,1.0)', fillColor: 'rgba(0,150,0,0.2)', tooltip: {valueSuffix: ' STEEM'},
             data:  dd.bids})
        }
        if(dd.asks[0]) {
            series.push({step: 'left', name: $filter('translate')('SELL'), color: 'rgba(150,0,0,1.0)', fillColor: 'rgba(150,0,0,0.2)', tooltip: {valueSuffix: ' STEEM'},
             data: dd.asks})
        }*/
    //}
    
    var depth_chart_config = {
        title:    {text: null},
        subtitle: {text: null},
        chart:    {type: 'area', zoomType: 'x'},
        //chartType: 'stock',
        xAxis:    {
            min: mm.min,
            max: mm.max,
            labels: {
                formatter: function() {return this.value / power;}
            },
            ordinal: false,
            lineColor: "#000000",
            title: {
                text: null
            }
        },
        yAxis:    {
            title: {text: null},
            lineWidth: 2,
            labels: {
                //align: "left",
                formatter: function () {
                  //console.log(this.value, precision);
                    var value = this.value/precision;
                    return '$' + (value > 10e6 ? (value/10e6) + "M" :
                        value > 10000 ? (value/10e3) + "k" :
                        value);
                }
            },
            gridLineWidth: 1,
        },
        legend: {enabled: false},
        credits: {
            enabled: false
        },
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        dataGrouping: {
            enabled: false
        },
        plotOptions: {series: {animation: false}},
        //series,
        series: [{
            type: 'area',
            step: 'right', 
            name: $filter('translate')('BUY'), 
            color: 'rgba(0,150,0,1.0)', 
            fillColor: 'rgba(0,150,0,0.2)', 
            tooltip: {
              shared: false,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              headerFormat: null,
              pointFormatter: function() {
                var ll = '<span>\u25CF</span><span>'+$filter('translate')('PRICE')+': '+(this.x / power).toFixed(6)+' '+$filter('getCurrencySymbol')($rootScope.$storage.currency)+'/'+$rootScope.$storage.platformlunit+'</span><br/><span>\u25CF</span>'+this.series.name+': <b>'+(this.y / 1000).toFixed(3)+' '+$filter('getCurrencySymbol')($rootScope.$storage.currency)+ '('+$rootScope.$storage.platformdunit+')</b>';
                return ll;
              }
            },
            data:  dd.bids,
            style: {
                color: "#FFFFFF"
            }
          },
          {
            type: 'area',
            step: 'left', 
            name: $filter('translate')('SELL'), 
            color: 'rgba(150,0,0,1.0)', 
            fillColor: 'rgba(150,0,0,0.2)', 
            tooltip: {
              shared: false,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              headerFormat: null,
              pointFormatter: function() {
              var ll = '<span>\u25CF</span><span>'+$filter('translate')('PRICE')+': '+(this.x / power).toFixed(6)+' '+$filter('getCurrencySymbol')($rootScope.$storage.currency)+'/'+$rootScope.$storage.platformlunit+'</span><br/><span>\u25CF</span>'+this.series.name+': <b>'+(this.y / 1000).toFixed(3)+' '+$filter('getCurrencySymbol')($rootScope.$storage.currency)+ '('+$rootScope.$storage.platformdunit+')</b>';
              return ll;
              }
            },
            data: dd.asks,
            style: {
                color: "#FFFFFF"
            }
          }]
    };
    //------------------------------
    return depth_chart_config;
  }

  function generateHistory(historyArray){
    if(typeof historyArray == 'undefined') {
      return [];
    }

    var nh = historyArray.map(function(h) {
        //console.log(h);
        var o = parseFloat(h.open_pays.split(' ')[0]);
        var c = parseFloat(h.current_pays.split(' ')[0]);
        var p = c/o;
        h.price = p;
      return h;
    });
    var prices = [];
    var dates = [];
    for (var i = 0; i < nh.length; i++) {
      dates.push($filter('timeago')(nh[i].date));
      prices.push(nh[i].price);
    }
    var x = dates.reverse();
    var y = prices.reverse();
    return {x, y};
  };
  
  function generateHistoryChart(historyArray) {
    
    var ddd = generateHistory(historyArray);
    

    var history_chart_config = {
        title:    {text: null},
        subtitle: {text: null},
        //chart:    {type: 'area', zoomType: 'x'},
        //chartType: 'stock',
        xAxis: {
            categories: ddd.x
        },
        yAxis: {
          title: {
                text: null
            }
        },
        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat: '<small>{point.key}</small><table>',
            pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
                '<td style="text-align: right"><b>{point.y} EUR</b></td></tr>',
            footerFormat: '</table>',
            valueDecimals: 2
        },

        series: [{
            name: 'Price',
            data: ddd.y
        }],
        legend: {enabled: false},
        credits: {
            enabled: false
        },
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        dataGrouping: {
            enabled: false
        },
        plotOptions: {series: {animation: false}},
    };
    //------------------------------
    return history_chart_config;
  }


  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = 'buy';
    $scope.orders = [];
    window.steem.api.getOrderBook(25, function(err, result) {
      console.log(err, result);
      $scope.orders = result;

      //setTimeout(function() {
        $scope.depth_chart_config = generateDepthChart($scope.orders.bids, $scope.orders.asks);
        //console.log($scope.depth_chart_config);
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      //},1);
      
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    $scope.change = function(type){
      $scope.active = type;
      if (type == "open"){
        window.steem.api.getOpenOrders($stateParams.username, function(err, result) {
          //console.log(err, result);
          $scope.openorders = result;
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });
      }
      if (type == "history"){
        $scope.history = [];
        window.steem.api.getRecentTrades(25, function(err, result) {
          $scope.recent_trades = result;
          //console.log(result);

          //setTimeout(function() {
            $scope.history_chart_config = generateHistoryChart($scope.recent_trades);
            //console.log($scope.depth_chart_config);
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          //},1);

          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });
      }
    };
  });

});
app.controller('MarketCtrl', function($scope, $rootScope, $state, $ionicPopover, $ionicPopup, $filter, $translate, $ionicPlatform, $window) {

  $scope.requestApp = function(name) {
    $ionicPlatform.ready(function() {
      if (name == 'New') {
        window.open("mailto:info@esteem.ws?subject=Suggesting%20New%20App%20for%20Market%20Place&body=Hello!%0D%0A%0D%0AAppName:%0D%0AAppAuthor:%0D%0AAppLink:%0D%0A%0D%0A", "_system");
      }
      if (ionic.Platform.isIOS() || ionic.Platform.isIPad()) {
        if (name == 'SteemMonitor') {
          //cordova.plugins.market.open('id1158918690');
          window.open("itms-apps://itunes.apple.com/app/id1158918690", "_system");
        }
        if (name == 'SteemFest') {
          //cordova.plugins.market.open('id1171371708');
          window.open("itms-apps://itunes.apple.com/app/id1171371708", "_system");
        }
      } else {
        if (name == 'SteemMonitor') {
          //cordova.plugins.market.open('com.netsolutions.esteemwitness');
          window.open("market://details?id=com.netsolutions.esteemwitness", "_system");
        }
        if (name == 'SteemFest') {
          //cordova.plugins.market.open('com.netsolutions.steemfest');
          window.open("market://details?id=com.netsolutions.steemfest", "_system");
        }
      }
    });
  }

});

app.controller('SettingsCtrl', function($scope, $stateParams, $rootScope, $ionicHistory, $state, $ionicPopover, $ionicPopup, APIs, $filter, $translate, $window, $ionicSideMenuDelegate) {

   $ionicPopover.fromTemplateUrl('popover.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.tooltip = popover;
   });
   if ($rootScope.$storage.chain == 'steem'){
    $scope.options = ['wss://steemd.steemit.com', 'wss://node.steem.ws']; 
   } else {
    $scope.options = ['wss://ws.golos.io', 'wss://node.golos.ws'];
   }
   

   $scope.openTooltip = function($event, d) {
      var texth = d;
      $scope.tooltipText = texth;
      $scope.tooltip.show($event);
   };

  function getDate(xx) {
    for (var i = 0, len = $rootScope.$storage.currencies.length; i < len; i++) {
      var v = $rootScope.$storage.currencies[i];
      if (v.id == xx) {
        return true;
      }
    }
  }

  function searchObj(nameKey, myArray) {
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === nameKey) {
            return myArray[i];
        }
    }
  }

  $scope.changeCurrency = function(xx, ignore) {
    $rootScope.$emit('changedCurrency', {currency: xx, enforce: ignore});
  }
  $scope.changeChain = function() {
    $scope.restart = true;
    if ($rootScope.$storage.chain == 'steem'){
      $rootScope.$storage.platformname = "Steem";
      $rootScope.$storage.platformpower = "Steem Power";
      $rootScope.$storage.platformsunit = "Steem";
      $rootScope.$storage.platformdollar = "Steem Dollar";
      $rootScope.$storage.platformdunit = "SBD";
      $rootScope.$storage.platformpunit = "SP";
      $rootScope.$storage.platformlunit = "STEEM";
      $rootScope.$storage.socketsteem = "wss://steemd.steemit.com";
      $scope.socket = "wss://steemd.steemit.com";
    } else {
      $rootScope.$storage.platformname = "ГОЛОС";
      $rootScope.$storage.platformpower = "СИЛА ГОЛОСА";
      $rootScope.$storage.platformsunit = "Голос";
      $rootScope.$storage.platformdollar = "ЗОЛОТОЙ";
      $rootScope.$storage.platformdunit = "GBG";
      $rootScope.$storage.platformpunit = "GOLOSP";
      $rootScope.$storage.platformlunit = "GOLOS";
      $rootScope.$storage.socketgolos = "wss://ws.golos.io/";
      $scope.socket = "wss://ws.golos.io/";
    }

    window.steem.config.set('chain_id',localStorage[$rootScope.$storage.chain+"Id"]);
    if ($rootScope.$storage.chain == 'golos') {
      window.steem.config.set('address_prefix','GLS');  
    } else {
      window.steem.config.set('address_prefix','STM');  
    }
    window.steem.api.stop();

    $scope.changeCurrency($rootScope.$storage.currency, true);
  }
  $scope.restart = false;
  $scope.closeTooltip = function() {
    $scope.tooltip.hide();
  };

  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.tooltip.remove();
  });

  $scope.changeLanguage = function(locale){
    setTimeout(function() {
      if (locale == 'ar-SA' || locale == 'he-IL' || locale == 'fa-IR') {
        $rootScope.$storage.dir = 'rtl';
      } else {
        $rootScope.$storage.dir = 'ltr';
      }
      $translate.use(locale);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    }, 5);
  }
  $scope.drag = function(v) {
    $rootScope.$storage.voteWeight = v*100;
  }
  $scope.$on('$ionicView.beforeEnter', function(){
    $rootScope.$storage["socket"+$rootScope.$storage.chain] = localStorage.socketUrl;
    $scope.data = {};
    if (!$rootScope.$storage.voteWeight){
      $rootScope.$storage.voteWeight = 10000;
      $scope.vvalue = 100;
    } else {
      $scope.vvalue = $rootScope.$storage.voteWeight/100;
    }
    if(!$scope.$$phase){
      $scope.$apply();
    }
    
    if ($rootScope.$storage.pincode) {
      $scope.data = {pin: true};
    } else {
      $scope.data = {pin: false};
    }

    if ($rootScope.user && $rootScope.$storage.deviceid) {
      APIs.getSubscriptions($rootScope.$storage.deviceid).then(function(res){
        $rootScope.log(angular.toJson(res.data));
        var d = res.data;
        //angular.forEach(d, function(v,k){
        for (var i = 0, len = d.length; i < len; i++) {
          var v = d[i];
          if (v.username == $rootScope.user.username) {
            angular.merge($scope.data, {vote: v.subscription.vote, follow: v.subscription.follow, comment: v.subscription.comment, mention: v.subscription.mention, resteem: v.subscription.resteem});    
          }          
        }
        
        if (!$scope.$$phase){
          $scope.$apply();
        }
      });
    }

    if (!$scope.$$phase){
      $scope.$apply();
    }
  });

  $scope.notificationChange = function() {
    $rootScope.$storage.subscription = {
      vote: $scope.data.vote,
      comment: $scope.data.comment,
      follow: $scope.data.follow,
      mention: $scope.data.mention,
      resteem: $scope.data.resteem,
      device: ionic.Platform.platform(),
      timestamp: $filter('date')(new Date(), 'medium'),
      appversion: '1.4.4'
    }
    APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.user.username, $rootScope.$storage.subscription).then(function(res){
      console.log(angular.toJson(res));
    });

  }

  $scope.pinChange = function() {
    $rootScope.log("pinChange");
    if ($rootScope.$storage.pincode) {
      $rootScope.$broadcast("pin:check");
    } else {
      $rootScope.$broadcast("pin:new");
    }
  }

  $rootScope.$on("pin:correct", function(){
    $rootScope.log("pin:correct " + $scope.data.pin);
    if (!$scope.data.pin) {
        $rootScope.$storage.pincode = undefined;
    }
    if ($rootScope.$storage.pincode) {
      $scope.data.pin = true;
    } else {
      $scope.data.pin = false;
    }
    if (!$scope.$$phase){
      $scope.$apply();
    }
  });

  $rootScope.$on("pin:failed", function(){
    $rootScope.log("pin:failed");
    setTimeout(function() {
      if ($rootScope.$storage.pincode) {
        $scope.data.pin = true;
      } else {
        $scope.data.pin = false;
      }
      if (!$scope.$$phase){
        $scope.$apply();
      }
    }, 10);

  });
  $scope.logouts = function() {
    $rootScope.$storage.user = undefined;
    $rootScope.$storage.user = null;
    $rootScope.user = undefined;
    $rootScope.user = null;
    
    $rootScope.$storage.mylogin = undefined;
    $rootScope.$storage.mylogin = null;
    //make sure user credentials cleared.
    if ($rootScope.$storage.deviceid) {
      APIs.deleteSubscription($rootScope.$storage.deviceid).then(function(res){
        $ionicSideMenuDelegate.toggleLeft();
        //$window.location.reload(true);
        $state.go('app.posts',{renew:true},{reload: true});
      });
    } else {
      $ionicSideMenuDelegate.toggleLeft();
      //$window.location.reload(true);
      $state.go('app.posts',{renew:true},{reload: true});
    }
    $rootScope.$storage.filter = undefined;
    $rootScope.$storage.tag = undefined;

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    setTimeout(function() {
      ionic.Platform.exitApp(); // stops the app
    }, 100);
  };
  $scope.socket = $rootScope.$storage["socket"+$rootScope.$storage.chain];
  $scope.socketChange = function(xx){
    console.log(xx);
    $rootScope.$storage["socket"+$rootScope.$storage.chain] = xx;
    localStorage.socketUrl = xx;
    $scope.restart = true;
  }
  $scope.save = function(){
    if ($scope.restart) {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('UPDATE_REQUIRES_RESTART')
      });
      confirmPopup.then(function(res) {
        if(res) {
          $rootScope.log('You are sure');
          localStorage.socketUrl = $rootScope.$storage["socket"+$rootScope.$storage.chain];
          //$scope.logouts();
          setTimeout(function() {
           
            var socketUrl = $rootScope.$storage["socket"+$rootScope.$storage.chain];
           
            window.steem.config.set('chain_id',localStorage[$rootScope.$storage.chain+"Id"]);
            
            window.steem.config.set('websocket',socketUrl); 
            
            if ($rootScope.$storage.chain == 'golos') {
              window.steem.config.set('address_prefix','GLS');  
            } else {
              window.steem.config.set('address_prefix','STM');  
            }
            if ($rootScope.user.chain != $rootScope.$storage.chain) {
              for (var i = 0, len = $rootScope.$storage.users.length; i < len; i++) {
                var v = $rootScope.$storage.users[i];
                if (v.chain == $rootScope.$storage.chain){
                  $rootScope.$storage.user = v;
                  $rootScope.user = v;
                }
              }
            }
            $state.go('app.posts',{renew:true},{reload: true});
          }, 1);
        } else {
          $rootScope.log('You are not sure');
        }
      });
    } else {
      $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('SETTINGS_UPDATED'));
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      //$window.location.reload(true);  
      $state.go('app.posts',{renew:true},{reload: true});
    }
  };

});
}
