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

var asPOS;

function togglePOSonly(checkBox) {
	asPOS = checkBox.checked;
	setUpDT();
}

//custom node text
var nodeFormat = function(info) {
	return doubletree.fieldText(info,"POS");
}

//overriding from doubletree-kwic.js
fieldNames = ["token", "POS"];
distinguishingFieldsArray = ["token","POS"];
baseField = "token";
showTokenExtras = false;
sortFun = doubletree.sortByStrFld("POS");

function setup() {
	
	var canRead = window.File && window.FileReader && window.FileList; //TBD ?? which do we really use
	if (! canRead) {
	  document.getElementById("filereader").style.visibility = "hidden";
	}
	
	asPOS = document.getElementById("purePOS").checked;
	
	currRt = "tree/NN";
	d3.text("texts/RobinHood_Pyle_tagged.txt", callSetUp);
	
	
	function callSetUp(loadedText) {
	    newText = loadedText;
	    document.getElementById("results").addEventListener("click",
		function(e){
		    if(e.shiftKey) {
			document.getElementById("results").innerHTML = "";
		    }
		},
	    false);
	
	    setUpDT();
	}

}

//overriding from doubletree-kwic-extras.js      
function setUpDT() {    
    filters = {"left":[], "right":[]};
    
    if (! newText ) {
      newText = document.getElementById("taggedText").innerHTML;
      currRt = "tree/NN";
      document.getElementById("toUse").value = currRt;
    }

    if (asPOS) {
	var todoText = newText.replace(/^.+\//gm,""); //strip the tokens from the input text. if we don't do this, then the items keep the tokens, and the KWIC then has the tokens
	fieldNames  = ["POS"];
	distinguishingFieldsArray = ["POS"];
	baseField = "POS";
	caseSensitive = true;
	var delimLoc = currRt.indexOf(fieldDelim);
	if (delimLoc > -1) {
	   currRt = currRt.substring(delimLoc +1);
	   document.getElementById("toUse").value = currRt;
	}
    } else {
	todoText = newText;
	fieldNames  = ["token","POS"];
	distinguishingFieldsArray = ["POS"];
	baseField = "token";
	caseSensitive = false;
	
    }
    textInfo = new textmodel.TextHash( todoText, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray, baseField );

    uniqItems = textInfo.getUniqItemsWithCounts();
    
    var needNewRt;
    if (asPOS) {
	needNewRt = ! textInfo.containsIndex(currRt);
    } else {
	needNewRt = ! textInfo.containsItem(currRt);
    }
    
    if (needNewRt) {
      var which = Math.round( uniqItems.length/2 );
      currRt = uniqItems[ which ].replace(/\t.+$/,"");
      document.getElementById("toUse").value = currRt;
    }
    
    var arrays = textInfo.getItem(currRt, context);
    dt = new doubletree.DoubleTree();
    dt.init("#doubletree").visWidth(w).handlers(handlers).showTokenExtra(showTokenExtras).sortFun(sortFun).filters(filters).nodeText(nodeFormat);
    dt.setupFromArrays(arrays[0], arrays[1], arrays[2], arrays[3], caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
    
}


