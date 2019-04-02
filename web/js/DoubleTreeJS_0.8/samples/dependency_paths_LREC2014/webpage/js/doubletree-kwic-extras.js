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
    
    var arrays = textInfo.getItem(currRt, context);
    dt = new doubletree.DoubleTree();
    dt.init("#doubletree").visWidth(w).handlers(handlers).showTokenExtra(showTokenExtras).sortFun(sortFun).filters(filters);
    dt.setupFromArrays(arrays[0], arrays[1], arrays[2], caseSensitive, fieldNames, fieldDelim, distinguishingFieldsArray);	  
}

//sets doubletree to having data with root newRt
function resetData(newRt, isIndex) {
    var prevDT = dt;
    
    var arraiys;
    if (isIndex) {
      arraiys = textInfo.getItem(newRt, context);
    } else {
      newRt = textInfo.itemToIndex(newRt);
      arraiys = textInfo.getItem(newRt, context);
    }
    dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2]);
    
    if (dt.succeeded()) {
        currRt = newRt;
        document.getElementById("toUse").value = currRt;    
    } else {
        alert("No results found for the filters.");
        dt = prevDT;
        dt.redraw();
    }
}

function resetDataByRegex(regex) {
    var prevDT = dt;
    
    var arraiys = textInfo.getItems(regex, context);

    dt.setupFromArrays(arraiys[0], arraiys[1], arraiys[2]);
    
    if (dt.succeeded()) {
        currRt = regex;
        document.getElementById("toUse").value = currRt;    
    } else {
        alert("No results found for the filters.");
        dt = prevDT;
        dt.redraw();
    }
}
      