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
   var level = Math.floor(battery.level * 100);
   document.querySelector('#battery_level').textContent = Math.floor(battery.level * 100);
}

function updateHeartRate(hrmInfo)  {
	var elem = document.querySelector('#heartrate_level');
	
	if (hrmInfo.heartRate == 0) {
		hrmFailCount++;
		elem.textContent = 'R' + hrmFailCount;
		if (hrmFailCount % 100 == 0) {
			// Sometimes a pulse is never picked up. After about 10 seconds, if you haven't recvd a pulse, reset the HRM
			window.webapis.motion.stop('HRM');
			window.webapis.motion.start('HRM', updateHeartRate);
		}
	} else if (hrmInfo.heartRate >= 0) {
		// Heartrate numbers were taken from calculations on http://www.livestrong.com/article/208307-how-to-calculate-heart-rate-for-fat-burn/
		// Adjusted for 31 yearold individual
		if (hrmInfo.heartRate < 103.95) {
			document.body.style.backgroundColor = 'black';
			if (oldHeartRate >= 103.95) {
				navigator.vibrate(2000);
			}
		} else if (hrmInfo.heartRate >= 103.95 && hrmInfo.heartRate <= 132.3) {
			document.body.style.backgroundColor = 'green';
			if (oldHeartRate < 103.95 || oldHeartRate > 132.3) {
				navigator.vibrate(2000);
			}
		} else {
			document.body.style.backgroundColor = 'red';
			if (oldHeartRate <= 132.3) {
				navigator.vibrate(2000);
			}
		}
		elem.textContent = hrmInfo.heartRate;
		
		oldHeartRate = hrmInfo.heartRate;
	} else if (hrmInfo.heartRate == -3){
		elem.textContent = 'OFF';
		document.body.style.backgroundColor = 'black';
	} else if (hrmInfo.heartRate == -2){
		elem.textContent = 'SHK';
		document.body.style.backgroundColor = 'black';
	}
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
	rssInit();
	
	updateTime();
	timeUpdateTimer = setInterval(updateTime, 500);
	
	document.querySelector('#heartrate_level').textContent = '-';
	oldHeartRate = 0;
	hrmFailCount = 0;
	window.webapis.motion.start('HRM', updateHeartRate);
	
	battery.addEventListener('levelchange', updateBatteryState);
	updateBatteryState();
}

function deactivate() {
	clearInterval(timeUpdateTimer);

	window.webapis.motion.stop('HRM');
	
	battery.removeEventListener('levelchange', updateBatteryState);
}
