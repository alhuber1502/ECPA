var kwic;
var kwicContext = 5;
var hitsPerPage = 10;

var sortReversed = []; //keep track of whether columns are sorted in ascending or descending order
var numHits;

var tmu = textmodel.TextModelUtilities(fieldNames, fieldDelim);




//arrays from textModel
function makeKWICD3(arrays) {
  
  //convert the arrays to a single array of objects, so we can do sorting by position
  //we also convert the input text to objects (perhaps this should be done in the textModel itself instead, but it isn't for now)
  var realArray = [];
  numHits = arrays[1].length;
  for (var i=0;i<numHits;i++) {
    
    realArray[i] = {'left': tmu.textArrayToTextInfo(arrays[0][i]),
                    'hit':  new tmu.TextInfo(arrays[1][i]),
                    'right':tmu.textArrayToTextInfo(arrays[2][i]),
                    'index':arrays[3][i]
                    };
  }
  
  kwic.data(realArray).show();
  
  document.getElementById("kwicDiv").style.visibility ="visible";
  document.getElementById("kwicControls").style.visibility ="visible";
  
  updateShowing();
  setupReverse();
   $( "#kwicDiv" ).dialog( "open");
}

function onTitle(textInfo, i) {
  if (typeof textInfo !== "object") {
    return "";
  }
  return Object.keys(textInfo).reduce(function(prev,curr){
    return prev + curr + ":\t" + textInfo[curr] + "\n";
  },"");
}

function handleColClick(content, col) {
  
  var settings = { };
  
  
  var sortBy = document.getElementById("sortByDepRel");
  if (sortBy.checked) {
    settings['field'] = "Dep";
  } else {
    sortBy = document.getElementById("sortByToken");
    if (sortBy.checked) {
      settings['field'] = "token";
    } else {
      sortBy = document.getElementById("sortByLemma");
      if (sortBy.checked) {
        settings['field'] = "lemma";
      } else {
          settings['field'] = "POS";
      }
    }
  }
  
  
  sortReversed[col] = ! sortReversed[col];
  settings['reverse'] = sortReversed[col];
  
  
  kwic.sort(col+1, settings);
  updateShowing();
}

function handleItemCellClick(d,i) {
    if (i < 2*kwicContext + 1) { //only show the diagram when clicking on the example
      return; 
    }
    var ref = d.toString().substring(0, d.indexOf(":"));
    var snum = isThomisticus ? itIDs.indexOf(ref) : ref;
    getParse(snum, function(sent) {
        if (document.getElementById("aDiagram").checked) {
            $( "#arcDiagramDiv" ).dialog("open");
            var arcDiagram = document.getElementById("arcDiagram");
            arcDiagram.contentWindow.showExample(sent, ref);
        } else {
            $( "#treeDiagramDiv" ).dialog("open");
            var treeDiagram = document.getElementById("treeDiagram");
            treeDiagram.contentWindow.showExample(sent, ref);
        }
    });
}

function rowStr(textInfoArray, i) {
  var hitDim = (textInfoArray.length -1)/2;
  
  var snum = textInfoArray[hitDim]["snum"];
  return lookupRef(snum) + ': <span class="rowText">' + textInfoArray.reduce(function(prev, curr) {
    if (typeof curr == 'object') {
      return prev + " " + curr.token;
    }
    return prev;
    
  },"") + "</span>";

}

function lookupRef(snum) {
  return isThomisticus ? itIDs[+snum] : snum;
}

function showNext() {
  kwic.showNextPage();
  updateShowing()
}

function showPrevious() {
  kwic.showPrevPage();
  updateShowing()
}

function updateShowing() {
  var showing = kwic.numToShow();
  var startElt = kwic.whichPage() * showing +1;
  var endElt = Math.min(startElt + showing -1, numHits );
  document.getElementById("numHits").innerHTML = "Showing results " + startElt + " to " + endElt + " of " + numHits + " results";
}

function setupReverse() {
  //set up sortReversed
  for(var i=0;i<2*kwicContext +1;i++) {
    sortReversed[i] = true; //we are unsorted initially, so when we sort the first time it should NOT be reversed
  }

}