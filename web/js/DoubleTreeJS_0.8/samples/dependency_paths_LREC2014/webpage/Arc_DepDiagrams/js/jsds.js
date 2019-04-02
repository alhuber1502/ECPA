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
/* Original: 20110208 */
/* Revised: 20110601 */
/* Version 0.05 */


/**
* @namespace Namespace for things connected with JSon Dependency Structures
*/
JSDS = {};

/**
* Constructs a new jsds object
* @class jsds is the JSon Dependency Structure format for representing linguistic dependency structures
* It is a JSON structure consisting of an Object with the following fields:
*	<ul>
*	<li>phraseInfo: Object &mdash; will usually contain a string representation of the entire phrase, as well as other metadata,e.g. id</li>
*	<li>tokenInfo: an array of {@link JSDS.DSToken}</li>
*	<li>dependencyInfo: an array of {@link JSDS.DSDep}</li>
*	<li>rootName: the label of a root node. Optional. If not specified, root nodes will be assumed to be nodes with no head and at least one dependent.
*	</ul>
*	@param {Object} phraseInf the phraseInfo
*	@param {Array of JSDS.DSToken}	tokenInf the tokenInfo
*	@param {Array of JSDS.DSDep}	depInf	The dependencies in the dependency structure
*	@param {String} rtName The name of a root node.
*/
JSDS.JSDS = function(phraseInf, tokenInf, depInf, rtName) { //NB: there is no type checking
	/** Information about the phrase as a whole
	* @memberOf JSDS.JSDS.prototype
	* @type Object
	*/
	this.phraseInfo = phraseInf;
	/**
	* The tokens in the dependency structure, in presentation order
	* @memberOf JSDS.JSDS.prototype
	* @type Array of DSToken
	*/
	this.tokenInfo = tokenInf;
	/**
	* The dependencies in the dependency structure
	* @memberOf JSDS.JSDS.prototype
	* @type Array of JSDS.DSDep
	*/	
	this.dependencyInfo = depInf;
	/**
	* The label for a root node in the dependency structure
	* @memberOf JSDS.JSDS.prototype
	* @type Array of JSDS.DSDep
	*/
	this.rootName = rtName;
}

/**
* Checks to make sure that the dependencies have valid tokens: not out of range and optionally head different from dependent. checkDependencyTokens is not called automatically, since it may not be needed if the input is known to be valid (e.g. from a parser)
* @param {@link JSDS.jsds} jsds the JSDS structure to convert
* @param {Boolean} allowSameHeadDependent can the head and dependent be identical. Optional. Default is false.
* @returns {Boolean} true if all the dependencies have valid tokens; false otherwise
*/
JSDS.JSDS.prototype.checkDependencyTokens = function(allowSameHeadDependent) {
	var distinctEnds = true;
	if (allowSameHeadDependent) {
		distinctEnds = false;
	}
	
	var lastTok = this.tokenInfo.length -1;
	this.fillInIndices();
	
	return this.dependencyInfo.every(function(thisDep, idx, deps) {
		if (thisDep.headNodeIndex < 0 || thisDep.headNodeIndex > lastTok || this.tokenInfo[thisDep.headNodeIndex] == undefined) {
			return false;
		}

		if (thisDep.depNodeIndex < 0 || thisDep.depNodeIndex > lastTok || this.tokenInfo[thisDep.depNodeIndex] == undefined) {
			return false;
		}

		if (distinctEnds) {
			return (thisDep.headNodeIndex != thisDep.depNodeIndex);
		}
		return true;
	}, this);
}

/**
* Fills in the indices for the head and dependent nodes in the dependencies. Not fully tested since we don't pass objects to JSDep
* @private
*/
JSDS.JSDS.prototype.fillInIndices = function() {
	this.dependencyInfo.forEach(function(thisDep, idx, deps) {
		var hdNd, depNd;
		if (thisDep.headNodeIndex == undefined) {
			thisDep.headNodeIndex = this.tokenInfo.indexOf(thisDep.headNode);
		}

		if (thisDep.depNodeIndex == undefined) {
			thisDep.depNodeIndex = this.tokenInfo.indexOf(thisDep.depNode);
		}
	}, this);
}

/**
* Makes a set of the dependencies using a hashkey
* @private
*/
JSDS.JSDS.prototype.hashDependencies = function() {
	this.dependencyHash = {};
	this.dependencyInfo.forEach(function(thisDep, idx, deps) {
		this.dependencyHash[ this.makeDepHashKey(thisDep) ] = true;
	}, this);
}

/**
* Makes a hash key from the dependency: headNodeIndex\tdepNodeIndex\trelation
* @private
* @param {@link JSDS.DSDep} theDep the dependency to hash
* @returns a hash key
*/
JSDS.JSDS.prototype.makeDepHashKey = function(theDep) {
	return theDep.headNodeIndex + "\t" + theDep.depNodeIndex + "\t" + theDep.relation;
}

/**
* Compares this JSD to see if the provided JSDS jsds is has the same tokens, same dependency relations and same dependency names. Other info is ignored. Other interesting relations would be full equality, isomorphism, and homomorphism.
* @param {@link JSDS.jsds} jsds the JSDS structure to compare
* @returns {Boolean} true if this JSDS is "simplyEqual" to jsds
*/
JSDS.JSDS.prototype.simplyEqual = function(jsds) {
	
	var n = this.tokenInfo.length;
	if (this.tokenInfo.length != n) {
		return false;
	}
	for(var i=0;i<n;i++) {
		if (this.tokenInfo[i].token != jsds.tokenInfo[i].token) {
			return false;
		}
	}

	n = this.dependencyInfo.length;
	if (jsds.dependencyInfo.length != n) {
		return false;
	}
	
	this.fillInIndices();
	jsds.fillInIndices();
	
	this.hashDependencies();
	
	for(var i=0;i<n;i++) {
		if (this.dependencyHash[ this.makeDepHashKey( jsds.dependencyInfo[i] ) ] == undefined ) {
			return false;
		}
	}
	return true;
}

/**
* Compares this JSD to see if the provided JSDS jsds is consistent with it in having the same tokens, but possibly only some of the dependencies (and no conflicts). In other words, jsds may be less specified than this JSDS. Extra information is ignored. cf. {@link JSDS.simplyEqual}
* @param {@link JSDS.jsds} jsds the JSDS structure to compare
* @returns {Boolean} true if jsds is consistent with this JSDS
*/
JSDS.JSDS.prototype.consistentWith = function(jsds) {
	
	var n = this.tokenInfo.length;
	if (this.tokenInfo.length != n) {
		return false;
	}
	for(var i=0;i<n;i++) {
		if (this.tokenInfo[i].token != jsds.tokenInfo[i].token) {
			return false;
		}
	}

	this.fillInIndices();
	jsds.fillInIndices();

	var m = jsds.dependencyInfo.length;
	if (m > this.dependencyInfo.length) {
		return false;
	}
	
	this.hashDependencies();
	
	for(var i=0;i<m;i++) {
		var dep = jsds.dependencyInfo[i];
		if (dep.relation != "" & this.dependencyHash[ this.makeDepHashKey( dep ) ] == undefined ) { //i.e. we have a named relation in jsds, but it's not in this. NB: there can be only one dependency between 2 given nodes
			return false;
		}
	}
	return true;
}


/**
* Constructs a new DSToken object
* @class Contains all the information for a single token
* @param {String} tok the token
* @param {Integer} posn the position of the token in the phrase (optional)
* @param {Map} inf the extra information
*/
JSDS.DSToken = function(tok, posn, inf) {
	/**
	* The token, typically a word or punctuation
	* @memberOf JSDS.DSToken.prototype
	* @type String
	*/	
	this.token = tok;
	/**
	* The position of the token in the phrase
	* @memberOf JSDS.DSToken.prototype
	* @type Integer
	*/		
	this.position = posn;
	/**
	* Any extra information connected to the token. 
	* It could contain, e.g. lemma, part-of-speech, etc. (optional)
	* NB: its dependencies are calculated automatically
	* @memberOf JSDS.DSToken.prototype
	* @type Map 
	*/	
	this.info = inf;
}

/**
* Constructs a new DSDep object
* @class Contains all the information for a single dependency
* @param {String} reln the dependency name
* @param {Number or JSDS.DSToken} headNd the head node NB: The DSToken version has not been tested
* @param {Number or JSDS.DSToken} depNd the node that is the dependent of the dependency. NB: The DSToken version has not been tested
* @param {Object} inf any extra information connected to the dependency.
*/
JSDS.DSDep = function(reln, headNd, depNd, inf) {
	/**
	* The dependency name
	* @memberOf JSDS.DSDep.prototype
	* @type String 
	*/		
	this.relation = reln;
	if (getClass(headNd) == "JSDS.DSToken") {
		/**
		* The node that is the head of the dependency. 
		* (optional, but if not present, headNodeIndex must be present) [WARNING: Not tested]
		* @memberOf JSDS.DSDep.prototype
		* @type JSDS.DSToken 
		*/
		this.headNode = headNd;
	} else {
		/**
		* The index in tokenInfo of the node that is the head of the dependency.
		* (optional, but if not present, headNode must be present)
		* @memberOf JSDS.DSDep.prototype
		* @type Number 
		*/
		this.headNodeIndex = headNd;
	}
	if (getClass(depNd) == "JSDS.DSToken") {
		/**
		* The node that is the dependent of the dependency. (optional, but if not present, depNodeIndex must be present) [WARNING: Not tested]
		* @memberOf JSDS.DSDep.prototype
		* @type JSDS.DSToken
		*/
		this.depNode = depNd;
	} else {
		/**
		* The index in tokenInfo of the node that is the dependent of the dependency.
		* (optional, but if not present, depNode must be present)
		* @memberOf JSDS.DSDep.prototype
		* @type Number 
		*/
		this.depNodeIndex = depNd;
	}
	/**
	* The dependency name
	* @memberOf JSDS.DSDep.prototype
	* @type String 
	*/
	this.info = inf;
}

//from http://blog.magnetiq.com/post/514962277/finding-out-class-names-of-javascript-objects#
/**
* Gets the class of an object, from <a href="http://blog.magnetiq.com/post/514962277/finding-out-class-names-of-javascript-objects#" target="_blank">http://blog.magnetiq.com/post/514962277/finding-out-class-names-of-javascript-objects#</a>
* @param {Object} obj the object
* @returns {String} the class name or undefined if the class cannot be determined
*/
function getClass(obj) {
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(/function\s*(\w+)/);
        if (arr && arr.length == 2) {
            return arr[1];
        }
    }
    return undefined;
}
