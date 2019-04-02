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
/* Revised: 20110629 */
/* Version 0.23 */

/**
 * Constructs an empty XDD (aka xLDD in the publications) with the optional (and probably not very useful) initialValues.
 *
 * @class This is the Visual Encoding and Interaction (VEI) wrapper around the dependency diagram layout.
 *
 * <p>The dependency structure is as assigned and the visualization realized via {@link #resetVis}. 
 *
 * @param {map} initialVals a map from fields to initial values.
*/
function XDD(initialVals) {
	//initialVals is optional, and probably not very useful
	//We'll return xdd rather than using XDD directly.
	//The reason for this has to do with scope issues with protovis and the use of "this"
	//The drawback as that we can't use the javascript prototype technique for extending XDD
	var xdd = {};

	//NB, the direction of the arcs is in the boolean network.headIsTarget (which makes the arrows point towards the head)

	/** 
	* Keeps track of which extra info we're supposed to be showing
	* @private
	* @fieldOf XDD.prototype
	* @exports xdd.showInfo as showInfo
	* @type Object
	*/
	xdd.showInfo = {};
	/** 
	* The color for the lines in the tree display of the extra information
	* @fieldOf XDD.prototype
	* @exports xdd.infoLineColor as infoLineColor 
	* @type Color
	*/
	xdd.infoLineColor = "gray";
	/** 
	* The color for the dots in the tree display of the extra information
	* @fieldOf XDD.prototype
	* @exports xdd.infoDotColor as infoDotColor 
	* @type Color
	*/
	xdd.infoDotColor = "gray";
	/** 
	* Do we visualize any nodes whose name is xdd.rootName (there may not be any);
	* @fieldOf XDD.prototype
	* @exports xdd.showRootToken as showRootToken 
	* @type Boolean
	*/
	xdd.showRootToken = false;
	
	/** 
	* A copy of the original input network
	* @private
	* @fieldOf XDD.prototype
	* @exports xdd.origNetwork as origNetwork 
	* @type {pv network} 
	*/
	xdd.origNetwork;
	
	/** 
	* A copy of the container ID
	* @private
	* @fieldOf XDD.prototype
	* @exports xdd.origNetwork as origNetwork 
	* @type {pv network} 
	*/
	xdd.origID;
	
	/** 
	* Resets the visualization with the given network (the dependency structure) and show it in the web page container
	* @methodOf XDD.prototype
	* @exports xdd.resetVis as resetVis 
	* @param {string} containerID the id of the web page to contain the diagram, usually a div
	* @param {pv network} network the dependency diagram (in pv network format) to be visualized
	*/
	xdd.resetVis = function(containerID, network) { 
			document.getElementById(containerID).innerHTML = ""; //get rid of the previous diagram
			xdd.origID = containerID;
			xdd.origNetwork = network;
			if (network == null) {
				return;
			}
			
			if (xdd.visW == null) {
				xdd.visW = document.body.clientWidth;
			}
			if (xdd.visH == null) {
				xdd.visH = 800;
			}
			xdd.showDiagram(containerID, network); //default width and height
	}

	/** 
	* Refreshes the visualization after we've changed (certain &mdash; which? at least ones for nodes) visualization options
	* @methodOf XDD.prototype
	* @exports xdd.refresh as refresh 
	*/
	xdd.refresh = function() {
		if (xdd.origID == null) {
			return;
		}
		xdd.resetVis(xdd.origID, xdd.origNetwork);
	}
	
	/** 
	* Sets the maximum size of the visualization area
	* @methodOf XDD.prototype
	* @exports xdd.setDisplaySize as setDisplaySize 
	* @param {number} wd the width
	* @param {number} ht the height
	*/
	xdd.setDisplaySize = function(wd,ht) {
		xdd.visW = wd;
		xdd.visH = ht;
		if (xdd.vis != null) {
			xdd.vis.render();
		}
	}

	/** 
	* Does the real work of making the diagram
	* @private
	* @methodOf XDD.prototype
	* @exports xdd.showDiagram as showDiagram 
	* @param {string} containerID the id of the web page to contain the diagram, usually a div
	* @param {pv network} network the dependency diagram (in pv network format) to be visualized
	*/
	xdd.showDiagram = function(containerID, network) {
		document.getElementById(containerID).addEventListener("mousedown", xdd.doMouseDown, false); //to keep track of shift for non-contiguous selection

		/** 
		* The label of aroot node in the dependency structure
		* @fieldOf XDD.prototype
		* @exports xdd.rootName as rootName 
		* @type String
		*/
		xdd.rootName = null;
		if (network.rootName != null) {
			xdd.rootName = network.rootName;
		}

		/** 
		* The number of tokens in the diagram
		* @private
		* @fieldOf XDD.prototype
		* @exports xdd.numToks as numToks 
		* @type Number
		*/
		xdd.numToks = network.original.split(" ").length;
		/** 
		* Are we in the process of selecting nodes
		* @private
		* @fieldOf XDD.prototype
		* @exports xdd.isSelecting as isSelecting 
		* @type Boolean
		*/
		xdd.isSelecting = false;
		/** 
		* The width of the original input string, in pixels
		* @fieldOf XDD.prototype
		* @exports xdd.origWidth as origWidth 
		* @type Number
		*/
		xdd.origWidth = stringWidth(network.original,xdd.font) + xdd.padding*(xdd.numToks-1);
		//xdd.setDisplaySize(xdd.origWidth, xdd.visH); //TBD reset width. this works, but overrides application setting. Could have option to resize to width

		/** 
		* The pv.Panel which hosts the visualization.
		* @fieldOf XDD.prototype
		* @exports xdd.vis as vis 
		* @type pv.Panel
		*/
		xdd.vis = new pv.Panel()
			.canvas(containerID)
			.width(xdd.visW)
			.height(xdd.visH)
			.events("all")
			.event("mousewheel",xdd.onWheel)
			.event("mousedown", xdd.onMouseDown)
			.cursor("move")
			.lineWidth(xdd.visFrameWidth)
			.strokeStyle(xdd.visFrameStyle)
		;

//////////////////////////////////////////////////////////////////////////////////////////////////
		/** 
		* The visualization of the diagram
		* @fieldOf XDD.prototype
		* @exports xdd.dd as dd 
		* @type pv.Layout.EURACDepDiagram
		*/
		xdd.dd = xdd.vis.add(pv.Layout.EURACDepDiagram)
			.nodes(network.nodes)
			.links(network.links)
			.font(xdd.font)
			.tokenPadding(xdd.padding) //CC new, padding between tokens on the same level
			.headIsTarget(network.headIsTarget)
			////the rest is for selecting nodes by dragging
			.data([{x:0, y:0, dx:0, dy:0}]) //CC the numbers are meaningless, but we need some values
			.events("mousedown")
			.event("mousedown", pv.Behavior.select())
			.event("select", xdd.update)
			.event("selectend", function(coords) {
				xdd.isSelecting=false;
				
				//make sure we can't select things that are outside of our visible area
				var offsetX = xdd.vis.transform().invert().x;
				var offsetY = xdd.vis.transform().invert().y;
				var visRt = Math.min(coords.x + coords.dx, xdd.visW + offsetX); 
				var visBot = Math.min(coords.y + coords.dy, xdd.visH + offsetY);
				var visLeft = Math.max(coords.x, offsetX);
				var visTop = Math.max(coords.y, offsetY)
				
				//not the most efficient, but it is straightforward
				var tmpNds = xdd.dd.nodes();
				for(var i in tmpNds) {
					var nd = tmpNds[i];
					if (nd.x > visLeft && nd.x < visRt && nd.y > visTop && nd.y < visBot) {
						//xdd.selectItem(nd);
						xdd.onSelectNode(nd);
					}
				}
				
				xdd.vis.render();
			})
		;
		
		//CC this is the actual selection rectangle
		xdd.dd.add(pv.Bar)
		   .visible(function(d, k, t) {
				return xdd.isSelecting;
			})
		   .left(function(d) {return d.x;})
		   .top(function(d) {return d.y;})
		   .width(function(d) {return d.dx;})
		   .height(function(d) {return d.dy;})
		   .fillStyle("rgba(0,0,0,.15)")
		   .strokeStyle("white")
		   .event("mousedown", pv.Behavior.drag())
		   .event("drag", xdd.update)
		;

		/** 
		* The characteristics of the arcs of the diagram
		* @private
		* @fieldOf XDD.prototype
		* @exports xdd.arc as arc 
		* @type pv.Line
		*/
		xdd.arc = xdd.dd.link.add(pv.Line)
			.visible(function(srcNd,link) {
				if (! xdd.showRootToken && (link.targetNode.nodeName == xdd.rootName || link.sourceNode.nodeName == xdd.rootName)) {
					return false;
				}
				return xdd.showLink(srcNd, link);
			})
			.strokeStyle(function(srcNd,link) { 
				return xdd.linkColor(link);
			})
			.lineWidth(function(srcNd,link) {
				return xdd.linkWidth(link);
			})
			.eccentricity(function(srcNd,link) {
				return xdd.linkCurve(link);
			}) //for the curvature [0,1]: 0 is circular arc, 1 is flat line
			.events("mouseover") //need this for title
			.title(function(srcNd, link) {
				return xdd.linkTitle(link);
			})
		;

		//show the relations centered over their arcs. OK for big arcs. Cramped for small ones
		xdd.arc.add(pv.Label)
			.visible(function(srcCoords, link) {
				if (! xdd.showRootToken && (link.targetNode.nodeName == xdd.rootName || link.sourceNode.nodeName == xdd.rootName)) {
					return false;
				}
				return xdd.showRelationLabels(srcCoords, link); 
			})
			.font(function() { //we need this before top, so we can calculate the font size there
				return xdd.dd.font();
			})
			.left(function(srcCoords, link) {
				var sx = link.sourceNode.x;
				var tx = link.targetNode.x;
				if (sx < tx) {
					return sx + (tx-sx)/2;
				} else {
					return tx + (sx-tx)/2;
				}
			})
			.top(function(srcCoords, link) {
				//cf. http://en.wikipedia.org/wiki/Ellipse
				//but non-circular arcs still don't get labels right
				var s = link.sourceNode;
				var t = link.targetNode;
				var e = xdd.linkCurve(link);
				var a = Math.abs(t.x - s.x)/2; 
				//var ht = a* Math.sqrt(1-e*e);
				var ht = a*(1-e)*(1-e); //CC this is an approximation
				var fSize = parseFloat(this.font());
				if (pv.Layout.EURACDepDiagram.isOver(link)) {
					//return Math.min( s.y, t.y ) - ht;
					return s.y - (s.y - t.y)/2 - ht;
				} else {
					//return Math.max( s.y, t.y) + ht + fSize;
					return s.y - (s.y - t.y)/2 + ht + fSize;
				}
			})
			.textStyle(function(srcCoords, link) {
				return xdd.relColor(link);
			})
			.textAlign("center")
	//		.textAngle(-Math.PI/4)
			.text(function(srcCoords, link) {
				return link.relation;
			})
		;

		xdd.arc.add(pv.Dot)
			.visible(function(dotLoc, link){
				//don't show if has a dummy root token and we're not supposed to show that
				if (! xdd.showRootToken && (link.targetNode.nodeName == xdd.rootName || link.sourceNode.nodeName == xdd.rootName)) {
					return false;
				}
				return xdd.showLink(link.sourceNode, link) && xdd.showArcHeads(link); //show only if we also show the arc/link
			})
			.data(function(link) {
				//arrows only on heads
				//cf: http://groups.google.com/group/protovis/browse_thread/thread/2c1d6e921ba7458c/56f368c68c2038b8?lnk=gst&q=label+line#56f368c68c2038b8
				//return [{x:link.targetNode.x,y:link.targetNode.y}]; //we could also put the arrows somewhere else on the arc;
				//now have moved target end of link
				return [pv.Layout.EURACDepDiagram.offsetTarget(link)];
			})
			.shape(xdd.arrowShape)
			.size(10)
			.angle(function(dotLoc, link) {
				if (link.targetNode.x < link.sourceNode.x) {
					return Math.PI/6;
				} else {
					return -Math.PI/6;
				}
			})
			.strokeStyle(function(thisXY,link) {
				return xdd.linkColor(link);
			})
			.fillStyle(function() { 
				return this.strokeStyle(); 
			})
		;

		/** 
		* The characteristics of the shapes for the nodes above the tokens
		* @private
		* @fieldOf XDD.prototype
		* @exports xdd.nodeDot as nodeDot
		* @type pv.Dot
		*/
		xdd.nodeDot = xdd.dd.node.add(pv.Dot)
			.visible(function(nd) {
				if (! xdd.showRootToken && nd.nodeName == xdd.rootName) {
					return false;
				}
				return true;
			})
			.shape(xdd.nodeDotShape)
			.size(xdd.nodeDotSize)
			.fillStyle(xdd.nodeDotFillStyle)
			.strokeStyle(function() {
				return this.fillStyle().darker();
			})
			.title(xdd.nodeDotTitle)
			.events("all") //need this for title (doesn't work in Opera)
			.event("dblclick", xdd.onNodeDotDoubleClick)
		;
		
		/** 
		* The characteristics of the token text
		* @private
		* @fieldOf XDD.prototype
		* @exports xdd.nodeDotLabel as nodeDotLabel
		* @type pv.Label
		*/
		xdd.nodeDotLabel = xdd.nodeDot.anchor("bottom").add(pv.Label)
				.font(function() {
					return xdd.dd.font();
				})
				.textAlign("center")
	/* //this doesn't work in Firefox or Opera, but does in Safari
				.textDecoration(function(nd) {
					if (this.selected) {
						return "underline";
					} else {
						return "none";
					}
				})
	*/
				.textStyle(xdd.nodeItemStyle)
	//			.textShadow("0.1em 0.1em 0.1em rgba(0,0,0,.5)") //this doesn't work in Firefox or Opera, but does in Safari
	//			.textAngle(-Math.PI/4)
				.text(function(nd) {
					return nd.nodeName;
				})
				.events("all") //need this for title, click
				.title(xdd.nodeItemTitle)
				.event("click", xdd.nodeItemClick)
				//.event("dblclick" ...) //CC seems like can't have both double click and click 
		;

		xdd.rootArrow = xdd.dd.node.add(pv.Bar)
			.visible(function(nd) {
				if (xdd.isRootNode(nd)) {
					//are we a dummy root token?
					if (xdd.rootName && nd.nodeName == xdd.rootName) {
						return xdd.showRootToken;
					}
					return true; //real root, and no dummy root tokens
				} else { //not a root node
					return false;
				}
			})
			.top(5)
			.height(function(nd) {
				return nd.y - 10;
			})
			.strokeStyle(xdd.rootArrowColor)
			.fillStyle(this.strokeStyle)
			.width(xdd.rootArrowWidth)
		;
		
		xdd.rootArrow.add(pv.Dot) //this is the arrowhead
			.visible(xdd.showRootArrowHead)
			.top(function(nd) {
				return nd.y - 10;
			})
			.shape(xdd.rootArrowHeadShape)
			.size(10)
			.strokeStyle(function() {
				return xdd.rootArrow.strokeStyle();
			})
			.fillStyle(function() { 
				return this.strokeStyle(); 
			})
		;

		xdd.rootArrow.add(pv.Label)
			.visible(function(nd) {
				return true;
			})
			.top(function(nd) {
				return nd.y/2;
			})
			.text(function(nd) {
				if (xdd.rootName != null && xdd.rootName != "") {
					return xdd.rootName;
				}
				return "root";
			})
			.font(function() {
				return xdd.dd.font();
			})
			.textStyle(function() {
				return xdd.rootArrow.strokeStyle();
			})
		;
		
		/** 
		* The panel containing the visualization of the "extra" information for a node
		* @private
		* @fieldOf XDD.prototype
		* @exports xdd.infoPanel as infoPanel 
		* @type pv.Panel
		*/
		xdd.infoPanel = xdd.dd.node.add(pv.Panel)
			.visible(function(nd) {
				return (nd.uniqID in xdd.showInfo);
			})
			.width(80)
			.height(80)
			.top(function(nd) {
				return nd.y - 80; //height, because I'm in a hurry
			})
			.strokeStyle("rgba(0,0,0,0.25)")
			.events("click")
			.event("click", function(nd) {
				delete xdd.showInfo[ nd.uniqID ];
				xdd.vis.render();
			})
		;
		/** 
		* The pv.Layout.Cluster of the "extra" information for a node
		* @private
		* @fieldOf XDD.prototype
		* @exports xdd.infoLayout as infoLayout
		* @type pv.Layout.Cluster
		*/
		xdd.infoLayout = xdd.infoPanel.add(pv.Layout.Cluster)
			.nodes(function(nd,ndprime) {
				if (info == null) {
					info = {};
				}
				var info = JSON.parse(JSON.stringify(nd.nodeValue.info)); //simple clone. if we don't clone, then the original info gets the extra leaves as well. Oops
				addLeavesAsNodes(info);
				var tmp = pv.dom(info)
					.root(nd.nodeName)
					.sort(function(a, b) {
						return pv.naturalOrder(a.nodeName, b.nodeName);
					})
					.nodes()
				;
				return tmp;
			})
			.group(true)
			.orient("left") //"radial" has problems with overlapping the root name with a feature
		;
		xdd.infoLayout.link.add(pv.Line)
			.strokeStyle(xdd.infoLineColor) 
			.lineWidth(1)
			.antialias(false)
		;
		xdd.infoLayout.node.add(pv.Dot)
			.fillStyle(xdd.infoDotColor)
		;
		xdd.infoLayout.label.add(pv.Label);
		
		xdd.dd.node.levelDelta = xdd.levelDelta; //this is overriding the default in dd-full, so it probably should be at the top level
		xdd.dd.node.stagger = xdd.stagger; //this is overriding the default in dd-full, so it probably should be at the top level

		xdd.vis.render();
		
	} //end of xdd.showDiagram

///////////////////////////////////////////////////////////////////////////////////////////////////////
//Auxiliary, interaction, and appearance functions, to be overridden as desired.

	/** 
	* Updates the visualization after a selection
	* @methodOf XDD.prototype
	* @exports xdd.update as update
	*/
	xdd.update = function() {
		if (! xdd.isSelecting && !xdd.isCtrl) { //CC we originally used isShift, but control is more common for non-contiguous selection
			//xdd.unselectAllNodes();
			xdd.unselectAll();
			xdd.vis.render();
		}
		xdd.isSelecting = true;
	}
	
	//overall appearance, interaction
	/** 
	* The width of the border around the diagram
	* @fieldOf XDD.prototype
	* @exports xdd.visFrameWidth as visFrameWidth
	* @type Number
	*/
	xdd.visFrameWidth = 1;
	/** 
	* The color  of the border around the diagram
	* @fieldOf XDD.prototype
	* @exports xdd.visFrameStyle as visFrameStyle
	* @type Color
	*/
	xdd.visFrameStyle = null; //i.e. no frame
	
	/** 
	* The font for the text in the diagram
	* @fieldOf XDD.prototype
	* @exports xdd.font as font
	* @type Color
	*/
	xdd.font = "12px sans-serif";
	/** 
	* The padding between the tokens
	* @fieldOf XDD.prototype
	* @exports xdd.padding as padding
	* @type Number
	*/
	xdd.padding = 8; //CC new, padding between tokens on the same level
	
	/** 
	* The interaction of a scrollwheel for the diagram as a whole. Default is pv.Behavior.zoom
	* NB: pv.Behavior.zoom does not change the text size
	* @methodOf XDD.prototype
	* @exports xdd.onWheel as onWheel
	*/
	xdd.onWheel = pv.Behavior.zoom(); 
	//xdd.onWheel = ddZoom(); //TBD: Test (not working)
		
	/** 
	* The interaction on mouseDown for the diagram as a whole. Default is pv.Behavior.pan
	* @methodOf XDD.prototype
	* @exports xdd.onMouseDown as onMouseDown
	*/	xdd.onMouseDown = pv.Behavior.pan();
	/* This is not working
	xdd.onMouseDown = function(xy) {
		if (xdd.isShift) {
			pv.Behavior.select(xy);
		} else {
			pv.Behavior.pan(xy);
		}
		
	}
	*/

	/** 
	* What happens when a node is selected by dragging. Default is to mark the node as selected and redraw.
	* @methodOf XDD.prototype
	* @exports xdd.onSelectNode as onSelectNode
	* @param {Node} nd the node being selected
	*/
	xdd.onSelectNode = function(nd) {
		xdd.selectItem(nd);
	}
						
						
	//arc appearance
	
	/** 
	* Determines whether the arc for a dependency is visible. Default is for all arcs to be visible.
	* @methodOf XDD.prototype
	* @exports xdd.showLink as showLink
	* @param {Node} srcNd the source node of the dependency (i.e. the none-arrow node)
	* @param {Dependency} link the dependency 
	* @returns boolean
	*/
	xdd.showLink = function(srcNd, link) {
		return true;
	}
	
	/** 
	* Determines the color of the arc for a dependency. Default is for all arcs to be gray.
	* @methodOf XDD.prototype
	* @exports xdd.linkColor as linkColor
	* @param {Dependency} link the dependency 
	* @returns {Color}
	*/
	xdd.linkColor = function(link) {	
		return "rgba(64,64,64,0.5)"; //gray
	}
	
	/** 
	* Determines the width of the arc for a dependency. Default is for selected arcs to be 5px, and non-selected arcs to be 2px.
	* @methodOf XDD.prototype
	* @exports xdd.linkWidth as linkWidth
	* @param {Dependency} link the dependency 
	* @returns {Number}
	*/
	xdd.linkWidth = function(link) {
		if (xdd.isSelected(link)) {
			return 5;
		} else {
			return 2;
		}
	}
	
	/** 
	* Determines the curvature of the arc for a dependency. 0 is circular arc, 1 is flat line. Default is 0.3.
	* @methodOf XDD.prototype
	* @exports xdd.linkCurve as linkCurve
	* @param {Dependency} link the dependency 
	* @returns {Float} between 0 and 1
	*/
	xdd.linkCurve = function(link) {
		//for the curvature [0,1]: 0 is circular arc, 1 is flat line
		return 0.3
	}
	
	/** 
	* Determines the text for title (on mouse hover) of the arc for a dependency. Default is the dependency name.
	* @methodOf XDD.prototype
	* @exports xdd.linkTitle as linkTitle
	* @param {Dependency} link the dependency 
	* @returns {String}
	*/
	xdd.linkTitle = function(link) {
		return link.relation;
	}
	
	/** 
	* Determines whether the arc labels are shown for a dependency. Default is for no labels to be shown (all show is often too cluttered).
	* @methodOf XDD.prototype
	* @exports xdd.showRelationLabels as showRelationLabels
	* @param {Point} srcCoords the x,y coordinates of the source (non-arrow) node of the dependency
	* @param {Dependency} link the dependency 
	* @returns {Boolean}
	*/
	xdd.showRelationLabels = function (srcCoords, link) {
		return false;
	}
	
	/** 
	* Determines whether the arc heads (arrow heads) are shown for a dependency. Default is for all arc heads to be shown.
	* @methodOf XDD.prototype
	* @exports xdd.showArcHeads as showArcHeads
	* @param {Dependency} link the dependency 
	* @returns {Booelan}
	*/
	xdd.showArcHeads = function(link) {
		return true;
	}	
	
	/** 
	* Determines the color of label of the arc for a dependency. Default is for the label color to be the same as the arc color.
	* @methodOf XDD.prototype
	* @exports xdd.relColor as relColor
	* @param {Dependency} link the dependency 
	* @returns {Color}
	*/
	xdd.relColor = function(link) {
		return xdd.linkColor(link);
	}
	
	/** 
	* Determines the shape of the arrow head of an arc for a dependency. Default is for all arrow heads to be triangles. The possibilties are (cf. pv.Dot):
		<ul>
		<li>triangle</li>
		<li>cross</li>
		<li>diamond</li>
		<li>square</li>
		<li>circle (not recommended &mdash; used for nodes</li>
		<li>tick (not recommended)</li>
		<li>bar (not recommended)</li>
		</ul>
	* @methodOf XDD.prototype
	* @exports xdd.arrowShape as arrowShape
	* @param {Point} locXY the x,y coordinates of the arrow head
	* @param {Dependency} link the dependency 
	* @returns {Shape string}
	*/
	xdd.arrowShape = function(locXY, link) {
		return "triangle";
	}
	
	//root arrow appearance
	/** 
	* Determines the color of the root arrow. Default is red
	* @methodOf XDD.prototype
	* @exports xdd.rootArrowColor as rootArrowColor
	* @param {Node} nd the root node 
	* @returns {Color}
	*/
	xdd.rootArrowColor = function(nd) {
		return "red";
	}
	/** 
	* Determines the width of the root arrow. Default is 1
	* @methodOf XDD.prototype
	* @exports xdd.rootArrowWidth as rootArrowWidth
	* @param {Node} nd the root node 
	* @returns {Number}
	*/
	xdd.rootArrowWidth = function(nd) {
		return 1;
	}
	//root arrow head
	/** 
	* Determines whether the root arrow head is shown. Default is true
	* @methodOf XDD.prototype
	* @exports xdd.showRootArrowHead as showRootArrowHead
	* @param {Node} nd the root node 
	* @returns {Boolean}
	*/
	xdd.showRootArrowHead = function(nd) {
		return true;
	}
	/** 
	* Determines whether the shape of the root arrow head. Default is triangle.
	* @methodOf XDD.prototype
	* @exports xdd.rootArrowHeadShape as rootArrowHeadShape
	* @param {Node} nd the root node 
	* @returns {Boolean}
	*/
	xdd.rootArrowHeadShape = function(nd) {
		return "triangle";
	}
	/** 
	* Determines the color of the root arrow head. Default is root arrow
	* @methodOf XDD.prototype
	* @exports xdd.rootArrowHeadColor as rootArrowHeadColor
	* @param {Node} nd the root node 
	* @returns {Color}
	*/
	xdd.rootArrowHeadColor = function(nd) {
		return xdd.rootArrowColor(nd);
	}
	
	//node appearance and interactions
	
	/** 
	* Determines the diameter of the node. Default is for all nodes to be 5px.
	* @methodOf XDD.prototype
	* @exports xdd.nodeDotSize as nodeDotSize
	* @param {Node} nd the node 
	* @returns {Number}
	*/
	xdd.nodeDotSize = function(nd) {
		return 5;
	}
	
	/** 
	* Determines the shape of the node. Default is all nodes to be circles. The possibilities are (cf. pv.Dot):
		<ul>
		<li>circle</li>
		<li>cross</li>
		<li>triangle</li>
		<li>diamond</li>
		<li>square</li>
		<li>tick (not recommended)</li>
		<li>bar (not recommended)</li>
		</ul>
	* @methodOf XDD.prototype
	* @exports xdd.nodeDotShape as nodeDotShape
	* @param {Node} nd the node 
	* @returns {Shape string}
	*/
	xdd.nodeDotShape = function(nd) {
		return "circle";
	}

	/** 
	* Determines the color of a node. Default is for all nodes to be gray.
	* @methodOf XDD.prototype
	* @exports xdd.nodeDotFillStyle as nodeDotFillStyle
	* @param {Node} nd the node 
	* @returns {Color}
	*/
	xdd.nodeDotFillStyle = function(nd) {
		return "gray";
	}
	
	/** 
	* Determines the title (on mouse hover) of the node. Default is the name of the node (usually the token).
	* @methodOf XDD.prototype
	* @exports xdd.nodeDotTitle as nodeDotTitle
	* @param {Node} nd the node 
	* @returns {String}
	*/
	xdd.nodeDotTitle = function(nd) {
		return nd.nodeName;
	}
	
	/** 
	* The behavior when the node shape is clicked. Default is to do show the node's information.
	* @methodOf XDD.prototype
	* @exports xdd.onNodeDotDoubleClick as onNodeDotDoubleClick
	* @param {Node} nd the node 
	*/
	xdd.onNodeDotDoubleClick = function(nd) { 
		xdd.showInfo[ nd.uniqID ] = true;
		xdd.vis.render();
	}
	
	//item appearance, interaction
	
	/** 
	* Determines the color of the token text. Default is for selected tokens to be orange and all others gray.
	* @methodOf XDD.prototype
	* @exports xdd.nodeItemStyle as nodeItemStyle
	* @param {Node} nd the node 
	* @returns {Color}
	*/
	xdd.nodeItemStyle = function(nd) {
		if (xdd.isSelected(nd)) {
			return "orange"; //just default
		} else {
			return "gray";
		}
	}

	/** 
	* Determines the title (on mouse hover) of the token text. Default is the name of the node (usually the token).
	* @methodOf XDD.prototype
	* @exports xdd.nodeItemTitle as nodeItemTitle
	* @param {Node} nd the node 
	* @returns {String}
	*/
	xdd.nodeItemTitle = function(nd) {
		return nd.nodeName;
	}
	
	/** 
	* The behavior when the node is clicked. Default is to do nothing.
	* @methodOf XDD.prototype
	* @exports xdd.nodeItemClick as nodeItemClick
	* @param {Node} nd the node 
	*/
	xdd.nodeItemClick = function(nd) {}
	
	///// other functions that can be overridden
	
	//same as the layout default, but we expose it here for applications.
		
	/** 
	* The difference in vertical "level" (position) of a node and its predecessor. Positive is higher, negative is lower. 
	* Default is for all nodes to be at the same level.
	* User testing has shown that the levels should be used only to encode information, not as a space-saving technique.
	* @methodOf XDD.prototype
	* @exports xdd.levelDelta as levelDelta
	* @param {Node} nd the node
	* @param {Integer} posn the node's position from the start of the diagram
	* @returns {Integer}
	*/
	xdd.levelDelta = function(nd,posn) {
		return 0;
	}

	/** 
	* The proportion of a token that should be offset horizontally closer to its predecessor, if the vertical position is also different. 
	* Default is 0 unless the diagram would not fit into the allotted width, in which case the stagger is 0.35.
	* Staggering has not tested well with users, whether or not it encodes information.
	* @methodOf XDD.prototype
	* @exports xdd.stagger as stagger
	* @param {Node} nd the node
	* @param {Integer} posn the node's position from the start of the diagram
	* @returns {Float}
	*/
	xdd.stagger = function(nd,posn) {
		//CC this says don't stagger if the string would fit in the display area
		if (xdd.origWidth < xdd.visW) {
			return 0;
		}
		return 0.35;
	}
	
	/** 
	* Utility function to get the dependency names from an array of arcs.
	* @methodOf XDD.prototype
	* @exports xdd.getRelationNames as getRelationNames
	* @param {Array of arcs} arcs the arcs
	* @returns {Array of string}
	*/
	xdd.getRelationNames = function(arcs) {
		if (arcs == null || arcs.length == 0) {
			return [];
		}
		return arcs.map(function(arc) {return arc.relation});
	}


	///////////////////////////////////////////////////////////////////////////////////////////////////////

	//private functions having to do with selection

	/** 
	* Was the shift key pressed when the mouse was pressed
	* @private
	* @fieldOf XDD.prototype
	* @exports xdd.isShift as isShift
	* @type Boolean
	*/
	xdd.isShift = false;
	/** 
	* Was the control key pressed when the mouse was pressed
	* @private
	* @fieldOf XDD.prototype
	* @exports xdd.isCtrl as isCtrl
	* @type Boolean
	*/
	xdd.isCtrl = false;
	/** 
	* Was the "alt" key pressed when the mouse was pressed
	* @private
	* @fieldOf XDD.prototype
	* @exports xdd.isAlt as isAlt
	* @type Boolean
	*/
	xdd.isAlt = false;
	
	/** 
	* records the modifier keys when the mouse is pressed
	* @private
	* @methodOf XDD.prototype
	* @exports xdd.doMouseDown as doMouseDown
	* @param {Event} e the event
	* @returns true
	*/
	xdd.doMouseDown = function(e) {
		xdd.isShift = e.shiftKey;
		xdd.isCtrl = e.ctrlKey;
		xdd.isAlt = e.altKey;
		
		return true;
	}

	/** 
	* determines whether a network (diagram) items is a node 
	* @private
	* @methodOf XDD.prototype
	* @exports xdd.isNode as isNode
	* @param {Network item} item the item
	* @returns Boolean
	*/
	xdd.isNode = function(item) {
		return (item.uniqID.indexOf("node") == 0)
	}
	
	/** 
	* Keeps track of which links and nodes are selected
	* @private
	* @fieldOf XDD.prototype
	* @exports xdd.gSelected as gSelected
	* @type Object
	*/
	xdd.gSelected = {"links":{}, "numSelectedLinks":0, "nodes":{}, "numSelectedNodes":0};
	
	/** 
	* determines whether a network (diagram) item is selected
	* @methodOf XDD.prototype
	* @exports xdd.isSelected as isSelected
	* @param {Network item} item the item
	* @returns Boolean
	*/
	xdd.isSelected = function(item) {
		if (xdd.isNode(item)) {
			return (item.uniqID in xdd.gSelected.nodes);
		}
		return (item.uniqID in xdd.gSelected.links);
	}
	
	/** 
	* selects a network (diagram) item
	* @methodOf XDD.prototype
	* @exports xdd.selectItem as selectItem
	* @param {Network item} item the item
	*/
	xdd.selectItem = function(item) {
		if (xdd.isNode(item)) {
			xdd.gSelected.nodes[ item.uniqID ] = true;
			xdd.gSelected.numSelectedNodes++;
		} else {
			xdd.gSelected.links[ item.uniqID ] = true;
			xdd.gSelected.numSelectedLinks++;
		}
	}

	/** 
	* unselects a network (diagram) item
	* @methodOf XDD.prototype
	* @exports xdd.unselectItem as unselectItem
	* @param {Network item} item the item
	*/
	xdd.unselectItem = function(item) {
		if (xdd.isNode(item)) {
			delete xdd.gSelected.nodes[item.uniqID];
			xdd.gSelected.numSelectedNodes--;
		} else {
			delete xdd.gSelected.links[item.uniqID];
			xdd.gSelected.numSelectedLinks--;
		}
	}
	/** 
	* unselects all the nodes
	* @methodOf XDD.prototype
	* @exports xdd.unselectAllNodes as unselectAllNodes
	*/
	xdd.unselectAllNodes = function() {
		xdd.gSelected.nodes = {};
		xdd.gSelected.numSelectedNodes = 0;
	}
	/** 
	* unselects all the arcs
	* @methodOf XDD.prototype
	* @exports xdd.unselectAllLinks as unselectAllLinks
	*/
	xdd.unselectAllLinks = function() {
		xdd.gSelected.links = {};
		xdd.gSelected.numSelectedLinks = 0;
	}
	/** 
	* unselects all the nodes and all the arcs
	* @methodOf XDD.prototype
	* @exports xdd.unselectAll as unselectAll
	*/
	xdd.unselectAll = function() {
		xdd.unselectAllNodes();
		xdd.unselectAllLinks();
	}

	/** 
	* selects the arcs with a dependency name matching the pattern
	* @methodOf XDD.prototype
	* @exports xdd.selectRelation as selectRelation
	* @param {String} pattern the pattern to match: a RegExp without the enclosing / /
	*/
	xdd.selectRelation = function(pattern) {
		//pattern does not have //
		//we will make it an exact match, so that we can just put in strings
		var re = new RegExp("^" + pattern + "$");
		
		xdd.dd.links().forEach(function(lnk) {
			if (re.test(lnk.relation)) {
				xdd.selectItem(lnk);
			}
		});
		xdd.vis.render();
	}
	
	/** 
	* Selects the dependencies that are connected to a set of nodes 
	* @methodOf XDD.prototype
	* @exports xdd.selectLinksFromNodes as selectLinksFromNodes
	* @param {Array of Nodes} theNodes the set of nodes to find connected dependencies to
	*/	
	xdd.selectLinksFromNodes = function(theNodes) {
		theNodes.forEach(function(n) {
			var theArcs = n.dependentArcs.concat(n.headArcs);
			theArcs.forEach(function(a){
				xdd.selectItem(a);
			});
		});
		xdd.vis.render();
	}

	/** 
	* Selects the dependencies that are connected to the nodes that are selected
	* @methodOf XDD.prototype
	* @exports xdd.selectLinksFromSelectedNodes as selectLinksFromSelectedNodes
	*/	
	xdd.selectLinksFromSelectedNodes = function() {
		var selNodes = xdd.dd.nodes().filter(function(n) {return xdd.isSelected(n);});
		xdd.selectLinksFromNodes(selNodes);
	}
	
	/** 
	* Selects the nodes that are connected to a set of dependencies 
	* @methodOf XDD.prototype
	* @exports xdd.selectNodesFromLinks as selectNodesFromLinks
	* @param {Array of Links} theLinks the set of dependencies to find connected nodes
	*/	
	xdd.selectNodesFromLinks = function(theLinks) {
		theLinks.forEach(function(lnk) {
			xdd.selectItem(lnk.sourceNode);
			xdd.selectItem(lnk.targetNode);
		});
		xdd.vis.render();
	}

	/** 
	* Selects the nodes that are connected to the dependencies that are selected
	* @methodOf XDD.prototype
	* @exports xdd.selectNodesFromLinks as selectNodesFromLinks
	*/	
	xdd.selectNodesFromSelectedLinks = function() {
		var selLinks = xdd.dd.links().filter(function(n) {return xdd.isSelected(n);});
		xdd.selectNodesFromLinks(selLinks);
	}
	
	/** 
	* selects the tokens matching the pattern
	* @methodOf XDD.prototype
	* @exports xdd.selectTokens as selectTokens
	* @param {String} pattern the pattern to match: a RegExp without the enclosing / /
	*/
	xdd.selectTokens = function(pattern) {
		//pattern does not have //
		//we will make it an exact match, so that we can just put in strings
		var re = new RegExp("^" + pattern + "$");
		
		xdd.dd.nodes().forEach(function(n) {
			if ( re.test(n.nodeValue.token) ) {
				xdd.selectItem(n);
			}
		});
		xdd.vis.render();		
	}

	/** 
	* selects nodes which have "extra" info such that a field matches fieldPattern and its value matches the valuePattern
	* @methodOf XDD.prototype
	* @exports xdd.selectInfo as selectInfo
	* @param {String} fieldPattern the pattern to match to a field name: a RegExp without the enclosing / /
	* @param {String} valuePattern the pattern to match to a field value: a RegExp without the enclosing / /
	*/
	xdd.selectInfo = function(fieldPattern, valuePattern) {
		//patterns does not have //
		//we will make them an exact match, so that we can just put in strings
		var fieldRE = new RegExp("^" + fieldPattern + "$");
		var valueRE = new RegExp("^" + valuePattern + "$");
				
		xdd.dd.nodes().forEach(function(n) {			
			if ( inObj(n.nodeValue.info) ) {			
				xdd.selectItem(n);
			}			
		});
		
		/** @ignore */
		function inObj(obj) {
			for (var fld in obj) {
				var val = obj[fld];
				if (typeof val == "string") { 
					if ( valueRE.test(val) && fieldRE.test(fld) ) {
						return true;
					}
				} else if ( typeof val == "object" && inObj(val) ) {
					return true;
				}
			};
			return false;
		}
		xdd.vis.render();		
	}

	/** 
	* Gets the selected nodes
	* @methodOf XDD.prototype
	* @exports xdd.getSelectedNodes as getSelectedNodes
	* @returns {Array of Nodes}
	*/		
	xdd.getSelectedNodes = function() {
		return xdd.dd.nodes().filter(function(n) {
			return xdd.isSelected(n);			
		});
	}
	/** 
	* Gets the selected dependencies
	* @methodOf XDD.prototype
	* @exports xdd.getSelectedLinks as getSelectedLinks
	* @returns {Array of Links}
	*/	
	xdd.getSelectedLinks = function() {
		return xdd.dd.links().filter(function(lnk) {
			return xdd.isSelected(lnk);
		});
	}
	//end selection stuff

	/** 
	* determines whether a node is a root node or not: either it is a dummy token or it is a node with no head and at least one dependent
	* @private
	* @methodOf XDD.prototype
	* @exports xdd.isRootNode as isRootNode
	* @param nd The node to check
	* @returns {Boolean} true if nd is a root node
	*/
	xdd.isRootNode = function(nd) {
		if (xdd.rootName != null) {
			if (nd.nodeName == xdd.rootName) {
				return true; //dummy root token
			}
			//the only head link is to the a dummy root token
			return (nd.headArcs.length == 1 && 
				(nd.headArcs[0].targetNode.nodeName == xdd.rootName || nd.headArcs[0].sourceNode.nodeName == xdd.rootName));
		}
		//there are no dummy root tokens
		return (nd.headArcs.length == 0 && nd.dependentArcs && nd.dependentArcs.length > 0);
	}
	
	/** 
	* Zooms the diagram (including the text). For use when the use of a mousewheel is not desired or available. 
	* NB: pv.Behavior.zoom used for the mousewheel does not zoom the text.
	* @methodOf XDD.prototype
	* @exports xdd.magnify as magnify
	* @param {Integer} amt relative amount to zoom
	*/		
	xdd.magnify = function(amt) {
		//based on pv.Behavior.zoom
		//amt is some positive or negative integer
		
		var scaleFactor = (amt < 0) ? (1e3 / (1e3 - amt)) : ((1e3 + amt) / 1e3);
		adjustFontSize(scaleFactor);
		
		var toZoom = xdd.vis;
        var m = toZoom.transform().scale(scaleFactor);	
	    toZoom.transform(m).render();
   		pv.Mark.dispatch("zoom", toZoom.scene, toZoom.index);
	}
	
	//private function to change font size when zooming
	/** 
	* Changes the font size when zooming. Assume pixels or point specification of the size. 
	* @private
	* @methodOf XDD.prototype
	* @exports xdd.adjustFontSize as adjustFontSize
	* @param {Float} scaleFactor amount to scale font by
	*/		
	function adjustFontSize(scaleFactor) {
		var fontSpec = xdd.dd.font().split(/\s+/);
		var fSize = parseFloat(fontSpec[0]);
		var newFontSize = fSize*scaleFactor;
		fontSpec[0] = fontSpec[0].replace( fSize, newFontSize);
		var newFont = fontSpec.join(" ");
		/** @ignore  */
		xdd.dd.font = function() {return fontSpec.join(" ");};
	}
	
	/** 
	* Loads the initial settings (not really very useful)
	* @param {Object} theSettings the settings to load
	*/		
	function assignSettings(theSettings) {
		for(var attr in theSettings) {
			xdd[attr] = theSettings[attr];
		}
	}
	
	/** 
	* Adds the leaves of a tree to the DOM, since protovis doesn't.
	* @param {Map} map the tree to add the leaves to
	*/	
	function addLeavesAsNodes(map) {
		for(var f in map) {
			var v = map[f];
			if (typeof v == "object") {
				addLeavesAsNodes(map[f]);
			} else {
				var o = {};
				o[v] = "";
				map[f] = o;
			}
		}
	}

	//private function that changes the font size when zooming (Not working)
	/** @ignore */
	function ddZoom() {
		pv.Behavior.zoom();
		if (xdd.dd) {
			adjustFontSize( xdd.dd.scale() );
		}
	}
	
	assignSettings(initialVals); //we do this last so that we override the defaults
	return xdd; //last line of XDD
}