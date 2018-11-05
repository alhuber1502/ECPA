
// Modelling

/*
  Every function needs to leave a trail in form of a timestamped log entry that allows us to trace how we arrived at the current state of the model
*/

// global graphs
var kb, kbURI, localizedKB, localizedKBURI;

// namespaces
var DEFAULTNS = $rdf.Namespace("http://www.eighteenthcenturypoetry.org/resources/ontologies/#");
var BASENS = $rdf.Namespace("http://www.eighteenthcenturypoetry.org/resources/ontologies/#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
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

});

$( "#firststep" ).click(function() { mod_view_graph( kbURI ); });
$( "#secondstep" ).click(function() { mod_edit_graph( kbURI ); });
$( "#thirdstep" ).click(function() { mod_save_graph( localizedKBURI ); });


// view a graph (load serialized "kbURI" into RDF kb)
function mod_view_graph ( kbURI ) {

    // kbURI is either a draft graph or a published graph 
    storedURI = kbURI.slice(0, kbURI.lastIndexOf("/resources/")+1)+((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?"/submitted/":"/resources/ontologies/")+kbURI.substr(kbURI.lastIndexOf('/')+1)+".nt";
    var fetch = $rdf.fetcher(kb);
    fetch.nowOrWhenFetched(storedURI, function(ok, body, xhr){
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

    // testing
    var subjURI = DEFAULTNS("BagOfPropositionsForJoshuaSwidzinskisScholarlyAssessmentOfThomasGraysImitations-1");
    var persURI = DEFAULTNS("AH");
    var subj = $rdf.sym( subjURI );
    var pers = $rdf.sym( persURI );

    var statements = localizedKB.each( subj, RDF('type'), undefined );
    console.log ( statements.length ); // outputs "2" = subj has two rdf:type objects
    statements.forEach(function(statement) {
	console.log(statement.uri, statement.termType); // outputs the two rdf:type objects
    });
    var predicate = localizedKB.any(subj, RDF('predicate'), undefined);
    console.log( predicate.uri, predicate.termType ); // outputs the object of the rdf:predicate property
    
    var query = "PREFIX : <http://www.eighteenthcenturypoetry.org/resources/ontologies/#> \n"+
	"SELECT ?p ?o \n"+
	"WHERE {\n"+
	" "+subj+" ?p ?o . \n" +
	"} .";
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
	console.log( findFirst(FOAF('givenName'),FOAF('name')).value ); // outputs first occurrence of either foaf:givenName or foaf:name

	localizedKB.add(pers, FOAF('knows'), $rdf.lit('Albert Bloggs', 'en')); // adds a triple to the graph
	var res = localizedKB.any(pers, FOAF('knows'), undefined);
	console.log( res.value, res.termType ); // retrieves o of just inserted triple

	var body = `@prefix : <http://www.eighteenthcenturypoetry.org/resources/ontologies/#> .
                    :a :b :c .
                    :d :e :f .`;
	try {
	    $rdf.parse(body, localizedKB, localizedKBURI, 'text/turtle'); // inserts a triple stream, may be useful when inserting a whole form with values
	    var res = localizedKB.any($rdf.sym( DEFAULTNS("d") ), undefined);
	    console.log( res.value, res.termType ); // retrieves p of just inserted second triple :d :e :f

	} catch (err) {
	    console.log(err);
	}
	
    }
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
