(function() {
    'use strict';

    angular.module('ionic.contrib.ui.ionThread', [])
        .directive('ionComment', ionComment)
        .directive('ionThread', ionThread);

    function ionComment() {
        return {
            restrict: 'E',
            scope: {
                comment: '='
            },
            template: '<ion-item ng-if="comment.author" class="ion-comment item">\
                        <div class="ion-comment--author">{{comment.author}}:</div>\
                        <div class="ion-comment--score"><span class="ion-android-arrow-dropup"></span> {{comment.net_votes || 0}}</div>\
                        <div class="ion-comment--text" ng-bind-html="comment.body | parseUrl"></div>\
                        <div class="ion-comment--replies">{{comment.children || 0}} replies</div>\
                        <ion-option-button ng-click="upvotePost(comment)"><span class="ion-android-arrow-dropup" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-click="downvotePost(comment)"><span class="ion-android-arrow-dropdown" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-click="replyToComment()"><span class="ion-ios-chatbubble-outline" style="font-size:30px"></ion-option-button>\
                    </ion-item>',
            controller: function($scope, $rootScope) {
                $scope.upvoteComment = function() {}

                $scope.upvotePost = function(post) {
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
                          tr.add_type_operation("vote", {
                              voter: $rootScope.$storage.user.username,
                              author: post.author,
                              permlink: post.permlink,
                              weight: 10000
                          });
                          tr.process_transaction($scope.mylogin, null, true);
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
                        }
                      $rootScope.$broadcast('hide:loading');
                    } else {
                      $rootScope.$broadcast('hide:loading');
                      $rootScope.showAlert("Warning", "Please, login to Vote");
                    }
                  };

                $scope.replyToComment = function() {
                    console.log('reply to comment')
                }
            }
        }
    }

    function ionThread() {
        return {
            restrict: 'E',
            scope: {
                comments: '='
            },
            //Replace ng-if="!comment.showChildren" with ng-if="comment.showChildren" to hide all child comments by default
            //Replace comment.data.replies.data.children according to the API you are using | orderBy:\'-net_votes\'
            template: '<script type="text/ng-template" id="node.html">\
                            <ion-comment ng-click="toggleComment(comment)" comment="comment">\
                            </ion-comment>\
                            <div class="reddit-post--comment--container">\
                                 <ul ng-if="comment.showChildren" class="animate-if ion-comment--children">\
                                    <li ng-repeat="comment in comment.replies track by $index ">\
                                        <ng-include src="\'node.html\'"/>\
                                    </li>\
                                </ul>\
                            </div>\
                        </script>\
                        <ion-list ng-if="comments && comments.length > 0">\
                          <ul>\
                            <li ng-repeat="comment in comments track by $index ">\
                                <ng-include src="\'node.html\'"/>\
                            </li>\
                          </ul>\
                        </ion-list>',
            controller: function($scope, $rootScope) {
                $scope.toggleComment = function(comment) {
                    //console.log('toggleComment ',comment)
                    if (comment.children > 0){
                      (new Steem($rootScope.$storage.socket)).getContentReplies(comment.author, comment.permlink, function(err, res1) {
                      //window.Api.database_api().exec("get_content_replies", [comments[i].author, comments[i].permlink]).then(function(res1){
                        comment.replies = res1;
                        //console.log('result',res1);
                        if (comment.showChildren) {
                            comment.showChildren = false;
                        } else {
                            comment.showChildren = true;
                        }
                        if (!$scope.$$phase) {
                          $scope.$apply();
                        }
                      });
                    }
                }           
            }
        }
    }
})();