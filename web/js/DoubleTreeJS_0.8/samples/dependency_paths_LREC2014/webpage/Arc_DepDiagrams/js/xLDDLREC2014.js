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
/* Original: 20110221 */
/* Revised: 20110516 */
/* Version 0.5 */

/* Modified 2014-02-03 By Chris Culy for LREC 2014 demo*/

var xdd = XDD();

//xdd.onWheel = null; //disable zooming with scrollwheel, since have slider and/or buttons

xdd.onSelectNode = function(nd) {
	xdd.selectItem(nd);
	xdd.selectLinksFromSelectedNodes();
}
//CC this works, but it doesn't fit right with the protovis model.
//This is overriding the same function in dd-full.js
pv.Layout.EURACDepDiagram.isOver = function(link) {
	return true;  // always on top
}

//link (arc) appearance
xdd.showLink = function(srcNd, link) {
	return true; // show all arcs
}
xdd.linkCurve = function(link) {
	//return 0;
	//circular arcs for things that are closer together
	var realDist = xdd.dd.scale* Math.abs(link.sourceNode.x - link.targetNode.x)
	
	if (realDist < 40) {
		return 0;
	} else {
		return 0.3
	}
}

xdd.linkColor = function(link) {
	return "black";
}

xdd.linkWidth = function(link) {
	if (xdd.isSelected(link)) {
		return 4;
	} else {
		return 2;
	}
}

//TBD
xdd.linkTitle = function(link) {
	var srcPOS = getPOS(link.sourceNode);
	var tarPOS = getPOS(link.targetNode);
	
	return link.relation + "\t(" + srcPOS + ") -> (" + tarPOS + ")"; //for CoNLL
}

xdd.relColor = function(link) {
	return "orange";
}

xdd.showRelationLabels = function (srcCoords, link) {
/*
//only show relation labels for arcs that are longer
	if (xdd.dd.scale* Math.abs(link.sourceNode.x - link.targetNode.x) < 40) {
		return false;
	} else {
		return true;
	}
*/

	
	return true; //always show labels
}

//node dot appearance
xdd.nodeDotSize = function() {return 10;}

//xdd.nodeDotShape = function(nd) {
//	var pos = getPOS(nd);
//	return tokSettings[pos].posShape;
//}


//xdd.nodeDotFillStyle = function(nd) {
//	var pos = getPOS(nd);
//	return tokSettings[pos].shapeColor;
//}

//xdd.nodeItemStyle = function(nd) {
//	if (xdd.isSelected(nd)) {
//		return tokSettings["tokHilight"];
//	} else {
//		var pos = getPOS(nd);
//		return tokSettings[pos].posColor;
//	}
//}

xdd.nodeDotTitle = function(nd) {
	if (nd.nodeValue.info == null) {
		return null;
	} else {
		return getPOS(nd);
	}
}

xdd.nodeItemTitle = function(nd) {
	if (nd.nodeValue.info == null) {
		return null;
	} else 
		var lemma = nd.nodeValue.info.LEMMA; //for CoNLL
		return lemma;
}
/*
xdd.nodeItemClick = function(nd) {
	alert(nd.nodeName + "\n" + 
	nd.headArcs.length + " head arcs: " 
	+ xdd.getRelationNames(nd.headArcs).join(",") + "\n" 
	+ nd.dependentArcs.length + " dependent arcs: " 
	+ xdd.getRelationNames(nd.dependentArcs).join(",") + "\n" 
	+ "Path to root: " + xdd.getRelationNames(nd.pathsToRoot).join(",") + "\n" 
	+ "isSelected: " + xdd.isSelected(nd)
	);
}
*/

// Info appearance
xdd.infoLineColor = "purple";
xdd.infoDotColor = "green";


//This is overriding xdd, which in turn overrides the default in dd-full
xdd.levelDelta = function(nd,posn) {
	return 0;
}

function getPOS(node) {
	if (node.nodeValue.info == null) {
		return "none"; //no pos, e.g. CoNLL ROOT
	}
	var what = node.nodeValue.info.pos; //generic, and e.g. kalashnikov691
	if ( what == null) {
		what = node.nodeValue.info.CPOSTAG; //for CoNLL
	}
	return what;
}

function selectPOS(pattern) {	
	//pattern does not have //
	//we will make it an exact match, so that we can just put in strings
	var re = new RegExp("^" + pattern + "$");
		
	xdd.dd.nodes().forEach(function(nd) {
		if (nd.nodeValue.info != null && re.test(getPOS(nd))) {
			xdd.selectItem(nd);
		}
	});
	xdd.vis.render();
}

//this isn't currently used, but is an illustration
function getInfoAsText(node) {
	if (node.nodeValue.info == null) {
		return "";
	}
	var what = "";
	var info = node.nodeValue.info;
	for(var attr in info) {
		what += attr + ":\t" +  info[attr] + "\n";
	}
	return what;
}