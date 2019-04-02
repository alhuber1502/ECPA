/* (This is the new BSD license.)
* Copyright (c) 2012, Chris Culy
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

//puts dependencies names as separate nodes
function d3TreeFromParse(sentJSON, nodeJSON) {
    if (! sentJSON) {
        return sentJSON;
    }    
    if (! nodeJSON) {        
        nodeJSON = sentJSON[0];
    }
    var what = {};
    
    var tok = nodeJSON["tok"], tn;
    if (tok && (tn = tok.length)) {
        var name = tok[1];  //token
    } else {
        name = "ROOT";
    }
    
    what["name"] = name;
    what["children"] = [];
    what["tok"] = tok;
    
    var deps = nodeJSON["deps"], n;
    if (deps && (n = deps.length)) {
        for(var i=0;i<n;i++){		
                what["children"].push( d3TreeFromParse( sentJSON, sentJSON[+deps[i]] ) );
        }
    }
    if (tn) {
        var head = tok[7];
        return {"name":head, "children":[what]};
    } else {
        if (what["children"].length > 1) {
            return what;
        }
        //ROOT  --collapse extra level of ROOT        
        var what2 = {"name":"ROOT", "children":[what.children[0]]};
        //what["children"].forEach(function(c){
        //    what2["children"].push(c["children"][0]);   
        //});
        return what2;
    }
    
}

var nonProjs = {};
//returns new rtMost, for recursion; stores non-projective elements in nonProjs
function findNonProjs(json, tokN, rtMost) {
    tokN = +tokN || 0;
    rtMost = +rtMost || 0;
    var deps = json[tokN]["deps"];
    if (deps && deps.length > 0) {
        for(var i=0,n=deps.length;i<n;i++) {
            rtMost = findNonProjs(json, deps[i], rtMost);
        }
    } else {
        //at leaf
        if (tokN < rtMost) {
            nonProjs[rtMost] = json[rtMost]["tok"];
        }
        rtMost = tokN;
    }
    return rtMost;
}

var includePOS = false;
//puts words as leaves, dependencies as nodes; include non-projective nodes twice: in string order and in dependency order
function d3TreeFromParseOrdered(sentJSON, nodeJSON) {
    if (! sentJSON) {
        return sentJSON;
    }    
    if (! nodeJSON) {        
        nodeJSON = sentJSON[0];
        nonProjs = {};
        findNonProjs(sentJSON);  
    }
    var what = {};
    var headTok;
    
    var tok = nodeJSON["tok"], tn;
    if (tok && (tn = tok.length)) {
        var name = tok[7];
        var realTokNode = {"name":tok[1], "children":[], "tok":tok};
        var tokPosn = +tok[0];        
       
        if (includePOS) {
            var pos = tok[3] + " (" + tok[4] + ")";
            var tokNode =  {"name":pos ,  children:[realTokNode] };
        } else {
            
            //var tokNode =  realTokNode;
            pos = "H";
            headTok = realTokNode.name;
            var tokNode =  {"name":pos ,  children:[realTokNode] };
        }
        //var tokNode =  {"name":pos ,  children:[realTokNode] };
    } else {
        name = "ROOT";
    }
    
    what["name"] = name;
    what["children"] = [];
    //what["tok"] = tok;
    
    var deps = nodeJSON["deps"], n;
    if (deps && (n = deps.length)) {        
        var putTok = false;
        for(var i=0;i<n;i++){
            var depPosn = +deps[i];
            if (!putTok && tok && tokPosn < depPosn) {
                if (nonProjs[tokPosn]) {
                    if (tokNode["children"][0]) {
                        tokNode["children"][0]["nonprojective"] = "moved";
                    }
                    tokNode["nonprojective"] = "moved";
                }
                what["children"].push(tokNode);
                putTok = true;               
            }
            var tmpTok = nonProjs[depPosn-1];
            if (tmpTok) {
                var tmpTokNode = {"name":tmpTok[1], "children":[], "tok":tmpTok, "nonprojective":"original"};
                if (includePOS) {
                    var tmpPos = tmpTok[3] + " (" + tmpTok[4] + ")";
                    what["children"].push({"name":tmpPos ,  children:[tmpTokNode], "nonprojective":"original" });
                } else {
                    var tmpPos = "";
                    //what["children"].push(tmpTokNode);
                    what["children"].push({"name":tmpPos ,  children:[tmpTokNode], "nonprojective":"original" });
                }
               
               
               
            }
            what["children"].push( d3TreeFromParseOrdered( sentJSON, sentJSON[+deps[i]] ) );
        }
        if (tok && !putTok) {
            if (nonProjs[tokPosn]) {
                if (tokNode["children"][0]) {
                    tokNode["children"][0]["nonprojective"] = "moved";
                }
                tokNode["nonprojective"] = "moved";
            }
            what["children"].push(tokNode);
        }
    } else {
        //i.e. no dependencies
        if (nonProjs[tokPosn]) {
            if (tokNode["children"][0]) {
                tokNode["children"][0]["nonprojective"] = "moved";
            }  else {
                //what["nonprojective"] = "moved";
            }
            tokNode["nonprojective"] = "moved";
        }
        what.children.push(tokNode);
    }
    
    if (! includePOS) {
        if (what.children && what.children.length == 1) {
            what.children[0].name = ""; //don't show H if no siblings
        }
    }
    
    if (name == "ROOT" && !tn)  {        
        //ROOT  --collapse extra level of ROOT if necessary
        if (what["children"].length > 1) {
            return what;
        }
        return what["children"][0];
    } else {
        //return what;  //OK
        
        if (what.children.length > 1) {
            var depName = what.name;
            what.name = headTok;
            what.headTok = true;
            return {"name":depName, "children":[what]};
        }
        return what;
        
    }
    
}

function sentFromTree(tree) {
    var what = [];
    getToks(tree)
    return what.join(" ");
    
    function getToks(node) {
        var children = node.children, n;
        if (node["tok"]) {
            what[ node["tok"][0] ] = node["tok"][1];
        }
        if (children && (n=children.length)) {
            for(var i=0;i<n;i++) {
                getToks(children[i]);
            }
        }
        
    }
}

/*
function sentFromParse(parse) {
    var what = parse.reduce(function(prev, curr) {
        if (curr.tok) {
            return prev + " " + curr.tok[1];
        } else {
            return prev;
        }
    },"");
    
    return what;
    
}
*/

//wrap each token inside a span, with id "p" + tokPosn
function sentSpansFromTree(tree) {
    var what = [];
    getToks(tree)
    return what.join(" ");
    
    function getToks(node) {
        var children = node.children, n;
        if (node["tok"]) {
            what[ node["tok"][0] ] = '<span class="toksp" id="p' + node["tok"][0] + '">' + node["tok"][1] + '</span>';
        }
        if (children && (n=children.length)) {
            for(var i=0;i<n;i++) {
                getToks(children[i]);
            }
        }
        
    }
}
