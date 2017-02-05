module.exports = function (app) {
//angular.module('steem.controllers', [])

app.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $state, $ionicHistory, $cordovaSocialSharing, ImageUploadService, $cordovaCamera, $ionicSideMenuDelegate, $ionicPlatform, $filter, APIs, $window, $ionicPopover) {

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
  }
  $scope.open = function(item) {
    item.json_metadata = angular.fromJson(item.json_metadata);
    $rootScope.$storage.sitem = item;
    //console.log(item);

    //$state.go('app.single');*/
    $state.go('app.post', {category: item.category, author: item.author, permlink: item.permlink});
  };
  $scope.advancedChange = function() {
    $rootScope.log(angular.toJson($scope.loginData.advanced));
    if ($scope.loginData.advanced) {
      $scope.loginData.password = null;
    }
  }
  $scope.closeLogin = function() {
    $scope.loginModal.hide();
  };

  $scope.openLogin = function() {
    setTimeout(function() {
      $scope.loginModal.show();
    }, 1);
  };
  $scope.goProfile = function() {
    $state.go("app.profile", {username:$rootScope.$storage.user.username});
    //$ionicSideMenuDelegate.toggleLeft();
  }
  $scope.share = function() {
    var link = "http://steemit.com/"+$rootScope.$storage.sitem.category+"/@"+$rootScope.$storage.sitem.author+"/"+$rootScope.$storage.sitem.permlink;
    var message = "Hey! Checkout blog post on Steem "+link;
    var subject = "Via eSteem Mobile";
    var file = null;
    $cordovaSocialSharing.share(message, subject, file, link) // Share via native share sheet
    .then(function(result) {
      // Success!
      $rootScope.log("shared");
    }, function(err) {
      // An error occured. Show a message to the user
      $rootScope.log("not shared");
    });
  }

  $scope.doLogin = function() {
    $rootScope.log('Doing login');
    if ($scope.loginData.password || $scope.loginData.privatePostingKey) {
      $rootScope.$broadcast('show:loading');
      $scope.loginData.username = $scope.loginData.username.trim();
      if (!$rootScope.$storage.user) {
        console.log('doLogin'+$scope.loginData.username+$scope.loginData.password);
        window.Api.database_api().exec("get_accounts", [[$scope.loginData.username]]).then(function(dd){
          dd = dd[0];
          $scope.loginData.id = dd.id;
          $scope.loginData.owner = dd.owner;
          $scope.loginData.active = dd.active;
          $scope.loginData.reputation = dd.reputation;
          $scope.loginData.posting = dd.posting;
          $scope.loginData.memo_key = dd.memo_key;
          $scope.loginData.post_count = dd.post_count;
          $scope.loginData.voting_power = dd.voting_power;
          $scope.loginData.witness_votes = dd.witness_votes;
          if ($rootScope.$storage.chain == 'golos') {
            $scope.login = new window.golosJS.Login();
          } else {
            $scope.login = new window.steemJS.Login();
          }
          $scope.login.setRoles(["posting"]);
          var loginSuccess = $scope.login.checkKeys({
              accountName: $scope.loginData.username,
              password: $scope.loginData.password || null,
              auths: {
                  posting: dd.posting.key_auths
              },
              privateKey: $scope.loginData.privatePostingKey || null
            }
          );

          if (!loginSuccess) {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('PASSWORD_INCORRECT'));
          } else {
            $rootScope.$storage.user = $scope.loginData;
            $rootScope.$broadcast('fetchPosts');
            $rootScope.$storage.mylogin = $scope.login;
            APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.$storage.user.username, {device: ionic.Platform.platform(), timestamp: $filter('date')(new Date(), 'medium'), appversion: $rootScope.$storage.appversion}).then(function(res){
              $rootScope.$broadcast('hide:loading');
              //$state.go($state.current, {}, {reload: true});
              //$state.go('app.posts', {}, { reload: true });
              //$scope.closeLogin();
              $scope.loginModal.hide();
              //$ionicHistory.clearCache();
              //$ionicHistory.clearHistory();
              $rootScope.$broadcast('refreshLocalUserData');

              setTimeout(function() {
                $window.location.reload(true);
              }, 10);

            });
          }
          /*if(!$scope.$$phase) {
            $scope.$apply();
          }*/
        });
      }
    } else {
      $scope.loginModal.hide();
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_FAIL'));
    }
  };

  $rootScope.$on('refreshLocalUserData', function() {
    $rootScope.log('refreshLocalUserData');
    if ($rootScope.$storage.user && $rootScope.$storage.user.username) {
      if (typeof window.Api.database_api === "function") {
        window.Api.database_api().exec("get_accounts", [ [ $rootScope.$storage.user.username ] ]).then(function(dd){
          dd = dd[0];
          if (dd && dd.json_metadata) {
            dd.json_metadata = angular.fromJson(dd.json_metadata);
          }
          angular.merge($rootScope.$storage.user, dd);
          if (!$scope.$$phase) {
            $scope.$apply();
          }
          $scope.mcss = ($rootScope.$storage.user.json_metadata && $rootScope.$storage.user.json_metadata.profile && $rootScope.$storage.user.json_metadata.profile.cover_image) ? {'background': 'url('+$rootScope.$storage.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed'} : null;
        });
      }
    }
  })

  $scope.openPostModal = function() {
    $rootScope.$broadcast('openPostModal');
  }

  $scope.changeView = function(view) {
    $rootScope.$storage.view = view;
    $rootScope.$broadcast('changeView');
  }

  $scope.$on("$ionicView.enter", function(){
    $rootScope.$broadcast('refreshLocalUserData');
  });

  // get app version
  $ionicPlatform.ready(function(){
    if (window.cordova) {
      cordova.getAppVersion.getVersionNumber(function (version) {
        $rootScope.$storage.appversion = version;
      });
    } else {
      $rootScope.$storage.appversion = 'debug';
    }
  });

  $scope.logout = function() {
    $rootScope.$storage.user = undefined;
    $rootScope.$storage.user = null;
    $rootScope.$storage.mylogin = undefined;
    $rootScope.$storage.mylogin = null;
    //make sure user credentials cleared.
    if ($rootScope.$storage.deviceid) {
      APIs.deleteSubscription($rootScope.$storage.deviceid).then(function(res){
        $ionicSideMenuDelegate.toggleLeft();
        $window.location.reload(true);
      });
    } else {
      $ionicSideMenuDelegate.toggleLeft();
      $window.location.reload(true);
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
    $rootScope.$broadcast('close:popover');
    setTimeout(function() {
      $scope.data.type="tag";
      $scope.data.searchResult = [];
      $scope.smodal.show();
    }, 5);
  };
  $scope.clearSearch = function() {
    if ($rootScope.$storage.tag) {
      $rootScope.$storage.tag = undefined;
      $rootScope.$storage.taglimits = undefined;
      $rootScope.$broadcast('close:popover');
      $rootScope.$broadcast('fetchPosts');
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
          window.Api.database_api().exec("get_trending_tags", [$scope.data.search, 15]).then(function(result){
            var ee = [];
            //console.log(result);
            /*if (result){
              var ll = result.length;
              for (var i = ll - 1; i >= 0; i--) {
                if (result[i].name.indexOf($scope.data.search) > -1){
                  ee.push(result[i]);
                }
              }
              $scope.data.searchResult = ee;
            }*/
            $scope.data.searchResult = result;

            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });
        }
        if ($scope.data.type == "user"){
          var ee = [];
          window.Api.database_api().exec("lookup_accounts", [$scope.data.search, 15]).then(function(result){
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
    $rootScope.$storage.taglimits = yy;
    if ($scope.smodal.isShown()){
      $scope.closeSmodal();
    }
    $rootScope.$broadcast('close:popover');
    $state.go("app.posts", {tags: xx});
  };
  $scope.openUser = function(xy) {
    $rootScope.log("opening user "+xy);
    $scope.closeSmodal();
    $rootScope.$broadcast('close:popover');
    $state.go("app.profile", {username: xy});
  };
  $scope.testfunction = function() {
    window.Api.database_api().exec("get_account_history", [$rootScope.$storage.user.username, -1, 25]).then(function(response){
      $rootScope.log(angular.toJson(response));
    });
  }

})

app.controller('SendCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval, $filter, $q, $timeout, $cordovaBarcodeScanner, $ionicPlatform) {
  $scope.data = {type: "steem", amount: 0.001};
  $scope.changeUsername = function(typed) {
    $rootScope.log('searching');
    $scope.data.username = angular.lowercase($scope.data.username);
    window.Api.database_api().exec("lookup_account_names", [[$scope.data.username]]).then(function(response){
      $scope.users = response[0];
      if (!$scope.$$phase) {
        $scope.$apply();
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
  $scope.transfer = function () {
    if ($rootScope.$storage.user) {
      if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('ACTIVE_KEY_REQUIRED_TEXT'));
      } else {
        if ($scope.data.type === 'sbd') {
          if ($scope.data.amount > Number($scope.balance.sbd_balance.split(" ")[0])) {
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('BALANCE_TEXT'));
          } else {
            $scope.okbalance = true;
          }
        }
        if ($scope.data.type === 'sp' || $scope.data.type === 'steem') {
          if ($scope.data.amount > Number($scope.balance.balance.split(" ")[0])) {
            $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('BALANCE_TEXT'));
          } else {
            $scope.okbalance = true;
          }
        }
        if (!$scope.users || $scope.users.name !== $scope.data.username) {
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
              $scope.mylogin = new window.steemJS.Login();
              $scope.mylogin.setRoles(["active"]);
              var loginSuccess = $scope.mylogin.checkKeys({
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
                if ($scope.data.type !== 'sp') {

                  var tt = $filter('number')($scope.data.amount) +" "+angular.uppercase($scope.data.type);
                  tr.add_type_operation("transfer", {
                    from: $rootScope.$storage.user.username,
                    to: $scope.data.username,
                    amount: tt,
                    memo: $scope.data.memo || ""
                  });
                  localStorage.error = 0;
                  tr.process_transaction($scope.mylogin, null, true);
                  setTimeout(function() {
                    if (localStorage.error == 1) {
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                    } else {
                      $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                        $scope.data = {type: "steem", amount: 0.001};
                      });
                    }
                  }, 3000);
                } else {
                  var tt = $filter('number')($scope.data.amount) +" STEEM";
                  tr.add_type_operation("transfer_to_vesting", {
                    from: $rootScope.$storage.user.username,
                    to: $scope.data.username,
                    amount: tt
                  });
                  localStorage.error = 0;
                  tr.process_transaction($scope.mylogin, null, true);
                  setTimeout(function() {
                    if (localStorage.error == 1) {
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                    } else {
                      $rootScope.showAlert($filter('translate')('INFO'), $filter('translate')('TX_BROADCASTED')).then(function(){
                        $scope.data = {type: "steem", amount: 0.001};
                      });
                    }
                  }, 3000);

                }
              } else {
                $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
              }
              $rootScope.$broadcast('hide:loading');
             } else {
               $rootScope.log('You are not sure');
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
    window.Api.database_api().exec("get_accounts", [ [ $rootScope.$storage.user.username ] ]).then(function(dd){
      $scope.balance = dd[0];
      $rootScope.$broadcast('hide:loading');
      if (!$scope.$$phase){
        $scope.$apply();
      }
    });
    $rootScope.$broadcast('hide:loading');
  }
  $scope.$on('$ionicView.beforeEnter', function(){
    window.Api.database_api().exec("get_accounts", [ [ $rootScope.$storage.user.username ] ]).then(function(dd){
      $scope.balance = dd[0];
      if (!$scope.$$phase){
        $scope.$apply();
      }
    });
  });

});
app.controller('PostsCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval, $ionicScrollDelegate, $ionicModal, $filter, $stateParams, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicPlatform, $cordovaCamera, ImageUploadService, $filter, $ionicHistory, $timeout, APIs) {

  $scope.activeMenu = $rootScope.$storage.filter || "trending";
  $scope.mymenu = $rootScope.$storage.user ? [{text: $filter('translate')('FEED'), custom:'feed'}, {text: $filter('translate')('TRENDING'), custom:'trending'}, {text: $filter('translate')('HOT'), custom:'hot'}, {text: $filter('translate')('NEW'), custom:'created'}, {text: $filter('translate')('ACTIVE'), custom:'active'}, {text: $filter('translate')('PROMOTED'), custom: 'promoted'}, {text: $filter('translate')('TRENDING_30'), custom:'trending30'}, {text:$filter('translate')('VOTES'), custom:'votes'}, {text: $filter('translate')('COMMENTS'), custom:'children'}, {text: $filter('translate')('PAYOUT'), custom: 'cashout'}] : [ {text: $filter('translate')('TRENDING'), custom:'trending'}, {text: $filter('translate')('HOT'), custom:'hot'}, {text: $filter('translate')('NEW'), custom:'created'}, {text: $filter('translate')('ACTIVE'), custom:'active'}, {text: $filter('translate')('PROMOTED'), custom: 'promoted'}, {text: $filter('translate')('TRENDING_30'), custom:'trending30'}, {text:$filter('translate')('VOTES'), custom:'votes'}, {text: $filter('translate')('COMMENTS'), custom:'children'}, {text: $filter('translate')('PAYOUT'), custom: 'cashout'}];

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
    angular.forEach($scope.mymenu, function(v,k){
      if (v.custom == fil) {
        $rootScope.$storage.filterName = v.text;
      }
    });
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
    var tppv = Number(d.total_pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0]-d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT_CYCLE')+"</b></div><div class='col'>"+d.mode.replace('_',' ')+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAST_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tpv,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(d.cashout_time, true)+"</div></div>";
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

    if (!$scope.spost.operation_type) {
      $scope.spost.operation_type = 'default';
    }

    $timeout(function(){
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
    //$scope.$broadcast('close:popover');
    $scope.modalp.hide();
  };


  $scope.cfocus = function(){
    $scope.lastFocused = document.activeElement;
  }
  //http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
  $scope.insertText = function(text) {
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
      APIs.fetchImages($rootScope.$storage.user.username).then(function(res){
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
    $rootScope.$broadcast('closePostModal');
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
    $scope.spost.category = $scope.spost.tags.split(" ");
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

    $rootScope.$broadcast('show:loading');
    if ($rootScope.$storage.user) {
      $scope.mylogin = new window.steemJS.Login();
      $scope.mylogin.setRoles(["posting"]);
      var loginSuccess = $scope.mylogin.checkKeys({
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
        var permlink = createPermlink($scope.spost.title);
        var json = $filter("metadata")($scope.spost.body);
        angular.merge(json, {tags: $scope.spost.category, app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html' });

        if (!$scope.spost.operation_type) {
          $scope.spost.operation_type = 'default';
        }
        if ($scope.spost.operation_type !== 'default') {
          //console.log('NOT Default');
          tr.add_type_operation("comment", {
            parent_author: "",
            parent_permlink: $scope.spost.category[0],
            author: $rootScope.$storage.user.username,
            permlink: permlink,
            title: $scope.spost.title,
            body: $scope.spost.body,
            json_metadata: angular.toJson(json)
          });
          tr.add_type_operation("comment_options", {
            allow_curation_rewards: true,
            allow_votes: true,
            author: $rootScope.$storage.user.username,
            permlink: permlink,
            max_accepted_payout: $scope.spost.operation_type==='sp'?"1000000.000 SBD":"0.000 SBD",
            percent_steem_dollars: $scope.spost.operation_type==='sp'?0:10000
          });
        } else {
          //console.log('default');
          tr.add_type_operation("comment", {
            parent_author: "",
            parent_permlink: $scope.spost.category[0],
            author: $rootScope.$storage.user.username,
            permlink: permlink,
            title: $scope.spost.title,
            body: $scope.spost.body,
            json_metadata: angular.toJson(json)
          });
        }

        localStorage.error = 0;
        tr.process_transaction($scope.mylogin, null, true);
        $scope.replying = false;
        setTimeout(function() {
          if (localStorage.error == 1) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
          } else {
            //$scope.closePostModal();
            $rootScope.$broadcast('closePostModal');

            //$scope.menupopover.hide();
            $rootScope.$broadcast('close:popover');
            $scope.spost = {};
            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_SUBMITTED'));
            //$scope.closeMenuPopover();
            $state.go("app.profile", {username: $rootScope.$storage.user.username});
          }
          $rootScope.$broadcast('hide:loading');
        }, 3000);
      } else {
        $rootScope.$broadcast('hide:loading');
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL'));
      }
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
    APIs.addDraft($rootScope.$storage.user.username, dr).then(function(res){
      console.log(res.data);
      //$scope.drafts = res.data;
    });
    $rootScope.$broadcast('closePostModal');
    $rootScope.$broadcast('close:popover');
    $scope.modalp.hide();
    $rootScope.showMessage($filter('translate')('SAVED'), $filter('translate')('POST_LATER'));
  }
  $scope.clearPost = function() {
    $rootScope.$storage.spost = {};
    $scope.spost = {};
    $rootScope.showMessage($filter('translate')('CLEARED'), $filter('translate')('POST'));
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

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

  $scope.moreDataCanBeLoaded = function(){
    return !$scope.error;
  }

  $rootScope.$on('changeView', function(){
    //$scope.menupopover.hide();
    $rootScope.$broadcast('close:popover');
    if (!$scope.$$phase){
      $scope.$apply();
    }
    if ($rootScope.$storage.view === 'card') {
      angular.forEach($scope.data, function(v,k){
        v.json_metadata = angular.fromJson(v.json_metadata);
      });
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
      var user = $rootScope.$storage.user || null;
      var view = $rootScope.$storage.view;

      if (user){
        for (var i = 0; i < lenn; i++) {
          if (newValue[i] && newValue[i].active_votes) {
            var len = newValue[i].active_votes.length-1;
            for (var j = len; j >= 0; j--) {
              if (newValue[i].active_votes[j].voter === user.username) {
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
    window.Api.database_api().exec("get_content", [author, permlink]).then(function(result){
      var len = result.active_votes.length;
      var user = $rootScope.$storage.user;
      if (user) {
        for (var j = len - 1; j >= 0; j--) {
          if (result.active_votes[j].voter === user.username) {
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
      angular.forEach($scope.data, function(value, key) {
        if (value.permlink === result.permlink) {
          $scope.data[key] = result;
        }
      });
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

    if (type === "feed" && $rootScope.$storage.user) {
      params = {tag: $rootScope.$storage.user.username, limit: limit, filter_tags: []};
    } else {
      if ($rootScope.$storage.filter === "feed") {
        $rootScope.$storage.filter = "trending";
        type = "trending";
      }
      params = {tag: tag, limit: limit, filter_tags: []};
    }
    if ($scope.data && $scope.data.length>0) {
      params.start_author = $scope.data[$scope.data.length-1].author;
      params.start_permlink = $scope.data[$scope.data.length-1].permlink;
    }
    if ($scope.error) {
      //$rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('REQUEST_LIMIT_TEXT'));
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.log("fetching..."+type+" "+limit+" "+tag);
      if (typeof window.Api.database_api === "function") {
        window.Api.database_api().exec("get_discussions_by_"+type, [params]).then(function(response){
          //console.log(response.length);
          if (response.length <= 1) {
            $scope.error = true;
          }
          if (response) {
            for (var i = 0; i < response.length; i++) {
              response[i].json_metadata = response[i].json_metadata?angular.fromJson(response[i].json_metadata):response[i].json_metadata;
              var permlink = response[i].permlink;
              if (!$scope.ifExists(permlink)) {
                var user = $rootScope.$storage.user || undefined;
                if (user) {
                  //console.log('exist');
                  if (response[i] && response[i].active_votes) {
                    var len = response[i].active_votes.length-1;
                    for (var j = 0; j < len; j++) {
                      if (response[i].active_votes[j].voter === user.username) {
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
    }
  };

  $scope.$on('$ionicView.loaded', function(){
    $scope.limit = 10;
    //$rootScope.$broadcast('show:loading');
    if (!$rootScope.$storage.socket) {
      $rootScope.$storage.socket = localStorage.socketUrl;
    }
    if (!$rootScope.$storage.view) {
      $rootScope.$storage.view = 'card';
    }
    if (!$rootScope.$storage.filter) {
      $rootScope.$storage.filter = "trending";
    }
    if (window.Api) {
      if (!angular.isDefined($rootScope.timeint)) {
        window.Api.initPromise.then(function(response) {
          $rootScope.log("Api ready:" + angular.toJson(response));
          $rootScope.timeint = $interval(function(){
            window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(response){
              $rootScope.log("get_dynamic_global_properties "+ response.head_block_number);
              if ($rootScope.$storage.user) {
                $scope.mylogin = new window.steemJS.Login();
                $scope.mylogin.setRoles(["posting"]);
                var loginSuccess = $scope.mylogin.checkKeys({
                    accountName: $rootScope.$storage.user.username,
                    password: $rootScope.$storage.user.password || null,
                    auths: {
                        posting: $rootScope.$storage.user.posting.key_auths
                    },
                    privateKey: $rootScope.$storage.user.privatePostingKey || null
                  }
                );
                $rootScope.log("login "+loginSuccess);
              }
            });
          }, 15000);
          $rootScope.$broadcast('fetchPosts');
          /*setTimeout(function() {
            $scope.fetchPosts(null, $scope.limit, null);
          }, 10);*/
        });
      }
    }

    setTimeout(function() {
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
    }, 10);
  });

  $scope.$on('$ionicView.beforeEnter', function(){
    if ($stateParams.tags) {
      $rootScope.$storage.tag = $stateParams.tags;
    }
    $scope.mymenu = $rootScope.$storage.user ? [{text: $filter('translate')('FEED'), custom:'feed'}, {text: $filter('translate')('TRENDING'), custom:'trending'}, {text: $filter('translate')('HOT'), custom:'hot'}, {text: $filter('translate')('NEW'), custom:'created'}, {text: $filter('translate')('ACTIVE'), custom:'active'}, {text: $filter('translate')('PROMOTED'), custom: 'promoted'}, {text: $filter('translate')('TRENDING_30'), custom:'trending30'}, {text:$filter('translate')('VOTES'), custom:'votes'}, {text: $filter('translate')('COMMENTS'), custom:'children'}, {text: $filter('translate')('PAYOUT'), custom: 'cashout'}] : [ {text: $filter('translate')('TRENDING'), custom:'trending'}, {text: $filter('translate')('HOT'), custom:'hot'}, {text: $filter('translate')('NEW'), custom:'created'}, {text: $filter('translate')('ACTIVE'), custom:'active'}, {text: $filter('translate')('PROMOTED'), custom: 'promoted'}, {text: $filter('translate')('TRENDING_30'), custom:'trending30'}, {text:$filter('translate')('VOTES'), custom:'votes'}, {text: $filter('translate')('COMMENTS'), custom:'children'}, {text: $filter('translate')('PAYOUT'), custom: 'cashout'}];

    angular.forEach($scope.mymenu, function(v,k){
      if (v.custom === $rootScope.$storage.filter) {
        $rootScope.$storage.filterName = v.text;
      }
    });

  });

})

app.controller('PostCtrl', function($scope, $stateParams, $rootScope, $interval, $ionicScrollDelegate, $ionicModal, $filter, $ionicActionSheet, $cordovaCamera, $ionicPopup, ImageUploadService, $ionicPlatform, $ionicSlideBoxDelegate, $ionicPopover, $filter, $state, APIs) {
  $scope.post = $rootScope.$storage.sitem;
  $scope.data = {};
  $scope.spost = {};
  $scope.replying = false;
  $scope.isBookmarked = function() {
    var bookm = $rootScope.$storage.bookmark || undefined;
    if (bookm) {
      var len = bookm.length;
      for (var i = 0; i < len; i++) {
        if (bookm[i] && bookm[i].permlink === $rootScope.$storage.sitem.permlink) {
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
        if (book[i].permlink === $rootScope.$storage.sitem.permlink) {
          id = book[i]._id;
          book.splice(i, 1);
        }
      }
      if (id){
        APIs.removeBookmark(id,$rootScope.$storage.user.username).then(function(res){
          $rootScope.$storage.bookmark = book;
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNBOOKMARK'));
        });
      }
    } else {
      if (book) {
        var oo = { author:$rootScope.$storage.sitem.author,permlink:$rootScope.$storage.sitem.permlink};
        $rootScope.$storage.bookmark.push(oo);
        APIs.addBookmark($rootScope.$storage.user.username, oo ).then(function(res){
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
        });
      } else {
        var oo = { author:$rootScope.$storage.sitem.author,permlink:$rootScope.$storage.sitem.permlink};
        $rootScope.$storage.bookmark = [oo];

        APIs.addBookmark($rootScope.$storage.user.username, oo ).then(function(res){
          $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
        });
      }
      //$rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_BOOKMARK'));
    }
  };

  $scope.lastFocused;


  //http://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
  $scope.insertText = function(text) {
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
    console.log(angular.element(input).val());
    angular.element(input).trigger('input');
  }

  $ionicPopover.fromTemplateUrl('popoverTr.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.tooltip = popover;
   });

   $scope.openTooltip = function($event, d) {
    var tppv = Number(d.total_pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0]-d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT_CYCLE')+"</b></div><div class='col'>"+d.mode.replace('_',' ')+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAST_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tpv,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(d.cashout_time, true)+"</div></div>";
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
    if ($rootScope.$storage.sitem) {
      var len = $rootScope.$storage.sitem.json_metadata.image?$rootScope.$storage.sitem.json_metadata.image.length:0;
      if (len > 0) {
        $scope.images = $rootScope.$storage.sitem.json_metadata.image;
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
        APIs.fetchImages($rootScope.$storage.user.username).then(function(res){
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
        APIs.fetchImages($rootScope.$storage.user.username).then(function(res){
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
            if ($rootScope.$storage.user) {
              $scope.mylogin = new window.steemJS.Login();
              $scope.mylogin.setRoles(["posting"]);
              var loginSuccess = $scope.mylogin.checkKeys({
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

                tr.add_type_operation("delete_comment", {
                  author: xx.author,
                  permlink: xx.permlink
                });
                //$rootScope.log(my_pubkeys);
                localStorage.error = 0;
                tr.process_transaction($scope.mylogin, null, true);

                setTimeout(function() {
                  if (localStorage.error == 1) {
                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                  } else {
                    $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('DELETED_COMMENT'));
                    $state.go('app.posts');
                  }
                  $rootScope.$broadcast('hide:loading');
                }, 3000);
              } else {
                $rootScope.$broadcast('hide:loading');
              }
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
    $scope.edit = true;
    $scope.openPostModal();
    angular.element("textarea").focus(function() {
      $scope.lastFocused = document.activeElement;
      console.log(document);
    });
    setTimeout(function() {
      if (!$scope.spost.body) {
        $scope.spost = xx;
        $scope.patchbody = xx.body;
      }
      $scope.spost.tags = angular.fromJson(xx.json_metadata).tags.join().replace(/\,/g,' ');
    }, 10);
  }

  $scope.submitStory = function() {
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

    if ($rootScope.$storage.user) {
      $scope.mylogin = new window.steemJS.Login();
      $scope.mylogin.setRoles(["posting"]);
      var loginSuccess = $scope.mylogin.checkKeys({
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
        var permlink = $scope.spost.permlink;
        var jjson = $filter("metadata")($scope.spost.body);
        //console.log(jjson);
        //$scope.spost.tags = $filter('lowercase')($scope.spost.tags);
        var json = angular.merge(jjson, {tags: $scope.spost.tags.split(" "), app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html' });
        //console.log(json);
        tr.add_type_operation("comment", {
          parent_author: "",
          parent_permlink: $scope.spost.parent_permlink,
          author: $rootScope.$storage.user.username,
          permlink: $scope.spost.permlink,
          title: $scope.spost.title,
          body: $scope.spost.body2 || $scope.spost.body,
          json_metadata: angular.toJson(json)
        });
        //$rootScope.log(my_pubkeys);
        localStorage.error = 0;
        tr.process_transaction($scope.mylogin, null, true);
        $scope.replying = false;
        setTimeout(function() {
          if (localStorage.error == 1) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
          } else {
            //$scope.closePostModal();

            $rootScope.$broadcast('closePostModal');

            setTimeout(function() {
              $scope.spost = {};
              $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_SUBMITTED'));
            //$scope.closePostPopover();
              $state.go("app.profile", {username: $rootScope.$storage.user.username});
            }, 1);
          }
          $rootScope.$broadcast('hide:loading');
        }, 3000);
      } else {
        $rootScope.$broadcast('hide:loading');
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL'));
      }
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
    $rootScope.$broadcast('show:loading');
    if ($rootScope.$storage.user) {
      $scope.mylogin = new window.steemJS.Login();
      $scope.mylogin.setRoles(["posting"]);
      var loginSuccess = $scope.mylogin.checkKeys({
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
        var t = new Date();
        var timeformat = t.getFullYear().toString()+(t.getMonth()+1).toString()+t.getDate().toString()+"t"+t.getHours().toString()+t.getMinutes().toString()+t.getSeconds().toString()+t.getMilliseconds().toString()+"z";
        var json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || "" , app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html' };
        tr.add_type_operation("comment", {
          parent_author: $scope.post.author,
          parent_permlink: $scope.post.permlink,
          author: $rootScope.$storage.user.username,
          permlink: "re-"+$scope.post.author+"-"+$scope.post.permlink+"-"+timeformat,
          title: "",
          body: $scope.data.comment,
          json_metadata: angular.toJson(json)
        });
        localStorage.error = 0;
        tr.process_transaction($scope.mylogin, null, true);
        $scope.replying = false;
        setTimeout(function() {
          if (localStorage.error == 1) {
            $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
          } else {
            $scope.closeModal();
            $scope.data.comment = "";

            $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
            window.Api.database_api().exec("get_content_replies", [$rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink]).then(function(result){
              if (result)
                $scope.comments = result;
              if (!$scope.$$phase) {
                $scope.$apply();
              }
            });
          }
          $rootScope.$broadcast('hide:loading');
        }, 3000);
      } else {
        $rootScope.$broadcast('hide:loading');
        $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL'));
      }
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
    }
  }
  $rootScope.$on("update:content", function(){
    $rootScope.log("update:content");
    window.Api.database_api().exec("get_content_replies", [$scope.post.author, $scope.post.permlink]).then(function(result){
      //todo fix active_votes
      //console.log(result);
      if (result) {
        /*angular.forEach(result, function(v,k){
          var len = v.active_votes.length;
          var user = $rootScope.$storage.user;
          if (user) {
            for (var j = len - 1; j >= 0; j--) {
              if (v.active_votes[j].voter === user.username) {
                if (v.active_votes[j].percent > 0) {
                  v.upvoted = true;
                } else if (v.active_votes[j].percent < 0) {
                  v.downvoted = true;
                } else {
                  v.downvoted = false;
                  v.upvoted = false;
                }
              }
            }
          }
        });*/
        $scope.comments = result;
        console.log(result);
      }

      $rootScope.$broadcast('hide:loading');
    });
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

  $scope.isreplying = function(cho, xx) {
    $scope.replying = xx;
    $scope.post = cho;
    if (xx) {
      $scope.openModal();
    } else {
      $scope.closeModal();
    }
  };
  $scope.accounts = {};
  $scope.getContent = function(author, permlink) {
    var url = "/"+$stateParams.category+"/@"+author+"/"+permlink;
    window.Api.database_api().exec("get_state", [url]).then(function(dd){
      //console.log(dd);
      var con = dd.content;
      var acon = dd.accounts;

      angular.forEach(con, function(v,k){
        v.comments = [];
      });
      //setTimeout(function() {
      angular.forEach(con, function(v,k){
        var vparent = v.parent_author==""?v.author:v.parent_author;
        var vperm = v.parent_author==""?v.permlink:v.parent_permlink;
        var keyy = vparent+"/"+vperm;
        if (v.parent_permlink!==v.category) {
          con[keyy].comments.push(v);  
        }
      });
      console.log(con);  
      //}, 1);
      angular.forEach(acon, function(v,k){
        v.json_metadata = angular.fromJson(v.json_metadata);
      });
      var result = con[author+"/"+permlink];

      var len = result.active_votes.length;
      var user = $rootScope.$storage.user;
      if (user) {
        for (var j = len - 1; j >= 0; j--) {
          if (result.active_votes[j].voter === user.username) {
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
      //$rootScope.$storage.sitem = result;
      //console.log(result);
      $rootScope.$broadcast('hide:loading');
      $scope.post = result;
      $rootScope.$storage.paccounts = acon;

      if (!$scope.$$phase) {
        $scope.$apply();
      }

    });
    /*window.Api.database_api().exec("get_content", [author, permlink]).then(function(result){
      //console.log(result);
        var len = result.active_votes.length;
        var user = $rootScope.$storage.user;
        if (user) {
          for (var j = len - 1; j >= 0; j--) {
            if (result.active_votes[j].voter === user.username) {
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
        $rootScope.$storage.sitem = result;
        console.log(result);
        $scope.post = result;
        //$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
      $rootScope.$broadcast('hide:loading');
      //console.log($scope.post);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    //$rootScope.$broadcast('hide:loading');
    */
  };
  $scope.fetchComments = function(){
    $rootScope.$broadcast('update:content');
  }
  $scope.$on('$ionicView.beforeEnter', function(){
    $rootScope.log('beforeEnter postctrl');
    $rootScope.$broadcast('show:loading');
    if ($stateParams.category === '111') {
      var ttemp = $rootScope.$storage.sitem;
      $scope.post = ttemp;
      $rootScope.$broadcast('update:content');
    } else {
      $scope.getContent($stateParams.author, $stateParams.permlink);
      //$scope.post = $rootScope.$storage.sitem;
      //$rootScope.$broadcast('update:content');
    }
  });



  $scope.upvotePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'getContent');
  };
  $rootScope.$on('getContent', function() {
    $scope.getContent($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink);
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


})
app.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {

  $scope.removeBookmark = function(index) {
    if ($rootScope.$storage.bookmark) {
      APIs.removeBookmark($rootScope.$storage.bookmark[index]._id,$rootScope.$storage.user.username).then(function(res){
        $rootScope.$storage.bookmark.splice(index,1);
        $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNBOOKMARK'));
      });
    }
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.getBookmarks($rootScope.$storage.user.username).then(function(res){
      //console.log(res);
      $rootScope.$storage.bookmark = res.data;
    });
  });
});

app.controller('DraftsCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {
  //JSON.stringify({
  $scope.removeDraft = function(_id) {
    APIs.removeDraft(_id,$rootScope.$storage.user.username).then(function(res){
      APIs.getDrafts($rootScope.$storage.user.username).then(function(res){
        //console.log(res);
        $scope.drafts = res.data;
      });
      $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('POST_IS_UNDRAFT'));
    });
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    APIs.getDrafts($rootScope.$storage.user.username).then(function(res){
      //console.log(res);
      $scope.drafts = res.data;
    });
  });
});

app.controller('ImagesCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate, $filter) {
  //JSON.stringify({
  $scope.removeImage = function(_id) {
    APIs.removeImage(_id,$rootScope.$storage.user.username).then(function(res){
      APIs.fetchImages($rootScope.$storage.user.username).then(function(res){
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
    APIs.fetchImages($rootScope.$storage.user.username).then(function(res){
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
      APIs.getFollowers($rootScope.$storage.user.username, $scope.tt.ruser, "blog", $scope.limit).then(function(res){
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
          setTimeout($scope.rfetching, 5);
        }
        //console.log($scope.followers);
      });
    };

    $scope.dfetching = function(){
      APIs.getFollowing($rootScope.$storage.user.username, $scope.tt.duser, "blog", $scope.limit).then(function(res){
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
          setTimeout($scope.dfetching, 5);
        }
        //console.log($scope.following);
      });
    };

    $scope.rfetching();
    $scope.dfetching();

  });

  $scope.$on('$ionicView.leave', function(){
    /*if (angular.isDefined($scope.dfetching)){
      $interval.cancel($scope.dfetching);
      $scope.dfetching = undefined;
      $scope.following = undefined;
    }
    if (angular.isDefined($scope.rfetching)){
      $interval.cancel($scope.rfetching);
      $scope.rfetching = undefined;
      $scope.followers = undefined;
    }*/
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
    $rootScope.log(type);

    $ionicScrollDelegate.$getByHandle('listScroll').scrollTop();
    if (!$scope.$$phase) {
      $scope.$apply();
    }
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

app.controller('ProfileCtrl', function($scope, $stateParams, $rootScope, $ionicActionSheet, $cordovaCamera, ImageUploadService, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, $state, APIs, $ionicPopover, $filter) {


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
    var tppv = Number(d.total_pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
    var tpv = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var ar = Number(d.total_payout_value.split(' ')[0]-d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT_CYCLE')+"</b></div><div class='col'>"+d.mode.replace('_',' ')+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PROMOTED')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(p,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAST_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tpv,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('AUTHOR_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(ar,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('CURATION_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(crp,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(d.cashout_time, true)+"</div></div>";
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
      if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
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
          if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
            $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
          } else {
            var update = {profile: {profile_image:""} };
            angular.merge(update, $rootScope.$storage.user.json_metadata);
            if (update.profilePicUrl) {delete update.profilePicUrl;}

            update.profile.profile_image = "";

            $rootScope.log('You are sure');
            if ($rootScope.$storage.user) {
              $scope.mylogin = new window.steemJS.Login();
              $scope.mylogin.setRoles(["active"]);
              var loginSuccess = $scope.mylogin.checkKeys({
                  accountName: $rootScope.$storage.user.username,
                  password: $rootScope.$storage.user.password || null,
                  auths: {
                    active: $rootScope.$storage.user.active.key_auths
                  },
                  privateKey: $rootScope.$storage.user.privateActiveKey || null
                }
              );
              //todo: if json_metadata already exist make sure to keep it.
              if (loginSuccess) {
                var tr = new window.steemJS.TransactionBuilder();
                tr.add_type_operation("account_update", {
                  account: $rootScope.$storage.user.username,
                  memo_key: $rootScope.$storage.user.memo_key,
                  json_metadata: JSON.stringify(update)
                });
                localStorage.error = 0;
                tr.process_transaction($scope.mylogin, null, true);
                setTimeout(function() {
                  if (localStorage.error == 1) {
                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                  } else {
                    $rootScope.$broadcast('refreshLocalUserData');
                  }
                }, 3000);
              } else {
                $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
              }
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
    if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
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
              angular.merge(update, $rootScope.$storage.user.json_metadata);
              if (update.profilePicUrl) {delete update.profilePicUrl;}
              update.profile.profile_image = url;
            } else {
              angular.merge(update, $rootScope.$storage.user.json_metadata);
              update.profile.cover_image = url;
            }

            setTimeout(function() {
              $rootScope.$broadcast('show:loading');
              if ($rootScope.$storage.user) {
                $scope.mylogin = new window.steemJS.Login();
                $scope.mylogin.setRoles(["active"]);
                var loginSuccess = $scope.mylogin.checkKeys({
                    accountName: $rootScope.$storage.user.username,
                    password: $rootScope.$storage.user.password || null,
                    auths: {
                      active: $rootScope.$storage.user.active.key_auths
                    },
                    privateKey: $rootScope.$storage.user.privateActiveKey || null,
                  }
                );
                if (loginSuccess) {
                  var tr = new window.steemJS.TransactionBuilder();
                  tr.add_type_operation("account_update", {
                    account: $rootScope.$storage.user.username,
                    memo_key: $rootScope.$storage.user.memo_key,
                    json_metadata: JSON.stringify(update)
                  });

                  localStorage.error = 0;

                  tr.process_transaction($scope.mylogin, null, true);

                  setTimeout(function() {
                    if (localStorage.error == 1) {
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage);
                    } else {
                      $rootScope.$broadcast('refreshLocalUserData');
                    }
                  }, 3000);
                } else {
                  $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
                }
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
              angular.merge(update, $rootScope.$storage.user.json_metadata);
              if (update.profilePicUrl) {delete update.profilePicUrl;}
              update.profile.profile_image = res;
            } else {
              angular.merge(update, $rootScope.$storage.user.json_metadata);
              update.profile.cover_image = res;
            }

            setTimeout(function() {
              if ($rootScope.$storage.user) {
                $scope.mylogin = new window.steemJS.Login();
                $scope.mylogin.setRoles(["active"]);
                var loginSuccess = $scope.mylogin.checkKeys({
                    accountName: $rootScope.$storage.user.username,
                    password: $rootScope.$storage.user.password || null,
                    auths: {
                      active: $rootScope.$storage.user.active.key_auths
                    },
                    privateKey: $rootScope.$storage.user.privateActiveKey || null,
                  }
                );
                if (loginSuccess) {
                  var tr = new window.steemJS.TransactionBuilder();
                  tr.add_type_operation("account_update", {
                    account: $rootScope.$storage.user.username,
                    memo_key: $rootScope.$storage.user.memo_key,
                    json_metadata: JSON.stringify(update)
                  });
                  localStorage.error = 0;
                  tr.process_transaction($scope.mylogin, null, true);
                  setTimeout(function() {
                    if (localStorage.error == 1) {
                      $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                    } else {
                      //$scope.refreshLocalUserData();
                      $rootScope.$broadcast('refreshLocalUserData');
                    }
                  }, 3000);
                } else {
                  $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
                }
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
      if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
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
          if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
            $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
          } else {
            var update = {profile: {cover_image:""} };
            angular.merge(update, $rootScope.$storage.user.json_metadata);
            update.profile.cover_image = "";

            $rootScope.log('You are sure');
            if ($rootScope.$storage.user) {
              $scope.mylogin = new window.steemJS.Login();
              $scope.mylogin.setRoles(["active"]);
              var loginSuccess = $scope.mylogin.checkKeys({
                  accountName: $rootScope.$storage.user.username,
                  password: $rootScope.$storage.user.password || null,
                  auths: {
                    active: $rootScope.$storage.user.active.key_auths
                  },
                  privateKey: $rootScope.$storage.user.privateActiveKey || null
                }
              );
              //todo: if json_metadata already exist make sure to keep it.
              if (loginSuccess) {
                var tr = new window.steemJS.TransactionBuilder();
                tr.add_type_operation("account_update", {
                  account: $rootScope.$storage.user.username,
                  memo_key: $rootScope.$storage.user.memo_key,
                  json_metadata: JSON.stringify(update)
                });
                localStorage.error = 0;
                tr.process_transaction($scope.mylogin, null, true);
                setTimeout(function() {
                  if (localStorage.error == 1) {
                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                  } else {
                    $rootScope.$broadcast('refreshLocalUserData');
                  }
                }, 3000);
              } else {
                $rootScope.showMessage($filter('translate')('ERROR'), $filter('translate')('LOGIN_FAIL_A'));
              }
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

  $scope.isFollowing = function(xx) {
    if ($scope.following && $scope.following.indexOf(xx)!==-1) {
      return true;
    } else {
      return false;
    }
  };
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
    var params = {tag: $stateParams.username, limit: 20};
    var len = $scope.data.profile?$scope.data.profile.length:0;

    //console.log($scope.data.profile);

    if (len>0) {
      params.start_author = $scope.data.profile[len-1].author;
      params.start_permlink = $scope.data.profile[len-1].permlink;

      if ($scope.end) {
        //$rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('REQUEST_LIMIT_TEXT'));
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $rootScope.$broadcast('hide:loading');
      } else {
        //console.log(params);
        //$rootScope.log("fetching profile...blog 20 ");
        if (typeof window.Api.database_api === "function") {
          if ($scope.active == 'blog') {
            window.Api.database_api().exec("get_discussions_by_blog", [params]).then(function(response){

              if (response) {
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
          if ($scope.active == 'posts') {
            window.Api.database_api().exec("get_discussions_by_comments", [params]).then(function(response){

              if (response) {
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
            var pp = [$scope.data.profile[$scope.data.profile.length-1].author, $scope.data.profile[$scope.data.profile.length-1].permlink, 20];
            window.Api.database_api().exec("get_replies_by_last_update", [pp]).then(function(response){
              //console.log(response);
              if (response) {
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

  }
  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.user = {username: $stateParams.username};
    $scope.follower = [];
    $scope.following = [];
    $scope.limit = 100;
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

      window.Api.database_api().exec("get_state", ["/@"+$stateParams.username+$scope.rest]).then(function(res){
        $scope.data = {profile: []};
        //console.log(res);
        if (Object.keys(res.content).length>0) {
          angular.forEach(res.content, function(v,k){
            v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;
            if ($rootScope.$storage.user){
              if ($rootScope.$storage.user.username !== v.author) {
                v.reblogged = true;
              }
              var len = v.active_votes.length;
              for (var j = len - 1; j >= 0; j--) {
                if (v.active_votes[j].voter === $rootScope.$storage.user.username) {
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
      });
    };
    $scope.getFollows = function(r,d) {

      $scope.dfetching = function(){
        APIs.getFollowing($rootScope.$storage.user.username, $scope.tt.duser, "blog", $scope.limit).then(function(res){
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
            setTimeout($scope.dfetching, 5);
          }
        });
      };
      $scope.rfetching = function(){
        APIs.getFollowers($rootScope.$storage.user.username, $scope.tt.ruser, "blog", $scope.limit).then(function(res){
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
            setTimeout($scope.rfetching, 10);
          }
        });
      };
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
      //console.log("getOtherUsersData");
      window.Api.database_api().exec("get_accounts", [[$stateParams.username]]).then(function(dd){
        dd = dd[0];
        if (dd && dd.json_metadata) {
          dd.json_metadata = angular.fromJson(dd.json_metadata);
        }
        angular.merge($scope.user, dd);
        //console.log(angular.toJson($scope.user));
        //console.log($scope.user.json_metadata.profile.cover_image);

        if ($rootScope.$storage.user) {
          $scope.css = ($rootScope.$storage.user.username === $scope.user.username && $rootScope.$storage.user.json_metadata.profile.cover_image) ? {'background': 'url('+$rootScope.$storage.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed'} : ($rootScope.$storage.user.username !== $scope.user.username && ($scope.user.json_metadata && $scope.user.json_metadata.profile.cover_image)) ? {'background': 'url('+$scope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed'} : null;
        } else {
          $scope.css = null;
        }

      });
      window.Api.follow_api().exec("get_follow_count", [$stateParams.username]).then(function(res){
        //console.log(res);
        $scope.followdetails = res;
      });
      $scope.getFollows(null, "d");
      if(!$scope.$$phase){
        $scope.$apply();
      }
    };

    $scope.refresh();
    if ($rootScope.$storage.user) {
      if ($rootScope.$storage.user.username !== $stateParams.username) {
        $scope.getOtherUsersData();
      } else {
          $rootScope.log("get follows counts");
          window.Api.follow_api().exec("get_follow_count", [$stateParams.username]).then(function(res){
            //console.log(res);
            $scope.followdetails = res;
          });
          //$scope.getFollows("r","d");
      }
    } else {
      if ($stateParams.username) {
        $scope.getOtherUsersData();
      }
    }

    //setTimeout(function() {
      $scope.css = ($rootScope.$storage.user.username === $scope.user.username && $rootScope.$storage.user.json_metadata && $rootScope.$storage.user.json_metadata.profile.cover_image) ? {'background': 'url('+$rootScope.$storage.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed'} : ($rootScope.$storage.user.username !== $scope.user.username && ($scope.user.json_metadata && $scope.user.json_metadata.profile.cover_image)) ? {'background': 'url('+$scope.user.json_metadata.profile.cover_image+')', 'background-size': 'cover', 'background-position':'fixed'} : null;
      //console.log($scope.css);
    //}, 1);

  });
  $scope.openMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }
  $scope.change = function(type){
    $scope.data = undefined;
    $scope.data = {profile: []};
    $scope.accounts = [];
    $scope.active = type;
    $scope.end = false;
    if (type != "blog") {
      $scope.rest = "/"+type;
    } else {
      $scope.rest = "";
    }
    window.Api.database_api().exec("get_state", ["/@"+$stateParams.username+$scope.rest]).then(function(res){
      //console.log(res);
      if (res.content) {
        if (Object.keys(res.content).length>0) {
          angular.forEach(res.content, function(v,k){
            v.json_metadata = v.json_metadata?angular.fromJson(v.json_metadata):v.json_metadata;
            if ($rootScope.$storage.user){
              if ($rootScope.$storage.user.username !== v.author) {
                v.reblogged = true;
              }
              var len = v.active_votes.length;
              for (var j = len - 1; j >= 0; j--) {
                if (v.active_votes[j].voter === $rootScope.$storage.user.username) {
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
            $scope.transfers = res.accounts[property].transfer_history;
            $scope.nonexist = false;
          }
        }
        if(!$scope.$$phase){
          $scope.$apply();
        }
      }
    });
  }

})

app.controller('ExchangeCtrl', function($scope, $stateParams, $rootScope) {
  $scope.username = $stateParams.username;

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = 'buy';
    $scope.orders = [];
    window.Api.database_api().exec("get_order_book", [15]).then(function(res){
      $scope.orders = res;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    $scope.change = function(type){
      $scope.active = type;
      if (type == "open"){
        window.Api.database_api().exec("get_open_orders", [$stateParams.username]).then(function(res){
          $scope.openorders = res;
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });
      }
      if (type == "history"){
        $scope.history = [];
        window.Api.market_history_api().exec("get_recent_trades", [15]).then(function(r){
          $scope.recent_trades = r;
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

   $scope.openTooltip = function($event, d) {
      var texth = d;
      $scope.tooltipText = texth;
      $scope.tooltip.show($event);
   };

  function getDate(xx) {
    angular.forEach($rootScope.$storage.currencies, function(v,k){
      if (v.id == xx) {
        return true;
      }
    });
  }

  function searchObj(nameKey, myArray) {
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === nameKey) {
            return myArray[i];
        }
    }
  }

  function checkDate(date) {
    var eold = 86400000; //1 * 24 * 60 * 60 * 1000; //1 day old
    var now = new Date().getTime();
    var old = new Date(date).getTime();
    return now-old>=eold;
  }

  $scope.changeCurrency = function(xx) {
    setTimeout(function() {
      console.log(xx);
      var resultObject = $rootScope.$storage.currencies.filter(function ( obj ) {
          return obj.id === xx;
      })[0];
      //searchObj(xx, $rootScope.$storage.currencies);
      if (checkDate(resultObject.date)) {
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
        if (!$scope.$$phase) {
          $scope.$apply();
        }  
      }
    }, 1);
  }
  $scope.changeChain = function() {

    if ($rootScope.$storage.chain == 'steem'){
      $rootScope.$storage.platformname = "Steem";
      $rootScope.$storage.platformpower = "Steem Power";
      $rootScope.$storage.platformsunit = "Steem";
      $rootScope.$storage.platformdollar = "Steem Dollar";
      $rootScope.$storage.platformdunit = "SBD";
      $rootScope.$storage.platformpunit = "SP";
      $rootScope.$storage.platformlunit = "STEEM";
      $rootScope.$storage.socket = "wss://node.steem.ws";
    } else {
      $rootScope.$storage.platformname = "ГОЛОС";
      $rootScope.$storage.platformpower = "СИЛА ГОЛОСА";
      $rootScope.$storage.platformsunit = "Голос";
      $rootScope.$storage.platformdollar = "ЗОЛОТОЙ";
      $rootScope.$storage.platformdunit = "GBG";
      $rootScope.$storage.platformpunit = "СИЛА ГОЛОСА";
      $rootScope.$storage.platformlunit = "ГОЛОС";
      $rootScope.$storage.socket = "wss://node.golos.ws";

    }
    
    $scope.changeCurrency($rootScope.$storage.currency);

  }
  $scope.closeTooltip = function() {
    $scope.tooltip.hide();
  };

  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.tooltip.remove();
  });

  $scope.changeLanguage = function(locale){
    setTimeout(function() {
      $translate.use(locale);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      //$window.location.reload(true);
    }, 1);
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    $rootScope.$storage.socket = localStorage.socketUrl;
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
    $scope.slider = {
      value: $scope.vvalue,
      options: {
        floor: 1,
        ceil: 100
      }
    };

    if ($rootScope.$storage.pincode) {
      $scope.data = {pin: true};
    } else {
      $scope.data = {pin: false};
    }

    if ($rootScope.$storage.user && $rootScope.$storage.deviceid) {
      APIs.getSubscriptions($rootScope.$storage.deviceid).then(function(res){
        $rootScope.log(angular.toJson(res.data));
        angular.merge($scope.data, {vote: res.data[0].subscription.vote, follow: res.data[0].subscription.follow, comment: res.data[0].subscription.comment, mention: res.data[0].subscription.mention, resteem: res.data[0].subscription.resteem});
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
      appversion: '1.3.8'
    }
    APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.$storage.user.username, $rootScope.$storage.subscription).then(function(res){
      console.log(angular.toJson(res));
    });

  }

  $scope.$watch('slider', function(newValue, oldValue){
    //console.log(newValue.value);
    if (newValue.value) {
      $rootScope.$storage.voteWeight = newValue.value*100;
    }
  }, true);

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
    $rootScope.$storage.mylogin = undefined;
    $rootScope.$storage.mylogin = null;
    //make sure user credentials cleared.
    if ($rootScope.$storage.deviceid) {
      APIs.deleteSubscription($rootScope.$storage.deviceid).then(function(res){
        $ionicSideMenuDelegate.toggleLeft();
        $window.location.reload(true);
      });
    } else {
      $ionicSideMenuDelegate.toggleLeft();
      $window.location.reload(true);
    }
    $rootScope.$storage.filter = undefined;
    $rootScope.$storage.tag = undefined;

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
  };
  $scope.save = function(){
    if (localStorage.socketUrl !== $rootScope.$storage.socket) {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('ARE_YOU_SURE'),
        template: $filter('translate')('UPDATE_REQUIRES_RESTART')
      });
      confirmPopup.then(function(res) {
        if(res) {
          $rootScope.log('You are sure');
          localStorage.socketUrl = $rootScope.$storage.socket;
          $scope.logouts();
          setTimeout(function() {
            ionic.Platform.exitApp(); // stops the app
          }, 10);
        } else {
          $rootScope.log('You are not sure');
        }
      });
    };
    $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('SETTINGS_UPDATED'));
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    //$state.go('app.posts', {}, {reload: true});
    $window.location.reload(true);
  };

});
}
