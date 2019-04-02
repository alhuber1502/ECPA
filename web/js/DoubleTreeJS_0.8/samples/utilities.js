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
    
    //white background didn't work
    //var ctx=targetCanvas.getContext('2d');
    //ctx.fillStyle='#FFFFFF';
    //ctx.fillRect(10,10,w/2,h/2);

    //canvg(targetCanvas, svg_xml, {ignoreClear: true}); //don't clear the nice white rectangle we just made
    canvg(targetCanvas, svg_xml);
    var dataURL = targetCanvas.toDataURL();
    //document.getElementById('canImg').src = dataURL;  //works, but have to right click to save (as PNG) and takes up space
    window.open(dataURL, "DoubleTreeJS");
    
    //based on http://www.nihilogic.dk/labs/canvas2image/canvas2image.js
    //document.location.href = dataURL.replace("image/png", "image/octet-stream");  //this works, but it's not great, since you might not get a good file name
    
    //var encodedText = encodeURIComponent(svg_xml);
    //document.getElementById('svgImg').src = "data:image/svg+xml," + encodedText;  //works, but have to right click to save, and saves as SVG   
}
      
//from http://bl.ocks.org/biovisualize/1209499  NOT USED
function writeDownloadLink(srcID, title){
    var html = d3.select(srcID)
        .attr("title", title)
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    d3.select("body").append("div")
        .attr("id", "download")
        .style("top", event.clientY+20+"px")
        .style("left", event.clientX+"px")
        .html("Right-click on this preview and choose Save as<br />Left-Click to dismiss<br />")
        .append("img")
        .attr("src", "data:image/svg+xml;base64,"+ btoa(html));

    d3.select("#download")
        .on("click", function(){
            if(event.button == 0){
                d3.select(this).transition()
                    .style("opacity", 0)
                    .remove();
            }
        })
        .transition()
        .duration(500)
        .style("opacity", 1);
};
