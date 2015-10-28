/*
 * Copyright (c) 2015 Kasra Faghihi. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function updateTime() {
	var h, m, s;
	
	if (typeof timerStartDate !== 'undefined') {
		var timeDiff = Math.abs(new Date().getTime() - timerStartDate.getTime());
		s = Math.floor(timeDiff / 1000) % 60;
		m = Math.floor(timeDiff / 1000 / 60) % 60;
		h = Math.floor(timeDiff / 1000 / 60 / 60) % 24;
	} else {
	    var today = new Date();
	    h = today.getHours();
	    m = today.getMinutes();
	    s = today.getSeconds();
	}
    
    var padTimeElement = function padTimeElement(i) {
        if (i < 10) {
        	i = '0' + i
        };
        return i;
    };
    
    h = padTimeElement(h);
    m = padTimeElement(m);
    s = padTimeElement(s);
    document.querySelector('#time').textContent = h + ':' + m + ':' + s;
}

function updateBatteryState()  {
	var elem = document.querySelector('#battery_level');
	var elem_icon = document.querySelector('#battery_icon');
	var elem_outter = document.querySelector('#battery');
   
	var level = Math.floor(battery.level * 100);
	elem.textContent = Math.floor(battery.level * 100);
	
	if (level <= 20) {
		elem_outter.style.color = 'red';
		elem_icon.className = 'fa fa-battery-0'
	} else if (level <= 40) {
		elem_outter.style.color = 'yellow';
		elem_icon.className = 'fa fa-battery-1'
	} else if (level <= 60) {
		elem_outter.style.color = '';
		elem_icon.className = 'fa fa-battery-2'
	} else if (level <= 80) {
		elem_outter.style.color = '';
		elem_icon.className = 'fa fa-battery-3'
	} else {
		elem_outter.style.color = '';
		elem_icon.className = 'fa fa-battery-4'
	}
}

SPINNER = ['|', '/', '-', '\\'];

function updateHeartRate(hrmInfo)  {
	var elem = document.querySelector('#heartrate_level');
	var elem_outter = document.querySelector('#heartrate');
	
	if (hrmInfo.heartRate == 0) {
		hrmFailCount++;
		 
		elem.textContent = SPINNER[hrmFailCount % SPINNER.length];
		if (hrmFailCount % 200 == 0) {
			// If you get 201 0's in a row, the sensor gives up. Close it and re-open it to try again.
			tizen.humanactivitymonitor.stop('HRM');
			tizen.humanactivitymonitor.start('HRM', updateHeartRate);
		}
		
		elem_outter.style.color = '';
	} else if (hrmInfo.heartRate >= 0) {
		// Heartrate numbers were taken from calculations on http://www.livestrong.com/article/208307-how-to-calculate-heart-rate-for-fat-burn/
		// Adjusted for 31 yearold individual
		if (hrmInfo.heartRate < 103.95) {
			elem_outter.style.color = '';
			if (oldHeartRate >= 103.95) {
				navigator.vibrate(2000);
			}
		} else if (hrmInfo.heartRate >= 103.95 && hrmInfo.heartRate <= 132.3) {
			elem_outter.style.color = 'green';
			if (oldHeartRate < 103.95 || oldHeartRate > 132.3) {
				navigator.vibrate(2000);
			}
		} else {
			elem_outter.style.color = 'red';
			if (oldHeartRate <= 132.3) {
				navigator.vibrate(2000);
			}
		}
		elem.textContent = hrmInfo.heartRate;
		
		oldHeartRate = hrmInfo.heartRate;
	} else if (hrmInfo.heartRate == -3){
		elem.textContent = 'OFF';
		elem_outter.style.color = '';
	} else if (hrmInfo.heartRate == -2){
		elem.textContent = 'SHK';
		elem_outter.style.color = '';
	}
}

function updatePedometer(pedometerInfo) {
	var elem = document.querySelector('#pedometer_level');
	var elem_outter = document.querySelector('#pedometer');

	if (pedometerInfo.stepStatus == 'WALKING') {
		elem_outter.style.color = 'green';
	} else if (pedometerInfo.stepStatus == 'NOT_MOVING') {
		elem_outter.style.color = '';
	} else {
		elem_outter.style.color = 'yellow';
	}
	
	elem.textContent = pedometerInfo.speed;
}

function timerSwitched() {
	var checkbox = document.querySelector('#timerSwitch');
	if (checkbox.checked) {
		timerStartDate = new Date();
	} else {
		timerStartDate = undefined;
	}
}

function screenStateSwitched() {
	var checkbox = document.querySelector('#screenStateSwitch');
	if(checkbox.checked === true) {
		tizen.power.request('SCREEN', 'SCREEN_NORMAL');
	} else {
		tizen.power.release('SCREEN');
	}
}

function init() {
	battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
	
	document.addEventListener('visibilitychange', function() {
	    if (document.hidden) {
	    	deactivate();
	    } else {
	    	activate();
	    }
	}, false);
	
	activate();
}

function activate() {
	document.querySelector('#battery').style.color = '';
	document.querySelector('#battery_level').textContent = '';
	document.querySelector('#pedometer').style.color = '';
	document.querySelector('#pedometer_level').textContent = '';
	document.querySelector('#heartrate').style.color = '';
	document.querySelector('#heartrate_level').textContent = '';
	
	rssInit();
	
	updateTime();
	timeUpdateTimer = setInterval(updateTime, 500);
	
	oldHeartRate = 0;
	hrmFailCount = 0;
	tizen.humanactivitymonitor.start('HRM', updateHeartRate);
	
	tizen.humanactivitymonitor.setAccumulativePedometerListener(updatePedometer);
	
	battery.addEventListener('levelchange', updateBatteryState);
	updateBatteryState();
}

function deactivate() {
	clearInterval(timeUpdateTimer);

	tizen.humanactivitymonitor.stop('HRM');
	
	tizen.humanactivitymonitor.unsetAccumulativePedometerListener();
	
	battery.removeEventListener('levelchange', updateBatteryState);
}
