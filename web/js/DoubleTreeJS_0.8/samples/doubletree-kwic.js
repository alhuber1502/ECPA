/* (This is the new BSD license.)
* Copyright (c) 2012-2014, Chris Culy
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of the Chris Culy nor the 
*		names of its contributors may be used to endorse or promote 
*		products from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY Chris Culy
* ``AS IS'' AND ANY OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
* THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
* ARE DISCLAIMED. IN NO EVENT SHALL Chris Culy
* BE LIABLE FOR ANY, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
* CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE 
* GOODS OR SERVICES; OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
* CAUSED AND ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
* TORT INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF 
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
"use strict";

      var newText;
      var textInfo;
      var uniqItems;
      var dt;
      var numPredicted = 10;
      var context = 5;
      var extendedContext = 20;
      var baseField = "token";
      var w = 1200;
      var sortFun = doubletree.sortByStrFld(baseField);
      var currRt;
      
      var showTokenExtras = true;
      
      var rootIsRegex = false;
      
      //punctuation from http://stackoverflow.com/questions/7576945/javascript-regular-expression-for-punctuation-international
      //but it didn't work right for some reason
      //var kPunc = "!-#%-\x2A,-/:;\x3F@\x5B-\x5D_\x7B}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65";

      var kPunc = '\'!"§$%&/()=?`´*@#><°;,:._;`´-';
      var punc = '';

      
      ////////////////////////////////////////////////////////// general UI
      function handlePress(e, elt) {
	//CC based on http://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
        // look for window.event in case event isn't passed in
        if (typeof e == 'undefined' && window.event) {
          e = window.event;
        }
        if (e.keyCode == 27 && elt.id == "toUse") {
          document.getElementById("predicted").innerHTML = "";
        } else if (e.keyCode == 13 && elt.id == "toFind") {
            doSearch();
        }  else if (e.keyCode == 13 && e.shiftKey && (elt.id == "leftPOS" || elt.id == "rtPOS")) {
            updateFilters();
        } else if (e.keyCode == 13 && elt.id == "toUse") {
            if (e.shiftKey) {
              //take what's in the field directly as regex
              resetDataByRegex( elt.value );
              document.getElementById("predicted").innerHTML = "";
              rootIsRegex = true;
            } else {
              //take first thing in list
              var todo = document.getElementById("predicted").getElementsByTagName("LI")[0];
              if (undefined == todo) {
               return
              }
              rootIsRegex = false;
              doPredictClick( todo );
              
            }
        } else if (elt.id == "toUse" && e.keyCode !=9 && e.keyCode != 37 && e.keyCode !=39 && e.keyCode !=27) { //don't do on tab, left/right arrow, escape
          //we need to wait until the field is updated :( 
          setTimeout(function(){
            doPredictive(elt.value);
          }, 20);
        } 
      }
      
      function handleFiles(files) {
        if (files.length === 0) {
          return;
        }
	  var file = files[0];
	  var name = file.name;
	  if (file.type != "text/plain") {
	    alert(name + " is not a plain text file. Please select a plain text file instead.");
         document.getElementById("fileIn").value = "";
	    return;
	  }
	  var reader = new FileReader();
	  reader.readAsText(file);
	  
	  
	  reader.onerror = function(evt) {
	    alert("There was a problem reading " + name);
         document.getElementById("fileIn").value = "";
	  };
	  
	  //reader.onprogress = updateProgress;
	  reader.onabort = function(evt) {
	    alert('File read cancelled');
	  };
	  
	  reader.onloadstart = function(e) {
	    newText = null;
	    document.getElementById('loadProgress').innerHTML = 'Reading ' + name + '...';
	    document.getElementById('loadProgress').style.display = "inline";
	  };
	  reader.onload = function(e) {	    
	    document.getElementById('loadProgress').style.display = "none";
	    newText = reader.result;
         clearHistory();
	    setUpDT();
	  }
	return;  
      }
      
      
      ////// UI related to doubletree
      function doSearch() {
        var val = document.getElementById("toFind").value.trim();
        if (val.length == 0) {
          doClear();
        } else {
          var toFind = new RegExp( val );
          document.getElementById("numFound").innerHTML = "Found: " + dt.search(toFind);
        }
      }
      
      function doClear() {
        document.getElementById("toFind").value = "";
        document.getElementById("numFound").innerHTML = "";
        dt.clearSearch();
      }
      
      function togglePOS(checkBox) {
        showTokenExtras = checkBox.checked;
        dt.showTokenExtra(showTokenExtras).updateTokenExtras();
      }
      
      function doPredictive(str) {
        if (! str) {
          document.getElementById("predicted").innerHTML = "";
          return;
        }
        var hits = getPredictive(str, numPredicted);
        if (hits.length == 0) {
          document.getElementById("predicted").innerHTML = "";
          return;
        }
        var what = '<ul>\n<li>' + hits.join('</li>\n<li>') + '</li>\n</ul>';
        document.getElementById("predicted").innerHTML = what;
        d3.selectAll("div#predicted li").attr("onclick", 'doPredictClick(this)');
      }
      
      function doPredictClick(elt) {
        document.getElementById("results").innerHTML = "";
        
        var newRt = elt.innerHTML.replace(/\t.+$/,"").replace(/&gt;/g,">").replace(/&lt;/g,"<"); //since we've added the count onto the end, and we need to use the real < and > (hopefully)
        resetData(newRt, true);
        document.getElementById("predicted").innerHTML = "";
      }
      
      function getPredictive(str, n) {
        if (!n) {
          n= 5;
        }
        try {
          var re = new RegExp('^' + str,'i');
        } catch (e) {
            //just to keep it from complaining about a partially completed RE, e.g. with trailing \
            //no, don't like the behavior, since it wipes out the list we've done so far
            //return ""; 
        } 
        
        var hits = uniqItems.filter(function(item){
          if (re) {
           return re.test(item);
          }
          return null;
        })
        .map(function(item) {
          return item.replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        });
        
        return hits.slice(0,n+1);
      }
      
      function updatePunc() {
        //cf updateContext() in doubletree-filtered.js
        
        if (document.getElementById("punc").checked) {
          punc = kPunc;
        } else {
          punc = "";
        }
        var searchTerm = document.getElementById("toUse").value;
        if (rootIsRegex) {
            resetDataByRegex(searchTerm);
        } else {
            resetData(searchTerm, true);
        }
      }
      
      function updateFilters() {
        var leftPOS = document.getElementById("leftPOS").value.replace(/^ +/,"").replace(/ +$/,"");
        var rtPOS = document.getElementById("rtPOS").value.replace(/^ +/,"").replace(/ +$/,"");
        
        if (leftPOS) {
          filters["left"][0] = doubletree.filterByPOS(leftPOS);
        } else {
          filters["left"][0] = null;
        }
        if (rtPOS) {
          filters["right"][0] = doubletree.filterByPOS(rtPOS);
        } else {
          filters["right"][0] = null;
        }
        
        var prevDT = dt;
        dt.filters(filters).redraw();
        if (! dt.succeeded()) {
            alert("No results found for the filters.");
            dt = prevDT;
            dt.redraw();
        }
      
      }
      
      function updateSort() {
        if (document.getElementById("posSort").checked) {
          sortFun = doubletree.sortByStrFld("POS");
        } else if (document.getElementById("contSort").checked) {
          sortFun = doubletree.sortByContinuations();
        } else {
          sortFun = doubletree.sortByStrFld(document.getElementById("defaultSort").value);
        }
        dt.sortFun(sortFun).redraw();
      }
      
  
      ////////////////////////////////////////////////////////// doubletree specific
      var handlers; //assigned below. 
      var caseSensitive = false;
      var fieldNames = ["token", "POS"];
      var fieldDelim = "/";
      var distinguishingFieldsArray = ["token","POS"];
      
      
      var filters;
      
      //sets doubletree to having data with root newRt
      
      ////// define handlers for alt and shift
      
      //resets doubletree to make the clicked node the root
      var altHndlr = function(d,i) {
	var newRt = d.name;
	resetData( newRt );
      };
      
      //shows a KWIC of phrases containing the clicked node (but centered on root node, not clicked node)
      var shiftHndlr = function(d,j) {
	var arraiys;
	var howMuch = Math.round(1.5*context);
      //TBD: use same left/right filters (not contextFilters) as use for DT
	if (rootIsRegex) {
	  arraiys = textInfo.getItems(currRt, howMuch, d.info.ids, null);
	} else {
	  arraiys = textInfo.getItem(currRt, howMuch, d.info.ids, false, null);
	}
	makeKWIC(arraiys);
	window.scroll(0, d3.select("svg").attr("height") -100);
      }
	
      handlers = {"alt":altHndlr, "shift":shiftHndlr};
      
      ////////////////////////////////////////////////////////// KWIC related
      
      function makeKWIC(arraiys) {
	var what = '<table id="kwic">\n';
	var n = arraiys[1].length;
	for(var i=0;i<n;i++) {
	  var thisID = arraiys[3][i];
	  what += '<tr><td class="kwicLeft"><span class="kwicItem">' + arraiys[0][i].join('</span> <span class="kwicItem kwicLeft">')
	  + '</span></td><td class="kwicHit"> <span onclick="hitHndlr(\'' + currRt + '\',' + thisID + ')">' + arraiys[1][i] + '</span> <p class="hitContext" id="hitContext_' + thisID + '"></p>'
	  + '</td><td class="kwicRt"> <span class="kwicItem kwicRt">' + arraiys[2][i].join('</span> <span class="kwicItem kwicRt">') + '</span></td></tr>\n';
	}
	what += '</table>';
	document.getElementById("results").innerHTML = what;
	d3.selectAll("span.kwicItem").attr("onclick", "kwicHndlr(this)");
	d3.selectAll("p.hitContext").attr("onclick", "hideHitContext(this)");
      }
      
      var kwicHndlr  = function(itemTD) {	
	var newRt = itemTD.innerHTML.replace(/&gt;/g,">").replace(/&lt;/g,"<");
	resetData( newRt );
	window.scroll(0,0);
      }
      
      var hitHndlr = function(item, id) {
	  var context = textInfo.getItemContext(item, extendedContext, id);
	  document.getElementById("hitContext_" + id).innerHTML = context;
      }
      var hideHitContext = function(elt) {
	  elt.innerHTML = "";
      }