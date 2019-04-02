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
var dts = {"left":"", "right":""};
var textInfo = {"left":"", "right":""};
var uniqItems = {"left":"", "right":""};

//These are slightly modified versions of the corresponding functions in doubletree-compare.js.
//It would be cleaner just to override those versions here instead of renaming them, as in e.g. doubletree-compare.js w.r.t. doubletree-kwic.js

////////////////////////////////////////////////////////// general UI

function handlePress2(e, elt, leftOrRt) {
	//CC based on http://stackoverflow.com/questions/155188/trigger-a-button-click-with-javascript-on-the-enter-key-in-a-text-box
        // look for window.event in case event isn't passed in
        if (typeof e == 'undefined' && window.event) {
	  e = window.event;
	}
     if (e.keyCode == 27 &&(elt.id == "toUseleft" || elt.id == "toUseright")) {
          document.getElementById("predicted" + leftOrRt).innerHTML = "";
     } else if (e.keyCode == 13 && (elt.id == "toFind"+leftOrRt)) {
            doSearch(leftOrRt);
	}  else if (e.keyCode == 13 && e.shiftKey && (elt.id == ("leftCnt" + leftOrRt) || (elt.id == "rtCnt" + leftOrRt))) {
	    updateFilters(leftOrRt);
        } else if (e.keyCode == 13 && elt.id == "toUse" + leftOrRt) {
	    //take first thing in list
	    doPredictClick( document.getElementById("predicted" + leftOrRt).getElementsByTagName("LI")[0], leftOrRt );
        } else if ((elt.id == "toUseleft" || elt.id == "toUseright") && e.keyCode !=9 && e.keyCode != 37 && e.keyCode !=39 && e.keyCode !=27) { //don't do on tab, left/right arrow, escape
	     //we need to wait until the field is updated :()
             var which = "right";
             if (elt.id == "toUseleft") {
                which = "left";
             }
	    setTimeout(function(){
	      doPredictive2(elt.value, which);
	    }, 20)
	    
	}
}

function setup2() {
      
	var canRead = window.File && window.FileReader && window.FileList; //TBD ?? which do we really use
	if (! canRead) {
	  document.getElementById("fileChooserLeft").style.display = "none";
          document.getElementById("fileChooserRt").style.display = "none";
          document.getElementById("about").style.marginBottom = "1ex";
          
          
	}
	
        dts["left"] = new dtWrapper2("leftDT", 'left');
        dts["right"] = new dtWrapper2("rtDT", 'right');
        
        try {
            d3.text("texts/RobinHood_Pyle_tagged.txt", callSetUpLeft);
        } catch(e) {
            callSetUpLeft();    
        }
        
	function callSetUpLeft(loadedText) {
	    setUpDT2(loadedText,'left');
	}
            
	try {
            d3.text("texts/RobinHood_Creswick_tagged.txt", callSetUpRight);
	 } catch(e) {
            callSetUpRight();
         }
         
	function callSetUpRight(loadedText) {
	    setUpDT2(loadedText,'right');
	}
	
}

function handleFiles2(files, which) {
	  var file = files[0];
	  var name = file.name;
	  if (file.type != "text/plain") {
	    alert(name + " is not a plain text file. Please select a plain text file instead.");
         document.getElementById("fileIn" + which).value = "";
	    return null;
	  }
	  var reader = new FileReader();
	  reader.readAsText(file);
	  
	  
	  reader.onerror = function(evt) {
	    alert("There was a problem reading " + name);
         document.getElementById("fileIn" + which).value = "";
	  };
	  
	  //reader.onprogress = updateProgress;
	  reader.onabort = function(evt) {
	    alert('File read cancelled');
         document.getElementById("fileIn" + which).value = "";
	  };
	  
	  reader.onload = function(e) {	    
	    document.getElementById('loadProgress').style.display = "none";
	    setUpDT2(reader.result, which);
	  }
	return null;  
}

////// UI related to doubletree

function setUpDT2(newText, side) {
      if (! newText ) {
        newText = document.getElementById("taggedText" + side).innerHTML;
      }
      textInfo[side] = new textmodel.TextHash( newText, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray );	  
      uniqItems[side] = textInfo[side].getUniqItemsWithCounts();
      
      var currRt = dts[side].currRt;
      
      if (! textInfo[side].containsIndex(currRt)) {
        var which = Math.round( uniqItems[side].length/2 );
        currRt = uniqItems[side][ which ].replace(/\t.+$/,"");
      }
      
      document.getElementById("toUse" + side).value = currRt;
      
      dts[side].init(currRt);
}
      
function doPredictive2(str, which) {
    var predictedElt = document.getElementById("predicted" + which);
    if (! str) {
      predictedElt.innerHTML = "";
      return;
    }
    var hits = getPredictive2(str, numPredicted, which);
    if (hits.length == 0) {
      predictedElt.innerHTML = "";
      return;
    }
    var what = '<ul>\n<li>' + hits.join('</li>\n<li>') + '</li>\n</ul>';
    predictedElt.innerHTML = what;
    d3.selectAll("div#predicted" + which + " li").attr("onclick", 'doPredictClick(this, "' + which + '")');
}

function getPredictive2(str, n, which) {
  if (!n) {
    n= 5;
  }
  try {
    var re = new RegExp('^' + str,'i');
  } catch (e) {} //just to keep it from complaining about a partially completed RE, e.g. with trailing backslash
  var hits = uniqItems[which].filter(function(item){
    return re.test(item);
  });
  
  return hits.slice(0,n+1);
}



////////////////////////////////////////////////////////// doubletree specific

//a wrapper around doubletree.DoubleTree. It lets us abstract common complex actions away from individual instances.
function dtWrapper2(container, side) {
      var that = this;
      //defaults
      this.container = container;
      this.whichSide = side;
      this.visW = document.getElementById(container).clientWidth;
      this.sortFun = doubletree.sortByStrFld(baseField);
      this.currRt = "tree/NN";
      this.filters = {"left":[], "right":[]};
      this.handlers = {
          "alt":function(d,i) {
              that.reset(d.name);    
          },
          
          "shift":function(d,i) {
              getOtherDTW(that).reset(d.name);
          }
          
      };
      this.dt = new doubletree.DoubleTree();
      
      this.init = function(newRt) {                  
            this.dt.init("#" + container).visWidth(this.visW).handlers(this.handlers).showTokenExtra(false).sortFun(sortFun).filters(this.filters);
            this.currRt = newRt;
            var arraiys = textInfo[side].getItem(this.currRt, context);
            this.dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3], caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
      }

	this.reset = function(newRt, isIndex) {
	    var prevDT = this.dt;
	    
	    if (newRt != undefined) {
		if (isIndex) {
			var containsIT = textInfo[side].containsIndex(newRt);
		} else {
			containsIT = textInfo[side].containsItem(newRt);
		}
	    
	    	if (! containsIT) {
			var doc = document.getElementById("fileIn" + side).value;
			alert(newRt + " is not in " + doc);
			return;
		}
	    }
	    
	    var arraiys;
	    if (isIndex) {
	      arraiys = textInfo[side].getItem(newRt, context);
	    } else {
	      newRt = textInfo[side].itemToIndex(newRt);
	      arraiys = textInfo[side].getItem(newRt, context);
	    }
	    this.dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3]);
	    
	    if (this.dt.succeeded()) {
		this.currRt = newRt;
		document.getElementById("toUse" + this.whichSide).value = this.currRt;
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



