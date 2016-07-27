angular.module('steem.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $state, $ionicHistory) {

  $scope.loginData = {};

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.open = function(item) {
    $rootScope.$storage.sitem = item;
    $state.go('app.single');
  };

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    var temp = new Steem($rootScope.$storage.socket);
    temp.getAccounts([$scope.loginData.username], function(err, dd) {
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
      console.log(angular.toJson(err));
      console.log("-----LOGIN-----"+angular.toJson(result))
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
    $scope.closeSmodal();
    $state.go("app.profile", {username: xy});
  };

  $scope.save = function(){
    $rootScope.showAlert("Success", "Settings are updated!");
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.posts');
  };
})

.controller('PostsCtrl', function($scope, $rootScope, $state, $ionicPopup) {

  $scope.showFilter = function() {
   $scope.fdata = {filter: $rootScope.$storage.filter || "trending"};
   var myPopupF = $ionicPopup.show({
     //template: '<ion-list><label class="item item-input item-select"><div class="input-label">Category</div><select ng-model="fdata.filter"><option>hot</option><option>trending</option><option value="cashout">payout time</option><option value="children">responses</option><option value="created">new</option><option>active</option><option value="votes">popular</option></select></label><label class="item item-input"><span class="input-label">Tag</span><input type="text" ng-model="fdata.tag" placeholder="tag e.g. steemit"></label></ion-list>',
     template: '<ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="hot"><i class="icon" ng-class="{\'ion-flame gray\':fdata.filter!=\'hot\', \'ion-flame positive\': fdata.filter==\'hot\'}"></i> Hot</ion-radio><ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="created"><i class="icon" ng-class="{\'ion-star gray\':fdata.filter!=\'new\', \'ion-star positive\': fdata.filter==\'new\'}"></i> New</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="trending"><i class="icon" ng-class="{\'ion-podium gray\':fdata.filter!=\'trending\', \'ion-podium positive\': fdata.filter==\'trending\'}"></i> Trending</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="active"><i class="icon" ng-class="{\'ion-chatbubble-working gray\':fdata.filter!=\'active\', \'ion-chatbubble-working positive\': fdata.filter==\'active\'}"></i> Active</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="cashout"><i class="icon" ng-class="{\'ion-share gray\':fdata.filter!=\'cashout\', \'ion-share positive\': fdata.filter==\'cashout\'}"></i> Cashout</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="payout"><i class="icon" ng-class="{\'ion-cash gray\':fdata.filter!=\'payout\', \'ion-cash positive\': fdata.filter==\'payout\'}"></i> Payout</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="votes"><i class="icon" ng-class="{\'ion-person-stalker gray\':fdata.filter!=\'votes\', \'ion-person-stalker positive\': fdata.filter==\'votes\'}"></i> Votes</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="children"><i class="icon" ng-class="{\'ion-chatbubbles gray\':fdata.filter!=\'children\', \'ion-chatbubbles positive\': fdata.filter==\'children\'}"></i> Comments</ion-radio>',
     
     title: 'Sort by',
     scope: $scope
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
      $scope.fetchPosts(type, $scope.limit, tag);
    });
    myPopupF.then(function(res) {
      if (res) {
        $scope.fetchPosts(res[0], null, res[1]);
      }
   });
  };

  
  $scope.refresh = function(){
    $scope.fetchPosts();
    $rootScope.$broadcast('filter:change');
  };
  $scope.loadMore = function() {
    $scope.limit += 5
    setTimeout(function() {
      if (!$scope.error) {
        $scope.fetchPosts(null, $scope.limit, null);  
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }, 10);
  };

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

  $scope.getA = function() {
   
    console.log($rootScope.$storage.user.posting.key_auths[0][0]);

    $scope.steem.getAccounts(['ned', 'dan'], function(err, result) {
        console.log(err, result);
    });



  };
  $scope.changed = function(newValue){
    if (newValue) {
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
    } else {
      return;
    }
    
  };
  $scope.fetchPosts = function(type, limit, tag) {
    type = type || $rootScope.$storage.filter || "trending";
    tag = tag || $rootScope.$storage.tag || "";
    limit = limit || $scope.limit || 10;

    var params = {tag: tag, limit: limit, filter_tags: []};
    console.log("fetching..."+type, limit, tag)

    if (type == "trending"){
       (new Steem($rootScope.$storage.socket)).getDiscussionsByTrending(params , function(err, dd) {
        //console.log(dd)
        if (err && err.code) {
          $scope.error = true;
          $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
        }
        $scope.data = $scope.changed(dd);  
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });
    }
    if (type == "created"){
      (new Steem($rootScope.$storage.socket)).getDiscussionsByCreated(params , function(err, dd) {
        if (err && err.code) {
          $scope.error = true;
          $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
        }
        $scope.data = $scope.changed(dd);  
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });  
    }
    if (type == "active"){
      (new Steem($rootScope.$storage.socket)).getDiscussionsByActive(params , function(err, dd) {
        if (err && err.code) {
          $scope.error = true;
          $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
        }
        $scope.data = $scope.changed(dd);  
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });  
    }
    if (type == "cashout"){
      (new Steem($rootScope.$storage.socket)).getDiscussionsByCashout(params , function(err, dd) {
        if (err && err.code) {
          $scope.error = true;
          $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
        }
        $scope.data = $scope.changed(dd);  
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });  
    }
    if (type == "payout"){
      (new Steem($rootScope.$storage.socket)).getDiscussionsByPayout(params , function(err, dd) {
        if (err && err.code) {
          $scope.error = true;
          $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
        }
        $scope.data = $scope.changed(dd);  
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });  
    }
    if (type == "votes"){
      (new Steem($rootScope.$storage.socket)).getDiscussionsByVotes(params , function(err, dd) {
        if (err && err.code) {
          $scope.error = true;
          $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
        }
        $scope.data = $scope.changed(dd);  
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });  
    }
    if (type == "children"){
      (new Steem($rootScope.$storage.socket)).getDiscussionsByChildren(params , function(err, dd) {
        if (err && err.code) {
          $scope.error = true;
          $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
        }
        $scope.data = $scope.changed(dd);  
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });  
    }
    if (type == "hot"){
      (new Steem($rootScope.$storage.socket)).getDiscussionsByHot(params , function(err, dd) {
        if (err && err.code) {
          $scope.error = true;
          $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
        }
        $scope.data = $scope.changed(dd);  
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });  
    }
  };
  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.limit = 10;
    $scope.fetchPosts(null, $scope.limit, null);
  });
  setTimeout(function() {
    $scope.refresh();    
  }, 2000);

  
  
})

.controller('PostCtrl', function($scope, $stateParams, $rootScope, $interval) {
  console.log($rootScope.$storage.sitem)

  $scope.$on('$ionicView.beforeEnter', function(){    
    (new Steem($rootScope.$storage.socket)).getContentReplies($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink, function(err, result){
      $scope.comments = result;
      console.log(result);
      for (var i = 0; i < $scope.comments.length; i++) {
        $scope.comments[i].creplies = [];
        if ($scope.comments[i].children>0){
          (new Steem($rootScope.$storage.socket)).getContentReplies($scope.comments[i].author, $scope.comments[i].permlink, function(err, res1) {
            $scope.comments1 = res1;
            //console.log(res1);
            $scope.deep1 = true;
            /*for (var j = 0; j < $scope.comments1.length; j++) {
              if ($scope.comments1[j].children>0){
                (new Steem($rootScope.$storage.socket)).getContentReplies($scope.comments1[j].author, $scope.comments1[j].permlink, function(err, res2) {
                  $scope.comments2 = res2;
                  $scope.deep2 = true;                  
                });
              }
            }*/
          });
        }
      }
    });
  });
  var orderStuff = $interval(function() {
    if ($scope.deep1) {
      for (var i = 0; i < $scope.comments.length; i++) {
        if ($scope.comments[i].creplies.length==0) {
          for (var j = 0; j < $scope.comments1.length; j++) {
            if ($scope.comments[i].author == $scope.comments1[j].parent_author) {
              //console.log("found deep comments");
              $scope.comments[i].creplies.push($scope.comments1[j]);
            }
          }  
        }       
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }
    }
  }, 5000);

  setTimeout(function() {
    if (angular.isDefined(orderStuff)) {
      $interval.cancel(orderStuff);
      orderStuff = undefined;
    }
  }, 15000);

  $scope.$on('$ionicView.leave', function(){
    if (angular.isDefined(orderStuff)) {
      $interval.cancel(orderStuff);
      orderStuff = undefined;
    }
  });
})

.controller('FollowersCtrl', function($scope, $stateParams, $rootScope, $state) {

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.followers = {};
    $scope.limit = 10;
    var temp = new Steem($rootScope.$storage.socket);
    temp.getFollowers($rootScope.$storage.user.username, false, $scope.limit, function(e, r){
      if (e)
        console.log(e)
      //console.log(r)
      $scope.followers = r;
      if (!$scope.$phase)
        $scope.$apply();
    })
  });
  $scope.profileView = function(xx){
    $state.go('app.profile', {username: xx});
  };
  $scope.loadMore = function() {
    if (!$scope.error) {
      if (!$scope.last) {
        $scope.limit += 5
        var temp = new Steem($rootScope.$storage.socket);
        temp.getFollowers($rootScope.$storage.user.username, false, $scope.limit, function(e, r){
          console.log(angular.toJson(e));
          if (e && e.code) {
            $scope.error = true;
            $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
          }
          if (!$scope.$phase)
            $scope.$apply();
          if ($scope.followers) {
            if (r.length == $scope.followers.length) {
              $scope.last = true;
              $scope.$broadcast('scroll.infiniteScrollComplete');
            } else {
              $scope.followers = r;
            }
          } else {
            $scope.followers = r;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });  
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
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
      if (e)
        console.log(e)
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
    if (!$scope.error) {
      if (!$scope.last) {
        $scope.limit += 5
        var temp = new Steem($rootScope.$storage.socket);
        temp.getFollowing($rootScope.$storage.user.username, false, $scope.limit, function(e, r){
          console.log(angular.toJson(e));
          if (e && e.code){
            $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
            $scope.error = true;
          }
          //console.log(r)
          if (!$scope.$phase)
            $scope.$apply();
          if ($scope.following){
            if (r.length == $scope.following.length) {
              $scope.last = true;
              $scope.$broadcast('scroll.infiniteScrollComplete');
            } else {
              $scope.following = r;
            }
          } else {
            $scope.following = r;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });    
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
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
    $scope.nonexist = false;
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
        //console.log(res);
        //console.log(type)
        if (res.content) {
          //console.log(res.content)
          if (Object.keys(res.content).length>0) {
            for (var property in res.content) {
              if (res.content.hasOwnProperty(property)) {
                $scope.profile.push(res.content[property]);
              }
            }    
            $scope.nonexist = false;
          } else {
            $scope.nonexist = true;
          }
        } 
        if (type=="transfers" || type=="permissions") {
          //console.log(res.accounts)
          for (var property in res.accounts) {
            if (res.accounts.hasOwnProperty(property)) {
              $scope.accounts = res.accounts[property];
              $scope.nonexist = false;
            }
          }  
        }
        
        if(!$scope.$$phase){
          $scope.$apply();
        }
      });
    };
    
    (new Steem($rootScope.$storage.socket)).getState("/@"+$stateParams.username, function(err, res){
      $scope.profile = [];
      //console.log(res.content);
      if (Object.keys(res.content).length>0) {
        for (var property in res.content) {
          if (res.content.hasOwnProperty(property)) {
            // do stuff
            //console.log(res.content[property])
            $scope.profile.push(res.content[property]);
          }
        }
        $scope.nonexist = false;
        if(!$scope.$$phase){
          $scope.$apply();
        }
      } else {
        $scope.nonexist = true;
      }
    });  
  });

})

;
