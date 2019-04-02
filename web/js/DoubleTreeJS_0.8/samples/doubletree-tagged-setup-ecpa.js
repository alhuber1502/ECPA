function setup() {

    currRt = utils.getTokenname() || "";
    console.log( currRt );
    var filename = "../../dtreejs/"+utils.getFilename()+"-wds_malt.dtjs";
    d3.text( filename, callSetUp);
  
    function callSetUp(loadedText) {
	newText = loadedText;
	document.getElementById("results").addEventListener("click", function(e){
	    if (e.shiftKey) {
		document.getElementById("results").innerHTML = "";
	    }
	},
	false);
	
	setUpDT();
    }
}
