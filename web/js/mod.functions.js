
// Modelling

// global graphs
var kb, kbURI, localizedKB, localizedKBURI, mod_ft = 1;

// namespaces
var NS = {};
NS["default"] = $rdf.Namespace("http://www.eighteenthcenturypoetry.org/resources/models/#");
NS["base"]    = $rdf.Namespace("http://www.eighteenthcenturypoetry.org/resources/models/#");
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


// shortcuts (CRM FC/FR)
var FC = {};
FC["thing"]   = "crm:E70_Thing";
  FC["physical_thing"]   = "crm:E18_Physical_Thing";
  FC["conceptual_thing"] = "crm:E28_Conceptual_Object";
FC["actor"]   = "crm:E39_Actor";
FC["event"]   = "crm:E2_Temporal_Entity";
  FC["state"]    = "crm:E3_Condition_State";
  FC["period"]   = "crm:E4_Period";
  FC["activity"] = "crm:E7_Activity";
FC["time"]    = "crm:E52_Time-Span";
FC["place"]   = "crm:E53_Place";
FC["concept"] = "crm:E55_Type";

var FR = {};

/*
1. THING

1.1. THING - PLACE

a. Thing refers to or is about Place

b. Thing is referred to at Place

c. Thing from Place
c.0 Thing used at Place
c.1 Thing created in Place
c.2 Thing found or acquired in Place
c.3 Thing created/produced by person from Place
c.4 Thing is/was located in Place
c.5 Thing moved to Place
c.6 Thing moved from Place


1.2. THING - THING

a. Thing has met Thing (has met = has been with)

b. Thing refers to or is about Thing

c. Thing is referred to by Thing

d. Thing from Thing
d.1 Thing is part of Thing

e. Thing has part Thing

f. Thing is similar to or same as Thing


1.3. THING - ACTOR

a. Thing has met Actor

b. Thing is referred to by Actor

c. Thing refers to or is about Actor

d. Thing by Actor
d.1 Thing used by Actor
d.2 Thing created by Actor
d.3 Thing modified by Actor
d.4 Thing found or acquired by Actor

e. Thing from Actor


1.4. THING - EVENT/TIME

a. Thing refers to or is about Event

b. Thing is referred to at Event

c. Thing from Event
c.1 Thing destroyed in Event
c.2 Thing created in Event
c.3 Thing modified in Event
c.4 Thing used in Event


1.5. THING - CONCEPT

a. Thing has type Concept
a.1 Thing is made of Concept


2. PLACE

2.1. PLACE - PLACE

a. Place has part Place

b. Place is part of Place

c. Place borders or overlaps with Place


2.2. PLACE - THING

a. Place refers to or is about Thing

b. Place is referred to by Thing

c. Place has met Thing
c.1 Place is origin of Thing


2.3. PLACE - ACTOR

a. Place refers to or is about Actor

b. Place is referred to by Actor

c. Place has met Actor
c.1 Place is origin of Actor


2.4. PLACE - EVENT

a. Place has met Event

b. Place refers to Event

c. Place is referred to at Event

d. Place from Time


2.5. PLACE - CONCEPT

a. Place has type Concept


3. ACTOR

3.1. ACTOR - PLACE

a. Actor refers to Place

b. Actor is referred to at Place

c. Actor has met Place

d. Actor from Place


3.2. ACTOR - THING

a. Actor refers to Thing

b. Actor is referred to by Thing

c. Actor is origin of Thing
c.1 Actor is generator of Thing
c.2 Actor has Thing

d. Actor has met Thing


3.3. ACTOR - ACTOR

a. Actor has met Actor

b. Actor refers to Actor

c. Actor is referred to by Actor

d. Actor from Actor

e. Actor is origin of Actor
e.1 has generator
e.2 is generator of

f. Actor has member Actor

g. Actor is member of Actor


3.4. ACTOR - EVENT

a. Actor refers to Event

b. Actor is referred to at Event

c. Actor from Event

d. Actor has met Event
d.1 Actor performed action at Event
d.2 Actor was brought into existence at Event
d.3 Actor was taken out of existence at Event
d.4 Actor influenced Event


3.5. ACTOR - CONCEPT

a. Actor has type Concept


4. EVENT/TIME

4.1. Event - Place

a. Event refers to Place

b. Event is referred to at Place

c. Event from Place


4.2. Event - Thing

a. Event refers to or is about Thing

b. Event is referred to by Thing

c. Event has met Thing
c.1 Event created Thing
c.2 Event destroyed Thing
c.3 Event modified Thing
c.4 Event used Thing

d. Event is origin of Thing


4.3. Event - Actor

a. Event refers to or is about Actor

b. Event is referred to by Actor

c. Event by Actor

d. Event has met Actor
d.1 Event brought into existence Actor
d.2 Event took out of existence Actor


4.4. Event - Event

a. Event refers to or is about Event

b. Event is referred to at Event

c. Event from Event
c.1 Event starts at Time
c.2 Event ends at Time
c.3 Event has duration

d. Event has part Event


4.5. Event - Concept

a. Event has type Concept


5. CONCEPT

5.1. Concept - Place

a. Concept is type of Place


5.2. Concept - Thing

a. Concept is type of Thing


5.3. Concept - Actor

a. Concept is type of Actor


5.4. Concept - Event

a. Concept is type of Event


5.5. Concept - Concept

a. Concept has type Concept

b. Concept is type of Concept



		     "crm:P53_has_former_or_current_location","crm:P7_took_place_at","crm:P74_has_current_or_former_residence", "crm:P54_has_current_permanent_location", "crm:P26_moved_to", "crm:P27_moved_from", "crm:P24i_changed_ownership_through",
		     "", ];
*/

// kbURI is format-agnostic, can read variety of serializations
var kbURI = "http://www.eighteenthcenturypoetry.test/resources/models/tgaen-wimit";
//var kbURI = "http://www.eighteenthcenturypoetry.local/resources/models/kb-80ce278b-8be6-4be9-b720-4517dc5440e2";

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
    // localizedKBURI is either an edited draft graph or a forked published graph
    localizedKBURI = ((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?kbURI:kbURI.slice(0, kbURI.lastIndexOf("/")+1)+"kb-"+uuidv4());
    console.log( "localized graph created: "+localizedKBURI+" ("+localizedKB.length+" triples.)" );

    mod_run_tests();
}

// run some tests
function mod_run_tests () {

    // testing setup
    var subjURI = NS["default"]("BagOfPropositionsForJoshuaSwidzinskisScholarlyAssessmentOfThomasGraysImitations-2");
    var persURI = NS["default"]("JoshuaSwidzinski");
    var authURI = NS["default"]("ThomasGray");
    var subj = $rdf.sym( subjURI );
    var pers = $rdf.sym( persURI );
    var auth = $rdf.sym( authURI );

    console.log( onto["crm:P131_is_identified_by"].label );
    var auth = $rdf.sym( NS["base"]("ThomasGray") );
    console.log( auth.value );
    
    // The function "each()" returns an array of any field it finds a value for
    var statements = localizedKB.each( subj, NS["rdf"]('type') );
    console.log ( statements.length ); // outputs "2" = subj has two rdf:type objects
    statements.forEach(function(statement) {
	console.log(statement.uri, statement.termType); // outputs the two rdf:type objects
    });


    // The function "any()" returns any field it finds a value for
    var predicate = localizedKB.any(subj, NS["rdf"]('predicate'), undefined );
    console.log( predicate.uri, predicate.termType ); // outputs the object of the rdf:predicate property


    // SPARQL query execution
    var query = "PREFIX : <http://www.eighteenthcenturypoetry.org/resources/models/#> \n"+
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
	console.log( findFirst(NS["foaf"]('givenName'),NS["foaf"]('name')).value ); 

	
	// adds a triple to the graph
	localizedKB.add(pers, NS["foaf"]('knows'), "Albert Bloggs");
	localizedKB.add(pers, NS["foaf"]('knows'), "Joe Bloggs");
	var res = localizedKB.any(pers, NS["foaf"]('knows'), undefined );
	console.log( res.value, res.termType ); // retrieves o of just inserted triple

	
	// inserts a triple stream, may be useful when inserting a whole form with values
	var body = `@prefix : <http://www.eighteenthcenturypoetry.org/resources/models/#> .
                    :a :b :c .
                    :d :e :f .`;
	try {
	    $rdf.parse(body, localizedKB, localizedKBURI, 'text/turtle'); 
	} catch (err) {
	    console.log(err);
	}
	res = localizedKB.any(undefined, undefined, $rdf.sym( NS["default"]("f") ) );
	console.log( res.value, res.termType ); // retrieves s of just inserted second triple :d :e :f

	// outputs all statements with occurrences of ?s foaf:knows ?o
	res = localizedKB.match(undefined, NS["foaf"]('knows'), undefined ).forEach(statement => {
	    console.log(statement.subject + " " + statement.predicate + " " + statement.object)
	});


	// removes a triple from the graph
	res = localizedKB.match(pers, NS["foaf"]('knows'), "Albert Bloggs" );
	localizedKB.remove( res );
	res = localizedKB.any(pers, NS["foaf"]('knows'), undefined );
	console.log( res.value, res.termType ); // retrieves o of remaining triple

	var auth_info = localizedKB.any(auth, NS["owl"]('sameAs'), undefined );
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
