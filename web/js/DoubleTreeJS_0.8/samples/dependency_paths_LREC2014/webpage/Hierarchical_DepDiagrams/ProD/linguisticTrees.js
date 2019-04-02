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
//Version: 0.3

var sfs = sfs || {sfs: {d3:{}}};
sfs.d3.layout = {};
sfs.d3.linfovis = sfs.d3.linfovis || {};  

(function() {
sfs.d3.linfovis.syntree = function(elt,json, aspect) {
    //elt is the page element host
    //json is the data
   //aspect.branch: zigzag (default), straight, curvy
   //aspect.layout: dendrogram (default), dendrogramTree, tree
   
   
   elt.innerHTML = "";  
   this.json = json;
   
   aspect = aspect || {};
    
   var branch;  
   setBranch(aspect.branch);
   
   
   var cluster;
   setLayout(aspect.layout);
   
   var makeID = (function() {
      var currID = 0;
      
      return function() {
         currID++;
         return currID;
      }
   })();
   
   function setupArrowhead() {
      //for the arrow head cf http://svg-whiz.com/svg/linguistics/fuliopen/ideograph.svg
      var defs = d3.select("svg")
	.append("defs")
      ;
      
      var marker = defs.append("marker")
	.attr("id", "endArrow")
	.attr("viewBox", "0 0 10 10")
	.attr("refX", "1")
	.attr("refY", "5")
	.attr("markerUnits","strokeWidth")
	.attr("orient", "auto")
	.attr("markerWidth", "5")
	.attr("markerHeight", "4")
      ;
      marker.append("polyline")
	.attr("points", "0,0 10,5 0,10 1,5")
      ;
   }
   
   var smartdiag = function() {
	//CC we shouldn't put this in the sfs.d3 namespace, since it dependes on height/width properties that we had for this vis
      /*CC unfortunately we have to recreate these below, because they're private to d3
      var source = d3_svg_chordSource,
	  target = d3_svg_chordTarget,
	  projection = d3_svg_diagonalProjection;
      */
      var source = function(d) {return d.source;}
      var target = function(d) {return d.target;}
      var projection = function(d){return [d.x, d.y];}
    
      function diagline(d, i) {
	var p0 = source.call(this, d, i);
        var p3 = target.call(this, d, i);
	
	var x0 = p0.x ,y0 = p0.y, x3=p3.x, y3=p3.y;
	if (y0 > y3) {
	   //i.e. source is lower than target
	   y0 -= p0.height/2;
	   y3 += p3.height/2;
	} else if (p0.y < p3.y) {
	  //i.e. source is higher than target
	  y0 += p0.height/2;
	  y3 -= p3.height/2;
	} else {
	  //source and target are the same height
	  x0 += p0.width/2;
	  x3 -= p3.width/2;
	}
	
        var m = (y0 + y3) / 2;
        var p = [{x:x0, y:y0}, {x: x0, y: m}, {x: x3, y: m}, {x:x3,y:y3}];
	p = p.map(projection);
	return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
      }
    
      diagline.source = function(x) {
	if (!arguments.length) return source;
	source = d3.functor(x);
	return diagline;
      };
    
      diagline.target = function(x) {
	if (!arguments.length) return target;
	target = d3.functor(x);
	return diagline;
      };
    
      diagline.projection = function(x) {
	if (!arguments.length) return projection;
	projection = x;
	return diagline;
      };

      return diagline;
    };
   
   
   var foundPathPairs = {}; //keep track of pairs of nodes in found paths, so that we can hilight them when we do an update (new paths are created when the layout changes)
   
    var vis = d3.select(elt).append("svg:svg")
      .append("svg:g") //so we can adjust the position later
   ;
   
   setupArrowhead(); //add the arrowhead definition to thesvg

   //CC use the dummy layout, since all we need for now are the text labels
   var nodes = sfs.d3.layout.clusterDummy(this).nodes(json);   
   
   //CC Note that this (from the original), does not form a hierarchical visualization -- a g.node does not contain the descendents, it is is just the label
   //CC We might want to make it hierarchical for fisheye/DOI tree

   //CC now wrap each node in a nodeContainer, so we can scale the nodes (still doesn't solve hierarchy issue)
   var container = vis.selectAll("g.nodeContainer")
         .data(nodes)
      .enter().append("svg:g")
       .attr("class", "nodeContainer");
   
   var node = container.append("svg:g")
       .attr("class", "node");
       
   //If we want shapes around nodes, node.append(...) here? but issue of resizing them when we do upate
   
   //CC and we're going into side-effect heaven/hell here, adding d.vis and d.synTreeID to the data
   node.append("svg:text")
       .attr("dy", 3)
       .attr("text-anchor", "middle")
       .text(function(d) {
            d.vis = this; //CC so we can access the width/height of the nodes; we can't calculate the dims here, since we don't have them yet
            d.synTreeID = makeID();
            this.id = "n" + d.synTreeID;
            return d.name;
         })
   ;
 
   var xlinks = [];
   //pairs is an array of {source:s, target:t}, where the s,t are __data__ members of the visual nodes
   vis.addXLinks = function(pairs) {
      xlinks = pairs || xlinks;
      var xlink = vis.selectAll("path.xlink")
	  .data(xlinks)        
        .enter()
        .append("svg:path")
          .attr("class", "xlink")         
          .attr("d", smartdiag())
	  .attr("marker-end", "url(#endArrow)")
      ;
   }
   
   var hiddenLinks = [];
   //pairs is an array of {source:s, target:t}, where the s,t are __data__ members of the visual nodes
   vis.hideLinks = function(pairs) {
      hiddenLinks = pairs || hiddenLinks;
      var n = hiddenLinks.length;
      var links = vis.selectAll("path.link");
      links.each(function(lnk){
         for(var i=0;i<n;i++) {
            var toHide = hiddenLinks[i];
            if (lnk.source == toHide.source && lnk.target == toHide.target) {
               classListAdd(this,"hiddenLink");
            }
         }
       })
     ;
      vis.selectAll("path.hiddenLink").remove();
   }
 
   //repeat to get vis right
   vis.update = function() {
      var nodes = cluster.nodes(json);     
      
      vis.selectAll("path.link").remove();
      vis.selectAll("path.xlink").remove();
      
      
      var link = vis.selectAll("path.link")
          .data(cluster.links(nodes))        
        .enter()
        .append("svg:path")
          .attr("class", "link")
         //.transition()
         //   .duration(1000)  //didn't seem to make any difference, maybe since there is no start value?; not even when doing setBranch.
          .attr("d", branch)         
      ;
      
      //restore path highlighting
      
      for(var linkClass in foundPathPairs) {
         link.classed(linkClass, function(d) {
            var sid = d.source.synTreeID;
            var tid = d.target.synTreeID;
            return (foundPathPairs[linkClass][sid + " " + tid] || foundPathPairs[linkClass][tid + " " + sid] );
         })
      }
      
      vis.addXLinks();
      vis.hideLinks();
      
      
      //now reorder so that links come before nodes, and hence drawn under them -- z order in svg corresponds to document order (ugh)
      vis.selectAll("path.link,path.xlink,g.nodeContainer")
         .sort(function(d1,d2) {
               if (d1.source && ! d2.source) {
                  return -1;
               }
               if (!d1.source && d2.source) {
                  return 1;
               }
               if (d1.source && d2.source) {
					return 0;
			   }
			   //can't count on sort preserving order among ties (webkit doesn't)				
               if (d1.synTreeID < d2.synTreeID) {
               		return -1;
               }
               if (d1.synTreeID > d2.synTreeID) {
               		return 1;
               }
               return 0;
         })
      ;
      
      
      
      
      if (true) {
         //works, animates from upper left corner
      var node =  vis.selectAll("g.node")
          .data(nodes)
          .transition()
            .duration(500)
          .attr("transform", function(d) {
            return "translate(" + d.x  + "," + d.y + ")";          
            })
      ;
      }
      
      //this animates from top ; odd for collapsing, since puts everything at the top, even stuff not collapsing
      if (false) {
       var node =  vis.selectAll("g.node")
          .data(nodes)          
          .attr("transform", function(d) {            
            return "translate(" + d.x  + "," + 0 + ")";       //position at top first            
            })
          .transition()
            .duration(500)
            .attr("transform", function(d) {
               return "translate(" + d.x  + "," + d.y + ")";     //now animate down     
            })
      ;
      }
      
      
          
      var realW = nodes[0].visW; 
      var realH = nodes[0].visH;
      var topH = nodes[0].height;
      var vSVG = d3.select(elt).select("svg");      
      vSVG.attr("width", realW);
      vSVG.attr("height", realH + 2*topH);      
      vSVG.select("g").attr("transform", "translate(0," + topH + ")"); 
      
      
   }
   vis.update();
   
   function setBranch(br) {
      switch(br) {
         case "zigzag": branch = sfs.d3.svg.zigzag(); break;
         case "straight": branch = sfs.d3.svg.diagline(); break;
         case "curvy": branch = d3.svg.diagonal(); break;
         default: branch = sfs.d3.svg.zigzag(); break;
      }
      if (vis) {
         vis.update();
      }
   }
   vis.setBranch = setBranch;
   
   function setLayout(layo) {      
      switch (layo){
         case "dendrogram" : cluster = sfs.d3.layout.dendrogramVis(this, true); break;
         case "dendrogramTree" : cluster = sfs.d3.layout.dendrogramVis(this, false); break;
         case "tree" : cluster = sfs.d3.layout.treeVis(this); break;
         default: cluster = sfs.d3.layout.dendrogramVis(this,true);
      }
      if (vis) {
         vis.update();
      }
   }
   vis.setLayout = setLayout;
   
   
   // /* this works, but doesn't interact correctly with scaleNodes, scaleSubTrees, and it is a little slow; so it's really only good for a static image
   vis.scaleTo = function(newW,newH) {
      var vSVG = d3.select(elt).select("svg");
      var w = vSVG.attr("width");
      var h = vSVG.attr("height");
      var trans = vSVG.select("g").attr("transform");
      var where = trans.indexOf("scale");
      if (where > -1) {
         trans = trans.substring(0,where);
      }
      var scale = "scale(" + newW/w + "," + newH/h + ")";
      vSVG.select("g").attr("transform", trans + scale);
      vSVG.attr("width", newW);
      vSVG.attr("height", newH);
      
   }
   
   
   /* this doesn't really work, since it only scales the nodes. The real problem is that kVPad and kHPad are constant, not scalable [which keeps the alignment right when doing regular scaling]
   vis.scaleTo = function(maxW, maxH) {
      var vSVG = d3.select(elt).select("svg");
      var w = vSVG.attr("width");
      var h = vSVG.attr("height");
      var fw = maxW/w, fh = maxH/h;
      if (fw*h > maxH) {
         var factor = fh;
      } else {
         factor = fw;
      }
      
      vis.scaleSubTrees(d3.select("g.nodeContainer"), factor, false);
      vis.update();      
   }
   */
   
   //find visual nodes based on data node properties; returns a selection of text nodes
   //if valOrFun is a string, then it is interpreted as a pattern for attr to match
   //otherwise, valOrFun is interpreted as a function, which will get passed attr and one node at a time. It needs to return a boolean, since it used as a filter function
   vis.findNodes = function(attr, valOrFun, fndClass) {
      var what;
      //var nodes = vis.selectAll("g.nodeContainer");
      var nodes = vis.selectAll("text");
      if (typeof valOrFun == "string") {
         var pat = new RegExp(valOrFun);

         what = nodes.filter(function(nd){         
            return pat.test( nd[attr]);
         });
         
      } else {
         what = nodes.filter(function(nd){         
            return valOrFun(attr, nd);
         });
      }
      if (fndClass) {
         what.classed(fndClass, true);
      }
      return what;
   }
   
   
   vis.scaleNodesNOPE = function(nds, factor)  {
      //would have been nice to use SVG, but doesn't quite work right
      //instead, we'll do it with CSS 
      d3.selectAll(nds)
         .attr("transform", function(d) {            
            return  "translate(" + d.x + "," + d.y + ") " + "scale(" + factor + "," + factor + ") " + "translate(" + (-d.x) + "," + (-d.y) + ")";  //e.g. translate(187,178) scale(3,3) translate(-187.390625,-178) 
         });
      
      //vis.update();
   }
   
   //nds is a D3 selection (or a facsimile -- see scaleSubTrees)
   vis.scaleNodes = function(nds, factor, doUpdate) {
      
      //CC we need nds[0], since nds is a selection 
      nds[0].forEach(function(nd) {
         if (classListContains(nd,"nodeContainer")) {
            var textNd = nd.children[0].children[0];
         } else if (classListContains(nd,"node")) {
            textNd = nd.children[0];
         } else {
            textNd = nd;
         }
         var fs;
         if ( textNd.style.fontSize ) {
         	//i.e. webkit
         	fs =  parseFloat( textNd.style.fontSize ); //webkit gives 0 for getComputedStyle but Firefox doesn't
         } else {
         	//i.e. Firefox
         	fs = parseFloat( getComputedStyle(textNd).fontSize );	  
         }	   
	 	 textNd.style.fontSize = factor*fs + "px";
      });
      if (doUpdate) {
         vis.update();
      }
   }
   
   //nds is a D3 selection (or a facsimile -- see below)
   vis.scaleSubTrees = function(nds, factor, doUpdate) {      
      vis.scaleNodes(nds, factor, false);
      
      //CC we need nds[0], since nds is a selection; and we can't use each, since nds might not be a real selection
      nds[0].forEach(function(nd) {
         var children = nd.__data__.children;
         if (children ) {
            children.forEach(function(c) {
               vis.scaleSubTrees( sfs.d3.element2selection(c.vis), factor, doUpdate ); //CC we're faking the D3 selection structure               
            });
         }
      });
      if (doUpdate) {
         vis.update();
      }
   }
   
   //var collapsed = {}; //not used; was intended to save state for updating layout, branches, but not needed
   var kCollapse = 0.1;
   //nds is a D3 selection (or a facsimile -- see scaleSubTrees)
   vis.collapseSubTrees = function(nds, doUpdate) {
      //CC we need nds[0], since nds is a selection; and we can't use each, since nds might not be a real selection
      nds[0].forEach(function(nd) {
         var children = nd.__data__.children;
         if (children ) {
            //collapsed[nd] = true;
            children.forEach(function(c) {
               vis.scaleSubTrees( sfs.d3.element2selection(c.vis), kCollapse, false ); //CC we're faking the D3 selection structure               
            });
         }
      });
      if (doUpdate) {
         vis.update();
      }
   }
   
   //nds is a D3 selection (or a facsimile -- see scaleSubTrees)
   vis.expandSubTrees = function(nds, doUpdate) {
      //CC we need nds[0], since nds is a selection; and we can't use each, since nds might not be a real selection
      nds[0].forEach(function(nd) {
         var children = nd.__data__.children;
         if (children ) {
            //delete collapsed[nd];
            children.forEach(function(c) {
               var k = 1/kCollapse;
               vis.scaleSubTrees( sfs.d3.element2selection(c.vis), 1/kCollapse, false ); //CC we're faking the D3 selection structure               
            });
         }
      });
      if (doUpdate) {
         vis.update();
      }
   }
   
   //removes the relevant classes, and adjusts foundPathPairs[linkClass]
   vis.clear = function(nodeClasses, linkClasses) {
      nodeClasses = nodeClasses || [];
      linkClasses = linkClasses || [];
      
      var nodes = vis.selectAll("text");
      for(var i=0, m=nodeClasses.length; i<m; i++) {
            nodes.classed(nodeClasses[i], false);
      }
    
      var links = vis.selectAll("path.link");
      for (var i=0, m=linkClasses.length; i<m; i++) {
        links.classed(linkClasses[i], false);
        delete foundPathPairs[linkClasses[i]];
      }
      
   }
   
   vis.pathCycler;
   //path is array of node names or "." or "*" or "\." or "\*"; (see markPath)
   //returns array of paths, which are arrays of synTreeIDs
   vis.findPath = function(thePath, foundNodeClass, fndLinkClass) {
      
      var paths = findPathSegs(thePath);
      //construct set of node pairs that are in paths
      var pairs = {};
      if (!paths) {
         return [];
      }
      paths.forEach(function(p) {
         var n = p.length;
         for(var i=0, m=n-1;i<m;i++) {
            for(var j=i+1;j<n;j++) {
               pairs[p[i] + " " + p[j]] = true;
            }
         }
      });
      
      
      if (! foundPathPairs[fndLinkClass] ) {
         foundPathPairs[fndLinkClass] = pairs;
      } else {
         //merge these with existing, in case we have multiple finds
         for(var pr in pairs) {
            foundPathPairs[fndLinkClass][pr] = pairs[pr]; //should just be true, but just in case...
         }
      }
      
      vis.selectAll("path.link")
         .classed(fndLinkClass, function(d) {
            var sid = d.source.synTreeID;
            var tid = d.target.synTreeID;
            var toMark = false;
            if (pairs[sid + " " + tid] || pairs[tid + " " + sid] ) {
               toMark = true;
               //NB d.source.vis and d.target.vis are text nodes  but everything else is currently working off of g.nodeContainer, 2 levels up
               classListAdd(d.source.vis, foundNodeClass);
               classListAdd(d.target.vis, foundNodeClass);
            }
            return toMark;
         })
      ;
      
      vis.pathCycler = new cycler(paths);
      return paths;
    }
    
    //used e.g. when cycling among paths; cf. vis.findPath
    //NB: linkClass can't be empty
    vis.selectOnePath = function(path, nodeClass, linkClass) {
      var links = vis.selectAll("path.link")
         .classed(linkClass, function(d) {
            var sid = d.source.synTreeID;
            var tid = d.target.synTreeID;
            var toMark = false;
            for(var i=0, n=path.length-1; i<n; i++) {
               var nd1 = path[i], nd2 = path[i+1];
               if ((sid == nd1 && tid == nd2) || (sid==nd2 && tid == nd1) ) {
                  toMark = true;
                  //NB d.source.vis and d.target.vis are text nodes  but everything else is currently working off of g.nodeContainer, 2 levels up
                  classListAdd(d.source.vis, nodeClass);
                  classListAdd(d.target.vis, nodeClass);
                  break; //break as soon as we've figured out that we're a link
               }
            }
            return toMark;
         })
      ;
         
      
    }
    
    //class to iterate back and forth through a set of trees
    function cycler(pathSet) {
      var n = pathSet.length;
      var where = n-1;
      
      var what = {};
      
      what.next = function() {
	 where = (where + 1) % n;
	 return pathSet[where];
      }
      what.prev = function() {
	where = (n+ where - 1) % n;
	 return pathSet[where];
      }
      
      return what;
      
    }
   
   
   //it is private, since it will only be called by vis.findPath
   function findPathSegs(path) {
       //for now, path is array of node names or "." or "*" or "\." or "\*";
       
       var fndPaths = [];
       
       var tree = nodes[0];
       
       if (path[0] != "*") {
           path.unshift("*");
       }
       
       return helper(tree,path, false);
       
       function helper(tree2, path2, fndFirst) {
           var restPath = path2.slice(); //make a copy        
           var toMatch = restPath.shift();
           var thisName = tree2["name"];
           if (toMatch == "." || (toMatch != "*" &&  matchName(thisName, toMatch) ) ) {       
               var fndRest = recurse(restPath, true);
               if (fndRest) {
                   //tree2["marked"] = true;                   
                   if (fndRest.length == 0) {
                     return [[tree2.synTreeID]];
                   }
                   return fndRest.map(function(p) {
                     p.unshift( tree2.synTreeID );
                     return p;
                   });
                   
               } else {
                   return false;
               }
           } else if (toMatch == "*") {            
               //2 cases to do: just match *, and match next elt (i.e. done with *)
               
               var fnd1 = [],  fnd2 = [];
               
               //match * and keep going with same path
               fndRest = recurse(path2, fndFirst);
               if (fndRest) {
                  //if we've already found something, then it's just a normal case: we add the current thing to the path
                  if (fndFirst) {
                     //tree2["marked"] = true;
                     if (fndRest.length == 0) {
                        fnd1 = [[tree2.synTreeID]];
                     } else if (fndRest.length > 0) {
                       fnd1 = fndRest.map(function(p) {
                          p.unshift( tree2.synTreeID );
                         return p;
                       });                     
                    }
                  } else { //we need to pass what we've found on through
                     fnd1 = fndRest;
                  }
               }

               //match next element
               if (matchName(thisName, restPath[0])) {
                   restPath.shift(); //real symbol
                   
                   var fndRest2 = recurse(restPath, true);
                   if (fndRest2) {
                       //tree2["marked"] = true;
                       if (fndRest2.length == 0) {
                           fnd2 = [[tree2.synTreeID]];
                        } else {
                           fnd2 = fndRest2.map(function(p) {
                                 p.unshift( tree2.synTreeID );
                               return p;
                            });                           
                        }
                   }
               }
               
               if (fndRest || fndRest2) {                  
                  return fnd1.concat(fnd2);
               } else {
                  return false;
               }
               
           }
           return false;
               
           
           
          /////////
          
          function matchName(name, pat) {           
               return ( (name.search(pat) > -1) || (pat == "\." && name == ".") || (pat == "\*" && name == "*") );
          }
       
         function recurse(morePath, fndFirst) {
             var rwhat = [];
             if (morePath.length == 0) {
                 //return true;
                 return rwhat;
             }
             var found = false;
             var children = tree2.children, n;
             if (children && (n=children.length)) {                
                 for(var i=0;i<n;i++) {                    
                     var theResult = helper(children[i], morePath, fndFirst);
                     if (theResult){
                         found = true;
                         var tmp = rwhat.concat(theResult);
                         rwhat = tmp;
                         //rwhat.push(theResult);
                     }
                 }
             }
             if (found) {
               return rwhat;
             }
             return found;
         } //end recurse
         
         return false;
     }   //end helper  
       
   }
   
   return vis; //so we can do stuff with it
}

///////////////////////////////////////////////////// D3 stuff //////////////////////////////////////////////////////////////////////
//// utility
sfs.d3.element2selection = function(elt) {
   //create a fake d3 selection from the (visual) element
   //we could do a real one by using  d3_selection  (but then we'd have to copy a bunch of stuff over))
   return [[elt]];
}

  
////////////////////////// layouts and related functions///////////////////////////////////////////////////////////////////////
//CC env is calling environment, since we're not inside D3
//CC we use this set up the data structure for the nodes before we call the real hierarchical layout
sfs.d3.layout.clusterDummy = function(env) {
  var hierarchy = sfs.d3.layout.hierarchy().sort(null).value(null);

  function cluster(d, i) {
    //var nodes = hierarchy.call(this, d, i);
    var nodes = hierarchy.call(env, d, i);
    return nodes;
  }

  return d3_layout_hierarchyRebind(cluster, hierarchy);
};

// Implements a hierarchical layout using the cluster (or dendogram) algorithm.
//CC we assume here that we have added a vis attribute to each node which is the visual instantiation of the node; we can then call vis.getBBox() to the width and height
//CC since we know the width and height of everything, we do not need to scale, but we do need to resize the svg to the correct size (outside of clusterVis)
//CC we need to update the layout every time we change its visual appearance
//CC env is the calling environment, since we're not inside D3
sfs.d3.layout.dendrogramVis = function(env, alignBottom) {
  var hierarchy = sfs.d3.layout.hierarchy().sort(null).value(null),
      separation, getLevel;
      
      if (alignBottom) {
         getLevel = function(nd) {
            return nd.y;
         }
      } else {
         getLevel = function(nd) {
            return nd.depth;
         }
      }
      
      //CC new
      var kHPad = 10
        kVPad = 20;
      separation = function(nd, prevNd) {
        var rt =  prevNd.width/2;
        return rt + kHPad + nd.indent + nd.width/2;
      }      
      //CC end new

  function cluster(d, i) {
    var nodes = hierarchy.call(env, d, i),
        root = nodes[0],
        previousNode,
        x = 0;
        
    var levelHts = []; //CC new, for the the maximum heights of each level

    //CC new: calculate node width, height; maxWidth of subtree
    d3_layout_treeVisitAfter(root, function(node) {
      var bb = node.vis.getBBox();
      //delete node.vis; //CC we can't do this, since we'll need it if we update
      node.width = bb.width;
      node.height = bb.height;
      
      var children = node.children;
      if (children && children.length) {
          var firstChild = children[0];
          node.childrenWidth = sfs_d3_layout_clusterChildrenWidth(children) + (children.length-1)*kHPad;
          if (node.width > node.childrenWidth) {
            node.treeWidth =  node.width;                        
          } else {
            node.treeWidth = node.childrenWidth;
          }
          
      } else {
         node.treeWidth = node.width;        
      }
      
      delete node.indent; //cleaning up      ??
    });
    
    
    //CC Now we calculate leftMost and rtMost        
    sfs_d3_layout_clusterLeftMost(root);
    sfs_d3_layout_clusterRightMost(root)
    
    //CC end new

    // First walk, computing the initial x & y values.
    d3_layout_treeVisitAfter(root, function(node) {      
      var children = node.children;
      if (children && children.length) {
        node.x = d3_layout_clusterX(children);
        node.y = d3_layout_clusterY(children);        
        previousNode = node.rtMost; //CC new, since we're now using treeWidth        
      } else {
        //node.x = previousNode ? x += separation(node, previousNode) : 0; //CC orig
        //CC new
        if (previousNode) {
          if (x > previousNode.x) {
            x = previousNode.x;
          }
          node.x = x += separation(node, previousNode);
          previousNode = node.rtMost; //CCC new, for ordered dependencies
        } else {
         //CC left-most leaf of whole tree          
          node.x = x += (node.indent + node.width/2);
          previousNode = node; //CCC new;  mostly we don't need this, but we do for ordered dependency -- why? because now we can have leaf as child of branching node. Before, we never did
        }
        
        node.y = 0;
        //previousNode = node; //CC orig
      }
      var levl = getLevel(node);
      var test = levelHts[levl];
      if (test) {
        levelHts[levl] = Math.max(test, node.height);
      } else {
        levelHts[levl] = node.height;
      }
    });

    //CC new
    root.visW = Math.max(x + root.rtMost.width/2, root.treeWidth) + 2*kHPad;
    
    var levelYs = [];
    if (alignBottom) {    
      var m = levelHts.length -1;
      levelYs[m--] = levelHts[0];
      for(var j=m;j>-1;j--) {
        levelYs[j] = levelYs[j+1] + levelHts[j] + kVPad;
      }
      root.visH = levelYs[0];
      
    } else {
      var m = levelHts.length;
      levelYs[0] = levelHts[0];
      for(var j=1;j<m;j++) {
        levelYs[j] = levelYs[j-1] + levelHts[j] + kVPad;
      }
      root.visH = levelYs[m-1];
   }
    //CC end new
  
  
  
    // Second walk, setting y,clean up the big stuff
    d3_layout_treeVisitAfter(root, function(node) {      
      node.y = levelYs[ getLevel(node) ];      
      delete node.rtMost;      
    });

    return nodes;
  }
  
  return d3_layout_hierarchyRebind(cluster, hierarchy);
};

//////////////// CC support functions for dendrograms
function sfs_d3_layout_clusterChildrenWidth(children) {
  return children.reduce(function(x, child) {
      return x + child.treeWidth;
  }, 0);

  
}

function sfs_d3_layout_clusterLeftMost(node) {
  
    var children = node.children, n;
    if (children && (n = children.length)) {
      n = children.length;
      var firstChild = children[0];
    }
    
    if (firstChild) {
      
      if (! node.indent) {
         //i.e. looking for left-most node
         if ((n==1 && node.width == node.treeWidth) || (n>1 && 1.5 * node.width > node.childrenWidth)) {
            //i.e. this is the left-most node
            node.indent = 0;
            //set indent of firstChild
            setIndent();
         } else {
            //i.e. haven't come to left-most node yet
            if (! (firstChild.children && firstChild.children.length) ) {
               //i.e. leaf is left-most
               firstChild.indent = 0;
            } else {
               //do nothing and keep going   
            }
            
            
         }
         
      } else {
         //we have found left-most node, and need to calculate indent
         //set indent of firstChild
         setIndent();
      }
      
      //recurse
      for(var i=0;i<n;i++) {                       
           sfs_d3_layout_clusterLeftMost(children[i]);
      }
    } else {
      //CCC new
      if (! node.indent) {
         node.indent = 0;
      }
    }
    
    
    function setIndent() {
         var howMuch;
         if (node.children.length > 1) {
            howMuch = (  1.5*node.width - node.childrenWidth  ) /2;         
         } else {
            howMuch = ( node.width - firstChild.width ) /2;
         }
         firstChild.indent = node.indent + howMuch;
    }
}


function sfs_d3_layout_clusterRightMost(node, toSet) {
  var children = node.children;
    var n;
    if (toSet) {
        node.rtMost = toSet;       
    } else if (node.width == node.treeWidth) {
        node.rtMost = node;
        toSet = node;
    }    
    if (children && (n = children.length)) {
        sfs_d3_layout_clusterRightMost(children[n-1], toSet);        
        for(var i=0;i<n-1;i++) {                       
            sfs_d3_layout_clusterRightMost(children[i]);
        }
        
        if (!toSet) {
          node.rtMost = children[n-1].rtMost;
        }
    }
    
    return node.rtMost;
}


/////////////////////////////// Node-link tree
// CC largely based on D3, but now we take the nodes' width and height into account
//CC env is calling environment, since we're not inside D3 (we may not need it here, but we did(?) for visDendogram ??)
sfs.d3.layout.treeVis = function(env) {
  //var hierarchy = d3.layout.hierarchy().sort(null).value(null), //CC orig
  var hierarchy = sfs.d3.layout.hierarchy().sort(null).value(null); //CC new
      
      //CC new
      var kHPad = 10
        kVPad = 20;
      var separation = function(nd, prevNd) {
        var rt =  prevNd.width/2;
        //return rt + kHPad + nd.indent + nd.width/2;
        return rt + kHPad  + nd.width/2;
      }
      
      //CC end new

  function tree(d, i) {
    
    //var nodes = hierarchy.call(this, d, i), //CC orig
    var nodes = hierarchy.call(env, d, i), //CC new
        root = nodes[0];


    var levelHts = []; //CC new, for the the maximum heights of each level
    
    
    function firstWalk(node, previousSibling) {
      //CC new
      var bb = node.vis.getBBox();
      node.width = bb.width;
      node.height = bb.height;
      //CC end new
      
      var children = node.children,
          layout = node._tree;
      if (children && (n = children.length)) {
        var n,
            firstChild = children[0],
            previousChild,
            ancestor = firstChild,
            child,
            i = -1;
        while (++i < n) {
          child = children[i];
          firstWalk(child, previousChild);
          ancestor = apportion(child, previousChild, ancestor);
          previousChild = child;
        }
        d3_layout_treeShift(node);
        var midpoint = .5 * (firstChild._tree.prelim + child._tree.prelim);
        if (previousSibling) {
          layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
          layout.mod = layout.prelim - midpoint;
        } else {
          layout.prelim = midpoint;
        }
      } else {
        if (previousSibling) {
          layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
        }
      }
      
      //CC new
      var test = levelHts[node.depth];
      if (test) {
        levelHts[node.depth] = Math.max(test, node.height);
      } else {
        levelHts[node.depth] = node.height;
      }
      //CC end new
    }

    function secondWalk(node, x) {
      node.x = node._tree.prelim + x;
      var children = node.children;
      if (children && (n = children.length)) {
        var i = -1,
            n;
        x += node._tree.mod;
        while (++i < n) {
          secondWalk(children[i], x);
        }
      }
    }

    function apportion(node, previousSibling, ancestor) {
      if (previousSibling) {
        var vip = node,
            vop = node,
            vim = previousSibling,
            vom = node.parent.children[0],
            sip = vip._tree.mod,
            sop = vop._tree.mod,
            sim = vim._tree.mod,
            som = vom._tree.mod,
            shift;
        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
          vom = d3_layout_treeLeft(vom);
          vop = d3_layout_treeRight(vop);
          vop._tree.ancestor = node;
          shift = vim._tree.prelim + sim - vip._tree.prelim - sip + separation(vim, vip);
          if (shift > 0) {
            d3_layout_treeMove(d3_layout_treeAncestor(vim, node, ancestor), node, shift);
            sip += shift;
            sop += shift;
          }
          sim += vim._tree.mod;
          sip += vip._tree.mod;
          som += vom._tree.mod;
          sop += vop._tree.mod;
        }
        if (vim && !d3_layout_treeRight(vop)) {
          vop._tree.thread = vim;
          vop._tree.mod += sim - sop;
        }
        if (vip && !d3_layout_treeLeft(vom)) {
          vom._tree.thread = vip;
          vom._tree.mod += sip - som;
          ancestor = node;
        }
      }
      return ancestor;
    }

    // Initialize temporary layout variables.
    d3_layout_treeVisitAfter(root, function(node, previousSibling) {
      node._tree = {
        ancestor: node,
        prelim: 0,
        mod: 0,
        change: 0,
        shift: 0,
        number: previousSibling ? previousSibling._tree.number + 1 : 0
      };
    });

    // Compute the layout using Buchheim et al.'s algorithm.
    firstWalk(root);
    secondWalk(root, -root._tree.prelim);

    // Compute the left-most, right-most, and depth-most nodes for extents.
    var left = d3_layout_treeSearch(root, d3_layout_treeLeftmost),
        right = d3_layout_treeSearch(root, d3_layout_treeRightmost),
        deep = d3_layout_treeSearch(root, d3_layout_treeDeepest),
        x0 = left.x - separation(left, right) / 2,
        x1 = right.x + separation(right, left) / 2
      ;
        //y1 = deep.depth || 1; //CC orig, but no longer needed


    //CC new
    var levelYs = [];
    var m = levelHts.length;

    levelYs[0] = levelHts[0];
    for(var j=1;j<m;j++) {
      levelYs[j] = levelYs[j-1] + levelHts[j] + kVPad;
    }
    root.visH = levelYs[m-1];
    
    x0 -= left.width/2 + kHPad;
    x1 += right.width/2 + kHPad;
    root.visW = x1 - x0
    //CC end new
    
    // Clear temporary layout variables; transform x and y.
    d3_layout_treeVisitAfter(root, function(node) {
      //node.x = (node.x - x0) / (x1 - x0) * size[0]; /CC orig
      node.x -= x0;
      //node.y = node.depth / y1 * size[1]; //CC orig
      node.y = levelYs[ node.depth ]; //CC new
      delete node._tree;
    });

    return nodes;
  }

  tree.separation = function(x) {
    if (!arguments.length) return separation;
    separation = x;
    return tree;
  };

  tree.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return tree;
  };

  return d3_layout_hierarchyRebind(tree, hierarchy);
};


/////////////////////////// Copied from d3.layout  :( with one bug fix //////////////////////////////
//we need this, only because of d3_layout_hierarchyInline, which is set in the d3 scope
sfs.d3.layout.hierarchy = function() {
  var d3_layout_hierarchyInline = true; //CC new
  var sort = d3_layout_hierarchySort,
      children = d3_layout_hierarchyChildren,
      value = d3_layout_hierarchyValue;
      
      //CC copied from external to here
      function d3_layout_hierarchyChildren(d) {
        return d.children;
      }
      
      function d3_layout_hierarchyValue(d) {
        return d.value;
      }
      
      function d3_layout_hierarchySort(a, b) {
        return b.value - a.value;
      }
      //CC end copy

  // Recursively compute the node depth and value.
  // Also converts the data representation into a standard hierarchy structure.
  function recurse(data, depth, nodes) {    
    var childs = children.call(hierarchy, data, depth),
        node = d3_layout_hierarchyInline ? data : {data: data};
    node.depth = depth;
    nodes.push(node);
    if (childs && (n = childs.length)) {
      var i = -1,
          n,
          c = node.children = [],
          v = 0,
          j = depth + 1;
      var d; //CC new -- unscoped in d3
      while (++i < n) {
        d = recurse(childs[i], j, nodes);
        d.parent = node;
        c.push(d);
        v += d.value;
      }
      if (sort) c.sort(sort);
      if (value) node.value = v;
    } else if (value) {
      node.value = +value.call(hierarchy, data, depth) || 0;
    }
    return node;
  }

  // Recursively re-evaluates the node value.
  function revalue(node, depth) {
    var children = node.children,
        v = 0;
    if (children && (n = children.length)) {
      var i = -1,
          n,
          j = depth + 1;
      while (++i < n) v += revalue(children[i], j);
    } else if (value) {
      v = +value.call(hierarchy, d3_layout_hierarchyInline ? node : node.data, depth) || 0;
    }
    if (value) node.value = v;
    return v;
  }

  function hierarchy(d) {
    var nodes = [];
    recurse(d, 0, nodes);
    return nodes;
  }

  hierarchy.sort = function(x) {
    if (!arguments.length) return sort;
    sort = x;
    return hierarchy;
  };

  hierarchy.children = function(x) {
    if (!arguments.length) return children;
    children = x;
    return hierarchy;
  };

  hierarchy.value = function(x) {
    if (!arguments.length) return value;
    value = x;
    return hierarchy;
  };

  // Re-evaluates the `value` property for the specified hierarchy.
  hierarchy.revalue = function(root) {
    revalue(root, 0);
    return root;
  };

  return hierarchy;
};

function d3_layout_hierarchyRebind(object, hierarchy) {
  d3.rebind(object, hierarchy, "sort", "children", "value");

  // Add an alias for links, for convenience.
  object.links = d3_layout_hierarchyLinks;

  // If the new API is used, enabling inlining.
  object.nodes = function(d) {
    //d3_layout_hierarchyInline = true;
    d3.d3_layout_hierarchyInline = true;
    return (object.nodes = object)(d);
  };

  return object;
}

// Returns an array source+target objects for the specified nodes.
function d3_layout_hierarchyLinks(nodes) {
  return d3.merge(nodes.map(function(parent) {
    return (parent.children || []).map(function(child) {
      return {source: parent, target: child};
    });
  }));
}

function d3_layout_treeVisitAfter(node, callback) {
  function visit(node, previousSibling) {
    var children = node.children;
    if (children && (n = children.length)) {
      var child,
          previousChild = null,
          i = -1,
          n;
      while (++i < n) {
        child = children[i];
        visit(child, previousChild);
        previousChild = child;
      }
    }
    callback(node, previousSibling);
  }
  visit(node, null);
}

///for dendrograms
function d3_layout_clusterY(children) {
  return 1 + d3.max(children, function(child) {
    return child.y;
  });
}

function d3_layout_clusterX(children) {
  return children.reduce(function(x, child) {
    return x + child.x;
  }, 0) / children.length;
}

///for trees
function d3_layout_treeShift(node) {
  var shift = 0,
      change = 0,
      children = node.children,
      i = children.length,
      child;
  while (--i >= 0) {
    child = children[i]._tree;
    child.prelim += shift;
    child.mod += shift;
    shift += child.shift + (change += child.change);
  }
}

function d3_layout_treeMove(ancestor, node, shift) {
  ancestor = ancestor._tree;
  node = node._tree;
  var change = shift / (node.number - ancestor.number);
  ancestor.change += change;
  node.change -= change;
  node.shift += shift;
  node.prelim += shift;
  node.mod += shift;
}

function d3_layout_treeAncestor(vim, node, ancestor) {
  return vim._tree.ancestor.parent == node.parent
      ? vim._tree.ancestor
      : ancestor;
}

function d3_layout_treeLeft(node) {
  var children = node.children;
  return children && children.length ? children[0] : node._tree.thread;
}

function d3_layout_treeRight(node) {
  var children = node.children,
      n;
  return children && (n = children.length) ? children[n - 1] : node._tree.thread;
}


function d3_layout_treeSearch(node, compare) {
  var children = node.children;
  if (children && (n = children.length)) {
    var child,
        n,
        i = -1;
    while (++i < n) {
      if (compare(child = d3_layout_treeSearch(children[i], compare), node) > 0) {
        node = child;
      }
    }
  }
  return node;
}

function d3_layout_treeRightmost(a, b) {
  return a.x - b.x;
}

function d3_layout_treeLeftmost(a, b) {
  return b.x - a.x;
}

function d3_layout_treeDeepest(a, b) {
  return a.depth - b.depth;
}

///////

})();