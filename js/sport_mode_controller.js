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

personalWatchfaceApp.controller('SportModeCtrl', ['HardwareService', '$interval', '$scope', function(hardwareService, $interval, $scope) {
	$scope.$on('hardware:viewChanged', function(event, data) {
		$scope.visible = (data == 'SPORT');
	});

	var TIMER_STATE_ACTIVE = 0;
	var TIMER_STATE_INACTIVE = 1;
	var timerState = TIMER_STATE_INACTIVE;
	$scope.timer = '00:00:00';
	$scope.$on('hardware:timeChanged', function(event, data) {
		if (timerState == TIMER_STATE_ACTIVE) {
			$scope.timer = data.timerObj.hour + ':' + data.timerObj.minute + ':' + data.timerObj.second;
		}
	});

	$scope.batteryStyle = '';
	$scope.batteryIconClass = 'fa fa-battery-4';
	$scope.$on('hardware:batteryChanged', function(event, level, charging) {
		$scope.battery = level;
		
		if (level <= 20) {
			$scope.batteryColor = 'red';
			$scope.batteryIconClass = 'fa fa-battery-0';
		} else if (level <= 40) { 
			$scope.batteryColor = 'yellow';
			$scope.batteryIconClass = 'fa fa-battery-1';
		} else if (level <= 60) {
			$scope.batteryColor = '';
			$scope.batteryIconClass = 'fa fa-battery-2';
		} else if (level < 80) {
			$scope.batteryColor = '';
			$scope.batteryIconClass = 'fa fa-battery-3';
		} else {
			$scope.batteryColor = '';
			$scope.batteryIconClass = 'fa fa-battery-4';
		}
	});
	
	var SPINNER = ['|', '/', '-', '\\'];
	var MIN_GOOD_HEART_RATE = 103.95;
	var MAX_GOOD_HEART_RATE = 132.3;
	var hrmFailCount = 0;
	var lastSpeed = 0;
	var lastHeartRate = 0;
	$scope.$on('hardware:heartRateChanged', function(event, data) {
		$scope.heartrate = data;
		
		if (data == 0) {
			hrmFailCount++;
			 
			$scope.heartrate = SPINNER[hrmFailCount % SPINNER.length];
			$scope.heartrateColor = '';
			lastHeartRate = data;
		} else if (data >= 0) {
			// Heartrate numbers were taken from calculations on http://www.livestrong.com/article/208307-how-to-calculate-heart-rate-for-fat-burn/
			// Adjusted for 31 yearold individual
			if (data < MIN_GOOD_HEART_RATE) {
				$scope.heartrateColor = '';
				if (lastHeartRate >= MIN_GOOD_HEART_RATE) {
					// Vibrate won't work if the screen is off, so temporarily turn it on
					hardwareService.vibrate(2000);
				}
			} else if (data >= MIN_GOOD_HEART_RATE && data <= MAX_GOOD_HEART_RATE) {
				$scope.heartrateColor = 'lime';
				if (lastHeartRate < MIN_GOOD_HEART_RATE || lastHeartRate > MAX_GOOD_HEART_RATE) {
					// Vibrate won't work if the screen is off, so temporarily turn it on
					hardwareService.vibrate(2000);
				}
			} else {
				$scope.heartrateColor = 'red';
				if (lastHeartRate <= MAX_GOOD_HEART_RATE) {
					// Vibrate won't work if the screen is off, so temporarily turn it on
					hardwareService.vibrate(2000);
				}
			}
			
			$scope.heartrate = data;
			lastHeartRate = data;
		} else if (data < 0){
			$scope.heartrate = 'OFF';
			$scope.heartrateColor = '';
			lastHeartRate = 0;
		} else if (data == -2){
			$scope.heartrate = 'SHK';
			$scope.heartrateColor = '';
			lastHeartRate = 0;
		}
	});
	
	$scope.$on('hardware:pedometerChanged', function(event, data) {
		if (data.status == 'WALKING') {
			$scope.speedColor = 'lime';
			$scope.speed = data.speed;
		} else if (data.status == 'NOT_MOVING') {
			$scope.speedColor = '';
			$scope.speed = 0;
		} else {
			$scope.speedColor = 'yellow';
			$scope.speed = data.speed;
		}
		
		lastSpeed = $scope.speed;
	});

	$scope.updateTimerState = function() {
		if (timerState == TIMER_STATE_ACTIVE) {
			timerState = TIMER_STATE_INACTIVE;
		} else if (timerState == TIMER_STATE_INACTIVE) {
			hardwareService.resetTimer();
			timerState = TIMER_STATE_ACTIVE;
		} else {
			throw "BAD TIMER STATE"
		}
	}
	
	var sportState = false;
	var TOGGLE_NAME_OFF = "STOP";
	var TOGGLE_NAME_ON = "GO";
	$scope.toggleName = TOGGLE_NAME_ON;
	
	var sportElem = document.querySelector('#sport_chart'); 
	var sportChart = null;
	
	var sportChartUpdater;
	
	$scope.toggle = function() {
		if (sportState) {
			// It's on, turn it off
			sportState = false;
			$scope.toggleName = TOGGLE_NAME_ON;
			
			sportChart.clear();
			sportChart.destroy();
			
			$interval.cancel(sportChartUpdater);
			
			hardwareService.forceCpu(false);
			hardwareService.changeNotice(false);
		} else {
			// It's off, turn it on
			sportState = true;
			$scope.toggleName = TOGGLE_NAME_OFF;
			
			hardwareService.forceCpu(true);
			hardwareService.changeNotice(true);

			var sportChartMaxCount = 60 * 60 / 10; // number of seconds in an hour / 10
			var sportChartCount = 60 * 60 / 10; // pretend like we've got a full count of points, because initial points is array of maxCount 0s
			
			var data = {
				    labels: Array.apply(null, new Array(sportChartMaxCount)).map(String.prototype.valueOf, ''),
				    labelsFilter: function (label) { return true },
				    datasets: [
				        {
				            label: 'HRM',
				            fillColor: 'rgba(255,255,255,0.2)',
				            strokeColor: "rgba(255,255,255,0.6)",
				            data: Array.apply(null, new Array(sportChartMaxCount)).map(Number.prototype.valueOf, 0),
				        },
				        {
				            label: 'MIN_GOOD_HRM',
				            fillColor: 'rgba(255,255,255,0)',
				            strokeColor: "rgba(255,255,255,0.2)",
				            data: Array.apply(null, new Array(sportChartMaxCount)).map(Number.prototype.valueOf, MIN_GOOD_HEART_RATE),
				        },
				        {
				            label: 'MAX_GOOD_HRM',
				            fillColor: 'rgba(255,255,255,0)',
				            strokeColor: "rgba(255,255,255,0.2)",
				            data: Array.apply(null, new Array(sportChartMaxCount)).map(Number.prototype.valueOf, MAX_GOOD_HEART_RATE),
				        },
				        {
				            label: 'Speed',
				            fillColor: 'rgba(151,187,205,0.2)',
				            strokeColor: "rgba(151,187,205,0.6)",
				            data: Array.apply(null, new Array(sportChartMaxCount)).map(Number.prototype.valueOf, 0),
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
				    bezierCurve : false,
				    pointDot : false,
				    datasetStroke : true,
				    datasetStrokeWidth : 2,
				    datasetFill : true,
				    xAxisPosition: 195, // REQUIRES CUSTOM MODIFIED CHARTJS
				    yAxisPosition: 155, // REQUIRES CUSTOM MODIFIED CHARTJS
				};
			
			sportChart = new Chart(sportElem.getContext('2d')).Line(data, options);
			
			sportChartUpdater = $interval(function() {
				while (sportChartCount >= sportChartMaxCount) {
					sportChart.removeData();
					sportChartCount--;
				}
				
				sportChart.addData([lastHeartRate, MIN_GOOD_HEART_RATE, MAX_GOOD_HEART_RATE, lastSpeed * 10], '');
				sportChartCount++;
			}, 10000); // call once every 10 seconds
		}
	}

	$scope.prevScreen = function() {
		hardwareService.changeView('NORMAL');
	}
	
	$scope.nextScreen = function() {
		hardwareService.changeView('COUNTER');
	}
}]);
