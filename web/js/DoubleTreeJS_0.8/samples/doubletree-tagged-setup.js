function setup() {

  var canRead = window.File && window.FileReader && window.FileList;
  if (! canRead) {
    document.getElementById("filereader").style.visibility = "hidden";
  }
  
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
