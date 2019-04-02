/* (This is the new BSD license.)
* Copyright (c) 2012, Chris Culy
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
var dev = false; //are we developing, especially to save TextHash (see saveTextHash() )

fieldNames = ["token", "POS", "lemma", "source"];
distinguishingFieldsArray = ["lemma"];
baseField = "lemma";
sortFun = doubletree.sortByStrFld(baseField);
showTokenExtras = false;


if (dev) {
    document.getElementById("fileIn").disabled = false;
}

//colorblind safe colors from http://colorbrewer2.org/ (3 qualitative)
var colors = {
    "P" : [141,160,203],
    "C" : [252,141,98],
    "M" : [102,194,165],
};

//conver the RGB coordinates in the CSS colors, with and without transparency
function makeColors() {
    var transparency = 0.4;
    
    for(var c in colors) {
        colors[c] = ["rgb(" +  colors[c].join(",") + ")", "rgba(" +  colors[c].join(",") + "," + transparency + ")"];
    }
    
    document.getElementById("pyleColor").style.backgroundColor = colors["P"][1];
    document.getElementById("creswickColor").style.backgroundColor = colors["C"][1];
    document.getElementById("mcspaddenColor").style.backgroundColor = colors["M"][1];
}
makeColors();

//we color only lemmas that occur only in a single source
var bgColor = function(info) {
    var defaultC = "rgba(255,255,255,0)"; //transparent white

    //e.g. for when the root is the first or last item in the text   
    if (! info["source"]) {
      return defaultC;
    }
    
    if (info["source"].length == 1) {
        switch(info["source"][0]) {
            case "P": return colors["P"][1];break;
            case "C": return colors["C"][1];break;
            case "M": return colors["M"][1];break;
            default: return defaultC;
        }
    }
    return defaultC;
}

//we put a gray border around lemmas that occur in all 3 sources
var borderColor = function(info) {
    var defaultC = "rgba(255,255,255,0)"; //transparent white
    //just during testing    
    if (! info["source"]) {
      return defaultC;
    }
    
    if (info["source"].length == 3 &&  info["lemma"] != currRt) {
        return "rgba(64,64,64,0.5)"; //transparent gray
    }
    return defaultC;
}

function nodeFormat(info) {
    if (info["lemma"]) {
        var what = info["lemma"][0].toLocaleLowerCase() + " : " + info["token"];
    } else {
        what = "";
    }
    return what;
}

//overriding setup() in doubletree-kwic.js so we don't read text file
function setup() {
    currRt = "tree";
    callSetUp();
    
    function callSetUp() {
        newText = "";
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
      
//overriding setUpDT() in doubletree-kwic-extras.js so we can add the bgColor and nodeFormat
function setUpDT() {
     filters = {"left":[], "right":[]};
     
     if (! newText ) {
       newText = "";
     }
     
     textInfo = new textmodel.TextHash( newText, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray, baseField );
     if (dev) {
        saveTextHash();
        //rhx3 = null;
     }
     if (rhx3) {
        textInfo.fromJSON(rhx3); //load the precalculated info
        rhx3 = null; //free up memory
     }
     
     uniqItems = textInfo.getUniqItemsWithCounts();
     
     if (!currRt || ! textInfo.containsIndex(currRt)) {
       var which = Math.round( uniqItems.length/2 );
       currRt = uniqItems[ which ].replace(/\t.+$/,"");
     }
     document.getElementById("toUse").value = currRt;
     
     var arrays = textInfo.getItem(currRt, context);
     dt = new doubletree.DoubleTree();
     dt.init("#doubletree").visWidth(w).handlers(handlers).showTokenExtra(showTokenExtras).sortFun(sortFun).filters(filters).nodeText(nodeFormat).rectColor(bgColor).rectBorderColor(borderColor);
     dt.setupFromArrays(arrays[0], arrays[1], arrays[2], arrays[3], caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
     pushHistory(currRt, false, arrays[1].length);
 }

//so we can save the TextHash as JSON during development for reloading in the production version
function saveTextHash() { 
    var toSave = JSON.stringify(textInfo); //safer to get value in debugger
    var OK = true;
    
    //This doesn't work, since <unknown> gets interpreted as tag when it appears in the window
    //var w = window.open();
    //if (! w) {
    //    return; //when first load page and popups blocked
    //}
    //w.document.write("var rhx3 = ");
    //w.document.write(toSave);
    //w.document.close();
}