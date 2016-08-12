module.exports = function (app) {
//angular.module('steem.controllers', [])

app.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $state, $ionicHistory, $cordovaSocialSharing) {

  $scope.loginData = {};  


  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.changeUsername = function(){
    $scope.loginData.username = angular.lowercase($scope.loginData.username);
  }
  $scope.open = function(item) {
    $rootScope.$storage.sitem = item;
    //console.log(item);
    $state.go('app.single');
  };

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.login = function() {
    $scope.modal.show();
  };
  
  $scope.share = function() {
    var message = "Hey! Checkout blog post on Steemit.com";
    var subject = "Via Steem Mobile";
    var file = null;
    var link = "http://steemit.com"+$rootScope.$storage.sitem?$rootScope.$storage.sitem.url:"";
    $cordovaSocialSharing.share(message, subject, file, link) // Share via native share sheet
    .then(function(result) {
      // Success!
      console.log("shared");
    }, function(err) {
      // An error occured. Show a message to the user
      console.log("not shared");
    });  
  }
  
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    var temp = new Steem(localStorage.socketUrl);
    temp.getAccounts([$scope.loginData.username], function(err, dd) {
      console.log(dd);
      dd = dd[0];
      $scope.loginData.id = dd.id;
      $scope.loginData.owner = dd.owner;
      $scope.loginData.active = dd.active;
      $scope.loginData.reputation = dd.reputation;
      $scope.loginData.posting = dd.posting;
      $scope.loginData.memo_key = dd.memo_key;
      $scope.loginData.post_count = dd.post_count;
      $scope.loginData.voting_power = dd.voting_power;

      $rootScope.$storage.user = $scope.loginData;
        var login = new window.steemJS.Login();
        console.log(dd.posting.key_auths[0][0]);
        login.setRoles(["posting"]);
        var loginSuccess = login.checkKeys({
            accountName: $scope.loginData.username,    
            password: $scope.loginData.password,
            auths: {
                posting: [[dd.posting.key_auths[0][0], 1]]
            }}
        );

        //console.log(loginSuccess);
        //console.log(login)

        if (!loginSuccess) {
            $rootScope.showAlert("Error","The password or account name was incorrect");
        } else {
          $rootScope.$storage.mylogin = login;
          $timeout(function() {
            $scope.closeLogin();
          });
        }
      });
      $state.go('app.posts', {}, { reload: true });
  };

  if ($rootScope.$storage.user && $rootScope.$storage.user.username) {
    (new Steem(localStorage.socketUrl)).getAccounts([$rootScope.$storage.user.username], function(err, dd) {
      console.log(dd);
      dd = dd[0];
      angular.merge($rootScope.$storage.user, dd);
    });
  }

  $scope.logout = function() {
    $rootScope.$storage.user = undefined;
    $rootScope.$storage.user = null;
    $rootScope.$storage.mylogin = undefined;
    $rootScope.$storage.mylogin = null;
    $state.go("app.posts", {}, {reload:true});
    //make sure user credentials cleared.
  };
  $scope.data = {};
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
  $scope.clearSearch = function() {
    if ($rootScope.$storage.tag) {
      $rootScope.$storage.tag = "";
      $rootScope.$storage.taglimits = undefined;
      $rootScope.$broadcast('close:popover');
    }
  };
  $scope.submitStory = function(){
    $rootScope.showAlert("Dev alert", "Not available, yet... (coming soon) ");
  };
  
  $scope.search = function() {
    console.log('Doing search', $scope.data.search);
    $scope.data.search = angular.lowercase($scope.data.search);
    setTimeout(function() {
      if ($scope.data.search.length > 1) {
        if ($scope.data.type == "tag"){
          (new Steem(localStorage.socketUrl)).getTrendingTags($scope.data.search, 10 , function(err, result) {
            var ee = [];
            if (result){
              for (var i = result.length - 1; i >= 0; i--) {
                if (result[i].tag.indexOf($scope.data.search) > -1){
                  ee.push(result[i]);
                }
              }
              $scope.data.searchResult = ee;
            }
            //console.log(result);
            //console.log(err);
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });  
        }
        if ($scope.data.type == "user"){
          var ee = [];
          (new Steem(localStorage.socketUrl)).lookupAccounts($scope.data.search, 10, function(err, result) {
            if (result){
              $scope.data.searchResult = result;
            }
              //console.log(result);
              //console.log(err);  
              if (!$scope.$$phase) {
                $scope.$apply();
              }
          });  
        }
        
      }
    }, 500);
    
  };
  $scope.typechange = function() {
    $scope.data.searchResult = undefined;
    console.log("changing search type");
  }
  $scope.openTag = function(xx, yy) {
    console.log("opening tag "+xx);
    $rootScope.$storage.tag = xx;
    $rootScope.$storage.taglimits = yy;
    $scope.closeSmodal();
    $rootScope.$broadcast('close:popover');
    $state.go("app.posts", {}, {reload:true});
  };
  $scope.openUser = function(xy) {
    console.log("opening user "+xy);
    $scope.closeSmodal();
    $rootScope.$broadcast('close:popover');
    $state.go("app.profile", {username: xy});
  };



  /*$scope.$on('$ionicView.loaded', function(){
    $scope.limit = 5;
    $rootScope.$broadcast('show:loading');
    window.Api.initPromise.then(function(response) {
      console.log("Api ready:", response);
      window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(response){
        console.log("get_dynamic_global_properties "+response.head_block_number);

        if ($rootScope.$storage.user) {
          $scope.mylogin = new window.steemJS.Login();
          $scope.mylogin.setRoles(["posting"]);
          var loginSuccess = $scope.mylogin.checkKeys({
              accountName: $rootScope.$storage.user.username,    
              password: $rootScope.$storage.user.password,
              auths: {
                  posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
              }}
          );
          console.log(loginSuccess);
          //console.log($scope.mylogin)  
          if (loginSuccess) {
              $rootScope.$broadcast('hide:loading');
              //$scope.fetchPosts(null, $scope.limit, null);
          } else {
            $rootScope.$broadcast('hide:loading');
            //$scope.fetchPosts(null, $scope.limit, null);
          }
        }
        
      });
    });
    if (window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }
  });*/


})
app.controller('SendCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval) {
  $scope.data = {type: "steem", amount: 0.001};

  $scope.transfer = function () {
    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
      $scope.mylogin = new window.steemJS.Login();
      $scope.mylogin.setRoles(["active"]);
      console.log($rootScope.$storage.user.active.key_auths[0][0]);
      var loginSuccess = $scope.mylogin.checkKeys({
          accountName: $rootScope.$storage.user.username,    
          password: $rootScope.$storage.user.password,
          auths: {
            active: $rootScope.$storage.user.active.key_auths
          }}
      );
      if (loginSuccess) {
        console.log($scope.mylogin);
        var tr = new window.steemJS.TransactionBuilder();
        if ($scope.data.type !== 'sp') {
          //console.log($scope.data);
          var tt = {
            amount: $scope.data.amount*1000, 
            symbol: angular.uppercase($scope.data.type)
          };
          //String($scope.data.amount)+" "+angular.uppercase($scope.data.type);
          //console.log(tt);
          tr.add_type_operation("transfer", {
            from: $rootScope.$storage.user.username,
            to: $scope.data.username,
            amount: tt,
            //asset: angular.uppercase($scope.data.type),
            memo: $scope.data.memo
          });
          /*$scope.mylogin.signTransaction(tr);
          console.log("signed")
            tr.finalize().then(function() {
              console.log("finalize")
            tr.sign();
            console.log("sign")
            tr.broadcast();
            console.log("broadcast")
          });*/
          tr.process_transaction($scope.mylogin, null, true);  
        } else {
          console.log($scope.data);
          tr.add_type_operation("transfer_to_vesting", {
            from: $rootScope.$storage.user.username,
            to: $scope.data.username,
            amount: {amount: $scope.data.amount, symbol: angular.uppercase($scope.data.type)}
          });
          tr.process_transaction($scope.mylogin, null, true);
        }
      }
      $rootScope.$broadcast('hide:loading');
      /*setTimeout(function() {
        $scope.refresh()
      }, 100);*/
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Vote");
    }
  };

});
app.controller('PostsCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval) {

  $rootScope.$on('filter:change', function() {
    $rootScope.$broadcast('show:loading');
    console.log($rootScope.$storage.filter)
    var type = $rootScope.$storage.filter || "trending";
    var tag = $rootScope.$storage.tag || "";
    $scope.fetchPosts(type, $scope.limit, tag);  
  });
  
  $scope.votePost = function(post) {
    $rootScope.$broadcast('show:loading');
    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
        console.log('Api ready:');
        $scope.mylogin = new window.steemJS.Login();
        $scope.mylogin.setRoles(["posting"]);
        var loginSuccess = $scope.mylogin.checkKeys({
            accountName: $rootScope.$storage.user.username,    
            password: $rootScope.$storage.user.password,
            auths: {
                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
            }}
        );
        if (loginSuccess) {
          var tr = new window.steemJS.TransactionBuilder();
          tr.add_type_operation("vote", {
              voter: $rootScope.$storage.user.username,
              author: post.author,
              permlink: post.permlink,
              weight: 10000
          });
          tr.process_transaction($scope.mylogin, null, true);
          console.log("---------tx-------"+angular.toJson(tr));
          setTimeout(function() {$scope.fetchPosts()}, 3000);
        }
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Vote");
    }
  };

  $scope.downvotePost = function(post) {
    $rootScope.$broadcast('show:loading');
    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
        console.log('Api ready:');
        $scope.mylogin = new window.steemJS.Login();
        $scope.mylogin.setRoles(["posting"]);
        var loginSuccess = $scope.mylogin.checkKeys({
            accountName: $rootScope.$storage.user.username,    
            password: $rootScope.$storage.user.password,
            auths: {
                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
            }}
        );
        if (loginSuccess) {
          var tr = new window.steemJS.TransactionBuilder();
          tr.add_type_operation("vote", {
              voter: $rootScope.$storage.user.username,
              author: post.author,
              permlink: post.permlink,
              weight: -10000
          });
          tr.process_transaction($scope.mylogin, null, true);
          setTimeout(function() {$scope.fetchPosts()}, 3000);
        }
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Vote");
    }
  };

  $scope.unvotePost = function(post) {
    $rootScope.$broadcast('show:loading');
    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
        console.log('Api ready:');
        $scope.mylogin = new window.steemJS.Login();
        $scope.mylogin.setRoles(["posting"]);
        var loginSuccess = $scope.mylogin.checkKeys({
            accountName: $rootScope.$storage.user.username,    
            password: $rootScope.$storage.user.password,
            auths: {
                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
            }}
        );
        if (loginSuccess) {
          var tr = new window.steemJS.TransactionBuilder();
          tr.add_type_operation("vote", {
              voter: $rootScope.$storage.user.username,
              author: post.author,
              permlink: post.permlink,
              weight: 0
          });
          tr.process_transaction($scope.mylogin, null, true);
          setTimeout(function() {$scope.fetchPosts()}, 3000);  
        }
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('show:loading');
      $rootScope.showAlert("Warning", "Please, login to UnVote"); 
    }
  };

  $scope.showFilter = function() {
    $scope.fdata = {filter: $rootScope.$storage.filter || "trending"};
    var myPopupF = $ionicPopup.show({
       template: '<ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="hot"><i class="icon" ng-class="{\'ion-flame gray\':fdata.filter!=\'hot\', \'ion-flame positive\': fdata.filter==\'hot\'}"></i> Hot</ion-radio><ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="created"><i class="icon" ng-class="{\'ion-star gray\':fdata.filter!=\'new\', \'ion-star positive\': fdata.filter==\'new\'}"></i> New</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="trending"><i class="icon" ng-class="{\'ion-podium gray\':fdata.filter!=\'trending\', \'ion-podium positive\': fdata.filter==\'trending\'}"></i> Trending</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="active"><i class="icon" ng-class="{\'ion-chatbubble-working gray\':fdata.filter!=\'active\', \'ion-chatbubble-working positive\': fdata.filter==\'active\'}"></i> Active</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="cashout"><i class="icon" ng-class="{\'ion-share gray\':fdata.filter!=\'cashout\', \'ion-share positive\': fdata.filter==\'cashout\'}"></i> Cashout</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="payout"><i class="icon" ng-class="{\'ion-cash gray\':fdata.filter!=\'payout\', \'ion-cash positive\': fdata.filter==\'payout\'}"></i> Payout</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="votes"><i class="icon" ng-class="{\'ion-person-stalker gray\':fdata.filter!=\'votes\', \'ion-person-stalker positive\': fdata.filter==\'votes\'}"></i> Votes</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="children"><i class="icon" ng-class="{\'ion-chatbubbles gray\':fdata.filter!=\'children\', \'ion-chatbubbles positive\': fdata.filter==\'children\'}"></i> Comments</ion-radio>',   
       title: 'Sort by',
       scope: $scope
    });
    myPopupF.then(function(res) {
      if (res) {
        $scope.fetchPosts(res[0], null, res[1]);
      }
    });

    $scope.filterchange = function(f){
      console.log($scope.fdata.filter)
      $rootScope.$storage.filter = $scope.fdata.filter;
      myPopupF.close();
      $scope.closePopover();
      $rootScope.$broadcast('filter:change');
    }
  };
  
  $scope.refresh = function(){
    $scope.fetchPosts();
    $scope.closePopover();
    $rootScope.$broadcast('filter:change');
  };
  $scope.loadMore = function() {
    $rootScope.$broadcast('show:loading');
    $scope.limit += 5;
    if (!$scope.error) {
      $scope.fetchPosts(null, $scope.limit, null);  
    }
  };

  $scope.changeView = function(view) {
    $rootScope.$storage.view = view; 
    $scope.closePopover();
    if (!$scope.$$phase){
      $scope.$apply();
    }
    $rootScope.$broadcast('show:loading');
    $scope.refresh();
  }

  $scope.$watch('data', function(newValue, oldValue){
      //console.log('changed');
      if (newValue) {
        var length = newValue.length;
        if (length < $scope.limit) {
          $scope.noMoreItemsAvailable = true;
        }
        for (var i = 0; i < newValue.length; i++) {
          if ($rootScope.$storage.user){
            for (var j = newValue[i].active_votes.length - 1; j >= 0; j--) {
              if (newValue[i].active_votes[j].voter == $rootScope.$storage.user.username) {
                if (newValue[i].active_votes[j].percent > 0) {
                  newValue[i].upvoted = true;  
                } else if (newValue[i].active_votes[j].percent < 0) {
                  newValue[i].downvoted = true;  
                }
              }
            }
          }
          if ($rootScope.$storage.view == 'card') {
            newValue[i].json_metadata = angular.fromJson(newValue[i].json_metadata?newValue[i].json_metadata:[]);
          }
        }
      }      
      if (!$scope.$$phase){
        $scope.$apply();
      }
  }, true);


  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
  
  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  $rootScope.$on('close:popover', function(){
    $scope.closePopover();
  });
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });

  $scope.fetchPosts = function(type, limit, tag) {
    type = type || $rootScope.$storage.filter || "trending";
    tag = tag || $rootScope.$storage.tag || "";
    limit = limit || $scope.limit || 5;
    //$rootScope.$broadcast('show:loading');

    var params = {tag: tag, limit: limit, filter_tags: []};
    if ($scope.error) {
      $rootScope.showAlert("Error", "Server returned error, Plese try to change it from Settings");
    } else {
      console.log("fetching..."+type, limit, tag)
      window.Api.database_api().exec("get_discussions_by_"+type, [params]).then(function(response){
        $scope.data = response; 
        //console.log(response);
        $rootScope.$broadcast('hide:loading');
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });
         
    }
  };
  
  $scope.$on('$ionicView.afterEnter', function(){
    $scope.limit = 5;
    $rootScope.$broadcast('show:loading');
    console.log('enter ');
    if (!$rootScope.$storage.socket) {
      $rootScope.$storage.socket = localStorage.socketUrl;
    }
    if (!$rootScope.$storage.view) {
      $rootScope.$storage.view = 'compact';
    }
    if (!$rootScope.$storage.filter) {
      $rootScope.$storage.filter = "trending";
    }
    //console.log(window.Api)
    //$scope.fetchPosts(null, $scope.limit, null);
    window.Api.initPromise.then(function(response) {
      console.log("Api ready:", response);  
      window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(response){
        console.log("get_dynamic_global_properties "+response.head_block_number);
        if ($rootScope.$storage.user) {
          $scope.mylogin = new window.steemJS.Login();
          $scope.mylogin.setRoles(["posting"]);
          var loginSuccess = $scope.mylogin.checkKeys({
              accountName: $rootScope.$storage.user.username,    
              password: $rootScope.$storage.user.password,
              auths: {
                  posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
              }}
          );
          console.log("login "+loginSuccess);
        }          
        $scope.fetchPosts(null, $scope.limit, null);  
      });
    });  
  });
  
  $scope.$on('$ionicView.beforeEnter', function(){
    $rootScope.$broadcast('show:loading');
  })
  $scope.$on('$ionicView.loaded', function(){
    if (window.navigator.splashscreen) {
      window.navigator.splashscreen.hide();
    }
  });

  var timeint = $interval(function(){
    window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(response){
      console.log("get_dynamic_global_properties", response.head_block_number);
    });
  }, 20000);

  $scope.$on('$ionicView.leave', function(){
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  });
  
  //$scope.refresh();   
})

app.controller('PostCtrl', function($scope, $stateParams, $rootScope, $interval) {
  //console.log($rootScope.$storage.sitem)
  $scope.post = $rootScope.$storage.sitem;
  $scope.data = {};
  $scope.replying = false;
  $scope.reply = function (xx) {
    //console.log(xx);
    $rootScope.$broadcast('show:loading');
    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
      $scope.mylogin = new window.steemJS.Login();
      $scope.mylogin.setRoles(["posting"]);
      var loginSuccess = $scope.mylogin.checkKeys({
          accountName: $rootScope.$storage.user.username,    
          password: $rootScope.$storage.user.password,
          auths: {
              posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
          }}
      );
      if (loginSuccess) {
        var tr = new window.steemJS.TransactionBuilder();
        tr.add_type_operation("comment", {
          parent_author: xx.author,
          parent_permlink: xx.permlink,
          author: $rootScope.$storage.user.username,
          permlink: xx.permlink,
          title: "",
          body: $scope.data.comment,
          json_metadata: ""
        });
        //console.log(my_pubkeys);
        tr.process_transaction($scope.mylogin, null, true);
        $scope.data.comment = "";
        $scope.replying = false;
        setTimeout(function() {
          (new Steem(localStorage.socketUrl)).getContentReplies($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink, function(err, result){
            //console.log(result);      
            $scope.comments = result;
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });
        }, 1000);
      } 
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Comment");
    }
  }

  $scope.isreplying = function(xx) {
    $scope.replying = xx;
  }
  
  //$scope.post = {};
  $scope.$on('$ionicView.enter', function(){   
    //$scope.post = $rootScope.$storage.sitem;

    (new Steem(localStorage.socketUrl)).getContentReplies($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink, function(err, result){
      //console.log(result);      
      $scope.comments = result;

      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  });
  
  $scope.upvotePost = function(post) {
    $rootScope.$broadcast('show:loading');
    // Then create the transaction and sign it without broadcasting
    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
        console.log('Api ready:')
        $scope.mylogin = new window.steemJS.Login();
        $scope.mylogin.setRoles(["posting"]);
        var loginSuccess = $scope.mylogin.checkKeys({
            accountName: $rootScope.$storage.user.username,    
            password: $rootScope.$storage.user.password,
            auths: {
                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
            }}
        );
        if (loginSuccess) {
          var tr = new window.steemJS.TransactionBuilder();
          tr.add_type_operation("vote", {
              voter: $rootScope.$storage.user.username,
              author: post.author,
              permlink: post.permlink,
              weight: 10000
          });
          //var my_pubkeys = $scope.mylogin.getPubKeys();
          //console.log(my_pubkeys);
          tr.process_transaction($scope.mylogin, null, true);
          if ($rootScope.$storage.sitem.upvoted) {
            $rootScope.$storage.sitem.upvoted = false;
            $rootScope.$storage.sitem.downvoted = false;  
          } else {
            $rootScope.$storage.sitem.upvoted = true;
            $rootScope.$storage.sitem.downvoted = false;  
          }
        } 
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Vote");
    }
  };
  $scope.downvotePost = function(post) {
    $rootScope.$broadcast('show:loading');
    // Then create the transaction and sign it without broadcasting
    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
        console.log('Api ready:');
        $scope.mylogin = new window.steemJS.Login();
        $scope.mylogin.setRoles(["posting"]);
        var loginSuccess = $scope.mylogin.checkKeys({
            accountName: $rootScope.$storage.user.username,    
            password: $rootScope.$storage.user.password,
            auths: {
                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
            }}
        );
        if (loginSuccess) {
          var tr = new window.steemJS.TransactionBuilder();
          tr.add_type_operation("vote", {
              voter: $rootScope.$storage.user.username,
              author: post.author,
              permlink: post.permlink,
              weight: -10000
          });
          //var my_pubkeys = $scope.mylogin.getPubKeys();
          tr.process_transaction($scope.mylogin, null, true);
          if ($rootScope.$storage.sitem.downvoted) {
            $rootScope.$storage.sitem.upvoted = false;
            $rootScope.$storage.sitem.downvoted = false;  
          } else {
            $rootScope.$storage.sitem.upvoted = false;
            $rootScope.$storage.sitem.downvoted = true;  
          }
        }
      
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Vote");
    }
  };
  $scope.unvotePost = function(post) {
    $rootScope.$broadcast('show:loading');
    // Then create the transaction and sign it without broadcasting
    if ($rootScope.$storage.user && $rootScope.$storage.user.password) {
        console.log('Api ready:');
        $scope.mylogin = new window.steemJS.Login();
        $scope.mylogin.setRoles(["posting"]);
        var loginSuccess = $scope.mylogin.checkKeys({
            accountName: $rootScope.$storage.user.username,    
            password: $rootScope.$storage.user.password,
            auths: {
                posting: [[$rootScope.$storage.user.posting.key_auths[0][0], 1]]
            }}
        );
        if (loginSuccess) {
          var tr = new window.steemJS.TransactionBuilder();
          tr.add_type_operation("vote", {
              voter: $rootScope.$storage.user.username,
              author: post.author,
              permlink: post.permlink,
              weight: 0
          });
          //var my_pubkeys = $scope.mylogin.getPubKeys();
          tr.process_transaction($scope.mylogin, null, true);
          if ($rootScope.$storage.sitem.upvoted) {
            $rootScope.$storage.sitem.upvoted = false;
          }
          if ($rootScope.$storage.sitem.downvoted) {
            $rootScope.$storage.sitem.downvoted = false;
          }
        }
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Vote");
    }
  };

  $scope.$on('$ionicView.leave', function(){
    $rootScope.$storage.sitem = undefined;
  });
})

app.controller('FollowCtrl', function($scope, $stateParams, $rootScope, $state) {

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = "followers";
    $scope.followers = {};
    $scope.limit = 10;
    window.Api.follow_api().exec("get_followers", [$rootScope.$storage.user.username, false, "blog" , $scope.limit]).then(function(response){
      $scope.followers = response;
    });
  });


  $scope.loadMore = function(type) {
    if (type) {
      $scope.active = type;
    }
    if (!$scope.error) {
      if (!$scope.last) {
        $scope.limit += 5

        if ($scope.active == 'followers') {
          window.Api.follow_api().exec("get_followers", [$rootScope.$storage.user.username, false, "blog" , $scope.limit]).then(function(r){
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
          });    
        }
        if ($scope.active == 'following') {
          window.Api.follow_api().exec("get_following", [$rootScope.$storage.user.username, false, "blog" , $scope.limit]).then(function(r){
            if ($scope.following) {
              if (r.length == $scope.following.length) {
                $scope.last = true;
                $scope.$broadcast('scroll.infiniteScrollComplete');
              } else {
                $scope.following = r;
              }
            } else {
              $scope.following = r;
            }
          });    
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }
  };
  $scope.change = function(type){
    $scope.active = type;
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    $scope.loadMore(type);
  }
  $scope.unfollowUser = function(xx){
    $rootScope.showAlert("Info", "In Development, coming soon!");
  };
  $scope.followUser = function(xx){
    $rootScope.showAlert("Info", "In Development, coming soon!");
  };
  $scope.profileView = function(xx){
    $state.go('app.profile', {username: xx});
  };
  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

})

app.controller('ProfileCtrl', function($scope, $stateParams, $rootScope) {
  $scope.username = $stateParams.username;

  $scope.$on('$ionicView.beforeEnter', function(){
    if (!$scope.active) {
      $scope.active = "blog";  
    }
    $scope.nonexist = false;
    
    (new Steem(localStorage.socketUrl)).getState("/@"+$stateParams.username, function(err, res){
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
   $scope.change = function(type){
    $scope.profile = [];
    $scope.accounts = [];
    $scope.active = type;
    if (type != "blog") {
      $scope.rest = "/"+type;
    } else {
      $scope.rest = "";
    }
    (new Steem(localStorage.socketUrl)).getState("/@"+$stateParams.username+$scope.rest, function(err, res){
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
            $scope.transfers = res.accounts[property].transfer_history;
            $scope.nonexist = false;
          }
        } 
        //console.log($scope.transfers);
      }
      
      if(!$scope.$$phase){
        $scope.$apply();
      }
    });
  }

})

app.controller('ExchangeCtrl', function($scope, $stateParams, $rootScope) {
  $scope.username = $stateParams.username;
  
  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = 'buy';
    $scope.orders = [];
    (new Steem(localStorage.socketUrl)).getOrderBook(15, function(err, res){
      console.log(err, res);
      $scope.orders = res;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    $scope.change = function(type){
      $scope.active = type;
      if (type == "open"){
        (new Steem(localStorage.socketUrl)).getOpenOrders($stateParams.username, function(err, res){
          console.log(err, res)
          $scope.openorders = res;
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });
      }
      if (type == "history"){
        $scope.history = [];
        /*(new Steem($rootScope.$storage.socket)).getAccountHistory($stateParams.username, 20, 10, function(err, res){
          console.log(err, res)
          //$scope.openorders = res;
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });*/
      }
    };
  });

});

app.controller('SettingsCtrl', function($scope, $stateParams, $rootScope, $ionicHistory, $state) {
  
  $scope.$on('$ionicView.beforeEnter', function(){
    $rootScope.$storage.socket = localStorage.socketUrl;
  });

  $scope.save = function(){
    localStorage.socketUrl = $rootScope.$storage.socket;
    $rootScope.showAlert("Success", "Settings are updated! Please, restart app for this to take effect!");
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.posts');
  };

});
}