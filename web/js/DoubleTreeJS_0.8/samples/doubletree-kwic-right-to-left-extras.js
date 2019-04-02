function setup() {

  var canRead = window.File && window.FileReader && window.FileList;
  if (! canRead) {
    document.getElementById("filereader").style.visibility = "hidden";
  }
  
  //currRt = "";
  
  document.getElementById("results").addEventListener("click",
    function(e){
        if(e.shiftKey) {
         document.getElementById("results").innerHTML = "";
        }
    },
   false);

  setUpDT();
}

function setUpDT() {
    filters = {"left":[], "right":[]};
    
    if (! newText ) {
      newText = document.getElementById("taggedText").innerHTML;
      currRt = "ߘߊ߫";
      document.getElementById("toUse").value = currRt;
    }
    textInfo = new textmodel.TextHash( newText, caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray, baseField );
    uniqItems = textInfo.getUniqItemsWithCounts();
    
    if (! textInfo.containsItem(currRt)) {
      var which = Math.round( uniqItems.length/2 );
      currRt = uniqItems[ which ].replace(/\t.+$/,"");
      document.getElementById("toUse").value = currRt;
    }
    
    var arrays = textInfo.getItem(currRt, context, null, false, null, null, punc);
    dt = new doubletree.DoubleTree();
    dt.init("#doubletree").visWidth(w).prefixesOnRight(true).handlers(handlers).showTokenExtra(showTokenExtras).sortFun(sortFun).filters(filters); //.basicStyles({"branch":{"stroke":"pink"}});
    dt.setupFromArrays(arrays[0], arrays[1], arrays[2], arrays[3], caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);
    
    pushHistory(currRt, false, arrays[1].length);
}

//sets doubletree to having data with root newRt
function resetData(newRt, isIndex) {
    var prevDT = dt;
    
    var arraiys;
    /*
    if (isIndex) {
      arraiys = textInfo.getItem(newRt, context);
    } else {
      newRt = textInfo.itemToIndex(newRt);
      arraiys = textInfo.getItem(newRt, context);
    }
    */
    if (! isIndex) {
        newRt = textInfo.itemToIndex(newRt);
    }
    arraiys = textInfo.getItem(newRt, context, null, false, null, null, punc);
    
    dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3]);
    
    if (dt.succeeded()) {
        currRt = newRt;
        document.getElementById("toUse").value = currRt;
        pushHistory(currRt, false, arraiys[1].length);
    } else {
        alert("No results found for the filters.");
        dt = prevDT;
        dt.redraw();
    }
}

function resetDataByRegex(regex) {
    var prevDT = dt;
    
    //var arraiys = textInfo.getItems(regex, context);
    var arraiys = textInfo.getItems(regex, context, null, null, null, punc);


    dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2], arraiys[3]);
    
    if (dt.succeeded()) {
        currRt = regex;
        document.getElementById("toUse").value = currRt;
        pushHistory(currRt, true, arraiys[1].length);
    } else {
        alert("No results found for the filters.");
        dt = prevDT;
        dt.redraw();
    }
}

///////////
//substitute this Right to Left KWIC for the one in doubletree-kwic.js
makeKWIC = makeKWICr2l;

function makeKWICr2l(arraiys) {
  var what = '<table id="kwic">\n';
  var n = arraiys[1].length;
  for(var i=0;i<n;i++) {
    var thisID = arraiys[3][i];
    what += '<tr><td class="kwicLeft"><span class="kwicItem">'
    + arraiys[2][i].join('</span> <span class="kwicItem kwicLeft">')
    + '</span></td><td class="kwicHit"> <span onclick="hitHndlr(\'' + currRt + '\',' + thisID + ')">'
    + arraiys[1][i] + '</span> <p class="hitContext" id="hitContext_' + thisID + '"></p>'
    + '</td><td class="kwicRt"> <span class="kwicItem kwicRt">'
    + arraiys[0][i].join('</span> <span class="kwicItem kwicRt">') + '</span></td></tr>\n';
  }
  what += '</table>';
  document.getElementById("results").innerHTML = what;
  d3.selectAll("span.kwicItem").attr("onclick", "kwicHndlr(this)");
  d3.selectAll("p.hitContext").attr("onclick", "hideHitContext(this)");
}
