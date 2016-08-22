//angular.module('steem.services', [])
module.exports = function (app) {
	app.service('APIs', ['$http', '$rootScope', function ($http, $rootScope) {
		'use strict';
		
		return {
			login: function (data) {
				return $http.post('', data);
			},
			getconfig: function() {
				return $http.get('');
			}
		};
	}])

	
	app.filter('timeago', function() {
        return function(input, p_allowFuture) {
		
            var substitute = function (stringOrFunction, number, strings) {
                    var string = angular.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
                    var value = (strings.numbers && strings.numbers[number]) || number;
                    return string.replace(/%d/i, value);
                },
                nowTime = (new Date()).getTime(),
                date = (new Date(input)).getTime(),
                //refreshMillis= 6e4, //A minute
                allowFuture = p_allowFuture || false,
                strings= {
                    prefixAgo: '',
                    prefixFromNow: '',
                    suffixAgo: "ago",
                    suffixFromNow: "from now",
                    seconds: "seconds",
                    minute: "a minute",
                    minutes: "%d minutes",
                    hour: "an hour",
                    hours: "%d hours",
                    day: "a day",
                    days: "%d days",
                    month: "a month",
                    months: "%d months",
                    year: "a year",
                    years: "%d years"
                },
                dateDifference = nowTime - date,
                words,
                seconds = Math.abs(dateDifference) / 1000,
                minutes = seconds / 60,
                hours = minutes / 60,
                days = hours / 24,
                years = days / 365,
                separator = strings.wordSeparator === undefined ?  " " : strings.wordSeparator,
            
               
                prefix = strings.prefixAgo,
                suffix = strings.suffixAgo;
                
            if (allowFuture) {
                if (dateDifference < 0) {
                    prefix = strings.prefixFromNow;
                    suffix = strings.suffixFromNow;
                }
            }

            words = seconds < 45 && substitute(strings.seconds, Math.round(seconds), strings) ||
            seconds < 90 && substitute(strings.minute, 1, strings) ||
            minutes < 45 && substitute(strings.minutes, Math.round(minutes), strings) ||
            minutes < 90 && substitute(strings.hour, 1, strings) ||
            hours < 24 && substitute(strings.hours, Math.round(hours), strings) ||
            hours < 42 && substitute(strings.day, 1, strings) ||
            days < 30 && substitute(strings.days, Math.round(days), strings) ||
            days < 45 && substitute(strings.month, 1, strings) ||
            days < 365 && substitute(strings.months, Math.round(days / 30), strings) ||
            years < 1.5 && substitute(strings.year, 1, strings) ||
            substitute(strings.years, Math.round(years), strings);
			//console.log(prefix+words+suffix+separator);
			prefix.replace(/ /g, '')
			words.replace(/ /g, '')
			suffix.replace(/ /g, '')
			return (prefix+' '+words+' '+suffix+' '+separator);
            
        };
    })

    app.filter('parseUrl', function($sce) {
	    var urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
	    var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	 	var imgs = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;
		var youtube = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
		var youtubeid = /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/))([A-Za-z0-9\_\-]+)/i;
		
	    return function(textu, subpart) {
	        var options = {
	        	gfm: true,
				tables: true,
                smartLists: true,
			    /*breaks: false,
			    pedantic: false,
			    sanitize: true,
			    smartLists: true,
			    smartypants: false*/
			};
			var textu = marked(textu, options);
			if (subpart) {
				var s = $sce.trustAsHtml(textu).toString();
				var text = s.substring(s.indexOf("<p>"), s.indexOf("</p>"));
				return text;
			} else {
				return $sce.trustAsHtml(textu);	
			}
	    };
	});

    app.filter('metadata', function($sce) {
        var urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
        var users = /(^|\s)(@[a-z][-\.a-z\d]+[a-z\d])/gim;
        var imgs = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;
        var youtube = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var youtubeid = /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/))([A-Za-z0-9\_\-]+)/i;
        
        return function(textu) {
            var out = {};
            var murls = textu.match(urls);
            var musers = textu.match(users);
            var mimgs = [];
            var mlinks = [];
            if (murls) {
                for (var i = 0; i < murls.length; i++) {
                    var ind = murls[i].match(imgs);
                    if (ind) {
                        mimgs.push(murls[i]);
                    } else {
                        mlinks.push(murls[i]);
                    }
                }
                if (mlinks) {
                    angular.merge(out, {links: mlinks});    
                }
                if (mimgs) {
                    angular.merge(out, {image: mimgs});    
                }
            }
            if (musers) {
                for (var i = 0; i < musers.length; i++) {
                    musers[i] = musers[i].trim().substring(1);
                }
                if (musers) {
                    angular.merge(out, {users: musers});    
                }
            }
            return out;
        };
    });
    

	app.filter('sp', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-6))/1e6*$rootScope.$storage.steem_per_mvests).toFixed(3);	
	    	}
	    };
	})
	app.filter('sd', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-6))/1e6*$rootScope.$storage.steem_per_mvests*$rootScope.$storage.base).toFixed(3);	
	    	}
	    };
	})
	app.filter('sbd', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-4)).toFixed(3));	
	    	}
	    };
	})
	app.filter('st', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-6)).toFixed(3));	
	    	}
	    };
	})
	app.filter('reputation', function(){
		return function(value) {
			reputation_level = 1;
			neg = false;

			if (value < 0)
				neg = true;

			if (value != 0) {
				reputation_level = Math.log10(Math.abs(value));
				reputation_level = Math.max(reputation_level - 9, 0);
			
				if (reputation_level < 0) 
					reputation_level = 0;
				if (neg) 
					reputation_level *= -1;
				
				reputation_level = (reputation_level*9) + 25;
			} else {
				return 0;
			}

			return Math.floor(reputation_level);
		}
	})
    
    app.filter('hrefToJS', function ($sce, $sanitize) {
        return function (text) {
            var regex = /href="([\S]+)"/g;
            var newString = $sanitize(text).replace(regex, "href onClick=\"window.open('$1', '_blank', 'location=yes');return false;\"");
            return $sce.trustAsHtml(newString);
        }
    });
	app.directive('qrcode', function($interpolate) {  
		return {
		    restrict: 'E',
		    link: function($scope, $element, $attrs) {

		      var options = {
		        text: '',
		        width: 128,
		        height: 128,
		        colorDark: '#000000',
		        colorLight: '#ffffff',
		        correctLevel: 'H'
		      };

		      Object.keys(options).forEach(function(key) {
		        options[key] = $interpolate($attrs[key] || '')($scope) || options[key];
		      });

		      options.correctLevel = QRCode.CorrectLevel[options.correctLevel];

		      new QRCode($element[0], options);

		    }
		}
	});

    app.directive('ionComment', ionComment)
    app.directive('ionThread', ionThread);

    function ionComment() {
        return {
            restrict: 'E',
            scope: {
                comment: '='
            },
            template: '<ion-item ng-if="comment.author" class="ion-comment item">\
                        <div class="ion-comment--author">{{comment.author}}&nbsp;<div class="reputation">{{comment.author_reputation|reputation|number:0}}</div>&middot;{{comment.created|timeago}}</div>\
                        <div class="ion-comment--score"><i class="icon ion-social-usd"></i> {{comment.total_pending_payout_value.split(" ")[0]|number}}</div>\
                        <div class="ion-comment--text selectable bodytext" ng-bind-html="comment.body | parseUrl | hrefToJS"></div>\
                        <div class="ion-comment--replies">{{comment.net_votes || 0}} votes, {{comment.children || 0}} replies</div>\
                        <ion-option-button ng-click="upvotePost(comment)"><span class="ion-android-arrow-dropup" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-click="downvotePost(comment)"><span class="ion-android-arrow-dropdown" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-click="replyToComment(comment)"><span class="ion-ios-chatbubble-outline" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-if="comment.author == $root.$storage.user.username && compateDate(comment)" ng-click="editComment(comment)"><span class="ion-ios-compose-outline" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-if="comment.author == $root.$storage.user.username" ng-click="deleteComment(comment)"><span class="ion-ios-trash-outline" style="font-size:30px"></ion-option-button>\
                    </ion-item>',
            controller: function($scope, $rootScope, $state, $ionicModal, $ionicPopup) {
                $scope.compateDate = function(comment) {
                    if (comment.last_payout == "1970-01-01T00:00:00") {
                        return true;
                    } else {
                      if (comment.mode == "first_payout"){
                        return true;
                      } else {
                        return false;
                      }
                    }
                }
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
                              weight: $rootScope.$storage.voteWeight || 10000
                          });
                          localStorage.error = 0;
                          tr.process_transaction($scope.mylogin, null, true);

                          setTimeout(function() {
                              if (localStorage.error == 1) {
                                $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                              } else {
                                $rootScope.$broadcast("update:content");
                              }
                            }, 1000);
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
                          localStorage.error = 0;
                          tr.process_transaction($scope.mylogin, null, true);
                           setTimeout(function() {
                              if (localStorage.error == 1) {
                                $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                              } else {
                                $rootScope.$broadcast("update:content");
                              }
                            }, 1000);
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
                          localStorage.error = 0;
                          tr.process_transaction($scope.mylogin, null, true);
                           setTimeout(function() {
                              if (localStorage.error == 1) {
                                $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                              } else {
                                $rootScope.$broadcast("update:content");
                              }
                            }, 1000);
                        }
                      $rootScope.$broadcast('hide:loading');
                    } else {
                      $rootScope.$broadcast('hide:loading');
                      $rootScope.showAlert("Warning", "Please, login to Vote");
                    }
                  };
                  $scope.data={};
                $ionicModal.fromTemplateUrl('templates/reply.html', {
                    scope: $scope  }).then(function(modal) {
                    $scope.cmodal = modal;
                  });

                  $scope.openModal = function(item) {
                    $scope.cmodal.show();
                  };

                  $scope.closeModal = function() {
                    $scope.replying = false;
                    $scope.cmodal.hide();
                  };

                  $scope.isreplying = function(cho, xx) {
                    $scope.replying = xx;
                    $scope.post = cho;
                    if (xx) {
                        $scope.edit = false;
                        $scope.openModal();
                    } else {
                        $scope.edit = true;
                        $scope.data.comment = $scope.post.body;
                        $scope.openModal();
                    }
                  }

                $scope.reply = function (xx) {
                    if (!$scope.edit) {
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
                                $rootScope.$broadcast("update:content");
                              }
                            }, 1000);
                          } 
                          $rootScope.$broadcast('hide:loading');
                        } else {
                          $rootScope.$broadcast('hide:loading');
                          $rootScope.showAlert("Warning", "Please, login to Comment");
                        }
                    } else {
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
                            
                            var json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || ""};
                            tr.add_type_operation("comment", {
                              parent_author: $scope.post.parent_author,
                              parent_permlink: $scope.post.parent_permlink,
                              author: $scope.post.author,
                              permlink: $scope.post.permlink,
                              title: "",
                              body: $scope.data.comment,
                              json_metadata: $scope.post.json_metadata
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
                                $rootScope.$broadcast("update:content");
                              }
                            }, 1000);
                          } 
                          $rootScope.$broadcast('hide:loading');
                        } else {
                          $rootScope.$broadcast('hide:loading');
                          $rootScope.showAlert("Warning", "Please, login to Comment");
                        }
                    }
                    
                }
                $scope.replyToComment = function(comment) {
                    console.log('reply to comment')
                    //$rootScope.$storage.sitem = comment;
                    $scope.isreplying(comment, true);
                }
                $scope.editComment = function(comment) {
                    console.log('edit to comment')
                    //$rootScope.$storage.sitem = comment;
                    $scope.isreplying(comment, false);
                }
                $scope.deleteComment = function(comment) {
                    console.log('delete to comment', comment);
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'Are you sure?',
                        template: 'Deleting comments irreversible...'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            console.log('You are sure');
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
                                
                                tr.add_type_operation("delete_comment", {
                                  author: comment.author,
                                  permlink: comment.permlink
                                });
                                //console.log(my_pubkeys);
                                localStorage.error = 0;
                                tr.process_transaction($scope.mylogin, null, true);
                                
                                setTimeout(function() {
                                  if (localStorage.error == 1) {
                                    $rootScope.showAlert("Error", "Broadcast error, try again!"+" "+localStorage.errormessage)
                                  } else {
                                    $rootScope.$broadcast("update:content");
                                  }
                                }, 1000);
                              } 
                              $rootScope.$broadcast('hide:loading');
                            } else {
                              $rootScope.$broadcast('hide:loading');
                              $rootScope.showAlert("Warning", "Please, login to Delete Comment");
                            }
                        } else {
                          console.log('You are not sure');
                        }
                    });
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
                                    <li ng-repeat="comment in comment.replies | orderBy:\'-net_votes\' track by $index ">\
                                        <ng-include src="\'node.html\'"/>\
                                    </li>\
                                </ul>\
                            </div>\
                        </script>\
                        <ion-list ng-if="comments && comments.length > 0">\
                          <ul>\
                            <li ng-repeat="comment in comments | orderBy:\'-net_votes\' track by $index">\
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

    function ius($q, $ionicLoading, $cordovaFileTransfer, $ionicPlatform) {
        var service = {};
        service.uploadImage = uploadImage;
        return service;
        function uploadImage(imageURI) {
          var deferred = $q.defer();
          var fileSize;
          var percentage;
          // Find out how big the original file is
          window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
            fileEntry.file(function(fileObj) {
              fileSize = fileObj.size;
              // Display a loading indicator reporting the start of the upload
              $ionicLoading.show({template : 'Uploading Picture : ' + 0 + '%'});
              // Trigger the upload
              uploadFile();
            });
          });
          function uploadFile() {
            // Add the Cloudinary "upload preset" name to the headers
            var uploadOptions = {
              params : { 'upload_preset': "profilePics"}
            };
            $ionicPlatform.ready(function() {
                $cordovaFileTransfer.upload("https://api.cloudinary.com/v1_1/esteem/image/upload", imageURI, uploadOptions).then(function(result) {
                    // Let the user know the upload is completed
                    $ionicLoading.show({template : 'Upload Completed', duration: 1000});
                    // Result has a "response" property that is escaped
                    // FYI: The result will also have URLs for any new images generated with 
                    // eager transformations
                    var response = JSON.parse(decodeURIComponent(result.response));
                    deferred.resolve(response);
                  }, function(err) {
                    // Uh oh!
                    $ionicLoading.show({template : 'Upload Failed', duration: 3000});
                    deferred.reject(err);
                  }, function (progress) {
                    // The upload plugin gives you information about how much data has been transferred 
                    // on some interval.  Use this with the original file size to show a progress indicator.
                    percentage = Math.floor(progress.loaded / fileSize * 100);
                    $ionicLoading.show({template : 'Uploading Picture : ' + percentage + '%'});
                  });
            });
          }
          return deferred.promise;
        }
    }

    app.factory('ImageUploadService', ius);

    app.constant('defaultSettings', {
        alphabetcolors: ["#5A8770", "#B2B7BB", "#6FA9AB", "#F5AF29", "#0088B9", "#F18636", "#D93A37", "#A6B12E", "#5C9BBC", "#F5888D", "#9A89B5", "#407887", "#9A89B5", "#5A8770", "#D33F33", "#A2B01F", "#F0B126", "#0087BF", "#F18636", "#0087BF", "#B2B7BB", "#72ACAE", "#9C8AB4", "#5A8770", "#EEB424", "#407887"],
        textColor: '#ffffff',
        defaultBorder: 'border:5px solid white',
        triangleup: 'width: 0;height: 0;border-left: 50px solid transparent;border-right: 50px solid transparent;border-bottom: 100px solid;',
        fontsize: 30, // unit in pixels
        height: 50, // unit in pixels
        width: 50, // unit in pixels
        fontWeight: 400, //
        charCount: 1,
        fontFamily: 'HelveticaNeue-Light,Helvetica Neue Light,Helvetica Neue,Helvetica, Arial,Lucida Grande, sans-serif',
        base: 'data:image/svg+xml;base64,',
        radius: 'border-radius:50%;',
        custombgcolor: '',
        dynamic: 'false',
        rotatedeg: '0'
    });

    /**
     * directive to create the avatar
     * @param {type} param1
     * @param {type} param2
     */
    app.directive('ngLetterAvatar', ['defaultSettings', function (defaultSettings) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                alphabetcolors: '=alphabetcolors',
                data: '@'
            },
            link: function (scope, element, attrs) {

                /**
                 * Populate the attribute values to params object
                 * @type type
                 */
                var params = {
                    charCount: attrs.charcount || defaultSettings.charCount,
                    data: attrs.data,
                    textColor: defaultSettings.textColor,
                    height: attrs.height || defaultSettings.height,
                    width: attrs.width || defaultSettings.width,
                    fontsize: attrs.fontsize || defaultSettings.fontsize,
                    fontWeight: attrs.fontweight || defaultSettings.fontWeight,
                    fontFamily: attrs.fontfamily || defaultSettings.fontFamily,
                    avatarBorderStyle: attrs.avatarcustomborder,
                    avatardefaultBorder: attrs.avatarborder,
                    defaultBorder: defaultSettings.defaultBorder,
                    shape: attrs.shape,
                    alphabetcolors: scope.alphabetcolors || defaultSettings.alphabetcolors,
                    avatarCustomBGColor: attrs.avatarcustombgcolor || defaultSettings.custombgcolor,
                    dynamic: attrs.dynamic || defaultSettings.dynamic,
                    rotatedeg: attrs.rotatedeg || defaultSettings.rotatedeg
                };

                /**
                 * to generate the avatar dynamically on data change, enable the below function to watch the event
                 */
                if (params.dynamic === 'true') {
                    scope.$watch('data', function () {
                        _generateLetterAvatar();
                    });
                } else {
                    _generateLetterAvatar();
                }

                function _generateLetterAvatar() {
                    var c = '';
                    if (params.charCount == 2) {
                        var _data = getFirstAndLastName(scope.data.toUpperCase());
                        if (_data) {
                            c = _data;
                        } else {
                            c = scope.data.substr(0, params.charCount).toUpperCase();
                        }
                    } else {
                        c = scope.data.substr(0, params.charCount).toUpperCase();
                    }
                    var cobj = getCharacterObject(c, params.textColor, params.fontFamily, params.fontWeight, params.fontsize);
                    var colorIndex = '';
                    var color = '';

                    /**
                     * Populate the colors according to attributes
                     */
                    if (c.charCodeAt(0) < 65) {
                        color = getRandomColors();
                    } else {
                        colorIndex = Math.floor((c.charCodeAt(0) - 65) % params.alphabetcolors.length);
                        color = params.alphabetcolors[colorIndex];
                    }

                    if (params.avatarCustomBGColor) {
                        color = params.avatarCustomBGColor;
                    }

                    var svg = getImgTag(params.width, params.height, color);
                    svg.append(cobj);
                    var lvcomponent = angular.element('<div>').append(svg.clone()).html();
                    var svgHtml = window.btoa(unescape(encodeURIComponent(lvcomponent)));
                    var component;
                    var base = defaultSettings.base;
                    var _style = '';
                    if (params.avatarBorderStyle) {
                        _style = params.avatarBorderStyle;
                    } else if (params.avatardefaultBorder) {
                        _style = params.defaultBorder;
                    }

                    if (params.rotatedeg != '0') {
                        _style = '-ms-transform: rotate(' + params.rotatedeg + 'deg); -webkit-transform: rotate(' + params.rotatedeg + 'deg); transform: rotate(' + params.rotatedeg + 'deg)';
                    }

                    if (params.shape) {
                        if (params.shape === 'round') {
                            var round_style = defaultSettings.radius + _style;
                            if (scope.data.indexOf('http') > -1 || scope.data.indexOf('data:image') > -1) {
                                var img_size = 'width:' + params.width + 'px;height:' + params.height + 'px;';
                                component = "<img src=" + scope.data + " style='" + img_size + round_style + "'  />";
                            } else {
                                component = "<img src=" + base + svgHtml + " style='" + round_style + "' title='" + scope.data + "' />";
                            }
                        }
                    } else {
                        if (scope.data.indexOf('http') > -1 || scope.data.indexOf('data:image') > -1) {
                            var img_size = 'width:' + params.width + 'px;height:' + params.height + 'px;';
                            component = "<img src=" + scope.data + " style='" + img_size + _style + "'  />";
                        } else {
                            component = "<img src=" + base + svgHtml + " style='" + _style + "' title='" + scope.data + "' />";
                        }
                    }

                    if (params.dynamic === 'true') {
                        element.empty();
                        element.append(component);
                    } else {
                        element.replaceWith(component);
                    }
                }
            }
        };
    }]);
    /**
     * Get the random colors 
     * @returns {String}
     */
    function getRandomColors() {
        var letters = '0123456789ABCDEF'.split('');
        var _color = '#';
        for (var i = 0; i < 6; i++) {
            _color += letters[Math.floor(Math.random() * 16)];
        }
        return _color;
    }
    /**
     * get the first name and last name first letters and combined and form the letter avatar
     * @param {type} data
     * @returns {unresolved}
     */
    function getFirstAndLastName(data) {
        var names = data.split(" ");
        if (names && names.length >= 2) {
            var firstName = names[0];
            var lastName = names[1];
            if (firstName && lastName) {
                var text = firstName.substr(0, 1) + lastName.substr(0, 1);
                return text;
            } else {
                return data.substr(0, 2);
            }
        }
    }

    /**
     * Populate the svg tag which will used for the avatar generation
     * @param {type} width
     * @param {type} height
     * @param {type} color
     * @returns {unresolved}
     */
    function getImgTag(width, height, color) {

        var svgTag = angular.element('<svg></svg>')
                .attr({
                    'xmlns': 'http://www.w3.org/2000/svg',
                    'pointer-events': 'none',
                    'width': width,
                    'height': height
                })
                .css({
                    'background-color': color,
                    'width': width + 'px',
                    'height': height + 'px'
                });

        return svgTag;
    }

    /**
     *  Generate the Letter tag by using the svg text element
     * @param {type} character
     * @param {type} textColor
     * @param {type} fontFamily
     * @param {type} fontWeight
     * @param {type} fontsize
     * @returns {unresolved}
     */
    function getCharacterObject(character, textColor, fontFamily, fontWeight, fontsize) {
        var textTag = angular.element('<text text-anchor="middle"></text>')
                .attr({
                    'y': '50%',
                    'x': '50%',
                    'dy': '0.35em',
                    //'stroke': '#000000',
                    'pointer-events': 'auto',
                    'fill': textColor,
                    'font-family': fontFamily
                })
                .html(character)
                .css({
                    'font-weight': fontWeight,
                    'font-size': fontsize + 'px',
                });

        return textTag;
    }

}