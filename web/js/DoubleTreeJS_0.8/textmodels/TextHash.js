/* (This is the new BSD license.)
* Copyright (c) 2012-2014, Chris Culy
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

"use strict";
/**
 @namespace textmodel
 All of the functionality is in the textmodel namespace
*/
var textmodel = textmodel || {};

(function(){
//split string on spaces (assume already tokenized/analyzed, and that caseSensitive is only for token, which is in first position)
 /**
  * @class textmodel.TextHash
  *  This is the class for the TextHash document model.
  * <p>
  *  It is used in the samples as a way of providing information to the {@doubletree.DoubleTree} to create its {@doubletree.Trie} data structure.
  *  It is not a <em>necessary</em> component of DoubleTree &mdash; all that really matters is that the relevant {@doubletree.Trie}s get created.
  *  For example, instead of TextHash, a database query might provide the input to {@doubletree.Trie}.
  *  <p>
  *  The TextHash maintains a hash of the data items where the keys are based on the distinguishing fields. The data parameters, except for baseField, 
  *  should be the same as those used in the DoubleTree that will visualize the data.
  *  <p>
  *  "Items" are types, which are associated with token ids. Some functions expect an full item as an argument. Others expect a key as an argument. {@link #itemToIndex} converts a full item to a key.
  *  <p>
  *  @property {number} numTypes The number of types (readOnly)
  *  @property {number} numTokens The number of tokens (readOnly)
  *
  * @param string the input string, where each item is separated by whitespace.
  * @param caseSensitive is the comparison of the baseField case sensitive or not
  * @param fldNames the names of the fields in the data items
  * @param fldDelim the field delimter in the data items. Note: it cannot be a whitespace (e.g. tab), since whitespace is used to delimit items
  * @param distinguishingFldsArray the fields that determine identity
  * @param baseField the primary field for comparison and display (typically token or lemma, but also possibly part of speech)
  * @param useRecords blank lines are treated as delimiting units (records) in the text. Default is false
  */
textmodel.TextHash = function(string, caseSensitive, fldNames, fldDelim, distinguishingFldsArray, baseField, useRecords) {
    var that = this;
    var kIDKey = "id" + fldDelim;
    var kRecDelim = String.fromCharCode(30);
    this.useRecords = useRecords && true;
    
    this.baseField = baseField;
    this.baseFieldIdx = fldNames.indexOf(baseField);
    if (this.baseFieldIdx == -1) {
	this.baseFieldIdx = 0;
    }
    if (this.useRecords) {
        string = string.replace(/\s*\n\n+/g, " " + kRecDelim + " ");  //i.e. treat kRecDelim as a token
    }
    this.items = string.replace(/\s*\n\s*/g," ").trim().split(" "); //array of the items (tokens)
    
    this.itemObjs = []; //object representations of the items. For now duplicating items, but maybe we can combine them
    this.indices = {}; //for each type, a list of its token positions
    
    this.numTypes = 0; //filled in below
    this.numTokens = this.items.length;
    
    var numItems = this.items.length;
    var lastItem = numItems-1;
    if (string != "") { //string is empty if we will load from JSON
	for(var i=0;i<numItems;i++) {
	    
	    var item = convertItem(this.items[i]);
         this.itemObjs[i] = itemToObject(item, i);
	    
	    if (! (item in this.indices && this.indices[item] instanceof Array)) { //we need the instanceof Array so we can override Object properties -- hope that none are already arrays
		this.indices[item] = [];
	    }
	    try {
		this.indices[item].push(i);
	    } catch (e) {
		console.log("Couldn't add: " + item);
	    }
	    
	}
    }
    
    this.numTypes = Object.keys( this.indices ).length;
    
    //this expects a full form
    /**
     * is the item in the model
     * @param item a full item (not a key)
     * @returns true if the item is in the model, false otherwise
     */
    this.containsItem = function(item) {
	return convertItem(item) in this.indices;
    }
    
    //this expects an index form
    /**
     * is the item key in the model
     * @param item a key (not a full item)
     * @returns true if the item key is in the model, false otherwise
     */
    this.containsIndex = function(item) {
	return item in this.indices;
    }
       
    //includeOnly is optional object with keys of lines *in this result* to include -- used for filtering after have results
    //TBD: use (d3.)set instead of this dumb hash
    
    //return array of [array of prefixes, array of item, array ofsuffixes], where prefixes and suffixes are of length contextLen; exact match only for now
    
    //this expects an index form
    /**
     * get the information associated with an item
     * <p>
     * The information is an array of preceding items, an array of matching items, and an array of following items,
     * where the preceding and following items are of length contextLen.
     * @param item a key (not a full item)
     * @param contextLen the length of the preceding and following context to be returned
     * @param includeOnly an object where the keys are the item ids to be included (optional)
     * @param itemIsRegex true if the item parameter should be considered as a regular expression instead of as a true item
     * @param contextFilters an object with "include" OR "exclude" which have objects whose keys are fields and whose values are arrays of values of those fields e.g. {"include":{"POS":["NN","NNS"]}} would include in the context only those items whose POS is NN or NNS.
     * Similarly, "leftEnd" and "rtEnd" (both are possible together) indicate properties determining the left and right end points of the context, excluding those elements. So {"leftEnd":{"POS":["SENT"]}, "rtEnd":{"POS":["MD"]}} would include in the left context elements up to but not including the first SENT POS, and in the right context elements up to but not including the first MD POS.
     * @param maxRandomHits how many random hits to return. -1 or null to return all
     * @param puncToExclude a string of punctuation to exclude from the base field (will override any punctuation allowed via "include" in contextFilters). Default is null (i.e. include all punctuation)
     * @returns array of [array of prefixes, array of item, array of suffixes, array of ids]
     */
    this.getItem = function(item, contextLen, includeOnly, itemIsRegex, contextFilters, maxRandomHits, puncToExclude) {
        var prefixArray = [], itemArray = [], suffixArray = [], idArray = [];
       
       if (that.useRecords) {
            var field1 = fldNames[0];
            
            if (contextFilters == null) {
                contextFilters = {};
            }
            if (typeof contextFilters["leftEnd"] === "undefined") {
                contextFilters["leftEnd"] = {};
            }
            var tmp = contextFilters["leftEnd"][field1];
            if (typeof contextFilters["leftEnd"][field1] === "undefined") {
                contextFilters["leftEnd"][field1] = [];
            }
            contextFilters["leftEnd"][field1].push(kRecDelim);
            
            if (typeof contextFilters["rtEnd"] === "undefined") {
                contextFilters["rtEnd"] = {};
            }
            if (typeof contextFilters["rtEnd"][field1] === "undefined") {
                contextFilters["rtEnd"][field1] = [];
            }
            contextFilters["rtEnd"][field1].push(kRecDelim);
            
            
       }
       
        var filterPunc = function(startIndex) {
            if (!puncToExclude) {
                return function() {return true;}; //i.e. no filtering
            }
            
            var re = new RegExp("^[" + puncToExclude + "]$");
            
            return function(elt,idx,contextArray) {
                return ! re.test(that.itemObjs[idx+startIndex][that.baseField]);
            }
        };
        
        var filterContext = function(startIndex){
            return function() {return true;}
        }; //i.e. no filtering
        var chopLeftEnd = function(a) {
            return a;
        }; //i.e. no filtering
         var chopRtEnd = function(a) {
            return a;
        }; //i.e. no filtering
        
        if (contextFilters) {            
            if (contextFilters["include"]) {
                var toInclude = contextFilters["include"];
                var filterContext = function(startIndex) { //don't really need the var here, since have it above, but jsdoc thought it was global
                    return function(elt,idx,contextArray) {
                        for (var fld in toInclude) {
                            if (toInclude[fld].indexOf(that.itemObjs[idx+startIndex][fld]) > -1) {
                                return true;
                            }
                        }
                        return false;
                    }
                };
                
            } else if (contextFilters["exclude"]) {
                var toExclude = contextFilters["exclude"];
                filterContext = function(startIndex) {
                    return function(elt,idx,contextArray) {
                        for (var fld in toExclude) {
                            //var tmp = that.itemObjs[idx+startIndex];
                            if (toExclude[fld].indexOf(that.itemObjs[idx+startIndex][fld]) > -1) {
                                return false;
                            }
                        }
                        return true;
                    }
                };
            }
        
            if (contextFilters["leftEnd"]) {
                chopLeftEnd = function(a, startIndex) {
                    var where = 0;
                    var OK = true;
                    for (var idx=a.length-1;idx>-1;idx--) {
                        for (var fld in contextFilters["leftEnd"]) {
                            if (contextFilters["leftEnd"][fld].indexOf(that.itemObjs[idx+startIndex][fld]) > -1) {
                                OK = false;
                            }
                        }
                        if (!OK) {
                            where = idx +1;
                            break;
                        }
                    }
                    return a.slice(where,a.length+1);
                }
            }
            
           
            if (contextFilters["rtEnd"]) {
                chopRtEnd = function(a, startIndex) {
                    
                    var OK = true;
                    return a.filter(function(elt,idx) {
                        if (!OK) {
                            return false;
                        }
                        for (var fld in contextFilters["rtEnd"]) {
                            if (contextFilters["rtEnd"][fld].indexOf(that.itemObjs[idx+startIndex][fld]) > -1) {
                                OK = false;
                                break;
                            }
                        }
                        return OK;
                    });
                }
            }
        }
       
        var numItems = this.items.length;
        var lastItem = numItems-1;
        
        var hits;
        if (itemIsRegex) {
            var thisThat = this;
            var re = new RegExp(item,'i'); //TBD 'i' is probably not right ...
            var hitArrays = Object.keys(this.indices).filter(function(item){
             return re.test(item);
              })
            .map(function(hit) {
             return thisThat.indices[hit];
            })
            //.flatten(); //TBD use this if we can get it from a library, like Underscore.js
            
            hits = [];
            hitArrays.forEach(function(arr){
             arr.forEach(function(elt){
                 hits.push(elt);    
             });
            });
            
            
            thisThat = null;
        } else {
            hits = this.indices[item];
        }
        
        
        
        var n = hits.length;
        var nMinus1 = n - 1;
	
        for (var i = 0; i < n; i++) {
             var thisIndex = hits[i];
            var origItem = this.items[thisIndex];
            var thisID = this.itemObjs[thisIndex][kIDKey];
            if (includeOnly != null && ! (thisID in includeOnly) ) {
                continue;
            }
           
            itemArray.push( origItem );
            idArray.push(thisID);
	    
            if (thisIndex == 0) {
                prefixArray.push( [] );
            } else {
                var pStart = Math.max(0, thisIndex - contextLen); //start of prefix
                var prefs = chopLeftEnd(this.items.slice(pStart, thisIndex), pStart);
                pStart += contextLen - prefs.length;
                prefixArray.push( prefs.filter(function(elt,idx,contextArray) {
                    return filterPunc(pStart)(elt,idx,contextArray) && filterContext(pStart)(elt,idx,contextArray);
                }) );
            }

            if (thisIndex == lastItem) {
                suffixArray.push( [] );
            } else {
                var sEnd = Math.min(lastItem, thisIndex + contextLen);
                var sStart = thisIndex + 1;
                var suffs = chopRtEnd(this.items.slice(sStart, sEnd + 1), sStart);
                suffixArray.push( suffs.filter(function(elt,idx,contextArray) {
                    return filterPunc(sStart)(elt,idx,contextArray) && filterContext(sStart)(elt,idx,contextArray);
                }) );
            }
        }
        
        //select the number of random hits
        if (maxRandomHits !== null && maxRandomHits > 0) {
            //create an array 0..n, shuffle it, then take the first maxRandomHits
            var indices = d3.shuffle(d3.range(0,itemArray.length)).slice(0,maxRandomHits);
            
            //now permute our originals
            prefixArray = d3.permute(prefixArray, indices);
            itemArray = d3.permute(itemArray, indices);
            suffixArray = d3.permute(suffixArray, indices);
            idArray = d3.permute(idArray, indices);
        }
        
        return [prefixArray, itemArray, suffixArray, idArray];
    }
    
    //this expects a regular expression to match against index forms
    /**
     * Convenience function for textmodel.TextHash#getItem with isRegex=true
     */
    this.getItems = function(regex, contextLen, includeOnly, contextFilters, maxRandomHits, puncToExclude) {
        return this.getItem(regex, contextLen, includeOnly, true, contextFilters, maxRandomHits, puncToExclude);
    }
    
    //this expects an index form
    //return string of context around single hit
    /**
     * get a string of context around a single hit
     * @param item the item key (not a full form)
     * @param contextLen the length of the preceding and following context to include
     * @param id the id of the hit to return
     * @param itemIsRegex true if the item parameter should be considered as a regular expression instead of as a true item (This should match the value in the original query)
     * @returns string of context around the item with id, including the item itself
     */
    this.getItemContext = function(item, contextLen, id, itemIsRegex) {
	//item = convertItem(item);
        var toGet = {};
	toGet[id] = true;
        var results = this.getItem(item,contextLen,toGet, itemIsRegex);
        
        var what = results[0][0].join(" ") + " " + results[1][0] + " " + results[2][0].join(" ");
        return what;
    }
    
    //TBD ?? factor out sort case-insensitive sort, since it occurs twice
    
    /**
     * get the unique item keys in the model
     * @returns a sorted (case insensitive) array of item keys
     */
    this.getUniqItems = function() {
        return Object.keys( this.indices ).sort(function(A,B){
            var a = A.toLocaleLowerCase();
            var b = B.toLocaleLowerCase();
            if (a<b) return -1;
            if (a>b) return 1;
            return 0;
        }).filter(function(i){return i !== kRecDelim});
    }
    
    //append \t and the count to the item
    /**
     * get the unique item keys in the model, each followed by tab and its token count
     * @returns a sorted (case insensitive) array of item keys with their token counts
     */
    this.getUniqItemsWithCounts = function() {
        var what = [];
        for(item in this.indices ) {
            what.push(item + "\t" + this.indices[item].length);
        }
        
        what.sort(function(A,B){
            var a = A.toLocaleLowerCase();
            var b = B.toLocaleLowerCase();
            if (a<b) return -1;
            if (a>b) return 1;
            return 0;
        });
        
        return what;
    }
    
    /**
     * make this TextHash have the values of a (previously saved) TextHash JSON object
     * @param obj the TextHash JSON object
     */
    this.fromJSON = function(obj) {
	
	this.baseField = obj.baseField;
	this.baseFieldIdx = obj.baseFieldIdx;
	this.items = obj.items;
     this.itemObjs = obj.itemObjs;
	this.indices = obj.indices;
	this.numTypes = obj.numTypes;
	this.numTokens = obj.numTokens;
     this.useRecords = obj.useRecords;
    }
    
    //returns the index form of item, e.g. for when resetting predictive UI
    /**
     * convert a full item to its key form
     * @param item the full item
     * @returns the key form of the item
     */
    this.itemToIndex = function(item) {
	return convertItem(item);
    }
    
    /** @private */
    function convertItem(inItem) {
	
	var flds = inItem.split(fldDelim);
	var item = flds[that.baseFieldIdx];
	if (! caseSensitive) {
	    item = item.toLocaleLowerCase();
	}
	
        for(var f=0,n=flds.length;f<n;f++) {
            if (f == that.baseFieldIdx) {
                continue;
            }
            if ( distinguishingFldsArray.indexOf( fldNames[f] ) > -1) {
                item += ("" + fldDelim + flds[f]);
            }
        }
	return item;
    }
    
     /** @private */
    function itemToObject(inItem, id) { //we need to define this early, since it gets used in the constructor
        var flds = inItem.split(fldDelim);
        var what = {};
        flds.forEach(function(fld, idx){
            what[ fldNames[idx] ] = fld;
        });
        what[kIDKey] = id;
        return what;
    }
    
}
})();
