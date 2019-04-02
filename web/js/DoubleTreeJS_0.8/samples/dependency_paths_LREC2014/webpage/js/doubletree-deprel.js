/* (This is the new BSD license.)
* Copyright (c) 2013, Chris Culy
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

//overriding doubletree-kwic.js
fieldNames = ["Dep", "token", "lemma", "POS", "snum"];
distinguishingFieldsArray; // = ["Dep", "lemma", "POS"];
baseField = "Dep";
var baseType ="lemma"; //or "token"

//NEW
var contextField = "Dep";

function nodeFormat(info) {
    if (info[baseType]) {
        return info["Dep"] + fieldDelim + info[baseType];
    }
    return "";
}

function updateFilters() {
    var leftDep = document.getElementById("leftPOS").value.replace(/^ +/,"").replace(/ +$/,"");
    var rtDep = document.getElementById("rtPOS").value.replace(/^ +/,"").replace(/ +$/,"");
    
    if (leftDep) {
      filters["left"][0] = filterByDep(leftDep);
    } else {
      filters["left"][0] = null;
    }
    if (rtDep) {
      filters["right"][0] = filterByDep(rtDep);
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

function filterByDep(dep) {
    var re = new RegExp(dep);
    return function(inf) {
      return inf["Dep"] && inf["Dep"].filter(function(p) {
	  return p.search(re) > -1;
	}).length > 0;
    };
}

function updateSort() {
    if (document.getElementById("posSort").checked) {
        sortFun = doubletree.sortByStrFld("Dep");
    } else if (document.getElementById("contSort").checked) {
        sortFun = doubletree.sortByContinuations();
    } else {
        sortFun = doubletree.sortByStrFld(document.getElementById("defaultSort").value);
    }
    dt.sortFun(sortFun).redraw();  
}

function handleFiles(files) {
    if (files.length === 0) {
        return;
    }
    var file = files[0];
    var name = file.name;
//    if (file.type != "text/plain") {
//      alert(name + " is not a plain text file. Please select a plain text file instead.");
//      return;
//    }
    isThomisticus = (name === "IT-TB.conll")
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
       
        //fieldNames = ["Dep", "POS", "lemma", "token", "snum"];
        //fieldNames = ["Dep", "token", "lemma", "POS", "snum"];
        if (document.getElementById("tokenType").checked) {
            //distinguishingFieldsArray = ["Dep", "POS", "token"];
            distinguishingFieldsArray = ["Dep", "token", "POS"];
            baseType = "token";
        } else {
            //distinguishingFieldsArray = ["Dep", "POS", "lemma"]; 
            distinguishingFieldsArray = ["Dep", "lemma", "POS"]; 
            baseType = "lemma";
        }
      //setUpDT();
      getPaths(reader.result, setUpDT)
    }
  
}

function setup() {
  kwic = new visSem.KWIC("realKWIC").contextLen(kwicContext).rowString(rowStr, true).numToShow(hitsPerPage).cellTitle(onTitle).colHeaderClick(handleColClick).itemCellClick(handleItemCellClick);
    
  var canRead = window.File && window.FileReader && window.FileList;
  if (! canRead) {
    document.getElementById("filereader").style.visibility = "hidden";
  }
  currRt = "sb/intelligentia/1";
 
  //d3.text("paths/Thomisticus_paths.txt", callSetUp);  
  document.getElementById("results").addEventListener("click",
       function(e){
           if(e.shiftKey) {
            document.getElementById("results").innerHTML = "";
           }
       },
      false);
  
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

function setUpDT() {
    filters = {"left":[], "right":[]};
    
    if (! newText ) {
      document.getElementById("toUse").value = currRt;
      return;
    }
    textInfo = new textmodel.TextHash( newText, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray, baseField, true);
    uniqItems = textInfo.getUniqItemsWithCounts();
    
    if (newUI) {
        document.getElementById("wordlist").innerHTML = '<select id="wordlistSelect">' + uniqItems.reduce(function(prev,curr,i){
                if (i == 0) {
                    return prev; //just total number of results
                }
                var val =  curr; //.split("\t")[0];
                
                return prev + '<option value="' + val + '">' + val + '</option>\n';
            },"")  + '</select>'; //we need <select> for safari, since it doesn't support <datalist> yet;
    }
    
    if (! textInfo.containsIndex(currRt)) { //was containsItem
      var which = Math.round( uniqItems.length/2 );
      currRt = uniqItems[ which ].replace(/\t.+$/,"");
      if (! newUI) {
        document.getElementById("toUse").value = currRt;
      }
    }
    
    dt = new doubletree.DoubleTree();
    dt.init("#doubletree").visWidth(w).handlers(handlers).showTokenExtra(showTokenExtras).sortFun(sortFun).filters(filters).nodeText(nodeFormat);
    dt.setupFromArrays([], [], [], caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
    resetData(currRt, true);
    setStatus("");
}



//updates the context according to the filters
function updateContext() {
    //var searchTerm = document.getElementById("toUse").value;
    var searchTerm = document.getElementById("words").value.replace(/\t.+$/,"");
    if (rootIsRegex) {
        resetDataByRegex(searchTerm);
    } else {
        resetData(searchTerm, true);
    }
}
      

