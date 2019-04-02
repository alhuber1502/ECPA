/* (This is the new BSD license.)
* Copyright (c) 2011, Europaeische Akademie Bozen/Accademia Europea Bolzano
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of the Europaeische Akademie Bozen/Accademia Europea 
*	Bolzano nor the of its contributors may be used to endorse or promote 
*	products from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY Europaeische Akademie Bozen/Accademia Europea
* Bolzano``AS IS'' AND ANY OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
* THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
* ARE DISCLAIMED. IN NO EVENT SHALL Europaeische Akademie Bozen/Accademia Europea
* Bolzano BE LIABLE FOR ANY, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
* CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE 
* GOODS OR SERVICES; OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
* CAUSED AND ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
* TORT INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF 
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/* Author(s): Chris Culy */
/* Copyright 2011 Accademia Europea Bolzano */
/* Original: 20110209 */
/* Revised: 20110607 */
/* Version 0.23 */

//starting from protovis' Arc.js

/**
 * Constructs a new, empty dependency diagram layout. Dependency diagram layouts are not typically constructed
 * directly; instead, they are included in the dependency diagram visualization {@link XDD}.
 *
 * @class Implements a layout for dependency diagrams. Extends pv.Layout.Network
 *
 *
 * 
 **/
pv.Layout.EURACDepDiagram = function() {
  pv.Layout.Network.call(this);
  var interpolate, // cached interpolate
      buildImplied = this.buildImplied;

  /** @ignore Cache layout state to optimize properties. */
  this.buildImplied = function(s) {
    buildImplied.call(this, s);
  };

  /* Override link properties to handle directedness and orientation. */
	//CC new
	this.link
      .data(function(p) {
          var s = p.sourceNode, t = p.targetNode;
 			//CC new
			//now try offsetting target		
			var modT = pv.Layout.EURACDepDiagram.offsetTarget(p);
			var sBeforeT = (s.breadth < t.breadth);
			if (pv.Layout.EURACDepDiagram.isOver(p)) {
				return sBeforeT ? [s, modT] : [modT, s];
			} else {
				return sBeforeT ? [modT, s] : [s, modT];
			}
			
		})
      .interpolate("polar") //only drawing curves
  ;
	
	this.node.property("stagger", Number); 
	/** @ignore exposed in ddVisualization */
	this.node.stagger = function(nd, i) {return 0;}; //default
	this.node.property("levelDelta", Number);  //CC this could be a vis level property, since we can always get the node via its position
	/** @ignore exposed in ddVisualization */
	this.node.levelDelta = function(nd, i) {return 0;} //default
	
	//CC end new
};

pv.Layout.EURACDepDiagram.prototype = pv.extend(pv.Layout.Network)
    .property("orient", String) //CC for now, only "bottom"
	.property("font", String) //CC new
	.property("tokenPadding",String) //CC new; should be Number, but that didn't work right
	.property("headIsTarget", Boolean) //CC new
	;

//CC new
//CC this works, but it doesn't fit right with the protovis model. It seems like it should be a property of links, but I couldn't get it to work
/**
*Returns true if the link arc is to be drawn above the text
*@name pv.Layout.EURACDepDiagram.isOver
@param {pv.Layout.Network.Link} link
@returns {boolean}
*/
pv.Layout.EURACDepDiagram.isOver = function(link) {
	return true; //default: always on top
}

//CC we need to name this, so we can use it for the arrow heads outside of the layout
//CC idea is to offset the target ends so that the arrows don't overlap so much
/**
* Calculates a slightly offset position for the arrow head of the link
*@name pv.Layout.EURACDepDiagram.offsetTarget
@param {pv.Layout.Network.Link} link
@returns {object} the new location (point) for the arrow head
*/
pv.Layout.EURACDepDiagram.offsetTarget = function(link) {
	var dx = 5, dy = 5;
	var targetLoc = {x:link.targetNode.x, y:link.targetNode.y};
	if (targetLoc.x > link.sourceNode.x) {
		//pointing right
		dx *= -1;
	}

	if (pv.Layout.EURACDepDiagram.isOver(link)) {
		dy *= -1;
	}

	targetLoc.x += dx;
	targetLoc.y += dy;
	return targetLoc;
}
//CC end new
	
/**
 * Default properties for dependency diagrams layouts. By default, the orientation is "bottom". NB: nothing else has been implemented
 *
 * @type pv.Layout.EURACDepDiagram
 */
pv.Layout.EURACDepDiagram.prototype.defaults = new pv.Layout.EURACDepDiagram()
    .extend(pv.Layout.Network.prototype.defaults)
    .orient("bottom")
	.font("10px sans-serif")
	.tokenPadding("8")
	.headIsTarget(true)
;

/** @ignore Populates the x, y and angle attributes on the nodes. */
pv.Layout.EURACDepDiagram.prototype.buildImplied = function(s) {
  if (pv.Layout.Network.prototype.buildImplied.call(this, s)) return; //CC orig, now moved up

  var nodes = s.nodes,
      orient = s.orient,
      index = pv.range(nodes.length),
      w = s.width,
      h = s.height,
      r = Math.min(w, h) / 2;

  //CC TBD: clean this up, since we're only using "bottom"
  /** @ignore Returns the mid-angle, given the breadth. */
  function midAngle(b) {
    switch (orient) {
      case "top": return -Math.PI / 2;
      case "bottom": return Math.PI / 2;
      case "left": return Math.PI;
      case "right": return 0;
      case "radial": return (b - .25) * 2 * Math.PI;
    }
  }

  //CC TBD: clean this up, since we're only using "bottom"
  /** @ignore Returns the x-position, given the breadth. */
  function x(b) {
    switch (orient) {
      case "top":
      //case "bottom": return b * w; //CC orig
	  case "bottom": return b; //CC new
      case "left": return 0;
      case "right": return w;
      case "radial": return w / 2 + r * Math.cos(midAngle(b));
    }
  }

  //CC TBD: clean this up, since we're only using "bottom"
  /** @ignore Returns the y-position, given the breadth. */
  function y(b, deltaY) { //CC new: deltaY is new
    switch (orient) {
      case "top": return 0;
      case "bottom": return h/2 + deltaY; //CC deltaY is new, as is use of h/2
      case "left":
      case "right": return b * h;
      case "radial": return h / 2 + r * Math.sin(midAngle(b));
    }
  }
	//CC new
	//CC we need this before the x,y stuff below so that we we can use headArcs in levelDelta
	s.nodes.forEach(function(nd) {
		//we do this so that every node has non-null headArcs/dependentArcs
		nd.headArcs = [];
		nd.dependentArcs = [];
		
		nd.uniqID = "node(" + nd.index + ")";
	});
	s.links.forEach(function(lnk) {
		if (s.headIsTarget) {
			lnk.sourceNode.headArcs.push(lnk);
			lnk.targetNode.dependentArcs.push(lnk);
		} else {
			lnk.targetNode.headArcs.push(lnk);
			lnk.sourceNode.dependentArcs.push(lnk);
		}
		
		lnk.uniqID = "link(" + lnk.relation + "," + lnk.sourceNode.index + "," + lnk.targetNode.index + ")";
	});
	
	
	s.nodes.forEach(function(nd) {
		//nd.pathsToRoot is list of link paths from nd to the Root. There could be more than one path to the Root in cases of structure sharing/re-entrancy (??)
		//TBD ?? reentrancy would be a bit tricky; this only does single path
		nd.pathsToRoot = getPathToRoot(nd);
	});
	
	/** @ignore calculate the path from this node to the root node*/
	function getPathToRootORIG(nd) {
		if (nd.pathsToRoot != null) {
			return nd.pathsToRoot;
		}
		if (s.headIsTarget && nd.headArcs.length == 0) {
			return [];
		} 
		if ( (! s.headIsTarget) && nd.dependentArcs.length == 0) {
			return [];
		} 
		
		var firstArc;
		if (s.headIsTarget) {
			firstArc = nd.headArcs[0];
		} else {
			firstArc = nd.dependentArcs[0];
		}
		return [firstArc].concat( getPathToRoot(firstArc.targetNode) );
		
	}
	
	/** @ignore calculate the shortest path from this node to the root node, where the root is just a node with no ancestor, and so may not be unique; this does NOT use the rootName of the network, so an incomplete structure may not have have correct paths -- there may not be a path to the real root, but instead a path to a node with no ancestor, which will taken as a (graph) root */
	function getPathToRoot(nd) {
		//simple breadth first search
		if (nd.pathsToRoot != null) {
			return nd.pathsToRoot;
		}
		var whichArcs; //which set of arcs to look at
		var whichNode; //which node to look at
		if (s.headIsTarget) {
			whichArcs = "headArcs"; //"dependentArcs";
			whichNode = "targetNode";
		} else {
			whichArcs = "headArcs";
			whichNode = "sourceNode";
		}
		var seenNodes = {};
		var pathLinks = {}; // current -> predecessor: either node -> arc or arc -> node
		pathLinks[nd.uniqID] = null;

		var rtNode;
		var found = false;
		var nodesToCheck = [nd];
		while( (!found) && nodesToCheck.length > 0 ) {
			var thisNd = nodesToCheck.shift();
			seenNodes[thisNd.uniqID] = true;
			found = false;
		
			var nArcs = thisNd[whichArcs].length;
			for(var i=0;i<nArcs;i++) {
				var arc = thisNd[whichArcs][i];
				if (! pathLinks[arc.uniqID] ) {
					var otherNd = arc[whichNode];
					pathLinks[arc.uniqID] = thisNd;
					pathLinks[otherNd.uniqID] = arc;
					
					if (otherNd[whichArcs].length == 0) {
						found = true;
						rtNode = otherNd;
						break;
					}
					
					if (! (otherNd.uniqID  in seenNodes) ){
						nodesToCheck.push( otherNd );
					}
				}
			}
		}
		
		if (!rtNode) { //i.e. we didn't find a path to a root (nd is a root node)
			return [];
		}
		//now make list of arcs and nodes (will filter nodes out later)
		var fullPath = [ rtNode ];
		var nextElt = rtNode.uniqID;
		while (nextElt in pathLinks) {
			var predecessor = pathLinks[nextElt];
			if ( ! predecessor ) {
				break;
			}
			fullPath.unshift( predecessor );
			nextElt = predecessor.uniqID;
		}
		//now filter out nodes, keeping only arcs
		var what = fullPath.filter(function(e) {
			return (e.uniqID.indexOf("link") == 0);
		});
		var blorp = what.map(function(a) { return a.uniqID; }).join("\n");
		return what;
		
	}
    //CC end new
	
  /* Populate the x, y and mid-angle attributes. */
  var fSize = parseInt(this.scene[0].font);
  var tp = 1*this.tokenPadding(); //CC dumb, since tokenPadding is a string
  var breadthSoFar = (stringWidth(nodes[index[0]].nodeName, fSize) + tp)/2; //make sure we're not off the left edge
  var currLevel = 0;
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[index[i]]; // b = n.breadth = (i+.5)/nodes.length; //CC original
	
	var delta = this.node.levelDelta(n,i);
	currLevel += delta;
    n.y = y(b, -currLevel * fSize); //levelDelta is positive for higher, negative for lower, but y coordinates are the opposite
    
	var thisLen = stringWidth(n.nodeName, fSize) + tp; //with a bit of padding
	breadthSoFar += thisLen;
	if (delta != 0) {
		breadthSoFar -= this.node.stagger(n,i)*thisLen;  //stagger is proportion of length, but only if we change levels, to help avoid overlap
	}
	n.breadth = breadthSoFar;
	var b = breadthSoFar - thisLen/2; //middle 
    n.x = x(b);
	n.midAngle = midAngle(b);
  }

};

/**
 * The orientation. The default orientation is "bottom", which means that nodes
 * will be positioned from left-to-right in the order they are specified in the
 * <tt>nodes</tt> property, with the arcs above and below. This is different from Arc.js.
 * The following orientations are supported:<ul>
 *
 * <li>bottom - bottom-to-top.
 *
 * @type string
 * @name pv.Layout.EURACDepDiagram.prototype.orient
 */

 /////////////////////////////////////EURAC Utilities///////////////////////////////////////////////
 
//stringWidth is a pain, though it shouldn't be
//Raphael does it (look at Element[proto].getBBox ), but I don't quite see how to extract the relevant bits for here
//so we approximate for now
//just approximating for now, but works better than stringWidth2 ("looser")
/**
* Gives an approximation to the width of a string according a (CSS) font specification (assumed to be in pixels or points)
*@function 
*@name stringWidth
*@param {string} theStr
*@param {string} theFont
*@returns {number} the approximate width of theStr in theFont in pixels
*/
function stringWidth(theStr, theFont) {
	var fontSize = parseInt(theFont);
	if (isNaN(fontSize)) {
		fontSize = 10; //guessing that we have the default size, if we can't get the real one.
	}
	//em = fontsize =~ 2x average width;
	return theStr.length*fontSize/2;
}

//Note that stringWidth ORIG and this depend on a "px" (or "pt") specification
/*
function stringWidthSCALE(theStr, theFont, scale) {
	if (scale == null) {
		scale = 1;
	}
	var fontSize = parseInt(theFont);
	if (isNaN(fontSize)) {
		fontSize = 10; //guessing that we have the default size, if we can't get the real one.
	}
	//em = fontsize =~ 2x average width;
	return scale*(theStr.length*fontSize/2);
}


//works, but not as well as stringWidth
function stringWidth2(theStr, theFont) {
	var id = "_._sw";
	var span = document.getElementById(id);
	if (span == null) {
		span = document.createElement("span");
		span.setAttribute("id", id);
		document.body.appendChild(span);
	}
	span.style.fontSize = parseInt(theFont);
	span.innerHTML = theStr;
	//var what = span.clientWidth; //this didn't work
	var what = span.offsetWidth;
	return what;
}
*/