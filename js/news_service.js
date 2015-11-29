/*
 * Copyright (c) 2015 Kasra Faghihi. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

personalWatchfaceApp.service('NewsService', ['$rootScope', '$http', function ($rootScope, $http) {
	var service = {};

	var active = false;
	service.queryHeadlines = function() {
		if (active) {
			return;
		}

		active = true;
		
		$rootScope.$broadcast('news:updated', [ '...' ]);
		
		$http({
			method: 'GET',
			url: 'http://feeds.arstechnica.com/arstechnica/index/',
			transformResponse: [
			    function(data) {
				    // convert the data to JSON
			    	var x2js = new X2JS();
			    	var json = x2js.xml_str2json(data);
			    	return json;
			    },
			    function(data) {
			    	// grab and trim item titles
			    	var items = data.rss.channel.item;
					if (items.length == 0) {
						return [ 'NO_ITEMS' ];
					}
					
					var len = items.length;
					if (len > 10) {
						len = 10;
					}
					
					var ret = [];
					var maxLength = 64;
					for (var i = 0; i < len; i++) {
						var text = items[i].title;
					
					    if (text.length > maxLength) {
					        text = text.substring(0, maxLength - 3) + "...";
					    }
					
					    ret[i] = text;
					}
					
					return ret;
			    }
			]
		}).then(
				function successCallback(response) {
					$rootScope.$broadcast('news:updated', response.data); // array of titles (strings)
					active = false;
				},
				function errorCallback(response) {
					$rootScope.$broadcast('news:updated', [ 'NO_CONN' ]);
					active = false;
				}
		);
	}

	return service;
}]);