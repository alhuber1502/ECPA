function conll2json(cParse) {
    //for each token, we calculate its incoming dependencies
    //then our output format is an array of objects:
    //{"deps":[...]},{"tok":[...]}, where the tok array is just the fields from the original
    //we have other functions which will transform this later into the tree that we need e.g. d3TreeFromParseOrdered
    
    var lines = cParse.split("\n");
    
    //initialize record of incoming dependencies
    var incomingDeps = [];
    for (var i=0;i<1+lines.length;i++) {
        incomingDeps[i] = [];
    }
    
    //side effect of filling in incomingDeps
    var what = lines.map(function(tokLine) {
        var obj = {"deps":[]};
        obj.tok = tokLine.split("\t");
        
        var tokId = +obj.tok[0];
        var headId = +obj.tok[6];
        
        incomingDeps[headId].push(tokId);
        return obj;
    });
    
    what.forEach(function(elt, i){
       elt.deps = incomingDeps[i+1]; 
    });
    var root = {"deps": incomingDeps[0]};
    what.unshift(root);
    
    return what;
}