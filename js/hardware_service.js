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

personalWatchfaceApp.service('HardwareService', ['$rootScope', '$interval', '$http', 'VisibilityChange', function ($rootScope, $interval, $http, visibilityChange) {
	var service = {};


	var forcedOn = false;


	var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
	if (typeof battery !== 'undefined') {
		battery.addEventListener('levelchange', function() {
			$rootScope.$broadcast('hardware:batteryChanged', Math.floor(battery.level * 100), battery.charging);
		});
	}

	var SPINNER = ['|', '/', '-', '\\'];
	var hrmSpinnerIdx = 0;
	var hrmResetTimer = null;
	visibilityChange.onVisible(function() {
    	if (forcedOn) {
    		return;
    	}

		if (typeof tizen.humanactivitymonitor !== 'undefined') {
			// HRM
			var resetFunction = null;
			var updateFunction = null;
			
			// Function to reset the HRM
			resetFunction = function() {
				tizen.humanactivitymonitor.stop('HRM');
				tizen.humanactivitymonitor.start('HRM', updateFunction);				
			}
			
			// Function to process heart rates
			updateFunction = function(hrmInfo)  {
				var hr = hrmInfo.heartRate;
				
				if (hr < 0) {
					// Set HR value to E if value is error
					hr = 'E';
					
					// Kill reset timer if it's active
					if (hrmResetTimer != null) {
						$interval.cancel(hrmResetTimer);
						hrmResetTimer = null;
					}
				} else if (hr == 0) {
					// Set HR value to spinner if value is initializing
					hrmSpinnerIdx++;
					if (hrmSpinnerIdx >= SPINNER.length) {
						hrmSpinnerIdx = 0;
					}
					hr = SPINNER[hrmSpinnerIdx % SPINNER.length];

					// Watch will return 0's for a while before getting a heart rate. After 20 seconds the watch gives up,
					// so reset the HRM after 20 seconds if it continually gets 0s.
					if (hrmResetTimer == null) {
						hrmResetTimer = $interval(resetFunction, 20000);
					}
				} else {
					// Kill reset timer if it's active
					if (hrmResetTimer != null) {
						$interval.cancel(hrmResetTimer);
						hrmResetTimer = null;
					}
				}
				
				$rootScope.$broadcast('hardware:heartRateChanged', hr);
			};

			tizen.humanactivitymonitor.start('HRM', updateFunction);


			// Pedometer
			tizen.humanactivitymonitor.setAccumulativePedometerListener(function updatePedometer(pmInfo) {
				$rootScope.$broadcast('hardware:pedometerChanged',
						{
							status: pmInfo.stepStatus,
							speed: pmInfo.speed
						}
				);
			});
		}

		$rootScope.$broadcast('hardware:powerChanged', true);
    });

	visibilityChange.onHidden(function() {
    	if (forcedOn) {
    		return;
    	}
    	
    	if (typeof tizen.humanactivitymonitor !== 'undefined') {
			if (typeof tizen.humanactivitymonitor !== 'undefined') {
				tizen.humanactivitymonitor.stop('HRM');
			}

			if (typeof tizen.humanactivitymonitor !== 'undefined') {
				tizen.humanactivitymonitor.unsetAccumulativePedometerListener();
			}
		}

    	$rootScope.$broadcast('hardware:powerChanged', false);
    });

	service.changeView = function(mode) {
		$rootScope.$broadcast('hardware:viewChanged', mode);
	}

	var _timerStartDate = new Date();
	service.resetTimer = function() {
		_timerStartDate = new Date();
	}
	
	service.forceCpu = function(on) {
		if (typeof tizen.power !== undefined) {
			if (on) {
				tizen.power.request('CPU', 'CPU_AWAKE');	
			} else {
				tizen.power.release('CPU');				
			}
		}
	}

	service.forceScreen = function(on) {
		if (typeof tizen.power !== undefined) {
			if (on) {
				tizen.power.request('SCREEN', 'SCREEN_NORMAL');	
			} else {
				tizen.power.release('SCREEN');				
			}
		}
	}

	service.vibrate = function(time) {
		if (typeof navigator.vibrate !== 'undefined' && typeof tizen.power !== undefined) {
			tizen.power.turnScreenOn(); // turn screen on, or else vibrate won't work
			navigator.vibrate(time);
		}
	}



	// Timer
	$interval(function() {
		var data = {};
		
	    var padTimeElement = function padTimeElement(i) {
	        if (i < 10) {
	        	i = '0' + i
	        };
	        return i;
	    };
		
	    var now = new Date();
	    
		{
			var timeDiff = Math.abs(now.getTime() - _timerStartDate.getTime());
			var s = Math.floor(timeDiff / 1000) % 60;
			var m = Math.floor(timeDiff / 1000 / 60) % 60;
			var h = Math.floor(timeDiff / 1000 / 60 / 60) % 24;
			
			data.timerObj = {};
			data.timerObj.hour = padTimeElement(h);
			data.timerObj.minute = padTimeElement(m);
			data.timerObj.second = padTimeElement(s);
		}
		
		{
		    var h = now.getHours();
		    var m = now.getMinutes();
		    var s = now.getSeconds();
		    var d = dateFormat(now, "ddd, mmm d yyyy");
		    
		    data.nowObj = {};
		    data.nowObj.hour = padTimeElement(h);
		    data.nowObj.minute = padTimeElement(m);
		    data.nowObj.second = padTimeElement(s);
		    data.nowObj.date = d;
		    data.nowObj.rawDate = now;
		}	    
	    
		$rootScope.$broadcast('hardware:timeChanged', data);
	}, 500);

	return service;
}]);