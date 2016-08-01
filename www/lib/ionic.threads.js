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
                        <ion-option-button ng-click="upvoteComment(comment)"><span class="ion-android-arrow-dropup" style="font-size:40px"></ion-option-button>\
                        <ion-option-button ng-click="downvoteComment(comment)"><span class="ion-android-arrow-dropdown" style="font-size:40px"></ion-option-button>\
                        <ion-option-button ng-click="replyToComment()"><span class="ion-ios-chatbubble-outline" style="font-size:40px"></ion-option-button>\
                    </ion-item>',
            controller: function($scope) {
                $scope.upvoteComment = function() {}

                $scope.downvoteComment = function() {}

                $scope.replyToComment = function() {}
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
                                 <ul ng-if="!comment.showChildren" class="animate-if ion-comment--children">\
                                    <li ng-repeat="comment in comment.creplies track by $index ">\
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
            controller: function($scope) {
                $scope.toggleComment = function(comment) {
                    if (comment.showChildren) {
                        comment.showChildren = false;
                    } else {
                        comment.showChildren = true;
                    }
                }           
            }
        }
    }
})();