var expect = require('chai').expect;
var cytoscape = require('../src/test.js', cytoscape);

describe('Collection compound nodes', function(){

  var cy, n1, n2, n3, n4;

  // test setup
  beforeEach(function(done){
    cytoscape({
      styleEnabled: true,

      elements: {
        nodes: [
            { data: { id: 'n1' } },
            { data: { id: 'n2', parent: 'n1' } },
            { data: { id: 'n3', parent: 'n2' } },
            { data: { id: 'n4', parent: 'n2' } }
        ]
      },

      layout: {
        name: 'grid'
      },

      ready: function(){
        cy = this;
        n1 = cy.$('#n1');
        n2 = cy.$('#n2');
        n3 = cy.$('#n3');
        n4 = cy.$('#n4');

        done();
      }
    });
  });

  afterEach(function(){
    cy.destroy();
  });

  it('node.isParent()', function(){
    expect( n1.isParent() ).to.be.true;
    expect( n3.isParent() ).to.be.false;
  });

  it('node.isChildless()', function(){
    expect( n1.isChildless() ).to.be.false;
    expect( n3.isChildless() ).to.be.true;
  });

  it('node.isChild()', function(){
    expect( n1.isChild() ).to.be.false;
    expect( n3.isChild() ).to.be.true;
  });

  it('node.isOrphan()', function(){
    expect( n1.isOrphan() ).to.be.true;
    expect( n3.isOrphan() ).to.be.false;
  });

  it('nodes.parent()', function(){
    expect( n2.parent().same(n1) ).to.be.true;
  });

  it('nodes.parents()', function(){
    expect( n3.parents().same( n1.add(n2) ) ).to.be.true;
  });

  it('nodes.children()', function(){
    expect( n1.children().same( n2 ) ).to.be.true;
  });

  it('nodes.descendants()', function(){
    expect( n1.descendants().same( n2.add(n3).add(n4) ) ).to.be.true;
  });

  it('nodes.siblings()', function(){
    expect( n3.siblings().same( n4 ) ).to.be.true;
  });

  it('nodes.commonAncestors()', function(){
    var ancestors = n3.add(n4).commonAncestors();

    expect( ancestors.length ).to.equal( 2 );
    expect( ancestors[0].same( n2 ) ).to.be.true;
    expect( ancestors[1].same( n1 ) ).to.be.true;
  });

  it('nodes.orphans()', function(){
    expect( cy.elements().orphans().same( n1 ) ).to.be.true;
  });

  it('nodes.nonorphans()', function(){
    expect( cy.elements().nonorphans().same( n2.add(n3).add(n4) ) ).to.be.true;
  });

  it('child.position() moves parent', function(){
    var p1 = {
      x: n2.position().x,
      y: n2.position().y
    };

    n4.position({ x: -200, y: -200 });

    expect( n2.position() ).to.not.deep.equal( p1 );
  });

  it('child.position() moves ancestor', function(){
    var p1 = Object.assign({}, n1.position());

    n4.position({ x: -200, y: -200 });

    expect( n1.position() ).to.not.deep.equal( p1 );
  });

  it('child.position() moves parent boundingbox', function(){
    var bb1 = n2.boundingBox();
    var w1 = bb1.w;
    var h1 = bb1.h;

    n4.position({ x: -200, y: -200 });

    var bb2 = n2.boundingBox();
    var w2 = bb2.w;
    var h2 = bb2.h;

    expect( w2 ).to.not.equal( w1 );
    expect( h2 ).to.not.equal( h1 );
  });

  it('child.position() moves ancestor boundingbox', function(){
    var bb1 = n1.boundingBox();
    var w1 = bb1.w;
    var h1 = bb1.h;

    n4.position({ x: -200, y: -200 });

    var bb2 = n1.boundingBox();
    var w2 = bb2.w;
    var h2 = bb2.h;

    expect( w2 ).to.not.equal( w1 );
    expect( h2 ).to.not.equal( h1 );
  });

  it('node.position() moves self boundingbox', function(){
    var bb1 = Object.assign({}, n4.boundingBox());

    var delta = 100;
    var p1 = Object.assign({}, n4.position());
    var p2 = { x: p1.x + delta, y: p1.y + delta };

    n4.position(p2);

    var bb2 = n4.boundingBox();
    expect( bb2.w ).to.equal( bb1.w );
    expect( bb2.h ).to.equal( bb1.h );
    expect( bb2.x1 ).to.equal( bb1.x1 + delta );
    expect( bb2.x2 ).to.equal( bb1.x2 + delta );
    expect( bb2.y1 ).to.equal( bb1.y1 + delta );
    expect( bb2.y2 ).to.equal( bb1.y2 + delta );
  });
});
