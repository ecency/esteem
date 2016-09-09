module.exports = function (app) {
//angular.module('steem.controllers', [])

app.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $state, $ionicHistory, $cordovaSocialSharing, ImageUploadService, $cordovaCamera, $ionicSideMenuDelegate, $ionicPlatform, $filter, APIs) {

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
  $scope.advancedChange = function() {
    console.log($scope.loginData.advanced);
    if ($scope.loginData.advanced) {
      $scope.loginData.password = null;
    }
  }
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.login = function() {
    $scope.modal.show();
  };
  $scope.goProfile = function() {
    $state.go("app.profile", {username:$rootScope.$storage.user.username});
    //$ionicSideMenuDelegate.toggleLeft();
  }
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
    console.log('Doing login');
    if ($scope.loginData.password || $scope.loginData.privatePostingKey) {
      (new Steem(localStorage.socketUrl)).getAccounts([$scope.loginData.username], function(err, dd) {
        //console.log(dd);
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
        login.setRoles(["posting"]);
        var loginSuccess = login.checkKeys({
            accountName: $scope.loginData.username,    
            password: $scope.loginData.password || null,
            auths: {
                posting: dd.posting.key_auths
            },
            privateKey: $scope.loginData.privatePostingKey || null
          }
        );

        if (!loginSuccess) {
            $rootScope.showMessage("Error","The password or account name was incorrect");
        } else {
          $rootScope.$storage.mylogin = login;
          APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.$storage.user.username, "").then(function(res){
            console.log(angular.toJson(res));
          });
          $timeout(function() {
            $state.go('app.posts', {}, { reload: true });
            $scope.closeLogin();
          }, 1000);
        }
      });
    } else {
      $rootScope.showAlert("Info", "Please login either with your main password or private posting key!").then(function(){
        console.log("error login");
      });
    }
    
  };

  $scope.$on("$ionicView.enter", function(){
    $scope.refreshLocalUserData = function() {
      console.log('refreshLocalUserData');
      if ($rootScope.$storage.user && $rootScope.$storage.user.username) {
        (new Steem(localStorage.socketUrl)).getAccounts([$rootScope.$storage.user.username], function(err, dd) {
          //console.log(dd);
          dd = dd[0];
          if (dd.json_metadata) {
            dd.json_metadata = angular.fromJson(dd.json_metadata);
          }
          angular.merge($rootScope.$storage.user, dd);
        });
      }  
    }
    $scope.refreshLocalUserData();
  });

  // get app version
  $ionicPlatform.ready(function(){
    if (window.cordova) {
      cordova.getAppVersion.getVersionNumber(function (version) {
        $rootScope.$storage.appversion = version;
      });  
    }
  });

  $scope.logout = function() {
    $rootScope.$storage.user = undefined;
    $rootScope.$storage.user = null;
    $rootScope.$storage.mylogin = undefined;
    $rootScope.$storage.mylogin = null;
    //make sure user credentials cleared.
    APIs.updateSubscription($rootScope.$storage.deviceid, "", "").then(function(res){
      console.log(angular.toJson(res));
    });
    $ionicSideMenuDelegate.toggleLeft();
    $state.go('app.posts', {tags:""}, {reload:true});
    $rootScope.$broadcast("user:logout");
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
  };

  // Open the login modal
  $scope.openSmodal = function() {
    $rootScope.$broadcast('close:popover');
    $scope.data.type="tag";
    $scope.smodal.show();
  };
  $scope.clearSearch = function() {
    if ($rootScope.$storage.tag) {
      $rootScope.$storage.tag = undefined;
      $rootScope.$storage.taglimits = undefined;
      $rootScope.$broadcast('close:popover');
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
    $state.go("app.posts", {tags: xx}, {reload:true});
  };
  $scope.openUser = function(xy) {
    console.log("opening user "+xy);
    $scope.closeSmodal();
    $rootScope.$broadcast('close:popover');
    $state.go("app.profile", {username: xy});
  };
  $scope.testfunction = function() {
    window.Api.database_api().exec("get_account_history", [$rootScope.$storage.user.username, -1, 25]).then(function(response){
      console.log(response)
    });
  }
  


})
app.controller('SendCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval, $filter, $q, $timeout) {
  $scope.data = {type: "steem", amount: 0.001};
  $scope.changeUsername = function(typed) {
    console.log('searching');
    $scope.data.username = angular.lowercase($scope.data.username);
    window.Api.database_api().exec("lookup_account_names", [[$scope.data.username]]).then(function(response){
      $scope.users = response[0]; 
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  }

  $scope.transfer = function () {
    if ($rootScope.$storage.user) {
      if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
        $rootScope.showMessage("Error", "Please provide Active private key if you have chosen Advanced login mode!");
      } else {
        if ($scope.data.type === 'sbd') {
          if ($scope.data.amount > Number($scope.balance.sbd_balance.split(" ")[0])) {
            $rootScope.showAlert("Warning", "Make sure you have enough balance for transaction!");          
          } else {
            $scope.okbalance = true;
          }
        }
        if ($scope.data.type === 'sp' || $scope.data.type === 'steem') {
          if ($scope.data.amount > Number($scope.balance.balance.split(" ")[0])) {
            $rootScope.showAlert("Warning", "Make sure you have enough balance for transaction!");          
          } else {
            $scope.okbalance = true;
          }
        }
        if (!$scope.users || $scope.users.name !== $scope.data.username) {
          $rootScope.showAlert("Warning", "User you are trying to transfer fund, doesn't exist!");
        } else {
          $scope.okuser = true;
        }
        if ($scope.okbalance && $scope.okuser) {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Confirmation',
            template: 'Are you sure you want to transfer?'
          });

          confirmPopup.then(function(res) {
            if(res) {
              console.log('You are sure');
              $rootScope.$broadcast('show:loading');
              $scope.mylogin = new window.steemJS.Login();
              $scope.mylogin.setRoles(["active"]);
              //console.log($rootScope.$storage.user.active.key_auths[0][0]);
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
                //console.log($scope.mylogin);
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
                      $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                    } else {
                      $rootScope.showAlert("Info", "Transaction is broadcasted").then(function(){
                        $scope.data = {type: "steem", amount: 0.001};
                      });
                    }
                  }, 2000);
                } else {
                  console.log($scope.data);
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
                      $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                    } else {
                      $rootScope.showAlert("Info", "Transaction is broadcasted").then(function(){
                        $scope.data = {type: "steem", amount: 0.001};
                      });
                    }
                  }, 2000);
                 
                }
              } else {
                $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
              }
              $rootScope.$broadcast('hide:loading');
             } else {
               console.log('You are not sure');
             }
          });
        }
      }
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Transfer");
    }
  };
  $scope.refresh = function() {
    $rootScope.$broadcast('show:loading');
    (new Steem(localStorage.socketUrl)).getAccounts([$rootScope.$storage.user.username], function(err, dd) {
      $scope.balance = dd[0];
      $rootScope.$broadcast('hide:loading');
      if (!$scope.$$phase){
        $scope.$apply();
      }
    });
    $rootScope.$broadcast('hide:loading');
  }
  $scope.$on('$ionicView.beforeEnter', function(){
    (new Steem(localStorage.socketUrl)).getAccounts([$rootScope.$storage.user.username], function(err, dd) {   
      $scope.balance = dd[0];
      if (!$scope.$$phase){
        $scope.$apply();
      }
    });
  });

});
app.controller('PostsCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicPopover, $interval, $ionicScrollDelegate, $ionicModal, $filter, $stateParams, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicPlatform, $cordovaCamera, ImageUploadService) {
  
  $scope.activeMenu = $rootScope.$storage.filter || "trending";

  $rootScope.$on('filter:change', function() {
    $rootScope.$broadcast('show:loading');
    console.log($rootScope.$storage.filter)
    var type = $rootScope.$storage.filter || "trending";
    var tag = $rootScope.$storage.tag || "";
    $scope.fetchPosts(type, $scope.limit, tag);  
  });

  $scope.showImg = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Capture Picture' },
       { text: 'Select Picture' },
       { text: 'Set Custom URL' },
     ],
     titleText: 'Insert Picture',
     cancelText: 'Cancel',
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
        console.log(imageData);
        setTimeout(function() {
          ImageUploadService.uploadImage(imageData).then(function(result) {
            var url = result.secure_url || '';
            var final = " ![image](" + url + ")";
            //console.log(final);
            if ($scope.spost.body) {
              $scope.spost.body += final;
            } else {
              $scope.spost.body = final;
            }
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();  
            }
          },
          function(err) {
            $rootScope.showAlert("Error", "Upload Error");
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          });  
        }, 10);
      }, function(err) {
        $rootScope.showAlert("Error", "Camera Cancelled");
      });
    } else {
      $ionicPopup.prompt({
        title: 'Set URL',
        template: 'Direct web link for the picture',
        inputType: 'text',
        inputPlaceholder: 'http://example.com/image.jpg'
      }).then(function(res) {
        console.log('Your url is', res);
        if (res) {
          var url = res.trim();
          var final = " ![image](" + url + ")";
          //console.log(final);
          if ($scope.spost.body) {
            $scope.spost.body += final;
          } else {
            $scope.spost.body = final;
          }
        }
      });
    }
  };

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

  $scope.spost = {};
  $scope.tagsChange = function() {
    console.log("tagsChange");
    $scope.spost.category = $scope.spost.tags.split(" ");
    if ($scope.spost.category.length > 5) {
      $scope.disableBtn = true;
    } else {
      $scope.disableBtn = false;
    }
  }

  $scope.submitStory = function() {
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
        angular.merge(json, {tags: $scope.spost.category});
        console.log(json, permlink);

        tr.add_type_operation("comment", {
          parent_author: "",
          parent_permlink: $scope.spost.category[0],
          author: $rootScope.$storage.user.username,
          permlink: permlink,
          title: $scope.spost.title,
          body: $scope.spost.body,
          json_metadata: angular.toJson(json)
        });
        //console.log(my_pubkeys);
        localStorage.error = 0;
        tr.process_transaction($scope.mylogin, null, true);
        $scope.closePostModal();
        $scope.replying = false;
        setTimeout(function() {
          if (localStorage.error == 1) {
            $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
          } else {
            $scope.spost = {};  
            $rootScope.showMessage("Success", "Post is submitted!");
            $scope.closeMenuPopover();
            $state.go("app.profile", {username: $rootScope.$storage.user.username});
          }
        }, 3000);
      } else {
        $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
      }
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Comment");
    }
  }
  $scope.savePost = function() {
    $rootScope.$storage.spost = $scope.spost;
    $rootScope.showMessage("Saved", "Post for later submission!");
    $scope.closePostModal();
  }
  $scope.clearPost = function() {
    $rootScope.$storage.spost = {};
    $scope.spost = {};
    $rootScope.showMessage("Cleared", "Post!");
  }
  $ionicModal.fromTemplateUrl('templates/story.html', {
    scope: $scope  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openPostModal = function() {
    $rootScope.$broadcast('close:popover');
    $scope.spost = $rootScope.$storage.spost || {};
    $scope.modal.show();
  };
  $scope.closePostModal = function() {
    $scope.modal.hide();
  };

  $rootScope.$on('fetchPosts', function(){
    $scope.fetchPosts();
  });

  $scope.votePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'fetchPosts');
  };

  $scope.downvotePost = function(post) {
    
    var confirmPopup = $ionicPopup.confirm({
      title: 'Are you sure?',
      template: 'Downvote or Flag'
    });
    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'fetchPosts');
      } else {
        console.log('You are not sure');
      }
    });
    
  };

  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'fetchPosts');
  };

  $scope.showFilter = function() {
    $rootScope.$broadcast('close:popover');
    $scope.fdata = {filter: $rootScope.$storage.filter || "trending"};
    var myPopupF = $ionicPopup.show({
       template: '<ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="created"><i class="icon" ng-class="{\'ion-star gray\':fdata.filter!=\'new\', \'ion-star positive\': fdata.filter==\'new\'}"></i> New</ion-radio><ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="hot"><i class="icon" ng-class="{\'ion-flame gray\':fdata.filter!=\'hot\', \'ion-flame positive\': fdata.filter==\'hot\'}"></i> Hot</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="trending"><i class="icon" ng-class="{\'ion-podium gray\':fdata.filter!=\'trending\', \'ion-podium positive\': fdata.filter==\'trending\'}"></i> Trending</ion-radio><ion-radio ng-model="fdata.filter" ng-change="filterchange()" value="promoted"><i class="icon" ng-class="{\'ion-paper-airplane gray\':fdata.filter!=\'promoted\', \'ion-paper-airplane positive\': fdata.filter==\'promoted\'}"></i> Promoted</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="trending30"><i class="icon" ng-class="{\'ion-connection-bars gray\':fdata.filter!=\'trending30\', \'ion-connection-bars positive\': fdata.filter==\'trending30\'}"></i> Trending (30 days)</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="active"><i class="icon" ng-class="{\'ion-chatbubble-working gray\':fdata.filter!=\'active\', \'ion-chatbubble-working positive\': fdata.filter==\'active\'}"></i> Active</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="cashout"><i class="icon" ng-class="{\'ion-share gray\':fdata.filter!=\'cashout\', \'ion-share positive\': fdata.filter==\'cashout\'}"></i> Cashout</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="votes"><i class="icon" ng-class="{\'ion-person-stalker gray\':fdata.filter!=\'votes\', \'ion-person-stalker positive\': fdata.filter==\'votes\'}"></i> Votes</ion-radio><ion-radio ng-model="fdata.filter"  ng-change="filterchange()" value="children"><i class="icon" ng-class="{\'ion-chatbubbles gray\':fdata.filter!=\'children\', \'ion-chatbubbles positive\': fdata.filter==\'children\'}"></i> Comments</ion-radio><button class="button button-block button-positive" ng-click="cancelFilter()">Cancel</button>',   
       title: 'Sort by',
       scope: $scope
    });
    myPopupF.then(function(res) {
      if (res) {
        $scope.fetchPosts(res[0], null, res[1]);
      }
    });
    $scope.cancelFilter = function() {
      myPopupF.close();
    };

    $scope.filterchange = function(f){
      console.log($scope.fdata.filter)
      $rootScope.$storage.filter = $scope.fdata.filter;
      //$rootScope.$storage.filter = f;
      console.log(f);
      myPopupF.close();
      $scope.closeMenuPopover();
      $rootScope.$broadcast('filter:change');
    }
  };
  
  $scope.refresh = function(){
    $scope.fetchPosts();
    $scope.closeMenuPopover();
    $rootScope.$broadcast('filter:change');
  };
  
  $rootScope.$on("user:logout", function(){
    $scope.refresh();
  });

  $scope.loadMore = function() {
    $rootScope.$broadcast('show:loading');
    $scope.limit += 5;
    if (!$scope.error) {
      $scope.fetchPosts(null, $scope.limit, null);  
    }
  };

  $scope.changeView = function(view) {
    $rootScope.$storage.view = view; 
    $scope.closeMenuPopover();
    if (!$scope.$$phase){
      $scope.$apply();
    }
    $rootScope.$broadcast('show:loading');
    $scope.refresh();
    setTimeout(function() {
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
    }, 10);
    
  }
  function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
  }
  $scope.dataChanged = function(newValue) {
    for (var i = 0; i < newValue.length; i++) {
      if ($rootScope.$storage.user){
        for (var j = newValue[i].active_votes.length - 1; j >= 0; j--) {
          if (newValue[i].active_votes[j].voter === $rootScope.$storage.user.username) {
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
      if ($rootScope.$storage.view == 'card') {
        newValue[i].json_metadata = angular.fromJson(newValue[i].json_metadata?newValue[i].json_metadata:[]);
      }
    }
    return newValue;
  }


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
    $scope.fetchPosts();
    $scope.closeMenuPopover();
  });
  $scope.$on('$destroy', function() {
    $scope.menupopover.remove();
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
      console.log("fetching..."+type+" "+limit+" "+tag);
      window.Api.database_api().exec("get_discussions_by_"+type, [params]).then(function(response){
        $scope.data = $scope.dataChanged(response); 
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
      $rootScope.$storage.view = 'card';
    }
    if (!$rootScope.$storage.filter) {
      $rootScope.$storage.filter = "trending";
    }
    //console.log(window.Api)
    //$scope.fetchPosts(null, $scope.limit, null);
    if (!angular.isDefined($rootScope.timeint)) {
      window.Api.initPromise.then(function(response) {
        console.log("Api ready:", response);
        $rootScope.timeint = $interval(function(){  
          window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(response){
            console.log("get_dynamic_global_properties "+ response.head_block_number);
            /*window.Api.database_api().exec("get_block", [response.head_block_number]).then(function(res){
              console.log(res);
            });*/
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
              console.log("login "+loginSuccess);
            }          
          });
        }, 15000);
        setTimeout(function() {
          $scope.fetchPosts(null, $scope.limit, null);  
        }, 10);
      });
    } else {
      setTimeout(function() {
        $scope.fetchPosts(null, $scope.limit, null);    
      }, 10);
    }
    setTimeout(function() {
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();   
    }, 100);
  });
  
  $scope.$on('$ionicView.beforeEnter', function(){
    if ($stateParams.tags) {
      $rootScope.$storage.tag = $stateParams.tags;
    }
    $rootScope.$broadcast('show:loading');
  })
  $scope.$on('$ionicView.loaded', function(){
    
  });

  /*if (!angular.isDefined($rootScope.timeint)) {
    $rootScope.timeint = $interval(function(){
      window.Api.database_api().exec("get_dynamic_global_properties", []).then(function(response){
        console.log("get_dynamic_global_properties", response.head_block_number);
      });
    }, 20000);
  }*/

  $scope.$on('$ionicView.leave', function(){

    if (!$scope.$$phase) {
      $scope.$apply();
    }
  });
  
  //$scope.refresh();   
})

app.controller('PostCtrl', function($scope, $stateParams, $rootScope, $interval, $ionicScrollDelegate, $ionicModal, $filter, $ionicActionSheet, $cordovaCamera, $ionicPopup, ImageUploadService, $ionicPlatform) {
  $scope.post = $rootScope.$storage.sitem;
  $scope.data = {};
  $scope.spost = {};  
  $scope.replying = false;
  $scope.isBookmarked = function() {
    if ($rootScope.$storage.bookmark) {
      for (var i = 0; i < $rootScope.$storage.bookmark.length; i++) {
        if ($rootScope.$storage.bookmark[i] && $rootScope.$storage.bookmark[i].permlink == $rootScope.$storage.sitem.permlink) {
          return true;
        }
      }
    }
  };
  $scope.bookmark = function() {
    if ($scope.isBookmarked()) {
      for (var i = 0; i < $rootScope.$storage.bookmark.length; i++) {
        if ($rootScope.$storage.bookmark[i].permlink == $rootScope.$storage.sitem.permlink) {
          $rootScope.$storage.bookmark.splice(i, 1);
        }
      }  
      $rootScope.showMessage("Success", "Post is removed from bookmarks!");  
    } else {
      if ($rootScope.$storage.bookmark) {
        $rootScope.$storage.bookmark.push({title: $rootScope.$storage.sitem.title, author:$rootScope.$storage.sitem.author, author_reputation: $rootScope.$storage.sitem.author_reputation, created: $rootScope.$storage.sitem.created, permlink:$rootScope.$storage.sitem.permlink});  
      } else {
        $rootScope.$storage.bookmark = [{title: $rootScope.$storage.sitem.title, author:$rootScope.$storage.sitem.author, author_reputation: $rootScope.$storage.sitem.author_reputation, created: $rootScope.$storage.sitem.created, permlink:$rootScope.$storage.sitem.permlink}];
      }
      $rootScope.showMessage("Success", "Post is added to bookmarks!");  
    }
    
  };

  $scope.showImg = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Capture Picture' },
       { text: 'Select Picture' },
       { text: 'Set Custom URL' },
     ],
     titleText: 'Insert Picture',
     cancelText: 'Cancel',
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
        console.log(imageData);
        setTimeout(function() {
          ImageUploadService.uploadImage(imageData).then(function(result) {
            var url = result.secure_url || '';
            var final = " ![image](" + url + ")";
            console.log(final);
            if ($scope.data.comment) {
              $scope.data.comment += final;
            } else {
              $scope.data.comment = final;
            }
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          },
          function(err) {
            $rootScope.showAlert("Error", "Upload Error");
            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
              $cordovaCamera.cleanup();
            }
          });    
        }, 10);
      }, function(err) {
        $rootScope.showAlert("Error", "Camera Cancelled");
      });
    } else {
      $ionicPopup.prompt({
        title: 'Set URL',
        template: 'Direct web link for the picture',
        inputType: 'text',
        inputPlaceholder: 'http://example.com/image.jpg'
      }).then(function(res) {
        console.log('Your url is', res);
        if (res) {
          var url = res.trim();
          var final = " ![image](" + url + ")";
          console.log(final);
          if ($scope.data.comment) {
            $scope.data.comment += final;
          } else {
            $scope.data.comment = final;
          }
        }
      });
    }
  };



  $ionicModal.fromTemplateUrl('templates/story.html', {
    scope: $scope  }).then(function(modal) {
    $scope.pmodal = modal;
  });
  $scope.openPostModal = function() {
    $scope.pmodal.show();
  };
  $scope.closePostModal = function() {
    $scope.pmodal.hide();
  };
  
  var dmp = new window.diff_match_patch();

  function createPatch(text1, text2) {
      if (!text1 && text1 === '') return undefined;
      var patches = dmp.patch_make(text1, text2);
      var patch = dmp.patch_toText(patches);
      return patch;
  }
  $scope.edit = false;
  $scope.editPost = function(xx) {
    $scope.edit = true;
    if (!$scope.spost.body) {
      $scope.spost = xx;  
      $scope.patchbody = xx.body;
    }
    $scope.spost.tags = angular.fromJson(xx.json_metadata).tags.join().replace(/\,/g,' ');
    console.log(xx);
    $scope.openPostModal();  
  }
  
  $scope.submitStory = function() {
    if ($scope.edit) {
      var patch = createPatch($scope.patchbody, $scope.spost.body)
      // Putting body into buffer will expand Unicode characters into their true length
      if (patch && patch.length < new Buffer($scope.spost.body, 'utf-8').length) {
        $scope.spost.body2 = patch;
      }
      //console.log(patch);
    } else {
      $scope.spost.body2 = undefined;
    }
    
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
        var permlink = $scope.spost.permlink;
        var json = angular.merge(angular.fromJson($scope.spost.json_metadata), {tags: $scope.spost.tags.split(" ")});

        tr.add_type_operation("comment", {
          parent_author: "",
          parent_permlink: $scope.spost.parent_permlink,
          author: $rootScope.$storage.user.username,
          permlink: $scope.spost.permlink,
          title: $scope.spost.title,
          body: $scope.spost.body2 || $scope.spost.body,
          json_metadata: angular.toJson(json)
        });
        //console.log(my_pubkeys);
        localStorage.error = 0;
        tr.process_transaction($scope.mylogin, null, true);
        $scope.closePostModal();
        $scope.replying = false;
        setTimeout(function() {
          if (localStorage.error == 1) {
            $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
          } else {
            $scope.spost = {};
            $rootScope.showMessage("Success", "Post is submitted!");  
            //$scope.closePostPopover();
            //$state.go("app.profile", {username: $rootScope.$storage.user.username});
          }
        }, 3000);
      } else {
        $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
      }
      $rootScope.$broadcast('hide:loading'); 
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Comment");
    }
  }


  $scope.reply = function (xx) {
    //console.log(xx);
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
        //console.log(angular.fromJson($scope.post.json_metadata));
        var t = new Date();
        var timeformat = t.getFullYear().toString()+(t.getMonth()+1).toString()+t.getDate().toString()+"t"+t.getHours().toString()+t.getMinutes().toString()+t.getSeconds().toString()+t.getMilliseconds().toString()+"z";
        var json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || ""};
        tr.add_type_operation("comment", {
          parent_author: $scope.post.author,
          parent_permlink: $scope.post.permlink,
          author: $rootScope.$storage.user.username,
          permlink: "re-"+$scope.post.author+"-"+$scope.post.permlink+"-"+timeformat,
          title: "",
          body: $scope.data.comment,
          json_metadata: angular.toJson(json)
        });
        //console.log(my_pubkeys);
        localStorage.error = 0;
        tr.process_transaction($scope.mylogin, null, true);
        $scope.closeModal();
        $scope.replying = false;
        setTimeout(function() {
          if (localStorage.error == 1) {
            $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
          } else {
            $scope.data.comment = "";  
            $rootScope.showMessage("Success", "Comment is submitted!");
            (new Steem(localStorage.socketUrl)).getContentReplies($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink, function(err, result){
              //console.log(result);      
              $scope.comments = result;
              if (!$scope.$$phase) {
                $scope.$apply();
              }
            });
          }
        }, 3000);
      } else {
        $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
      } 
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Comment");
    }
  }
  $rootScope.$on("update:content", function(){
    console.log("update:content");
    (new Steem(localStorage.socketUrl)).getContentReplies($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink, function(err, result){
      //console.log(result);      
      $scope.comments = result;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
  });
  $ionicModal.fromTemplateUrl('templates/reply.html', {
    scope: $scope  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function(item) {
    $scope.modal.show();
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
  }
  //$scope.post = {};
  $scope.$on('$ionicView.enter', function(){   
    //$scope.post = $rootScope.$storage.sitem;
    //console.log($rootScope.$storage.sitem);
    setTimeout(function() {
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
      (new Steem(localStorage.socketUrl)).getContentReplies($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink, function(err, result){
        //console.log(result);      
        $scope.comments = result;

        if (!$scope.$$phase) {
          $scope.$apply();
        }
      });
    }, 100);
    $rootScope.$broadcast('hide:loading');  
  });

  $scope.getContent = function(author, permlink) {
    (new Steem(localStorage.socketUrl)).getContent(author, permlink, function(err, result){
      //console.log(err);
      //console.log(result);
      if (!err) {
        for (var j = result.active_votes.length - 1; j >= 0; j--) {
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
      }
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    $rootScope.$broadcast('hide:loading');
  };

  $scope.upvotePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'getContent');
  };
  $rootScope.$on('getContent', function() {
    $scope.getContent($rootScope.$storage.sitem.author, $rootScope.$storage.sitem.permlink);
  });
  $scope.downvotePost = function(post) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Are you sure?',
      template: 'Downvote or Flag'
    });
    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'getContent');
      } else {
        console.log('You are not sure');
      }
    });
  };
  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'getContent');
  };

  $scope.$on('$ionicView.leave', function(){
    //$rootScope.$storage.sitem = undefined;
  });
})
app.controller('BookmarkCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate) {

  $scope.getContentAndOpen = function(author, permlink) {
    (new Steem(localStorage.socketUrl)).getContent(author, permlink, function(err, result){
      //console.log(err);
      //console.log(result);
      if (!err) {
        for (var j = result.active_votes.length - 1; j >= 0; j--) {
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
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });
    $rootScope.$broadcast('hide:loading');
  };

  $scope.removeBookmark = function(index) {
    if ($rootScope.$storage.bookmark) {
      $rootScope.$storage.bookmark.splice(index,1);
    }
  };




})
app.controller('FollowCtrl', function($scope, $stateParams, $rootScope, $state, APIs, $interval, $ionicScrollDelegate) {
  
  $scope.$on('$ionicView.beforeEnter', function(){
    $scope.active = "followers";  
    $scope.followers = [];
    $scope.following = [];
    $scope.limit = 100;
    $scope.tt = {ruser:"", duser:""};
      
    APIs.getFollowers($rootScope.$storage.user.username, $scope.tt.ruser, "blog", $scope.limit).then(function(res){
      if (res && res.length===$scope.limit) {
        $scope.tt.ruser = res[res.length-1].follower;
      }
      $scope.followers = res;
    });
    
    APIs.getFollowing($rootScope.$storage.user.username, $scope.tt.duser, "blog", $scope.limit).then(function(res){
      if (res && res.length===$scope.limit) {
        $scope.tt.duser = res[res.length-1].following;
      }
      $scope.following = res;
    });

    $scope.rfetching = $interval(function(){
      if ($scope.followers.length === $scope.limit) {
        APIs.getFollowers($rootScope.$storage.user.username, $scope.tt.ruser, "blog", $scope.limit).then(function(res){
          if (res && res.length===$scope.limit) {
            $scope.tt.ruser = res[res.length-1].follower;
          }
          //angular.merge($scope.followers, res);
          for (var i = 1; i < res.length; i++) {
            $scope.followers.push(res[i]);
          }
          //$scope.followers.push.apply($scope.followers, res);
          if (res.length<$scope.limit) {
            if (angular.isDefined($scope.rfetching)){
              $interval.cancel($scope.rfetching);
              $scope.rfetching = undefined;
            }
          }
        });
      }
    }, 600);

    $scope.dfetching = $interval(function(){
      if ($scope.following.length === $scope.limit) {
        APIs.getFollowing($rootScope.$storage.user.username, $scope.tt.duser, "blog", $scope.limit).then(function(res){
          if (res && res.length===$scope.limit) {
            $scope.tt.duser = res[res.length-1].following;
          }
          //angular.merge($scope.followers, res);
          for (var i = 1; i < res.length; i++) {
            $scope.following.push(res[i]);
          }
          //$scope.followers.push.apply($scope.followers, res);
          if (res.length<$scope.limit) {
            if (angular.isDefined($scope.dfetching)){
              $interval.cancel($scope.dfetching);
              $scope.dfetching = undefined;
            }
          }
        });
      }
    }, 1000);
  });
   
  $scope.$on('$ionicView.leave', function(){
    if (angular.isDefined($scope.dfetching)){
      $interval.cancel($scope.dfetching);
      $scope.dfetching = undefined;
      $scope.following = undefined;
    }
    if (angular.isDefined($scope.rfetching)){
      $interval.cancel($scope.rfetching);
      $scope.rfetching = undefined;
      $scope.followers = undefined;
    }
  });
  $scope.isFollowed = function(x) {
    for (var i = 0; i < $scope.following.length; i++) {
      if ($scope.following[i].following == x) {
        return true;
      }
    }
    return false;
  };
  $scope.isFollowing = function(x) {
    for (var i = 0; i < $scope.followers.length; i++) {
      if ($scope.followers[i].follower == x) {
        return true;
      }
    }
    return false;
  };
  $scope.change = function(type){
    $scope.active = type;
    console.log(type);
    /*if (type == "following") {
      $scope.following = angular.copy($scope.following);
    }*/
    $ionicScrollDelegate.$getByHandle('listScroll').scrollTop();
    if (!$scope.$$phase) {
      $scope.$apply();
    }
    //$scope.loadMore(type);
  }
  $scope.unfollowUser = function(xx){
    //$rootScope.showAlert("Info", "In Development, coming soon!");
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
          console.log("do unfollowing");
          var tr = new window.steemJS.TransactionBuilder();
          var json = {follower:$rootScope.$storage.user.username, following:xx, what: []}
          tr.add_type_operation("custom_json", {
            id: 'follow',
            required_posting_auths: [$rootScope.$storage.user.username],
            json: JSON.stringify(json)
          });
          localStorage.error = 0;
          tr.process_transaction($scope.mylogin, null, true);

          setTimeout(function() {
            if (localStorage.error == 1) {
              $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
            } else {
              //$scope.refreshFollowers();
              $state.go($state.current, {}, {reload: true});
            }
          }, 2000);
        } else {
          $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
        }
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Follow");
    }
  };
  $scope.followUser = function(xx){
    //console.log($rootScope.$storage.user);
    $rootScope.$broadcast('show:loading');
    if ($rootScope.$storage.user) {
        console.log('Api ready:');
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
          console.log("do following")
          var tr = new window.steemJS.TransactionBuilder();
          var json = {follower:$rootScope.$storage.user.username, following:xx, what: ["blog"]}
          tr.add_type_operation("custom_json", {
            id: 'follow',
            required_posting_auths: [$rootScope.$storage.user.username],
            json: JSON.stringify(json)
          });
          localStorage.error = 0;
          tr.process_transaction($scope.mylogin, null, true);
          setTimeout(function() {
            if (localStorage.error == 1) {
              $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
            } else {
              //$scope.refreshFollowers();
              $state.go($state.current, {}, {reload: true});
            }
          }, 2000);
        } else {
          $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Posting private key on Login if you have choosed Advanced mode.");
        }
      $rootScope.$broadcast('hide:loading');
    } else {
      $rootScope.$broadcast('hide:loading');
      $rootScope.showAlert("Warning", "Please, login to Follow");
    }
    //$rootScope.showAlert("Info", "In Development, coming soon!");
  };
  $scope.profileView = function(xx){
    $state.go('app.profile', {username: xx});
  };
  
})

app.controller('ProfileCtrl', function($scope, $stateParams, $rootScope, $ionicActionSheet, $cordovaCamera, ImageUploadService, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory) {
  
  $scope.goBack = function() {
    var viewHistory = $ionicHistory.viewHistory();
    if (!viewHistory.backView) {
      $scope.openMenu();
    } else {
      $ionicHistory.goBack();  
    }
  };
  $scope.show = function() {
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Capture Picture' },
       { text: 'Select Picture' },
       { text: 'Set Custom URL' },
     ],
     destructiveText: 'Reset',
     titleText: 'Modify Profile Picture',
     cancelText: 'Cancel',
     cancel: function() {
        // add cancel code..
      },
     buttonClicked: function(index) {
      if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
        $rootScope.showMessage("Error", "Please provide Active private key if you have chosen Advanced login mode!");
      } else {
        $scope.changeProfileInfo(index);  
      }
      return true;
     }, 
     destructiveButtonClicked: function(index){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Are you sure?',
        template: 'This will reset user profile picture'
      });
      confirmPopup.then(function(res) {
        if(res) {
          if (!$rootScope.$storage.user.password && !$rootScope.$storage.user.privateActiveKey) {
            $rootScope.showMessage("Error", "Please provide Active private key if you have chosen Advanced login mode!");
          } else {
            var update = {profile: {profile_image:""} };
            angular.merge(update, $rootScope.$storage.user.json_metadata);
            if (update.profilePicUrl) {delete update.profilePicUrl;}

            update.profile.profile_image = "";

            console.log('You are sure');
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
                    $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                  } else {
                    $scope.refreshLocalUserData();
                  }
                }, 2000);
              } else {
                $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Active private key on Login if you have choosed Advanced mode.");
              }
              $rootScope.$broadcast('hide:loading');
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert("Warning", "Please, login to Update");
            }
          }
        } else {
          console.log('You are not sure');
        }
      });
      return true;
     }
   });
  };
  $scope.changeProfileInfo = function(type) {
    var options = {};
    if (type == 0 || type == 1) {
      options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: (type===0)?Camera.PictureSourceType.CAMERA:Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: (type===0)?true:false,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
        //correctOrientation:true
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        ImageUploadService.uploadImage(imageData).then(function(result) {
          var url = result.secure_url || '';
          var update = { profile: { profile_image: "" } };
          angular.merge(update, $rootScope.$storage.user.json_metadata);
          if (update.profilePicUrl) {delete update.profilePicUrl;}
          update.profile.profile_image = url;
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
                    $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage);
                  } else {
                    $scope.refreshLocalUserData();
                  }
                }, 2000);
              } else {
                $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Active private key on Login if you have choosed Advanced mode.");
              }
            $rootScope.$broadcast('hide:loading');
          } else {
            $rootScope.$broadcast('hide:loading');
            $rootScope.showAlert("Warning", "Please, login to Update");
          }
          }, 2000);
          if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
            $cordovaCamera.cleanup();
          }
        },
        function(err) {
          $rootScope.showAlert("Error", "Upload Error");
          if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
            $cordovaCamera.cleanup();
          }
        });
      }, function(err) {
        $rootScope.showAlert("Error", "Camera Cancelled");
      });
    } else {
      $ionicPopup.prompt({
        title: 'Set URL',
        template: 'Direct web link for picture',
        inputType: 'text',
        inputPlaceholder: 'http://example.com/image.jpg'
      }).then(function(res) {
        console.log('Your url is', res);
        if (res) {
          var update = { profile: { profile_image: "" } };
          angular.merge(update, $rootScope.$storage.user.json_metadata);
          if (update.profilePicUrl) {delete update.profilePicUrl;}
          update.profile.profile_image = res;
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
                    $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                  } else {
                    $scope.refreshLocalUserData();
                  }
                }, 2000);
              } else {
                $rootScope.showMessage("Error", "Login failed! Please make sure you have logged in with master password or provided Active private key on Login if you have choosed Advanced mode.");
              }
              $rootScope.$broadcast('hide:loading');
            } else {
              $rootScope.$broadcast('hide:loading');
              $rootScope.showAlert("Warning", "Please, login to Update");
            }
          }, 2000);
          
        }
      });
    }
    
  };
  $rootScope.$on('profileRefresh', function(){
    $scope.refresh();
  });
  $scope.upvotePost = function(post) {
    $rootScope.votePost(post, 'upvote', 'profileRefresh');
  };
  $scope.downvotePost = function(post) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Are you sure?',
      template: 'Downvote or Flag'
    });
    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
        $rootScope.votePost(post, 'downvote', 'profileRefresh');
      } else {
        console.log('You are not sure');
      }
    });    
  };
  $scope.unvotePost = function(post) {
    $rootScope.votePost(post, 'unvote', 'profileRefresh');
  };

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
    
    (new Steem(localStorage.socketUrl)).getState("/@"+$stateParams.username+$scope.rest, function(err, res){
      $scope.profile = [];
      //console.log(res.content);
      if (Object.keys(res.content).length>0) {
        for (var property in res.content) {
          if (res.content.hasOwnProperty(property)) {
            // do stuff
            //console.log(res.content[property])
            var ins = res.content[property];
            if ($rootScope.$storage.user){
              for (var j = ins.active_votes.length - 1; j >= 0; j--) {
                if (ins.active_votes[j].voter === $rootScope.$storage.user.username) {
                  if (ins.active_votes[j].percent > 0) {
                    ins.upvoted = true;  
                  } else if (ins.active_votes[j].percent < 0) {
                    ins.downvoted = true;  
                  } else {
                    ins.upvoted = false;
                    ins.downvoted = false;    
                  }
                }
              }
            }
            $scope.profile.push(ins);
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
  };
  $scope.user = {username: $stateParams.username};
  $scope.getOtherUsersData = function() {
    console.log("getOtherUsersData");
    (new Steem(localStorage.socketUrl)).getAccounts([$stateParams.username], function(err, dd) {
      //console.log(dd);
      dd = dd[0];
      if (dd.json_metadata) {
        dd.json_metadata = angular.fromJson(dd.json_metadata);
      }
      angular.merge($scope.user, dd);
      if(!$scope.$$phase){
        $scope.$apply();
      }
    });
  };
  $scope.$on('$ionicView.beforeEnter', function(){
    //console.log($ionicHistory.viewHistory());

    if ($rootScope.$storage.user.username !== $stateParams.username) {
      $scope.getOtherUsersData();  
    }/* else {
      $scope.refreshLocalUserData();
    }*/  
    $scope.refresh();  
  });
  $scope.openMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }
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
              var ins = res.content[property];
              if ($rootScope.$storage.user){
                for (var j = ins.active_votes.length - 1; j >= 0; j--) {
                  if (ins.active_votes[j].voter === $rootScope.$storage.user.username) {
                    if (ins.active_votes[j].percent > 0) {
                      ins.upvoted = true;  
                    } else if (ins.active_votes[j].percent < 0) {
                      ins.downvoted = true;  
                    } else {
                      ins.upvoted = false;
                      ins.downvoted = false;    
                    }
                  }
                }
              }
              $scope.profile.push(ins);
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
        window.Api.market_history_api().exec("get_recent_trades", [15]).then(function(r){
          //console.log(r);
          $scope.recent_trades = r;
          if (!$scope.$$phase) {
            $scope.$apply();
          }
        });
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

app.controller('SettingsCtrl', function($scope, $stateParams, $rootScope, $ionicHistory, $state, $ionicPopover, $ionicPopup, APIs) {
   
   $ionicPopover.fromTemplateUrl('popover.html', {
      scope: $scope
   }).then(function(popover) {
      $scope.tooltip = popover;
   });

   $scope.openTooltip = function($event, text) {
      $scope.tooltipText = text;
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
        console.log(angular.toJson(res.data))
        angular.merge($scope.data, {vote: res.data[0].subscription.vote, follow: res.data[0].subscription.follow, comment: res.data[0].subscription.comment});
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
      follow: $scope.data.follow
    }
    APIs.updateSubscription($rootScope.$storage.deviceid, $rootScope.$storage.user.username, $rootScope.$storage.subscription).then(function(res){
      console.log(angular.toJson(res));
    });
    
  }
  
  $scope.$watch('slider', function(newValue, oldValue){
    if (newValue.value) {
      $rootScope.$storage.voteWeight = newValue.value*100; 
    }
  }, true);

  $scope.pinChange = function() {
    console.log("pinChange");
    if ($rootScope.$storage.pincode) {
      $rootScope.$broadcast("pin:check");
    } else {
      $rootScope.$broadcast("pin:new");
    }  
  }

  $rootScope.$on("pin:correct", function(){
    console.log("pin:correct",$scope.data.pin);
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
    console.log("pin:failed");
    setTimeout(function() {
      if ($rootScope.$storage.pincode) {
        $scope.data.pin = true;
      } else {
        $scope.data.pin = false;
      }
      if (!$scope.$$phase){
        $scope.$apply();
      }
    }, 100);
    
  });
  
  $scope.save = function(){
    if (localStorage.socketUrl !== $rootScope.$storage.socket) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Are you sure?',
        template: 'Server update requires Restart!'
      });
      confirmPopup.then(function(res) {
        if(res) {
          console.log('You are sure');
          localStorage.socketUrl = $rootScope.$storage.socket;
          setTimeout(function() {
            ionic.Platform.exitApp(); // stops the app
          }, 10);
        } else {
          console.log('You are not sure');
        }
      });
    };
    $rootScope.showMessage("Success", "Settings are updated!");
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.posts', {tags:""});
  };

});
}