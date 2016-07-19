angular.module('steem.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

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

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PostsCtrl', function($scope, $rootScope, MyService, $state, $ionicPopup) {
  $scope.open = function(item) {
    $rootScope.$storage.sitem = item;
    $state.go('app.single');
  };

  $scope.showFilter = function() {
   $scope.fdata = {}
   var myPopupF = $ionicPopup.show({
     template: '<ion-list><label class="item item-input item-select"><div class="input-label">Category</div><select ng-model="fdata.filter"><option>hot</option><option>trending</option><option value="cashout">payout time</option><option value="children">responses</option><option value="created">new</option><option>active</option><option value="votes">popular</option></select></label><label class="item item-input"><span class="input-label">Tag</span><input type="text" ng-model="fdata.tag" placeholder="tag e.g. steemit"></label></ion-list>',
     title: 'Filter',
     scope: $scope,
     buttons: [
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
     ]
   });
   myPopupF.then(function(res) {
      console.log('sending user info!', res);
      if (res) {
        MyService.getPosts($scope.limit, res[0], res[1]).then(function(dd) {
          for (var i = 0; i < dd.length; i++) {
            dd[i].json_metadata = angular.fromJson(dd[i].json_metadata?dd[i].json_metadata:[]);
          }
          $scope.data = dd;
          console.log('****filter*****');
        });
      }
   });
  };

  $scope.refresh = function(){
    MyService.getPosts($scope.limit).then(function(dd){
      //console.log(dd);
      for (var i = 0; i < dd.length; i++) {
        dd[i].json_metadata = angular.fromJson(dd[i].json_metadata?dd[i].json_metadata:[]);
      }
      $scope.data = dd;
      console.log('****refresh*****');
    });
  };
  $scope.loadMore = function() {
    $scope.limit += 5
    MyService.getPosts($scope.limit).then(function(dd){
      console.log(dd);
      for (var i = 0; i < dd.length; i++) {
        dd[i].json_metadata = angular.fromJson(dd[i].json_metadata?dd[i].json_metadata:[]);
      }
      $scope.data = dd;
      console.log('****complete*****');
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

  $scope.getA = function() {
    MyService.getAccounts("good-karma").then(function(dd){
      console.log(dd);
    });
  }

  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.limit = 10;
    MyService.getPosts($scope.limit).then(function(dd){
      console.log(dd);
      for (var i = 0; i < dd.length; i++) {
        dd[i].json_metadata = angular.fromJson(dd[i].json_metadata?dd[i].json_metadata:[]);
      }
      $scope.data = dd;
    });
  });

  
  
})

.controller('PostCtrl', function($scope, $stateParams, $rootScope) {
  console.log($rootScope.$storage.sitem)
});
