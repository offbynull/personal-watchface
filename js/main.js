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

function updateTime() {
	var d, h, m, s;
	var now = new Date();
	
	if (typeof timerStartDate !== 'undefined') {
		var timeDiff = Math.abs(now.getTime() - timerStartDate.getTime());
		s = Math.floor(timeDiff / 1000) % 60;
		m = Math.floor(timeDiff / 1000 / 60) % 60;
		h = Math.floor(timeDiff / 1000 / 60 / 60) % 24;
		d = '';
	} else {
	    h = now.getHours();
	    m = now.getMinutes();
	    s = now.getSeconds();
	    d = dateFormat(now, "ddd, mmm d yyyy");
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
    document.querySelector('#date').textContent = d;
}

function updateBatteryState()  {
	var elem = document.querySelector('#battery_level');
	var elem_icon = document.querySelector('#battery_icon');
	var elem_outter = document.querySelector('#battery');
    
	var level = Math.floor(battery.level * 100);
	elem.textContent = Math.floor(battery.level * 100);
	
	if (level <= 20) {
		elem_outter.style.color = 'red';
		elem_icon.className = 'fa fa-battery-0';
	} else if (level <= 40) { 
		elem_outter.style.color = 'yellow';
		elem_icon.className = 'fa fa-battery-1';
	} else if (level <= 60) {
		elem_outter.style.color = '';
		elem_icon.className = 'fa fa-battery-2';
	} else if (level < 80) {
		elem_outter.style.color = '';
		elem_icon.className = 'fa fa-battery-3';
	} else {
		elem_outter.style.color = '';
		elem_icon.className = 'fa fa-battery-4';
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
		lastHeartRate = hrmInfo.heartRate;
	} else if (hrmInfo.heartRate >= 0) {
		// Heartrate numbers were taken from calculations on http://www.livestrong.com/article/208307-how-to-calculate-heart-rate-for-fat-burn/
		// Adjusted for 31 yearold individual
		if (hrmInfo.heartRate < sport_chart.MIN_GOOD_HEART_RATE) {
			elem_outter.style.color = '';
			if (lastHeartRate >= sport_chart.MIN_GOOD_HEART_RATE) {
				// Vibrate won't work if the screen is off, so temporarily turn it on
				turnOnAndVibrate();
			}
		} else if (hrmInfo.heartRate >= sport_chart.MIN_GOOD_HEART_RATE && hrmInfo.heartRate <= sport_chart.MAX_GOOD_HEART_RATE) {
			elem_outter.style.color = 'lime';
			if (lastHeartRate < sport_chart.MIN_GOOD_HEART_RATE || lastHeartRate > sport_chart.MAX_GOOD_HEART_RATE) {
				// Vibrate won't work if the screen is off, so temporarily turn it on
				turnOnAndVibrate();
			}
		} else {
			elem_outter.style.color = 'red';
			if (lastHeartRate <= sport_chart.MAX_GOOD_HEART_RATE) {
				// Vibrate won't work if the screen is off, so temporarily turn it on
				turnOnAndVibrate();
			}
		}
		
		elem.textContent = hrmInfo.heartRate;
		lastHeartRate = hrmInfo.heartRate;
	} else if (hrmInfo.heartRate == -3){
		elem.textContent = 'OFF';
		elem_outter.style.color = '';
		lastHeartRate = 0;
	} else if (hrmInfo.heartRate == -2){
		elem.textContent = 'SHK';
		elem_outter.style.color = '';
		lastHeartRate = 0;
	}
	
	sport_chart.setCurrentHeartRate(lastHeartRate);
}

function turnOnAndVibrate() {
	tizen.power.turnScreenOn(); // turn screen on, or else vibrate won't work
	navigator.vibrate(2000);
}

function updatePedometer(pedometerInfo) {
	var elem = document.querySelector('#pedometer_level');
	var elem_outter = document.querySelector('#pedometer');

	if (pedometerInfo.stepStatus == 'WALKING') {
		elem_outter.style.color = 'lime';
		lastSpeed = pedometerInfo.speed;
	} else if (pedometerInfo.stepStatus == 'NOT_MOVING') {
		elem_outter.style.color = '';
		lastSpeed = 0;
	} else {
		elem_outter.style.color = 'yellow';
		lastSpeed = pedometerInfo.speed;
	}
	
	elem.textContent = pedometerInfo.speed;
	sport_chart.setCurrentSpeed(pedometerInfo.speed);
}

function timerSwitched() {
	var checkbox = document.querySelector('#timerSwitch');
	if (checkbox.checked) {
		timerStartDate = new Date();
	} else {
		timerStartDate = undefined;
	}
}

function sportSwitched() {
	var elem = document.querySelector('#sport_chart');
	var countersElem = document.querySelector('#counters');

	var checkbox = document.querySelector('#sportSwitch');
	if(checkbox.checked === true) {
		weather_chart.hide();
		rss.hide();
		sport_chart.show();
		
		document.querySelector('#counters').style.display = 'block';
		zeroCounter();
		
		tizen.power.request('CPU', 'CPU_AWAKE');

		lastHeartRate = 0;
		lastSpeed = 0;
	} else {
		weather_chart.show();
		rss.show();
		sport_chart.hide();
		
		document.querySelector('#counters').style.display = 'none';
		
		tizen.power.release('CPU');
	}
}

function incrementCounter() {
	document.querySelector('#number').textContent++;
}


function decrementCounter() {
	var num = document.querySelector('#number').textContent;
	if (num == 0) {
		return;
	}
	num--;
	document.querySelector('#number').textContent = num;
}


function zeroCounter() {
	document.querySelector('#number').textContent = '0';
}

function init() {	
	battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
	
	rss = new Rss('http://feeds.arstechnica.com/arstechnica/index/', '#news');
	weather_chart = new WeatherChart('http://www.yr.no/place/Canada/British_Columbia/Vancouver/forecast.xml', '#weather_chart');
	sport_chart = new SportChart('#sport_chart');
	
	document.querySelector('#counters').style.display = 'none';
	
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
	updateTime();
	timeUpdateTimer = setInterval(updateTime, 500);
	
	if (document.querySelector('#sportSwitch').checked === false) {
		document.querySelector('#pedometer').style.color = '';
		document.querySelector('#pedometer_level').textContent = '-';
		document.querySelector('#heartrate').style.color = '';
		document.querySelector('#heartrate_level').textContent = '-';

		rss.show();
		weather_chart.show();

		hrmFailCount = 0;
		tizen.humanactivitymonitor.start('HRM', updateHeartRate);
		tizen.humanactivitymonitor.setAccumulativePedometerListener(updatePedometer);
	}
	
	document.querySelector('#battery').style.color = '';
	document.querySelector('#battery_level').textContent = '-';
	battery.addEventListener('levelchange', updateBatteryState);
	updateBatteryState();
}

function deactivate() {
	clearInterval(timeUpdateTimer);

	if (document.querySelector('#sportSwitch').checked === false) {
		rss.hide();
		weather_chart.hide();

		tizen.humanactivitymonitor.stop('HRM');
		tizen.humanactivitymonitor.unsetAccumulativePedometerListener();
	}
	
	battery.removeEventListener('levelchange', updateBatteryState);
}
