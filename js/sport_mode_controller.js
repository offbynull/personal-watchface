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

personalWatchfaceApp.controller('SportModeCtrl', ['HardwareService', '$scope', function(hardwareService, $scope) {
	$scope.$on('hardware:viewChanged', function(event, data) {
		$scope.visible = (data == 'SPORT');
	});
	
	$scope.$on('hardware:timeChanged', function(event, data) {
		$scope.timer = data.timerObj.hour + ':' + data.timerObj.minute + ':' + data.timerObj.second;
	});

	$scope.batteryStyle = '';
	$scope.batteryIconClass = 'fa fa-battery-4';
	$scope.$on('hardware:batteryChanged', function(event, data) {
		$scope.battery = data;
		
		if (data <= 20) {
			$scope.batteryStyle = 'color: red';
			$scope.batteryIconClass = 'fa fa-battery-0';
		} else if (data <= 40) { 
			$scope.batteryStyle = 'color: yellow';
			$scope.batteryIconClass = 'fa fa-battery-1';
		} else if (data <= 60) {
			$scope.batteryStyle = '';
			$scope.batteryIconClass = 'fa fa-battery-2';
		} else if (data < 80) {
			$scope.batteryStyle = '';
			$scope.batteryIconClass = 'fa fa-battery-3';
		} else {
			$scope.batteryStyle = '';
			$scope.batteryIconClass = 'fa fa-battery-4';
		}
	});
	
	var SPINNER = ['|', '/', '-', '\\'];
	var MIN_GOOD_HEART_RATE = 103.95;
	var MAX_GOOD_HEART_RATE = 132.3;
	var hrmFailCount = 0;
	var lastHeartRate = 0;
	$scope.$on('hardware:heartRateChanged', function(event, data) {
		$scope.heartrate = data;
		
		if (data == 0) {
			hrmFailCount++;
			 
			$scope.heartrate = SPINNER[hrmFailCount % SPINNER.length];
			if (hrmFailCount % 200 == 0) {
				hardwareService.stopHeartrate();
				hardwareService.startHeartrate();
			}
			
			$scope.heartrateStyle = '';
			lastHeartRate = data;
		} else if (data >= 0) {
			// Heartrate numbers were taken from calculations on http://www.livestrong.com/article/208307-how-to-calculate-heart-rate-for-fat-burn/
			// Adjusted for 31 yearold individual
			if (data < MIN_GOOD_HEART_RATE) {
				$scope.heartrateStyle = '';
				if (lastHeartRate >= MIN_GOOD_HEART_RATE) {
					// Vibrate won't work if the screen is off, so temporarily turn it on
					hardwareService.vibrate(2000);
				}
			} else if (data >= MIN_GOOD_HEART_RATE && data <= MAX_GOOD_HEART_RATE) {
				$scope.heartrateStyle = 'color: lime';
				if (lastHeartRate < MIN_GOOD_HEART_RATE || lastHeartRate > MAX_GOOD_HEART_RATE) {
					// Vibrate won't work if the screen is off, so temporarily turn it on
					hardwareService.vibrate(2000);
				}
			} else {
				$scope.heartrateStyle = 'color: red';
				if (lastHeartRate <= MAX_GOOD_HEART_RATE) {
					// Vibrate won't work if the screen is off, so temporarily turn it on
					hardwareService.vibrate(2000);
				}
			}
			
			$scope.heartrate = data;
			lastHeartRate = data;
		} else if (data == -3){
			$scope.heartrate = 'OFF';
			$scope.heartrateStyle = '';
			lastHeartRate = 0;
		} else if (data == -2){
			$scope.heartrate = 'SHK';
			$scope.heartrateStyle = '';
			lastHeartRate = 0;
		}
	});
	
	$scope.$on('hardware:pedometerChanged', function(event, data) {
		if (data.status == 'WALKING') {
			$scope.speedStyle = 'color: lime';
			$scope.speed = data.speed;
		} else if (data.status == 'NOT_MOVING') {
			$scope.speedStyle = '';
			$scope.speed = 0;
		} else {
			$scope.speedStyle = 'color: yellow';
			$scope.speed = data.speed;
		}
	});
	
	$scope.prevScreen = function() {
		hardwareService.changeView('NORMAL');
	}
	
	$scope.nextScreen = function() {
		hardwareService.changeView('COUNTER');
	}
}]);
