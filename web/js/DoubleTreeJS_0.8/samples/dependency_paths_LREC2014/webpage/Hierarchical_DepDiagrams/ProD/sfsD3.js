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


var sfs = sfs || { d3:{svg:{}} };

//Just like diagonal, except only for straight lines, no fancy curving. Useful for e.g. hierarchies/networks
//d3.svg.diagonal is a cubic Bezier from point p0 to point p3 with points p1 and p2 as guides
//cf. http://en.wikipedia.org/wiki/Bézier_curve
//to make a straightline, we can set p1 equal to p0 and p2 equal to p3
sfs.d3.svg.diagline = function() {
  /*CC unfortunately we have to recreate these below, because they're private to d3
  var source = d3_svg_chordSource,
      target = d3_svg_chordTarget,
      projection = d3_svg_diagonalProjection;
  */
  var source = function(d) {return d.source;}
  var target = function(d) {return d.target;}
  var projection = function(d){return [d.x, d.y];}

  function diagline(d, i) {
    var p0 = source.call(this, d, i),
        p3 = target.call(this, d, i),
        //m = (p0.y + p3.y) / 2,
        //p = [p0, {x: p0.x, y: m}, {x: p3.x, y: m}, p3];
        p = [p0, p0, p3, p3];
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

sfs.d3.svg.zigzag = function() {
  /*CC unfortunately we have to recreate these below, because they're private to d3
  var source = d3_svg_chordSource,
      target = d3_svg_chordTarget,
      projection = d3_svg_diagonalProjection;
  */
  var source = function(d) {return d.source;}
  var target = function(d) {return d.target;}
  var projection = function(d){return [d.x, d.y];}

  function zigzag(d, i) {
    var p0 = source.call(this, d, i),
        p3 = target.call(this, d, i),
        //m = (p0.y + p3.y) / 2,
        m = p0.y + 15;
        p = [p0, {x: p0.x, y: m}, {x: p3.x, y: m}, p3];
        
    p = p.map(projection);
    return "M" + p[0] + "L" + p[1] + " L" + p[2] + " L" + p[3];
  }

  zigzag.source = function(x) {
    if (!arguments.length) return source;
    source = d3.functor(x);
    return diagline;
  };

  zigzag.target = function(x) {
    if (!arguments.length) return target;
    target = d3.functor(x);
    return diagline;
  };

  zigzag.projection = function(x) {
    if (!arguments.length) return projection;
    projection = x;
    return diagline;
  };

  return zigzag;
};
