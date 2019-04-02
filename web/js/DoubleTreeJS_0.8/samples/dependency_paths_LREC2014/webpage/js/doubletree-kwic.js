/* (This is the new BSD license.)
* Copyright (c) 2012-2013, Chris Culy
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
      
      ////////////////////////////////////////////////////////// general UI
      function handlePress(e, elt) {
	//CC based on http://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
        // look for window.event in case event isn't passed in
        if (typeof e == 'undefined' && window.event) {
          e = window.event;
        }
        if (e.keyCode == 13 && elt.id == "toFind") {
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
	    return;
	  }
	  var reader = new FileReader();
	  reader.readAsText(file);
	  
	  
	  reader.onerror = function(evt) {
	    alert("There was a problem reading " + name);
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
	    setUpDT();
	  }
	return;  
      }
      
      
      ////// UI related to doubletree
      function doSearch() {
        var toFind = new RegExp( document.getElementById("toFind").value );
        document.getElementById("numFound").innerHTML = "Found: " + dt.search(toFind);
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
        });
        
        return hits.slice(0,n+1);
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
          if (rootIsRegex) {
            arraiys = textInfo.getItems(currRt, howMuch, d.info.ids);
          } else {
            arraiys = textInfo.getItem(currRt, howMuch, d.info.ids);
          }
          //makeKWIC(arraiys);
          makeKWICD3(arraiys);
          window.scroll(0, d3.select("svg").attr("height") -100);
      }
	
      handlers = {"alt":altHndlr, "shift":shiftHndlr};
      
      ////////////////////////////////////////////////////////// KWIC related
      
    //Not used for deprels -- see kwicHelpers.js instead
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