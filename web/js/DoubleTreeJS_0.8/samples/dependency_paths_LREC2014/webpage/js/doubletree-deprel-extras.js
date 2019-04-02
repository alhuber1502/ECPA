function newMakeDoubleTree(e) {
        var byButton = (typeof e === "undefined");
        
        if (byButton || e.keyCode == 13) {
                var item;
                if (newUI && document.getElementById("wordlist") instanceof HTMLUnknownElement) {
                        //i.e. we are in Safari
                        item = document.getElementById("wordlistSelect").selectedOptions[0].value;
                } else {
                        item = document.getElementById("words").value;
                }
                var isComplete = /^.+\/.+\/.+\t.+$/.test(item);
                var asRegex = (byButton && ! isComplete) || (!byButton && e.shiftKey);
                
                
               if (asRegex) {
                        //take as regex
                        try  {
                                rootIsRegex = true;
                                resetDataByRegex( item );
                        } catch (e) {} //just an issue with old vs new GUI see document.getElementById("toUse").value = currRt;  in doubletree-filtered.js
                } else if (isComplete) {
                        var newRt = item.replace(/\t.+$/,"").replace(/&gt;/g,">").replace(/&lt;/g,"<"); //since we've added the count onto the end, and we need to use the real < and > (hopefully)
                        resetData(newRt, true);
                }
               
        }
}

