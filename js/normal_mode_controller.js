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

personalWatchfaceApp.controller('NormalModeCtrl', ['MainService', '$scope', function(MainService, $scope) {
	$scope.$on('main:viewChanged', function(event, data) {
		$scope.visible = (data == 'NORMAL');
	});
	
	$scope.$watch('visible', function(newValue, oldValue) {
		if (newValue == true) {
			MainService.queryHeadlines();
			MainService.queryWeather();
		}
	});
	
	$scope.$on('main:timeChanged', function(event, data) {
		$scope.time = data.nowObj.hour + ':' + data.nowObj.minute + ':' + data.nowObj.second;
		$scope.date = data.nowObj.date;
	});

	$scope.batteryStyle = '';
	$scope.batteryIconClass = 'fa fa-battery-4';
	$scope.$on('main:batteryChanged', function(event, data) {
		$scope.battery = data;
		
		if (level <= 20) {
			$scope.batteryStyle = 'red';
			$scope.batteryIconClass = 'fa fa-battery-0';
		} else if (level <= 40) { 
			$scope.batteryStyle = 'yellow';
			$scope.batteryIconClass = 'fa fa-battery-1';
		} else if (level <= 60) {
			$scope.batteryStyle = '';
			$scope.batteryIconClass = 'fa fa-battery-2';
		} else if (level < 80) {
			$scope.batteryStyle = '';
			$scope.batteryIconClass = 'fa fa-battery-3';
		} else {
			$scope.batteryStyle = '';
			$scope.batteryIconClass = 'fa fa-battery-4';
		}
	});
	
	$scope.$on('main:heartRateChanged', function(event, data) {
		$scope.heartrate = data;
	});
	
	$scope.$on('main:pedometerChanged', function(event, data) {
		$scope.pedometer = data;
	});

	var _weatherElem = document.querySelector('#weather_chart'); 
	var _weatherChart = null;
	$scope.$on('main:weatherUpdated', function(event, data) {
		if (data == null) {
			if (_weatherChart != null) {
				_weatherChart.clear();
				_weatherChart.destroy();
			}
		} else {
			var lineData = {
				    labels:[],
				    labelsFilter: function (label) { return true },
				    datasets: [
				        {
				            label: 'Temperature',
				            fillColor: 'rgba(255,0,0,0.0)',
				            strokeColor: "rgba(255,0,0,1)",
				            data: []
				        },
				        {
				            label: 'Precipitation',
				            fillColor: 'rgba(0,0,255,0.0)',
				            strokeColor: "rgba(0,0,255,1)",
				            data: []
				        },
				        {
				            label: 'Light Rain',
				            fillColor: 'rgba(255,255,255,0.0)',
				            strokeColor: "rgba(0,0,255,0.4)",
				            data: []
				        },
				        {
				            label: 'Heavy Rain',
				            fillColor: 'rgba(255,255,255,0.0)',
				            strokeColor: "rgba(0,0,255,0.4)",
				            data: []
				        },
				        {
				            label: 'Room Temp',
				            fillColor: 'rgba(255,255,255,0.0)',
				            strokeColor: "rgba(255,0,0,0.4)",
				            data: []
				        }
				    ]
				};
			
			var options = {
					animation: false,
					responsive: false,
					maintainAspectRatio: false,
					showTooltips: false,
				    scaleShowGridLines : false,
				    scaleGridLineColor : 'rgba(0,0,0,.05)',
				    scaleGridLineWidth : 1,
				    scaleShowHorizontalLines: false,
				    scaleShowVerticalLines: false,
				    bezierCurve : true,
				    pointDot : false,
				    datasetStroke : true,
				    datasetStrokeWidth : 2,
				    datasetFill : true,
				};
			
			_weatherChart = new Chart(_weatherElem.getContext('2d')).Line(lineData, options);
			
			// inbetween is considered moderate rain
			var LIGHT_RAIN = 2.5; // anything below this or below (in mm) is considered light rain
			var HEAVY_RAIN = 7.6; // anything below this or above (in mm) is considered heavy rain
			
			var ROOM_TEMP = 21; // room temp in celsius
			
			for (var i = 0; i < data.length; i++) {
				_weatherChart.addData([data[i].temperature, data[i].precipitation, LIGHT_RAIN, HEAVY_RAIN, ROOM_TEMP], data[i].label);
			}
		}
	});

	$scope.$on('main:headlinesUpdated', function(event, data) {
		$scope.newsIndex = 0;
		$scope.news = data;
		
		$scope.newsItem = data[0];
	});
	
	$scope.nextNewsItem = function() {
		var idx = $scope.newsIndex;
		
		idx = (idx + 1) % $scope.news.length; // inc and rollover
		
		$scope.newsItem = $scope.news[idx];
		$scope.newsIndex = idx;
	}
	
	$scope.nextScreen = function() {
		MainService.changeView('SPORT');
	}
}]);