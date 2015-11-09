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

function WeatherChart(xmlAddress, selector) {
	this.LIGHT_RAIN = 2.5; // anything below this or below (in mm) is considered light rain
	this.HEAVY_RAIN = 7.6; // anything below this or above (in mm) is considered heavy rain
	// inbetween is considered moderate rain
	
	this._getDataFromXML = function() {
	    var xmlHttp = new XMLHttpRequest();
	    var thisObj = this;
	
	    xmlHttp.open("GET", this._xmlAddress, true);
	    xmlHttp.onload = function() {
	        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
	            var xmlDoc = xmlHttp.responseXML;
	            var timeItem = xmlDoc.getElementsByTagName('time');

	            var len = (timeItem.length > 12) ? 12 : timeItem.length;
	            for (var i = 0; i < len; i++) {
	            	var from = timeItem[i].attributes['from'].value;
	            	
	            	var year = from.substr(0, 4);
	            	var month = from.substr(5, 2);
	            	var day = from.substr(8, 2);
	            	var hour = from.substr(11, 2);
	            	
	            	var time = new Date(year, month, day, hour);
	            	
	            	var label = dateFormat(time, "d@htt");
	            	
	            	var title = timeItem[i].getElementsByTagName('symbol')[0].attributes['name'].value;
	            	var temp = timeItem[i].getElementsByTagName('temperature')[0].attributes['value'].value;
	            	var percip = timeItem[i].getElementsByTagName('precipitation')[0].attributes['value'].value;
	            	
	            	thisObj._weatherChart.addData([temp, percip, thisObj.LIGHT_RAIN, thisObj.HEAVY_RAIN], label);
	            }
	
	            xmlHttp = null;
	        }
	    };
	
	    xmlHttp.send();
	}
	
	this.hide = function() {
		this._elem.style.display = 'none';
	}
	
	this.show = function() {
		this._elem.style.display = 'block';
	}
	
	
	this._xmlAddress = xmlAddress;
	
	var data = {
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
	
	this._elem = document.querySelector(selector);
	this._weatherChart = new Chart(this._elem.getContext('2d')).Line(data, options);
	
    this._getDataFromXML();
}