
// Modelling


// global graphs
var kb, kbURI, localizedKB, localizedKBURI;
var mod_ft = 1;

// base, change this to ...".org/" for production
var base = "http://www.eighteenthcenturypoetry.local/";

// namespaces
var NS = {};
NS[""] = $rdf.Namespace("http://www.eighteenthcenturypoetry.org/resources/models/#");
NS["foaf"]    = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
NS["wd"]      = $rdf.Namespace("http://www.wikidata.org/entity/");
NS["wdt"]     = $rdf.Namespace("http://www.wikidata.org/prop/direct/");
NS["rdf"]     = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
NS["rdfs"]    = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
NS["xs"]      = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
NS["owl"]     = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
NS["crm"]     = $rdf.Namespace("http://www.cidoc-crm.org/cidoc-crm/");
NS["crminf"]  = $rdf.Namespace("http://www.ics.forth.gr/isl/CRMinf/");
NS["crmsci"]  = $rdf.Namespace("http://www.ics.forth.gr/isl/CRMsci/");
NS["frbroo"]  = $rdf.Namespace("http://iflastandards.info/ns/fr/frbr/frbroo/");
NS["dcterms"] = $rdf.Namespace("http://purl.org/dc/terms/");

// TODO: -delete-
// kbURI is format-agnostic, can read variety of serializations
var kbURI = base+"resources/models/tgaen-wimit";
// -delete-


// main
$( document ).ready(function() {

    // extend JSONform to allow for HTML snippets
    JSONForm.fieldTypes['htmlsnippet'] = {
        template: '<%=node.value%>'
    };
    // default graph
    kb = $rdf.graph();
    localizedKB = $rdf.graph();

    $( "#modelling" )
	.append(
       `<h1 id="header"/><div id="message"/><form id="test"/>
	<a id="noughtstep">show form</a><br/>
	<a id="firststep">Load graph</a><br/>
	<a id="secondstep">Fork graph</a><br/>
	<a id="thirdstep">Publish graph</a><br/>
	<a id="fourthstep">Launch modal</a><br/>
	<a id="fifthstep">Publish modal</a><br/>`
	).append( `<div id="cy"></div>` );

});
$(document.body).on('click', '#noughtstep', function() { launchform(); });
$(document.body).on('click', '#firststep', function() { mod_view_graph( kbURI ); });
$(document.body).on('click', '#secondstep', function() { mod_edit_graph( kbURI ); });
$(document.body).on('click', '#thirdstep', function() { mod_save_graph( localizedKBURI ); });
$(document.body).on('click', '#fourthstep', function() { new_model( 'create' ); });
$(document.body).on('click', '#fifthstep', function() { new_model( 'publish' ); });


// workflow functions

// create/publish new model
function new_model ( task ) {

    // JSON form
    var jf = new Object(), graphid;
    jf.schema = {};
    jf.form = [];

    // basic metadata
    jf.schema.title = { title:"Title",key:"title",type:"string",description:"Give your model a title",maxLength:144,required:true };
    jf.schema.desc = { title:"Description",key:"desc",type:"string",description:"Provide a description of what your model is about...",required:false };
    jf.schema.author = { title:"Author",type:"object" };
    jf.schema.author.properties = {};
    jf.schema.author.properties.name  = { title:"Your name",key:"name",type:"string",description:"No nicknames allowed",required:true };
    jf.schema.author.properties.email = { title:"Your e-mail address",key:"email",type:"email",description:"Valid e-mail address required",required:true };

    // customize form
    if ( task == 'publish' ) {
	jf.form.push( { type:"htmlsnippet", value:"<p>Please review the information for your model and press <em>Publish</em> to submit the model to <em>ECPA</em> for publication.</p>" } );
    }
    jf.form.push( { key:"title" }, { key:"desc",type:"textarea" }, { key:"author" } );
    if ( task == 'create' ) {
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Create model"},{type: "button",title: "Cancel",onClick: function(e) { $("#newModal").modal('hide'); } }]} );    
    } else {
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'><p class='small'><em>Please note:</em> By pressing the publish button, you agree to make your model publicly available under a <a class='external' target='_blank' href='http://creativecommons.org/licenses/by-nc-sa/4.0/'>Creative Commons BY-NC-SA License</a>.</p>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Publish model"},{type: "button",title: "Cancel",onClick: function(e) { $("#newModal").modal('hide'); } }]} );
    }
    jf.form.push( { type:"htmlsnippet", value:"</div>"} );
    if ( task == 'create' ) { graphid = "kb-"+uuidv4(); }
    else { graphid = localizedKBURI.substr(localizedKBURI.lastIndexOf('/')+1); }
    jf.onSubmit = function (errors, values) {
	if (errors) {
	    $( "#message" ).html( `<div class="alert alert-danger" role="alert"><b>Oh snap!</b> Something went wrong, try again? Or call for <a href="mailto:help@eighteenthcenturypoetry.org">help!</a></div>` );
	    console.log(errors);
	} else {
	    // create triples
	    var triples, created;
	    triples = `@base `+NS[""]()+` .\n`;
	    jQuery.each( NS, function( index, value ) {
		triples += `@prefix `+index+`: `+NS[index]()+` .\n`;
	    });
	    triples += `\n`+NS[""](graphid)+` a owl:Ontology ;\n`;
	    triples += `rdfs:label """`+values.title+`""" ;\n`;
	    triples += `rdfs:comment """`+values.desc+`""" ;\n`;
	    if ( task == 'create' ) { triples += `dcterms:created "`+jQuery.now()+`" ;\n`; }
	    else { triples += `dcterms:dateSubmitted "`+jQuery.now()+`" ;\n`; }
	    triples += `dcterms:creator `+NS[""](graphid+"/creator")+` ;\n.\n`;
	    triples += `\n`+NS[""](graphid+"/creator")+` a foaf:Person ;\n`;
	    triples += `foaf:name "`+values.author.name+`" ;\n`;
	    triples += `foaf:mbox <mailto:`+values.author.email+`> ; \n.`;
	    // delete old before inserting new
	    if ( task == 'publish' ) {
		created = localizedKB.any( NS[""](graphid), NS["dcterms"]("created"), undefined);
		localizedKB.removeMany(NS[""](graphid), undefined, undefined );
		localizedKB.removeMany(NS[""](graphid+"/creator"), undefined, undefined );
	    }
	    // insert triples into graph
	    try {
		localizedKBURI = base+"submitted/"+graphid;
		$rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		if ( task == 'publish' ) {
		    localizedKB.add( NS[""](graphid), NS["dcterms"]("created"), created.value );
		}
		$( "#message" ).html( `<div class="alert alert-success" role="alert"><b>Success!</b> Your model will be available for you at: `+localizedKBURI+`</div>` );
	    } catch (err) {
		$( "#message" ).html( `<div class="alert alert-danger" role="alert"><b>Oh snap!</b> Something went wrong, try again? Or call for <a href="mailto:help@eighteenthcenturypoetry.org">help!</a></div>` );
		console.log(err);
	    }
	    refresh_graph();
	    // TODO need to save published graph elsewhere and/or send e-mail, etc.
	    mod_save_graph( localizedKBURI );
	    $( "#newModal" ).modal('hide');
	}
    };
    // populate form with original creation values
    if ( task == 'publish' ) {
	var statements = localizedKB.statementsMatching( NS[""](graphid+"/creator"), undefined, undefined );
	statements.forEach(function(statement) {
	    if (statement.predicate.value == NS["foaf"]("name").value) {
		jf.schema.author.properties.name["default"] = statement.object.value;
	    } else if (statement.predicate.value == NS["foaf"]("mbox").value) {
		jf.schema.author.properties.email["default"] = statement.object.value.substr(7);
	    }
	});
	var statements = localizedKB.statementsMatching( NS[""](graphid), undefined, undefined );
	statements.forEach(function(statement) {
	    if (statement.predicate.value == NS["rdfs"]("label").value) {
		jf.schema.title["default"] = statement.object.value;
	    } else if (statement.predicate.value == NS["rdfs"]("comment").value) {
		jf.schema.desc["default"] = statement.object.value;
	    }
	});
	launch_form( "Publish your model", jf );
    } else {
	launch_form( "Create a new model", jf );
    }
}


function launch_form ( title, form ) {

    $( "body" ).prepend(`
<div id="newModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newModalLabel">  
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	<h4 class="modal-title">`+ title +`</h4>
      </div>
      <div class="modal-body" id="modal-create"/><form id="jForm"/>`);
      $( "#jForm" ).jsonForm( form );
      $( "#newModal" ).after(`
    </div>
  </div>
</div>
    `);
    $( "#newModal" ).modal('show');

}


function launchform () {

    // JSON form
    var jf = new Object();
    jf.schema = {};
    jf.form = [];
    
    var header = fcr[0].contents[0].contents[0].contents[0].label;
    jQuery.each(fcr[0].contents[0].contents[0].contents, function(i,v) {
	jQuery.each(v.path, function(j,v2) {

	    jf.schema[v2.s.name] = { key:v2.s.name, type:v2.s.stype, title:v2.s.id, required:v2.req };
	    jf.schema[v2.p.name] = { key:v2.p.name, type:v2.p.stype, title:v2.p.id, required:v2.req };
	    jf.schema[v2.o.name] = { key:v2.o.name, type:v2.o.stype, title:v2.o.id, required:v2.req };
	    
	    jf.form.push(
		{ type:"fieldset", title:"Statement "+(j+1), items:[
		    { key:jf.schema[v2.s.name].key, prepend:onto[ v2.s.id ].label, notitle:true, type:v2.s.ftype, value:v2.s.svalue},
		    { key:jf.schema[v2.p.name].key, value:onto[ v2.p.id ].label, disabled:true, notitle:true, type:v2.p.ftype },  
		    { key:jf.schema[v2.p.name].key, value:v2.p.id, type:"hidden" }, 
		    { key:jf.schema[v2.o.name].key, append:onto[ v2.o.id ].label, notitle:true, type:v2.o.ftype, value:v2.o.svalue }
		] }
	    );

	});
    });
    jf.form.push( { type:"actions",items: [{type: "submit",title: "Submit"},{type: "button",title: "Cancel"}]} );
    jf.onSubmit = function (errors, values) {
	if (errors) {
	    console.log(errors);
	} else {
	    jQuery.each(values, function(i,v) {
		if ( values[ values[i] ] ) {
		    values[i] = values[ values[i] ];
		}
	    });
	    for (i=1; i<=Object.keys(values).length/3; i++) {
		console.log( "<UUID> a <"+onto[ jf.schema["s"+i].title ].about +"> ." );
		console.log( "<UUID> <"+onto[ jf.schema["p"+i].title ].about +"> <"+onto[ jf.schema["o"+i].title ].about +"> ." );
	    }
	}
    };
    $('#header').append( header );
    $('#test').jsonForm( jf );
    
}


/*
  TODO:
  * if sx, px, and ox exist, a triple MUST be written, otherwise the entire statement MUST be discarded
  * if v2.p.id is an array: "p":{"name":"p2","id":["crm:P26_moved_to","crm:P27_moved_from"],"stype":"string"}, that 
    needs to be turned into a drop-down list
  * need to create datalist's from refresh_graph by class, so that rdfs:labels can be used in the appropriate
    input fields
  * maybe the "next step" example would be an option to reveal the statements one at a time to make the process
    more transparent, one step could replace the next (or back/next arrows indicating required/optional)
  * might be worth keeping the statements/form entry always at the same place (top) abnd have a direct visualization
    in a big space below that
  * at the point of writing the SPARQL statement that adds a statement, I could record this with a timestamp as a
    note (further down the line, cy has a undo/redo function for any state of the graph built in: how do I connect 
    the graph in the triplestore to the graphical interface? --- after every single change of the graph, I should
    read the entire graph from store and update the entire interface, e.g. instance list, graph display, dropdown
    lists for various classes etc., no "copy" of the graph in memory necessary!)
  * once a cy-based graphical interface is on the horizon, I can then more easily include drop&drag from the text
    to create nodes and edges...
  * provide option to add references to source materials/text locations etc. in the model (comments?)
  * allow for adding an indication of the level of certainty to a statement (is this generic?)
  * not just nodes can be colour-coded, but edges can be too! [outgoing edges could be the colour of the node 
    (domain), incoming edges the colour of the originating node (range)]
  * best to decide on ONE way of interacting with the graph rather than using lots of different methods
  * delete anything marked -delete-

  Functions:
  * launchform( s1 ) - deals with creation of instances ("I want to talk about a book")
      Input: starts with a completely empty form or uses a UUID as a s1 starting point belonging to the appropriate 
           class
      Output: produces an array of triples s1,p1,o1,s2,o2,o3,... and forms a SPARQL construct from it
  * submit( SPARQL ) 
      Input: SPARQL statement
      Output: confirmed execution of SPARQL statement
  * refreshgraph()
      Input: reads entire localizedKB graph
      Output: refreshed interface based on current state of the graph 
*/


// backend functions

// view a graph (load serialized "kbURI" into RDF kb)
function mod_view_graph ( kbURI ) {

    // kbURI is either a draft graph or a published graph 
    storedURI = kbURI.slice(0, kbURI.lastIndexOf("/resources/")+1)+((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?"/submitted/":"resources/models/")+kbURI.substr(kbURI.lastIndexOf('/')+1)+".nt";
    var fetch = $rdf.fetcher(kb);
    fetch.nowOrWhenFetched(storedURI, {withCredentials:false}, function(ok, body, xhr){
	if (ok) {
	    console.log( "serialized graph loaded: "+kbURI+" ("+kb.length+" triples)" );
	} else {
	    console.log( "serialized graph not loaded: "+xhr.statusText );
	}
    });

}


// edit/fork a graph (load RDF kb into a "localized" kb)
function mod_edit_graph ( kbURI ) {

    localizedKB = kb;
    // localizedKBURI is either an edited draft graph or a forked graph
    localizedKBURI = ((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?kbURI:kbURI.slice(0, kbURI.lastIndexOf("/")+1)+"kb-"+uuidv4());
    console.log( "localized graph created: "+localizedKBURI+" ("+localizedKB.length+" triples)" );

// TODO: -delete-    
    mod_run_tests();
// -delete-    
}


// save a graph (serialize entire "localized" kb as ntriples [safest option] and upload to server)
function mod_save_graph ( localizedKBURI ) {

    $rdf.serialize(undefined, localizedKB, localizedKBURI, "application/n-triples", function(err, str) {
	if (!err) {
	    // upload serialized graph
	    var serializedFile = localizedKBURI.substr(localizedKBURI.lastIndexOf('/')+1)+".nt";
	    $.ajax({
		type: 'POST',
		url: '/cgi-bin/handleRDF.cgi',
		data: { 'myRDF': str, 'file': serializedFile, 'mimetype': "application/n-triples" },
		dataType: 'text',
		success: function() { console.log("you can resume work on your model any time: "+localizedKBURI); },
		error: function() { console.log ("serialized graph not uploaded."); }
	    });
	}
    });

}


function refresh_graph () {

    var statements = localizedKB.statementsMatching( undefined, undefined, undefined );
    statements.forEach(function(statement) {
	console.log(statement.subject, statement.predicate, statement.object);
    });

}


// save work before leaving page
$( window ).on('beforeunload', function() {

    if (localizedKBURI) { mod_save_graph( localizedKBURI ); }

});


// define startsWith()
if (!String.prototype.startsWith) {

    String.prototype.startsWith = function(searchString, position) {
	position = position || 0;
	return this.indexOf(searchString, position) === position;
    };

}


// query Wikidata
function wd_ent_query( wd_ent, wd_prp ) {

    var ret;
    var endpointUrl = 'https://query.wikidata.org/sparql',
	sparqlQuery =
        "SELECT ?itemLabel WHERE {\n" +
        wd_ent + " " + wd_prp + " ?item .\n" +
        " SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
        "}",
	settings = {
	    headers: { Accept: 'application/sparql-results+json' },
	    data: { query: sparqlQuery },
	    async: false
	};
    $.ajax( endpointUrl, settings ).then( function ( data ) {
	ret = data.results.bindings[0].itemLabel.value;
    } );
    return ret;
}


function createCYJSON( graph ) {

    var jsonObj = [], nodes_seen = [];
    graph.match(undefined, undefined, undefined).forEach( st => {

	var s = st.subject;
	var p = st.predicate;
	var o = st.object;

	// TODO: filtering according to s/p/o.termType = 
	// BlankNode, NamedNode, or Literal
	if ( typeof nodes_seen[s.value] == 'undefined' ) { // count each subject once
	    nodes_seen[s.value] = 1;
	    var node = {};
	    node["data"] = { "id" : s.value };
	    node["classes"] = "node";
	    var res = graph.any( s, NS["rdfs"]('label'), undefined );
	    if ( res ) {
		node["data"]["name"] = res.value;
	    }
	    jsonObj.push( node );
	}
	var edge = {};
	edge["data"] = { "source" : s.value };
	edge["data"]["name"] = p.value.substr(p.value.lastIndexOf("/")+1);
	if ( o.termType == "NamedNode" ) {
	    edge["data"]["target"] = o.value;
	    edge["classes"] = "edge";
	    jsonObj.push( edge );
	}

    });
    return( jsonObj );

}


function createCYgraph( data ) {
    var cy = cytoscape({
	container: $('#cy'),
	elements: data,
	layout: {
	    name: 'cola',
	    fit: false,
	    nodeSpacing: function( node ){ return 100; },
	},
	style: [ // the stylesheet for the graph
	    {
		selector: 'node',
		style: {
		    'background-color': '#999',
		    'label': 'data(name)'
		}
	    },
	    {
		selector: 'edge',
		style: {
		    'width': 1,
		    'curve-style': 'unbundled-bezier',
		    'line-color': '#ccc',
		    'target-arrow-color': '#ccc',
		    'target-arrow-shape': 'triangle',
		    'target-arrow-fill': 'filled',
		    'label': 'data(name)',
		    'edge-text-rotation': 'autorotate',
		}
	    },

	],
	wheelSensitivity: .5,
    });
    cy.panzoom();
    cy.navigator();

}




// TODO: -delete-
// below this line will be obsolete -- delete

// run some tests
function mod_run_tests () {

    // testing setup
    var subj = NS[""]("BagOfPropositionsForJoshuaSwidzinskisScholarlyAssessmentOfThomasGraysImitations-2");
    var pers = NS[""]("JoshuaSwidzinski");
    var auth = NS[""]("ThomasGray");

    // the function $rdf.sym creates a node out of a URI, use as
    //    var subj = $rdf.sym( "http://www.eighteenthcenturypoetry.org/resources/models/#ThomasGray" );
    // or easier (as above)
    //    var subj = NS[""]("ThomasGray");
    // there are also $rdf .bnode(),.literal(),.list([n1,n2]) to add blank nodes, literals and collections of nodes
    
    console.log( "1: "+auth );
    console.log( "2: "+onto["crm:P131_is_identified_by"].label );
    
    // The function "each()" returns an array of any fields it finds a value for (only one of s,p,o can be undefined)
    var statements = localizedKB.each( subj, NS["rdf"]('type'), undefined );
    console.log ( "3: "+statements.length ); // outputs "2" = subj has two rdf:type objects
    statements.forEach(function(statement) {
	console.log("4: "+statement.uri, statement.termType); // outputs the two rdf:type objects
    });

    // The function "any()" returns any one field it finds a value for (only one of s,p,o can be undefined)
    var predicate = localizedKB.any(subj, NS["rdf"]('predicate'), undefined );
    console.log( "5: "+predicate.uri, predicate.termType ); // outputs the object of the rdf:predicate property

    // SPARQL query execution - should not be necessary as .statementsMatching() can do simple things
    var query = "PREFIX : <http://www.eighteenthcenturypoetry.org/resources/models/#> \n"+
	"SELECT ?p ?o \n"+
	"WHERE {\n"+
	    subj+" ?p ?o . \n" +
	"}";
    // translate SPARQL construct
    var eq = $rdf.SPARQLToQuery(query,true,localizedKB);
    // execute query, then execute OnResult and OnDone functions, e.g. var onDone  = function() { ... } -- see end of file below for example
    //localizedKB.query(eq,onResult,undefined,onDone);

    // The function "statementsMatching()" retrieves all fields it finds values for (any 1 or more can be undefined)
    // This retrieves all predicates and objects of "subj" (same as SPARQL query above)
    var statements = localizedKB.statementsMatching( subj, undefined, undefined );
    statements.forEach(function(statement) {
	console.log("6: "+ statement.predicate, statement.object.value);
    });

    // This retrieves the entire graph - should be useful for refreshgraph()
    var statements = localizedKB.statementsMatching( undefined, undefined, undefined );
    statements.forEach(function(statement) {
	console.log("6a: "+ statement.subject.value, statement.predicate.value, statement.object.value);
    });

    // outputs first occurrence of the options provided - not sure where this would be helpful
    var findFirst = function() {
	var obj = undefined;
	var i=0;
	while (!obj && i < arguments.length) {
	    obj = kb.any(pers, arguments[i++], undefined);
	}
	return obj;
    }
    console.log( "8: "+ findFirst( NS["foaf"]('givenName'),NS["foaf"]('name') ).value ); 
        
    // adds a triple to the graph
    localizedKB.add(pers, NS["foaf"]('knows'), "Joe Bloggs");
    localizedKB.add(pers, NS["foaf"]('knows'), "Albert Bloggs");
    var res = localizedKB.any(pers, NS["foaf"]('knows'), undefined );
    console.log( "9: "+res.value, res.termType ); // retrieves o of first of the just inserted triples

    // inserts a triple stream, may be useful when inserting a whole form with values
    var body = `@prefix : <http://www.eighteenthcenturypoetry.org/resources/models/#> .
                    :a :b :c .
                    :d :e :f .`;
    try {
	$rdf.parse(body, localizedKB, localizedKBURI, 'text/turtle'); 
    } catch (err) {
	console.log(err);
    }
    // retrieves subject of just inserted second triple :d :e :f    
    res = localizedKB.any(undefined, undefined, NS[""]("f") );
    console.log("10: "+ res.value, res.termType ); // outputs ":d"
    
    // outputs all statements with occurrences of ?s foaf:knows ?o
    res = localizedKB.match(undefined, NS["foaf"]('knows'), undefined ).forEach(statement => {
	console.log("11: "+statement.subject + " " + statement.predicate + " " + statement.object)
    });
    // above construct is a different way of achieving what .statementsMatching() does:
    var statements = localizedKB.statementsMatching( undefined, NS["foaf"]('knows'), undefined );
    statements.forEach(function(statement) {
	console.log("11a: "+ statement.subject.value, statement.predicate.value, statement.object.value);
    });
    
    // removes a triple from the graph
    res = localizedKB.match(pers, NS["foaf"]('knows'), "Joe Bloggs" );
    localizedKB.remove( res );
    res = localizedKB.any(pers, NS["foaf"]('knows'), undefined );
    console.log( "12: "+res.value, res.termType ); // retrieves o of remaining triple

    // get first owl:sameAs statement in instance
    var auth_info = localizedKB.any(auth, NS["owl"]('sameAs'), undefined );
    console.log( "13: "+auth_info.uri, auth_info.termType );
    // retrieve WikiData wdt:P18 (image) of entity
    var retrieve_wd = wd_ent_query( $rdf.sym( auth_info.uri ), NS["wdt"]("P18") );
    console.log( "14: "+retrieve_wd);

    var data = createCYJSON( localizedKB );
//    createCYgraph( data );
}


/*

    var onResult = function(result) {
	function ifE(name) {
	    var res = result[name]
	    if (res) return " "+name+ ": " + res
	    else return " "
	}
	var resform = ifE("?p")+ifE("?o");
	console.log("7: "+ resform ); // outputs results of the SPARQL query, i.e. all p and o of subj
    }

    var onDone  = function() {
	// continues here afterwards

	// outputs first occurrence of either foaf:givenName or foaf:name
	console.log("8: "+ findFirst(NS["foaf"]('givenName'),NS["foaf"]('name')).value ); 

	
	// adds a triple to the graph
	localizedKB.add(pers, NS["foaf"]('knows'), "Albert Bloggs");
	localizedKB.add(pers, NS["foaf"]('knows'), "Joe Bloggs");
	var res = localizedKB.any(pers, NS["foaf"]('knows'), undefined );
	console.log( "9: "+res.value, res.termType ); // retrieves o of just inserted triple

	
	// inserts a triple stream, may be useful when inserting a whole form with values
	var body = `@prefix : <http://www.eighteenthcenturypoetry.org/resources/models/#> .
                    :a :b :c .
                    :d :e :f .`;
	try {
	    $rdf.parse(body, localizedKB, localizedKBURI, 'text/turtle'); 
	} catch (err) {
	    console.log(err);
	}
	res = localizedKB.any(undefined, undefined, NS[""]("f") );
	console.log("10: "+ res.value, res.termType ); // retrieves s of just inserted second triple :d :e :f

	// outputs all statements with occurrences of ?s foaf:knows ?o
	res = localizedKB.match(undefined, NS["foaf"]('knows'), undefined ).forEach(statement => {
	    console.log("11: "+statement.subject + " " + statement.predicate + " " + statement.object)
	});


	// removes a triple from the graph
	res = localizedKB.match(pers, NS["foaf"]('knows'), "Albert Bloggs" );
	localizedKB.remove( res );
	res = localizedKB.any(pers, NS["foaf"]('knows'), undefined );
	console.log( "12: "+res.value, res.termType ); // retrieves o of remaining triple

	var auth_info = localizedKB.any(auth, NS["owl"]('sameAs'), undefined );
	console.log( "13: "+auth_info.uri, auth_info.termType );
	var retrieve_wd = wd_ent_query( $rdf.sym( auth_info.uri ), NS["wdt"]("P18") );
	console.log( "14: "+retrieve_wd);

	var data = createCYJSON( localizedKB );
	console.log("15: "+data);
	createCYgraph( data );
    }
    
*/

// -delete-
