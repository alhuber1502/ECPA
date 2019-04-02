/* (This is the new BSD license.)
* Copyright (c) 2012-13, Chris Culy
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

function nodeFormat(info, isRoot) {
    if (isRoot) {
        return currRt;
    }
    return doubletree.tokenText(info);
}

function tokenExtraFormat(info, isRoot) {
    if (isRoot) {
        return "";
    }
    return doubletree.fieldText(info, "POS");
}

function setUpDT() {
    filters = {"left":[], "right":[]};
    
    if (! newText ) {
      newText = document.getElementById("taggedText").innerHTML;
      currRt = "tree/NN";
      document.getElementById("toUse").value = currRt;
    }
    textInfo = new textmodel.TextHash( newText, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray, baseField );
    uniqItems = textInfo.getUniqItemsWithCounts();
    
    if (! textInfo.containsItem(currRt)) {
      var which = Math.round( uniqItems.length/2 );
      currRt = uniqItems[ which ].replace(/\t.+$/,"");
      document.getElementById("toUse").value = currRt;
    }
    
    dt = new doubletree.DoubleTree();
    dt.init("#doubletree").visWidth(w).handlers(handlers).showTokenExtra(showTokenExtras).sortFun(sortFun).filters(filters).nodeText(nodeFormat).tokenExtraText(tokenExtraFormat);
    dt.setupFromArrays([], [], [], [], caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
    resetData(currRt, true);
}


//updates the context according to the filters
function updateContext() {
      
    var searchTerm = document.getElementById("toUse").value;
    if (rootIsRegex) {
        resetDataByRegex(searchTerm);
    } else {
        resetData(searchTerm, true);
    }
}
      
//sets doubletree to having data with root newRt
function resetData(newRt, isIndex) {
  var prevDT = dt;
  var prevRt = currRt;
  
  var contextFilter = getContextFilter();
  
  var arraiys;
  /*
  if (isIndex) {
    arraiys = textInfo.getItem(newRt, context, null, false, contextFilter);
  } else {
    newRt = textInfo.itemToIndex(newRt);
    arraiys = textInfo.getItem(newRt, context, null, false, contextFilter);
  }
  */
  if (!isIndex) {
    newRt = textInfo.itemToIndex(newRt);
  }
  arraiys = textInfo.getItem(newRt, context, null, false, contextFilter, null, punc);
  
  currRt = newRt;
  dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3]);
  
  if (dt.succeeded()) {
      //currRt = newRt;
      document.getElementById("toUse").value = currRt;
      pushHistory(currRt, false, arraiys[1].length);
  } else {
      alert("No results found for the filters.");
      dt = prevDT;
      currRt = prevRt;
      dt.redraw();
  }
}
      
function resetDataByRegex(regex) {
    
    var prevDT = dt;
    var prevRt = currRt
    currRt = regex;
	
    var contextFilter = getContextFilter();
    
    var arraiys = textInfo.getItems(regex, context, null, contextFilter, null, punc);

    dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3]);
    
    if (dt.succeeded()) {
        //currRt = regex;
        document.getElementById("toUse").value = currRt;
        pushHistory(currRt, true, arraiys[1].length);
    } else {
        alert("No results found for the filters.");
        dt = prevDT;
        currRt = prevRt;
        dt.redraw();
    }    
    
}

//return an object with the context filters, or null, according to the GUI, e.g. {"include":{"POS":["NN","NNS"]}}
function getContextFilter() {
    var what;
    var reC = /,,+/g;
    var reQ = /(['])/;
    if (document.getElementById("rFull").checked) {
        what = null;
        
    } else if (document.getElementById("rInclude").checked) {
        var vals = document.getElementById("contextInclude").value;
        var valArray = getVals(vals);
        what = {"include":{"POS":valArray}};
        
    } else if (document.getElementById("rExclude").checked) {
        var vals = document.getElementById("contextExclude").value;
        var valArray = getVals(vals);
        what = {"exclude":{"POS":valArray}};
        
    }

    function getVals(str) {
        //if (! caseSensitive) {
        //    str = str.toLocaleLowerCase();
        //}
        //escape quotes
        str = str.replace(reQ, "\\$1");
       
        //handle commas
        str = str.replace(reC, ",")
        var valArray = str.split(",");
        if (valArray[vals.length -1] == "") {
            valArray[vals.length -1] = ",";
        }
        return valArray;
    }
    
    return what;
}


