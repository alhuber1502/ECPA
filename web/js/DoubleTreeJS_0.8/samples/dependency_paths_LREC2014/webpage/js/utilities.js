var isThomisticus = false;

function makeImg() {
    /*
     * uses canvg (http://code.google.com/p/canvg/), so needs
     *      canvg-1.3/rgbcolor.js
     *      canvg-1.3/StackBlur.js
     *      canvg-1.3/canvg.js
     */
  
  
    var svg = document.querySelector("#doubletree svg");
    var svg_xml = (new XMLSerializer()).serializeToString(svg);

    var targetCanvas = document.getElementById('imgCan');
    var svgSelect = d3.select(svg);
    var w = svgSelect.attr("width");
    var h = svgSelect.attr("height");
    targetCanvas.width = w;
    targetCanvas.height = h;
    
   
    canvg(targetCanvas, svg_xml);
    var dataURL = targetCanvas.toDataURL();
    //document.getElementById('canImg').src = dataURL;  //works, but have to right click to save (as PNG) and takes up space
    window.open(dataURL, "DoubleTreeJS");
    
    //based on http://www.nihilogic.dk/labs/canvas2image/canvas2image.js
    //document.location.href = dataURL.replace("image/png", "image/octet-stream");  //this works, but it's not great, since you might not get a good file name
    
    //var encodedText = encodeURIComponent(svg_xml);
    //document.getElementById('svgImg').src = "data:image/svg+xml," + encodedText;  //works, but have to right click to save, and saves as SVG   
}
    
function setStatus(msg) {
    document.getElementById("results").innerHTML = msg;
}

function setError(msg) {
    //do something eventually
}


//////////// Dealing with opening the diagram windows; 
//// based on https://developer.mozilla.org/en-US/docs/Web/API/window.open?redirectlocale=en-US&redirectslug=DOM%2Fwindow.open
//var diagramWin = null; // global variable
//
//function openDiagramWin(url) {
//  if(diagramWin === null || diagramWin.closed)
//  /* if the pointer to the window object in memory does not exist
//     or if such pointer exists but the window was closed */
//
//  {
//    diagramWin = window.open(url);
//    /* then create it. The new window will be created and
//       will be brought on top of any other window. */
//  }
//  else
//  {
//    diagramWin.focus();
//    /* else the window reference must exist and the window
//       is not closed; therefore, we can bring it back on top of any other
//       window with the focus() method. There would be no need to re-create
//       the window or to reload the referenced resource. */
//  };
//}
