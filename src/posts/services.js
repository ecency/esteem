//angular.module('steem.services', [])
module.exports = function (app) {
	app.service('APIs', ['$http', '$rootScope', 'API_END_POINT', function ($http, $rootScope, API_END_POINT) {
		'use strict';
		return {
			login: function (data) {
				return $http.post('', data);
			},
			getconfig: function() {
				return $http.get('');
			},
      getFollowers: function(user, follower, what, limit) {
        return window.Api.follow_api().exec("get_followers", [user, follower, what, limit]);
      },
      getFollowing: function(user, follower, what, limit) {
        return window.Api.follow_api().exec("get_following", [user, follower, what, limit]);
      },
      saveSubscription: function(deviceid, username, subscription) {
        return $http.post(API_END_POINT+"/api/devices", {deviceid: deviceid, username: username, subscription: subscription, chain: $rootScope.$storage.chain});
      },
      updateSubscription: function(deviceid, username, subscription) {
        return $http.put(API_END_POINT+"/api/devices", {deviceid: deviceid, username: username, subscription: subscription, chain: $rootScope.$storage.chain});
      },
      deleteSubscription: function(deviceid) {
        return $http.delete(API_END_POINT+"/api/devices/"+deviceid+"/"+$rootScope.$storage.chain);
      },
      getSubscriptions: function(deviceid) {
        return $http.get(API_END_POINT+"/api/devices/"+deviceid+"/"+$rootScope.$storage.chain);
      },
			addBookmark: function(user, bookmark) {
        return $http.post(API_END_POINT+"/api/bookmark", {username: user, author: bookmark.author, permlink: bookmark.permlink, chain: $rootScope.$storage.chain});
      },
			getBookmarks: function(user) {
        return $http.get(API_END_POINT+"/api/bookmarks/"+user+"/"+$rootScope.$storage.chain);
      },
			removeBookmark: function(id, user) {
        return $http.delete(API_END_POINT+"/api/bookmarks/"+user+"/"+id+"/"+$rootScope.$storage.chain);
      },
			addDraft: function(user, draft) {
        return $http.post(API_END_POINT+"/api/draft", {username: user, title: draft.title, body: draft.body, tags: draft.tags, post_type: draft.post_type, chain: $rootScope.$storage.chain});
      },
			getDrafts: function(user) {
        return $http.get(API_END_POINT+"/api/drafts/"+user+"/"+$rootScope.$storage.chain);
      },
			removeDraft: function(id, user) {
        return $http.delete(API_END_POINT+"/api/drafts/"+user+"/"+id+"/"+$rootScope.$storage.chain);
      },
			removeImage: function(id, user) {
        return $http.delete(API_END_POINT+"/api/images/"+user+"/"+id+"/"+$rootScope.$storage.chain);
      },
			fetchImages: function(user) {
        return $http.get(API_END_POINT+"/api/images/"+user+"/"+$rootScope.$storage.chain);
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
  app.directive('navigation', function () {
    var controller = ['$scope', '$rootScope', function ($scope, $rootScope) {
      $scope.addactiveclass = function (menuItem) {
          $scope.activeMenu = menuItem.name;
          //$rootScope.log(menuItem);
          $rootScope.$storage.filter = menuItem.href;
          $rootScope.$broadcast('filter:change');
          $scope.center(menuItem.name);
          $scope.someCtrlFn({menulinks: menuItem});
      };

      $(window).resize(function(){
        $scope.center();
      });
      $scope.center = function(menuItem) {
        var nav = document.getElementById("nav1");
        var navWidth = document.getElementById("nav2").offsetWidth;
        var currentElement = document.querySelectorAll('[name="'+menuItem+'"]');
        currentElement = menuItem ? currentElement[0] : document.getElementsByClassName('active')[0];
        if(currentElement) {
          var margin = 0;
          var lenm = nav.children.length;
          for(var i =0; i<lenm; i++){

            if(currentElement == nav.children[i]){
              break;
            }else {
              margin += nav.children[i].offsetWidth;
            }
          }
          nav.style.marginLeft = (navWidth/2 - margin - currentElement.offsetWidth/2) + 'px';
        }
        else {
          nav.style.marginLeft = (navWidth/2 - $scope.activeMenu.length) + 'px';
        }
      };
      var _len = $scope.menulinks.length;
      for (var i = 0; i < _len; i++) {
        if ($rootScope.$storage.filter) {
          if ($scope.menulinks[i].href == $rootScope.$storage.filter) {
            $scope.activeMenu = $scope.menulinks[i].name;
          }
        } else {
          $scope.activeMenu = "Trending";
        }
      }

      //$scope.center();
      setTimeout(function() {
        $scope.center();
      }, 50);
    }];

    return {
      restrict: "E",
      replace: true,
      scope: {
        menulinks: '=',
        someCtrlFn: '&callbackFn'
      },
      controller: controller,
      template: "<ul id='nav1'>"+
              "<li ng-repeat='menulinks in menulinks' name='{{menulink.name}}' class='top {{menulink.role}}' ng-class='{active : activeMenu === menulink.name}'>"+
                "<a ng-click='addactiveclass(menulink)'>"+
                  "{{menulink.name}}"
                +"</a>"+
                "<div class='arrow'></div>"+
                "</li>"
            +"</ul>"
    }
  });
  function SimplePubSub() {
      var events = {};
      return {
          on: function(names, handler) {
              names.split(' ').forEach(function(name) {
                  if (!events[name]) {
                      events[name] = [];
                  }
                  events[name].push(handler);
              });
              return this;
          },
          trigger: function(name, args) {
              angular.forEach(events[name], function(handler) {
                  handler.call(null, args);
              });
              return this;
          }
      };
  };

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
  app.directive('tabSlideBox', [ '$timeout', '$window', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', '$rootScope',
    function($timeout, $window, $ionicSlideBoxDelegate, $ionicScrollDelegate, $rootScope) {
      'use strict';

      return {
        restrict : 'A, E, C',
        link : function(scope, element, attrs, ngModel) {

          var ta = element[0], $ta = element;
          $ta.addClass("tabbed-slidebox");
          if(attrs.tabsPosition === "bottom"){
            $ta.addClass("btm");
          }

          //Handle multiple slide/scroll boxes
          var handle = ta.querySelector('.slider').getAttribute('delegate-handle');

          var ionicSlideBoxDelegate = $ionicSlideBoxDelegate;
          if(handle){
            ionicSlideBoxDelegate = ionicSlideBoxDelegate.$getByHandle(handle);
          }

          var ionicScrollDelegate = $ionicScrollDelegate;
          if(handle){
            ionicScrollDelegate = ionicScrollDelegate.$getByHandle(handle);
          }

          function renderScrollableTabs(){
            var iconsDiv = angular.element(ta.querySelector(".tsb-icons")), icons = iconsDiv.find("a"), wrap = iconsDiv[0].querySelector(".tsb-ic-wrp"), totalTabs = icons.length;
            var scrollDiv = wrap.querySelector(".scroll");

            angular.forEach(icons, function(value, key){
                 var a = angular.element(value);
                 a.on('click', function(){
                   ionicSlideBoxDelegate.slide(key);
                 });

              if(a.attr('icon-off')) {
                a.attr("class", a.attr('icon-off'));
              }
            });

            var initialIndex = attrs.tab;
            //Initializing the middle tab
            if(typeof attrs.tab === 'undefined' || (totalTabs <= initialIndex) || initialIndex < 0){
              initialIndex = Math.floor(icons.length/2);
            }

            //If initial element is 0, set position of the tab to 0th tab
            if(initialIndex == 0){
              setPosition(0);
            }
            //$rootScope.log('initialIndex '+initialIndex);
            if ($rootScope.$storage.filter) {
              if ($rootScope.$storage.user) {
                if ($rootScope.$storage.filter === 'feed') {
                  //$scope.events.trigger("slideChange", {"index" : 0});
                  initialIndex = 0;
                }
                if ($rootScope.$storage.filter === 'trending') {
                  //$scope.events.trigger("slideChange", {"index" : 0});
                  initialIndex = 1;
                }
                if ($rootScope.$storage.filter === 'hot'){
                  //$scope.events.trigger("slideChange", {"index" : 1});
                  initialIndex = 2;
                }
                if ($rootScope.$storage.filter === 'created'){
                  //$scope.events.trigger("slideChange", {"index" : 2});
                  initialIndex = 3;
                }
                if ($rootScope.$storage.filter === 'active'){
                  //$scope.events.trigger("slideChange", {"index" : 3});
                  initialIndex = 4;
                }
                if ($rootScope.$storage.filter === 'promoted'){
                  //$scope.events.trigger("slideChange", {"index" : 4});
                  initialIndex = 5;
                }
                if ($rootScope.$storage.filter === 'trending30'){
                  //$scope.events.trigger("slideChange", {"index" : 5});
                  initialIndex = 6;
                }
                if ($rootScope.$storage.filter === 'votes'){
                  //$scope.events.trigger("slideChange", {"index" : 6});
                  initialIndex = 7;
                }
                if ($rootScope.$storage.filter === 'children'){
                  //$scope.events.trigger("slideChange", {"index" : 7});
                  initialIndex = 8;
                }
                if ($rootScope.$storage.filter === 'cashout'){
                  //$scope.events.trigger("slideChange", {"index" : 8});
                  initialIndex = 9;
                }
              } else {
                if ($rootScope.$storage.filter === 'trending') {
                  //$scope.events.trigger("slideChange", {"index" : 0});
                  initialIndex = 0;
                }
                if ($rootScope.$storage.filter === 'hot'){
                  //$scope.events.trigger("slideChange", {"index" : 1});
                  initialIndex = 1;
                }
                if ($rootScope.$storage.filter === 'created'){
                  //$scope.events.trigger("slideChange", {"index" : 2});
                  initialIndex = 2;
                }
                if ($rootScope.$storage.filter === 'active'){
                  //$scope.events.trigger("slideChange", {"index" : 3});
                  initialIndex = 3;
                }
                if ($rootScope.$storage.filter === 'promoted'){
                  //$scope.events.trigger("slideChange", {"index" : 4});
                  initialIndex = 4;
                }
                if ($rootScope.$storage.filter === 'trending30'){
                  //$scope.events.trigger("slideChange", {"index" : 5});
                  initialIndex = 5;
                }
                if ($rootScope.$storage.filter === 'votes'){
                  //$scope.events.trigger("slideChange", {"index" : 6});
                  initialIndex = 6;
                }
                if ($rootScope.$storage.filter === 'children'){
                  //$scope.events.trigger("slideChange", {"index" : 7});
                  initialIndex = 7;
                }
                if ($rootScope.$storage.filter === 'cashout'){
                  //$scope.events.trigger("slideChange", {"index" : 8});
                  initialIndex = 8;
                }
              }
            }
            $timeout(function() {
              ionicSlideBoxDelegate.slide(initialIndex);
            }, 10);
          }

          function setPosition(index){
            var iconsDiv = angular.element(ta.querySelector(".tsb-icons")), icons = iconsDiv.find("a"), wrap = iconsDiv[0].querySelector(".tsb-ic-wrp"), totalTabs = icons.length;
            var scrollDiv = wrap.querySelector(".scroll");

            var middle = iconsDiv[0].offsetWidth/2;
            var curEl = angular.element(icons[index]);
            var prvEl = angular.element(iconsDiv[0].querySelector(".active"));
            if(curEl && curEl.length){
              var curElWidth = curEl[0].offsetWidth, curElLeft = curEl[0].offsetLeft;

              if(prvEl.attr('icon-off')) {
                prvEl.attr("class", prvEl.attr('icon-off'));
              } else{
                prvEl.removeClass("active");
              }
              if(curEl.attr('icon-on')) {
                curEl.attr("class", curEl.attr('icon-on'));
              }
              curEl.addClass("active");

              var leftStr = (middle  - (curElLeft) -  curElWidth/2 + 5);
              //If tabs are not scrollable
              if(!scrollDiv){
                var leftStr = (middle  - (curElLeft) -  curElWidth/2 + 5) + "px";
                wrap.style.webkitTransform =  "translate3d("+leftStr+",0,0)" ;
              } else {
                //If scrollable tabs
                var wrapWidth = wrap.offsetWidth;
                var currentX = Math.abs(getX(scrollDiv.style.webkitTransform));
                var leftOffset = 100;
                var elementOffset = 54;
                //If tabs are reaching right end or left end
                if(((currentX + wrapWidth) < (curElLeft + curElWidth + elementOffset)) || (currentX > (curElLeft - leftOffset))){
                  if(leftStr > 0){
                    leftStr = 0;
                  }
                  //Use this scrollTo, so when scrolling tab manually will not flicker
                  setTimeout(function() {
                    ionicScrollDelegate.scrollTo(Math.abs(leftStr), 0, true);
                  }, 10);

                } else {
                  if(leftStr > 0){
                    leftStr = 0;
                  }
                  setTimeout(function() {
                    ionicScrollDelegate.scrollTo(Math.abs(leftStr), 0, true);
                  }, 10);
                }
              }
            }
          };
          function getX(matrix) {

            matrix = matrix.replace("translate3d(","");
            matrix = matrix.replace("translate(","");
            return (parseInt(matrix));
          }
          var events = scope.events;
          events.on('slideChange', function(data){
            setPosition(data.index);
          });
          events.on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            renderScrollableTabs();
          });
          setTimeout(function() {
            renderScrollableTabs();
          }, 10);

        },
        controller : function($scope, $attrs, $element, $rootScope) {
          $scope.events = new SimplePubSub();
          $scope.slideHasChanged = function(index){
            $rootScope.log("SlideChanged "+index);
            $scope.currentSlide = index;
            $scope.events.trigger("slideChange", {"index" : index});
            $timeout(function(){
              if($scope.onSlideMove) {
                $scope.onSlideMove({"index" : eval(index)});
              }

              if ($rootScope.$storage.user) {
                if (index === 0) {
                  $rootScope.$storage.filter = 'feed';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 1) {
                  $rootScope.$storage.filter = 'trending';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 2) {
                  $rootScope.$storage.filter = 'hot';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 3) {
                  $rootScope.$storage.filter = 'created';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 4) {
                  $rootScope.$storage.filter = 'active';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 5) {
                  $rootScope.$storage.filter = 'promoted';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 6) {
                  $rootScope.$storage.filter = 'trending30';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 7) {
                  $rootScope.$storage.filter = 'votes';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 8) {
                  $rootScope.$storage.filter = 'children';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 9) {
                  $rootScope.$storage.filter = 'cashout';
                  $rootScope.$broadcast('filter:change');
                }
              } else {
                if (index === 0) {
                  $rootScope.$storage.filter = 'trending';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 1) {
                  $rootScope.$storage.filter = 'hot';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 2) {
                  $rootScope.$storage.filter = 'created';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 3) {
                  $rootScope.$storage.filter = 'active';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 4) {
                  $rootScope.$storage.filter = 'promoted';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 5) {
                  $rootScope.$storage.filter = 'trending30';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 6) {
                  $rootScope.$storage.filter = 'votes';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 7) {
                  $rootScope.$storage.filter = 'children';
                  $rootScope.$broadcast('filter:change');
                }
                if (index === 8) {
                  $rootScope.$storage.filter = 'cashout';
                  $rootScope.$broadcast('filter:change');
                }
              }
              if (!$rootScope.$$phase){
                $rootScope.$apply();
              }
            }, 10);
          };

          $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            $rootScope.log('ngRepeatFinished');
            $scope.events.trigger("ngRepeatFinished", {"event" : ngRepeatFinishedEvent});
          });
        }
      };

    }
  ]);

	app.filter('timeago', function($filter, $translate, $rootScope) {

      function TimeAgo(input, p_allowFuture) {
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

      };

      TimeAgo.$stateful = true;
      return TimeAgo;
    });

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
			    breaks: true,
			    pedantic: false,
			    sanitize: false,
			    smartLists: true,
			    smartypants: false
			  };
        if (textu) {
          var textu = marked(textu, options);
          if (subpart) {
            var s = $sce.trustAsHtml(textu).toString();
            var text = s.substring(s.indexOf("<p>"), s.indexOf("</p>"));
            return text;
          } else {
            return $sce.trustAsHtml(textu);
          }
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
    var time = minutes * 60 * 1000
    var displayed = Math.ceil(minutes.toFixed(2))

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
	    		return (Number(text.split(" ")[0])/1e6*$rootScope.$storage.steem_per_mvests*$rootScope.$storage.base + Number(balance.split(" ")[0])*$rootScope.$storage.base + Number(sbd.split(" ")[0])).toFixed(3);
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

  app.filter("sumPostTotal", function(){
    return function(value) {
      if (value && value.total_payout_value) {
        return (parseFloat(value.total_payout_value.split(" ")[0])+parseFloat(value.total_pending_payout_value.split(" ")[0]));
      }
    }
  });

    app.filter('hrefToJS', function ($sce, $sanitize) {
        return function (text) {
            var regex = /href="([\S]+)"/g;
            var newString = $sanitize(text).replace(regex, "href onClick=\"window.open('$1', '_blank', 'location=yes');return false;\"");
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
                        <div class="ion-comment--author"><b>{{comment.author}}</b>&nbsp;<div class="reputation">{{comment.author_reputation|reputation|number:0}}</div>&middot;{{comment.created|timeago}}</div>\
                        <div class="ion-comment--score"><i ng-class="{\'ion-social-usd\':$root.$storage.chain==\'steem\',\'fa fa-rub\':$root.$storage.chain=\'golos\'}"></i> {{comment.total_pending_payout_value.split(" ")[0]|number}}</div>\
                        <div class="ion-comment--text bodytext selectable" ng-bind-html="comment.body | parseUrl "></div>\
                        <div class="ion-comment--replies">{{comment.net_votes || 0}} votes, {{comment.children || 0}} replies</div>\
                        <ion-option-button ng-click="upvotePost(comment)"><span class="fa fa-chevron-circle-up" ng-class="{\'positive\':comment.upvoted}"></ion-option-button>\
                        <ion-option-button ng-click="replyToComment(comment)"><span class="fa fa-reply"></ion-option-button>\
                        <ion-option-button ng-click="downvotePost(comment)"><span class="fa fa-flag" ng-class="{\'assertive\':comment.downvoted}"></ion-option-button>\
                        <ion-option-button ng-if="comment.author == $root.$storage.user.username && compateDate(comment)" ng-click="editComment(comment)"><span class="ion-ios-compose-outline" style="font-size:30px"></ion-option-button>\
                        <ion-option-button ng-if="comment.author == $root.$storage.user.username" ng-click="deleteComment(comment)"><span class="ion-ios-trash-outline" style="font-size:30px"></ion-option-button>\
                    </ion-item>',
            controller: function($scope, $rootScope, $state, $ionicModal, $ionicPopup, $ionicActionSheet, $cordovaCamera, $filter) {
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
                            var url = result.imageUrl || '';
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
                  $scope.reply = function (xx) {
                    if (!$scope.editc) {
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

                            var json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || "", app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html' };
                            tr.add_type_operation("comment", {
                              parent_author: $scope.post.author,
                              parent_permlink: $scope.post.permlink,
                              author: $rootScope.$storage.user.username,
                              permlink: "re-"+$scope.post.author+"-"+$scope.post.permlink+"-"+timeformat,
                              title: "",
                              body: $scope.data.comment,
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
                                $scope.closeModal();
                                $scope.data.comment = "";
                                $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
                                $rootScope.$broadcast("update:content");
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
                    } else {

                        var patch = createPatch($scope.patchbody, $scope.data.comment)
                        // Putting body into buffer will expand Unicode characters into their true length
                        if (patch && patch.length < new Buffer($scope.data.comment, 'utf-8').length) {
                          $scope.data.comment2 = patch;
                          //$rootScope.log(patch);
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

                            var json = {tags: angular.fromJson($scope.post.json_metadata).tags[0] || "", app: 'esteem/'+$rootScope.$storage.appversion, format: 'markdown+html' };
                            tr.add_type_operation("comment", {
                              parent_author: $scope.post.parent_author,
                              parent_permlink: $scope.post.parent_permlink,
                              author: $scope.post.author,
                              permlink: $scope.post.permlink,
                              title: "",
                              body: $scope.data.comment2 || $scope.data.comment,
                              json_metadata: $scope.post.json_metadata
                            });
                            //$rootScope.log(my_pubkeys);
                            localStorage.error = 0;
                            tr.process_transaction($scope.mylogin, null, true);

                            $scope.closeModal();
                            $scope.replying = false;
                            setTimeout(function() {
                              if (localStorage.error == 1) {
                                $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                              } else {
                                $scope.data.comment = "";
                                $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('COMMENT_SUBMITTED'));
                                $rootScope.$broadcast("update:content");
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
                                  author: comment.author,
                                  permlink: comment.permlink
                                });
                                //$rootScope.log(my_pubkeys);
                                localStorage.error = 0;
                                tr.process_transaction($scope.mylogin, null, true);

                                setTimeout(function() {
                                  if (localStorage.error == 1) {
                                    $rootScope.showAlert($filter('translate')('ERROR'), $filter('translate')('BROADCAST_ERROR')+" "+localStorage.errormessage)
                                  } else {
                                    $rootScope.showMessage($filter('translate')('SUCCESS'), $filter('translate')('DELETED_COMMENT'));
                                    $rootScope.$broadcast("update:content");
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

                    $rootScope.log('toggleComment');

                    if (comment.children > 0){
                      window.Api.database_api().exec("get_content_replies", [comment.author, comment.permlink]).then(function(res1){
                        //todo fix active_votes
                        comment.replies = res1;
                        //$rootScope.log('result',res1);
                        if (comment.showChildren) {
                            comment.showChildren = false;
                        } else {
                            comment.showChildren = true;
                        }
                        if (!$scope.$$phase) {
                          $scope.$apply();
                        }
                      });
                      //$rootScope.$broadcast('hide:loading');
                    }
                };
            }
        }
    }

    function ius($q, $ionicLoading, $cordovaFileTransfer, $ionicPlatform, $filter, $rootScope) {
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
              $ionicLoading.show({template : $filter('translate')('UPLOADING_PICTURE') + 0 + '%'});
              // Trigger the upload
              uploadFile();
            });
          });
          function uploadFile() {
            // Add the Cloudinary "upload preset" name to the headers
            // "https://api.cloudinary.com/v1_1/esteem/image/upload"
            var uploadOptions = {
              params : { 'username': $rootScope.$storage.user.username}
            };
            $ionicPlatform.ready(function() {
                $cordovaFileTransfer.upload("http://192.158.29.1:8080/api/upload", imageURI, uploadOptions).then(function(result) {
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
                    $ionicLoading.show({template : $filter('translate')('UPLOADING_PICTURE') + percentage + '%'});
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
