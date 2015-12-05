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

personalWatchfaceApp.service('WeatherService', ['$rootScope', '$http', function ($rootScope, $http) {
	var service = {};
	
	var active = false;
	service.queryWeather = function() {
		if (active) {
			return;
		}

		active = true;
		
		$rootScope.$broadcast('weather:updated', null);
		
		$http({
			method: 'GET',
			url: 'http://www.yr.no/place/Canada/British_Columbia/Vancouver/forecast.xml',
			transformResponse: [
			    function(data) {
				    // convert the data to JSON
			    	var x2js = new X2JS();
			    	var json = x2js.xml_str2json(data);
			    	return json;
			    },
			    function(data) {
			    	var samples = data.weatherdata.forecast.tabular.time;
			    	
			    	var ret = [];
		            var len = (samples.length > 12) ? 12 : samples.length;
		            for (var i = 0; i < len; i++) {
		            	var from = samples[i]._from;
		            	
		            	var year = from.substr(0, 4);
		            	var month = from.substr(5, 2);
		            	var day = from.substr(8, 2);
		            	var hour = from.substr(11, 2);
		            	
		            	var time = new Date(year, month, day, hour);
		            	
		            	var label = dateFormat(time, "d@htt");
		            	
		            	var title = samples[i].symbol._name;
		            	var temp = samples[i].temperature._value;
		            	var percip = samples[i].precipitation._value;
		            	
		            	ret[i] = {
		            			label: label,
		            			temperature: temp,
		            			precipitation: percip
		            	}
		            }
		            
		            return ret;
			    }
			]
		}).then(
				function successCallback(response) {
					$rootScope.$broadcast('weather:updated', response.data);
					active = false;
				},
				function errorCallback(response) {
					$rootScope.$broadcast('weather:updated', null);
					active = false;
				}
		);
	}

	return service;
}]);