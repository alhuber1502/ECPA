/* (This is the new BSD license.)
* Copyright (c) 2014, Chris Culy
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

var visSem = visSem || {};

(function(){

//the container is either an ID or the HTMl element
visSem.KWIC = function(container) {
    var where; //the html element for the KWIC
    var id; //the id of the element; we'll make up one if we need to
    var data; // array of objects: {left: array of TextInfo leftContexts, hits:TextInfo, right: array of TextInfo rightContexts, index:idx]}
    var leftContextLen = 5; 
    var rtContextLen = 5;
    var numToShow = 20; //number of hits to show at one time
    var whichPage = 0; //which "page" of hits we are showing
    var lastPage; //the last page; read only
    var sortCol = 0; //i.e. the hit. For now just one column.
    var headerData;
    var cellTitle = function(textInfo, i) {}; //noop
    var colHeaderClick = function(headerContent, col) {}; //noop
    var itemCellClick = function(textInfo, i) {}; //noop
    var rowString = function(textInfoArray, i) {}; //noop
    var rowStringOnRight;
    var haveRowString = false;
    
    var kwic = this; //a way to keep track of the main object since functions each have their own _this_
    
    //we can pass either an ID or the actual HTML element this way
    if (typeof container == "string") {
        where = document.getElementById(container);
        id = container;
    } else {
        where = container; // not ideal -- should check that this is really html element
        id = container.id;
        if (!id) {
            container.id = "kwikContainer33";
            id = container.id;
        }
    }
    
    var table = d3.select(where).append("table");
    table.append("thead").append("tr");
    table.append("tbody");
    
    setupHeaderData();
    
    //end of initialization in constructor
    
    
    ///////////     public functions
    
    
    //setter/getters
    this.data = function (_) {
        if (!arguments.length) {
            return data;
        }
        data = _;
        calcLastPage();
        return kwic;
    }
    
    this.numToShow = function(_) {
        if (!arguments.length) {
            return numToShow;
        }
        numToShow = _;
        calcLastPage();
        return kwic;
    }
    
    this.whichPage = function(_) {
        if (!arguments.length) {
            return whichPage;
        }
        whichPage = _;
        return kwic;
    }
    
    this.leftContextLen = function(_) {
        if (!arguments.length) {
            return leftContextLen;
        }
        leftContextLen = _;
        setupHeaderData();
        return kwic;
    }
    
    this.rtContextLen = function(_) {
        if (!arguments.length) {
            return rtContextLen;
        }
        rtContextLen = _;
        setupHeaderData();
        return kwic;
    }
    
    //convenience method to set both contexts to the same length
    this.contextLen = function(_) {
        if (!arguments.length) {
            return rtContextLen;
        }
        leftContextLen = _;
        rtContextLen = _;
        setupHeaderData();
        return kwic;
    }
    
    //setter only
    //theFun(textInfo, i), where i is the number *in the current page*
    this.cellTitle = function(theFun) {
        cellTitle = theFun;
        return kwic;
    }
    
    //setter only
    //theFun(headerContent, col)
    this.colHeaderClick = function(theFun) {
        colHeaderClick = theFun;
        return kwic;
    }
    
    //setter only
    //theFun(textInfo, i), where i is the number *in the current page*
    this.itemCellClick = function(theFun) {
        itemCellClick = theFun;
        return kwic;
    }
    
    //setter only
    //theFun(textInfoArray, hitNumber)
    //onRight is <em>boolean</em> (not just truthy) for position of rowString
    this.rowString = function(theFun, onRight) {
        rowString = theFun;
        if (typeof onRight == "boolean") {
            rowStringOnRight = onRight;
        } else {
            rowStringOnRight = true; //default
        }
        haveRowString = true;
        setupHeaderData();
        return kwic;
    }
    
    
    //other functions
    
    //settings is optional object: {field:f, reverse:boolean, sortFun:function}
    //if field is not specified, then we sort on the toString() result for the cell
    //if reverse is true, then the order the sortFun is reversed
    //if sortFun is not specified, then we do a case insensitive lexicographic sort
    this.sort = function(column, settings) {
        settings = settings || {};
        var field;
        var reverse = false;
        var sortFun;
        
        if (settings.hasOwnProperty('field')) {
            field = settings['field'];
        }
        if (settings.hasOwnProperty('reverse')) {
            reverse = settings['reverse'];
        }
        if (settings.hasOwnProperty('sortFun')) {
            sortFun = settings['sortFun'];
        }
        
        if (typeof sortFun === 'undefined') {
            sortFun = function(a,b) {
                var lowerA = a.toLocaleLowerCase(a);
                var lowerB = b.toLocaleLowerCase(b);
                return lowerA < lowerB ? -1 : lowerA > lowerB ? 1 : 0;
            }
        }
        
        
        var hitCol = leftContextLen +1; //user columns are 1 based
        if (haveRowString && ! rowStringOnRight) {
            column--;
        }
        data.sort(function(obj1, obj2) {
           
           //get the relevant element
            var elt1, elt2;
            if (column == hitCol) {
                elt1 = obj1['hit'];
                elt2 = obj2['hit'];
            } else if (column < hitCol) {
                var which = column-1;
                elt1 = obj1['left'][which];
                elt2 = obj2['left'][which];
            } else  {
                var which = column-(leftContextLen +2); //user columns are 1 based
                elt1 = obj1['right'][which];
                elt2 = obj2['right'][which];
            }
            
            //get the relevant string from the element
            var comp1, comp2;
           
            if (typeof elt1 === 'undefined') {
                comp1 = "";
            } else {
                if (typeof field !== 'undefined') {
                    if (typeof elt1[field] === 'undefined') {
                        comp1 = "";
                    } else {
                        comp1 = elt1[field];
                    }
                } else {
                    comp1 = elt1.toString();
                }
            }
            if (typeof elt2 === 'undefined') {
                comp2 = "";
            } else {
                if (typeof field !== 'undefined') {
                    if (typeof elt2[field] === 'undefined') {
                        comp2 = "";
                    } else {
                        comp2 = elt2[field];
                    }
                } else {
                    comp2 = elt2.toString();
                }
            }
            
            
            
            return sortFun(comp1, comp2);
            
        });
        
        if (reverse) {
            data.reverse();
        }
        
        kwic.showPage(1);
    }
    
    //pageNum is 1-based for users, but internally we use 0-based
    this.showPage = function(pageNum) {
        kwic.whichPage(pageNum -1).show();
    }
    
    this.showNextPage = function() {
        if (whichPage == lastPage) {
            return;
        }
        whichPage += 1;
        kwic.show();
    }
    
    this.showPrevPage = function() {
        if (whichPage == 0) {
            return;
        }
        kwic.whichPage( kwic.whichPage()-1 ).show();
    }
    
    //show the KWIC for the current page of resultss
    this.show = function() {
        
        //select items for this page, trimming left and rt context, return flattened array (without indices, for now)
        var startElt = numToShow*whichPage;
        var thisData = data.slice(startElt, startElt + numToShow).map(function(d, i){
            d.left = d.left.slice(-leftContextLen);
            //pad if it is too short
            while (d.left.length < leftContextLen) {
                d.left.unshift("");
            }
            d.right = d.right.slice(0, rtContextLen);
            //pad if too short
            while (d.right.length < rtContextLen) {
                d.right.push("");
            }
           
            var what = d.left.concat([d.hit], d.right);
            var rowStr = [ rowString(what, startElt + i) ];
            if (haveRowString) {
                if (rowStringOnRight) {
                    what = what.concat(rowStr);
                } else {
                    what = rowStr.concat(what);
                }
            }
            return what;
        
        });
        
        var headers = d3.select(where).select(" table > thead > tr").selectAll("th")
            .data(headerData);
            
        headers.enter()
            .append("th")
            .text(String)
            .classed("kwicTH", true)
            .classed("kwicTHHit", function(d,i){
                return d == "HIT"; //from setupHeaderData    
            })
            .on("click", colHeaderClick);
        
        
        //cf. https://github.com/mbostock/d3/wiki/Selections#wiki-d3_select
        
        ////JOIN
        var tr = d3.select(where).select(" table > tbody").selectAll("tr")
            .data(thisData);
        
        //ENTER
        tr.enter().append("tr");
        
        //EXIT
        tr.exit().remove();
        
        //JOIN
        var td = tr.selectAll("td")
            .data(function(d) {
                return d;
            });
            
        
        //ENTER
        td.enter().append("td")
            .on("click", itemCellClick);
            
            
         //UPDATE
         //remember that ENTER adds things to UPDATE
         td.html(function(d) {return d.toString()})
            .classed("kwicTD", true)
            .classed("kwicTDHit", function(d,i) {
                var isHit;
                if (!haveRowString || rowStringOnRight) {
                    isHit = (i == leftContextLen);
                } else if (haveRowString) {
                    isHit = (i == (1+ leftContextLen));
                }
                return isHit;    
            })
            .attr("title", cellTitle);
        
        //EXIT
        //td.exit().remove(); //we don't need this since tr.exit() removes the whole row
        
        return;
    }
    
    ///////////     private functions
    
    function setupHeaderData() {
        //set up the headers
        headerData = [];
        for(var i=0;i<leftContextLen;i++) {
            headerData.push("-" + (leftContextLen -i))
        }
        headerData.push("HIT");
        for(var i=0;i<rtContextLen;i++) {
            headerData.push("+" + (1+i))
        }
        if (haveRowString) {
            if (rowStringOnRight) {
                headerData.push("");
            } else {
                headerData.unshift("");
            }    
        }
        
    }
    
    function calcLastPage() {
        if (!data || data.length == numToShow) {
            lastPage = 0;
        } else {
            lastPage = Math.floor(data.length / numToShow) ;
        }
    }
    

}

})()