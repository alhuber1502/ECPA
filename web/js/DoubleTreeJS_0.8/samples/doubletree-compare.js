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
      var dts = {"left":null, "right":null};
      var numPredicted = 10;
      var context = 3;
      var baseField = "token";
      var h = 400;
      
      ////////////////////////////////////////////////////////// general UI
      
      function handlePress(e, elt, leftOrRt) {
	//CC based on http://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
        // look for window.event in case event isn't passed in
        if (typeof e == 'undefined' && window.event) {
          e = window.event;
        }
        if (e.keyCode == 27 &&(elt.id == "toUseleft" || elt.id == "toUseright")) {
          document.getElementById("predicted" + leftOrRt).innerHTML = "";
        } else if (e.keyCode == 13 && (elt.id == "toFind"+leftOrRt)) {
            doSearch(leftOrRt);
        } else if (e.keyCode == 13 && e.shiftKey && (elt.id == ("leftCnt" + leftOrRt) || (elt.id == "rtCnt" + leftOrRt))) {
          updateFilters(leftOrRt);
        } else if (e.keyCode == 13 && elt.id == "toUse" + leftOrRt) {
          if (e.shiftKey) {
              //take what's in the field directly as regex
              dts[leftOrRt].resetDataByRegex( elt.value);
              document.getElementById("predicted" + leftOrRt).innerHTML = "";
              //rootIsRegex = true;
          } else {
          //take first thing in list
            doPredictClick( document.getElementById("predicted" + leftOrRt).getElementsByTagName("LI")[0], leftOrRt );
          }
        } else if ((elt.id == "toUseleft" || elt.id == "toUseright") && e.keyCode !=9 && e.keyCode != 37 && e.keyCode !=39 && e.keyCode !=27) { //don't do on tab, left/right arrow, escape
          //we need to wait until the field is updated :()
          var which = "right";
          if (elt.id == "toUseleft") {
             which = "left";
          }
          setTimeout(function(){
            doPredictive(elt.value, which);
          }, 20)
            
        }
      }
      
      function setup() {
      
	var canRead = window.File && window.FileReader && window.FileList; //TBD ?? which do we really use
	if (! canRead) {
	  document.getElementById("fileChooser").style.display = "none";
          document.getElementById("about").style.marginBottom = "1ex";
	}
	
        dts["left"] = new dtWrapper("leftDT");
        dts["right"] = new dtWrapper("rtDT");
        
        try {
            d3.text("texts/RobinHood_Pyle_tagged.txt", callSetUp);
	} catch(e) {
            callSetUp();    
        }
	function callSetUp(loadedText) {
	    newText = loadedText;
	    setUpDT();
	}
      }
        
      function handleFiles(files) {
	  var file = files[0];
	  var name = file.name;
	  if (file.type != "text/plain") {
	    alert(name + " is not a plain text file. Please select a plain text file instead.");
         document.getElementById("fileIn").value = "";
	    return null;
	  }
	  var reader = new FileReader();
	  reader.readAsText(file);
	  
	  
	  reader.onerror = function(evt) {
	    alert("There was a problem reading " + name);
         document.getElementById("fileIn").value = "";
	  };
	  
	  reader.onabort = function(evt) {
	    alert('File read cancelled');
         document.getElementById("fileIn").value = "";
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
	return null;  
      }

      ////// UI related to doubletree
      
      function setUpDT() {
	  if (! newText ) {
	    newText = document.getElementById("taggedText").innerHTML;	    
	  }
	  textInfo = new textmodel.TextHash( newText, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray );	  
	  uniqItems = textInfo.getUniqItemsWithCounts();
	  
        currRt = dts["left"].currRt;
          
	  if (! textInfo.containsItem(currRt)) {
	    var which = Math.round( uniqItems.length/2 );
	    currRt = uniqItems[ which ].replace(/\t.+$/,"");
	  }
          
          document.getElementById("toUseleft").value = currRt;
          document.getElementById("toUseright").value = currRt;
	  
	  dts["left"].init(currRt);
          dts["right"].init(currRt);
          
	  
      }
      
      function doSearch(which) {
        var val = document.getElementById("toFind" + which).value.trim();
        if (val.length == 0) {
          doClear(which);
        } else {
          var toFind = new RegExp( val );
          document.getElementById("numFound" + which).innerHTML = "Found: " + dts[which].dt.search(toFind);
        }
      }
      
      function doClear(which) {
	document.getElementById("toFind" + which).value = "";
	document.getElementById("numFound" + which).innerHTML = "";
	dts[which].dt.clearSearch();
      }
      
      function doPredictive(str, which) {
          var predictedElt = document.getElementById("predicted" + which);
	  if (! str) {
	    predictedElt.innerHTML = "";
	    return;
	  }
	  var hits = getPredictive(str, numPredicted);
	  if (hits.length == 0) {
	    predictedElt.innerHTML = "";
	    return;
	  }
	  var what = '<ul>\n<li>' + hits.join('</li>\n<li>') + '</li>\n</ul>';
	  predictedElt.innerHTML = what;
	  d3.selectAll("div#predicted" + which + " li").attr("onclick", 'doPredictClick(this, "' + which + '")');
      }
      function doPredictClick(elt, which) {
	  var newRt = elt.innerHTML.replace(/\t.+$/,"").replace(/&gt;/g,">").replace(/&lt;/g,"<"); //since we've added the count onto the end, and we need to use the real < and > (hopefully)
	  document.getElementById("toUse" + which).value = newRt;
	  dts[which].reset(newRt, true);
	  document.getElementById("predicted" + which).innerHTML = "";
      }
      function getPredictive(str, n) {
        if (!n) {
          n= 5;
        }
        try {
          var re = new RegExp('^' + str,'i');
        } catch (e) {} //just to keep it from complaining about a partially completed RE, e.g. with trailing backslash
        var hits = uniqItems.filter(function(item){
          return re.test(item);
        });
        
        return hits.slice(0,n+1);
      }
      
      function updateFilters(which) {
        var dtw = dts[which];
        
        var leftCnt = document.getElementById("leftCnt" + which).value;
        var rtCnt = document.getElementById("rtCnt" + which).value;
        
           var filters = {"left":[], "right":[]};
           
        if (leftCnt) {
          filters["left"][0] = doubletree.filterByMinCount(leftCnt);
        } else {
          filters["left"][0] = null;
        }
        if (rtCnt) {
          filters["right"][0] = doubletree.filterByMinCount(rtCnt);
        } else {
          filters["right"][0] = null;
        }
        
        dtw.resetFilters(filters);

      }
      
      function updateSort(selectObj) {
          var which = selectObj.options[ selectObj.selectedIndex ].value;
          var theFun;
          switch(which) {
            case "POS": theFun = doubletree.sortByStrFld("POS"); break;
            case "count": theFun = doubletree.sortByCount(); break;
            case "branching": theFun = doubletree.sortByContinuations(); break;
            default: theFun = doubletree.sortByStrFld("token");
          }
	  
          var dtw;
          if (selectObj.id == "leftSort") {
            dtw = dts["left"];
          } else {
            dtw = dts["right"];
          }
          dtw.dt.sortFun(theFun).redraw();
          
      }
      
      
      
      ////////////////////////////////////////////////////////// doubletree specific
      var caseSensitive = false;
      var fieldNames = ["token", "POS"];
      var fieldDelim = "/";
      var distinguishingFieldsArray = ["token","POS"];      
	
      //a wrapper around doubletree.DoubleTree. It lets us abstract common complex actions away from individual instances
      function dtWrapper(container) {
        var that = this;
        //defaults
        this.container = container; //need this so we can talk to the other side
	    this.whichSide = container.indexOf("left") == 0 ? "left" : "right";
            this.visW = document.getElementById(container).clientWidth;
            var sortFun = doubletree.sortByStrFld(baseField);
            this.currRt = "tree/NN";
            this.filters = {"left":[], "right":[]};
            this.handlers = {
                "alt":function(d,i) {
                    that.reset(d.name);   //resets doubletree to make the clicked node the root 
                },
                
                "shift":function(d,i) {
                    getOtherDTW(that).reset(d.name); ////resets the other doubletree to make the clicked node the root
                }
                
            };
            this.rootIsRegex = false;
            this.dt = new doubletree.DoubleTree();
            
            
            this.init = function(newRt) {                  
                  this.dt.init("#" + container).visWidth(this.visW).handlers(this.handlers).showTokenExtra(false).sortFun(sortFun).filters(this.filters);
                  this.currRt = newRt;
                  var arraiys = textInfo.getItem(this.currRt, context);
                  this.dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3], caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
            }

	    this.reset = function(newRt, isIndex) {
		var prevDT = this.dt;
		
		var arraiys;
		if (isIndex) {
		  arraiys = textInfo.getItem(newRt, context);
		} else {
		  newRt = textInfo.itemToIndex(newRt);
		  arraiys = textInfo.getItem(newRt, context);
		}
		this.dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3]);
		
		if (this.dt.succeeded()) {
		    this.currRt = newRt;
		    document.getElementById("toUse" + this.whichSide).value = this.currRt;
              this.rootIsRegex = false;
		} else {
		    alert("No results found for the filters.");
		    this.dt = prevDT;
		    this.dt.redraw();
		}
	    }
         
         this.resetDataByRegex = function(regex) {
            var prevDT = this.dt;
            
            var arraiys = textInfo.getItems(regex, context);
        
            this.dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3]);
            
            if (this.dt.succeeded()) {
                this.currRt = regex;
                document.getElementById("toUse" + this.whichSide).value = this.currRt;
                this.rootIsRegex = true;
            } else {
                alert("No results found for the filters.");
                this.dt = prevDT;
                this.dt.redraw();
            }
        }
  
        this.resetFilters = function(filters) {                
              var prevDT = this.dt;
              this.dt.filters(filters).redraw();
              if (! this.dt.succeeded()) {
                  alert("No results found for the filters.");
                  this.dt = prevDT;
                  this.dt.redraw();
              } else {
                    this.filters = filters;
              }
        }
      }
      
      //get the wrapper for the other Doubletree
      function getOtherDTW(thisDTW) {
        if (thisDTW.container == "leftDT") {
            return dts["right"];
        } else {
            return dts["left"];
        }
      }
      