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

      var dt;
      var baseField = "token";
      var w = 1200;
      var sortFun = doubletree.sortByStrFld("lemma");
      var currRt;
      
      var showTokenExtras = true;
      
      var nodeFormat = function(info) {
        return doubletree.fieldText(info,"lemma");
      }
      
      var arrays; //the hits and the two contexts we make it global so we can use it for the KWIC
      
      //Sketch Engine stuff
      var skeURL = 'https://www.example.com/bonito/run.cgi/view?format=json&attrs=word,lemma,tag&ctxattrs=word,lemma,tag'; THIS NEEDS TO BE FILLED IN WITH THE ACTUAL URL, keeping "run.cgi/view?format=json&attrs=word,lemma,tag&ctxattrs=word,lemma,tag"
      var numHits = 1000;
      var corpus; //set via GUI
    
      //see below for doubletree specific variables  
      
      ////////////////////////////////////////////////////////// general UI
      function handlePress(e, elt) {
	//CC based on http://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
        // look for window.event in case event isn't passed in
        if (typeof e == 'undefined' && window.event) {
          e = window.event;
        }
        if (e.keyCode == 27 && elt.id == "toUse") {
          document.getElementById("predicted").innerHTML = "";
        } else if (e.keyCode == 13 && elt.id == "toUse") {
          resetData( elt.value );
        } else if (e.keyCode == 13 && elt.id == "toFind") {
            doSearch();
        }  else if (e.keyCode == 13 && e.shiftKey && (elt.id == "leftPOS" || elt.id == "rtPOS")) {
            updateFilters();
        } 
      }
      
      function setCorpus() {
        var selectElt = document.getElementById("corpusSelect");
        corpus = selectElt.options[ selectElt.selectedIndex ].value;
      }

      function setup() {
        setCorpus();
        setUpDT();
        document.getElementById("results").addEventListener("click",
		function(e){
		    if(e.shiftKey) {
			document.getElementById("results").innerHTML = "";
		    }
		},
	    false);
      }
      
      function setMsg(msg) {
        document.getElementById("msg").innerHTML = msg;
      }
      
      ////// UI related to doubletree
      function setUpDT() {
	  filters = {"left":[], "right":[]};
	  
	  dt = new doubletree.DoubleTree();
	  dt.init("#doubletree").visWidth(w).handlers(handlers).showTokenExtra(showTokenExtras).sortFun(sortFun).filters(filters).nodeText(nodeFormat);
      }
      
      function doSearch() {
        var val = document.getElementById("toFind").value.trim()
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
  
  
      ////////////////////////////////////////////////////////// Sketch Engine specific
    function resetData(lemma) {
      document.getElementById("results").innerHTML = "";
      setMsg("Looking up: " + lemma);
      var query = '&q=q[lemma="' + lemma + '"]' +  '&q=r' + numHits;
      var newSKEurl = skeURL + '&corpname=preloaded%2F' + corpus + '&pagesize=' + numHits +  query;
      var val = encodeURIComponent(newSKEurl);
      
      var urlToCall = "http://127.0.0.1:8080/remote?u=" + val;
      
      var concsize, fullsize, resultsSize;
     
      //we can't use d3.json, since the response is not guaranteed to be json
      d3.xhr(urlToCall, function(err,response){
    
        if (err) {
          alert("There was a problem: " + err.responseText + "\n" + err.statusText);
          setMsg("");
          return;
        }
        if (response.responseText.indexOf('{"error"') == 0) {
          var error = JSON.parse(response.responseText).error;
          alert("There was a problem: " + error);
          document.getElementById("numHits").innerHTML = "No results";
          setMsg("");
          return;
        }
      
        var json = JSON.parse(response.responseText);
        var tmp = JSON.stringify(json);
        
        var concsize = json["concsize"];
        var fullsize = json["fullsize"];
        var resultsSize = json["Lines"].length;
        
        var leftArray = [];
        var rtArray = [];
        var kwicArray = [];
        
        for (var i=0;i<resultsSize;i++) {
          var thisLine = json["Lines"][i];
          
          var leftStr = extractStrs( thisLine["Left"]);
          var rtStr = extractStrs( thisLine["Right"]);
          var kwicStr = extractStrs( thisLine["Kwic"]);
          
          leftArray.push(leftStr.split("\t"));
          rtArray.push(rtStr.split("\t"));
          kwicArray.push(kwicStr);

        }
        arrays = [leftArray, kwicArray, rtArray];
        
        var prevDT = dt;
        
        try {
           dt.setupFromArrays(arrays[0], arrays[1], arrays[2], null, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
        } catch(e) {
          alert("There was an error in doubletree. Please report the corpus and the search that you did to:\n\n\tchristopher.culy@uni-tuebingen.de.\n\nThank you.\n\nCorpus: " + corpus + "\nLemma:" + lemma);
          dt = prevDT;
          dt.redraw();
          setMsg("");
          return;
        }
       
        
        if (dt.succeeded()) {
            currRt = lemma;
            document.getElementById("toUse").value = currRt;    
        } else {
            alert("No results found for the filters.");
            dt = prevDT;
            dt.redraw();
        }
        document.getElementById("numHits").innerHTML = "Showing random<br>" + resultsSize + " hits<br>(of  " + fullsize + ")";
        setMsg("");
      });
    }
      
	function extractStrs(piecesArray) {
		//Structure: sequence of pairs of token and info
          // {"class":"","str":" skills"},{"class":"attr","str":"/NN2"},
          // But sometimes they insert html formatting in with "class":"strc", so we delete those
	 
		//NB: the left context seems to get cut off sometimes, so that it starts with an info instead of a token
		if (piecesArray[0]["class"] == "attr") {
		  piecesArray.shift();
		}
          //NB: similarly, the right context seems to get cut off sometimes, so that it ends with token instead of an info
          if (piecesArray[piecesArray.length -1]["class"] == "") {
		  piecesArray.pop();
		}
          
		var what = piecesArray.reduce(function(previousResult, currentValue, index, array){
              var classVal = currentValue["class"];
              if (classVal === 'strc') {
                return previousResult;
              } else if (classVal === "") {
                return previousResult + "\t" + currentValue["str"];
              }
		    return previousResult + " " + currentValue["str"];
		},"");
		
          //fix up / as token vs. / as delimiter
          /*
            ///  means / is lemma, i.e. delim / delim
            // means null lemma, i.e. delim null delim
            space / space means / is token
            
            Use ❣ as substitute for non-delimiter slash
          */
          var re = /\/\/\//g; // i.e. ///
          what = what.replace(re, "/❣/");
          re = / \/ /g; //i.e. space / space
          what = what.replace(re, " ❣ ");
          re = /\//g; //i.e. /
          what = what.replace(re,fieldDelim);
          re = /❣/g;
          what = what.replace(re,"/");
        
          //escape "
          re = /"/g;
          what = what.replace(re, '\\"');
          
          re = /  +/g;
          var re2 = new RegExp(" "+ fieldDelim, "g");
		return what.replace(re2, fieldDelim,"g").replace(re," ").trim();
		
	}
   
      ////////////////////////////////////////////////////////// doubletree specific
      var handlers; //assigned below. 
      var caseSensitive = false;
      var fieldNames = ["token", "lemma", "POS"];
      var fieldDelim = "¦"; //"/";
      var distinguishingFieldsArray = ["token","lemma","POS"];
      
      
      var filters;

      
      ////// define handlers for alt and shift
      
      //resets doubletree to make the clicked node the root
      var altHndlr = function(d,i) {
        var newRt = d.info.lemma[0];
        resetData( newRt );
      };
      
      //shows a KWIC of phrases containing the clicked node (but centered on root node, not clicked node)
      var shiftHndlr = function(d,j) {
          var arraiys = [];
          
            function filterFun(elt,idx) {
              return d.info.ids[idx];
            }
          arraiys[0] = arrays[0].filter(filterFun);
          arraiys[1] = arrays[1].filter(filterFun);
          arraiys[2] = arrays[2].filter(filterFun);
          
          makeKWIC(arraiys);
          window.scroll(0, d3.select("svg").attr("height") -100);
      }
	
      handlers = {"alt":altHndlr, "shift":shiftHndlr};
      
      ////////////////////////////////////////////////////////// KWIC related

    function makeKWIC(arraiys) {
      var what = '<table id="kwic">\n';
      var n = arraiys[1].length;
      for(var i=0;i<n;i++) {
        what += '<tr><td class="kwicLeft"><span class="kwicItem">' + arraiys[0][i].join('</span> <span class="kwicItem kwicLeft">')
        + '</span></td><td class="kwicHit">' + arraiys[1][i] + ' <p class="hitContext"></p>'
        + '</td><td class="kwicRt"> <span class="kwicItem kwicRt">' + arraiys[2][i].join('</span> <span class="kwicItem kwicRt">') + '</span></td></tr>\n';
      }
      what += '</table>';
      document.getElementById("results").innerHTML = what;
      d3.selectAll("span.kwicItem").attr("onclick", "kwicHndlr(this)");
    }
    
    var kwicHndlr = function(itemTD) {
      var item = itemTD.innerHTML;
      
      var lemma = item.split(fieldDelim)[1];
      
      window.scroll(0,0)
      document
      resetData(lemma);
      
    }