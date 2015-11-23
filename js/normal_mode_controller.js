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

//function updateTime() {
//	var d, h, m, s;
//	var now = new Date();
//	
//	if (typeof timerStartDate !== 'undefined') {
//		var timeDiff = Math.abs(now.getTime() - timerStartDate.getTime());
//		s = Math.floor(timeDiff / 1000) % 60;
//		m = Math.floor(timeDiff / 1000 / 60) % 60;
//		h = Math.floor(timeDiff / 1000 / 60 / 60) % 24;
//		d = '';
//	} else {
//	    h = now.getHours();
//	    m = now.getMinutes();
//	    s = now.getSeconds();
//	    d = dateFormat(now, "ddd, mmm d yyyy");
//	}
//    
//    var padTimeElement = function padTimeElement(i) {
//        if (i < 10) {
//        	i = '0' + i
//        };
//        return i;
//    };
//    
//    h = padTimeElement(h);
//    m = padTimeElement(m);
//    s = padTimeElement(s);
//    
//    document.querySelector('#time').textContent = h + ':' + m + ':' + s;
//    document.querySelector('#date').textContent = d;
//}
//
//function updateBatteryState()  {
//	var elem = document.querySelector('#battery_level');
//	var elem_icon = document.querySelector('#battery_icon');
//	var elem_outter = document.querySelector('#battery');
//    
//	var level = Math.floor(battery.level * 100);
//	elem.textContent = Math.floor(battery.level * 100);
//	
//	if (level <= 20) {
//		elem_outter.style.color = 'red';
//		elem_icon.className = 'fa fa-battery-0';
//	} else if (level <= 40) { 
//		elem_outter.style.color = 'yellow';
//		elem_icon.className = 'fa fa-battery-1';
//	} else if (level <= 60) {
//		elem_outter.style.color = '';
//		elem_icon.className = 'fa fa-battery-2';
//	} else if (level < 80) {
//		elem_outter.style.color = '';
//		elem_icon.className = 'fa fa-battery-3';
//	} else {
//		elem_outter.style.color = '';
//		elem_icon.className = 'fa fa-battery-4';
//	}
//}
//
//SPINNER = ['|', '/', '-', '\\'];
//
//function updateHeartRate(hrmInfo)  {
//	var elem = document.querySelector('#heartrate_level');
//	var elem_outter = document.querySelector('#heartrate');
//	
//	if (hrmInfo.heartRate == 0) {
//		hrmFailCount++;
//		 
//		elem.textContent = SPINNER[hrmFailCount % SPINNER.length];
//		if (hrmFailCount % 200 == 0) {
//			// If you get 201 0's in a row, the sensor gives up. Close it and re-open it to try again.
//			tizen.humanactivitymonitor.stop('HRM');
//			tizen.humanactivitymonitor.start('HRM', updateHeartRate);
//		}
//		
//		elem_outter.style.color = '';
//		lastHeartRate = hrmInfo.heartRate;
//	} else if (hrmInfo.heartRate >= 0) {
//		// Heartrate numbers were taken from calculations on http://www.livestrong.com/article/208307-how-to-calculate-heart-rate-for-fat-burn/
//		// Adjusted for 31 yearold individual
//		if (hrmInfo.heartRate < sport_chart.MIN_GOOD_HEART_RATE) {
//			elem_outter.style.color = '';
//			if (lastHeartRate >= sport_chart.MIN_GOOD_HEART_RATE) {
//				// Vibrate won't work if the screen is off, so temporarily turn it on
//				turnOnAndVibrate();
//			}
//		} else if (hrmInfo.heartRate >= sport_chart.MIN_GOOD_HEART_RATE && hrmInfo.heartRate <= sport_chart.MAX_GOOD_HEART_RATE) {
//			elem_outter.style.color = 'lime';
//			if (lastHeartRate < sport_chart.MIN_GOOD_HEART_RATE || lastHeartRate > sport_chart.MAX_GOOD_HEART_RATE) {
//				// Vibrate won't work if the screen is off, so temporarily turn it on
//				turnOnAndVibrate();
//			}
//		} else {
//			elem_outter.style.color = 'red';
//			if (lastHeartRate <= sport_chart.MAX_GOOD_HEART_RATE) {
//				// Vibrate won't work if the screen is off, so temporarily turn it on
//				turnOnAndVibrate();
//			}
//		}
//		
//		elem.textContent = hrmInfo.heartRate;
//		lastHeartRate = hrmInfo.heartRate;
//	} else if (hrmInfo.heartRate == -3){
//		elem.textContent = 'OFF';
//		elem_outter.style.color = '';
//		lastHeartRate = 0;
//	} else if (hrmInfo.heartRate == -2){
//		elem.textContent = 'SHK';
//		elem_outter.style.color = '';
//		lastHeartRate = 0;
//	}
//	
//	sport_chart.setCurrentHeartRate(lastHeartRate);
//}
//
//function turnOnAndVibrate() {
//	tizen.power.turnScreenOn(); // turn screen on, or else vibrate won't work
//	navigator.vibrate(2000);
//}
//
//function updatePedometer(pedometerInfo) {
//	var elem = document.querySelector('#pedometer_level');
//	var elem_outter = document.querySelector('#pedometer');
//
//	if (pedometerInfo.stepStatus == 'WALKING') {
//		elem_outter.style.color = 'lime';
//		lastSpeed = pedometerInfo.speed;
//	} else if (pedometerInfo.stepStatus == 'NOT_MOVING') {
//		elem_outter.style.color = '';
//		lastSpeed = 0;
//	} else {
//		elem_outter.style.color = 'yellow';
//		lastSpeed = pedometerInfo.speed;
//	}
//	
//	elem.textContent = pedometerInfo.speed;
//	sport_chart.setCurrentSpeed(pedometerInfo.speed);
//}
//
//function timerSwitched() {
//	var checkbox = document.querySelector('#timerSwitch');
//	if (checkbox.checked) {
//		timerStartDate = new Date();
//	} else {
//		timerStartDate = undefined;
//	}
//}
//
//function sportSwitched() {
//	var elem = document.querySelector('#sport_chart');
//
//	var checkbox = document.querySelector('#sportSwitch');
//	if(checkbox.checked === true) {
//		weather_chart.hide();
//		rss.hide();
//		sport_chart.show();
//		
//		tizen.power.request('CPU', 'CPU_AWAKE');
//
//		lastHeartRate = 0;
//		lastSpeed = 0;
//	} else {
//		weather_chart.show();
//		rss.show();
//		sport_chart.hide();
//		
//		tizen.power.release('CPU');
//	}
//}
//
//function incrementCounter() {
//	document.querySelector('#number').textContent++;
//}
//
//
//function decrementCounter() {
//	var num = document.querySelector('#number').textContent;
//	if (num == 0) {
//		return;
//	}
//	num--;
//	document.querySelector('#number').textContent = num;
//}
//
//
//function zeroCounter() {
//	document.querySelector('#number').textContent = '0';
//}
//
//function init() {
//	battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
//	
//	rss = new Rss('http://feeds.arstechnica.com/arstechnica/index/', '#news');
//	weather_chart = new WeatherChart('http://www.yr.no/place/Canada/British_Columbia/Vancouver/forecast.xml', '#weather_chart');
//	sport_chart = new SportChart('#sport_chart');
//	
//	document.addEventListener('visibilitychange', function() {
//	    if (document.hidden) {
//	    	deactivate();
//	    } else {
//	    	activate();
//	    }
//	}, false);
//	
//	activate();
//}
//
//function activate() {
//	updateTime();
//	timeUpdateTimer = setInterval(updateTime, 500);
//	
//	if (document.querySelector('#sportSwitch').checked === false) {
//		document.querySelector('#pedometer').style.color = '';
//		document.querySelector('#pedometer_level').textContent = '-';
//		document.querySelector('#heartrate').style.color = '';
//		document.querySelector('#heartrate_level').textContent = '-';
//
//		rss.show();
//		weather_chart.show();
//
//		hrmFailCount = 0;
//		tizen.humanactivitymonitor.start('HRM', updateHeartRate);
//		tizen.humanactivitymonitor.setAccumulativePedometerListener(updatePedometer);
//	}
//	
//	document.querySelector('#battery').style.color = '';
//	document.querySelector('#battery_level').textContent = '-';
//	battery.addEventListener('levelchange', updateBatteryState);
//	updateBatteryState();
//}
//
//function deactivate() {
//	clearInterval(timeUpdateTimer);
//
//	if (document.querySelector('#sportSwitch').checked === false) {
//		rss.hide();
//		weather_chart.hide();
//
//		tizen.humanactivitymonitor.stop('HRM');
//		tizen.humanactivitymonitor.unsetAccumulativePedometerListener();
//	}
//	
//	battery.removeEventListener('levelchange', updateBatteryState);
//}
