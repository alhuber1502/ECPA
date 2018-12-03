
// Modelling

/*

  Issues:
  * Every function needs to leave a trail in form of a timestamped log entry that allows us to trace how we arrived at the current state of the model
  * rdflib.js is badly documented, it doesn't seem to support SPARQL/Update properly, only basic SPARQL 1.0
  * I have worked out how to add and remove triples, load, save, and work with basic batch processing using turtle, and basic querying using SPARQL: this should suffice to create graphs, not sure if I need dynamic things like the UpdateManager for live updating?

*/

// global graphs
var kb, kbURI, localizedKB, localizedKBURI, mod_ft = 1;

// namespaces
var DEFAULTNS = $rdf.Namespace("http://www.eighteenthcenturypoetry.org/resources/ontologies/#");
var BASENS = $rdf.Namespace("http://www.eighteenthcenturypoetry.org/resources/ontologies/#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var WD = $rdf.Namespace("http://www.wikidata.org/entity/");
var WDT = $rdf.Namespace("http://www.wikidata.org/prop/direct/");
var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var OWL = $rdf.Namespace("http://www.w3.org/2002/07/owl#");

// kbURI is format-agnostic, can read variety of serializations
var kbURI = "http://www.eighteenthcenturypoetry.local/resources/ontologies/tgaen-wimit";
//var kbURI = "http://www.eighteenthcenturypoetry.local/resources/ontologies/kb-80ce278b-8be6-4be9-b720-4517dc5440e2";

$( document ).ready(function() {

    // default graph
    kb = $rdf.graph();
    localizedKB = $rdf.graph();

    $( "#modelling" )
	.append( `
	<a id="firststep">Load graph</a><br/>
	<a id="secondstep">Fork graph</a><br/>
	<a id="thirdstep">Publish graph</a><br/>` )
	.append( `<div id="cy"></div>` );


});
$(document.body).on('click', '#firststep', function() { mod_view_graph( kbURI ); });
$(document.body).on('click', '#secondstep', function() { mod_edit_graph( kbURI ); });
$(document.body).on('click', '#thirdstep', function() { mod_save_graph( localizedKBURI ); });

// view a graph (load serialized "kbURI" into RDF kb)
function mod_view_graph ( kbURI ) {

    // kbURI is either a draft graph or a published graph 
    storedURI = kbURI.slice(0, kbURI.lastIndexOf("/resources/")+1)+((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?"/submitted/":"resources/ontologies/")+kbURI.substr(kbURI.lastIndexOf('/')+1)+".nt";
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
    // localizedKBURI is either an edited draft graph or a forked published graph
    localizedKBURI = ((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?kbURI:kbURI.slice(0, kbURI.lastIndexOf("/")+1)+"kb-"+uuidv4());
    console.log( "localized graph created: "+localizedKBURI+" ("+localizedKB.length+" triples.)" );

    mod_run_tests();
}

// run some tests
function mod_run_tests () {

    // testing setup
    var subjURI = DEFAULTNS("BagOfPropositionsForJoshuaSwidzinskisScholarlyAssessmentOfThomasGraysImitations-2");
    var persURI = DEFAULTNS("JoshuaSwidzinski");
    var authURI = DEFAULTNS("ThomasGray");
    var subj = $rdf.sym( subjURI );
    var pers = $rdf.sym( persURI );
    var auth = $rdf.sym( authURI );

    // The function "each()" returns an array of any field it finds a value for
    var statements = localizedKB.each( subj, RDF('type') );
    console.log ( statements.length ); // outputs "2" = subj has two rdf:type objects
    statements.forEach(function(statement) {
	console.log(statement.uri, statement.termType); // outputs the two rdf:type objects
    });


    // The function "any()" returns any field it finds a value for
    var predicate = localizedKB.any(subj, RDF('predicate'), undefined );
    console.log( predicate.uri, predicate.termType ); // outputs the object of the rdf:predicate property


    // SPARQL query execution
    var query = "PREFIX : <http://www.eighteenthcenturypoetry.org/resources/ontologies/#> \n"+
	"SELECT ?p ?o \n"+
	"WHERE {\n"+
	    subj+" ?p ?o . \n" +
	"}";
    var eq = $rdf.SPARQLToQuery(query,true,localizedKB);

    var onResult = function(result) {
	function ifE(name) {
	    var res = result[name]
	    if (res) return " "+name+ ": " + res
	    else return " "
	}
	var resform = ifE("?p")+ifE("?o");
	console.log( resform ); // outputs results of the SPARQL query, i.e. all p and o of subj
    }

    var onDone  = function() {
	// continues here afterwards

	// outputs first occurrence of either foaf:givenName or foaf:name
	console.log( findFirst(FOAF('givenName'),FOAF('name')).value ); 

	
	// adds a triple to the graph
	localizedKB.add(pers, FOAF('knows'), "Albert Bloggs");
	localizedKB.add(pers, FOAF('knows'), "Joe Bloggs");
	var res = localizedKB.any(pers, FOAF('knows'), undefined );
	console.log( res.value, res.termType ); // retrieves o of just inserted triple

	
	// inserts a triple stream, may be useful when inserting a whole form with values
	var body = `@prefix : <http://www.eighteenthcenturypoetry.org/resources/ontologies/#> .
                    :a :b :c .
                    :d :e :f .`;
	try {
	    $rdf.parse(body, localizedKB, localizedKBURI, 'text/turtle'); 
	} catch (err) {
	    console.log(err);
	}
	res = localizedKB.any(undefined, undefined, $rdf.sym( DEFAULTNS("f") ) );
	console.log( res.value, res.termType ); // retrieves s of just inserted second triple :d :e :f

	// outputs all statements with occurrences of ?s foaf:knows ?o
	res = localizedKB.match(undefined, FOAF('knows'), undefined ).forEach(statement => {
	    console.log(statement.subject + " " + statement.predicate + " " + statement.object)
	});


	// removes a triple from the graph
	res = localizedKB.match(pers, FOAF('knows'), "Albert Bloggs" );
	localizedKB.remove( res );
	res = localizedKB.any(pers, FOAF('knows'), undefined );
	console.log( res.value, res.termType ); // retrieves o of remaining triple

	var auth_info = localizedKB.any(auth, OWL('sameAs'), undefined );
	console.log( auth_info.uri, auth_info.termType );
	var retrieve_wd = wd_ent_query( auth_info.uri );
	console.log(retrieve_wd);

	var data = createCYJSON( localizedKB );
	console.log(data);
	createCYgraph( data );
    }
    // execute SPARQL query, then execute OnResult and OnDone
    localizedKB.query(eq,onResult,undefined,onDone);


    var findFirst = function() {
	var obj = undefined;
	var i=0;
	while (!obj && i < arguments.length) {
	    obj = kb.any(pers, arguments[i++]);
	}
	return obj;
    }

}

// query Wikidata
function wd_ent_query( wd_ent ) {

    var ret;
    var endpointUrl = 'https://query.wikidata.org/sparql',
	sparqlQuery =
        "SELECT ?itemLabel WHERE {\n" +
        "<"+ wd_ent +"> wdt:P18 ?item .\n" +
        "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
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


// save a graph (serialize "localized" kb as ntriples [safest option] and upload to server)
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

// save work before leaving page
$( window ).on('beforeunload', function() {

    if (localizedKBURI) { mod_save_graph( localizedKBURI ); }

});

if (!String.prototype.startsWith) {

    String.prototype.startsWith = function(searchString, position) {
	position = position || 0;
	return this.indexOf(searchString, position) === position;
    };

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
	    var res = graph.any( s, RDFS('label'), undefined );
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
