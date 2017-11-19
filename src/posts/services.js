//angular.module('window.steem.services', [])
module.exports = function (app) {
  console.log('services.js');
	app.service('APIs', ['$http', '$rootScope', 'API_END_POINT', function ($http, $rootScope, API_END_POINT) {
		'use strict';
		return {
      getCurrencyRate: function(code_to, chain){
        return $http.get(API_END_POINT+"/api/currencyRate/"+code_to.toUpperCase()+"/"+chain);
      },
      saveSubscription: function(deviceid, username, subscription) {
        return $http.post(API_END_POINT+"/api/devices", {deviceid: deviceid, username: username, subscription: subscription, chain: $rootScope.$storage.chain});
      },
      updateSubscription: function(deviceid, username, subscription) {
        return $http.put(API_END_POINT+"/api/devices", {deviceid: deviceid, username: username, subscription: subscription, chain: $rootScope.$storage.chain});
      },
      updateToken: function(deviceid, newdev) {
        return $http.put(API_END_POINT+"/api/device/"+deviceid, {newdev: newdev, chain: $rootScope.$storage.chain});
      },
      deleteSubscription: function(deviceid) {
        return $http.delete(API_END_POINT+"/api/devices/"+deviceid);
      },
      getSubscriptions: function(deviceid) {
        return $http.get(API_END_POINT+"/api/devices/"+deviceid);
      },
			addBookmark: function(user, bookmark) {
        return $http.post(API_END_POINT+"/api/bookmark", {username: user, author: bookmark.author, permlink: bookmark.permlink, chain: $rootScope.$storage.chain});
      },
			getBookmarks: function(user) {
        return $http.get(API_END_POINT+"/api/bookmarks/"+user);
      },
			removeBookmark: function(id, user) {
        return $http.delete(API_END_POINT+"/api/bookmarks/"+user+"/"+id);
      },
			addDraft: function(user, draft) {
        return $http.post(API_END_POINT+"/api/draft", {username: user, title: draft.title, body: draft.body, tags: draft.tags, post_type: draft.post_type, chain: $rootScope.$storage.chain});
      },
			getDrafts: function(user) {
        return $http.get(API_END_POINT+"/api/drafts/"+user);
      },
			removeDraft: function(id, user) {
        return $http.delete(API_END_POINT+"/api/drafts/"+user+"/"+id);
      },
			removeImage: function(id, user) {
        return $http.delete(API_END_POINT+"/api/images/"+user+"/"+id);
      },
			fetchImages: function(user) {
        return $http.get(API_END_POINT+"/api/images/"+user);
      },
      searchEscrow: function(id) {
        return $http.get(API_END_POINT+"/api/escrow/"+$rootScope.$storage.chain+"/"+id);
      },
      schedulePost: function(user, post) {
        return $http.post(API_END_POINT+"/api/schedules", {username: user, category: post.category[0], title: post.title, permlink: post.permlink, json: post.json, tags: post.tags, body: post.body, post_type: post.post_type, upvote_this: post.upvote_this, schedule: post.schedule, chain: $rootScope.$storage.chain});
      },
      getSchedules: function(user) {
        return $http.get(API_END_POINT+"/api/schedules/"+user);
      },
      removeSchedule: function(id, user) {
        return $http.delete(API_END_POINT+"/api/schedules/"+user+"/"+id);
      },
      moveSchedule: function(id, user) {
        return $http.put(API_END_POINT+"/api/schedules/"+user+"/"+id);
      },
      getVotes: function(user) {
        return $http.get(API_END_POINT+"/api/votes/"+$rootScope.$storage.chain+"/"+user);
      },
      getMyVotes: function(user) {
        return $http.get(API_END_POINT+"/api/rvotes/"+$rootScope.$storage.chain+"/"+user);
      },
      getMyMentions: function(user) {
        return $http.get(API_END_POINT+"/api/mentions/"+$rootScope.$storage.chain+"/"+user);
      },
      getMyFollows: function(user) {
        return $http.get(API_END_POINT+"/api/follows/"+$rootScope.$storage.chain+"/"+user);
      },
      getMyReblogs: function(user) {
        return $http.get(API_END_POINT+"/api/reblogs/"+$rootScope.$storage.chain+"/"+user);
      },
      getLeaderboard: function() {
        return $http.get(API_END_POINT+"/api/leaderboard/"+$rootScope.$storage.chain);
      },
      getMyAchievements: function(user) {
        return $http.get(API_END_POINT+"/api/achievements/"+$rootScope.$storage.chain+"/"+user);
      },
      search: function(text) {
        return $http.get("https://api.asksteem.com/search?q="+text+"&include=meta&sort_by=created&order=desc");
      },
      sendMsg: function(user, msg, room) {
        return $http.post(API_END_POINT+"/api/messages", {sender: user, content: msg, room: room, chain: $rootScope.$storage.chain});
      },
      getMsg: function(user, room) {
        return $http.get(API_END_POINT+"/api/messages/"+room+"/"+user);
      },
      getRoom: function(user) {
        return $http.get(API_END_POINT+"/api/rooms/"+user);
      },
      addMyImage: function(user, url) {
        return $http.post(API_END_POINT+"/api/image", {username: user, image_url:url});
      },
      getNodes: function() {
        return $http.get("https://storage.googleapis.com/esteem/public_nodes.json",{headers:{'Cache-Control': 'no-cache'}});
      }
		};
	}])
  app.directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
  });
  app.directive('select', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        element.bind('focus', function(e) {
          if (window.cordova && window.cordova.plugins.Keyboard) {
            // $rootScope.log("show bar (hide = false)");
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
          }
        });
        element.bind('blur', function(e) {
          if (window.cordova && window.cordova.plugins.Keyboard) {
            // $rootScope.log("hide bar (hide = true)");
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          }
        });
      }
    };
  });

  app.directive("smartScroll", function() {
    return {
      restrict: 'E',
      scope: {
        to: '=',
        length: '@'
      },
      template: `
                <div style="overflow:auto;width:15px">
                  <div></div>
                </div>
            `,
      link: function(scope, element, attrs) {
        //set height of root div
        var root = angular.element(element.find('div')[0]);
        root.css('height', attrs.height);

        scope.$watch('length', function() {
          //when array.length is changed we will change height of inner div 
          //to correct scrolling presentation of parent div accordingly
          var height = (scope.length - attrs.limit) * attrs.sens + attrs.height * 1;
          angular.element(element.find('div')[1]).css('height', height);

          //if we won't need scrolling anymore, we can hide it 
          //and shift scrolling to initial top position
          if (scope.length <= attrs.limit) {
            root[0].scrollTop = 0;
            root.css('display', 'none');
            scope.to = 0;
          } else
            root.css('display', 'block');
        });

        //when we perform scrolling, we should correct "to" argument accordingly
        root.on('scroll', function(event) {
          var scrolled = root[0].scrollTop;
          scope.$apply(function() {
            scope.to = scrolled / attrs.sens;
          });
        });
      }
    };
  });

  app.directive('onFinishRender', function ($timeout) {
      return {
          restrict: 'A',
          link: function (scope, element, attr) {
              if (scope.$last === true) {
                  $timeout(function () {
                      scope.$emit('ngRepeatFinished');
                  });
              }
          }
      }
  })
  app.directive('clickHandler', function($timeout){
      return{
          restrict: 'A',
          link: function($scope, $element,$attr){
              $timeout(function(){
                      $element.on('tap', function(){
                        //the function you want to perform on tap
        alert("Just been Clicked");
                      });
              });
          }
      };
  })
  
  app.directive('fastRepeat', ['$compile', '$parse', '$animate', function ($compile, $parse, $animate) {
    'use strict';
    var $ = angular.element;

    var fastRepeatId = 0,
        showProfilingInfo = false,
        isGteAngular14 = /^(\d+\.\d+)\./.exec(angular.version.full)[1] > 1.3;

    // JSON.stringify replacer function which removes any keys that start with $$.
    // This prevents unnecessary updates when we watch a JSON stringified value.
    function JSONStripper(key, value) {
        if(key.slice && key.slice(0,2) == '$$') { return undefined; }
        return value;
    }

    function getTime() { // For profiling
        if(window.performance && window.performance.now) { return window.performance.now(); }
        else { return (new Date()).getTime(); }
    }

    return {
        restrict: 'A',
        transclude: 'element',
        priority: 1000,
        compile: function(tElement, tAttrs) {
            return function link(listScope, element, attrs, ctrl, transclude) {
                var repeatParts = attrs.fastRepeat.split(' in ');
                var repeatListName = repeatParts[1], repeatVarName = repeatParts[0];
                var getter = $parse(repeatListName); // getter(scope) should be the value of the list.
                var disableOpts = $parse(attrs.fastRepeatDisableOpts)(listScope);
                var currentRowEls = {};
                var t;

                // The rowTpl will be digested once -- want to make sure it has valid data for the first wasted digest.  Default to first row or {} if no rows
                var scope = listScope.$new();
                scope[repeatVarName] = getter(scope)[0] || {};
                scope.fastRepeatStatic = true; scope.fastRepeatDynamic = false;


                // Transclude the contents of the fast repeat.
                // This function is called for every row. It reuses the rowTpl and scope for each row.
                var rowTpl = transclude(scope, function(rowTpl, scope) {
                    if (isGteAngular14) {
                        $animate.enabled(rowTpl, false);
                    } else {
                        $animate.enabled(false, rowTpl);
                    }
                });

                // Create an offscreen div for the template
                var tplContainer = $("<div/>");
                $('body').append(tplContainer);
                scope.$on('$destroy', function() {
                    tplContainer.remove();
                    rowTpl.remove();
                });
                tplContainer.css({position: 'absolute', top: '-100%'});
                var elParent = element.parents().filter(function() { return $(this).css('display') !== 'inline'; }).first();
                tplContainer.width(elParent.width());
                tplContainer.css({visibility: 'hidden'});

                tplContainer.append(rowTpl);

                var updateList = function(rowTpl, scope, forceUpdate) {
                    function render(item) {
                        scope[repeatVarName] = item;
                        scope.$digest();
                        rowTpl.attr('fast-repeat-id', item.$$fastRepeatId);
                        return rowTpl.clone();
                    }


                    var list = getter(scope);
                    // Generate ids if necessary and arrange in a hash map
                    var listByIds = {};
                    angular.forEach(list, function(item) {
                        if(!item.$$fastRepeatId) {
                            if(item.id) { item.$$fastRepeatId = item.id; }
                            else if(item._id) { item.$$fastRepeatId = item._id; }
                            else { item.$$fastRepeatId = ++fastRepeatId; }
                        }
                        listByIds[item.$$fastRepeatId] = item;
                    });

                    // Delete removed rows
                    angular.forEach(currentRowEls, function(row, id) {
                        if(!listByIds[id]) {
                            row.el.detach();
                        }
                    });
                    // Add/rearrange all rows
                    var previousEl = element;
                    angular.forEach(list, function(item) {
                        var id = item.$$fastRepeatId;
                        var row=currentRowEls[id];


                        if(row) {
                            // We've already seen this one
                            if((!row.compiled && (forceUpdate || !angular.equals(row.copy, item))) || (row.compiled && row.item!==item)) {
                                // This item has not been compiled and it apparently has changed -- need to rerender
                                var newEl = render(item);
                                row.el.replaceWith(newEl);
                                row.el = newEl;
                                row.copy = angular.copy(item);
                                row.compiled = false;
                                row.item = item;
                            }
                        } else {
                            // This must be a new node

                            if(!disableOpts) {
                                row = {
                                    copy: angular.copy(item),
                                    item: item,
                                    el: render(item)
                                };
                            } else {
                                // Optimizations are disabled
                                row = {
                                    copy: angular.copy(item),
                                    item: item,
                                    el: $('<div/>'),
                                    compiled: true
                                };

                                renderUnoptimized(item, function(newEl) {
                                    row.el.replaceWith(newEl);
                                    row.el=newEl;
                                });
                            }

                            currentRowEls[id] =  row;
                        }
                        previousEl.after(row.el.last());
                        previousEl = row.el.last();
                    });

                };


                // Here is the main watch. Testing has shown that watching the stringified list can
                // save roughly 500ms per digest in certain cases.
                // JSONStripper is used to remove the $$fastRepeatId that we attach to the objects.
                var busy=false;
                listScope.$watch(function(scp){ return JSON.stringify(getter(scp), JSONStripper); }, function(list) {
                    tplContainer.width(elParent.width());

                    if(busy) { return; }
                    busy=true;

                    if (showProfilingInfo) {
                        t = getTime();
                    }

                    // Rendering is done in a postDigest so that we are outside of the main digest cycle.
                    // This allows us to digest the individual row scope repeatedly without major hackery.
                    listScope.$$postDigest(function() {
                        tplContainer.width(elParent.width());
                        scope.$digest();

                        updateList(rowTpl, scope);
                        if (showProfilingInfo) {
                            t = getTime() - t;
                            console.log("Total time: ", t, "ms");
                            console.log("time per row: ", t/list.length);
                        }
                        busy=false;
                    });
                }, false);

                function renderRows() {
                    listScope.$$postDigest(function() {
                        tplContainer.width(elParent.width());
                        scope.$digest();
                        updateList(rowTpl, scope, true);
                    });
                }
                if(attrs.fastRepeatWatch) {
                    listScope.$watch(attrs.fastRepeatWatch, renderRows, true);
                }
                listScope.$on('fastRepeatForceRedraw', renderRows);

                function renderUnoptimized(item, cb) {
                    var newScope = scope.$new(false);

                    newScope[repeatVarName] = item;
                    newScope.fastRepeatStatic = false; newScope.fastRepeatDynamic = true;
                    var clone = transclude(newScope, function(clone) {
                        tplContainer.append(clone);
                    });

                    newScope.$$postDigest(function() {
                        cb(clone);
                    });

                    newScope.$digest();

                    return newScope;
                }

                var parentClickHandler = function parentClickHandler(evt) {
                    var $target = $(this);
                    if($target.parents().filter('[fast-repeat-id]').length) {
                        return; // This event wasn't meant for us
                    }
                    evt.stopPropagation();

                    var rowId = $target.attr('fast-repeat-id');
                    var item = currentRowEls[rowId].item;


                    // Find index of clicked dom element in list of all children element of the row.
                    // -1 would indicate the row itself was clicked.
                    var elIndex = $target.find('*').index(evt.target);
                    var newScope = renderUnoptimized(item, function(clone) {
                        $target.replaceWith(clone);

                        currentRowEls[rowId] = {
                            compiled: true,
                            el: clone,
                            item: item
                        };

                        setTimeout(function() {
                            if(elIndex >= 0) {
                                clone.find('*').eq(elIndex).trigger('click');
                            } else {
                                clone.trigger('click');
                            }
                        }, 0);
                    });

                    newScope.$digest();
                };


                element.parent().on('click', '[fast-repeat-id]',parentClickHandler);
                
                // Handle resizes
                //
                var onResize = function() {
                    tplContainer.width(elParent.width());
                };

                var jqWindow = $(window);
                jqWindow.on('resize', onResize);
                scope.$on('$destroy', function() { 
                    jqWindow.off('resize', onResize);
                    element.parent().off('click', '[fast-repeat-id]', parentClickHandler);
                });
            };
        },
    };
  }])
  app.filter('capitalize', function() {
      return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
      }
  });

  app.filter('catchimage', function(){
    return function(inp) {
      var rege = /\b(https?:\/\/\S*?\.(?:png|jpe?g|gif)(?:\?(?:(?:(?:[\w_-]+=[\w_-]+)(?:&[\w_-]+=[\w_-]+)*)|(?:[\w_-]+)))?)\b/igm;
      var regg = /((?:https?\:\/\/)(?:[a-zA-Z]{1}(?:[\w\-]+\.)+(?:[\w]{2,5}))(?:\:[\d]{1,5})?\/(?:[^\s\/]+\/)*(?:[^\s]+\.(?:jpe?g|gif|png))(?:\?\w+=\w+(?:&\w+=\w+)*)?)/gim;

      if ((typeof inp.json_metadata !== 'string' || !inp.json_metadata instanceof String) && inp.json_metadata) {
        return inp.json_metadata.image[0];
      }

      var x1 = inp.json_metadata.split('"image":');
      
      if (x1 && x1.length>1){
        return x1[1].split('"')[1];
      } else {
        return "";
      }
      /*var match = rege.exec(inp.json_metadata);
      
      if (match && match.length>0)
        return match[0];
      else 
        return undefined;
      */
    }
  });
	app.filter('timeago', function($filter, $translate, $rootScope) {

      function TimeAgo(input, p_allowFuture) {
        var substitute = function (stringOrFunction, number, strings) {
            var string = angular.isFunction(stringOrFunction) ? stringOrFunction(number, dateDifference) : stringOrFunction;
            var value = (strings.numbers && strings.numbers[number]) || number;
            return string.replace(/%d/i, value);
        }
        if (input) {
          var nowTime = (new Date()).getTime();
          var date = (input && input.indexOf('Z')===-1)?(new Date(input+".000Z")).getTime():(new Date(input)).getTime();
          //refreshMillis= 6e4, //A minute

          // get difference between UTC and local time in milliseconds
          
          //var timeZoneOffset = (new Date().getTimezoneOffset()) * 60000;
          
          // convert local to UTC
          //console.log(timeZoneOffset);

          /*if (timeZoneOffset != 0) {
            nowTime = nowTime + timeZoneOffset;
          }*/

          var allowFuture = p_allowFuture || false,
          strings= {
              prefixAgo: '',
              prefixFromNow: '',
              suffixAgo: $filter('translate')('AGO'),
              suffixFromNow: $filter('translate')('FROM_NOW'),
              seconds: $filter('translate')('SECS'),
              minute: $filter('translate')('A_MIN'),
              minutes: "%d "+$filter('translate')('MINS'),
              hour: $filter('translate')('AN_HOUR'),
              hours: "%d "+$filter('translate')('HOURS'),
              day: $filter('translate')('A_DAY'),
              days: "%d "+$filter('translate')('DAYS'),
              month: $filter('translate')('A_MONTH'),
              months: "%d "+$filter('translate')('MONTHS'),
              year: $filter('translate')('A_YEAR'),
              years: "%d "+$filter('translate')('YEARS')
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
          
          //console.log(timeZoneOffset);

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
          //$rootScope.log(prefix+words+suffix+separator);
          prefix.replace(/ /g, '')
          words.replace(/ /g, '')
          suffix.replace(/ /g, '')

          return (prefix+' '+words+' '+suffix+' '+separator);
        }
      };

      TimeAgo.$stateful = true;
      return TimeAgo;
    });

    app.filter('parseUrl', function($sce, $rootScope) {
	    //var urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
	    //var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
      //var imgs = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
      var img = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/gim;
      var imgd = /src=\"([^\"]*)\"/gim;

  		//var youtube = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  		//var youtubeid = /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/))([A-Za-z0-9\_\-]+)/i;

      var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      var imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
      
      var vimeoRegex = /(?:http:\/\/)?(?:www\.)?(?:vimeo\.com)\/(.+)/g;

	    return function(textu, subpart) {
        var options = {
        	gfm: true,
			    tables: true,
          smartLists: true,
			    breaks: true,
			    pedantic: false,
			    sanitize: false,
			    smartLists: true,
			    smartypants: false
			  };
        if (textu.body || textu.comment) {
          var s = textu.body||textu.comment;
          var md = new window.remarkable({ html: true, linkify: false, breaks: true });
          var texts = "";
          
          texts = marked(s, options);
          
          //texts = md.render(s)
          //image links to html
          //texts = texts.replace(imgRegex, '<img check-image src="$1" class="postimg" />');
          //texts = transformYoutubeLinks(texts);
          //texts = transformVimeoLinks(texts);
          //texts = transformInternalLinks(texts);
          


          if (!$rootScope.$storage.download) {
            texts = texts.replace(imgd, 'src="img/isimage.png" onclick="this.src=\'$1\'"');  
          }
          if (textu.json_metadata && textu.json_metadata.tags && textu.json_metadata.tags.indexOf('nsfw')>-1 && !$rootScope.$storage.nsfw) {
            texts = texts.replace(img, 'img/nsfwimage.png');  
          }
          //console.log('after '+texts);

          var regex = /<a href="((?!#\/app\/)[\S]+)"/g;
          texts = texts.replace(regex, "<a href onClick=\"window.open('$1', '_system', 'location=yes');return false;\"");
          //return $sce.trustAsHtml(newString);


          if (subpart) {
            var s = $sce.trustAsHtml(texts).toString();
            var text = s.substring(s.indexOf("<p>"), s.indexOf("</p>"));
            return text;
          } else {
            return $sce.trustAsHtml(texts);
          }
        }
	    };
	});

    app.filter('downvote', function($sce, $rootScope) {
      
      return function(content) {
        //console.log(content);
        if (content.net_rshares < 0) {
          content.body = "This post was hidden due to low ratings.";
        }
        return content;
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
              var _len = murls.length;
                for (var i = 0; i < _len; i++) {
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
              var _len = musers.length;
                for (var i = 0; i < _len; i++) {
                    musers[i] = musers[i].trim().substring(1);
                }
                if (musers) {
                    angular.merge(out, {users: musers});
                }
            }
            return out;
        };
    });

    app.filter('metadataUsers', function($sce) {
        var users = /(^|\s)(@[a-z][-\.a-z\d]+[a-z\d])/gim;
        return function(textu) {
          if (textu) {
            var out = {};
            var musers = textu.match(users);

            $rootScope.log(angular.toJson(musers));

            return textu;
          }
        };
    });

    app.filter('ldots', function() {
        return function(text) {
          if (text) {
            return text+'...';
          }
        };
    });

    app.filter('regex', function($rootScope) {
      return function(input, field, regex) {
        if ($rootScope.$storage.chain == 'golos') {
          return input;
        } else {
            var patt = new RegExp(regex);      
            var out = [];
            for (var i = 0; i < input.length; i++){
              //console.log(patt.test(input[i][field]));
              if(!patt.test(input[i][field]))
                out.push(input[i]);
            }      
          return out;
        }
      };
    });
    
    app.filter('detransliterate', function(){
      // copypaste from https://gist.github.com/tamr/5fb00a1c6214f5cab4f6
      // (it have been modified: ий > iy and so on)
      // this have been done beecause we cannot use special symbols in url (`` and '')
      // and url seems to be the only source of thruth
      var d = /\s+/g,
      //rus = "щ  ш ч ц ю ю я я  ые ий  ё ё ж ъ э ы а б в г д е з и й к л м н о п р с т у ф х х   ь".split(d),
      //eng = "sch  sh  ch  cz  yu  ju  ya  q  yie  iy  yo  jo  zh  w ye  y a b v g d e z i yi  k l m n o p r s t u f x h j".split(d);

      rus = "щ    ш  ч  ц  й  ё  э  ю  я  х  ж  а б в г д е з и к л м н о п р с т у ф ъ  ы ь".split(d),
      eng = "shch sh ch cz ij yo ye yu ya kh zh a b v g d e z i k l m n o p r s t u f xx y x".split(d);
      return function (str, reverse) {
        if (!str) return str;
        if (!reverse && str.toString().substring(0, 4) !== 'ru--') return str;
        if (!reverse) str = str.substring(4)

        // TODO rework this
        // (didnt placed this earlier because something is breaking and i am too lazy to figure it out ;( )
        if(!reverse) {
        //    str = str.replace(/j/g, 'ь')
        //    str = str.replace(/w/g, 'ъ')
            str = str.replace(/yie/g, 'ые')
        }
        else {
        //    str = str.replace(/ь/g, 'j')
        //    str = str.replace(/ъ/g, 'w')
            str = str.replace(/ые/g, 'yie')
        }

        var i,
            s = /[^[\]]+(?=])/g, orig = str.match(s),
            t = /<(.|\n)*?>/g, tags = str.match(t);

        if(reverse) {
            for(i = 0; i < rus.length; ++i) {
                str = str.split(rus[i]).join(eng[i]);
                str = str.split(rus[i].toUpperCase()).join(eng[i].toUpperCase());
            }
        }
        else {
            for(i = 0; i < rus.length; ++i) {
                str = str.split(eng[i]).join(rus[i]);
                str = str.split(eng[i].toUpperCase()).join(rus[i].toUpperCase());
            }
        }

        if(orig) {
            var restoreOrig = str.match(s);

            for (i = 0; i < restoreOrig.length; ++i)
                str = str.replace(restoreOrig[i], orig[i]);
        }

        if(tags) {
            var restoreTags = str.match(t);

            for (i = 0; i < restoreTags.length; ++i)
                str = str.replace(restoreTags[i], tags[i]);

            str = str.replace(/\[/g, '').replace(/\]/g, '');
        }

        return str;
      }
    })
     app.filter('getCurrencySymbol', function($filter) {
        return function(text) {
          if (text) {
            //console.log(text.split('-')[1]);
            //var x = text.split('-')[1];
            //var tt = $filter('uppercase')(x);
            var textu = window.getSymbol(text);
            return textu=="?"?text:textu;
          }
        };
    });

  function ansiWordBound(c) {
    return (
      (' ' === c) ||
      ('\n' === c) ||
      ('\r' === c) ||
      ('\t' === c)
    )
  }

  function readingTime(text, options) {
    var words = 0, start = 0, end = text.length - 1, wordBound, i

    options = options || {}

    // use default values if necessary
    options.wordsPerMinute = options.wordsPerMinute || 200

    // use provided function if available
    wordBound = options.wordBound || ansiWordBound

    // fetch bounds
    while (wordBound(text[start])) start++
    while (wordBound(text[end])) end--

    // calculate the number of words
    for (i = start; i <= end;) {
      for (; i <= end && !wordBound(text[i]); i++) ;
      words++
      for (; i <= end && wordBound(text[i]); i++) ;
    }

    // reading time stats
    var minutes = words / options.wordsPerMinute
    var time = 0//minutes * 60 * 1000
    var displayed = 0//Math.ceil(minutes.toFixed(2))

    return {
      text: displayed + ' min read',
      minutes: Math.ceil(minutes.toFixed(2)),
      time: time,
      words: words
    }
  }

  app.filter('readingtime', function($sce, $rootScope) {
      return function(text) {
        if (text) {
          return readingTime(text).minutes;
        }
      };
  })

	app.filter('sp', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.split(" ")[0])/1e6*$rootScope.$storage.steem_per_mvests).toFixed(3);
	    	}
	    };
	})
	app.filter('sd', function($sce, $rootScope) {
	    return function(text, balance, sbd) {
	    	if (text) {
	    		return ((Number(text.split(" ")[0])/1e6*$rootScope.$storage.steem_per_mvests*$rootScope.$storage.base + Number(balance.split(" ")[0])*$rootScope.$storage.base + Number(sbd.split(" ")[0])).toFixed(3))*$rootScope.$storage.currencyRate;
	    	}
	    };
	})
	app.filter('sbd', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.split(" ")[0]).toFixed(3));
	    	}
	    };
	})
	app.filter('st', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.split(" ")[0]).toFixed(3));
	    	}
	    };
	})
	app.filter('reputation', function(){
		return function(value, bool) {
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

			return bool?reputation_level:Math.floor(reputation_level);
		}
	})

  app.filter("sumPostTotal", function($rootScope){
    function SumPostTotal(value, rate) {
      //console.log(value, rate);
      if (value && value.pending_payout_value && value.last_payout=="1970-01-01T00:00:00") {

        //value.total_payout_value.split(" ")[0])+parseFloat(value.total_pending_payout_value.split(" ")[0])
        //return (parseFloat(value.pending_payout_value.split(" ")[0])*rate);
        return value.total_payout_value?((parseFloat(value.total_payout_value.split(" ")[0]))+(parseFloat(value.pending_payout_value.split(" ")[0]))*rate).toFixed(2):0;
      } else {
        return value.total_payout_value?((parseFloat(value.total_payout_value.split(" ")[0]))+(parseFloat(value.curator_payout_value.split(" ")[0]))*rate).toFixed(2):0;
      }
    }
    //SumPostTotal.$stateful = true;

    return SumPostTotal;
  });

  app.filter("rate", function($rootScope){
    return function(value) {
      if (value) {
        return (parseFloat(value)*$rootScope.$storage.currencyRate);
      }
    }
  });  

  app.filter('hrefToJS', function ($sce, $sanitize) {
      return function (text) {
          var regex = /<a href="((?!#\/app\/)[\S]+)"/g;
          var newString = $sanitize(text).replace(regex, "<a href onClick=\"window.open('$1', '_system', 'location=yes');return false;\"");
          return $sce.trustAsHtml(newString);
      }
  });

  app.directive('autofocus', ['$timeout',
    function ($timeout) {
      return {
        restrict: 'A',
        link: function ($scope, $element) {
          $timeout(function () {
            $element[0].focus();
          });
        }
      };
    }]);

  app.directive(
      "bnLogDomCreation",
      function() {
          // I link the DOM element to the view model.
          function link( $scope, element, attributes ) {
              console.log(
                  "Link Executed:",
                  $scope.ds.permlink,
                  $scope.ds
              );
          }
          // Return directive configuration.
          return({
              link: link,
              restrict: "A"
          });
      }
  );
  //virtual type of scrolling, only issue one way scrolling :/
  app.directive('itemList', function() {
    return {
      restrict: 'A',
      scope: {
        itemList: '='
      },
      link: function(scope, element, attrs) {
        var el = element[0];
        var emptySpace = angular.element('<div class="empty-space"></div>');
        element.append(emptySpace);

        // Keep a selection of previous elements so we can remove them
        // if the user scrolls far enough
        var prevElems = null;
        var prevHeight = 0;
        var nextElems = 0;
        var nextHeight = 0;

        // Options are defined above the directive to keep things modular
        var options = scope.itemList;

        // Keep track of how many rows we've rendered so we know where we left off
        var renderedRows = 0;

        var pendingLoad = false;

        // Add some API functions to let the calling scope interact
        // with the directive more effectively
        options.api = {
          refresh: refresh
        };

        element.on('scroll', checkScroll);

        // Perform the initial setup
        refresh();

        function refresh() {
          addRows();
          checkScroll();
        }

        // Adds any rows that haven't already been rendered. Note that the
        // directive does not process any removed items, so if that functionality
        // is needed you'll need to make changes to this directive
        function addRows() {
          nextElems = [];
          for (var i = renderedRows; i < options.items.length; i++) {
            var e = options.renderer(options.items[i]);
            nextElems.push(e[0])
            element.append(e);
            renderedRows++;
            pendingLoad = false;
          }
          nextElems = angular.element(nextElems);
          nextHeight = el.scrollHeight;

          // Do this for the first time to initialize
          if (!prevElems && nextElems.length) {
            prevElems = nextElems;
            prevHeight = nextHeight;
          }
        }

        function checkScroll() {
          // Only check if we need to load if there isn't already an async load pending
          if (!pendingLoad) {
            if ((el.scrollHeight - el.scrollTop - el.clientHeight) < options.threshold) {
              console.log('Loading new items!');
              pendingLoad = options.loadFn();

              // If we're not waiting for an async event, render the new rows
              if (!pendingLoad) {
                addRows();
              }
            }
          }
          // if we're past the remove threshld, remove all previous elements and replace 
          // lengthen the empty space div to fill the space they occupied
          if (options.removeThreshold && el.scrollTop > prevHeight + options.removeThreshold) {
            console.log('Removing previous elements');
            prevElems.remove();
            emptySpace.css('height', prevHeight + 'px');

            // Stage the next elements for removal
            prevElems = nextElems;
            prevHeight = nextHeight;
          }
        }
      }
    };
  });
  //works with same height items/ just like collection-repeat
  app.value('quickRepeatList', {});
  app.directive('quickNgRepeat',
  ['$parse', '$animate', '$rootScope', 'quickRepeatList', function($parse, $animate, $rootScope, quick_repeat_list) {
    var NG_REMOVED = '$$NG_REMOVED';
    var ngRepeatMinErr = 'err';
    var uid = ['0', '0', '0'];
    var list_id = window.list_id = (function(){
      var i = 0;
      return function(){
        return 'list_' + (++i);
      };
    }());

    function hashKey(obj) {
      var objType = typeof obj,
          key;

      if (objType == 'object' && obj !== null) {
        if (typeof (key = obj.$$hashKey) == 'function') {
          // must invoke on object to keep the right this
          key = obj.$$hashKey();
        } else if (key === undefined) {
          key = obj.$$hashKey = nextUid();
        }
      } else {
        key = obj;
      }

      return objType + ':' + key;
    };

    function isWindow(obj) {
      return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    };

    function nextUid() {
      var index = uid.length;
      var digit;

      while(index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit == 57 /*'9'*/) {
          uid[index] = 'A';
          return uid.join('');
        }
        if (digit == 90  /*'Z'*/) {
          uid[index] = '0';
        } else {
          uid[index] = String.fromCharCode(digit + 1);
          return uid.join('');
        }
      }
      uid.unshift('0');
      return uid.join('');
    };

    function isArrayLike(obj) {
      if (obj == null || isWindow(obj)) {
        return false;
      }

      var length = obj.length;

      if (obj.nodeType === 1 && length) {
        return true;
      }

      return angular.isArray(obj) || !angular.isFunction(obj) && (
        length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj
      );
    };


    return {
      transclude: 'element',
      priority: 1000,
      terminal: true,
      compile: function(element, attr, linker) {
        return function($scope, $element, $attr){
          var expression = $attr.quickNgRepeat;
          var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),
            trackByExp, trackByExpGetter, trackByIdFn, trackByIdArrayFn, trackByIdObjFn, lhs, rhs, valueIdentifier, keyIdentifier,
            hashFnLocals = {$id: hashKey};

          if (!match) {
            throw ngRepeatMinErr('iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",
              expression);
          }

          lhs = match[1];
          rhs = match[2];
          trackByExp = match[4];

          if (trackByExp) {
            trackByExpGetter = $parse(trackByExp);
            trackByIdFn = function(key, value, index) {
              // assign key, value, and $index to the locals so that they can be used in hash functions
              if (keyIdentifier) hashFnLocals[keyIdentifier] = key;
              hashFnLocals[valueIdentifier] = value;
              hashFnLocals.$index = index;
              return trackByExpGetter($scope, hashFnLocals);
            };
          } else {
            trackByIdArrayFn = function(key, value) {
              return hashKey(value);
            }
            trackByIdObjFn = function(key) {
              return key;
            }
          }

          match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
          if (!match) {
            throw ngRepeatMinErr('iidexp', "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.",
                                                                      lhs);
          }
          valueIdentifier = match[3] || match[1];
          keyIdentifier = match[2];

          // Store a list of elements from previous run. This is a hash where key is the item from the
          // iterator, and the value is objects with following properties.
          //   - scope: bound scope
          //   - element: previous element.
          //   - index: position
          var lastBlockMap = {};

          var list_name = $attr.quickRepeatList || list_id();

          //watch props
          $scope.$watch(rhs, quick_repeat_list[list_name] = function(collection){
            var index, length,
                previousNode = $element[0],     // current position of the node
                nextNode,
                // Same as lastBlockMap but it has the current state. It will become the
                // lastBlockMap on the next iteration.
                nextBlockMap = {},
                arrayLength,
                childScope,
                key, value, // key/value of iteration
                trackById,
                collectionKeys,
                block,       // last object information {scope, element, id}
                nextBlockOrder = [];


            if (isArrayLike(collection)) {
              collectionKeys = collection;
              trackByIdFn = trackByIdFn || trackByIdArrayFn;
            } else {
              trackByIdFn = trackByIdFn || trackByIdObjFn;
              // if object, extract keys, sort them and use to determine order of iteration over obj props
              collectionKeys = [];
              for (key in collection) {
                if (collection.hasOwnProperty(key) && key.charAt(0) != '$') {
                  collectionKeys.push(key);
                }
              }
              collectionKeys.sort();
            }

            arrayLength = collectionKeys.length;

            // locate existing items
            length = nextBlockOrder.length = collectionKeys.length;
            for(index = 0; index < length; index++) {
             key = (collection === collectionKeys) ? index : collectionKeys[index];
             value = collection[key];
             trackById = trackByIdFn(key, value, index);
             if(lastBlockMap.hasOwnProperty(trackById)) {
               block = lastBlockMap[trackById]
               delete lastBlockMap[trackById];
               nextBlockMap[trackById] = block;
               nextBlockOrder[index] = block;
             } else if (nextBlockMap.hasOwnProperty(trackById)) {
               // restore lastBlockMap
               angular.forEach(nextBlockOrder, function(block) {
                 if (block && block.startNode) lastBlockMap[block.id] = block;
               });
               // This is a duplicate and we need to throw an error
               throw ngRepeatMinErr('dupes', "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}", expression,       trackById);
             } else {
               // new never before seen block
               nextBlockOrder[index] = { id: trackById };
               nextBlockMap[trackById] = false;
             }
           }

            // remove existing items
            for (key in lastBlockMap) {
              if (lastBlockMap.hasOwnProperty(key)) {
                block = lastBlockMap[key];
                $animate.leave(block.elements);
                angular.forEach(block.elements, function(element) { element[NG_REMOVED] = true});
                block.scope.$destroy();
              }
            }

            // we are not using forEach for perf reasons (trying to avoid #call)
            for (index = 0, length = collectionKeys.length; index < length; index++) {
              key = (collection === collectionKeys) ? index : collectionKeys[index];
              value = collection[key];
              block = nextBlockOrder[index];

              if (block.startNode) {
                // if we have already seen this object, then we need to reuse the
                // associated scope/element
                childScope = block.scope;

                nextNode = previousNode;
                do {
                  nextNode = nextNode.nextSibling;
                } while(nextNode && nextNode[NG_REMOVED]);

                if (block.startNode == nextNode) {
                  // do nothing
                } else {
                  // existing item which got moved
                  $animate.move(block.elements, null, angular.element(previousNode));
                }
                previousNode = block.endNode;
              } else {
                // new item which we don't know about
                childScope = $scope.$new();
              }

              childScope[valueIdentifier] = value;
              if (keyIdentifier) childScope[keyIdentifier] = key;
              childScope.$index = index;
              childScope.$first = (index === 0);
              childScope.$last = (index === (arrayLength - 1));
              childScope.$middle = !(childScope.$first || childScope.$last);
              childScope.$odd = !(childScope.$even = index%2==0);

              if (!block.startNode) {
                linker(childScope, function(clone) {
                  $animate.enter(clone, null, angular.element(previousNode));
                  previousNode = clone;
                  block.scope = childScope;
                  block.startNode = clone[0];
                  block.elements = clone;
                  block.endNode = clone[clone.length - 1];
                  nextBlockMap[block.id] = block;
                });

                if ($rootScope.$$phase !== '$digest' && childScope.$$phase !== '$digest'){
                  childScope.$digest();
                }
              }
            }
            lastBlockMap = nextBlockMap;
          });
        };
      }
    };
  }]);
  app.directive('selectInput', ['$ionicPopup', '$rootScope', function($ionicPopup, $rootScope) {
    return {
      restric: 'E',
      scope: {
        currentInput: '=ngModel',
        selectOptions: '='
      },
      require: '?^ngModel',
      template: '<div class="item-input item-icon-right" style="width:100%;"><input ng-model="currentInput" type="text" ng-change="socketChange(currentInput)" ng-click="showOptions()"><i class="icon ion-android-arrow-dropdown" ng-click="showOptions()"></i></div>',
      link: function(scope, element, attrs) {
        scope.options = {
          selected: ''
        }
        scope.socketChange = function(xx){
          $rootScope.$storage["socket"+$rootScope.$storage.chain] = xx;
          localStorage.socketUrl = xx;
          scope.restart = true;
          scope.$emit('socketCheck');
        }
        scope.showOptions = function() {
          $ionicPopup.show({
            template: '<ion-radio ng-repeat="item in selectOptions" class="item-text-wrap" ng-model="options.selected" ng-value="item">{{item}}</ion-radio>',
            title: 'Server',
            cssClass: 'my-custom-popup',
            scope: scope,
            buttons: [{
              text: 'Cancel'
            }, {
              text: '<b>Confirm</b>',
              type: 'button-positive',
              onTap: function(e) {
                scope.currentInput = scope.options.selected;
                scope.socketChange(scope.currentInput);
              }
            }]
          });
        }
      }
    }
  }])
  app.directive('checkImage', function($http, $rootScope) {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {
              attrs.$observe('ngSrc', function(ngSrc) {
                if (ngSrc) {
                  $http.get(ngSrc).success(function(){
                      //alert('image exist');
                      //console.log(image exist)
                  }).error(function(){
                      //alert('image not exist');
                      if ($rootScope.chain && $rootScope.chain == 'steem') {
                        element.attr('src', ngSrc); // set default image  
                      } else if ($rootScope.chain && $rootScope.chain == 'golos') {
                        element.attr('src', 'https://imgp.golos.io/0x0/'+ngSrc); // set default image  
                      } else {
                        element.attr('src', 'img/noimage.png'); // set default image 
                      }
                  });
                }
              });
          }
      };
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
                        <div class="ion-comment--author"><img class="round-avatar" check-image ng-src="https://img.busy.org/@{{comment.author}}?s=100" onerror="this.src=\'img/user_profile.png\'" onabort="this.src=\'img/user_profile.png\'" /><b><a href="#/app/profile/{{::comment.author}}">{{::comment.author}}</a></b>&nbsp;<div class="reputation">{{::comment.author_reputation|reputation|number:0}}</div>&middot;{{::comment.created|timeago}}</div>\
                        <div class="ion-comment--score"><span on-tap="openTooltip($event,comment)"><b>{{::$root.$storage.currency|getCurrencySymbol}}</b> <span ng-if="comment.max_accepted_payout.split(\' \')[0] === \'0.000\'"><del>{{::comment | sumPostTotal:$root.$storage.currencyRate | number}}</del></span><span ng-if="comment.max_accepted_payout.split(\' \')[0] !== \'0.000\'">{{::comment | sumPostTotal:$root.$storage.currencyRate | number}}</span> </span> | <span on-tap="downvotePost(comment)"><span class="fa fa-flag" ng-class="{\'assertive\':comment.downvoted}"></span></span></div>\
                        <div class="ion-comment--text bodytext selectable" ng-if="comment.net_rshares>-1" ng-bind-html="comment | parseUrl "></div>\
                        <div class="ion-comment--text bodytext selectable" ng-if="comment.net_rshares<0">{{"HIDDEN_TEXT"|translate}}</div>\
                        <div class="ion-comment--replies"><ion-spinner ng-if="comment.invoting"></ion-spinner><span ng-click="upvotePost(comment)" ng-if="!comment.upvoted" on-hold="openSliderr($event, comment)"><span class="fa fa-md fa-chevron-circle-up" ng-class="{\'positive\':comment.upvoted}"></span> {{::"UPVOTE"|translate}}</span><span ng-click="unvotePost(comment)" ng-if="comment.upvoted" on-hold="openSliderr($event, comment)"><span class="fa fa-md fa-chevron-circle-up" ng-class="{\'positive\':comment.upvoted}"></span> {{::"UNVOTE_UPVOTED"|translate}}</span> | <span on-tap="$root.openInfo(comment)">{{comment.net_votes || 0}} {{"VOTES"|translate}}</span> | <span on-tap="toggleComment(comment)">{{comment.children || 0}} {{::"REPLIES"|translate}}</span> | <span on-tap="replyToComment(comment)"><span class="fa fa-reply"></span> {{"REPLY"|translate}}</span> <span ng-if="comment.author == $root.user.username && comment.cashout_time !== \'1969-12-31T23:59:59\'" on-tap="editComment(comment)"> | <span class="ion-ios-compose-outline"></span> {{::\'EDIT\'|translate}}</span> <span ng-if="comment.author == $root.user.username && comment.abs_rshares == 0" on-tap="deleteComment(comment)"> | <span class="ion-ios-trash-outline"></span> {{::\'REMOVE\'|translate}}</span> <span on-tap="comment.net_rshares=0" ng-if="comment.net_rshares<0"> | <span class="ion-ios-eye-outline"></span> {{::\'SHOW\'|translate}}</span></div>\
                    </ion-item>',
            controller: function($scope, $rootScope, $state, $ionicModal, $ionicPopover, $ionicPopup, $ionicActionSheet, $cordovaCamera, $filter, ImageUploadService, APIs) {
                  $ionicPopover.fromTemplateUrl('popoverTr.html', {
                      scope: $scope
                   }).then(function(popover) {
                      $scope.tooltip = popover;
                   });
                  
                  $ionicPopover.fromTemplateUrl('popoverSliderr.html', {
                      scope: $scope
                  }).then(function(popover) {
                      $scope.tooltipSliderr = popover;
                  });

                  $scope.openSliderr = function($event, d) {
                    $scope.votingPost = d;
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
                    if (!$scope.$$phase) {
                      $scope.$apply();
                    }
                    if (!$rootScope.$$phase) {
                      $rootScope.$apply();
                    }
                  };

                  $scope.closeSliderr = function() {
                    $scope.tooltipSliderr.hide();
                  };

                  $scope.openTooltip = function($event, d) {
                    var tppv = Number(d.pending_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
                    var p = Number(d.promoted.split(' ')[0])*$rootScope.$storage.currencyRate;
                    var tpv = Number(d.total_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
                    var ar = Number(d.total_payout_value.split(' ')[0]-d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
                    var crp = Number(d.curator_payout_value.split(' ')[0])*$rootScope.$storage.currencyRate;
                    var texth = "<div class='row'><div class='col'><b>"+$filter('translate')('POTENTIAL_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tppv, 3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAST_PAYOUT')+"</b></div><div class='col'>"+$filter('getCurrencySymbol')($rootScope.$storage.currency)+$filter('number')(tpv,3)+"</div></div><div class='row'><div class='col'><b>"+$filter('translate')('PAYOUT')+"</b></div><div class='col'>"+$filter('timeago')(d.cashout_time, true)+"</div></div>";
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
                  };
                  $scope.toggleComment = function(comment) {
                      $rootScope.log('toggleComment '+comment.showChildren);

                      if (comment.showChildren) {
                        comment.showChildren = false;
                      } else {
                        console.log(comment.author, comment.permlink);
                        comment.showChildren = true;
                        if (comment.depth % 5 == 0) {
                          console.log('depth5');
                          $rootScope.$broadcast('openComments', { data: comment });
                        } else {
                          window.steem.api.getStateAsync('tag/@'+comment.author+'/'+comment.permlink, function(err, dd) {
                            //console.log(dd);
                            var po = [];

                            angular.forEach(dd.content, function(v,k){
                              if (v.parent_author==comment.author && v.parent_permlink == comment.permlink) {
                                var len = v.active_votes.length;
                                if ($rootScope.user) {
                                  for (var j = len - 1; j >= 0; j--) {
                                    if (v.active_votes[j].voter === $rootScope.user.username) {
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
                                po.push(v);
                              }
                            });
                            
                            /*angular.forEach(dd.accounts, function(v,k){
                              //console.log(k);
                              if ($rootScope.postAccounts && $rootScope.postAccounts.indexOf(k) == -1) {
                                $rootScope.postAccounts.push(k);
                              }

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
                            });*/
                            
                            comment.comments = po;
                            comment.showChildren = true;
                            $rootScope.fetching = false;

                            $scope.$applyAsync();
                          });
                          /*window.steem.api.getContentReplies(comment.author, comment.permlink, function(err, dd) {
                            //console.log(err, dd);
                            comment.comments = dd;

                            for (var i = 0, len = dd.length; i < len; i++) {
                              var v = dd[i];
                              if ($rootScope.postAccounts.indexOf(v.author) == -1) {
                                $rootScope.postAccounts.push(v.author);
                              }  
                            }
                            setTimeout(function() {
                              $scope.$emit('postAccounts');
                            }, 10);

                            if (!$scope.$$phase){
                              $scope.$apply();
                            }
                            if (!$rootScope.$$phase){
                              $rootScope.$apply();
                            }
                            comment.showChildren = true;
                            //console.log(comment);
                          });*/
                        }
                      }
                        //$rootScope.$broadcast('update:content');
                    //$rootScope.$broadcast('hide:loading');
                  };
                  /*$scope.$on('postAccounts', function(){
                    window.steem.api.getAccountsAsync($rootScope.postAccounts, function(err, res){
                        //console.log(err, res);
                        for (var i = 0, len = res.length; i < len; i++) {
                        var v = res[i];
                        if (typeof v.json_metadata === 'string' || v.json_metadata instanceof String) {
                          if (v.json_metadata) {
                            if (v.json_metadata.indexOf("created_at")>-1) {
                              v.json_metadata = angular.fromJson(angular.toJson(v.json_metadata));  
                            } else {
                              v.json_metadata = angular.fromJson(v.json_metadata);
                            }
                            var key = v.name;
                            $rootScope.paccounts[key] = v.json_metadata;
                          }
                        }
                      }
                      $scope.$applyAsync();
                    });
                  });*/
                  $scope.upvotePost = function(post) {
                    $rootScope.votePost(post, 'upvote', 'update:content');
                  };

                  $scope.downvotePost = function(post) {
                    var confirmPopup = $ionicPopup.confirm({
                      title: $filter('translate')('ARE_YOU_SURE'),
                      template: $filter('translate')('DOWNVOTE_FLAG')
                    });
                    confirmPopup.then(function(res) {
                      if(res) {
                        $rootScope.log('You are sure');
                        $rootScope.votePost(post, 'downvote', 'update:content');
                      } else {
                        $rootScope.log('You are not sure');
                      }
                    });
                  };

                  $scope.unvotePost = function(post) {
                    $rootScope.votePost(post, 'unvote', 'update:content');
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
                        $scope.editc = false;
                        $scope.edit = false;
                        $scope.data.comment = '';
                        $scope.openModal();
                    } else {
                        $scope.editc = true;
                        $scope.edit = true;
                        $scope.data.comment = $scope.post.body;
                        $scope.patchbody = $scope.post.body;
                        $scope.openModal();
                    }
                  };
                  $scope.hideKeyboard = function(){
                    setTimeout(function () {
                        if (window.cordova && window.cordova.plugins.Keyboard) {
                          if(cordova.plugins.Keyboard.isVisible){
                              window.cordova.plugins.Keyboard.close();
                          } else {
                              window.cordova.plugins.Keyboard.show();
                          }
                        }
                    }, 100);
                  }
                  $scope.showImg = function() {
                   var hideSheet = $ionicActionSheet.show({
                     buttons: [
                       { text: $filter('translate')('CAPTURE_PICTURE') },
                       { text: $filter('translate')('SELECT_PICTURE') },
                       { text: $filter('translate')('SET_CUSTOM_URL') },
                     ],
                     titleText: $filter('translate')('INSERT_PICTURE'),
                     cancelText: $filter('translate')('CANCEL'),
                     cancel: function() {
                        // add cancel code..
                      },
                     buttonClicked: function(index) {
                        $scope.insertImageC(index);
                        return true;
                     }
                   });
                  };
                  $scope.insertText = function(text) {
                    //console.log(text);
                    var input = $scope.lastFocused;
                    //console.log(input);
                    input.focus();
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
                    //input.focus();
                    input.scrollTop = scrollPos;
                    //console.log(angular.element(input).val());
                    angular.element(input).trigger('input');
                  }
                  $scope.insertImageC = function(type) {
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
                            var url = result.url || '';
                            var final = " ![image](" + url + ")";
                            $rootScope.log(final);
                            if ($scope.data.comment) {
                              $scope.data.comment += final;
                            } else {
                              $scope.data.comment = final;
                            }
                            if (!ionic.Platform.isAndroid() || !ionic.Platform.isWindowsPhone()) {
                              $cordovaCamera.cleanup();
                            }
                            if (url) {
                              APIs.addMyImage($rootScope.user.username, url).then(function(res){
                                if (res)
                                  console.log('saved image to db');
                              });
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
                    } else {
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
                          if ($scope.data.comment) {
                            $scope.data.comment += final;
                          } else {
                            $scope.data.comment = final;
                          }
                        }
                      });
                    }
                  };

                  var dmp = new window.diff_match_patch();
                  function createPatch(text1, text2) {
                      if (!text1 && text1 === '') return undefined;
                      var patches = dmp.patch_make(text1, text2);
                      var patch = dmp.patch_toText(patches);
                      return patch;
                  }
                  function makernd() {
                    return (Math.random()+1).toString(16).substring(2);
                  }
                  $scope.reply = function (xx) {
                    
                    var wif = $rootScope.user.password
                    ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
                    : $rootScope.user.privatePostingKey;

                    if (!$scope.editc) {
                        $rootScope.$broadcast('show:loading');
                        if ($rootScope.user) {

                          var t = new Date();
                          var timeformat = t.getFullYear().toString()+(t.getMonth()+1).toString()+t.getDate().toString()+"t"+t.getHours().toString()+t.getMinutes().toString()+t.getSeconds().toString()+t.getMilliseconds().toString()+"z";
                          console.log($scope.post.json_metadata);
                          var json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || ["esteem"], app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' };                              
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
                              extensions: $rootScope.$storage.chain == 'golos'?[]:[[0, { "beneficiaries": [{ "account":"esteemapp", "weight":500 }] }]]
                            }]
                            ];
                          
                          window.steem.broadcast.send({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
                            //console.log(err, result);
                            $scope.replying = false;
                            if (err) {
                              var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                              $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message);
                            } else {
                              $scope.closeModal();
                              $scope.replying = false;
                              $scope.cmodal.hide();
                              $scope.data.comment = "";
                              setTimeout(function() {
                              //$scope.$evalAsync(function( $scope ) {
                                $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
                                //$rootScope.$broadcast('hide:loading');
                                $rootScope.$emit("update:content");  
                                $rootScope.$broadcast('hide:loading');
                              //});
                              }, 1);
                            }
                            $rootScope.$broadcast('hide:loading');
                          });
                        } else {
                          $rootScope.$broadcast('hide:loading');
                          $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
                        }
                    } else {

                        var patch = createPatch($scope.patchbody, $scope.data.comment)
                        // Putting body into buffer will expand Unicode characters into their true length
                        if (patch && patch.length < new Buffer($scope.data.comment, 'utf-8').length) {
                          $scope.data.comment2 = patch;
                          //$rootScope.log(patch);
                        }
                        $rootScope.$broadcast('show:loading');
                        if ($rootScope.user) {
                          var operations_array = [];
                          var json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || ["esteem"], app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html', community: 'esteem' };
                          operations_array = [
                            ['comment', {
                              parent_author: $scope.post.parent_author,
                              parent_permlink: $scope.post.parent_permlink,
                              author: $scope.post.author,
                              permlink: $scope.post.permlink,
                              title: "",
                              body: $scope.data.comment2 || $scope.data.comment,
                              json_metadata: $scope.post.json_metadata
                            }]
                            ];
                          
                          window.steem.broadcast.send({ operations: operations_array, extensions: [] }, { posting: wif }, function(err, result) {
                            //console.log(err, result);
                            $scope.replying = false;
                            if (err) {
                              var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
                              } else {
                                $scope.closeModal();
                                $scope.replying = false;
                                $scope.cmodal.hide();
                                $scope.data.comment = "";
                                setTimeout(function() {
                                //$scope.$evalAsync(function( $scope ) {
                                  $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
                                  $rootScope.$broadcast('hide:loading');
                                  $rootScope.$emit("update:content");  
                                //});
                                }, 1);
                              }
                              $rootScope.$broadcast('hide:loading');
                          });
                        } else {
                          $rootScope.$broadcast('hide:loading');
                          $rootScope.showAlert($filter('translate')('WARNING'), $filter('translate')('LOGIN_TO_X'));
                        }
                    }
                  $rootScope.$broadcast('hide:loading');
                }
                $scope.replyToComment = function(comment) {
                    $rootScope.log('reply to comment')
                    //$rootScope.$storage.sitem = comment;
                    $scope.isreplying(comment, true);
                }
                $scope.editComment = function(comment) {
                    $rootScope.log('edit to comment')
                    //$rootScope.$storage.sitem = comment;
                    $scope.isreplying(comment, false);
                }
                $scope.deleteComment = function(comment) {
                    $rootScope.log('delete to comment '+ angular.toJson(comment));
                    var confirmPopup = $ionicPopup.confirm({
                        title: $filter('translate')('ARE_YOU_SURE'),
                        template: $filter('translate')('DELETE_COMMENT')
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            $rootScope.log('You are sure');
                            $rootScope.$broadcast('show:loading');
                            if ($rootScope.user) {

                              var wif = $rootScope.user.password
                              ? window.steem.auth.toWif($rootScope.user.username, $rootScope.user.password, 'posting')
                              : $rootScope.user.privatePostingKey;

                              window.steem.broadcast.deleteComment(wif, comment.author, comment.permlink, function(err, result) {
                                //console.log(err, result);
                                if (err) {
                                  var message = err.message?(err.message.split(":")[2]?err.message.split(":")[2].split('.')[0]:err.message.split(":")[0]):err;
                                  $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+message)
                                } else {
                                  $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('DELETED_COMMENT'));
                                  $rootScope.$emit("update:content");                                
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
                            <ion-comment comment="comment">\
                            </ion-comment>\
                            <div class="reddit-post--comment--container">\
                                 <ul ng-if="comment.showChildren" class="animate-if ion-comment--children">\
                                    <li ng-repeat="comment in comment.comments | orderBy:\'-pending_payout_value\' track by comment.id ">\
                                        <ng-include src="\'node.html\'"/>\
                                    </li>\
                                </ul>\
                            </div>\
                        </script>\
                        <ion-list ng-if="comments && comments.length > 0">\
                          <ul>\
                            <li ng-repeat="comment in comments | orderBy:\'-pending_payout_value\' track by comment.id">\
                                <ng-include src="\'node.html\'"/>\
                            </li>\
                          </ul>\
                        </ion-list>',
            controller: function($scope, $rootScope) {
                /*$scope.toggleComment = function(comment) {
                  //$rootScope.log('toggleComment');
                  if (comment.showChildren) {
                      comment.showChildren = false;
                  } else {
                      comment.showChildren = true;
                  }
                };*/
            }
        }
    }

    function ius($q, $ionicLoading, $cordovaFileTransfer, $ionicPlatform, $filter, $rootScope, API_END_POINT) {
        var service = {};
        service.uploadImage = uploadImage;
        return service;
        function uploadImage(imageURI) {
          var deferred = $q.defer();
          var fileSize;
          var percentage;
          /*if (ionic.Platform.isAndroid()) {
            if (imageURI.indexOf('file://')===-1) {
              imageURI="file://"+imageURI;
            }
          }*/
          // Find out how big the original file is
          window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
            fileEntry.file(function(fileObj) {
              fileSize = fileObj.size;
              // Display a loading indicator reporting the start of the upload
              $ionicLoading.show({template : $filter('translate')('UPLOADING_PICTURE') +' '+ 0 + '%'});
              // Trigger the upload
              uploadFile();
            });
          });
          function uploadFile() {
            // Add the Cloudinary "upload preset" name to the headers
            // "https://api.cloudinary.com/v1_1/esteem/image/upload"
            var uploadOptions = {
              params : { 'username': $rootScope.user.username},
              fileKey: 'postimage'
            };
            $ionicPlatform.ready(function() {
              //API_END_POINT+"/api/upload"
              
                $cordovaFileTransfer.upload('https://img.esteem.ws/backend.php', imageURI, uploadOptions).then(function(result) {
                    // Let the user know the upload is completed
                    $ionicLoading.show({template : $filter('translate')('UPLOAD_COMPLETED'), duration: 1000});
                    // Result has a "response" property that is escaped
                    // FYI: The result will also have URLs for any new images generated with
                    // eager transformations
                    var response = JSON.parse(decodeURIComponent(result.response));
                    deferred.resolve(response);
                  }, function(err) {
                    // Uh oh!
                    $ionicLoading.show({template : $filter('translate')('UPLOAD_FAILED'), duration: 2000});
                    deferred.reject(err);
                  }, function (progress) {
                    // The upload plugin gives you information about how much data has been transferred
                    // on some interval.  Use this with the original file size to show a progress indicator.
                    percentage = Math.floor((progress.loaded / fileSize) * 100);
                    $ionicLoading.show({template : $filter('translate')('UPLOADING_PICTURE') +' '+ percentage + '%'});
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

    function createYoutubeEmbed(key) {
      return '<iframe width="420" height="345" src="https://www.youtube.com/embed/' + key + '" frameborder="0" allowfullscreen></iframe><br/>';
    };

    function transformYoutubeLinks(text) {
      //const self = this;
      const fullreg = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;

      // get all the matches for youtube links using the first regex
      const match = text.match(fullreg);
      if (match && match.length > 0) {
        let resultHtml = text;
        // go through the matches one by one
        for (var i=0; i < match.length; i++) {
          // get the key out of the match using the second regex
          let matchParts = match[i].split(regex);
          // replace the full match with the embedded youtube code
          resultHtml = resultHtml.replace(match[i], createYoutubeEmbed(matchParts[1]));
        }
        return resultHtml;

      } else {
        return text;
      }
    };
    function transformVimeoLinks(text){
        var vimeoRegex = /(https?:\/\/)?(www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
        var parsed = text.match(vimeoRegex);
        console.log(parsed);
        if (parsed && parsed.length>0) {
          return text.replace(vimeoRegex, '<iframe width="420" height="345" src="//player.vimeo.com/video/' + parsed[3] + '" frameborder="0" allowfullscreen></iframe><br/>');
        } else {
          return text;
        }
    };
    function transformInternalLinks(text) {
      var users = /(^|\s)(@)([a-z][-\.a-z\d]+[a-z\d])/gim;
      var tags = /(^|\s)(#)([a-z][-\.a-z\d]+[a-z\d])/gim;
      var out = "";

      if (text.match(users)){
        var exist = text.match(users);
        //console.log(exist)
        out = text.replace(users, '<a href="#/app/profile/$3">$&</a>');  
      } else {
        out = text;
      }
      var existt = out.match(tags);
      if(existt) {
        //console.log(existt);
        out = out.replace(tags, '<a href="#/app/posts/$3">$&</a>');  
      }

      return out;
    };
}


