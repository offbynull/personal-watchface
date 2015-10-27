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

var XML_ADDRESS = "http://feeds.arstechnica.com/arstechnica/index/",
    XML_METHOD = "GET",
    MSG_CONTACTING = "...",
    MSG_ERR_NODATA = "NO_DATA",
    MSG_ERR_BADRESPONSE = "BAS_RESPONSE",
    MSG_ERR_NOTCONNECTED = "NO_CONN",
    NUM_MAX_NEWS = 10,
    NUM_MAX_LENGTH_SUBJECT = 64,
    arrayNews = [],
    indexDisplay = 0,
    lengthNews = 0;

function trimText(text, maxLength) {
    var trimmedString;

    if (text.length > maxLength) {
        trimmedString = text.substring(0, maxLength - 3) + "...";
    } else {
        trimmedString = text;
    }

    return trimmedString;
}

function resetNewsIndex() {
    indexDisplay = 0;
}

function clearElmText(objElm) {
    objElm.textContent = '';
}

function addElmText(objElm, textClass, textContent) {
    objElm.textContent = textContent;
}

function setNews(index) {
    var objNews = document.querySelector('#news');

    addElmText(objNews, 'subject', arrayNews[index].title);
}

function showNews() {
    setNews(indexDisplay);
}

function showNextNews() {
    if (lengthNews > 0) {
        indexDisplay = (indexDisplay + 1) % lengthNews;
        showNews();
    }
}

function setDefaultEvents() {
	document.querySelector('#news').addEventListener('click', showNextNews);
}

function getDataFromXML() {
    var xmlhttp,
        xmlDoc,
        dataItem,
        objNews = document.querySelector('#news'),
        i;

    arrayNews = [];
    lengthNews = 0;
    clearElmText(objNews);
    addElmText(objNews, 'subject', MSG_CONTACTING);
    xmlhttp = new XMLHttpRequest();

    xmlhttp.open(XML_METHOD, XML_ADDRESS, true);
    xmlhttp.onload = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            clearElmText(objNews);

            xmlDoc = xmlhttp.responseXML;
            dataItem = xmlDoc.getElementsByTagName('item');

            if (dataItem.length > 0) {
                lengthNews = (dataItem.length > NUM_MAX_NEWS) ? NUM_MAX_NEWS : dataItem.length;
                for (i = 0; i < lengthNews; i++) {
                    arrayNews.push({
                        title: dataItem[i].getElementsByTagName('title')[0].childNodes[0].nodeValue,
                        link: dataItem[i].getElementsByTagName('link')[0].childNodes[0].nodeValue
                    });
                    arrayNews[i].title = trimText(arrayNews[i].title, NUM_MAX_LENGTH_SUBJECT);
                }
                resetNewsIndex();
                showNews();
            } else {
                addElmText(objNews, 'subject', MSG_ERR_NODATA);
            }

            xmlhttp = null;
        } else {
        	addElmText(objNews, 'subject', MSG_ERR_BADRESPONSE);
        }
    };
    
    xmlhttp.onerror = function () {
    	addElmText(objNews, 'subject', MSG_ERR_NOTCONNECTED);
    }

    xmlhttp.send();
}

function rssInit() {
    setDefaultEvents();

    getDataFromXML();
}