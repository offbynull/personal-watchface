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

function SportChart(selector) {
	this.setCurrentHeartRate = function(val) {
		this._heartRate = val;
	}

	this.setCurrentSpeed = function(val) {
		this._speed = val;
	}
	
	this._plot = function() {
		while (this._sportChartCount >= this._sportChartMaxCount) {
			this._sportChart.removeData();
			this._sportChartCount--;
		}
		
		this._sportChart.addData([this._heartRate, this._speed * 10], '');
		this._sportChartCount++;
	}
	
	this.hide = function() {
		this._sportChart.clear();
		this._sportChart.destroy();
		
		this._elem.style.display = 'none';
		
		clearInterval(this._sportChartUpdater);
	}
	
	this.show = function() {
		this._heartRate = 0;
		this._speed = 0;
		
		this._sportChartMaxCount = 60 * 60 / 10; // number of seconds in an hour / 10
		this._sportChartCount = 60 * 60 / 10; // pretend like we've got a full count of points, because initial points is array of maxCount 0s
		
		var data = {
			    labels: Array.apply(null, new Array(this._sportChartMaxCount)).map(String.prototype.valueOf, ''),
			    labelsFilter: function (label) { return true },
			    datasets: [
			        {
			            label: 'HRM',
			            fillColor: 'rgba(220,220,220,0)',
			            strokeColor: "rgba(220,220,220,1)",
			            data: Array.apply(null, new Array(this._sportChartMaxCount)).map(Number.prototype.valueOf, 0),
			        },
			        {
			            label: 'Speed',
			            fillColor: 'rgba(151,187,205,0)',
			            strokeColor: "rgba(151,187,205,1)",
			            data: Array.apply(null, new Array(this._sportChartMaxCount)).map(Number.prototype.valueOf, 0),
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
			};
		
		this._sportChart = new Chart(this._elem.getContext('2d')).Line(data, options);
		this._elem.style.display = 'block';
		
		var thisObj = this;
		this._sportChartUpdater = setInterval(function() {
			thisObj._plot();
		}, 10000); // call once every 10 seconds
	}
	
	
	this._elem = document.querySelector(selector);
}