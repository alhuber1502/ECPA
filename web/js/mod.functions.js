
// Modelling


// global graphs
var kb, kbURI, localizedKB, localizedKBURI;

// base - TODO: adjust for development/production
//var base = "https://www.eighteenthcenturypoetry.org/";
var base = "http://www.eighteenthcenturypoetry.test/";
// global variables
var mod_ft = 1, triples_pre, ontofcr = [], cy_var = {}, curr_stmt = {};

// namespaces
var NS = {};
NS[""]       = $rdf.Namespace("https://www.eighteenthcenturypoetry.org/resources/models/#");
NS["foaf"]   = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
NS["wd"]     = $rdf.Namespace("http://www.wikidata.org/entity/");
NS["wdt"]    = $rdf.Namespace("http://www.wikidata.org/prop/direct/");
NS["rdf"]    = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
NS["rdfs"]   = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
NS["xs"]     = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
NS["owl"]    = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
NS["crm"]    = $rdf.Namespace("http://www.cidoc-crm.org/cidoc-crm/");
NS["crminf"] = $rdf.Namespace("http://www.ics.forth.gr/isl/CRMinf/");
NS["frbroo"] = $rdf.Namespace("http://iflastandards.info/ns/fr/frbr/frbroo/");
NS["dct"]    = $rdf.Namespace("http://purl.org/dc/terms/");
NS["skos"]   = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");

// TODO: -delete-
// kbURI is format-agnostic, can read variety of serializations
// kbURßI should be the href that is used when clicking "view/fork model" to display/fork it
var kbURI = base+"resources/models/tgaen-wimit";
//var kbURI = base+"submitted/kb-tgaen-wimit";
// -delete-


// FCR paths by id
function retrieve_fcr_path( id ) {

    var header, path;
    $.each( fcr, function(i,v) {
	$.each( v.contents, function(i2,v2) {
	    $.each( v2.contents, function(i3,v3) {
		$.each( v3.contents, function(i4,v4) {
		    if ( v4.id == id ) {
			header = v3.label;
			path = v4.path;
			return false;
		    }
		});
	    });
	});    
    });
    return [header,path];

}

// modelling home
function mod_home( message, type ) {

    // default graph
    kb = $rdf.graph();
    localizedKB = $rdf.graph();
    localizedKBURI = undefined;
    if ( cy_var["nav"] ) { cy_var["nav"].destroy(); cy_var["nav"] = undefined; }
    $( "#cy" ).remove();

    // TODO: * write script that retrieves md from published models to be exposed here, is this still the 
    //         best approach? if so, can/should this be a cronjob?

    // home page scaffold
    $( "#modelling" ).html('').append( `<div id="message"/>` );
    show_alert_div( message, type );
    $( "#modelling").append( `<h1>Knowledge modelling</h1>` );
    $( "#modelling").append( `<h2>Intro?</h2>` );
    $( "#modelling").append( `<h2>Available models referencing this text</h2>` );
    $( "#modelling" ).append(`<button type="button" class="btn btn-primary" id="firststep">View model</button> `);
    $( "#modelling" ).append(`<button type="button" class="btn btn-success" id="fourthstep">Create new model</button>`);
    
}
$(document.body).on('click', '#firststep', function() { mod_load_graph( kbURI ); });
$(document.body).on('click', '#secondstep', function() { mod_edit_graph( kbURI ); });
$(document.body).on('click', '#thirdstep', function() { mod_save_graph( localizedKBURI ); var message = `<b>Success!</b> Continue work on your model any time at: &lt;`+localizedKBURI+`&gt;.<br/> <em>Remember:</em> You must <em>publish</em> your model to make it available to everybody!`; mod_home( message, "success" ); });
$(document.body).on('click', '#fourthstep', function() { new_model( 'create' ); });
$(document.body).on('click', '#fifthstep', function() { new_model( 'publish' ); });
$(document.body).on('click', '#sixthstep', function() { mod_home( '' ) });


// workflow functions

// create/fork/publish model
function new_model ( task ) {

    // JSON form
    var jf = new Object(), graphid, message;
    jf.schema = {};
    jf.form = [];
    
    // basic metadata
    jf.schema.model = { title:"Model",type:"object" };
    jf.schema.model.properties = {};
    jf.schema.model.properties.title = { title:"Title",key:"title",type:"string",description:"Give your model a meaningful title",maxLength:144,required:true };
    jf.schema.model.properties.desc = { title:"Description",key:"desc",type:"textarea",description:"Provide a description of what your model is about &#x2014 optional",required:false };
    jf.schema.author = { title:"Creator",type:"object" };
    jf.schema.author.properties = {};
    jf.schema.author.properties.name  = { title:"Your name",key:"name",type:"string",required:true };
    jf.schema.author.properties.email = { title:"Your e-mail address",key:"email",type:"email",description:"Valid e-mail address required",required:true };
    // customize form
    // initial instructions
    if ( task == 'publish' ) {
	jf.form.push( { type:"htmlsnippet", value:"<p>Please <b>review</b> the information about your contribution and press <em>Publish model</em> to <b>submit the model</b> to <em>ECPA</em> for integrity checking and publication. <em>Thank you!</em></p>" } );
    } else if ( task == 'fork' ) {
	jf.form.push( { type:"htmlsnippet", value:"<p>You are <b>forking</b> this model.  Please consider <b>offering</b> any changes back to the original model's creator.</p>" } );
    }
    jf.form.push( { key:"model" }, { key:"author" } );
    // submit/cancel buttons
    if ( task == 'create' ) {
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Create model"},{type: "button",title: "Cancel",onClick: function(e) { $("#newModal").modal('hide'); } }]} );    
    } else if ( task == 'publish' ) {
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'><p class='small'><em>Please note:</em> By pressing the <em>Publish model</em> button, you agree to make your model <em>publicly available</em> under a <a class='external' target='_blank' href='http://creativecommons.org/licenses/by-nc-sa/4.0/'>CC BY-NC-SA 4.0</a> license.</p>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Publish model"},{type: "button",title: "Cancel",onClick: function(e) { $("#newModal").modal('hide'); } }]} );
    } else {
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Fork model"},{type: "button",title: "Cancel",onClick: function(e) { $("#newModal").modal('hide'); } }]} );    
    }
    jf.form.push( { type:"htmlsnippet", value:"</div>"} );
    // set graph identifier
    if ( task == 'create' || task == 'fork' ) { graphid = "kb-"+uuidv4(); }
    else { graphid = localizedKBURI.substr(localizedKBURI.lastIndexOf('/')+1); }
    // preserve existing identifier
    var ontomd = localizedKB.any( undefined, NS["rdf"]("type"), NS["owl"]("Ontology") );
    jf.onSubmit = function (errors, values) {
	if (errors) {
	    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
	    console.log( errors );
	    mod_home( message, "danger" );
	} else {
	    // create triples
	    var triples, saved = {};
	    triples = triples_pre;
	    // KB header
	    triples += `\n`+NS[""](graphid)+` a owl:Ontology ;\n`;
	    triples += `skos:prefLabel """`+values.model.title+`""" ;\n`;
	    triples += `rdfs:comment """`+values.model.desc+`""" ;\n`;
	    if ( task == 'create' ) { 
		triples += `dct:subject `+$rdf.sym( base+"works"+"/"+docname+".shtml" )+` ;\n`; 
		triples += `dct:created "`+jQuery.now()+`" ;\n`; 
	    }
	    else if ( task == 'publish' ) { triples += `dct:dateSubmitted "`+jQuery.now()+`" ;\n`; }
	    else {
		triples += `dct:isVersionOf `+$rdf.sym( ontomd.uri )+` ;\n`;
		triples += `dct:date "`+jQuery.now()+`" ;\n`;
	    }
	    triples += `dct:creator `+NS[""](graphid+"/creator")+` ;\n.\n`;
	    // KB author
	    triples += `\n`+NS[""](graphid+"/creator")+` a foaf:Person ;\n`;
	    triples += `foaf:name "`+values.author.name+`" ;\n`;
	    triples += `skos:prefLabel """`+values.author.name+`""" ;\n`;
	    triples += `foaf:mbox """mailto:`+values.author.email+`""" ; \n.`;
	    if ( task == 'publish' || task == 'fork' ) {
		// preserve 
		saved["created"] = localizedKB.any( $rdf.sym( ontomd.uri ), NS["dct"]("created"), undefined );
		saved["subject"] = localizedKB.any( $rdf.sym( ontomd.uri ), NS["dct"]("subject"), undefined );
		// delete old information
		localizedKB.removeMany( $rdf.sym( ontomd.uri ), undefined, undefined );
		localizedKB.removeMany( $rdf.sym( ontomd.uri+"/creator" ), undefined, undefined );
	    } 
	    // insert triples into graph
	    //	    console.log(triples);
	    $( "#newModal" ).modal('hide');
	    try {
		localizedKBURI = base+"submitted/"+graphid;
		$rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		if ( task == 'publish' ) {
		    localizedKB.add( NS[""](graphid), NS["dct"]("created"), saved["created"].value );
		    localizedKB.add( NS[""](graphid), NS["dct"]("subject"), saved["subject"].value );
		    mod_save_graph( localizedKBURI );
		    message = `<b>Success!</b> Your model has been submitted for publication. We will notify you when it becomes available. <em>Thank you!</em>`;
		    mod_home( message, "success" );
		    // TODO need to save published graph elsewhere and/or send e-mail, etc.?
		} else if ( task == 'fork' ) {
		    localizedKB.add( NS[""](graphid), NS["dct"]("created"), saved["created"].value );
		    localizedKB.add( NS[""](graphid), NS["dct"]("subject"), saved["subject"].value );
		    mod_save_graph( localizedKBURI );
		    message = `<b>Success!</b> Your model is available for you at: &lt;`+localizedKBURI+`&gt;`;
		    mod_display( localizedKB, message, "success" );
		} else {
		    mod_save_graph( localizedKBURI );
		    message = `<b>Success!</b> Your model is available for you at: &lt;`+localizedKBURI+`&gt;`;
		    mod_display( localizedKB, message, "success" );
		}
	    } catch (err) {
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		console.log( err );
		mod_home( message, "danger" );
	    }
	}
    };
    // populate form with original creation values
    if ( task == 'publish' ) {
	var statements = localizedKB.statementsMatching( $rdf.sym( ontomd.uri ), undefined, undefined );
	statements.forEach(function(statement) {
	    if (statement.predicate.value == NS["skos"]("prefLabel").value) {
		jf.schema.model.properties.title["default"] = statement.object.value;
	    } else if (statement.predicate.value == NS["rdfs"]("comment").value) {
		jf.schema.model.properties.desc["default"] = statement.object.value;
	    }
	});
	var statements = localizedKB.statementsMatching( $rdf.sym( ontomd.uri+"/creator" ), undefined, undefined );
	statements.forEach(function(statement) {
	    if (statement.predicate.value == NS["foaf"]("name").value) {
		jf.schema.author.properties.name["default"] = statement.object.value;
	    } else if (statement.predicate.value == NS["foaf"]("mbox").value) {
		jf.schema.author.properties.email["default"] = statement.object.value.substr(7);
	    }
	});
	create_form( "Publish your model", "create", jf );
	$( "#newModal" ).modal('show');
    } else if ( task == 'create' ) {
	create_form( "Create a new model", "create", jf );
	$( "#newModal" ).modal('show');
    } else {
	create_form( "Fork this model", "create", jf );
	var statements = localizedKB.statementsMatching( $rdf.sym( ontomd.uri ), undefined, undefined );
	statements.forEach(function(statement) {
	    if (statement.predicate.value == NS["skos"]("prefLabel").value) {
		$( "#newModal input[name='model.title']" ).attr( "placeholder", statement.object.value );
	    } else if (statement.predicate.value == NS["rdfs"]("comment").value) {
		$( "#newModal textarea[name='model.desc']" ).attr( "placeholder", statement.object.value );
	    }
	});
	$( "#newModal" ).modal('show');
    }
}

$(document.body).on('shown.bs.modal', "#newModal", function () {
    $("#jForm input:text, #jForm textarea").first().focus();
});

function create_form ( title, name, form ) {

    // make modal
    $( "body" ).prepend(`
<div id="newModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newModalLabel">  
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	<h4 class="modal-title">`+ title +`</h4>
      </div>
      <div class="modal-body" id="modal-create"/><form name="`+name+`" id="jForm"/>`);
      $( "#jForm" ).jsonForm( form );
      $( "#newModal" ).after(`
    </div>
  </div>
</div>
    `);
    
}

// create a FCR shortcut
function create_shortcut ( header, path ) {

    // JSON form
    var jf = new Object(), svalue = {}, message;
    jf.schema = {};
    jf.form = [];

    jf.form.push( { type:"htmlsnippet", value:"<p>Please fill in these "+path.length+" statements.</p>" } );
    jQuery.each(path, function(j,v) {
	var titmap = {};
	jf.schema[v.s.name] = { key:v.s.name, type:v.s.stype, title:v.s.id, required:v.req };
	if ( Array.isArray( v.p.id ) ) {
	    jf.schema[v.p.name] = { key:v.p.name, type:v.p.stype, title:v.p.id[0], required:v.req, enum:v.p.id };
	    $.each( v.p.id, function(i,v) {
	        titmap[v] = onto[ v ].label;
	    });
	} else {
	    jf.schema[v.p.name] = { key:v.p.name, type:v.p.stype, title:v.p.id, required:v.req };
	}
	jf.schema[v.o.name] = { key:v.o.name, type:v.o.stype, title:v.o.id, required:v.req };

	jf.form.push(
		{ type:"fieldset", title:"Statement "+(j+1)+((!v.req)?" &#x2014 optional":""),
			expandable:((!v.req) ? true : false), items:[
		{ key:jf.schema[v.s.name].key, value:v.s.svalue, title:onto[v.s.id].label },
		( Array.isArray( v.p.id ) ?
		  ({ key:jf.schema[v.p.name].key, titleMap:titmap, notitle:true, disabled:true }) :
		  ({ key:jf.schema[v.p.name].key, value:onto[ v.p.id ].label, notitle:true, disabled:true }) ),
		( Array.isArray( v.p.id ) ?
		  ({ }) :
		  ({ key:jf.schema[v.p.name].key, value:v.p.id, type:"hidden" }) ),
		{ key:jf.schema[v.o.name].key, value:v.o.svalue, title:((onto[v.o.id])?onto[v.o.id].label:v.o.id) }
	    ] }
	);
    });
    jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
    jf.form.push( { type:"actions",items: [{type: "submit",title: "Add statements"},{type: "button",title: "Cancel",onClick: function(e) { $("#newModal").modal('hide'); } }]} );
    jf.form.push( { type:"htmlsnippet", value:"</div>"} );
    jf.onSubmit = function (errors, values) {
	if (errors) {
	    console.log( errors );
	    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
	    show_alert_mod( message, "danger" );
	} else {
	    // create triples
	    var triples = triples_pre, tripleid = {};
	    // iterate through values in triples to create instances
	    for (i=1; i<=Object.keys(values).length/3; i++) {
		// if triple is complete
		if ( values["s"+i] && values["p"+i] && values["o"+i] ) {
		    // check if instances already exist
		    var shownVal = document.getElementsByName("s"+i)[0].value;
		    var shownValDefined = $( "#"+jqu( onto[ jf.schema["s"+i].title ].about )+" option" ).filter(function() { return this.value == shownVal; }).data('value');
		    // value from a datalist
		    if ( shownValDefined ) {
			tripleid["s"+i] = shownValDefined.substr(shownValDefined.lastIndexOf('/')+2);
		    // new value
		    } else if ( $( "#newModal input[name='s"+i+"']" ).attr("readonly") != "readonly" ) {
			tripleid["s"+i] = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid["s"+i])+` a <`+onto[ jf.schema["s"+i].title ].about+`> ;\n`;
			triples += `skos:prefLabel """`+values["s"+i]+`""" ;\n`;
			triples += `dct:created "`+jQuery.now()+`" ;\n.`;
		    }
		    // TODO: this needs fixing for literals, blank nodes, etc.
		    shownVal = document.getElementsByName("o"+i)[0].value;
		    shownValDefined = $( "#"+jqu( onto[ jf.schema["o"+i].title ].about )+" option" ).filter(function() { return this.value == shownVal; }).data('value');
		    if ( shownValDefined ) {
			tripleid["o"+i] = shownValDefined.substr(shownValDefined.lastIndexOf('/')+2);
		    } else if ( $( "#newModal input[name='o"+i+"']" ).attr("readonly") != "readonly" ) {
			tripleid["o"+i] = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid["o"+i])+` a <`+onto[ jf.schema["o"+i].title ].about+`> ;\n`;
			triples += `skos:prefLabel """`+values["o"+i]+`""" ;\n`;
			triples += `dct:created "`+jQuery.now()+`" ;\n.`;
		    }
		}
	    }
	    // iterate through values in triples to connect instances	    
	    for (i=1; i<=Object.keys(values).length/3; i++) {
		// if triple is complete
		if ( values["s"+i] && values["p"+i] && values["o"+i] ) {
		    // inherited value
		    if (! tripleid["s"+i] ) { tripleid["s"+i] = tripleid[ svalue["s"+i] ]; }
		    if (! tripleid["o"+i] ) { tripleid["o"+i] = tripleid[ svalue["o"+i] ]; }
		    // triple s-p-o
		    triples += `\n`+NS[""](tripleid["s"+i])+` <`+onto[ values["p"+i] ].about+`> `+NS[""](tripleid["o"+i])+`;\n.`;
		}
	    }
	    // insert triples into graph
	    //	    console.log( triples );
	    try {
		$rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		message = ``;
		mod_display( localizedKB, message, "success" );
	    } catch (err) {
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		mod_display( localizedKB, message, "danger" );
		console.log( err );
	    }
	}
	$( "#newModal" ).modal('hide');
    };
    create_form( header, "shortcut", jf );
    jQuery.each(path, function(j,v) {    
	// link to datalists for class instances
	if ( onto[ v.s.id ].type == "class" ) {
	    $( "#newModal input[name='s"+(j+1)+"']" ).attr( "list", onto[ v.s.id ].about );
	}
	if ( onto[ v.o.id ] && onto[ v.o.id ].type == "class" ) {
	    $( "#newModal input[name='o"+(j+1)+"']" ).attr( "list", onto[ v.o.id ].about );
	}
	// assist populating forms
	if ( v.s.svalue ) {
	    svalue[ v.s.name ] = v.s.svalue;
	    $( "#newModal input[name='"+v.s.name+"']" ).val('');
	    $( "#newModal input[name='"+v.s.name+"']" ).attr( "readonly", "readonly" );
	    $( '#newModal input[name="'+v.s.svalue+'"]' ).change(function() {
		$( '#newModal input[name="'+v.s.name+'"]').val($(this).val());
	    });
	}
	if ( v.o.svalue ) {
	    svalue[ v.o.svalue ] = v.o.name;
	    $( "#newModal input[name='"+v.o.name+"']" ).val('');
	    $( "#newModal input[name='"+v.o.svalue+"']" ).attr( "readonly", "readonly" );
	    $( '#newModal input[name="'+v.o.name+'"]' ).change(function() {
		$( '#newModal input[name="'+v.o.svalue+'"]').val($(this).val());
	    });
	}
    });
    $( "#newModal" ).modal('show');

}

/*
  TODO:
  * can I use the utilities.js ?task= parsing to do url parsing, e.g. .../kb-...?edit or ?view etc.?
  * provide option to add references to source materials/text locations etc. in the model (comments? generic?)
  * allow for adding an indication of the level of certainty to a statement (is this generic?)
*/

// backend functions

// view a graph (load serialized "kbURI" into RDF kb)
function mod_load_graph ( kbURI ) {
    
    var message;
    // kbURI is either a draft graph ("kb-...") or a published graph ("pkb-...")
    storedURI = base+((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?"submitted/":"resources/models/")+kbURI.substr(kbURI.lastIndexOf('/')+1)+".nt";
    var fetch = $rdf.fetcher(kb);
    fetch.nowOrWhenFetched(storedURI, {withCredentials:false}, function(ok, body, xhr){
	if (ok) {
	    console.log( "serialized graph loaded: "+kbURI+" ("+kb.length+" triples)" );
	    message = ``;
	    mod_display( kb, message, "success" );
	} else {
	    console.log( "serialized graph not loaded: "+xhr.statusText );
	    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
	    mod_home( message, "danger" );
	}
    });

}

// edit/fork a graph (load RDF kb into a "localized" kb)
function mod_edit_graph ( kbURI ) {

    var message;
    localizedKB = kb;
    var newontoid = uuidv4();
    // localizedKBURI is either an edited draft graph ("kb-...") or a forked graph
    localizedKBURI = ((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?kbURI:base+"submitted/"+"kb-"+newontoid);
    console.log( "localized graph created: "+localizedKBURI+" ("+localizedKB.length+" triples)" );
    // edited
    if (localizedKBURI == kbURI) {
	message = `<b>Success!</b> You are editing your model: &lt;`+localizedKBURI+`&gt;.<br/> <em>Remember:</em> You must <em>publish</em> your model to make it available to everybody!`;
	mod_display( localizedKB, message, "success" );
    // forked
    } else {
	message = `<b>Success!</b> The model has been successfully forked to: &lt;`+localizedKBURI+`&gt;.<br/> <em>Remember:</em> You must <em>publish</em> your fork to make it available to everybody!`;
	new_model( 'fork' );
    }

// TODO: -delete-
//    mod_run_tests();
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
		success: function() { 
		    console.log("serialization created: "+localizedKBURI); 
		},
		error: function() { 
		    console.log ("serialized graph not uploaded."); 
		    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		    show_alert_mod( message, "danger" );
		}
	    });
	} else {
	    console.log ("serialized graph not uploaded."); 
	    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
	    show_alert_mod( message, "danger" );
	}
    });

}

// function to safely address IDs containing dots etc.
function jqu( myid ) {

    return myid.replace( /(:|\.|\[|\]|,|=|\/)/g, "\\$1" );

}

// function to return the namespaced version of an IRI
function nsv( myiri ) {

    var matchedNS;
    jQuery.each( NS, function( index, value ) {
	if ( myiri.indexOf( NS[index]().uri ) == 0 ) { 
	    matchedNS = index;
	    return false;
	}
    });
    return ((matchedNS)?myiri.replace( NS[matchedNS]().uri, matchedNS+":" ):false);

}

// onchange update UI from KB
function refresh_graph () {

    var dataList = {}, dataListLabel = {};
    // read entire graph
    var statements = localizedKB.statementsMatching( undefined, undefined, undefined );
    statements.forEach(function(statement) {
	// populate datalists for all class instances
	if ( statement.predicate.value == NS["rdf"]("type").value ) {
	    if (! dataList[ statement.object.value ] ) { dataList[ statement.object.value ] = []; }
	    dataList[ statement.object.value ].push( statement.subject.value );
	    dataListLabel[ statement.subject.value ] = localizedKB.any( statement.subject, NS["skos"]('prefLabel'), undefined );
	}
	// ...
	
    });

    // create datalists for all class instances
    // TODO: there is an issue here, in that a selection from a datalist has knock-on effects, i.e. if a datalist
    //       value is selected then the properties of that instance need to be honoured, e.g. a "Flight from Paris"
    //       as a move MUST always have the same target of the move or else it's not the same move, these 
    //       dependencies should really be set automatically as there is a serious potential for errors

    // TODO: - I need to ingest a number of key vocabularies, at least for the 5 core categories, so that modelling
    //         like this becomes possible:
    //
    //         aac:young_women_picking_fruit a crm:E22_Man-Made_Object;
    //             crm:P2_has_type aat:300033618 .
    //
    //         especially, every term should get (at least) two triples in the triplestore, like this:
    //             aat:300033618 skos:inScheme aat: ;
    //                 skos:prefLabel "Painting" ;
    //                 rdfs:label "Painting" .
    //         but also (in the case of relators, for example) notation, definition, etc. 
    //         e.g. lcr:, lcs:, lct:, lcg:, lcn:, aac:, tgn:, geonames:, ...
    //         -> all vocabularies that are defined as SKOS concepts can be used as object properties,
    //         this will have the advantage of being able to prefill the E55_Type part of all the shortcuts
    //         -> will need types for: crm:E53_Place; crm:E70_Thing; crm:E89_Propositional_Object,crm:E24_Physical_Man-Made_Thing, crm:E18_Physical_Thing, crm:E57_Material; crm:E39_Actor, crm:E21_Person, crm:E74_Group; crm:E5_Event, crm:E7_Activity
    //         -> this can be done as part of the parseonto.pl script to produce a vocabulary LOD file that
    //         can be used to populate the datalists based on the expected type
    //         -> BUT at the moment I identify datalists via the CRM class name, in the case of type that would
    //         result in a default datalist of http://www.cidoc-crm.org/cidoc-crm/E55_Type, which isn't helpful,
    //         so I need a separate mechanism for that (maybe just attach the type of type to the URI, e.g.
    //         http://www.cidoc-crm.org/cidoc-crm/E55_Type:E39_Actor ?
    //         -> Can I have a vocab named graph that could be pre-loaded (one-off) and instances of which could 
    //         then be used to create the datalists depending on the type of E55 it is, and any instances that are
    //         referenced are added to the localizedgraph (needs checking types are not added more than once to 
    //         localizedgraph) 
    var newDataLists = `<div class="datalists">`;
    jQuery.each( dataList, function( index, value ) {
	newDataLists += `<datalist id="`+index+`">`;
	jQuery.each( dataList[ index ], function( index2, value2 ) {
		newDataLists += `<option data-value="`+value2+`">`+dataListLabel[ value2 ]+`</option>`;
	});
	newDataLists += `</datalist>`;
    });
    newDataLists += `</div>`;
    $( "div.datalists" ).replaceWith( newDataLists );
    // ...
    
}

// save work before leaving page unintentionally ~ this should never happen!
$( window ).on('beforeunload', function() {
    if (localizedKBURI) { mod_save_graph( localizedKBURI ); }
});

// define startsWith(), endsWith()
if (!String.prototype.startsWith) {

    String.prototype.startsWith = function(searchString, position) {
	position = position || 0;
	return this.indexOf(searchString, position) === position;
    };

}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len) {
	if (this_len === undefined || this_len > this.length) {
	    this_len = this.length;
	}
	return this.substring(this_len - search.length, this_len) === search;
    };
}
_.mixin({
    capitalize: function(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
    }
});

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

// show message alert
function show_alert_mod( message, type ) {

    if ( message != '' ) {
	var countdown = MAX = 5;
	$( "#modelling" ).prepend(`
<div class="modal fade" id="modConfirm" tabindex="-1" role="dialog" aria-labelledby="modConfirmTitle" aria-hidden="true">
    <div class="modal-dialog modal-lg alert alert-`+type+`">
        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>
	<div>`+message+`</div>
	<br />
	<div>CLOSING in <span class="bold px15" id="secCD">5</span> seconds...</div>
    </div>
</div>
				  `);
	$("#modConfirm").modal('show');
	//setting the interval.  1000ms = 1 second callback intervals
	var intervalID = window.setInterval(function () {
	    countdown -= 1;
	    $("#secCD").html(countdown);  //adjust the ticker visually
	    if (countdown == 0) {
		//closes the dialog...which in turn fires the the modalclose event.
		$("#modConfirm").modal("hide");  
		window.clearInterval(intervalID);
		$("#secCD").html(MAX);
		countdown = MAX;
	    }
	}, 1000);
    }
}
function show_alert_div( message, type ) {

    if ( message != '' ) {
	var countdown = MAX = 15;
	$( "#message" ).html(`<div class="alert alert-`+type+` alert-dismissible">
			     <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>
			     <div>`+message+`</div>`);
	var intervalID = window.setInterval(function () {
	    countdown -= 1;
	    if (countdown == 0) {
		//closes the dialog...which in turn fires the the modalclose event.
		$( "#message .alert" ).fadeOut();
		window.clearInterval(intervalID);
		countdown = MAX;
	    }
	}, 1000);
    }

}

// KB display
function mod_display( graph, message, type ) {

    var mod_tit, mod_ver;
    if ( localizedKBURI ) {
	var ontomd = localizedKB.any( undefined, NS["rdf"]("type"), NS["owl"]("Ontology") );
	var mod_tit = localizedKB.any( $rdf.sym( ontomd.uri ), NS["skos"]("prefLabel"), undefined );
	var mod_ver = localizedKB.any( $rdf.sym( ontomd.uri ), NS["dct"]("isVersionOf"), undefined );
    } else {
	var ontomd = graph.any( undefined, NS["rdf"]("type"), NS["owl"]("Ontology") );
	var mod_tit = graph.any( $rdf.sym( ontomd.uri ), NS["skos"]("prefLabel"), undefined );
	var mod_ver = localizedKB.any( $rdf.sym( ontomd.uri ), NS["dct"]("isVersionOf"), undefined );
    }
    $( "#modelling" ).html('').append( `<div id="message"/>` );
    show_alert_mod( message, type );
    $( "#modelling").
	append(`
	  <div id="mod_view">
	    <header id="mod_head"><h1>`
	       + mod_tit +
	       ((mod_ver)?" <small>forked from <a dataid='"+mod_ver+"'>"+mod_ver+"</a></small>":"")+
	   `</h1></header>
	    <div class="mod_content">
	      <div class="mod_columns">
	        <div id="mod_cy"/>
	        <div id="mod_ctl">
	          <div id="mod_ctl_nav"/> 
	          <div id="mod_ctl_sel"/> 
	        </div>
	      </div>
	    </div>
	  </div>
	       ` );

    $.each( fcr, function(i,v) {
	ontofcr[i] = {};
	ontofcr[i].text = v.label;
	ontofcr[i].nodes = [];
	$.each( v.contents, function(i2,v2) {
	    ontofcr[i].nodes[i2] = {};
	    ontofcr[i].nodes[i2].text = v2.label;
	    ontofcr[i].nodes[i2].nodes = [];
	    $.each( v2.contents, function(i3,v3) {
		ontofcr[i].nodes[i2].nodes[i3] = {};
		ontofcr[i].nodes[i2].nodes[i3].text = v3.label.replace(/<\/?b>/gi, '');
		ontofcr[i].nodes[i2].nodes[i3].href = "#"+v3.id;
	    });
	});
    });
    if ( localizedKBURI ) {
	$( "#mod_head" ).append(`<div class="datalists"/>`);
    	$( "#mod_head" ).append(`<div><button type="button" class="btn btn-primary" id="noughtstep">Add shortcut</button> <button type="button" class="btn btn-primary" id="thirdstep">Save &amp; Close model</button> <button type="button" class="btn btn-primary" id="fifthstep">Publish model</button></div>`);
	refresh_graph();
    } else {
    	$( "#mod_head" ).append(`<div><button type="button" class="btn btn-primary" id="secondstep">Fork model</button> <button type="button" class="btn btn-primary" id="sixthstep">Close model</button></div>`);	
    }
    $( "#mod_ctl_nav" ).append( `
        <div class="panel-group" role="tablist" aria-multiselectable="true">
            <div class="panel">
	        <div class="panel-heading" role="tab" id="headingOne">
		    <div class="panel-title">
		        <a role="button" data-toggle="collapse" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">Templates</a>
		    </div>
		</div>
		<div id="collapseOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne" aria-expanded="false">
	            <div class="panel-body">
		    </div>
		</div>
	    </div>
            <div class="panel">
	        <div class="panel-heading" role="tab" id="headingTwo">
		    <div class="panel-title">
			    <a role="button" data-toggle="collapse" href="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">Shortcuts</a>
		    </div>
		</div>
		<div id="collapseTwo" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingTwo" aria-expanded="false">
	            <div class="panel-body">
			    <label for="input-search2" class="sr-only">Search Shortcuts:</label>
			    <input type="input" class="form-control" id="input-search2" placeholder="Type 3+ characters to highlight..."/>
			    <div id="search-output2"></div><div id="treeview-ontofcr">
			    </div>
		    </div>
		</div>
	    </div>
            <div class="panel">
	        <div class="panel-heading" role="tab" id="headingThree">
		    <div class="panel-title">
			    <a role="button" data-toggle="collapse" href="#collapseThree" aria-expanded="true" aria-controls="collapseThree">Taxonomy</a>
		    </div>
		</div>
		<div id="collapseThree" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingThree" aria-expanded="false">
	            <div class="panel-body">
		        <div>
			    <label for="input-search" class="sr-only">Search Classes:</label>
			    <input type="input" class="form-control" id="input-search" placeholder="Type 3+ characters to highlight..."/>
			    <div id="search-output"></div><div id="treeview-ontohier"/>
			</div>
		    </div>
		</div>
	    </div>
        </div>
			    ` );
    // TODO
    //   * templates (book, person, place, terms, ...)
    //   * book (author, date, publisher/printer, place, type, language, ID)
    //   * person (role, books, names, bio, external links, ID)
    //   * place (books, persons, ID)
    //   * terms (book type [original, collection, adaptation], languages, ID)
    
    // Ontodia: tools
    //   * allow change of layout(?)
    //   * zoom in/out
    //   * reset/center position
    //   * export (Canvas/SVG)
    //   * print
    //   * help
    // Ontodia: layout
    //   * classes/instance (left)
    //   * connections (right)
    //   * instance tools (delete, properties, filter, expand)

    // Basic idea:
    //   - there will be a viewing (view/close) and an editing (new/fork/edit/add/save/publish) mode
    //   - the editing mode will have predefined instances, fundamental relationships, and all classes,
    //     and will assist the user by predefined forms, pathways, and showing all direct and inherited
    //     properties from any selected class or connected classes (on a secondary display)
    //   - the viewing mode will be entirely powered by the instances and properties used by the model,
    //     it will allow for a close inspection of the instances (incoming/outgoing statements, filtering...)
    //     and their properties, it will be powered by the graph alone (similar info to secondary display above)

    $('#treeview-ontofcr').treeview( {data: ontofcr, expandIcon:'glyphicon glyphicon-chevron-right', collapseIcon:'glyphicon glyphicon-chevron-down', enableLinks:true, levels:1, selectedBackColor:'#fff', selectedColor:'#333', backColor:'#e1f1fd', onhoverColor:'' });
    $('#treeview-ontohier').treeview( {data: ontohier, expandIcon:'glyphicon glyphicon-chevron-right', collapseIcon:'glyphicon glyphicon-chevron-down', enableLinks:true, levels:3, selectedBackColor:'#fff', selectedColor:'#333', onhoverColor:'' });
    $( "#mod_cy" ).append( `<div id="cy"><div class="cytoscape-navigator"/></div>` );
    var data = createCYJSON( graph );
    createCYgraph( graph, data );
}


// display taxonomy labels
$(document).popover({
	trigger: "hover",
	html: true,
	animation: false,
	container: "body",
	placement: "left auto",
	viewport: "#modelling",
	selector: "#treeview-ontohier li a,#mod_ctl_sel_res li a.relsLink",
	title: function() {
	    return ( onto[ nsv( $(this).attr("href") ) ].label + " ("+nsv( $(this).attr("href") )+")" );
	},
	content: function() {
	    return ( ((onto[ nsv( $(this).attr("href") ) ].comment && onto[ nsv( $(this).attr("href") ) ].comment != '\n')?onto[ nsv( $(this).attr("href") ) ].comment.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'):"<p>[No scope note available.]</p>") );
	}
    });

// treeView searching
var search = function(e) {
    var pattern = $('#input-search').val();
    if ( pattern.length < 3 ) return;
    var options = {
	ignoreCase: true,
	exactMatch: false,
	revealResults: true
    };
    var results = $("#treeview-ontohier").treeview('search', [ pattern, options ]);
}
var search2 = function(e) {
    var pattern = $('#input-search2').val();
    if ( pattern.length < 3 ) return;
    var options = {
	ignoreCase: true,
	exactMatch: false,
	revealResults: true
    };
    var results = $("#treeview-ontofcr").treeview('search', [ pattern, options ]);
}
$(document.body).on('keyup', '#input-search', search);
$(document.body).on('keyup', '#input-search2', search2);
$(document.body).on('click', '.shortcutLink', function(e) {
    var path = retrieve_fcr_path( $(this).data("id") );
    create_shortcut( path[0],path[1] );
});
$(document.body).on('click', '#subj .relsLink', function(e) {
    e.preventDefault();
    $(".popover").remove();
    panel = create_TAX_res( $(this).data("id") );
    $( "#mod_ctl_sel" ).html( panel );
    $( "#mod_ctl_sel" ).fadeIn( "fast" );
    $( "#tax_subj" ).html( onto[ $(this).data("id") ].label );
    $( "#tax_pred" ).html( "[please choose a predicate]" );
    $( "#tax_obj" ).html( "[please choose an object]" );
    curr_stmt["s"] = $(this).data("id");
    curr_stmt["p"] = "";
    curr_stmt["o"] = "";
});
$(document.body).on('click', '#pred .relsLink', function(e) {
    e.preventDefault();
    $( ".popover" ).remove();
    $( "#pred ul" ).not( "#pred_choice" ).hide();
    $( "#pred_choice" ).html( `<li><a class="relsLink" data-id="`+$(this).data("id")+`" href="`+onto[ $(this).data("id") ].about+`">`+onto[ $(this).data("id") ].label+`</a> <i id="pred_undo" style="margin-left:20px;" class="fa fa-undo"></i>` ).show();
    $( "#tax_pred" ).html( onto[ $(this).data("id") ].label );
    curr_stmt["p"] = $(this).data("id");
    $( "#obj ul" ).not( "#obj_choice" ).hide();
    if ( $(this).data("dir") == "direct" ) {
	$( "#tax_obj" ).html( onto[ onto[ $(this).data("id") ].range ].label );
	$( "#obj_choice" ).html( `<li><a class="relsLink" data-id="`+onto[ $(this).data("id") ].range+`" href="`+onto[ onto[ $(this).data("id") ].range ].about+`">`+onto[ onto[ $(this).data("id") ].range ].label+`</a>` ).show();
	curr_stmt["o"] = onto[ $(this).data("id") ].range;
    } else {
	$( "#tax_obj" ).html( onto[ onto[ $(this).data("id") ].domain ].label );
	$( "#obj_choice" ).html( `<li><a class="relsLink" data-id="`+onto[ $(this).data("id") ].domain+`" href="`+onto[ onto[ $(this).data("id") ].domain ].about+`">`+onto[ onto[ $(this).data("id") ].domain ].label+`</a>` ).show();
	curr_stmt["o"] = onto[ $(this).data("id") ].domain;
    }
    $( "#rels_add" ).removeAttr("disabled");    
    if ( $(this).data("dir") == "inverse" ) {
	$( "#curr_stmt i" ).removeClass( "glyphicon-arrow-right" ).addClass( "glyphicon-arrow-left" );
    }
    
});
$(document.body).on('click', '#obj .relsLink', function(e) {
    e.preventDefault();
});
$(document.body).on('click', '#pred #pred_undo', function(e) {
    e.preventDefault();
    $( ".popover" ).remove();
    $( "#pred #pred_choice" ).hide();
    $( "#pred ul" ).not( "#pred_choice" ).show();
    $( "#pred_choice" ).html( `` );
    $( "#tax_pred" ).html( "[please choose a predicate]" );
    $( "#tax_obj" ).html( "[please choose an object]" );
    $( "#obj #obj_choice" ).html( `<li>[tbd]</li>`);
    $( "#rels_add" ).attr("disabled","disabled");
    if ( $( "#curr_stmt i" ).hasClass( "glyphicon-arrow-left" ) ) {
	$( "#curr_stmt i" ).removeClass( "glyphicon-arrow-left" ).addClass( "glyphicon-arrow-right" );
    }
    curr_stmt["p"] = "";
    curr_stmt["o"] = "";
});
$(document.body).on('click', '#rels_add', function(e) {
    e.preventDefault();
    var header = $( "#curr_head" ).clone();
    var path = [];
    path.push( { s: { name:"s1", id:curr_stmt["s"], stype:"string" }, 
		p: { name:"p1", id:curr_stmt["p"], stype:"string" },
		o: { name:"o1", id:curr_stmt["o"], stype:"string"}, req:true, rep:false } );
    path.push( { s: { name:"s2", id:curr_stmt["o"], stype:"string" }, 
		p: { name:"p2", id:"crm:P2_has_type", stype:"string" },
		o: { name:"o2", id:"crm:E55_Type", stype:"string"}, req:false, rep:false } );
    create_shortcut( header[0].innerHTML, path );
});
$(document.body).on('close.bs.alert', '#mod_ctl_sel_res', function () {
    $( "#mod_ctl_nav" ).fadeIn( "fast" );
});

// ontology editing
function triggerTreeLinkClick (e) {

    var link = e[0].href, panel, id;
    if ( link && !link.endsWith('#') ) {
	if ( link.startsWith( base ) ) {          // FCR
	    id = link.substr(link.indexOf('#')+1);
	    panel = create_FCR_res( id );

	} else if ( link.startsWith( 'http' ) ) { // Taxonomy
	    id = nsv( link );
	    panel = create_TAX_res( id );

	} else {                                  // Templates

	    panel = create_TPL_res( id );

	}
	// swap panels
	$( "#mod_ctl_nav" ).fadeOut( "fast", function () {
	    $( "#mod_ctl_sel" ).html( panel );
	    $( "#mod_ctl_sel" ).fadeIn( "fast" );
	    if ( !link.startsWith( base ) && link.startsWith( 'http' ) ) { // Taxonomy
		$( "#tax_subj" ).html( onto[ id ].label );
		$( "#tax_pred" ).html( "[please choose a predicate]" );
		$( "#tax_obj" ).html( "[please choose an object]" );
		curr_stmt = {};
		curr_stmt["s"] = id;
	    }
	});
    }

}

function create_FCR_res ( id ) {
    var paths, header, panel;
    $.each( fcr, function(i,v) {	    
	$.each( v.contents, function(i2,v2) {	    
	    $.each( v2.contents, function(i3,v3) {	    
		if ( v3.id == id ) {
		    header = v3.label;
		    paths = v3.contents;
		    return false;
		}
	    });
	});
    });
    panel = `
	<div class="panel panel-primary" id="mod_ctl_sel_res">
	<div class="panel-heading" role="tab" id="headingOne">
	`+header+` 
	<button type="button" class="close" data-target="#mod_ctl_sel_res" data-dismiss="alert"> <span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button></div>
	<div class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne" aria-expanded="false">
	<div class="panel-body">`+
        ((paths.length > 1)?`<p>Please choose the shortcut <em>best suited to express</em> the intended relationship:</p>`:`<p>This is the standard shortcut to <em>express</em> this relationship:</p>`);
    
    $.each( paths, function(i,v) {
	panel += `<p><a class="shortcutLink" title="[Spawns modal with statements to be filled in]"
	    data-id="`+v.id+`"><b>Shortcut `+(i+1)+`</b></a> (`+v.path.length+` statements):</p><ol>`;
	$.each( v.path, function(i2,v2) {
	    var porps = ``;
	    if ( Array.isArray( v2.p.id ) ) {
		$.each( v2.p.id, function(i,v) {
		    porps += onto[ v ].label+'/';
		});
	    } else {
		porps = onto[v2.p.id].label+" ";
	    }
	    panel += `<li>`+onto[v2.s.id].label+` <i class="glyphicon glyphicon-arrow-right"/> `+ porps.substring(0, porps.length - 1) +` <i class="glyphicon glyphicon-arrow-right"/> `+onto[v2.o.id].label+((v2.req)?"":" (optional)")+`</li>`;
        });
	panel += `</ol>`;
    });
    panel += `
	<p class="alert alert-info" role="alert" style="margin-top:15px;margin-right:15px;">If none of the shortcuts suits your particular situation, please consider using the full expressivity of the taxonomy, or <a href="mailto:info@eighteenthcenturypoetry.org" class="alert-link">let us know</a> about your modelling requirement, and we may be able to provide suggestions.</p><button type="button" class="btn btn-primary"" data-target="#mod_ctl_sel_res" data-dismiss="alert">Close</button>
	    </div>
	</div>
    </div>`;
    return panel;

}

function create_TAX_res ( id ) {
    var crels, prels, header, panel;
    curr_stmt["s"] = id;
    header = onto[ id ].label + " ("+ id +")";
    crels = retrieve_class_relationships( id );
    prels = retrieve_property_relationships( id );

    panel = `
            <div class="panel panel-primary" id="mod_ctl_sel_res">
	        <div class="panel-heading" role="tab" id="headingOne">
		    <b>Build a statement</b> 
		    <button type="button" class="close" data-target="#mod_ctl_sel_res" data-dismiss="alert"> <span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                </div>
		<div class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne" aria-expanded="false">
	            <div class="panel-body">`;
    panel += `
<p class="alert alert-info" role="alert" style="margin-top:5px;margin-right:15px;" id="curr_stmt">
<em><b>Current statement:</b></em><br/> <span id="curr_head"><span id="tax_subj"></span> <i class="glyphicon glyphicon-arrow-right"/> <span id="tax_pred"></span> <i class="glyphicon glyphicon-arrow-right"/> <span id="tax_obj"></span></span> &nbsp; &nbsp; 
<button id="rels_add" type="button" class="btn btn-sm btn-primary" disabled>Build</button>
</p>
<ul id="idmd"><li id="subj"><em>Subject (S):</em>
                <ul class="listBibl">
<li><b>Name:</b> `+header+`</li><li style="word-break:break-all;"><b>URI:</b> `+onto[ id ].about+`</li><li><b>Type:</b> `+_(onto[ id ].type).capitalize()+`</li><li><b>Description:</b> <a role="button" data-toggle="collapse" href="#collapseDesc" aria-expanded="false" aria-controls="collapseDesc">[show/hide]</a><div class="collapse listBibl" id="collapseDesc" style="text-indent:initial;">`+onto[ id ].comment.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2')+`</div></li><li><b>Superclasses:</b>
 <a role="button" data-toggle="collapse" href="#collapseSup" aria-expanded="false" aria-controls="collapseSup">[show/hide]</a><div class="collapse listBibl" id="collapseSup" style="text-indent:initial;"><ul>`;
            if ( crels[0].length+crels[1].length > 0 ) {
                if ( crels[0].length > 0 ) {
                    $.each( crels[0], function(i,v) {
                        panel += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>direct<span></li>`;
                    });
                }
                if ( crels[1].length > 0 ) {
                    $.each( crels[1], function(i,v) {
                        panel += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>inferred<span></li>`;
                    });
                }
            } else {
                panel += `<li style="margin-left:0">No superclasses of '`+onto[ id ].label+`'</li>`;
            }
	    panel += `</ul></div></li><li><b>Subclasses:</b>
 <a role="button" data-toggle="collapse" href="#collapseSub" aria-expanded="false" aria-controls="collapseSub">[show/hide]</a><div class="collapse listBibl" id="collapseSub" style="text-indent:initial;"><ul>`;

            if ( crels[2].length+crels[3].length > 0 ) {
                if ( crels[2].length > 0 ) {
                    $.each( crels[2], function(i,v) {
                        panel += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>direct<span></li>`;
                    });
                }
                if ( crels[3].length > 0 ) {
                    $.each( crels[3], function(i,v) {
                        panel += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>inferred<span></li>`;
                    });
                }
            } else {
                panel += `<li style="margin-left:0">No subclasses of '`+onto[ id ].label+`'</li>`;
            }
            panel += `</ul></div></li></ul>
</li>
<li id="pred"><br/><em>Predicate (P):</em><ul class="listBibl">`;
panel += `
<li><b>Properites</b> (direct: <em>S<i style="margin-left: 22px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/>P<i style="margin-left: 22px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/>O</em>):
 <a role="button" data-toggle="collapse" href="#collapsePropDR" aria-expanded="false" aria-controls="collapsePropDR">[show/hide]</a><div class="collapse listBibl" id="collapsePropDR" style="text-indent:initial;"><ul>`;
            if ( prels[0].length+prels[1].length > 0 ) {
                if ( prels[0].length > 0 ) {
                    $.each( prels[0], function(i,v) {
                        panel += `<li id="pred_`+i+`"><span style="width:100%;"><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="direct">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> `+((onto[ onto[ v ].range])?onto[ onto[ v ].range ].label:onto[ v ].range)+`</span></li>`;
                    });
                }
                if ( prels[1].length > 0 ) {
                    $.each( prels[1].sort(function(a, b) {
   return onto[ onto[ a ].domain ].label.toUpperCase().localeCompare(onto[ onto[ b ].domain ].label.toUpperCase()); } ), function(i,v) {
                        panel += `<li id="pred_`+v+`"><span style="width:100%;">`+onto[ onto[ v ].domain ].label+` <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> <a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="direct">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> `+((onto[ onto[ v ].range])?onto[ onto[ v ].range ].label:onto[ v ].range)+`</span></li>`;
                    });
                }
            }
panel += `
</ul></div></li><li><b>Properites</b> (inverse: <em>S<i style="margin-left: 22px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/>P<i style="margin-left: 22px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/>O</em>):
 <a role="button" data-toggle="collapse" href="#collapsePropRD" aria-expanded="false" aria-controls="collapsePropRD">[show/hide]</a><div class="collapse listBibl" id="collapsePropRD" style="text-indent:initial;"><ul>`;
            if ( prels[2].length+prels[3].length > 0 ) {
                if ( prels[2].length > 0 ) {
                    $.each( prels[2], function(i,v) {
                        panel += `<li id="pred_`+i+`"><span style="width:100%;"><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="inverse">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/> `+onto[ onto[ v ].domain ].label+`</span></li>`;
                    });
                }
                if ( prels[3].length > 0 ) {
                    $.each( prels[3].sort(function(a, b) {
   return onto[ onto[ a ].domain ].label.toUpperCase().localeCompare(onto[ onto[ b ].domain ].label.toUpperCase()); }), function(i,v) {
                        panel += `<li id="pred_`+v+`"><span style="width:100%;">`+onto[ onto[ v ].range ].label+` <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/> <a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="inverse">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/> `+onto[ onto[ v ].domain ].label+`</span></li>`;
                    });
                }
            }
panel += `</ul></div></li></ul><ul class="listBibl" id="pred_choice"></ul>
</li>
<li id="obj"><br/><em>Object (O):</em><ul class="listBibl">
<li>[tbd]</li>
</ul><ul class="listBibl" id="obj_choice"></ul>

</li>
</ul>
		<p class="alert alert-info" role="alert" style="margin-top:15px;margin-right:15px;">Please <a href="mailto:info@eighteenthcenturypoetry.org" class="alert-link">let us know</a> if you have difficulties expressing what you want to capture, and we may be able to provide suggestions.</p><button type="button" class="btn btn-primary"" data-target="#mod_ctl_sel_res" data-dismiss="alert">Close</button>
		    </div>
		</div>
	    </div>`;
	    return panel;

} 

function create_TPL_res ( id ) {


} 

function retrieve_class_relationships( clid ) {

    var supercl = {}, subcl = {}, cache = [];
    supercl["direct"] = []; supercl["indirect"] = [];
    subcl["direct"] = []; subcl["indirect"] = [];

    // retrieve direct and inferred superclasses
    if ( onto[ clid ].superclass ) {
	supercl["direct"] = onto[ clid ].superclass.slice(0);
	cache = onto[ clid ].superclass.slice(0);
    }
    while( cache.length > 0 ) {
	var current = cache.shift();
	if ( onto[ current ].superclass ) {
	    cache = cache.concat( onto[ current ].superclass );
	    supercl["indirect"] = supercl["indirect"].concat( onto[ current ].superclass );
	}
    }
    supercl["indirect"] = _.uniq( supercl["indirect"] );
    // retrieve direct and inferred subclasses
    if ( onto[ clid ].subclass ) {
	subcl["direct"] = onto[ clid ].subclass.slice(0);
	cache = onto[ clid ].subclass.slice(0);
    }
    while( cache.length > 0 ) {
	var current = cache.shift();
	if ( onto[ current ].subclass ) {
	    cache = cache.concat( onto[ current ].subclass );
	    subcl["indirect"] = subcl["indirect"].concat( onto[ current ].subclass );
	}
    }
    subcl["indirect"] = _.uniq( subcl["indirect"] );
    return [ supercl["direct"], supercl["indirect"], subcl["direct"], subcl["indirect"] ];

}

function retrieve_property_relationships( clid ) {

    var clidrange = {}, cliddomain = {};
    clidrange["direct"] = []; clidrange["indirect"] = [];
    cliddomain["direct"] = []; cliddomain["indirect"] = [];

    // retrieve direct properties
    $.each( onto, function( i,v ) {
        if ( v.type == "property" ) {
            if ( v.domain == clid ) {
                cliddomain["direct"].push( i );
            }
	    if ( v.range == clid ) {
                clidrange["direct"].push( i );
            }
        }
    });
    // retrieve inferred properties
    $.each( onto, function( i,v ) {
	if ( onto[ clid ].superclass ) {
	    $.each( onto[ clid ].superclass, function( i2,v2 ) {
		if ( v.type == "property" ) {
		    if ( v2 == v.domain ) {
			cliddomain["indirect"].push( i );
		    }
		    if ( v2 == v.range ) {
			clidrange["indirect"].push( i );
		    }
		}
	    });
	}
    });
    cliddomain["indirect"] = _.uniq( cliddomain["indirect"] );
    clidrange["indirect"] = _.uniq( clidrange["indirect"] );

    return [ cliddomain["direct"],cliddomain["indirect"],clidrange["direct"],clidrange["indirect"] ];

}

// TODO
//  * required functionality:
//    5. identify/retrieve any individuals of the selected class(es)


// Cytoscape functions
function createCYJSON( graph ) {

    var jsonObj=[], nodes_seen=[];
    graph.match(undefined, undefined, undefined).forEach( st => {
	var s = st.subject;
	var p = st.predicate;
	var o = st.object;

	// TODO: 
	// - filtering according to s/p/o.termType = BlankNode, NamedNode, or Literal,
	// - only instances (domain and range) should be processed as nodes with edges, nonexistent targets
	//   such as "... a crm:E9_Move" should be treated as data properties in the sense of determining the
	//   popper template similar to ontodia and the colouring scheme and as metadata (data properties)
	// - only model-internal object properties should be processed here, seeAlso's, sameAs's and data 
	//   properties should be put in a "popper popup" (as metadata)
	// - KB admin data about ontology and creator need to be filtered out first as well
	// - how to deal with blanknodes? will there be any?
	// - also needs filtering by main classes to apply colour schemeing to both instances (colour of
	//   node frame) and outgoing statements (incoming ones will have the colour of the instance of 
	//   origin)
	// - not just nodes can be colour-coded, but edges can be too! [outgoing edges could be the colour of the node 
	//   (domain), incoming edges the colour of the originating node (range)]
	// - check browser console to track down errors cast by CY and resolve them
	// - create the graph according to the modelled instances, a I1 Argumnet will need to be a compound node,
	//   as it has required constituent nodes (is that the only example?)
	// - I need to create a complete set of poppers based on the graph properties here, is it possible to style 
	//   poppers sufficiently or is greater integration required? How?

	// process node (s)
	if ( typeof nodes_seen[s.value] == 'undefined' ) { // count each instance once
	    nodes_seen[s.value] = 1;
	    var node = {};
	    node["data"] = { "id" : s.value };
	    node["classes"] = "node";
	    var res = graph.any( s, NS["skos"]('prefLabel'), undefined );
	    if ( res ) {
		node["data"]["name"] = res.value ;
	    } else { 
		var res = graph.any( s, NS["rdfs"]('label'), undefined );
		if ( res ) {
		    node["data"]["name"] = res.value ;
		} else {
		    console.log( "Error: "+s.value+" has no label" ); 
		}
	    }
	    jsonObj.push( node );
	}
	// process edge (p)
	var edge = {};
	edge["data"] = { "source" : s.value };
	console.log( "p.value = "+p.value );
	edge["data"]["name"] = ((onto[ nsv(p.value) ])?onto[ nsv(p.value) ].label:p.value);
	// deal with differen types here: nobes, blanks, literals (switch?)
	if ( o.termType == "NamedNode" ) {
	    edge["data"]["target"] = o.value ;
	    edge["classes"] = "edge";
	    jsonObj.push( edge );
	} else { 
	    console.log( "Error: "+o.value+" has type "+o.termType ); 
	}

    });
//    console.log( JSON.stringify( jsonObj ) );
    return( jsonObj );

}

function createCYgraph( graph, data ) {

    /* TODO
       - use https://github.com/cytoscape/cytoscape.js-popper in combination with a 
         'round-rectangle' shape to mimic an ontodia-style element, overlay the HTML
         on the shape of the node, by giving both the same size
       - a popper needs to be created for each and every node, so they will ideally 
         need a common class .popper, so I can remove them all in one go when 
	 cleaning up 
       - needs to apply to both single and compound nodes
       - can use node[name="..."] to style individual nodes, or classes
     */

    var cy = cytoscape({
	container: $('#cy'),
	elements: data,
	layout: {
	    name: 'cola',
	    fit: false,
	    maxSimulationTime: 8000,
	    edgeLength: function( edge ){var len = parseInt(500 / edge.data('weight')); return len; },
	    nodeSpacing: function( node ){ return 300; },
	},
	style: [ // the stylesheet for the graph
		 // use node/edge selectors from JSON to customize (and feed styles into popper below
	    {
		selector: 'node',
		style: {
		    'shape': 'rectangle',
		    'background-color': '#eee',
		    'label': 'data(name)',
		}
	    },
            {
		selector: 'edge',
		style: {
		    'width': 3,
		    'curve-style': 'unbundled-bezier',
		    'line-color': '#dfd',
		    'target-arrow-color': '#dfd',
		    'target-arrow-shape': 'triangle',
		    'target-arrow-fill': 'filled',
		    'label': 'data(name)',
		    'edge-text-rotation': 'autorotate',
		}
	    },
	],
	wheelSensitivity: .5,
    });

    // TODO need to customize poppers here
    var node = cy.nodes().last();
    // get first owl:sameAs statement in instance
    var auth = NS[""]("ThomasGray");
    var auth_info = graph.any( auth, NS["owl"]('sameAs'), undefined );
    // retrieve WikiData wdt:P18 (image) of entity
    var retrieve_wd = wd_ent_query( $rdf.sym( auth_info.uri ), NS["wdt"]("P18") );
    var popper = node.popper({
	content: () => {
	    var div = document.createElement('div');
	    //	    div.innerHTML = 'Sticky Popper content';
	    // TODO: need to align size of popper with size of node so it's clickable when offset underneath...
	    div.innerHTML = `
	    <div class="ontodia-overlayed-element" data-element-id="element_0" tabindex="0"><div class="ontodia-default-template" data-expanded="false" style="background-color: rgb(203, 184, 110); border-color: rgb(203, 184, 110);"><div class="ontodia-default-template_type-line" title="Thomas Gray"><div class="ontodia-default-icon ontodia-default-template_type-line__icon" aria-hidden="true"></div><div title="Actor, Concept, Person" class="ontodia-default-template_type-line_text-container"><div class="ontodia-default-template_type-line_text-container__text">Actor, Concept, Person</div></div></div><div class="ontodia-default-template__thumbnail"><img src="` + retrieve_wd + `"></div><div class="ontodia-default-template_body" style="border-color: rgb(203, 184, 110);"><span class="ontodia-default-template_body__label" title="Thomas Gray">Thomas Gray</span></div></div></div>
`;
	    document.getElementById("cy").appendChild( div );
	    return div;
	},
	popper: {
	    placement:'auto',
	    positionFixed:true,
	    removeOnDestroy:true,
	    modifiers: {
		preventOverflow: { boundariesElement: document.getElementById("cy") },
	    }
	} // my popper options here
    });

    var update = () => {
	popper.scheduleUpdate();
    };
    node.on('position', update);
    cy.on('pan zoom resize', update);

    cy_var["nav"] = cy.navigator({ container:document.getElementsByClassName("cytoscape-navigator")[0] });
    cy.panzoom();

}




// TODO: -delete-
// below this line will be obsolete -- delete

// run some tests
function mod_run_tests () {

    // testing setup
    var subj = NS[""]("BagOfPropositionsForJoshuaSwidzinskisScholarlyAssessmentOfThomasGraysImitations-2");
    var pers = NS[""]("JoshuaSwidzinski");
    var auth = NS[""]("ThomasGray");

    // the function $rdf.sym creates a node out of any URI, use as
    //    var subj = $rdf.sym( "https://www.eighteenthcenturypoetry.org/resources/models/#ThomasGray" );
    // or easier (as above) when the NS is known
    //    var subj = NS[""]("ThomasGray");
    // there are also $rdf.bnode(), .literal(), .list([n1,n2]) to add blank nodes, literals and collections of nodes
    
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
    var query = "PREFIX : <https://www.eighteenthcenturypoetry.org/resources/models/#> \n"+
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
    var body = `@prefix : <https://www.eighteenthcenturypoetry.org/resources/models/#> .
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
	var body = `@prefix : <https://www.eighteenthcenturypoetry.org/resources/models/#> .
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
