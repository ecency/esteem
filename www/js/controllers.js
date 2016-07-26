angular.module('steem.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, MyService, $state, $ionicHistory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.open = function(item) {
    $rootScope.$storage.sitem = item;
    $state.go('app.single');
  };

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    var temp = new Steem($rootScope.$storage.socket);
    temp.getAccounts([$scope.loginData.username], function(err, dd) {
      //console.log(angular.toJson(dd));
      //[["STM6tGVJ7N7wSromsHMaxZsSaUsvA9NMzhKxpCVuFwECrfVpw1JTR",1]]},"active":{"weight_threshold":1,"account_auths":[],"key_auths":[["STM4z77fEao7nyLy8xMh74pUdNjBEjixGzBcXekZMEAQcpgJauYMd",1]]},"posting":{"weight_threshold":1,"account_auths":[],"key_auths":[["STM7CD5Sbw1ohoLsSVbChe8aWXuD7gmt9de758azbnQQftUoRtBSm",1]]},"memo_key":"STM82iAjMevvouyybmGZriZovfdtqajymt5VPU6GcmV7C3bDCike3","json_metadata":"","proxy":"","last_owner_update":"1970-01-01T00:00:00","created":"2016-07-07T08:15:00","mined":false,"owner_challenged":false,"active_challenged":false,"last_owner_proved":"1970-01-01T00:00:00","last_active_proved":"1970-01-01T00:00:00","recovery_account":"steem","comment_count":0,"lifetime_vote_count":0,"post_count":56,"voting_power":7347,"last_vote_time":"2016-07-20T10:48:21","balance":"0.000 STEEM","sbd_balance":"0.000 SBD","sbd_seconds":"7022657376","sbd_seconds_last_update":"2016-07-20T08:17:12","sbd_last_interest_payment":"2016-07-08T22:45:48","vesting_shares":"636649.594942 VESTS","vesting_withdraw_rate":"0.000000 VESTS","next_vesting_withdrawal":"1969-12-31T23:59:59","withdrawn":0,"to_withdraw":0,"withdraw_routes":0,"curation_rewards":42,"posting_rewards":242197,"proxied_vsf_votes":[0,0,0,0],"witnesses_voted_for":0,"average_bandwidth":310232493,"lifetime_bandwidth":"144194000000","last_bandwidth_update":"2016-07-20T10:48:21","average_market_bandwidth":129894320,"last_market_bandwidth_update":"2016-07-20T08:18:39","last_post":"2016-07-20T08:40:48","last_root_post":"2016-07-19T19:01:54","last_active":"2016-07-20T10:48:21","activity_shares":"512478414963327438","last_activity_payout":"1970-01-01T00:00:00","vesting_balance":"0.000 STEEM","transfer_history":[],"market_history":[],"post_history":[],"vote_history":[],"other_history":[],"witness_votes":[],"blog_category":{}}]
      
      console.log(dd);
      dd = dd[0];
      $scope.loginData.id = dd.id;
      $scope.loginData.owner = dd.owner;
      $scope.loginData.active = dd.active;
      $scope.loginData.posting = dd.posting;
      $scope.loginData.memo_key = dd.memo_key;

      $rootScope.$storage.user = $scope.loginData;
      $state.go('app.posts', {}, { reload: true });

      $timeout(function() {
        $scope.closeLogin();
      });
    });
    temp.login($scope.loginData.username, $scope.loginData.password, function(err, result){
      console.log(err)
      console.log(result)
    })
  };
  console.log($rootScope.$storage.user);
  $scope.options = {
    loop: true,
    effect: 'slide',
    speed: 500,
  }
  setTimeout(function() {
    (new Steem($rootScope.$storage.socket)).getCurrentMedianHistoryPrice(function(e,r){
      $rootScope.$storage.base = r.base.substring(r.base.length-4,-4);
      (new Steem($rootScope.$storage.socket)).getDynamicGlobalProperties(function(e,r){
        $rootScope.$storage.steem_per_mvests = (Number(r.total_vesting_fund_steem.substring(0, r.total_vesting_fund_steem.length - 6)) / Number(r.total_vesting_shares.substring(0, r.total_vesting_shares.length - 6))) * 1e6;
      });
    });
  }, 10);
  
 

  $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
    // note: the indexes are 0-based
    $scope.activeIndex = data.activeIndex;
    $scope.previousIndex = data.previousIndex;
  });

  $scope.logout = function() {
    $rootScope.$storage.user = undefined;
  };
  $scope.data = {};
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.smodal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeSmodal = function() {
    $scope.smodal.hide();
  };

  // Open the login modal
  $scope.openSmodal = function() {
    $scope.data.type="tag";
    $scope.smodal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.search = function() {
    console.log('Doing search', $scope.data.search);
    if ($scope.data.search.length > 3) {
      $scope.steem = new Steem($rootScope.$storage.socket);
      if ($scope.data.type == "tag"){
        $scope.steem.getTrendingTags($scope.data.search, 10 , function(err, result) {
          var ee = [];
          if (result){
            for (var i = result.length - 1; i >= 0; i--) {
              if (result[i].tag.indexOf($scope.data.search) > -1){
                ee.push(result[i]);
              }
            }
            $scope.data.searchResult = ee;
          }
          console.log(result);
          console.log(err);
        });  
      }
      if ($scope.data.type == "user"){
        var ee = [];
        $scope.steem.lookupAccounts($scope.data.search, 10, function(err, result) {
          if (result){
            for (var i = result.length - 1; i >= 0; i--) {
              if (result[i].indexOf($scope.data.search) > -1){
                ee.push(result[i]);
              }
            }
            $scope.data.searchResult = ee;
          }
            console.log(result);
            console.log(err);  
        });  
      }
    }
  };
  $scope.typechange = function() {
    $scope.data.searchResult = undefined;
    console.log("changing search type");
  }
  $scope.openTag = function(xx) {
    console.log("opening tag "+xx);
    $rootScope.$storage.tag = xx;
    $scope.closeSmodal();
    $state.go("app.posts", {}, {reload:true});
  };
  $scope.openUser = function(xy) {
    console.log("opening user "+xy);
    $rootScope.$storage.profile = xy;
    $scope.closeSmodal();
    $state.go("app.posts", {}, {reload:true});
  };

  $scope.save = function(){
    $rootScope.showAlert("Success", "Settings are updated!");
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.posts');
  };

})

.controller('PostsCtrl', function($scope, $rootScope, MyService, $state, $ionicPopup) {

  $scope.showFilter = function() {
   $scope.fdata = {filter: $rootScope.$storage.filter || "trending"};
   var myPopupF = $ionicPopup.show({
     //template: '<ion-list><label class="item item-input item-select"><div class="input-label">Category</div><select ng-model="fdata.filter"><option>hot</option><option>trending</option><option value="cashout">payout time</option><option value="children">responses</option><option value="created">new</option><option>active</option><option value="votes">popular</option></select></label><label class="item item-input"><span class="input-label">Tag</span><input type="text" ng-model="fdata.tag" placeholder="tag e.g. steemit"></label></ion-list>',
     template: '<ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="hot"><i class="icon" ng-class="{\'ion-flame gray\':fdata.filter!=\'hot\', \'ion-flame positive\': fdata.filter==\'hot\'}"></i> Hot</ion-radio><ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="created"><i class="icon" ng-class="{\'ion-star gray\':fdata.filter!=\'new\', \'ion-star positive\': fdata.filter==\'new\'}"></i> New</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="trending"><i class="icon" ng-class="{\'ion-podium gray\':fdata.filter!=\'trending\', \'ion-podium positive\': fdata.filter==\'trending\'}"></i> Trending</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="active"><i class="icon" ng-class="{\'ion-chatbubble-working gray\':fdata.filter!=\'active\', \'ion-chatbubble-working positive\': fdata.filter==\'active\'}"></i> Active</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="cashout"><i class="icon" ng-class="{\'ion-share gray\':fdata.filter!=\'cashout\', \'ion-share positive\': fdata.filter==\'cashout\'}"></i> Cashout</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="payout"><i class="icon" ng-class="{\'ion-cash gray\':fdata.filter!=\'payout\', \'ion-cash positive\': fdata.filter==\'payout\'}"></i> Payout</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="votes"><i class="icon" ng-class="{\'ion-person-stalker gray\':fdata.filter!=\'votes\', \'ion-person-stalker positive\': fdata.filter==\'votes\'}"></i> Votes</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="children"><i class="icon" ng-class="{\'ion-chatbubbles gray\':fdata.filter!=\'children\', \'ion-chatbubbles positive\': fdata.filter==\'children\'}"></i> Comments</ion-radio>',
     
     title: 'Sort by',
     scope: $scope,
     /*buttons: [
       { text: 'Cancel' },
       {
         text: '<b>Submit</b>',
         type: 'button-balanced',
         onTap: function(e) {
            console.log($scope.fdata.filter);
            if (!$scope.fdata.filter) {
              e.preventDefault();
            } else {
              $rootScope.$storage.filter = $scope.fdata.filter;
              if ($scope.fdata.tag) {
                $rootScope.$storage.tag = $scope.fdata.tag;
              } else {
                $scope.fdata.tag = "";  
              }
              
              return [$scope.fdata.filter, $scope.fdata.tag];
            }
         }
       },
     ]*/
   });
    $scope.filterchange = function(f){
      console.log($scope.fdata.filter)
      $rootScope.$storage.filter = $scope.fdata.filter;
      myPopupF.close();
      $rootScope.$broadcast('filter:change');
    }
    $rootScope.$on('filter:change', function() {
      console.log($rootScope.$storage.filter)
      var type = $rootScope.$storage.filter || "trending";
      var tag = $rootScope.$storage.tag || "";
      var params = {tag: tag, limit: $scope.limit, filter_tags: []};

      if (type == "trending"){
         $scope.steem.getDiscussionsByTrending(params , function(err, dd) {
          $scope.data = $scope.changed(dd);  
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });
      }
      if (type == "created"){
        $scope.steem.getDiscussionsByCreated(params , function(err, dd) {
          $scope.data = $scope.changed(dd);  
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });  
      }
      if (type == "active"){
        $scope.steem.getDiscussionsByActive(params , function(err, dd) {
          $scope.data = $scope.changed(dd);  
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });  
      }
      if (type == "cashout"){
        $scope.steem.getDiscussionsByCashout(params , function(err, dd) {
          $scope.data = $scope.changed(dd);  
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });  
      }
      if (type == "payout"){
        $scope.steem.getDiscussionsByPayout(params , function(err, dd) {
          $scope.data = $scope.changed(dd);  
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });  
      }
      if (type == "votes"){
        $scope.steem.getDiscussionsByVotes(params , function(err, dd) {
          $scope.data = $scope.changed(dd);  
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });  
      }
      if (type == "children"){
        $scope.steem.getDiscussionsByChildren(params , function(err, dd) {
          $scope.data = $scope.changed(dd);  
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });  
      }
      if (type == "hot"){
        $scope.steem.getDiscussionsByHot(params , function(err, dd) {
          $scope.data = $scope.changed(dd);  
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });  
      }
    });
    myPopupF.then(function(res) {
      if (res) {
        var params = {tag: res[1], limit: $scope.limit, filter_tags: []};
        var type = res[0];
        if (type == "trending"){
           $scope.steem.getDiscussionsByTrending(params , function(err, dd) {
            $scope.data = $scope.changed(dd);  
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });
        }
        if (type == "created"){
          $scope.steem.getDiscussionsByCreated(params , function(err, dd) {
            $scope.data = $scope.changed(dd);  
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });  
        }
        if (type == "active"){
          $scope.steem.getDiscussionsByActive(params , function(err, dd) {
            $scope.data = $scope.changed(dd);  
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });  
        }
        if (type == "cashout"){
          $scope.steem.getDiscussionsByCashout(params , function(err, dd) {
            $scope.data = $scope.changed(dd);  
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });  
        }
        if (type == "payout"){
          $scope.steem.getDiscussionsByPayout(params , function(err, dd) {
            $scope.data = $scope.changed(dd);  
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });  
        }
        if (type == "votes"){
          $scope.steem.getDiscussionsByVotes(params , function(err, dd) {
            $scope.data = $scope.changed(dd);  
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });  
        }
        if (type == "children"){
          $scope.steem.getDiscussionsByChildren(params , function(err, dd) {
            $scope.data = $scope.changed(dd);  
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });  
        }
        if (type == "hot"){
          $scope.steem.getDiscussionsByHot(params , function(err, dd) {
            $scope.data = $scope.changed(dd);  
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });  
        }
      }
   });
  };

  $scope.changed = function(newValue){
    console.log("changed");
    for (var i = 0; i < newValue.length; i++) {
      newValue[i].json_metadata = angular.fromJson(newValue[i].json_metadata?newValue[i].json_metadata:[]);
      if ($rootScope.$storage.user){
        for (var j = newValue[i].active_votes.length - 1; j >= 0; j--) {
          if (newValue[i].active_votes[j].voter == $rootScope.$storage.user.username) {
            if (newValue[i].active_votes[j].percent > 0) {
              newValue[i].upvoted = true;  
            } else {
              newValue[i].downvoted = true;  
            }
          }
        }
      }
    }
    return newValue;
  };
  $scope.refresh = function(){
    var params = {tag: "", limit: $scope.limit, filter_tags: []};
    $scope.steem.getDiscussionsByTrending(params , function(err, dd) {
      $scope.data = $scope.changed(dd);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  };
  $scope.loadMore = function() {
    $scope.limit += 5
    var params = {tag: "", limit: $scope.limit, filter_tags: []};
    $scope.steem.getDiscussionsByTrending(params , function(err, dd) {
      $scope.data = $scope.changed(dd);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
      console.log('****complete*****');
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

  $scope.getA = function() {
    /*MyService.getAccountVotes("good-karma").then(function(dd){
      console.log(dd);
    });*/
    /*
    {"username":"good-karma","id":"2.2.14805","owner":{"weight_threshold":1,"account_auths":[],"key_auths":[["STM6tGVJ7N7wSromsHMaxZsSaUsvA9NMzhKxpCVuFwECrfVpw1JTR",1]]},"active":{"weight_threshold":1,"account_auths":[],"key_auths":[["STM4z77fEao7nyLy8xMh74pUdNjBEjixGzBcXekZMEAQcpgJauYMd",1]]},"posting":{"weight_threshold":1,"account_auths":[],"key_auths":[["STM7CD5Sbw1ohoLsSVbChe8aWXuD7gmt9de758azbnQQftUoRtBSm",1]]},"memo_key":"STM82iAjMevvouyybmGZriZovfdtqajymt5VPU6GcmV7C3bDCike3"}
    */
    //var secret = new jsSHA("SHA-256", "good-karma" + "posting" + "Fedya132steemit.com" ) 
  
    //var hash = CryptoJS.SHA256("good-karma" + "posting" + "Fedya132steemit.com");//secret.getHash("HEX");
    //console.log(hash.toString());
    console.log($rootScope.$storage.user.posting.key_auths[0][0]);
    /*MyService.getKey($rootScope.$storage.user.posting.key_auths[0][0]).then(function(dd){
      console.log(dd[0]);
    });*/
    /*MyService.broadcast($rootScope.$storage.user.posting.key_auths[0][0]).then(function(dd){
      console.log(dd[0]);
    });*/
    
    // First generate the private key using the Login class
    /*var login = new Login();
    login.setRoles(["posting"]);
    var loginSuccess = login.checkKeys({ accountName: "good-karma", password: "Fedya132steemit.com", auths: { posting: [["STMpostingAuthKey", 1]] } });

    if (!loginSuccess) {
        throw new Error("The password or account name was incorrect");
    }    
    // Then create the transaction and sign it without broadcasting
    var tr = new TransactionBuilder();
    tr.add_type_operation("vote", { voter: "good-karma", author: "seshadga", permlink: "bitcoin-price-sustainability-looks-on-track", weight: 100});

    tr.process_transaction(login, null, false);

    console.log(tr);
    console.log(login);
   */

    $scope.steem.getAccounts(['ned', 'dan'], function(err, result) {
        console.log(err, result);
    });



  };

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.steem = new Steem($rootScope.$storage.socket);
    $scope.limit = 10;
    var params = {tag: "", limit: $scope.limit, filter_tags: []};
    $scope.steem.getDiscussionsByTrending(params , function(err, dd) {
      $scope.data = $scope.changed(dd);
    });
    /*MyService.getPosts($scope.limit).then(function(dd){
      console.log(dd);
      for (var i = 0; i < dd.length; i++) {
        dd[i].json_metadata = angular.fromJson(dd[i].json_metadata?dd[i].json_metadata:[]);
        if ($rootScope.$storage.user){
          for (var j = dd[i].active_votes.length - 1; j >= 0; j--) {
            if (dd[i].active_votes[j].voter == $rootScope.$storage.user.username) {
              if (dd[i].active_votes[j].percent > 0) {
                dd[i].upvoted = true;  
              } else {
                dd[i].downvoted = true;  
              }
            }
          }  
        }
      }
      $scope.data = dd;
    });*/
  });
  setTimeout(function() {
    $scope.refresh();    
  }, 2000);

  
  
})

.controller('PostCtrl', function($scope, $stateParams, $rootScope, MyService) {
  console.log($rootScope.$storage.sitem)

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.steem = new Steem($rootScope.$storage.socket);
    //console.log($rootScope.$storage.sitem);
    
    $scope.steem.getContentReplies($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink, function(err, result){
      //console.log(result);
      $scope.comments = result;
      for (var i = 0; i < $scope.comments.length; i++) {
        if ($scope.comments[i].children>0){
          $scope.comments[i].creplies = $scope.checked($scope.comments[i]);
        }
      }
      console.log($scope.comments);
      
    });
    $scope.checked = function(xx){
      console.log('checked '+xx.author);
      return (new Steem($rootScope.$storage.socket)).getContentReplies(xx.parent_author, xx.parent_permlink, function(err, res1) {
        return res1;
      });
    };
  });



      /*for (var i = 0; i < result.length; i++) {
        $scope.steem.getActiveVotes(result[i].author, result[i].permlink, function(err, da){
          console.log(da);
          if ($rootScope.$storage.user){
            //for (var k = 0; k < da.length; i++) {
              for (var j = da[0].active_votes.length - 1; j >= 0; j--) {
                if (da[k].active_votes[j].voter == $rootScope.$storage.user.username) {
                  if (da[k].active_votes[j].percent > 0) {
                    result[i].upvoted = true;  
                  } else {
                    result[i].downvoted = true;  
                  }
                }
              //}
            }
          }
        });
      }*/


})

.controller('FollowersCtrl', function($scope, $stateParams, $rootScope, $state) {

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.followers = {};
    $scope.limit = 10;
    var temp = new Steem($rootScope.$storage.socket);
    temp.getFollowers($rootScope.$storage.user.username, false, $scope.limit, function(e, r){
      console.log(e)
      console.log(r)
      $scope.followers = r;
      if (!$scope.$phase)
        $scope.$apply();
    })
  });
  $scope.profileView = function(xx){
    $state.go('app.profile', {username: xx});
  };
  $scope.loadMore = function() {
    if (!$scope.last) {
      $scope.limit += 5
      var temp = new Steem($rootScope.$storage.socket);
      temp.getFollowers($rootScope.$storage.user.username, false, $scope.limit, function(e, r){
        console.log(e)
        console.log(r)
        if (!$scope.$phase)
          $scope.$apply();

        if (r.length == $scope.followers.length) {
          $scope.last = true;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        $scope.followers = r;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });  
    } else {
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }
  };

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

})

.controller('FollowingCtrl', function($scope, $stateParams, $rootScope, $state) {

 $scope.$on('$ionicView.beforeEnter', function(){
    $scope.following = {};
    $scope.limit = 10;
    var temp = new Steem($rootScope.$storage.socket);
    temp.getFollowing($rootScope.$storage.user.username, true, $scope.limit, function(e, r){
      console.log(e)
      console.log(r)
      $scope.following = r;
      if (!$scope.$phase)
        $scope.$apply();
    })
  });
  $scope.profileUnfollow = function(xx){
    $rootScope.showAlert("Warning", "In Development, Stay tuned!");
  };
  $scope.profileView = function(xx){
    $state.go('app.profile', {username: xx});
  };
  $scope.loadMore = function() {
    if (!$scope.last) {
      $scope.limit += 5
      var temp = new Steem($rootScope.$storage.socket);
      temp.getFollowing($rootScope.$storage.user.username, false, $scope.limit, function(e, r){
        console.log(e)
        console.log(r)
        if (!$scope.$phase)
          $scope.$apply();

        if (r.length == $scope.following.length) {
          $scope.last = true;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        $scope.following = r;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });  
    } else {
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }
  };

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });
})

.controller('ProfileCtrl', function($scope, $stateParams, $rootScope) {
  $scope.username = $stateParams.username;

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = "blog";
    $scope.change = function(type){
      $scope.profile = [];
      $scope.accounts = [];
      $scope.active = type;
      if (type != "blog") {
        $scope.rest = "/"+type;
      } else {
        $scope.rest = "";
      }
      (new Steem($rootScope.$storage.socket)).getState("/@"+$stateParams.username+$scope.rest, function(err, res){
        console.log(res);
        console.log(type)
        if (res.content) {
          console.log(res.content)
          for (var property in res.content) {
            if (res.content.hasOwnProperty(property)) {
              // do stuff
              //console.log(res.content[property])
              $scope.profile.push(res.content[property]);
            }
          }  
        } 
        if (type=="transfers" || type=="permissions") {
          console.log(res.accounts)
          for (var property in res.accounts) {
            if (res.accounts.hasOwnProperty(property)) {
              // do stuff
              //console.log(res.accounts[property])
              $scope.accounts = res.accounts[property];
            }
          }  
          //console.log(res.accounts.$rootScope.$storage.user.username);
          //$scope.profile = res.accounts[$rootScope.$storage.user.username];
        }
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
      });
    };
    
    $scope.profile = [];
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (toState.name == "app.profile") {
        console.log('Profile change is beginning');
        (new Steem($rootScope.$storage.socket)).getState("/@"+$stateParams.username, function(err, res){
          $scope.profile = [];
          console.log(res.content);
          for (var property in res.content) {
            if (res.content.hasOwnProperty(property)) {
              // do stuff
              //console.log(res.content[property])
              $scope.profile.push(res.content[property]);
            }
          }
          if(!$scope.$$phase){
            $scope.$apply();
          }
        });  
      }
      
    });
  });

})

;
