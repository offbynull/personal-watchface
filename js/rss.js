/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 * (with modifications from Kasra Faghihi)
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

function Rss(xmlAddress, selector) {
	this._MSG_CONTACTING = "...";
	this._MSG_ERR_NODATA = "NO_DATA";
	this._MSG_ERR_BADRESPONSE = "BAD_RESPONSE";
	this._MSG_ERR_NOTCONNECTED = "NO_CONN";
	this._indexDisplay = 0;
	this._lengthNews = 0;

	this.hide = function() {
		this._elem.style.display = 'none';
	}
	
	this.show = function() {
		this._indexDisplay = 0;
		this._lengthNews = 0;
		
	    this._setDefaultEvents();
	    this._getDataFromXML();
	    
		this._elem.style.display = 'block';
	}

	this._trimText = function(text) {
	    var trimmedString;
	    var maxLength = 64;
	
	    if (text.length > maxLength) {
	        trimmedString = text.substring(0, maxLength - 3) + "...";
	    } else {
	        trimmedString = text;
	    }
	
	    return trimmedString;
	}
	
	this._setDefaultEvents = function() {
		var thisObj = this;
		this._elem.addEventListener('click', function() {
			if (thisObj._lengthNews > 0) {
				thisObj._indexDisplay = (thisObj._indexDisplay + 1) % thisObj._lengthNews;
				thisObj._elem.textContent = thisObj._arrayNews[thisObj._indexDisplay];
		    }
		});
	}
	
	this._getDataFromXML = function() {
		this._arrayNews = [];
		this._lengthNews = 0;
		this._elem.textContent = this._MSG_CONTACTING;
		var thisObj = this;
	    var xmlHttp = new XMLHttpRequest();
	
	    xmlHttp.open("GET", this._xmlAddress, true);
	    xmlHttp.onload = function() {
	        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
	        	thisObj._elem.textContent = '';
	
	            var xmlDoc = xmlHttp.responseXML;
	            var dataItem = xmlDoc.getElementsByTagName('item');
	            
	            var maxNewsItems = 10;
	
	            if (dataItem.length > 0) {
	            	thisObj._lengthNews = (dataItem.length > maxNewsItems) ? maxNewsItems : dataItem.length;
	                for (var i = 0; i < thisObj._lengthNews; i++) {
	                	var title = dataItem[i].getElementsByTagName('title')[0].childNodes[0].nodeValue;
	                	var trimmedTitle = thisObj._trimText(title);
	                	thisObj._arrayNews.push(trimmedTitle);
	                }
	                thisObj._indexDisplay = 0;
	                thisObj._elem.textContent = thisObj._arrayNews[0];
	            } else {
	            	thisObj._elem.textContent = thisObj._MSG_ERR_NODATA;
	            }
	
	            xmlHttp = null;
	        } else {
	        	thisObj._elem.textContent = thisObj._MSG_ERR_BADRESPONSE;
	        }
	    };
	    
	    xmlHttp.onerror = function () {
	    	thisObj._elem.textContent = thisObj._MSG_ERR_NOTCONNECTED;
	    }
	
	    xmlHttp.send();
	}
	
	
	this._xmlAddress = xmlAddress;
	this._elem = document.querySelector(selector);
}