angular.module('steem.services', [])
	.service('APIs', ['$http', '$rootScope', function ($http, $rootScope) {
		'use strict';
		
		return {
			login: function (data) {
				return $http.post('http://wwwlogix.com/dev/ezine/services/app/ezine_login_check', data);
			},
			editcompany: function (data) {
				return $http.post('http://wwwlogix.com/dev/ezine/services/app/ezine_edit_companyname', data );
			},
			getarticles: function () {
				return $http.get('http://wwwlogix.com/dev/ezine/services/app/ezine_get_all_articles');
			},
			getarticleStatus: function(data) {
				return $http.post('http://wwwlogix.com/dev/ezine/services/app/ezine_get_user_article_recording', data);
			}, 
			getconfig: function() {
				return $http.get('http://wwwlogix.com/dev/ezine/services/app/ezine_get_config');
			}
		};
	}])

	.factory('MyService', ['$q', '$rootScope', '$localStorage', function($q, $rootScope, $localStorage) {
	    // We return this object to anything injecting our service
	    var Service = {};
	    // Keep all pending requests here until they get responses
	    var callbacks = {};
	    // Create a unique callback ID to map requests to responses
	    /*var currentCallbackId = 0;
	    $rootScope.$storage = $localStorage;
	    if (!$rootScope.$storage.socket) {
	    	$rootScope.$storage.socket = "wss://steemit.com/wstmp3";
	    } else {
	    	$rootScope.$storage.socket = "wss://this.piston.rocks";
	    }
	    var ws = new WebSocket($rootScope.$storage.socket); 
		//wrapper for WebSocket
		//wss://steemit.com/wstmp3 
		//wss://this.piston.rocks
		ws.onopen = function(){
	        console.log("Socket has been opened!");  
		};
		ws.onclose = function(){
			console.log("Socket closed!");
		};
		ws.onerror = function(){
			console.log("Socket error!");
		};
		ws.onmessage = function(message) {
			listener(JSON.parse(message.data));
		};


	    function sendRequest(request) {
	      var defer = $q.defer();
	      var callbackId = getCallbackId();
	      callbacks[callbackId] = {
	        time: new Date(),
	        cb:defer
	      };
	      request.id = callbackId;
	      console.log('Sending request', request);
	      if (ws){
	      	ws.send(JSON.stringify(request));	
	      }
	      return defer.promise;
	    }

	    function listener(data) {
	      var messageObj = data;
	      console.log("Received data from websocket: ", messageObj);
	      // If an object exists with callback_id in our callbacks object, resolve it
	      if(callbacks.hasOwnProperty(messageObj.id)) {
	        $rootScope.$apply(callbacks[messageObj.id].cb.resolve(messageObj.result));
	        delete callbacks[messageObj.id];
	      }
	    }
	    // This creates a new callback ID for a request
	    function getCallbackId() {
	      currentCallbackId += 1;
	      if(currentCallbackId > 10000) {
	        currentCallbackId = 0;
	      }
	      return currentCallbackId;
	    }*/

	     /*
	     _self->register_api_factory< login_api >( "login_api" );
         _self->register_api_factory< database_api >( "database_api" );
         _self->register_api_factory< network_node_api >( "network_node_api" );
         _self->register_api_factory< network_broadcast_api >( "network_broadcast_api" );*/

         /*
	    Service.getPostComments = function(parent_author, parent_link) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["database_api", "get_content_replies", [parent_author, parent_link]], 
	        id: 2
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	    Service.getAccounts = function(handle) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["database_api", "get_accounts", [ [handle] ]],
	        id: 3
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	    Service.getAccountVotes = function(handle) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["database_api", "get_account_votes", [ handle ]],
	        id: 4
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	    Service.getStats = function() {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["database_api", "get_dynamic_global_properties", [ ]],
	        id: 4000
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	    Service.getState = function(handle) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["database_api", "get_state", [ handle ]],
	        id: 7
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	   	Service.getKey = function(handle) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["database_api", "get_key_references", [ [handle] ]],
	        id: 8
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	    Service.login = function(username, password) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["login_api", "login", [ username, password]],
	        id: 5
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	    Service.broadcast = function(handle) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["network_broadcast_api", "broadcast_transaction", [ [handle] ]],
	        id: 9
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	    Service.getMessage = function(username, password) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["hello_api_api", "get_message", []],
	        id: 5
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }
	    
	    Service.getActiveVotes = function(author, link) {
	      var request = {
	        jsonrpc: "2.0", 
	        method: "call", 
	        params: ["database_api", "get_active_votes", [author, link]],
	        id: 6
	      }
	      // Storing in a variable for clarity on what sendRequest returns
	      var promise = sendRequest(request); 
	      return promise;
	    }*/

	    return Service;
	}])


.filter('timeago', function() {
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

    .filter('parseUrl', function($sce) {
	    /*var urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
	    var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	 	//var imgs = /\.(jpeg|jpg|gif|png)$/;
	 	var imgs = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;
		*/
	    return function(text) {
	    	/*if (text.match(imgs)) {
        		text = text.replace(imgs, '<img src="$1" style="max-width:100%"/>');	
        	} else if (text.match(urls)) {
	        	text = text.replace(urls, '<a href="$1">$1</a>');	
	        }
	        if(text.match(emails)) {
	            text = text.replace(emails, '<a href=\"mailto:$1\">$1</a>');
	        }
	        return $sce.trustAsHtml(text);*/
	        var options = {
	        	/*gfm: true,
				tables: true,
			    breaks: false,
			    pedantic: false,
			    sanitize: true,
			    smartLists: true,
			    smartypants: false*/
			};
	        return marked(text, options);
	    };
	})
	.filter('sp', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-6))/1e6*$rootScope.$storage.steem_per_mvests).toFixed(3);	
	    	}
	    };
	})
	.filter('sd', function($sce, $rootScope) {
	    return function(text) {
	    	if (text) {
	    		return (Number(text.substring(0, text.length-6))/1e6*$rootScope.$storage.steem_per_mvests*$rootScope.$storage.base).toFixed(3);	
	    	}
	    };
	})
    

.directive('qrcode', function($interpolate) {  
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
})
	  



	;
