/* (This is the new BSD license.)
* Copyright (c) 2013, Chris Culy
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
var textmodel = textmodel || {};

(function(){
    
textmodel.TextModelUtilities = function(_fldNames, _fldDelim) {
    
    var what = this;
    var fldNames = _fldNames;
    var fldDelim = _fldDelim;
  
    /**
     * Convenience function that recursively creates TextInfo objects from (arrys of) array elments
     */
    what.textArrayToTextInfo = function(arrayOfText) {
        var elt = arrayOfText[0]; //assuming this exists
        if (typeof elt === "object" && elt instanceof Array) { //cf. http://javascript.crockford.com/remedial.html
            return arrayOfText.map(function(e) {
                return what.textArrayToTextInfo(e);    
            });
        }
        
        return arrayOfText.map(function(t) {
            return new what.TextInfo(t);    
        });
    }
    
    /**
     * Object derived from delited text e.g. dogs/dog/NN -> {token:"dogs", lemma:"dog", pos:"NN"}
     * @param fldNames the names of the fields in the data items
     * @param fldDelim the field delimter in the data items. Note: it cannot be a whitespace (e.g. tab), since whitespace is used to delimit items
     */
    what.TextInfo = function(text) {
        var that = this;
        
        var pieces = text.split(fldDelim);
    
        pieces.forEach(function(p,i) {
            that[ fldNames[i] ] = p;
        });
       
    }
    
    /**
     * This is meant to be overridden
     */
    what.TextInfo.prototype.toString = function() {
         return this[ fldNames[0] ];
    }
    
    return what;
}
    
})();