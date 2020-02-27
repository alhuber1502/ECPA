
// Modelling


// global graphs
var kb, kbURI, localizedKB, localizedKBURI;

// base
var base = location.protocol+"//"+location.hostname+"/";

// global variables
var mod_ft = 1, triples_pre, ontofcr = [], cy, cy_var = {}, curr_stmt = {}, new_id;

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
NS["crmsci"] = $rdf.Namespace("http://www.ics.forth.gr/isl/CRMsci/");
NS["frbroo"] = $rdf.Namespace("http://iflastandards.info/ns/fr/frbr/frbroo/");
NS["dct"]    = $rdf.Namespace("http://purl.org/dc/terms/");
NS["skos"]   = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
NS["viaf"]   = $rdf.Namespace("http://viaf.org/viaf/");
NS["link"]   = $rdf.Namespace("http://www.w3.org/2007/ont/link#");
NS["lcs"]    = $rdf.Namespace("http://id.loc.gov/authorities/subjects/");
NS["lcn"]    = $rdf.Namespace("http://id.loc.gov/authorities/names/");
NS["lcr"]    = $rdf.Namespace("http://id.loc.gov/vocabulary/relators/");
NS["lct"]    = $rdf.Namespace("http://id.loc.gov/vocabulary/resourceTypes/");
NS["lcg"]    = $rdf.Namespace("http://id.loc.gov/authorities/genreForms/");

// colour coding
var bgcolor = {};

bgcolor["crm"] = "#e1f1fd";
bgcolor["crminf"] = "#c1d8f0";
bgcolor["crmsci"] = "#c1d8f0";
bgcolor["frbroo"] = "#c8d9ed";

bgcolor["crminf:I1_Argumentation"] = "#005b96";
bgcolor["crminf:I2_Belief"] = "#6497b1";
bgcolor["crminf:I4_Proposition_Set"] = "#b3cde0";

bgcolor["crm:E73_Information_Object"] = "#e7eff6";
bgcolor["crm:E52_Time-Span"] = "#e0d0d6";
bgcolor["crm:E67_Birth"] = "#d0d0c6";
bgcolor["crm:E69_Death"] = "#c0c0b6";
bgcolor["crm:E53_Place"] = "#b0b0a6";
bgcolor["crm:E65_Creation"] = "#a09096";
bgcolor["crm:E90_Symbolic_Object"] = "#b6c0c6";
bgcolor["frbroo:F32_Carrier_Production_Event"] = "#83d0c9";

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

// modelling home page
function mod_home( message, type ) {

    var avail_models = [];
    // default graph
    kb = $rdf.graph();
    localizedKB = $rdf.graph();
    localizedKBURI = undefined;
    if ( localizedKBURI || kbURI ) {
	location.hash = "#modelling";
    }
    if ( cy_var["nav"] ) { cy_var["nav"].destroy(); cy_var["nav"] = undefined; }
    $( "#cy" ).remove();

    // home page scaffolding
    $( "#modelling" ).html('').append( `<div id="message"/>` );
    show_alert_div( message, type );
    $( "#modelling").append( `<img src="/images/screenshots/modelling_bg.png" style="float:right; width:600px; border:1px solid #ddd; margin: 0 0 15px 15px;" /><h1>Knowledge modelling</h1>` );
    $( "#modelling").append( `<p>This <em>view</em> contributes to a <b>Semantic Web of (digital) literary scholarship</b>.  It facilitates the creation, sharing, and long-term preservation of <em>formal knowledge models</em>, which communicate increasingly sophisticated scholarly analyses and discussions.  As such, the <em>models</em> in this <em>view</em> form a sustained and active contribution to the study of 18th-century poetry.</p>
			     <p>This prototype <em>modelling interface</em> sketches out the basic requirementss of a <em>thinking tool</em> that facilitates knowledge representation and visualization.  As the tool matures and the creation of formal knowledge models becomes second nature to humanists, we will be able to collectively reap the long-term benefits of formalized expert knowledge for reasoning, explication, and as starting points for new interpretive processes.` );

    /* currently checking for v.authors only, may want to change to v.works in future, available JSON includes, e.g.
       txt_id = "o4986-w0250"
       mod_work["o4986-w0250"] = { id: "o4986-w0250", title: "THE FATAL SISTERS: AN ODE.", work: "txt_GrayTh1716_wfsio" }

       aut_id = "pers00039"
       mod_auth["pers00039"] = { author: "aut_GrayTh1716", id: "pers00039", img: "GrayTh1716_NPG.jpg", name: "Thomas Gray", viaf: "9889965" }
    */
    $.each( mod_md, function (i,v) {
	    if ( _.contains( v.authors, aut_id.split( "|" )[0] ) ) {
		avail_models.push( i );
	    }
	});
    if ( avail_models.length > 0 ) {
	$( "#modelling").append( `<h2>Available <em>models</em> referencing this text (or its author)</h2>` );
	var mod_tbody = `<tbody>`; 
	avail_models.forEach(function( m ) {
		var d = new Date( eval( mod_md[m].date ) );
		mod_tbody += `<tr> <th scope="row"><a href="#" data-id="#/resources/models/`+mod_md[m].id+`" id="firststep">`+mod_md[m].id+`</a></th> <td>`+mod_md[m].title+(mod_md[m].fork?"<br/><small>forked from "+mod_md[m].fork:"")+`</td> <td>`+mod_md[m].creator+`</td> <td>`+d.toDateString()+`</td> <td><button type="button" class="btn btn-primary" data-id="#/resources/models/`+mod_md[m].id+`" id="firststep">View model</button></td> </tr>`; 
	    });
	mod_tbody += `</tbody> `;
	$( "#modelling").append( `<table class="table table-striped table-hover table-bordered" style="table-layout:fixed;margin-top:15px;width:initial;"><thead><tr><th width="10%">ID</th><th width="50%">Title</th> <th width="15%">Creator</th> <th width="15%">Date</th> <th width="10%"> Action</th> </tr> </thead> `+ mod_tbody + `</table>` );
	$( "#modelling" ).append(`<p>You can easily start your own knowledge model: `);	    
    } else { 
	$( "#modelling" ).append(`<br/><p><b>There are currently no knowledge models available for this work.</b>  But you can easily start your own: `);	
    }
    $( "#modelling" ).append(`<button type="button" class="btn btn-success" id="fourthstep">Create new model</button>`);

}

// export graph as image
function base64ToBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

// workflow functions

// view model
$(document.body).on('click', '#firststep', function() { kbURI = base+location.pathname.substring(1)+$( this ).data( "id" ); mod_load_graph( kbURI ); location.hash = $( this ).data( "id" ); });
// fork model
$(document.body).on('click', '#secondstep', function() { mod_edit_graph( kbURI ); });
// save model
$(document.body).on('click', '#thirdstep', function() { if ( mod_save_graph( localizedKBURI ) ) { var message = `<b>Success!</b> Continue working on your model any time at: &lt;`+localizedKBURI+`&gt;.<br/> <em>Remember:</em> You must <em>publish</em> your model to make it available to everybody!`; mod_home( message, "success" ); } });
// create model
$(document.body).on('click', '#fourthstep', function() { new_model( 'create' ); });
// publish model
$(document.body).on('click', '#fifthstep', function() { new_model( 'publish' ); });
// close model
$(document.body).on('click', '#sixthstep', function() { mod_home( '' ) });
// export model as PNG
$(document.body).on('click', '#seventhstep', function() { var b64key = 'base64,';
	var b64 = cy.png().substring( cy.png().indexOf(b64key) + b64key.length );
	var imgBlob = base64ToBlob( b64, 'image/png' );
	// see https://stackoverflow.com/questions/39168928/cytoscape-save-graph-as-image-by-button
	// uses https://github.com/eligrey/FileSaver.js/
	saveAs( imgBlob, 'ECPA-'+docname+'-graph.png' ); });
// export model as JSON
$(document.body).on('click', '#eighthstep', function() { var jsonBlob = new Blob([ JSON.stringify( cy.json() ) ], { type: 'application/javascript;charset=utf-8' });
	saveAs( jsonBlob, 'ECPA-'+docname+'-graph.json' ); });
// download model
$(document.body).on('click', '#ninthstep', function() {
	if ( mod_save_graph( localizedKBURI ) ) {
	    var storedURI = base+((localizedKBURI.substr(localizedKBURI.lastIndexOf('/')+1).startsWith('kb-'))?"submitted/":"resources/models/")+localizedKBURI.substr(localizedKBURI.lastIndexOf('/')+1)+".nt";
	    mod_display( localizedKB, '', "success" );
	    saveAs( storedURI, localizedKBURI.substr(localizedKBURI.lastIndexOf('/')+1)+".nt" );
	}
    });

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
    jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'>" } );
    if ( task == 'publish' ) {
	jf.form.push( { type:"htmlsnippet", value:"<p>Please <b>review</b> the information about your contribution and press <em>Publish model</em> to <b>submit the model</b> to <em>ECPA</em> for integrity checking and publication. <em>Thank you!</em> <em>N.B.</em> You will not be able to edit your model during this process.</p>" } );
    } else if ( task == 'fork' ) {
	jf.form.push( { type:"htmlsnippet", value:"<p>You are <b>forking</b> this model.  Please consider <b>offering</b> any changes back to the original model's creator.</p>" } );
    }
    jf.form.push( { key:"model" }, { key:"author" } );
    // submit/cancel buttons
    jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
    if ( task == 'create' ) {
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Create model"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );    
    } else if ( task == 'publish' ) {
	jf.form.push( { type:"htmlsnippet", value:"<p class='small'><em>Please note:</em> By pressing the <em>Publish model</em> button, you agree to make your model <em>publicly available</em> under a <a class='external' target='_blank' href='https://creativecommons.org/licenses/by-nc-sa/4.0/'>CC BY-NC-SA 4.0</a> license.</p>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Publish model"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
    } else {
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Fork model"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );    
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
	    var triples = triples_pre, saved = {};
	    // KB header
	    triples += `\n`+NS[""](graphid)+` a owl:Ontology ;\n`;
	    triples += `skos:prefLabel """`+values.model.title+`""" ;\n`;
	    triples += `rdfs:comment """`+values.model.desc+`""" ;\n`;
	    if ( task == 'create' ) {
		triples += `dct:subject "https://www.eighteenthcenturypoetry.org/works/`+docname+`.shtml" ;\n`; 
		triples += `dct:created "`+$.now()+`" ;\n`; 
	    } else if ( task == 'publish' ) { 
		triples += `dct:license "https://creativecommons.org/licenses/by-nc-sa/4.0/" ;\n`;
		triples += `dct:date "`+$.now()+`" ;\n`; 
	    } else {
		triples += `dct:isVersionOf `+$rdf.sym( ontomd.uri )+` ;\n`;
		triples += `dct:created "`+$.now()+`" ;\n`;
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
	    $( "#newModal" ).modal('hide');
	    // insert triples into graph
	    try {
		localizedKBURI = base+location.pathname.substring(1)+"#/submitted/"+graphid;
		$rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		if ( task == 'publish' ) {
		    localizedKB.add( NS[""](graphid), NS["dct"]("created"), saved["created"].value );
		    localizedKB.add( NS[""](graphid), NS["dct"]("subject"), saved["subject"].value );
		    localizedKB.add( NS[""](graphid), NS["owl"]("versionInfo"), $rdf.literal( '1.0','' ) );
		    if ( mod_publ_graph( localizedKBURI ) ) {
			message = `<b>Success!</b> Your model has been submitted for publication. We will notify you when it becomes available. If you have any questions, please do not hesitate to <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">contact us</a>. <em>Thank you!</em>`;
			mod_home( message, "success" );
		    }
		} else if ( task == 'fork' ) {
		    localizedKB.add( NS[""](graphid), NS["dct"]("subject"), saved["subject"].value );
		    if ( mod_save_graph( localizedKBURI ) ) {
			message = `<b>Success!</b> The model has been successfully forked to: &lt;`+localizedKBURI+`&gt;.<br/> <em>Remember:</em> You must <em>publish</em> your fork to make it available to everybody!`;
			location.hash = "#/submitted/"+graphid;
			mod_display( localizedKB, message, "success" );
		    }
		} else { // create
		    if ( mod_save_graph( localizedKBURI ) ) {
			location.hash = "#/submitted/"+graphid;
			message = `<b>Success!</b> Your model is available for you at: &lt;`+localizedKBURI+`&gt;`;
			mod_display( localizedKB, message, "success" );
			$( "a[href='#mod_edit']" ).trigger( "click" ); // switch to editing mode
		    }
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
	$( '#newModal .modal-body input').val( '' );
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

// focus initial input on form
$(document.body).on('shown.bs.modal', "#newModal", function () {
	$("#jForm input:text, #jForm textarea").first().focus();
    });

// create a JSON Form
function create_form ( title, name, form ) {

    $( "body" ).prepend(`
			<div id="newModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newModalLabel">  
			<div class="modal-dialog modal-lg" role="document">
			<div class="modal-content">
			<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			<h4 class="modal-title">`+ title +`</h4>
			</div>
			<form name="`+name+`" id="jForm"/>`);
    $( "#newModal" ).after(`
			   </div>
			   </div>
			   </div>
			   `);
    $( "#jForm" ).jsonForm( form );

}

// create a FCR shortcut
function create_shortcut ( header, path ) {

    // JSON form
    var jf = new Object(), svalue = {}, message;
    jf.schema = {};
    jf.form = [];

    jf.schema["reification"] = { key:"reification", type:"boolean" };
    jf.schema["reification_title"] = { key:"reification_title", type:"string", title:"Title" };
    jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'>" } );
    jf.form.push( { type:"htmlsnippet", value:"<p><b>Please fill in</b> "+((path.length>1)?"these "+path.length+" statements":"this statement")+".</p>" }, { key:"reification_title", "onInsert": function (evt) {
		var flag2 = document.querySelectorAll('[class*="reification_title"]');
		flag2[0].style.display = "none";
	    }
	});
    $.each(path, function(j,v) {
	    var s_titmap = {}, p_titmap = {}, o_titmap = {};
	    if ( Array.isArray( v.s.id ) ) {
		jf.schema[v.s.name] = { key:v.s.name, type:v.s.stype, title:v.s.id[0], required:v.req, enum:v.s.id };
		$.each( v.s.id, function(i,v) {
			s_titmap[v] = onto[ v ].label;
		    });
	    } else {
		jf.schema[v.s.name] = { key:v.s.name, type:v.s.stype, title:v.s.id, required:v.req };
	    }
	    if ( Array.isArray( v.p.id ) ) {
		jf.schema[v.p.name] = { key:v.p.name, type:v.p.stype, title:v.p.id[0], required:v.req, enum:v.p.id };
		$.each( v.p.id, function(i,v) {
			p_titmap[v] = onto[ v ].label;
		    });
	    } else {
		jf.schema[v.p.name] = { key:v.p.name, type:v.p.stype, title:v.p.id, required:v.req };
	    }
	    if ( Array.isArray( v.o.id ) ) {
		jf.schema[v.o.name] = { key:v.o.name, type:v.o.stype, title:v.o.id[0], required:v.req, enum:v.o.id };
		$.each( v.o.id, function(i,v) {
			o_titmap[v] = onto[ v ].label;
		    });
	    } else {
		jf.schema[v.o.name] = { key:v.o.name, type:v.o.stype, title:v.o.id, required:v.req };
	    }
	    
	    jf.form.push(
			 { type:"fieldset", title:"Statement "+(j+1)+((!v.req)?" &#x2014 optional":""),
				 expandable:((!v.req) ? true : false), items:[
									      ( Array.isArray( v.s.id ) ?
										({ key:jf.schema[v.s.name].key, titleMap:s_titmap, notitle:true, disabled:true }) :
										({ key:jf.schema[v.s.name].key, value:v.s.svalue, title:((onto[v.s.id])?onto[v.s.id].label:v.s.id) }) ),
									      ( Array.isArray( v.p.id ) ?
										({ key:jf.schema[v.p.name].key, titleMap:p_titmap, notitle:true, disabled:true }) :
										({ key:jf.schema[v.p.name].key, value:onto[ v.p.id ].label, notitle:true, disabled:true }) ),
									      ( Array.isArray( v.p.id ) ?
										({ }) :
										({ key:jf.schema[v.p.name].key, value:v.p.id, type:"hidden" }) ),
									      ( Array.isArray( v.o.id ) ?
										({ key:jf.schema[v.o.name].key, titleMap:o_titmap, notitle:true, disabled:true }) :
										({ key:jf.schema[v.o.name].key, value:v.o.svalue, title:((onto[v.o.id])?onto[v.o.id].label:v.o.id) }) )
									      ] }
			 );
	});
    jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
    if ( header.includes( "glyphicon") ) {
	jf.form.push( { key:"reification",notitle:true,inlinetitle:"Reification? &nbsp; &nbsp; ", "onChange": function (evt) {
		    var flag2 = document.querySelectorAll('[class*="reification_title"]');
		    var flag21 = document.getElementsByName('reification_title');
		    if ( evt.target.checked ) {
			flag2[0].style.display = "block";
			flag21[0].setAttribute( "required","required" );
		    } else {
			flag2[0].style.display = "none";
			flag21[0].removeAttribute( "required" );
		    }
		}
	    } );
    }
    jf.form.push( { type:"actions",items: [{type: "submit",title: "Add statements"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
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
		    // value from a dataList
		    if ( shownValDefined ) {
			if ( shownValDefined.startsWith( '#' ) ) {
			    // pre-defined value
			    tripleid["s"+i] = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid["s"+i])+` a <`+onto[ jf.schema["s"+i].title ].about+`> ;\n`;
			    triples += `skos:prefLabel """`+values["s"+i]+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values["s"+i]+`""" ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			} else {
			    // graph value
			    tripleid["s"+i] = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			}
		    } else if ( $( "#newModal input[name='s"+i+"']" ).attr("readonly") != "readonly" ) {
			// new value
			tripleid["s"+i] = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid["s"+i])+` a <`+onto[ jf.schema["s"+i].title ].about+`> ;\n`;
			triples += `skos:prefLabel """`+values["s"+i]+`""" ;\n`;
			triples += `crm:P1_is_identified_by """`+values["s"+i]+`""" ;\n`;
			triples += `dct:created "`+$.now()+`" ;\n.`;
		    }
		    shownVal = document.getElementsByName("o"+i)[0].value;
		    if ( onto[ jf.schema["o"+i].title ] ) { 
			shownValDefined = $( "#"+jqu( onto[ jf.schema["o"+i].title ].about )+" option" ).filter(function() { return this.value == shownVal; }).data('value');
		    }
		    if ( shownValDefined ) {
			if ( shownValDefined.startsWith( '#' ) ) {
			    // pre-defined value
			    tripleid["o"+i] = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid["o"+i])+` a <`+onto[ jf.schema["o"+i].title ].about+`> ;\n`;
			    triples += `skos:prefLabel """`+values["o"+i]+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values["o"+i]+`""" ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			} else {
			    // graph value
			    tripleid["o"+i] = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			}
		    } else if ( $( "#newModal input[name='o"+i+"']" ).attr("readonly") != "readonly" ) {
			if (jf.schema["o"+i].type == "string") {
			    // new value
			    tripleid["o"+i] = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid["o"+i])+` a <`+onto[ jf.schema["o"+i].title ].about+`> ;\n`;
			    triples += `skos:prefLabel """`+values["o"+i]+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values["o"+i]+`""" ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
		    }
		}
	    }
	    // iterate through values in triples to connect instances	    
	    for (i=1; i<=Object.keys(values).length/3; i++) {
		// if triple is complete
		if ( values["s"+i] && values["p"+i] && values["o"+i] ) {
		    // inherited value (shortcuts)
		    if (! tripleid["s"+i] ) { tripleid["s"+i] = tripleid[ svalue["s"+i] ]; }
		    if (! tripleid["o"+i] ) { tripleid["o"+i] = tripleid[ svalue["o"+i] ]; }
		    // triple s-p-o
		    if ( values.reification_title ) {
			tripleid_reified = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid_reified)+` a crm:E73_Information_Object, rdf:Statement ;\n`;
			triples += `skos:prefLabel """`+values.reification_title+` (proposition)""" ;\n`;
			triples += `rdf:subject `+NS[""](tripleid["s"+i])+` ;\n`;
			triples += `rdf:predicate <`+onto[ values["p"+i] ].about+`> ;\n`;
			triples += `rdf:object `+NS[""](tripleid["o"+i])+` ;\n`;
			triples += `dct:created "`+$.now()+`" ;\n.`;
		    } else {
			triples += `\n`+NS[""](tripleid["s"+i])+` <`+onto[ values["p"+i] ].about+`> `+NS[""](tripleid["o"+i])+`;\n.`;
		    }
		    new_id = NS[""](tripleid["s1"]).value;
		}
	    }
	    // insert triples into graph
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
	curr_stmt = {};
	$( "#newModal" ).modal('hide');
    };
    create_form( header, "shortcut", jf );
    $.each(path, function(j,v) {    
	    // link to dataLists for class instances
	    if ( onto[ v.s.id ] && onto[ v.s.id ].type == "class" ) {
		if ( v.s.id == "crm:E55_Type" ) {
		    $( "#newModal input[name='s"+(j+1)+"']" ).attr( "list", onto[ v.s.id ].about+"#"+v.o.id );
		} else {
		    $( "#newModal input[name='s"+(j+1)+"']" ).attr( "list", onto[ v.s.id ].about );
		}
	    }
	    if ( onto[ v.o.id ] && onto[ v.o.id ].type == "class" ) {
		if ( v.o.id == "crm:E55_Type" ) {
		    $( "#newModal input[name='o"+(j+1)+"']" ).attr( "list", onto[ v.o.id ].about+"#"+v.s.id );
		} else {
		    $( "#newModal input[name='o"+(j+1)+"']" ).attr( "list", onto[ v.o.id ].about );
		}
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


// backend functions

// view a graph (load serialized "kbURI" into RDF kb)
function mod_load_graph ( kbURI ) {
    
    var message;
    // kbURI is either a draft graph ("kb-...") or a published graph ("pkb-...")
    var storedURI = base+((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?"submitted/":"resources/models/")+kbURI.substr(kbURI.lastIndexOf('/')+1)+".nt";

    var fetch = $rdf.fetcher(kb);
    fetch.nowOrWhenFetched(storedURI, {withCredentials:false}, function(ok, body, xhr){
	    if (ok) {
		console.log( "serialized graph loaded: "+kbURI+" ("+kb.length+" triples)" );
		message = ``;
		if ( kbURI.match( /\/submitted\/kb-/gi ) ) {
		    // draft
		    mod_edit_graph( kbURI );
		} else {
		    // published
		    mod_display( kb, message, "success" );
		}
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
    localizedKBURI = ((kbURI.substr(kbURI.lastIndexOf('/')+1).startsWith('kb-'))?kbURI:base+location.pathname.substring(1)+"#/submitted/"+"kb-"+newontoid);
    console.log( "localized graph created: "+localizedKBURI+" ("+localizedKB.length+" triples)" );
    if (localizedKBURI == kbURI) {
	// editing draft
	message = `<b>Success!</b> You are editing your model: &lt;`+localizedKBURI+`&gt;.<br/> <em>Remember:</em> You must <em>publish</em> your model to make it available to everybody!`;
	mod_display( localizedKB, message, "success" );
    } else {
	// forking published
	new_model( 'fork' );
    }

}

// save a graph (serialize entire "localized" kb as ntriples [safest option] and upload to server)
function mod_save_graph ( localizedKBURI ) {

    var exitcode;
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
		exitcode = true;
	    } else {
		console.log ("serialized graph not uploaded."); 
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
		exitcode = false;
	    }
	});
    return exitcode;

}

// publish a graph (serialize entire "localized" kb as ntriples [safest option] and upload to server)
function mod_publ_graph ( localizedKBURI ) {

    var exitcode;
    $rdf.serialize(undefined, localizedKB, localizedKBURI, "application/n-triples", function(err, str) {
	    if (!err) {
		// upload serialized graph
		var serializedFile = localizedKBURI.substr(localizedKBURI.lastIndexOf('/')+1)+".nt";
		$.ajax({
			type: 'POST',
			    url: '/cgi-bin/handleRDF.cgi',
			    data: { 'myRDF': str, 'file': serializedFile, 'mimetype': "application/n-triples", 'publ': "true" },
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
		exitcode = true;
	    } else {
		console.log ("serialized graph not uploaded."); 
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
		exitcode = false;
	    }
	});
    return exitcode;

}

// function to safely address IDs containing dots etc.
function jqu( myid ) {

    return myid.replace( /(:|\.|\[|\]|,|=|\/)/g, "\\$1" );

}

// function to return the namespaced version of an IRI
function nsv( myiri ) {

    var matchedNS;
    $.each( NS, function( index, value ) {
	    if ( myiri.indexOf( NS[index]().uri ) == 0 ) { 
		matchedNS = index;
		return false;
	    }
	});
    return ((typeof matchedNS !== 'undefined')?myiri.replace( NS[matchedNS]().uri, matchedNS+":" ):false);

}

// function to return the skos:prefLabel of an IRI
function skp( graph,myiri ) {

    if ( myiri.termType == "NamedNode" ) {
	return ( graph.any( $rdf.sym( myiri.value ), NS["skos"]("prefLabel"), undefined ) );
    } else return false;

}

// on KB change update UI from KB
function refresh_graph ( graph ) {

    // create dataLists
    var dataList = {}, dataListLabel = {}, done = {};

    // read entire graph once and process statements
    var statements = graph.statementsMatching( undefined, undefined, undefined );
    statements.forEach(function(statement) {
	    // populate dataLists for all class and their superclass instances
	    if ( statement.predicate.value == NS["rdf"]("type").value ) { // e.g. "... a crm:E21_Person ;"
		var cache = [];
		var crels = retrieve_class_relationships( nsv( statement.object.value ) );	    
		cache.push( statement.object.value,crels[0] ); // direct superclasses
		cache.push( statement.object.value,crels[1] ); // inferred superclasses
		$.each( _.flatten( cache ), function( i,v ) {
			if ( onto[ v ] ) { v = onto[ v ].about; }
			if (! dataList[ v ] ) { dataList[ v ] = []; }
			done[ skp( graph,statement.subject ) ] = 1;
			dataList[ v ].push( statement.subject.value );
			dataListLabel[ statement.subject.value ] = skp( graph,statement.subject );
		    });
	    }
	});

    // pre-populate authors/works dataLists (including direct superclasses)
    $.each( [ "crm:E21_Person","crm:E39_Actor","crm:E20_Biological_Object","frbroo:F10_Person" ], function( i,v ) {
	    if ( onto[ v ] ) { v = onto[ v ].about; }
	    if (! dataList[ v ] ) { dataList[ v ] = []; }
	    $.each( mod_auth, function (i2,v2) {
		    if (!done[ mod_auth[ i2 ].name ]) {
			dataList[ v ].push( "#"+i2 );
			dataListLabel[ "#"+i2 ] = mod_auth[ i2 ].name;
		    }
		});
	});
    $.each( [ "crm:E33_Linguistic_Object","crm:E28_Conceptual_Object","crm:E84_Information_Carrier","frbroo:F4_Manifestation_Singleton" ], function( i,v ) {
	    if ( onto[ v ] ) { v = onto[ v ].about; }
	    if (! dataList[ v ] ) { dataList[ v ] = []; }
	    $.each( mod_work, function (i2,v2) {
		    if (!done[ mod_work[ i2 ].title ]) {
			dataList[ v ].push( "#"+i2 );
			dataListLabel[ "#"+i2 ] = mod_work[ i2 ].title;
		    }
		});
	});

    // Create class-specific E55_Type-datalists
    var doneE55 = {};
    statements.forEach(function(statement) {
	    var s = statement.subject;
	    var p = statement.predicate;
	    var o = statement.object;
	
	    if ( p.value == NS["crm"]("P2_has_type").value ) {
		if ( o.termType == "Literal" ) {
		    var v = graph.any( s, NS["rdf"]("type"), undefined );
		    v = "http://www.cidoc-crm.org/cidoc-crm/E55_Type#"+nsv( v.value );
		    if ( !dataList[ v ] ) { dataList[ v ] = []; }
		    if ( !doneE55[ o.value ] ) {
			doneE55[ o.value ] = 1;
			dataList[ v ].push( o.value );
			dataListLabel[ o.value ] = o.value;
		    }
		} else if ( o.value.startsWith( NS[""]("").value ) ) {
		    var v = graph.any( s, NS["rdf"]("type"), undefined );
		    v = "http://www.cidoc-crm.org/cidoc-crm/E55_Type#"+nsv( v.value );
		    if ( !dataList[ v ] ) { dataList[ v ] = []; }
		    if ( !doneE55[ skp( graph,o ) ] ) {
			doneE55[ skp( graph,o ) ] = 1;
			dataList[ v ].push( o.value );
			dataListLabel[ o.value ] = skp( graph,o );					
		    }
		}
	    }
	});

    // create classes overview for viewing mode
    var classes = `<ul class="listBibl">`;
    done = {};
    statements.forEach(function(statement) {
	    if ( statement.predicate.value == NS["rdf"]("type").value && !done[ statement.object.value ] ) {
		done[ statement.object.value ] = 1;
		if ( onto[ statement.object.value ] ) { statement.object.value = onto[ statement.object.value ].about; }
		// only display classes from our core/domain ontologies, i.e. for which onto[ ... ] exists
		classes += ((onto[ nsv( statement.object.value ) ])?`<li><a href="`+statement.object.value+`" class="relsLink">`+onto[ nsv( statement.object.value ) ].label+`</a></li>`:(nsv( statement.object.value )?`<!--<li>`+nsv( statement.object.value )+`</li>-->`:`<!--<li>`+statement.object.value+`</li>-->`));
	    }
	});
    classes += `</ul>`;
    $( "#view_classes" ).html( classes );
    // empty graph in viewing mode
    if ( $('#view_classes ul').children().length == 0  ) {
	$('#view_classes').html(`<p style="margin-left:20px">[Any <b>classes</b> instantiated by your <b>model</b> will appear here.  Please select the <em>Edit</em> tab above to start creating your <em>knowledge graph</em>!]</p>`);
	$('#view_instances').html(`<p style="margin-left:20px">[All <b>instances</b> of any of the <b>classes</b> selected above, will appear here.  Please select the <em>Edit</em> tab above to start creating your <em>knowledge graph</em>!]</p>`);
	$('#view_results').html(`<p>[All <b>statements</b> made about any of the <b>instances</b> selected above, will appear here.  Please select the <em>Edit</em> tab above to start creating your <em>knowledge graph</em>!]</p>`);
    }

    // populate dataLists
    var newDataLists = `<div class="datalists">`;
    $.each( dataList, function( index, value ) {
	    newDataLists += `<datalist id="`+index+`">`;
	    $.each( dataList[ index ], function( index2, value2 ) {
		    newDataLists += `<option data-value="`+value2+`">`+dataListLabel[ value2 ]+`</option>`;
		});
	    newDataLists += `</datalist>`;
	});
    newDataLists += `</div>`;
    $( "div.datalists" ).replaceWith( newDataLists );

}

// edit buttons in viewing mode
$(document.body).on('mouseenter','#view_classes li',function(){
	if ( localizedKBURI ) {
	    var link = $( this ).find( "a" ).attr( "href" );
	    $( this ).append( '<span class="ctl_buttons pull-right"><a class="add_class" href="'+link+'" title="Add instance"><i class="glyphicon glyphicon-plus-sign" /></a></span>' );
	}
    }).on('mouseleave','#view_classes li',function(){
	    if ( localizedKBURI ) {
		$( this ).find( '.ctl_buttons' ).remove();		
	    }
	});
$(document.body).on('click','#view_classes a.add_class',function(){
	triggerTreeLinkClick( $(this) ); 
    });
$(document.body).on('mouseenter','#view_instances li',function(){
	if ( localizedKBURI ) {
	    var link = $( this ).find( "a" ).attr( "href" );
	    $( this ).append( '<span class="ctl_buttons pull-right"><a class="addto_instance" href="'+link+'" title="Add triple"><i class="glyphicon glyphicon-plus-sign" /></a><a style="padding-left:15px;" class="rem_instance" href="'+link+'" title="Remove instance"><i class="glyphicon glyphicon-remove-sign" /></a></span>' );
	}
    }).on('mouseleave','#view_instances li',function(){
	    if ( localizedKBURI ) {
		$( this ).find( '.ctl_buttons' ).remove();		
	    }
	});
$(document.body).on('click','#view_instances a.addto_instance',function(e){
	e.preventDefault();
	triggerTreeLinkClick( $(this) );
    });
$(document.body).on('click','#view_instances a.rem_instance',function(e){
	e.preventDefault();
	var id = $(this).attr("href");

	localizedKB.removeMany( $rdf.sym( id ), undefined, undefined );
	statements = localizedKB.statementsMatching( undefined, undefined, undefined );
	if ( statements.length > 0 ) {
	    statements.forEach(function(statement) {
		    var s = statement.subject;
		    var p = statement.predicate;
		    var o = statement.object;

		    if ( o.value && o["value"].startsWith( id ) ) {
			var res = localizedKB.match( $rdf.sym(s.value), $rdf.sym(p.value), ((o.termType == "NamedNode")?$rdf.sym(o.value):$rdf.literal(o.value,'')) );
			localizedKB.remove( res );
		    }

		});
	}
	mod_display( localizedKB, ``, "success" );
    });
$(document.body).on('mouseenter','#view_results li',function(){
	if ( localizedKBURI ) {
	    var link = $( this ).find( "a" ).attr( "href" );
	    $( this ).append( '<span class="ctl_buttons"><a class="rem_triple" href="'+link+'" title="Remove triple"><i class="glyphicon glyphicon-remove-sign" /></a></span>' );
	}
    }).on('mouseleave','#view_results li',function(){
	    if ( localizedKBURI ) {
		$( this ).find( '.ctl_buttons' ).remove();		
	    }
	});
$(document.body).on('click','#view_results a.rem_triple',function(e){
	e.preventDefault();
	var s = $( this ).parent().parent().data("s");
	var p = $( this ).parent().parent().data("p");
	var o = $( this ).parent().parent().data("o");
    
	var res = localizedKB.match( $rdf.sym( s.replace( /(<|>)/g, "" ) ), $rdf.sym( p.replace( /(<|>)/g, "" ) ), (o.startsWith( '<' )?$rdf.sym( o.replace( /(<|>)/g, "" ) ):$rdf.literal( o,'' ) ) );
	localizedKB.remove( res );
	mod_display( localizedKB, ``, "success" );

    });

// save work before leaving page unintentionally ~ this should never happen!
$( window ).on('beforeunload', function() {
	if (localizedKBURI) { mod_save_graph( localizedKBURI ); }
    });

// define startsWith(), .includes(), endsWith(), capitalize()
if (!String.prototype.startsWith) {

    String.prototype.startsWith = function(searchString, position) {
	position = position || 0;
	return this.indexOf(searchString, position) === position;
    };

}
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
	'use strict';
	if (typeof start !== 'number') {
	    start = 0;
	}

	if (start + search.length > this.length) {
	    return false;
	} else {
	    return this.indexOf(search, start) !== -1;
	}
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
	    return ((string)?string.charAt(0).toUpperCase() + string.slice(1):string);
	}

    });

// submit a SPARQL query
function makeSPARQLQuery( endpointUrl, sparqlQuery, doneCallback ) {
    var settings = {
	headers: { Accept: 'application/sparql-results+json' },
	data: { query: sparqlQuery },
	async: false
    };
    return $.ajax( endpointUrl, settings ).then( doneCallback );
}

// show message alert
function show_alert_mod( message, type ) {

    if ( message ) {
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
	var countdown = MAX = 5;
	$("#secCD").html(MAX);
	var intervalID = window.setInterval(function () {
		countdown -= 1;
		$("#secCD").html(countdown);  //adjust the ticker visually
		if (countdown == 0) {
		    //closes the dialog...which in turn fires the the modalclose event.
		    $("#modConfirm").modal("hide");  
		    window.clearInterval(intervalID);
		}
	    }, 1000);
    }
}
function show_alert_div( message, type ) {

    if ( message ) {
	$( "#message" ).html(`<div class="alert alert-`+type+` alert-dismissible">
			     <button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>
			     <div>`+message+`</div>`);
    }

}

// KB display
function mod_display( graph, message, type ) {

    var mod_tit, mod_ver;
    if ( localizedKBURI ) { // editing
	graph = localizedKB;
    } else {                // viewing
	graph = kb;
    }
    var ontomd = graph.any( undefined, NS["rdf"]("type"), NS["owl"]("Ontology") );
    var mod_tit = skp( graph,ontomd );
    var mod_ver = graph.any( $rdf.sym( ontomd.uri ), NS["dct"]("isVersionOf"), undefined );
    $( "#modelling" ).html('').append( `<div id="message"/>` );
    show_alert_mod( message, type );
    var panel = `
	<div id="mod_viewer">
	<header id="mod_head"><h1>`
	+ mod_tit +
	((mod_ver)?" <small>forked from "+
	 ((localizedKBURI)?"&lt;"+nsv( mod_ver.uri )+"&gt;</small>":"<a dataid='"+mod_ver.uri+"' href='#/resources/models/"+mod_ver.uri+"'>&lt;"+nsv( mod_ver.uri )+"&gt;</a></small>"):"")+
	`</h1></header>
	<div class="mod_content">
	<div class="mod_columns">
	<div id="mod_cy"/>
	<div id="mod_ctl">
	<ul class="nav nav-tabs" role="tablist" id="mod_control">
	<li role="presentation" class="active"><a href="#mod_about" aria-controls="mod_about" role="tab" data-toggle="tab">About this model</a></li>
	<li role="presentation"><a href="#mod_view" aria-controls="mod_view" role="tab" data-toggle="tab">View</a></li>
	<li role="presentation"`+((localizedKBURI)?'':' class="disabled"')+`><a href="#mod_edit" aria-controls="mod_edit" role="tab" data-toggle="tab">Edit</a></li>
	<a class='help-modal' href='#mod_control'><span class='glyphicon glyphicon-question-sign' style='vertical-align:text-top'/></a>
	</ul>

	<div class="tab-content">
	<div role="tabpanel" class="tab-pane active" id="mod_about" style="right:0">
	<div id="mod_ctl_abt"/> 
	</div>
	<div role="tabpanel" class="tab-pane" id="mod_view" style="right:0">
	<div id="mod_ctl_vie"/> 
	</div>
	<div role="tabpanel" class="tab-pane" id="mod_edit" style="right:0">
	<div id="mod_ctl_nav"/> 
	<div id="mod_ctl_sel"/> 
	</div>
	</div>
	</div>
	</div>
	</div>
	`;

    $( "#modelling").append( panel );
    $( "#mod_ctl_abt" ).append( retrieve_ontomd() );
    $( "#mod_ctl_vie" ).append( `
				<div class="panel-group" role="tablist" aria-multiselectable="true">
				<div class="panel">
				<div class="panel-heading" role="tab" id="headingMOne">
				<div class="panel-title">
				<a role="button" data-toggle="collapse" href="#collapseMOne" aria-expanded="true" aria-controls="collapseMOne">Classes</a>
				</div>
				</div>
				<div id="collapseMOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingMOne" aria-expanded="true">
				<div class="panel-body">
				<div id="view_classes"/>
				</div>
				</div>
				</div>
				<div class="panel">
				<div class="panel-heading" role="tab" id="headingMTwo">
				<div class="panel-title">
				<a role="button" data-toggle="collapse" href="#collapseMTwo" aria-expanded="true" aria-controls="collapseMTwo">Instances</a>
				</div>
				</div>
				<div id="collapseMTwo" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingMTwo" aria-expanded="true">
				<div class="panel-body">
				<div id="view_instances"/>
				</div>
				</div>
				</div>
				<div class="panel">
				<div class="panel-heading" role="tab" id="headingMThree">
				<div class="panel-title">
				<a role="button" data-toggle="collapse" href="#collapseMThree" aria-expanded="true" aria-controls="collapseMThree">Statements</a>
				</div>
				</div>
				<div id="collapseMThree" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingMThree" aria-expanded="true">
				<div class="panel-body">
				<div id="view_results"/>
				</div>
				</div>
				</div>
				</div>
				` );

    if ( localizedKBURI ) { // editing
	$( "#mod_head" ).append(`<div class="datalists"/>`);
    	$( "#mod_head" ).append(`<div style="display:flex;" id="mod_workflow"><button style="margin-right:5px;" type="button" class="btn btn-primary" id="thirdstep">Save &amp; Close model</button>
				<button style="margin-right:5px;" type="button" class="btn btn-primary" id="ninthstep">Download model</button>
				<button style="margin-right:5px;" type="button" class="btn btn-success" id="fifthstep">Publish model</button>
				<a class='help-modal' href='#mod_workflow'><span class='glyphicon glyphicon-question-sign' style='vertical-align:text-top'/></a></div>`);

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
	$( "#mod_ctl_nav" ).append(
				   `
				   <div class="panel-group" role="tablist" aria-multiselectable="true">
				   <div class="panel">
				   <div class="panel-heading" role="tab" id="headingEOne">
				   <div class="panel-title">
				   <a role="button" data-toggle="collapse" href="#collapseEOne" aria-expanded="true" aria-controls="collapseEOne">Templates</a>
				   </div>
				   </div>
				   <div id="collapseEOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingEOne" aria-expanded="true">
				   <div class="panel-body">
				   <div id="ontotempl"/>
				   </div>
				   </div>
				   </div>
				   <div class="panel">
				   <div class="panel-heading" role="tab" id="headingETwo">
				   <div class="panel-title">
				   <a role="button" data-toggle="collapse" href="#collapseETwo" aria-expanded="true" aria-controls="collapseETwo">Shortcuts</a>
				   </div>
				   </div>
				   <div id="collapseETwo" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingETwo" aria-expanded="true">
				   <div class="panel-body">
				   <div>
				   <div class="ontofcr-collapse"><a>[expand/collapse]</a></div>
				   <label for="input-search2" class="sr-only">Search Shortcuts:</label>
				   <input type="input" class="form-control" id="input-search2" placeholder="Type 3+ characters to highlight..."/>
				   <div id="search-output2"></div><div id="treeview-ontofcr"/>
				   <div class="ontofcr-collapse"><a>[expand/collapse]</a></div><br>
				   </div>
				   </div>
				   </div>
				   </div>
				   <div class="panel">
				   <div class="panel-heading" role="tab" id="headingEThree">
				   <div class="panel-title">
				   <a role="button" data-toggle="collapse" href="#collapseEThree" aria-expanded="true" aria-controls="collapseEThree">Taxonomy</a>
				   </div>
				   </div>
				   <div id="collapseEThree" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingEThree" aria-expanded="true">
				   <div class="panel-body">
				   <div>
				   <div class="ontohier-collapse"><a>[expand/collapse]</a></div>
				   <label for="input-search" class="sr-only">Search Classes:</label>
				   <input type="input" class="form-control" id="input-search" placeholder="Type 3+ characters to highlight..."/>
				   <div id="search-output"></div><div id="treeview-ontohier"/>
				   <div class="ontohier-collapse"><a>[expand/collapse]</a></div><br>
				   </div>
				   </div>
				   </div>
				   </div>
				   </div>
				   ` );
	$('#treeview-ontofcr').treeview( {data: ontofcr, expandIcon:'glyphicon glyphicon-chevron-right', collapseIcon:'glyphicon glyphicon-chevron-down', enableLinks:true, levels:1, selectedBackColor:'#fff', selectedColor:'#333', backColor:'#e1f1fd', onhoverColor:'' });
	$('#treeview-ontohier').treeview( {data: ontohier, expandIcon:'glyphicon glyphicon-chevron-right', collapseIcon:'glyphicon glyphicon-chevron-down', enableLinks:true, levels:3, selectedBackColor:'#fff', selectedColor:'#333', onhoverColor:'' });
	$('#ontotempl').append( create_ontotempl() );
	$( "a[href='#mod_view']" ).trigger( "click" );

    } else { // viewing

	$( "#mod_head" ).append(`<div style="display:flex;" id="mod_workflow"><button style="margin-right:5px;" type="button" class="btn btn-success" id="secondstep">Fork model</button>
				<button style="margin-right:5px;" type="button" class="btn btn-primary" id="sixthstep">Close model</button> 
				<a class='help-modal' href='#mod_workflow'><span class='glyphicon glyphicon-question-sign' style='vertical-align:text-top'/></a></div>`);

    }
    // populate from graph
    refresh_graph( graph );

    $( "#mod_cy" ).append( `<div id="cy"><div class="cytoscape-navigator"/></div>` );
    var data = createCYJSON( graph );
    createCYgraph( data,graph );
    // focus graph on new addition
    if ( new_id ) {
	var j = cy.$( "[id='"+new_id+"']" );
	cy.animate({
		zoom: 1,
		    center: { eles: cy.filter( j ) }
	    }, {
		duration: 500
		    });
	new_id = undefined;
    }

}

// create predefined templates overview for editing mode
function create_ontotempl() {

    // Persons/Authors
    var authors = aut_id.split( "|" ), authadd = '';
    var ontotempl = `<ul class="listBibl">
	<li><a data-type="person" class="relsLink" href="#">Person</a>`;
    authors.forEach(function (i) {
	    // list poem's author(s) if not in graph already
	    if (! localizedKB.any( undefined, NS["crm"]("P1_is_identified_by"), "https://www.eighteenthcenturypoetry.org/authors/"+mod_auth[ i ].id+".shtml" )) {
		if ( authadd == '' ) {
		    authadd += `, e.g.
			<ul class="listBibl">`;
		}
		if ( mod_auth[ i ].viaf ) {
		    // get Wikidata ID via VIAF
		    var wd_ent;
		    var endpointUrl = 'https://query.wikidata.org/sparql', 
			sparqlQuery = "select ?person {\n" +
			"  ?person wdt:P214 \""+mod_auth[i].viaf+"\"\n" +
			"}";
		    makeSPARQLQuery( endpointUrl, sparqlQuery, function( data ) {
			    if ( data.results.bindings[0] &&  data.results.bindings[0].person ) {
				wd_ent = data.results.bindings[0].person.value;
			    }
			});
		    if ( wd_ent ) { // WD ID found
			authadd += `<li><a data-type="person" data-id="`+mod_auth[i].id+`" class="relsLink" href="`+wd_ent+`">`+mod_auth[i].name+`</a></li>`;
		    } else {        // no WD ID found
			authadd += `<li><a data-type="person" data-id="`+mod_auth[i].id+`" class="relsLink" href="#">`+mod_auth[i].name+`</a></li>`;
		    }
		} else { // no VIAF exists
		    authadd += `<li><a data-type="person" data-id="`+mod_auth[i].id+`" class="relsLink" href="#">`+mod_auth[i].name+`</a></li>`;
		}
	    }
	});
    if ( authadd == '' ) {
	ontotempl += `</li>`;
    } else {
	ontotempl += authadd+`</ul></li>`;
    }
    // Works/Poems
    ontotempl += `<li>
	<a data-type="work" class="relsLink" href="#">Work</a>`;
    if (! localizedKB.any( undefined, NS["crm"]("P1_is_identified_by"), "https://www.eighteenthcenturypoetry.org/works/"+mod_work[ txt_id ].id+".shtml" )) {
	ontotempl += `, e.g.
	    <ul class="listBibl">`;
	ontotempl += `<li><a data-type="work" class="relsLink" href="#" data-id="`+mod_work[ txt_id ].id+`">`+mod_work[ txt_id ].title+`</a></li>`;
	ontotempl += `</ul></li>`;
    } else {
	ontotempl += `</li>`;
    }
    // Objects
    ontotempl += `<li>
	<a data-type="object" class="relsLink" href="#">Object</a>
	</li>`;
    // Events
    ontotempl += `<li>
	<a data-type="event" class="relsLink" href="#">Event</a>
	</li>`;
    // Places
    ontotempl += `<li>
	<a data-type="place" class="relsLink" href="#">Place</a>
	</li>`;
    // Concepts
    ontotempl += `<li>
	<a data-type="concept" class="relsLink" href="#">Concept</a>
	</li>`;
    // Argumentation
    ontotempl += `<li>
	<a data-type="argumentation" class="relsLink" href="#">Argumentation</a>
	</li>`;
    // Statements
    ontotempl += `<li>
	<a data-type="proposition" class="relsLink" href="#">Proposition</a>
	</li>`;
    ontotempl += `</ul>`;
    return ontotempl;

}
$(document.body).on('click', '#ontotempl a[data-type]', function() { create_template( this ) });
// update template form with Wikidata
$(document.body).on('show.bs.modal', "#newModal", function () {
	if ( $( "#newModal input[name='wd.wdid']" ).val() ) {
	    retrieve_wd_entry( $( "#newModal input[name='wd.wdid']" ).val() );
	}
    });
$(document.body).on('change', "#newModal input[name='wd.wdid']", function () {
	retrieve_wd_entry( $(this).val() );
    });

// retrieve record in JSON from Wikidata
function retrieve_wd_entry( id ) {

    var wditem;
    var endpointUrl = 'https://query.wikidata.org/sparql',
	sparqlQuery = "PREFIX entity: <http://www.wikidata.org/entity/>\n" +
        "SELECT ?propUrl ?propLabel ?valUrl ?val\n" +
        "WHERE {\n" +
        "hint:Query hint:optimizer 'None' .\n" +
        "{BIND(entity:"+id+" AS ?valUrl) .\n" +
        "BIND(\"name\"@en AS ?propLabel ) .\n" +
        "     BIND(\"name\"@en AS ?propUrl ) .\n" +
        "        entity:"+id+" rdfs:label ?val .\n" +
        "        FILTER (LANG(?val) = \"en\") \n" +
        "}\n" +
        "    UNION\n" +
        "    {   BIND(entity:"+id+" AS ?valUrl) .\n" +
        "        BIND(\"altLabel\"@en AS ?propLabel ) .\n" +
        "        BIND(\"altLabel\"@en AS ?propUrl ) .\n" +
        "        optional{entity:"+id+" skos:altLabel ?val} .\n" +
        "        FILTER (LANG(?val) = \"en\") \n" +
        "    }\n" +
        "    UNION\n" +
        "    {   BIND(entity:"+id+" AS ?valUrl) .\n" +
        "        BIND(\"description\"@en AS ?propLabel ) .\n" +
        "        BIND(\"description\"@en AS ?propUrl ) .\n" +
        "        optional{entity:"+id+" schema:description ?val} .\n" +
        "        FILTER (LANG(?val) = \"en\") \n" +
        "    }\n" +
        "    UNION\n" +
        "    {   BIND(entity:"+id+" AS ?valUrl) .\n" +
        "        BIND(wdt:P18 AS ?propUrl ) . \n" +
        "        BIND(\"image\"@en AS ?propLabel ) .\n" +
        "        optional{entity:"+id+" wdt:P18 ?val} .\n" +
        "    }\n" +
        "   UNION\n" +
        "{entity:"+id+" ?propUrl ?valUrl .\n" +
        "?property ?ref ?propUrl .\n" +
        "?property rdf:type wikibase:Property .\n" +
        "?property rdfs:label ?propLabel .\n" +
        "     FILTER (lang(?propLabel) = 'en' )\n" +
        "        filter  isliteral(?valUrl) \n" +
        "        BIND(?valUrl AS ?val)\n" +
        "}\n" +
        "UNION\n" +
        "{entity:"+id+" ?propUrl ?valUrl .\n" +
        "?property ?ref ?propUrl .\n" +
        "?property rdf:type wikibase:Property .\n" +
        "?property rdfs:label ?propLabel .\n" +
        "     FILTER (lang(?propLabel) = 'en' ) \n" +
        "        ?valUrl rdfs:label ?valLabel .\n" +
        "FILTER (LANG(?valLabel) = \"en\") \n" +
        "        BIND(CONCAT(?valLabel) AS ?val)\n" +
        "}\n" +
        "    BIND( SUBSTR(str(?propUrl),38, 250) AS ?propNumber)\n" +
        "}\n" +
        "ORDER BY xsd:integer(?propNumber)";
    makeSPARQLQuery( endpointUrl, sparqlQuery, function( data ) {
	    wditem = _.groupBy( data.results.bindings, function(prop) { return prop.propUrl.value.substr(prop.propUrl.value.lastIndexOf('/')+1) });
	});
    // clear template fields
    $( '#newModal *[name="P"]').val( '' );
    $( '#newModal [name$="P18"]').attr( "src", '' );
    $( '#newModal fieldset#wd-image').css( "display", 'none' );
    // populate template fields
    var source = '';
    $.each( Object.keys( wditem ), function( i,v ) {
	    var tmp = '';
	    $.each( wditem[v], function( i2,v2 ) {
		    if ( v2.val ) {
			tmp += v2.val.value + "; ";
		    }
		});
	    if ( tmp ) {
		// format values according to types
		switch (v) {
		    // participants need separate listing
		case "P710":
		    tmp = tmp.substr(0, tmp.lastIndexOf("; "));
		    var participants = tmp.split( "; " );
		    participants.forEach(function (i) {
			    // - needs changing JSONform on the <li data-idx="0"> etc.-level
			});
		    break;
		    // images need to be inserted in @src
		case "P18":
		    tmp = tmp.substr(0, tmp.indexOf("; ")); // use first image
		    if ( $( '#newModal [name$="P18"]').attr( "src" ) == '' ) {
			$( '#newModal [name$="'+v+'"]').attr( "src", tmp );
		    }
		    break;
		    // dates need chopping off "Z" to conform to HTML5
		case "P569":
		case "P570":
		case "P571":
		case "P577":
		case "P585":
		case "P1319":
		    tmp = tmp.substr(0, tmp.indexOf("; ")); // assuming one date
		    if ( tmp.endsWith( 'Z' ) ) {
			tmp = tmp.substr(0, tmp.length-1);
		    }
		    $( '#newModal [name$="'+v+'"]').val( tmp );
		    break;
		case "P958":
		case "P304":
		    source += tmp;
		    break;
		    // everything else...
		default:
		    tmp = tmp.substr(0, tmp.lastIndexOf("; ")); // display value(s) as is
		    $( '#newModal [name$="'+v+'"]').val( tmp );
		}
	    }
	});
    if ( $( '#newModal [name$="P18"]').attr( "src" ) ) {
	$( '#newModal fieldset#wd-image').css( "display", 'block' );
    }

}

// create template JSON Forms for core categories
function create_template( id ) {

    var wde = undefined;
    // Wikidata record exists
    if ( $(id).attr("href").startsWith( 'http' ) ) {
	wde = $(id).attr("href").substr($(id).attr("href").lastIndexOf('/')+1);
    }
    // JSON form
    var jf = new Object();
    jf.schema = {};
    jf.form = [];
    var triples = triples_pre;

    switch ( $(id).data("type") ) {
    case "person":
	/* Wikidata properties of core template classes (for reference - not exhaustive, 
	 * = used property, + = implicitly used property)

	 Person: E21
	 * P31 - type
	 * P18 - image
	 + P734 - family name
	 + P735 - given name
	 P21 - sex
	 P27 - citizenship
	 P172 - ethnic group
	 P103/P1412 - native language/languages spoken
	 P69 - educated at
	 P106 - occupation
	 P102 - member of political party
	 P136 - genre
	 P140 - religion
	 P109 - signature image
	 P135 - movement
	 P1050 - illnesses
	 P485 - archives
	 P800 - notable work
	 P108 - employer
	 * P19 - place of birth
	 * P569 - date of birth
	 * P20 - place of death
	 * P570 - date of death
	 P509/P1196 - cause of death/manner of death
	 P119 - place of burial
	*/

	// WD ID
	jf.schema.wd = { title:"Identifier – use this to autofill fields",type:"object"};
	jf.schema.wd.properties = {};
	jf.schema.wd.properties.wdid = { title:"Wikidata ID",key:"wdid",type:"string",description:"Enter a Wikidata person identifier, e.g. Q164047, then press the TAB key – <a href='https://www.wikidata.org/' class='external' target='_blank'>Search Wikidata</a>",default:((wde)?wde:"") };
	// basic metadata
	jf.schema.basic = { title:"Basic description – this information will create a person record",type:"object" };
	jf.schema.basic.properties = {};
	jf.schema.basic.properties.name = { title:"Name",key:"name",type:"string",required:true };
	jf.schema.basic.properties.description = { title:"Biographical note",key:"description",type:"textarea" };
	jf.schema.basic.properties.P31 = { title:"Type",key:"P31",type:"string" };
	jf.schema.basic.properties.P21 = { title:"Sex",key:"P21",type:"string","enum":["","unknown","male","female"] };
	// birth
	jf.schema.birth = { title:"Birth – this information will create a birth event",type:"object" };
	jf.schema.birth.properties = {};
	jf.schema.birth.properties.P569 = { title:"Date of birth",key:"P569",type:"datetime-local" };
	jf.schema.birth.properties.P19 = { title:"Place of birth",key:"P19",type:"string" };
	// death
	jf.schema.death = { title:"Death – this information will create a death event",type:"object" };
	jf.schema.death.properties = {};
	jf.schema.death.properties.P570 = { title:"Date of death",key:"P570",type:"datetime-local" };
	jf.schema.death.properties.P20 = { title:"Place of death",key:"P20",type:"string" };
	jf.schema.label = { title:"Alternative label",key:"label",type:"string" };
	jf.schema.comment = { title:"Comment",key:"comment",type:"textarea" };
	jf.schema.seeAlso = { title:"See also",key:"seeAlso",type:"string" };
	jf.schema.isDefinedBy = { title:"Is defined by",key:"isDefinedBy",type:"string" };

	jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'><fieldset class='form-group' id='wd-image'><legend>Image</legend><img name='person.P18' src='' alt='[author image]' /></fieldset>" }, { key:"wd" }, { key:"basic" }, { key:"birth" }, { key:"death" }, { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]});
	// submit/cancel buttons
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Add person"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
	jf.form.push( { type:"htmlsnippet", value:"</div>"} );
	jf.onSubmit = function (errors, values) {
	    if (errors) {
		console.log( errors );
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
	    } else {
		var nodeexists = localizedKB.any( undefined, NS["skos"]("prefLabel"), $rdf.literal(values.basic.name,'') );
		if ( !nodeexists ) {
		// create triples
		var tripleid = "kb-"+uuidv4();
		triples += `\n`+NS[""](tripleid)+` a crm:E21_Person ;\n`;
		triples += `skos:prefLabel """`+values.basic.name+`""" ;\n`;
		triples += `crm:P1_is_identified_by """`+values.basic.name+`""" ;\n`;
		if ( values.basic.description ) {
		    triples += `crm:P3_has_note """`+values.basic.description+`""" ;\n`;
		}
		// check if instance already exists
		var shownValDefined = $( "#"+jqu( onto[ "crm:E21_Person" ].about )+" option" ).filter(function() { return this.value == values.basic.name; }).data('value');
		// value from a dataList
		if ( shownValDefined ) {
		    // pre-defined value
		    triples += `crm:P1_is_identified_by "https://www.eighteenthcenturypoetry.org/authors/`+shownValDefined.substring(1)+`.shtml" ;\n`;
		    if ( mod_auth[ shownValDefined.substring(1) ] && mod_auth[ shownValDefined.substring(1) ].viaf ) {
			triples += `owl:sameAs viaf:`+mod_auth[ shownValDefined.substring(1) ].viaf+` ;\n`;
		    }
		    if ( mod_auth[ shownValDefined.substring(1) ] && mod_auth[ shownValDefined.substring(1) ].img ) {
			triples += `crm:P138i_has_representation "https://www.eighteenthcenturypoetry.org/images/authors/`+mod_auth[ shownValDefined.substring(1) ].img+`" ;\n`;
		    }
		}
		if ( $(id).data("id") ) {
		    triples += `crm:P1_is_identified_by "https://www.eighteenthcenturypoetry.org/authors/`+mod_auth[ $(id).data("id") ].id+`.shtml" ;\n`;
		}
		if ( values.wd ) {
		    triples += `owl:sameAs wd:`+values.wd.wdid+` ;\n`;						
		}
		if ( !shownValDefined && $( '#newModal [name$="P18"]').attr( "src") ) {
		    triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
		}
		triples += `dct:created "`+$.now()+`" ;\n.`;
		// birth
		if ( (values.birth && values.birth.P569 ) || (values.birth && values.birth.P19 ) ) {
		    triples += `\n`+NS[""](tripleid+"/birth")+` a crm:E67_Birth ;\n`;
		    triples += `skos:prefLabel """Birth of `+values.basic.name+`""" ;\n.`;
		    triples += `\n`+NS[""](tripleid)+` crm:P98i_was_born `+NS[""](tripleid+"/birth")+` ;\n.`;
		    // place
		    if ( values.birth && values.birth.P19 ) {
			var tripleid_place;
			shownValDefined = undefined;
			// check if instance already exists
			shownValDefined = $( "#"+jqu( onto[ "crm:E53_Place" ].about )+" option" ).filter(function() { return this.value == values.birth.P19; }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_place = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_place = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_place)+` a crm:E53_Place ;\n`;
			    triples += `skos:prefLabel """`+values.birth.P19+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values.birth.P19+`""" ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/birth")+` crm:P7_took_place_at `+NS[""](tripleid_place)+` ;\n.`;
		    }
		    // date
		    if ( values.birth && values.birth.P569 ) {
			var tripleid_date;
			shownValDefined = undefined;
			// check if instance already exists
			shownValDefined = $( "#"+jqu( onto[ "crm:E52_Time-Span" ].about )+" option" ).filter(function() { return this.value == values.birth.P569; }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_date = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_date = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_date)+` a crm:E52_Time-Span ;\n`;
			    triples += `skos:prefLabel """Date of birth of `+values.basic.name+`""" ;\n`;
			    triples += `crm:P82_at_some_time_within "`+values.birth.P569+`"^^xs:date ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/birth")+` crm:P4_has_time-span `+NS[""](tripleid_date)+` ;\n.`;
		    }
		}
		// death
		if ( (values.death && values.death.P570 ) || (values.death && values.death.P20 ) ) {
		    triples += `\n`+NS[""](tripleid+"/death")+` a crm:E69_Death ;\n`;
		    triples += `skos:prefLabel """Death of `+values.basic.name+`""" ;\n.`;
		    triples += `\n`+NS[""](tripleid)+` crm:P100i_died_in `+NS[""](tripleid+"/death")+` ;\n.`;
		    // place
		    if ( values.death && values.death.P20 ) {
			var tripleid_place;
			shownValDefined = undefined;
			// check if instance already exists
			shownValDefined = $( "#"+jqu( onto[ "crm:E53_Place" ].about )+" option" ).filter(function() { return this.value == values.death.P20; }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_place = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_place = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_place)+` a crm:E53_Place ;\n`;
			    triples += `skos:prefLabel """`+values.death.P20+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values.death.P20+`""" ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/death")+` crm:P7_took_place_at `+NS[""](tripleid_place)+` ;\n.`;
		    }
		    // date
		    if ( values.death && values.death.P570 ) {
			var tripleid_date;
			shownValDefined = undefined;
			// check if instance already exists
			shownValDefined = $( "#"+jqu( onto[ "crm:E52_Time-Span" ].about )+" option" ).filter(function() { return this.value == values.death.P570; }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_date = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_date = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_date)+` a crm:E52_Time-Span ;\n`;
			    triples += `skos:prefLabel """Date of death of `+values.basic.name+`""" ;\n`;
			    triples += `crm:P82_at_some_time_within "`+values.death.P570+`"^^xs:date ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/death")+` crm:P4_has_time-span `+NS[""](tripleid_date)+` ;\n.`;
		    }
		}
		if ( values.basic.P31 ) {
		    var P31_parts = values.basic["P31"].split( ";" );
		    $.each( P31_parts, function(i,v) {
			    triples += `\n`+NS[""](tripleid)+` crm:P2_has_type """`+v+`""" ;\n.`;
			});
		}
		if ( values.label ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:label """`+values.label+`""" ;\n.`;
		}
		if ( values.comment ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:comment """`+values.comment+`""" ;\n.`;
		}
		if ( values.seeAlso ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:seeAlso """`+values.seeAlso+`""" ;\n.`;
		}
		if ( values.isDefinedBy ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:isDefinedBy """`+values.isDefinedBy+`""" ;\n.`;
		}
		// insert triples into graph
		try {
		    $rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		    message = ``;
		    mod_display( localizedKB, message, "success" );
		} catch (err) {
		    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		    mod_display( localizedKB, message, "danger" );
		    console.log( err );
		}
		$( "#newModal" ).modal( 'hide' );
		new_id = NS[""](tripleid).value;
		} else {
		    message = `<b>Oh snap!</b> A node with this name already exists.`;
		    show_alert_mod( message, "danger" );
		}
	    }
	};
	create_form( "Create a Person record", "wd-person", jf );
	$( "#newModal input[name='basic.name']" ).attr( "list", onto[ 'crm:E21_Person' ].about );
	$( "datalist#"+jqu( 'http://www.cidoc-crm.org/cidoc-crm/E21_Person' )+" option[data-value^='http']" ).attr("disabled","disabled");
	$( "#newModal input[name='birth.P19']" ).attr( "list", onto[ 'crm:E53_Place' ].about );
	$( "#newModal input[name='death.P20']" ).attr( "list", onto[ 'crm:E53_Place' ].about );
	$( "#newModal input[name$='P569']" ).attr( "list", onto[ 'crm:E52_Time-Span' ].about );
	$( "#newModal input[name$='P570']" ).attr( "list", onto[ 'crm:E52_Time-Span' ].about );
	if ( $(id).attr("href").startsWith( 'http' ) ) {
	    $( '#newModal #jForm .modal-body *').attr( "readonly", "readonly" );
	}
	$( "#newModal" ).modal('show');
	// use default values for ECPA authors
	if ( $( id ).data( "id" ) ) {
	    if ( mod_auth[ $( id ).data( "id" ) ].img ) {
		$( '#newModal [name$="P18"]').attr( "src", "https://www.eighteenthcenturypoetry.org/images/authors/"+mod_auth[ $( id ).data( "id" ) ].img );
		$( '#newModal fieldset#wd-image').css( "display", 'block' );
	    }
	    $( '#newModal [name="basic.name"]').val( mod_auth[ $( id ).data( "id" ) ].name );
	}
	break;

    case "work":
	/*
	  Written Work:
	  * P31 - type - Work
	  * P18 - image - Work
	  + P1476 - title - Work
	  * P571 - inception/written - Work
	  P135 - movement - Work
	  P136 - genre - Work
	  * P50+P50_1 - author(s [two max]) - Work

	  * P407 - language - Expression

	  * P98 - editor - Manifestation
	  * P123 - publisher - Manifestation
	  * P291 - place of publ - Manifestation
	  * P577 - date of publ - Manifestation
	  P872 - printer - Manifestation

	  * P217 - inventory no - Item
	  * P195 - collection - Item
	  * P127 - owned by (provenance) - Item

	  * P186 - material used
	  * P1104 - number of pages
	  * P282 - writing system
	  * P2048 - height
	  * P2049 - width
	  * P495 - country of origin
	  */

	// WD ID
	jf.schema.wd = { title:"Identifier – use this to autofill fields",type:"object"};
	jf.schema.wd.properties = {};
	jf.schema.wd.properties.wdid = { title:"Wikidata ID",key:"wdid",type:"string",description:"Enter a Wikidata written work identifier, e.g. Q16956983, then press the TAB key – <a href='https://www.wikidata.org/' class='external' target='_blank'>Search Wikidata</a>",default:((wde)?wde:"") };
	// metadata
	// work
	jf.schema.name = { title:"Title",key:"name",type:"string",required:true };
	jf.schema.description = { title:"Description",key:"description",type:"textarea" };
	jf.schema.P31 = { title:"Type",key:"P31",type:"string" };
	jf.schema.P571 = { title:"Written",key:"P571",type:"datetime-local" };
	jf.schema.P50 = { title:"Author",key:"P50",type:"string" };
	jf.schema.P50_1 = { title:"",key:"P50_1",type:"hidden" };
	// expression
	jf.schema.P407 = { title:"Language",key:"P407",type:"string" };
	jf.schema.other = { title:"Other form of realization",key:"other",type:"string" };
	// manifestation
	jf.schema.P98 = { title:"Editor",key:"P98",type:"string" };
	jf.schema.P123 = { title:"Publisher",key:"P123",type:"string" };
	jf.schema.P291 = { title:"Place of publication",key:"P291",type:"string" };
	jf.schema.P577 = { title:"Date of publication",key:"P577",type:"datetime-local" };
	// item
	jf.schema.P195 = { title:"Repository",key:"P195",type:"string" };
	jf.schema.P217 = { title:"Inventory no.",key:"P217",type:"string" };
	jf.schema.P127 = { title:"Provenance",key:"P127",type:"textarea" };
	// singleton
	jf.schema.P186 = { title:"Material",key:"P186",type:"string" };
	jf.schema.P1104 = { title:"Pages",key:"P1104",type:"string" };
	jf.schema.P282 = { title:"Writing system",key:"P282",type:"string" };
	jf.schema.P2048 = { title:"Height",key:"P2048",type:"string" };
	jf.schema.P2049 = { title:"Width",key:"P2049",type:"string" };
	jf.schema.P495 = { title:"Origin",key:"P495",type:"string" };
	jf.schema.label = { title:"Alternative label",key:"label",type:"string" };
	jf.schema.comment = { title:"Comment",key:"comment",type:"textarea" };
	jf.schema.seeAlso = { title:"See also",key:"seeAlso",type:"string" };
	jf.schema.isDefinedBy = { title:"Is defined by",key:"isDefinedBy",type:"string" };

	jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'><fieldset class='form-group' id='wd-image'><legend>Image</legend><img name='work.P18' src='' alt='[work image]' /></fieldset>" }, { key:"wd" }, { type:"selectfieldset", title:"Indicate the desired bibliographic entity level", items:[{ items:[ "name","description","P31","P571","P50","P50_1", { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]} ], legend:"Work", title:"Work – this information will create a work record", type:"fieldset" }, { type:"fieldset", legend:"Expression", title:"Expression  – this information will create an expression record", items:[ "name","description","P31","P571","P50","P50_1",{key:"P407",allowEmpty:true},"other", { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]} ]}, { type:"fieldset", legend:"Manifestation", title:"Manifestation – this information will create a manifestation (publication) record", items:[ "name","description","P31","P571","P50","P50_1","P407","other","P98","P123",{key:"P291",allowEmpty:true},"P577", { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]} ]}, { type:"fieldset", legend:"Item", title:"Item – this information will create an item (copy) record", items:[ "name","description","P31","P571","P50","P50_1","P407","other","P98","P123","P291","P577",{key:"P195",allowEmpty:true},"P217","P127", { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]} ]}, { type:"fieldset", legend:"Manuscript", title:"Manuscript – this information will create a manuscript record", items:[ "name","description","P31","P571","P50","P50_1","P407","other","P195","P217","P127","P186","P1104","P282","P2048","P2049",{key:"P495",allowEmpty:true}, { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]} ]}] } );
	// submit/cancel buttons
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Add work"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
	jf.form.push( { type:"htmlsnippet", value:"</div>"} );
	jf.onSubmit = function (errors, values) {
	    if (errors) {
		console.log( errors );
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
	    } else {
		var nodeexists = localizedKB.any( undefined, NS["skos"]("prefLabel"), $rdf.literal(values.name,'') );
		if ( !nodeexists ) {
		// create triples
		var level_label = [ 
				   "frbroo:F4_Manifestation_Singleton",
				   "crm:E84_Information_Carrier, frbroo:F5_Item",
				   "crm:E28_Conceptual_Object, frbroo:F32_Carrier_Production_Event",
				   "crm:E33_Linguistic_Object, frbroo:F2_Expression",
				   "crm:E33_Linguistic_Object, frbroo:F1_Work" 
				    ];
		var level = ((typeof values.P495 !== 'undefined')?level_label[0]:
			     ((typeof values.P195 !== 'undefined')?level_label[1]:
			      ((typeof values.P291 !== 'undefined')?level_label[2]:
			       ((typeof values.P407 !== 'undefined')?level_label[3]:
				level_label[4]))));
		var tripleid = "kb-"+uuidv4();
		triples += `\n`+NS[""](tripleid)+` a `+level+` ;\n`;
		triples += `skos:prefLabel """`+values.name+`""" ;\n`;
		triples += `crm:P1_is_identified_by """`+values.name+`""" ;\n`;
		if ( values.description ) {
		    triples += `rdfs:comment """`+values.description+`""" ;\n`;
		}
		// check if instance already exists
		var shownValDefined = $( "#"+jqu( onto[ 'crm:E33_Linguistic_Object' ].about )+" option" ).filter(function() { return this.value == values.name; }).data('value');
		// value from a dataList
		if ( shownValDefined ) {
		    // pre-defined value
		    triples += `crm:P1_is_identified_by "https://www.eighteenthcenturypoetry.org/works/`+shownValDefined.substring(1)+`.shtml" ;\n`;
		    triples += `crm:P1_is_identified_by "https://www.eighteenthcenturypoetry.org/works/#`+mod_work[ txt_id ].work+`" ;\n`;
		}
		if ( $(id).data("id") ) {
		    triples += `crm:P1_is_identified_by "https://www.eighteenthcenturypoetry.org/works/`+mod_work[ $(id).data("id") ].id+`.shtml" ;\n`;
		}
		if ( values.wd ) {
		    triples += `owl:sameAs wd:`+values.wd.wdid+` ;\n`;
		}
		if ( !shownValDefined && $( '#newModal [name$="P18"]').attr( "src") ) {
		    triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
		}
		triples += `dct:created "`+$.now()+`" ;\n.`;
		// work
		var tripleid_creator;
		if (values.P50 || values.P571) {
		    // creation event
		    triples += `\n`+NS[""](tripleid+"/creation")+` a crm:E65_Creation ;\n`;
		    triples += `skos:prefLabel """Creation of `+values.name+`""" ;\n`;
		    triples += `crm:P94_has_created `+NS[""](tripleid)+` ;\n`;
		    triples += `dct:created "`+$.now()+`" ;\n.`;
		    if ( values.P50 ) {
			// check if instances already exist
			var shownValDefined = $( "#"+jqu( onto[ "crm:E21_Person" ].about )+" option" ).filter(function() { return this.value == values.P50; }).data('value');
			// value from a dataList
			if ( shownValDefined ) {
			    if ( shownValDefined.startsWith( '#' ) ) {
				// pre-defined value
				tripleid_creator = "kb-"+uuidv4();
				triples += `\n`+NS[""](tripleid_creator)+` a crm:E21_Person ;\n`;
				triples += `skos:prefLabel """`+values.P50+`""" ;\n`;
				triples += `crm:P1_is_identified_by """`+values.P50+`""" ;\n`;
				triples += `crm:P1_is_identified_by "https://www.eighteenthcenturypoetry.org/authors/`+shownValDefined.substring(1)+`.shtml" ;\n`;
				if ( mod_auth[ shownValDefined.substring(1) ] && mod_auth[ shownValDefined.substring(1) ].viaf ) {
				    triples += `owl:sameAs viaf:`+mod_auth[ shownValDefined.substring(1) ].viaf+` ;\n`;
				}
				if ( mod_auth[ shownValDefined.substring(1) ] && mod_auth[ shownValDefined.substring(1) ].img ) {
				    triples += `crm:P138i_has_representation "https://www.eighteenthcenturypoetry.org/images/authors/`+mod_auth[ shownValDefined.substring(1) ].img+`" ;\n`;
				}
				triples += `dct:created "`+$.now()+`" ;\n.`;
			    } else {
				// graph value
				tripleid_creator = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			    }
			} else {
			    tripleid_creator = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_creator)+` a crm:E21_Person ;\n`;
			    triples += `skos:prefLabel """`+values.P50+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values.P50+`""" ;\n`;
			    if ( !shownValDefined && $( '#newModal [name$="P18"]').attr( "src") ) {
				triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
			    }
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/creation")+` crm:P14_carried_out_by `+NS[""](tripleid_creator)+` ;\n.`;
		    }
		    if ( values.P571 ) {
			var tripleid_date;
			shownValDefined = undefined;
			// check if instance already exists
			shownValDefined = $( "#"+jqu( onto[ "crm:E52_Time-Span" ].about )+" option" ).filter(function() { return this.value == values.P571; }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_date = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_date = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_date)+` a crm:E52_Time-Span ;\n`;
			    triples += `skos:prefLabel """Date of creation of `+values.name+`""" ;\n`;
			    triples += `crm:P82_at_some_time_within "`+values.P571+`"^^xs:date ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/creation")+` crm:P4_has_time-span `+NS[""](tripleid_date)+` ;\n.`;
		    }
		}
		if ( values.P407 ) {
		    triples += `\n`+NS[""](tripleid)+` crm:P72_has_language """`+values.P407+`""" ;\n.`;
		}
		if ( values.other ) {
		    triples += `\n`+NS[""](tripleid)+` crm:P103_was_intended_for """`+values.other+`""" ;\n.`;
		}
		if ( values.P98 || values.P123 || values.P291 || values.P577 ) {
		    // publication event
		    triples += `\n`+NS[""](tripleid+"/publication")+` a crm:E12_Production ;\n`;
		    triples += `skos:prefLabel """Publication of `+values.name+`""" ;\n`;
		    triples += `dct:created "`+$.now()+`" ;\n.`;
		    if ( values.P98 ) {
			triples += `\n`+NS[""](tripleid+"/publication")+` crm:P14_carried_out_by `+NS[""](tripleid_creator)+` ;\n.`;
		    }
		    if ( values.P123 ) {
			// publisher
			shownValDefined = $( "#"+jqu( onto[ "crm:E39_Actor" ].about )+" option" ).filter(function() { return this.value == values.P123; }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_publisher = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_publisher = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_publisher)+` a crm:E39_Actor ;\n`;
			    triples += `skos:prefLabel """`+values.P123+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values.P123+`""" ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/publication")+` crm:P14_carried_out_by `+NS[""](tripleid_publisher)+` ;\n.`;
		    }
		    if ( values.P291 ) {
			var tripleid_place;
			shownValDefined = undefined;
			// check if instance already exists
			shownValDefined = $( "#"+jqu( onto[ "crm:E53_Place" ].about )+" option" ).filter(function() { return this.value == values.P291; }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_place = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_place = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_place)+` a crm:E53_Place ;\n`;
			    triples += `skos:prefLabel """`+values.P291+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values.P291+`""" ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/publication")+` crm:P7_took_place_at `+NS[""](tripleid_place)+` ;\n.`;
		    }
		    if ( values.P577 ) {
			var tripleid_date;
			shownValDefined = undefined;
			// check if instance already exists
			shownValDefined = $( "#"+jqu( onto[ "crm:E52_Time-Span" ].about )+" option" ).filter(function() { return this.value == values.P577; }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_date = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_date = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_date)+` a crm:E52_Time-Span ;\n`;
			    triples += `skos:prefLabel """Date of publication of `+values.name+`""" ;\n`;
			    triples += `crm:P82_at_some_time_within "`+values.P577+`"^^xs:date ;\n`
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid+"/publication")+` crm:P4_has_time-span `+NS[""](tripleid_date)+` ;\n.`;
		    }
		}
		if ( values.P195 || values.P217 || values.P127 ) {
		    // item
		    if ( values.P195 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P52_has_current_owner """`+values.P195+`""" ;\n.`;
		    }
		    if ( values.P127 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P51_has_former_or_current_owner """`+values.P127+`""" ;\n.`;
		    }
		    if ( values.P217 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P48_has_preferred_identifier """`+values.P217+`""" ;\n.`;
		    }
		}
		if ( values.P186 || values.P1104 || values.P282 || values.P2048 || values.P2049 || values.P495 ) {
		    // singleton
		    if ( values.P186 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P45_consists_of """`+values.P186+`""" ;\n.`;
		    }
		    if ( values.P2048 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P43_has_dimension """`+values.P2048+`""" ;\n.`;
		    }
		    if ( values.P2049 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P43_has_dimension """`+values.P2049+`""" ;\n.`;
		    }
		    if ( values.P1104 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P39i_was_measured_by """`+values.P1104+`""" ;\n.`;
		    }
		    if ( values.P282 ) { // see also crmtex:TXP1 (used writing system)
			triples += `\n`+NS[""](tripleid)+` wdt:P282 """`+values.P282+`""" ;\n.`;
		    }
		    if ( values.P495 ) { // see also crm:P27i_was_origin_of E9_Move
			triples += `\n`+NS[""](tripleid)+` wdt:P495 """`+values.P495+`""" ;\n.`;
		    }
				    
		}
		if ( values.P31 ) {
		    var P31_parts = values["P31"].split( ";" );
		    $.each( P31_parts, function(i,v) {
			    triples += `\n`+NS[""](tripleid)+` crm:P2_has_type """`+v+`""" ;\n.`;
			});
		}
		if ( values.label ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:label """`+values.label+`""" ;\n.`;
		}
		if ( values.comment ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:comment """`+values.comment+`""" ;\n.`;
		}
		if ( values.seeAlso ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:seeAlso """`+values.seeAlso+`""" ;\n.`;
		}
		if ( values.isDefinedBy ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:isDefinedBy """`+values.isDefinedBy+`""" ;\n.`;
		}
		// insert triples into graph
		try {
		    $rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		    message = ``;
		    mod_display( localizedKB, message, "success" );
		} catch (err) {
		    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		    mod_display( localizedKB, message, "danger" );
		    console.log( err );
		}
		$( "#newModal" ).modal( 'hide' );
		new_id = NS[""](tripleid).value;
		} else {
		    message = `<b>Oh snap!</b> A node with this name already exists.`;
		    show_alert_mod( message, "danger" );
		}
	    }
	};
	create_form( "Create a Work record", "wd-work", jf );
	$( "#newModal input[name='name']" ).attr( "list", onto[ 'crm:E33_Linguistic_Object' ].about );
	$( "#newModal input[name='P50']" ).attr( "list", onto[ 'crm:E21_Person' ].about );
	$( "#newModal input[name='P98']" ).attr( "list", onto[ 'crm:E21_Person' ].about );
	$( "#newModal input[name='P123']" ).attr( "list", onto[ 'crm:E21_Person' ].about );
	$( "#newModal input[name='P291']" ).attr( "list", onto[ 'crm:E53_Place' ].about );
	$( "#newModal input[name$='P571']" ).attr( "list", onto[ 'crm:E52_Time-Span' ].about );
	$( "#newModal input[name$='P577']" ).attr( "list", onto[ 'crm:E52_Time-Span' ].about );
	$( "datalist#"+jqu( 'http://www.cidoc-crm.org/cidoc-crm/E33_Linguistic_Object' )+" option[data-value^='http']" ).attr("disabled","disabled");
	// use default values for ECPA authors
	if ( $(id).data("id") ) {
	    var authors = aut_id.split( "|" );
	    $( "#newModal input[name='P50']" ).val( mod_auth[ authors[0] ].name );
	    if ( authors[1] ) {
		$( "#newModal input[name='P50_1']" ).val( mod_auth[ authors[1] ].name ); // if author/translator
	    }
	    $( '#newModal [name="name"]').val( mod_work[ $( id ).data( "id" ) ].title );
	}
	$( "#newModal" ).modal('show');
	break;

    case "event":
	/*
	  Event: E5, F8
	  * P31 - type
	  * P18 - image
	  P17 - country
	  * P276/P766 - location
	  P527 - has part
	  P793 - significat developments
	  + P580 - start
	  + P582 - end
	  * P585 - point in time
	  P664 - organizer
	  * P710 - participant
	  P1132 - number of participants
	  P1319 - earliest date
	*/

	// WD ID
	jf.schema.wd = { title:"Identifier – use this to autofill fields",type:"object"};
	jf.schema.wd.properties = {};
	jf.schema.wd.properties.wdid = { title:"Wikidata ID",key:"wdid",type:"string",description:"Enter a Wikidata event identifier, e.g. Q6539, then press the TAB key – <a href='https://www.wikidata.org/' class='external' target='_blank'>Search Wikidata</a>",default:((wde)?wde:"") };
	// metadata
	jf.schema.name = { title:"Name",key:"name",type:"string",required:true };
	jf.schema.description = { title:"Description",key:"description",type:"textarea" };
	jf.schema.P31 = { title:"Type",key:"P31",type:"string" };
	// location
	jf.schema.P276 = { title:"Location of event",key:"P276",type:"string" };
	// date
	jf.schema.P585 = { title:"Date of event",key:"P585",type:"datetime-local" };
	// participants
	jf.schema.P710 = { title:"Participants",key:"P710",type:"array",items:{ type:"object",title:"Actor {{idx}}",properties:{ "actor":{ type:"string",title:"Name",required:true}} }};
	jf.schema.label = { title:"Alternative label",key:"label",type:"string" };
	jf.schema.comment = { title:"Comment",key:"comment",type:"textarea" };
	jf.schema.seeAlso = { title:"See also",key:"seeAlso",type:"string" };
	jf.schema.isDefinedBy = { title:"Is defined by",key:"isDefinedBy",type:"string" };

	jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'><fieldset class='form-group' id='wd-image'><legend>Image</legend><img name='event.P18' src='' alt='[event image]' /></fieldset>" }, { key:"wd" }, { items:[ "name","description","P31" ], legend:"Event", title:"Event – this information will create an event record", type:"fieldset" }, { items:[ "P276" ], legend:"Location", title:"Location – this information will create an event location record", type:"fieldset" }, { items:[ "P585" ], legend:"Date", title:"Date – this information will create a date of event record", type:"fieldset" }, { items:[ {key:"P710", "onClick": function (evt) {
			    var flag21 = document.querySelectorAll('input[name*="P710"]');
			    flag21.forEach(function (item, index) {
				    flag21[index].setAttribute( "list",onto[ 'crm:E39_Actor' ].about );
				});
			}} ], legend:"Participants", title:"Participants – this information will create one or more actor records", type:"fieldset" }, { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]});
	// submit/cancel buttons
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Add event"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
	jf.form.push( { type:"htmlsnippet", value:"</div>"} );
	jf.onSubmit = function (errors, values) {
	    if (errors) {
		console.log( errors );
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
	    } else {			
		var nodeexists = localizedKB.any( undefined, NS["skos"]("prefLabel"), $rdf.literal(values.name,'') );
		if ( !nodeexists ) {

		var tripleid = "kb-"+uuidv4();
		triples += `\n`+NS[""](tripleid)+` a crm:E5_Event ;\n`;
		triples += `skos:prefLabel """`+values.name+`""" ;\n`;
		triples += `crm:P1_is_identified_by """`+values.name+`""" ;\n`;
		if ( values.description ) {
		    triples += `crm:P3_has_note """`+values.description+`""" ;\n`;
		}
		// check if instance already exists
		var shownValDefined = $( "#"+jqu( onto[ "crm:E5_Event" ].about )+" option" ).filter(function() { return this.value == values.name; }).data('value');
		// value from a dataList
		if ( values.wd ) {
		    triples += `owl:sameAs wd:`+values.wd.wdid+` ;\n`;						
		}
		if ( $( '#newModal [name$="P18"]').attr( "src") ) {
		    triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
		}
		triples += `dct:created "`+$.now()+`" ;\n.`;
		// place
		if ( values.P276 ) {
		    var tripleid_place;
		    shownValDefined = undefined;
		    // check if instance already exists
		    shownValDefined = $( "#"+jqu( onto[ "crm:E53_Place" ].about )+" option" ).filter(function() { return this.value == values.P276; }).data('value');
		    if ( shownValDefined ) {
			// value from a dataList
			tripleid_place = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
		    } else {
			// new value
			tripleid_place = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid_place)+` a crm:E53_Place ;\n`;
			triples += `skos:prefLabel """`+values.P276+`""" ;\n`;
			triples += `crm:P1_is_identified_by """`+values.P276+`""" ;\n`;
			triples += `dct:created "`+$.now()+`" ;\n.`;
		    }
		    triples += `\n`+NS[""](tripleid)+` crm:P7_took_place_at `+NS[""](tripleid_place)+` ;\n.`;
		}
		// date
		if ( values.P585 ) {
		    var tripleid_date;
		    shownValDefined = undefined;
		    // check if instance already exists
		    shownValDefined = $( "#"+jqu( onto[ "crm:E52_Time-Span" ].about )+" option" ).filter(function() { return this.value == values.P585; }).data('value');
		    if ( shownValDefined ) {
			// value from a dataList
			tripleid_date = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
		    } else {
			// new value
			tripleid_date = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid_date)+` a crm:E52_Time-Span ;\n`;
			triples += `skos:prefLabel """Date of `+values.name+`""" ;\n`;
			triples += `crm:P82_at_some_time_within "`+values.P585+`"^^xs:date ;\n`;
			triples += `dct:created "`+$.now()+`" ;\n.`;
		    }
		    triples += `\n`+NS[""](tripleid)+` crm:P4_has_time-span `+NS[""](tripleid_date)+` ;\n.`;
		}
		if ( values.P710 ) {
		    $.each( values.P710, function(i,v) {
			    var tripleid_part = '';
			    // check if instance already exists
			    var shownValDefined = $( "#"+jqu( onto[ "crm:E39_Actor" ].about )+" option" ).filter(function() { return this.value == v.actor; }).data('value');
			    // value from a dataList
			    if ( shownValDefined ) {
				if ( shownValDefined.startsWith( '#' ) ) {
				    // pre-defined value
				    tripleid_part = "kb-"+uuidv4();
				    triples += `\n`+NS[""](tripleid_part)+` a crm:E39_Actor ;\n`;
				    triples += `skos:prefLabel """`+v.actor+`""" ;\n`;
				    triples += `crm:P1_is_identified_by """`+v.actor+`""" ;\n`;
				    triples += `crm:P1_is_identified_by "https://www.eighteenthcenturypoetry.org/authors/`+shownValDefined.substring(1)+`.shtml" ;\n`;
				    if ( mod_auth[ shownValDefined.substring(1) ] && mod_auth[ shownValDefined.substring(1) ].viaf ) {
					triples += `owl:sameAs viaf:`+mod_auth[ shownValDefined.substring(1) ].viaf+` ;\n`;
				    }
				    if ( mod_auth[ shownValDefined.substring(1) ] && mod_auth[ shownValDefined.substring(1) ].img ) {
					triples += `crm:P138i_has_representation "https://www.eighteenthcenturypoetry.org/images/authors/`+mod_auth[ shownValDefined.substring(1) ].img+`" ;\n`;
				    }
				    triples += `dct:created "`+$.now()+`" ;\n.`;
				} else {
				    // graph value
				    tripleid_part = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
				}
			    } else {
				tripleid_part = "kb-"+uuidv4();
				triples += `\n`+NS[""](tripleid_part)+` a crm:E39_Actor ;\n`;
				triples += `skos:prefLabel """`+v.actor+`""" ;\n`;
				triples += `crm:P1_is_identified_by """`+v.actor+`""" ;\n`;
				if ( !shownValDefined && $( '#newModal [name$="P18"]').attr( "src") ) {
				    triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
				}
				triples += `dct:created "`+$.now()+`" ;\n.`;
			    }
			    triples += `\n`+NS[""](tripleid)+` crm:P11_had_participant `+NS[""](tripleid_part)+` ;\n.`;
			});
		}
		if ( values.P31 ) {
		    var P31_parts = values["P31"].split( ";" );
		    $.each( P31_parts, function(i,v) {
			    triples += `\n`+NS[""](tripleid)+` crm:P2_has_type """`+v+`""" ;\n.`;
			});
		}
		if ( values.label ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:label """`+values.label+`""" ;\n.`;
		}
		if ( values.comment ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:comment """`+values.comment+`""" ;\n.`;
		}
		if ( values.seeAlso ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:seeAlso """`+values.seeAlso+`""" ;\n.`;
		}
		if ( values.isDefinedBy ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:isDefinedBy """`+values.isDefinedBy+`""" ;\n.`;
		}
		// insert triples into graph
		try {
		    $rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		    message = ``;
		    mod_display( localizedKB, message, "success" );
		} catch (err) {
		    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		    mod_display( localizedKB, message, "danger" );
		    console.log( err );
		}
		$( "#newModal" ).modal( 'hide' );
		new_id = NS[""](tripleid).value;
		} else {
		    message = `<b>Oh snap!</b> A node with this name already exists.`;
		    show_alert_mod( message, "danger" );
		}
	    }
	};
	create_form( "Create an Event record", "wd-event", jf );
	$( "#newModal input[name='name']" ).attr( "list", onto[ 'crm:E5_Event' ].about );
	$( "datalist#"+jqu( 'http://www.cidoc-crm.org/cidoc-crm/E5_Event' )+" option[data-value^='http']" ).attr("disabled","disabled");
	$( "#newModal input[name$='P276']" ).attr( "list", onto[ 'crm:E53_Place' ].about );
	$( "#newModal input[name$='P585']" ).attr( "list", onto[ 'crm:E52_Time-Span' ].about );
	$( "#newModal input[name*='P710']" ).attr( "list", onto[ 'crm:E39_Actor' ].about );
	if ( $(id).attr("href").startsWith( 'http' ) ) {
	    $( '#newModal #jForm .modal-body *').attr( "readonly", "readonly" );
	}
	$( "#newModal" ).modal('show');
	break;

    case "place":
	/*
	  Place: E53, F9
	  * P31 - type
	  * P18 - image
	  + P1448/P1705 - official name
	  P527 - has part
	  * P17 - country
	  P47 - shares border with
	  P571 - inception/founded
	  P30 - continent
	  P793 - significat developments
	  P276 - location
	  P625 - coordinates
	  P131 - administrative area
	  P1082 - population
	  P2046 - area
	*/

	// WD ID
	jf.schema.wd = { title:"Identifier – use this to autofill fields",type:"object"};
	jf.schema.wd.properties = {};
	jf.schema.wd.properties.wdid = { title:"Wikidata ID",key:"wdid",type:"string",description:"Enter a Wikidata place identifier, e.g. Q207639, then press the TAB key – <a href='https://www.wikidata.org/' class='external' target='_blank'>Search Wikidata</a>",default:((wde)?wde:"") };
	// metadata
	jf.schema.name = { title:"Name",key:"name",type:"string",required:true };
	jf.schema.description = { title:"Description",key:"description",type:"textarea" };
	jf.schema.P31 = { title:"Type",key:"P31",type:"string" };
	// location
	jf.schema.P17 = { title:"Country",key:"P17",type:"string" };
	jf.schema.label = { title:"Alternative label",key:"label",type:"string" };
	jf.schema.comment = { title:"Comment",key:"comment",type:"textarea" };
	jf.schema.seeAlso = { title:"See also",key:"seeAlso",type:"string" };
	jf.schema.isDefinedBy = { title:"Is defined by",key:"isDefinedBy",type:"string" };

	jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'><fieldset class='form-group' id='wd-image'><legend>Image</legend><img name='place.P18' src='' alt='[place image]' /></fieldset>" }, { key:"wd" }, { items:[ "name","description","P31" ], legend:"Place", title:"Place – this information will create a place record", type:"fieldset" }, { items:[ "P17" ], legend:"Country", title:"Country – this information will create a place record", type:"fieldset" }, { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]});
	// submit/cancel buttons
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Add place"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
	jf.form.push( { type:"htmlsnippet", value:"</div>"} );
	jf.onSubmit = function (errors, values) {
	    if (errors) {
		console.log( errors );
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
	    } else {			
		var nodeexists = localizedKB.any( undefined, NS["skos"]("prefLabel"), $rdf.literal(values.name,'') );
		if ( !nodeexists ) {

		var tripleid = "kb-"+uuidv4();
		triples += `\n`+NS[""](tripleid)+` a crm:E53_Place ;\n`;
		triples += `skos:prefLabel """`+values.name+`""" ;\n`;
		triples += `crm:P1_is_identified_by """`+values.name+`""" ;\n`;
		if ( values.description ) {
		    triples += `crm:P3_has_note """`+values.description+`""" ;\n`;
		}
		// check if instance already exists
		var shownValDefined = $( "#"+jqu( onto[ "crm:E53_Place" ].about )+" option" ).filter(function() { return this.value == values.name; }).data('value');
		// value from a dataList
		if ( values.wd ) {
		    triples += `owl:sameAs wd:`+values.wd.wdid+` ;\n`;						
		}
		if ( $( '#newModal [name$="P18"]').attr( "src") ) {
		    triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
		}
		triples += `dct:created "`+$.now()+`" ;\n.`;
		// place
		if ( values.P17 ) {
		    var tripleid_place;
		    shownValDefined = undefined;
		    // check if instance already exists
		    shownValDefined = $( "#"+jqu( onto[ "crm:E53_Place" ].about )+" option" ).filter(function() { return this.value == values.P17; }).data('value');
		    if ( shownValDefined ) {
			// value from a dataList
			tripleid_place = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
		    } else {
			// new value
			tripleid_place = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid_place)+` a crm:E53_Place ;\n`;
			triples += `skos:prefLabel """`+values.P17+`""" ;\n`;
			triples += `crm:P1_is_identified_by """`+values.P17+`""" ;\n`;
			triples += `dct:created "`+$.now()+`" ;\n.`;
		    }
		    triples += `\n`+NS[""](tripleid)+` crm:P89_falls_within `+NS[""](tripleid_place)+` ;\n.`;
		}
		if ( values.P31 ) {
		    var P31_parts = values["P31"].split( ";" );
		    $.each( P31_parts, function(i,v) {
			    triples += `\n`+NS[""](tripleid)+` crm:P2_has_type """`+v+`""" ;\n.`;
			});
		}
		if ( values.label ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:label """`+values.label+`""" ;\n.`;
		}
		if ( values.comment ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:comment """`+values.comment+`""" ;\n.`;
		}
		if ( values.seeAlso ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:seeAlso """`+values.seeAlso+`""" ;\n.`;
		}
		if ( values.isDefinedBy ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:isDefinedBy """`+values.isDefinedBy+`""" ;\n.`;
		}
		// insert triples into graph
		try {
		    $rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		    message = ``;
		    mod_display( localizedKB, message, "success" );
		} catch (err) {
		    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		    mod_display( localizedKB, message, "danger" );
		    console.log( err );
		}
		$( "#newModal" ).modal( 'hide' );
		new_id = NS[""](tripleid).value;
		} else {
		    message = `<b>Oh snap!</b> A node with this name already exists.`;
		    show_alert_mod( message, "danger" );
		}
	    }
	};
	create_form( "Create a Place record", "wd-place", jf );
	$( "#newModal input[name='name']" ).attr( "list", onto[ 'crm:E53_Place' ].about );
	$( "datalist#"+jqu( 'http://www.cidoc-crm.org/cidoc-crm/E5_Event' )+" option[data-value^='http']" ).attr("disabled","disabled");
	$( "#newModal input[name$='P17']" ).attr( "list", onto[ 'crm:E53_Place' ].about );
	if ( $(id).attr("href").startsWith( 'http' ) ) {
	    $( '#newModal #jForm .modal-body *').attr( "readonly", "readonly" );
	}
	$( "#newModal" ).modal('show');
	break;

    case "object":
	/*
	  Object: E70
	  * P31 - type
	  * P18 - image
	  P17 - country
	  * P571 - inception/created (date)
	  * P1071 - place made
	  * P170 - creator (man-made)
	  * P61 - dicoverer/inventor/originator (conceptual)
	  P2348 - time period
	  * P186 - material used
	  * P361 - part of (conceptually of origin/tradition/...)
	  P189 - discovery place
	  P2048 - height
	  P2049 - width
	  P2043 - length
	  P2610 - depth
	  P180 - depicts
	  P276 - location (current)
	  * P195 - collection
	  * P217 - inventory no
	  * P127 - owner (provenance)
	  */

	// WD ID
	jf.schema.wd = { title:"Identifier – use this to autofill fields",type:"object"};
	jf.schema.wd.properties = {};
	jf.schema.wd.properties.wdid = { title:"Wikidata ID",key:"wdid",type:"string",description:"Enter a Wikidata object identifier, e.g. Q4373352, then press the TAB key – <a href='https://www.wikidata.org/' class='external' target='_blank'>Search Wikidata</a>",default:((wde)?wde:"") };
	// metadata
	jf.schema.name = { title:"Name",key:"name",type:"string",required:true };
	jf.schema.description = { title:"Description",key:"description",type:"textarea" };
	jf.schema.P31 = { title:"Type",key:"P31",type:"string" };
	// production
	jf.schema.P170 = { title:"Creator/Originator",key:"P170",type:"string" };
	jf.schema.P571 = { title:"Date",key:"P571",type:"datetime-local" };
	jf.schema.P1071 = { title:"Place",key:"P1071",type:"string" };
	jf.schema.P186 = { title:"Material",key:"P186",type:"string" };
	// part of
	jf.schema.P361 = { title:"Origin",key:"P361",type:"string" };
	// location 
	jf.schema.P195 = { title:"Repository",key:"P195",type:"string" };
	jf.schema.P217 = { title:"Inventory no.",key:"P217",type:"string" };
	jf.schema.P127 = { title:"Provenance",key:"P127",type:"textarea" };
	jf.schema.label = { title:"Alternative label",key:"label",type:"string" };
	jf.schema.comment = { title:"Comment",key:"comment",type:"textarea" };
	jf.schema.seeAlso = { title:"See also",key:"seeAlso",type:"string" };
	jf.schema.isDefinedBy = { title:"Is defined by",key:"isDefinedBy",type:"string" };

	jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'><fieldset class='form-group' id='wd-image'><legend>Image</legend><img name='place.P18' src='' alt='[place image]' /></fieldset>" }, { key:"wd" }, { items:[ "name","description","P31" ], legend:"Object", title:"Object – this information will create an object record", type:"fieldset" }, { items:[ "P170","P571","P1071","P186" ], legend:"Existence", title:"Existence – this information will create a beginning of existence record", type:"fieldset" }, { items:[ "P361" ], legend:"Origin", title:"Origin – this information will associate a conceptual object with a conceptualization (origin, tradtition, etc.)", type:"fieldset" }, { items:[ "P195","P217","P127" ], legend:"Location", title:"Location – this information will create a location record for the object", type:"fieldset" }, { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]});
	// submit/cancel buttons
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Add object"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
	jf.form.push( { type:"htmlsnippet", value:"</div>"} );
	jf.onSubmit = function (errors, values) {
	    if (errors) {
		console.log( errors );
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
	    } else {
		var nodeexists = localizedKB.any( undefined, NS["skos"]("prefLabel"), $rdf.literal(values.name,'') );
		if ( !nodeexists ) {
		var tripleid = "kb-"+uuidv4();
		triples += `\n`+NS[""](tripleid)+` a crm:E70_Thing ;\n`;
		triples += `skos:prefLabel """`+values.name+`""" ;\n`;
		triples += `crm:P1_is_identified_by """`+values.name+`""" ;\n`;
		if ( values.description ) {
		    triples += `crm:P3_has_note """`+values.description+`""" ;\n`;
		}
		// check if instance already exists
		var shownValDefined = $( "#"+jqu( onto[ "crm:E70_Thing" ].about )+" option" ).filter(function() { return this.value == values.name; }).data('value');
		// value from a dataList
		if ( values.wd ) {
		    triples += `owl:sameAs wd:`+values.wd.wdid+` ;\n`;						
		}
		if ( $( '#newModal [name$="P18"]').attr( "src") ) {
		    triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
		}
		triples += `dct:created "`+$.now()+`" ;\n.`;
		// existence event
		triples += `\n`+NS[""](tripleid+"/existence")+` a crm:E63_Beginning_of_Existence ;\n`;
		triples += `skos:prefLabel """Existence of `+values.name+`""" ;\n`;
		triples += `crm:P92_brought_into_existence `+NS[""](tripleid)+` ;\n`;
		triples += `dct:created "`+$.now()+`" ;\n.`;
		var tripleid_creator;
		if ( values.P170 ) {
		    // check if instances already exist
		    var shownValDefined = $( "#"+jqu( onto[ "crm:E21_Person" ].about )+" option" ).filter(function() { return this.value == values.P170; }).data('value');
		    // value from a dataList
		    if ( shownValDefined ) {
			if ( shownValDefined.startsWith( '#' ) ) {
			    // pre-defined value
			    tripleid_creator = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_creator)+` a crm:E21_Person ;\n`;
			    triples += `skos:prefLabel """`+values.P170+`""" ;\n`;
			    triples += `crm:P1_is_identified_by """`+values.P170+`""" ;\n`;
			    triples += `crm:P1_is_identified_by "https://www.eighteenthcenturypoetry.org/authors/`+shownValDefined.substring(1)+`.shtml" ;\n`;
			    if ( mod_auth[ shownValDefined.substring(1) ] && mod_auth[ shownValDefined.substring(1) ].viaf ) {
				triples += `owl:sameAs viaf:`+mod_auth[ shownValDefined.substring(1) ].viaf+` ;\n`;
			    }
			    if ( mod_auth[ shownValDefined.substring(1) ] && mod_auth[ shownValDefined.substring(1) ].img ) {
				triples += `crm:P138i_has_representation "https://www.eighteenthcenturypoetry.org/images/authors/`+mod_auth[ shownValDefined.substring(1) ].img+`" ;\n`;
			    }
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			} else {
			    // graph value
			    tripleid_creator = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			}
		    } else {
			tripleid_creator = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid_creator)+` a crm:E21_Person ;\n`;
			triples += `skos:prefLabel """`+values.P170+`""" ;\n`;
			triples += `crm:P1_is_identified_by """`+values.P170+`""" ;\n`;
			if ( !shownValDefined && $( '#newModal [name$="P18"]').attr( "src") ) {
			    triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
			}
			triples += `dct:created "`+$.now()+`" ;\n.`;
		    }
		    triples += `\n`+NS[""](tripleid+"/existence")+` crm:P14_carried_out_by `+NS[""](tripleid_creator)+` ;\n.`;
		}
		// place
		if ( values.P1071 ) {
		    var tripleid_place;
		    shownValDefined = undefined;
		    // check if instance already exists
		    shownValDefined = $( "#"+jqu( onto[ "crm:E53_Place" ].about )+" option" ).filter(function() { return this.value == values.P1071; }).data('value');
		    if ( shownValDefined ) {
			// value from a dataList
			tripleid_place = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
		    } else {
			// new value
			tripleid_place = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid_place)+` a crm:E53_Place ;\n`;
			triples += `skos:prefLabel """`+values.P1071+`""" ;\n`;
			triples += `crm:P1_is_identified_by """`+values.P1071+`""" ;\n`;
			triples += `dct:created "`+$.now()+`" ;\n.`;
		    }
		    if ( values.P170 ) {
			triples += `\n`+NS[""](tripleid+"/existence")+` crm:P7_took_place_at `+NS[""](tripleid_place)+` ;\n.`;
		    } else {
			triples += `\n`+NS[""](tripleid)+` crm:P53_has_former_or_current_location `+NS[""](tripleid_place)+` ;\n.`;
		    }
		}
		// date
		if ( values.P571 ) {
		    var tripleid_date;
		    shownValDefined = undefined;
		    // check if instance already exists
		    shownValDefined = $( "#"+jqu( onto[ "crm:E52_Time-Span" ].about )+" option" ).filter(function() { return this.value == values.P571; }).data('value');
		    if ( shownValDefined ) {
			// value from a dataList
			tripleid_date = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
		    } else {
			// new value
			tripleid_date = "kb-"+uuidv4();
			triples += `\n`+NS[""](tripleid_date)+` a crm:E52_Time-Span ;\n`;
			triples += `skos:prefLabel """Date of `+values.name+`""" ;\n`;
			triples += `crm:P82_at_some_time_within "`+values.P571+`"^^xs:date ;\n`;
			triples += `dct:created "`+$.now()+`" ;\n.`;
		    }
		    triples += `\n`+NS[""](tripleid+"/existence")+` crm:P4_has_time-span `+NS[""](tripleid_date)+` ;\n.`;
		}
		if ( values.P186 ) {
		    triples += `\n`+NS[""](tripleid)+` crm:P45_consists_of """`+values.P186+`""" ;\n.`;
		}
		if ( values.P361 ) {
		    triples += `\n`+NS[""](tripleid)+` crm:P148i_is_component_of """`+values.P361+`""" ;\n.`;
		}
		if ( values.P195 || values.P217 || values.P127 ) {
		    if ( values.P195 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P52_has_current_owner """`+values.P195+`""" ;\n.`;
		    }
		    if ( values.P127 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P51_has_former_or_current_owner """`+values.P127+`""" ;\n.`;
		    }
		    if ( values.P217 ) {
			triples += `\n`+NS[""](tripleid)+` crm:P48_has_preferred_identifier """`+values.P217+`""" ;\n.`;
		    }
		}
		if ( values.P31 ) {
		    var P31_parts = values["P31"].split( ";" );
		    $.each( P31_parts, function(i,v) {
			    triples += `\n`+NS[""](tripleid)+` crm:P2_has_type """`+v+`""" ;\n.`;
			});
		}
		if ( values.label ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:label """`+values.label+`""" ;\n.`;
		}
		if ( values.comment ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:comment """`+values.comment+`""" ;\n.`;
		}
		if ( values.seeAlso ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:seeAlso """`+values.seeAlso+`""" ;\n.`;
		}
		if ( values.isDefinedBy ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:isDefinedBy """`+values.isDefinedBy+`""" ;\n.`;
		}
		// insert triples into graph
		try {
		    $rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		    message = ``;
		    mod_display( localizedKB, message, "success" );
		} catch (err) {
		    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		    mod_display( localizedKB, message, "danger" );
		    console.log( err );
		}
		$( "#newModal" ).modal( 'hide' );
		new_id = NS[""](tripleid).value;
		} else {
		    message = `<b>Oh snap!</b> A node with this name already exists.`;
		    show_alert_mod( message, "danger" );
		}
	    }
	};
	create_form( "Create an Object record", "wd-object", jf );
	$( "#newModal input[name='name']" ).attr( "list", onto[ 'crm:E70_Thing' ].about );
	$( "#newModal input[name$='P571']" ).attr( "list", onto[ 'crm:E52_Time-Span' ].about );
	$( "#newModal input[name$='P1071']" ).attr( "list", onto[ 'crm:E53_Place' ].about );
	$( "datalist#"+jqu( 'http://www.cidoc-crm.org/cidoc-crm/E70_Thing' )+" option[data-value^='http']" ).attr("disabled","disabled");

	if ( $(id).attr("href").startsWith( 'http' ) ) {
	    $( '#newModal #jForm .modal-body *').attr( "readonly", "readonly" );
	}
	$( "#newModal" ).modal('show');
	break;

    case "concept":
	/*
	  Concept:
	  * P31 - type
	  * P1343 - described by source
	  * P527 - has part
	  */

	// WD ID
	jf.schema.wd = { title:"Identifier – use this to autofill fields",type:"object"};
	jf.schema.wd.properties = {};
	jf.schema.wd.properties.wdid = { title:"Wikidata ID",key:"wdid",type:"string",description:"Enter a Wikidata concept identifier, e.g. Q12539, then press the TAB key – <a href='https://www.wikidata.org/' class='external' target='_blank'>Search Wikidata</a>",default:((wde)?wde:"") };
	// metadata
	jf.schema.name = { title:"Name",key:"name",type:"string",required:true };
	jf.schema.description = { title:"Description",key:"description",type:"textarea" };
	// Type
	jf.schema.P31 = { title:"Type",key:"P31",type:"string" };
	// Parts
	jf.schema.P527 = { title:"Parts",key:"P527",type:"textarea" };
	// Source
	jf.schema.P1343 = { title:"Source",key:"P1343",type:"string",required:true };
	jf.schema.label = { title:"Alternative label",key:"label",type:"string" };
	jf.schema.comment = { title:"Comment",key:"comment",type:"textarea" };
	jf.schema.seeAlso = { title:"See also",key:"seeAlso",type:"string" };
	jf.schema.isDefinedBy = { title:"Is defined by",key:"isDefinedBy",type:"string" };

	jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'><fieldset class='form-group' id='wd-image'><legend>Image</legend><img name='place.P18' src='' alt='[place image]' /></fieldset>" }, { key:"wd" }, { items:[ "name","description" ], legend:"Concept", title:"Concept – this information will create a concept record", type:"fieldset" }, { items:[ "P31","P527","P1343" ], legend:"", title:"Definition – a concept requires a source citation/identifier", type:"fieldset" }, { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]});
	// submit/cancel buttons
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Add concept"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
	jf.form.push( { type:"htmlsnippet", value:"</div>"} );
	jf.onSubmit = function (errors, values) {
	    if (errors) {
		console.log( errors );
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
	    } else {			
		var nodeexists = localizedKB.any( undefined, NS["skos"]("prefLabel"), $rdf.literal(values.name,'') );
		if ( !nodeexists ) {

		var tripleid = "kb-"+uuidv4();
		triples += `\n`+NS[""](tripleid)+` a crm:E28_Conceptual_Object ;\n`;
		triples += `skos:prefLabel """`+values.name+`""" ;\n`;
		triples += `crm:P1_is_identified_by """`+values.name+`""" ;\n`;
		if ( values.description ) {
		    triples += `crm:P3_has_note """`+values.description+`""" ;\n`;
		}
		// check if instance already exists
		var shownValDefined = $( "#"+jqu( onto[ "crm:E28_Conceptual_Object" ].about )+" option" ).filter(function() { return this.value == values.name; }).data('value');
		// value from a dataList
		if ( values.wd ) {
		    triples += `owl:sameAs wd:`+values.wd.wdid+` ;\n`;						
		}
		if ( $( '#newModal [name$="P18"]').attr( "src") ) {
		    triples += `crm:P138i_has_representation "`+$( '#newModal [name$="P18"]').attr( "src")+`" ;\n`;
		}
		triples += `dct:created "`+$.now()+`" ;\n.`;
		if ( values.P527 ) {
		    triples += `\n`+NS[""](tripleid)+` crm:P148_has_component """`+values.P527+`""" ;\n.`;
		}
		triples += `\n`+NS[""](tripleid)+` crm:P149_is_identified_by """`+values.P1343+`""" ;\n.`;
		if ( values.P31 ) {
		    var P31_parts = values["P31"].split( ";" );
		    $.each( P31_parts, function(i,v) {
			    triples += `\n`+NS[""](tripleid)+` crm:P2_has_type """`+v+`""" ;\n.`;
			});
		}
		if ( values.label ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:label """`+values.label+`""" ;\n.`;
		}
		if ( values.comment ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:comment """`+values.comment+`""" ;\n.`;
		}
		if ( values.seeAlso ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:seeAlso """`+values.seeAlso+`""" ;\n.`;
		}
		if ( values.isDefinedBy ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:isDefinedBy """`+values.isDefinedBy+`""" ;\n.`;
		}
		// insert triples into graph
		try {
		    $rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		    message = ``;
		    mod_display( localizedKB, message, "success" );
		} catch (err) {
		    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		    mod_display( localizedKB, message, "danger" );
		    console.log( err );
		}
		$( "#newModal" ).modal( 'hide' );
		new_id = NS[""](tripleid).value;
		} else {
		    message = `<b>Oh snap!</b> A node with this name already exists.`;
		    show_alert_mod( message, "danger" );
		}
	    }
	};
	create_form( "Create a Concept record", "wd-concept", jf );
	$( "#newModal input[name='name']" ).attr( "list", onto[ 'crm:E28_Conceptual_Object' ].about );
	$( "datalist#"+jqu( 'http://www.cidoc-crm.org/cidoc-crm/E28_Conceptual_Object' )+" option[data-value^='http']" ).attr("disabled","disabled");
	if ( $(id).attr("href").startsWith( 'http' ) ) {
	    $( '#newModal #jForm .modal-body *').attr( "readonly", "readonly" );
	}
	$( "#newModal" ).modal('show');
	break;

    case "argumentation":
	/*
	  Argumentation:
	  -> 3 types of argument (i.e. 3 ways to get to a I2_Belief):
	  [1. Observation (scientific)
	  UUID a S4_Observation ;
	  P140_assigned_attribute_to E1_CRM_Entity ; (to what was the attribute assigned)
	  P141_assigned E1_CRM_Entity ; (what was the attribute assigned)
	  J2_concluded_that I2_Belief . (my belief)]

	  2. Inference (humanistic)
	  UUID a I5_Inference_Making ;
	  J1_used_as_a_premise I2_Belief ; (someone else's or my own beliefs)
	  J3_applies I3_Inference_Logic ; (inferences)
	  J2_concluded_that I2_Belief . (my belief)

	  3. Belief adoption (general)
	  UUID a I7_Belief_Adoption ;
	  J6_adopted I2_Belief ; (someone else's beliefs)
	  J7_is_based_on_evidence E73_information_Object ; (evidence)
	  J2_concluded_that I2_Belief . (my belief)
				
	  UUID a I1_Argumentation ;
	  P14_carried_out_by E39_Actor ;
	  J2_concluded_that I2_Belief . (my beliefs)

	  UUID a I2_Belief ;
	  J4_that I4_Proposition_Set ;
	  J5_holds_to_be [true|false|unknown] .

	  UUID a I4_Proposition_Set ;
	  crm:P148_has_component BagOfPropositions-1 ... -n .

	  UUID a I3_Inference_Logic ;
	  crm:P148_has_component BagOfPropositions-a ... -z .

	  BagOfPropositions-1 a crm:E73_Information_Object, rdf:Statement ;
	  rdf:subject ... ;
	  rdf:predicate ... ;
	  rdf:object ... ;
	  rdfs:seeAlso """[e.g. source citation/URI]"""@en .
	  ...

	  BagOfPropositions-a a crm:E89_Propositional_Object, rdf:Statement ;
	  rdf:subject ... ;
	  rdf:predicate ... ;
	  rdf:object ... ;
	  rdfs:isIdentifiedBy """[e.g. source citation/URI]"""@en .
	  ...
	*/

	// argumentation
	jf.schema.name = { title:"Title",key:"name",type:"string",required:true };
	jf.schema.description = { title:"Description",key:"description",type:"textarea" };

	// Inference Making (I5)
	// process (J1 -> I2)
	jf.schema.iinputs = { "type": "array","items": { "type": "object","properties": {
		    "title": { "type": "string","title": "Premise (belief) {{idx}}"},
		}}};
	// logic (J3 -> I3)
	jf.schema.ilogic = { title:"Inference Logic/Methodology",key:"logic",type:"textarea" };
	// propositions (J4 -> I4)
	jf.schema.iprocess = { "type": "array","items": {"type": "object","properties": { 
		    "title": { "type": "string","title": "Belief {{idx}}", required:true }, "propositions": {
			"type": "array","items": { "type": "string", "title":"Proposition {{idx}} (follow the instructions in the Proposition-template)" }
		    }
		}}};
	// outcome (J5 -> I6)
	jf.schema.ibeliefs = { "type": "array","items": { "type": "object","properties": {
		    "value": { "type": "string","title": "Belief {{idx}} holds to be", enum:["","true","false","unknown"], required:true},
		}}};

	// Belief Adoption (I7)
	// process (J6 -> I2)
	jf.schema.aprocess = { "type": "array","items": { "type": "object","properties": {
		    "title": { "type": "string","title": "Adopted belief {{idx}}", required:true},
		}}};
	// evidence (J7 -> I4)
	jf.schema.aevidence = { "type": "array","items": { "type": "object","properties": {
		    "title": { "type": "string","title": "Evidence/proposition no. {{idx}} (follow the instructions in the Proposition-template)" },
		}}};
	// outcome (J5 -> I6)
	jf.schema.abeliefs = { "type": "array","items": { "type": "object","properties": {
		    "value": { "type": "string","title": "Belief {{idx}} holds to be", default:true, required:true, readonly:true},
		}}};
	jf.schema.label = { title:"Alternative label",key:"label",type:"string" };
	jf.schema.comment = { title:"Comment",key:"comment",type:"textarea" };
	jf.schema.seeAlso = { title:"See also",key:"seeAlso",type:"string" };
	jf.schema.isDefinedBy = { title:"Is defined by",key:"isDefinedBy",type:"string" };
			
	jf.form.push( { type:"htmlsnippet", value:"<div class='modal-body' id='modal-create'>" }, { type:"selectfieldset", title:"Indicate the type of argumentation", items:[ { type:"fieldset", legend:"Inference Making", title:"Inference Making  – this information will create an inference-based argumentation", items:[ "name","description", { type:"fieldset",title:"Inputs",items:[ {type: "array", items: { type:"section", items:[ { key:"iinputs[].title", "onClick": function (evt) { var flag21 = document.querySelectorAll('input[name*="iinputs"]');flag21.forEach(function (item, index) { flag21[index].setAttribute( "list",onto[ 'crminf:I2_Belief' ].about ); }); } }] }},"ilogic"]}, {type:"fieldset",title:"Inference",items:[ { type:"array","items": {"type": "section","items": [{key:"iprocess[].title",allowEmpty:true, "onClick": function (evt) { var flag21 = document.querySelectorAll('input[name*="iprocess"]'); flag21.forEach(function (item, index) { flag21[index].setAttribute( "list",onto[ 'crminf:I2_Belief' ].about ); }); }}, { type:"htmlsnippet", value:"<b>has components</b>" }, { "type": "array","items": [ { key:"iprocess[].propositions[]", "onClick": function (evt) { var flag21 = document.querySelectorAll('input[name*=".propositions"]'); flag21.forEach(function (item, index) { flag21[index].setAttribute( "list",onto[ 'crm:E73_Information_Object' ].about ); }); }} ] }]} } ]},  { type:"fieldset", title:"Outcomes",items: { type: "array", items: { type:"section", items: [{ key:"ibeliefs[].value",allowEmpty:true }] }}}, { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]} ]},
																					       { type:"fieldset", legend:"Belief Adoption", title:"Belief Adoption – this information will create a belief adoption argumentation", items:[ "name","description", { type:"fieldset",title:"Inputs",items:[ {type: "array", items: { type:"section", items:[ {key:"aprocess[].title",allowEmpty:true, "onClick": function (evt) { var flag21 = document.querySelectorAll('input[name*="aprocess"]'); flag21.forEach(function (item, index) { flag21[index].setAttribute( "list",onto[ 'crminf:I2_Belief' ].about ); }); } } ] }},{key:"aevidence",notitle:true, "onClick": function (evt) { var flag21 = document.querySelectorAll('input[name*="aevidence"]'); flag21.forEach(function (item, index) { flag21[index].setAttribute( "list",onto[ 'crm:E73_Information_Object' ].about ); }); } }]},{ type:"fieldset", title:"Outcomes",items: { type: "array", items: { type:"section", items: [{ key:"abeliefs[].value" }] }}}, { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]}] }],
		    /*
		      { items:[ "name","description",
		      { "type": "fieldset", "title": "Additional information &#x2014 optional", "expandable": true, "items": [ "label","comment","seeAlso","isDefinedBy" ]}], legend:"Observation", title:"Observation – this information will create an observational (scientific) argumentation", type:"fieldset" }] 
		    */
		    });
	// submit/cancel buttons
	jf.form.push( { type:"htmlsnippet", value:"</div><div class='modal-footer'>" } );
	jf.form.push( { type:"actions",items: [{type: "submit",title: "Add argumentation"},{type: "button",title: "Cancel",onClick: function(e) { $('#jForm')[0].reset(); $("#newModal").modal('hide'); } }]} );
	jf.form.push( { type:"htmlsnippet", value:"</div>"} );
	jf.onSubmit = function (errors, values) {
	    if (errors) {
		console.log( errors );
		message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		show_alert_mod( message, "danger" );
	    } else {
		// create triples
		var nodeexists = localizedKB.any( undefined, NS["skos"]("prefLabel"), $rdf.literal(values.name,'') );
		if ( !nodeexists ) {

		var level_label = [ 
				   "crminf:I5_Inference_Making, crminf:I1_Argumentation",
				   "crminf:I7_Belief_Adoption, crminf:I1_Argumentation",
				   "crmsci:S4_Observation, crminf:I1_Argumentation"
				    ];
		var level = ((values.iprocess && typeof values.iprocess[0].title !== 'undefined')?level_label[0]:
			     ((values.aprocess && typeof values.aprocess[0].title !== 'undefined')?level_label[1]:
			      level_label[2]));

		var tripleid = "kb-"+uuidv4();
		triples += `\n`+NS[""](tripleid)+` a `+level+` ;\n`;
		triples += `skos:prefLabel """`+values.name+`""" ;\n`;
		if ( values.description ) {
		    triples += `crm:P3_has_note """`+values.description+`""" ;\n`;
		}
		triples += `dct:created "`+$.now()+`" ;\n.`;
		if ( values.iprocess && typeof values.iprocess[0].title !== 'undefined' ) {
		    // I5_Inference_Making
		    if ( values.ilogic ) {
			var tripleid_logic;
			var shownValDefined = undefined;
			// check if instance already exists
			shownValDefined = $( "#"+jqu( onto[ "crminf:I3_Inference_Logic" ].about )+" option" ).filter(function() { return this.value == values.ilogic }).data('value');
			if ( shownValDefined ) {
			    // value from a dataList
			    tripleid_logic = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
			} else {
			    // new value
			    tripleid_logic = "kb-"+uuidv4();
			    triples += `\n`+NS[""](tripleid_logic)+` a crminf:I3_Inference_Logic ;\n`;
			    triples += `skos:prefLabel """`+values.ilogic+`""" ;\n`;
			    triples += `dct:created "`+$.now()+`" ;\n.`;
			}
			triples += `\n`+NS[""](tripleid)+` crminf:J3_applies `+NS[""](tripleid_logic)+` ;\n.`;
		    }
		    if ( values.iinputs ) {
			$.each( values.iinputs, function(i,v) { 
				var tripleid_premise;
				var shownValDefined = undefined;
				// check if instance already exists
				shownValDefined = $( "#"+jqu( onto[ "crminf:I2_Belief" ].about )+" option" ).filter(function() { return this.value == values.iinputs[i].title }).data('value');
				if ( shownValDefined ) {
				    // value from a dataList
				    tripleid_premise = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
				} else {
				    // new value
				    tripleid_premise = "kb-"+uuidv4();
				    triples += `\n`+NS[""](tripleid_premise)+` a crminf:I2_Belief ;\n`;
				    triples += `skos:prefLabel """`+values.iinputs[i].title+`""" ;\n`;
				    triples += `dct:created "`+$.now()+`" ;\n.`;
				}
				triples += `\n`+NS[""](tripleid)+` crminf:J1_used_as_premise `+NS[""](tripleid_premise)+` ;\n.`;
			    });
		    }
		    if ( values.iprocess ) {
			$.each( values.iprocess, function(i,v) { 
				var tripleid_belief;
				var shownValDefined = undefined;
				// check if instance already exists
				shownValDefined = $( "#"+jqu( onto[ "crminf:I2_Belief" ].about )+" option" ).filter(function() { return this.value == values.iprocess[i].title }).data('value');
				if ( shownValDefined ) {
				    // value from a dataList
				    tripleid_belief = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
				} else {
				    // new value
				    tripleid_belief = "kb-"+uuidv4();
				    triples += `\n`+NS[""](tripleid_belief)+` a crminf:I2_Belief ;\n`;
				    triples += `skos:prefLabel """`+values.iprocess[i].title+`""" ;\n`;
				    triples += `dct:created "`+$.now()+`" ;\n.`;
				}
				triples += `\n`+NS[""](tripleid)+` crminf:J2_concluded_that `+NS[""](tripleid_belief)+` ;\n.`;
				var tripleid_propset;
				$.each( values.iprocess[i].propositions, function(i2,v2) { 
					var tripleid_prop;
					var shownValDefined = undefined;
					// check if instance already exists
					shownValDefined = $( "#"+jqu( onto[ "crm:E73_Information_Object" ].about )+" option" ).filter(function() { return this.value == values.iprocess[i].propositions[i2] }).data('value');
					if ( shownValDefined ) {
					    // value from a dataList
					    tripleid_prop = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
					} else {
					    // new value
					    tripleid_prop = "kb-"+uuidv4();
					    triples += `\n`+NS[""](tripleid_prop)+` a crm:E73_Information_Object ;\n`;
					    triples += `skos:prefLabel """`+values.iprocess[i].propositions[i2]+` (proposition)""" ;\n`;
					    triples += `dct:created "`+$.now()+`" ;\n.`;
					}
					// create proposition set
					if ( i2 == 0 ) {
					    // new value
					    tripleid_propset = "kb-"+uuidv4();
					    triples += `\n`+NS[""](tripleid_propset)+` a crminf:I4_Proposition_Set ;\n`;
					    triples += `skos:prefLabel """`+values.iprocess[i].title+` (proposition set)""" ;\n`;
					    triples += `dct:created "`+$.now()+`" ;\n.\n`;
					    triples += `\n`+NS[""](tripleid_belief)+` crminf:J4_that `+NS[""](tripleid_propset)+` ;\n.`;
					    triples += `\n`+NS[""](tripleid_belief)+` crminf:J5_holds_to_be "`+values.ibeliefs[i].value+`" ;\n.`;
					}
					triples += `\n`+NS[""](tripleid_propset)+` crm:P148_has_component `+NS[""](tripleid_prop)+` ;\n.`;
				    });
								
			    });
		    }
		} else if ( values.aprocess && typeof values.aprocess[0].title !== 'undefined') {
		    // I7_Belief_Adoption
		    if ( values.aprocess ) {
			$.each( values.aprocess, function(i,v) { 
				var tripleid_adopted;
				var shownValDefined = undefined;
				// check if instance already exists
				shownValDefined = $( "#"+jqu( onto[ "crminf:I2_Belief" ].about )+" option" ).filter(function() { return this.value == values.aprocess[i].title }).data('value');
				if ( shownValDefined ) {
				    // value from a dataList
				    tripleid_adopted = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
				} else {
				    // new value
				    tripleid_adopted = "kb-"+uuidv4();
				    triples += `\n`+NS[""](tripleid_adopted)+` a crminf:I2_Belief ;\n`;
				    triples += `skos:prefLabel """`+values.aprocess[i].title+`""" ;\n`;
				    triples += `dct:created "`+$.now()+`" ;\n.`;
				}
				triples += `\n`+NS[""](tripleid)+` crminf:J6_adopted `+NS[""](tripleid_adopted)+` ;\n.`;
				// new belief
				tripleid_new = "kb-"+uuidv4();
				triples += `\n`+NS[""](tripleid_new)+` a crminf:I2_Belief ;\n`;
				triples += `skos:prefLabel """`+values.aprocess[i].title+` (adopted)""" ;\n`;
				triples += `dct:created "`+$.now()+`" ;\n.`;
			    });
		    }
		    if ( values.aevidence ) {
			$.each( values.aevidence, function(i,v) { 
				var tripleid_aevidence;
				var shownValDefined = undefined;
				// check if instance already exists
				shownValDefined = $( "#"+jqu( onto[ "crm:E73_Information_Object" ].about )+" option" ).filter(function() { return this.value == values.aevidence[i].title }).data('value');
				if ( shownValDefined ) {
				    // value from a dataList
				    tripleid_aevidence = shownValDefined.substr(shownValDefined.lastIndexOf('/#')+2);
				} else {
				    // new value
				    tripleid_aevidence = "kb-"+uuidv4();
				    triples += `\n`+NS[""](tripleid_aevidence)+` a crm:E73_Information_Object ;\n`;
				    triples += `skos:prefLabel """`+values.aevidence[i].title+`""" ;\n`;
				    triples += `dct:created "`+$.now()+`" ;\n.`;
				}
				triples += `\n`+NS[""](tripleid)+` crminf:J7_is_based_on_evidence_from `+NS[""](tripleid_aevidence)+` ;\n.`;
			    });
		    }						
		}
		if ( values.label ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:label """`+values.label+`""" ;\n.`;
		}
		if ( values.comment ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:comment """`+values.comment+`""" ;\n.`;
		}
		if ( values.seeAlso ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:seeAlso """`+values.seeAlso+`""" ;\n.`;
		}
		if ( values.isDefinedBy ) {
		    triples += `\n`+NS[""](tripleid)+` rdfs:isDefinedBy """`+values.isDefinedBy+`""" ;\n.`;
		}
		// insert triples into graph
		try {
		    $rdf.parse(triples, localizedKB, localizedKBURI, 'text/turtle'); 
		    message = ``;
		    mod_display( localizedKB, message, "success" );
		} catch (err) {
		    message = `<b>Oh snap!</b> Something went wrong, try again? Or call for <a class="alert-link" href="mailto:help@eighteenthcenturypoetry.org">help!</a>`;
		    mod_display( localizedKB, message, "danger" );
		    console.log( err );
		}
		$( "#newModal" ).modal( 'hide' );
		new_id = NS[""](tripleid).value;
		} else {
		    message = `<b>Oh snap!</b> A node with this name already exists.`;
		    show_alert_mod( message, "danger" );
		}
	    }
	};
	create_form( "Create an Argumentation record", "wd-argumentation", jf );
	$( "#newModal input[name='name']" ).attr( "list", onto[ 'crminf:I1_Argumentation' ].about );
	$( "#newModal input[name*='iinputs'],#newModal input[name*='iprocess'],#newModal input[name*='aprocess']" ).attr( "list", onto[ 'crminf:I2_Belief' ].about );
	$( "#newModal input[name*='propositions'],#newModal input[name*='aevidence']" ).attr( "list", onto[ 'crm:E73_Information_Object' ].about );
	$( "datalist#"+jqu( 'http://www.ics.forth.gr/isl/CRMinf/I1_Argumentation' )+" option[data-value^='http']" ).attr("disabled","disabled");
	if ( $(id).attr("href").startsWith( 'http' ) ) {
	    $( '#newModal #jForm .modal-body *').attr( "readonly", "readonly" );
	}
	$( "#newModal" ).modal('show');
	break;

    case "proposition":
	$( "body" ).prepend(`
			    <div id="newStmt" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newModalLabel">
			    <div class="modal-dialog" role="document">
			    <div class="modal-content">
			    <div class="modal-header">
			    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			    <h4 class="modal-title" id="newModalLabel">Add a proposition</h4>
			    </div>
			    <div class="modal-body">
			    <p><b>Summary:</b><br/>Creating a <em>proposition</em> is a <em>two-step</em> process: firstly, use the taxonomy in the <em>editing view</em> to create a statement as normal; secondly, tick the <em>Reification</em> tick-box next to the <em>Submit-button</em> to give your proposition a title.</p>
			    <p><b>Help:</b><br/>
			    <em>Propositions</em>, as defined in the context of the scholarly <em>argumentation</em> model presented here, are defined as the objects of a <em>belief</em>.  A <em>belief</em> is composed of one or, more likely, several propositions (a <em>proposition set</em>) and a truth-value.  <em>Propositions</em> are therefore implicitly the primary/smallest bearers of truth-values.</p>
			    <p><em>Propositions</em>, like everything else in the Semantic Web, are expressed as statements in the form <em>subject – predicate – object</em>, known as triples.  However, as we are making explicit that these statements form part of an argumentation, we need to be able to record additional information about their provenance.</p>
			    <p>RDF (the language of the Semantic Web) provides a built-in vocabulary intended for describing statements in this manner.  A description of a statement using this vocabulary (rdf:Statement) is called a <em>reification</em> of the statement.  To create a <em>reified</em> statement, simply tick the <em>Reification</em> tick-box next to the <em>Submit-button</em> when adding your statements.
			    </p>
			    </div>
			    <div class="modal-footer">
			    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
			    </div>`);
	$('#newStmt').modal('show');
	break;

    default:

    }
}

// retrieve metadata about the ontology
function retrieve_ontomd() {

    var ontomd = `<p/><ul class="listBibl">`;
    if ( localizedKBURI ) {
	graph = localizedKB;
    } else {
	graph = kb;
    }
    var ontomdid = graph.any( undefined, NS["rdf"]("type"), NS["owl"]("Ontology") );
    var res = skp( graph,ontomdid );
    ontomd += `<li><span>Title</span> <span>`+res.value+`</span></li>`;
    res = graph.any( $rdf.sym( ontomdid.uri ), NS["rdfs"]("comment"), undefined );
    ontomd += `<li><span>Description</span> <span>`+res.value.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2')+`</span></li>`;
    res = graph.any( $rdf.sym( ontomdid.uri+"/creator" ), NS["foaf"]("name"), undefined );
    ontomd += `<li><span>Creator</span> <span>`+res.value+`</span></li>`;
    res = graph.any( $rdf.sym( ontomdid.uri ), NS["dct"]("isVersionOf"), undefined );
    ontomd += ((res)?"<li><span>Forked from</span> <span>"+
	       ((localizedKBURI)?"&lt;"+nsv( res.uri )+"&gt;":"<a dataid='"+res.uri+"' href='#/resources/models/"+res.uri+"'>&lt;"+nsv( res.uri )+"&gt;</a>"):"");
    res = graph.any( $rdf.sym( ontomdid.uri ), NS["dct"]("date"), undefined );
    ontomd += ((res)?`<li><span>Published</span> <span>`+new Date( Number( res.value ) ).toLocaleDateString("en-GB")+`</span></li>`:``);
    res = graph.any( $rdf.sym( ontomdid.uri ), NS["dct"]("created"), undefined );
    ontomd += ((res)?`<li><span>Created</span> <span>`+new Date( Number( res.value ) ).toLocaleDateString("en-GB")+`</span></li>`:``);
    res = graph.any( $rdf.sym( ontomdid.uri ), NS["dct"]("license"), undefined );
    ontomd += ((res)?`<li><span>License</span> <span><a href="`+res.value+`" class="external" target="_blank">`+res.value+`</a></span></li>`:``);
    res = graph.any( $rdf.sym( ontomdid.uri ), NS["owl"]("versionInfo"), undefined );
    ontomd += ((res)?`<li><span>Version</span> <span>`+res.value+`</span></li>`:``);

    ontomd += `</ul>`;
    return ontomd;

}

// display taxonomy labels
$(document).popover({
	trigger: "hover",
	    html: true,
	    animation: false,
	    container: "body",
	    placement: "left auto",
	    viewport: "#modelling",
	    selector: "#treeview-ontohier li a,#mod_ctl_sel_res li a.relsLink,#mod_ctl_vie a.relsLink",
	    title: function() {
	    return ( ((onto[ nsv( $(this).attr("href") ) ])?onto[ nsv( $(this).attr("href") ) ].label:"") + " ("+(nsv( $(this).attr("href") )?nsv( $(this).attr("href") ):$(this).attr("href") )+")" );
	},
	    content: function() {
	    return ( ( onto[ nsv( $(this).attr("href") ) ] && onto[ nsv( $(this).attr("href") ) ].comment )?onto[ nsv( $(this).attr("href") ) ].comment.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'):"<p>[No scope note available.]</p>" );
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
$(document.body).on('click', '.ontofcr-collapse a,.ontohier-collapse a', function(e) {
	var tree = e.target.parentElement.className.substring(0,e.target.parentElement.className.indexOf('-'));
	if ( $('#treeview-'+tree ).treeview('getExpanded', '0').length == 0 ) {
	    $('#treeview-'+tree).treeview('expandAll',{ silent:true });
	} else {
	    $('#treeview-'+tree).treeview('collapseAll',{ silent:true });
	}
    });

// display selected shortcut
$(document.body).on('click', '.shortcutLink', function(e) {
	var path = retrieve_fcr_path( $(this).data("id") );
	create_shortcut( path[0],path[1] );
    });

// build statement from taxonomy
$(document.body).on('click', '#subj .relsLink', function(e) {
	e.preventDefault();
	$(".popover").remove();
	panel = create_TAX_res( $(this).data("id"),'' );
	$( "#mod_ctl_sel" ).html( panel );
	$( "#mod_ctl_sel" ).fadeIn( "fast" );
	$( "#tax_subj" ).html( onto[ $(this).data("id") ].label );
	$( "#tax_pred" ).html( "[please choose a predicate]" );
	$( "#tax_obj" ).html( "[tbd]" );
	curr_stmt["s"] = $(this).data("id");
	curr_stmt["p"] = "";
	curr_stmt["o"] = "";
    });
$(document.body).on('click', '#pred ul#pred_sel .relsLink', function(e) {
	e.preventDefault();
	var id = $(this).data("id");
	$( ".popover" ).remove();
	$( "#pred ul" ).not( "#pred_choice" ).hide();
	$( "#pred_choice" ).html( `<li><a class="relsLink" data-id="`+$(this).data("id")+`" href="`+onto[ $(this).data("id") ].about+`">`+onto[ $(this).data("id") ].label+`</a> <a role="button" data-toggle="collapse" href="#collapsePMore" aria-expanded="false" aria-controls="collapsePDesc">[show more/less]</a></li>` ).show();
	var p_desc = `
	    <ul class="listBibl collapse" style="margin-left:-40px;" id="collapsePMore">
	    <li><b>Label:</b> `+onto[ $(this).data("id") ].label+` (`+id+`)</li><li style="word-break:break-all;"><b>URI:</b> `+onto[ id ].about+`</li><li><b>Type:</b> `+_(onto[ id ].type).capitalize()+`</li><li><b>Description:</b> <a role="button" data-toggle="collapse" href="#collapsePDesc" aria-expanded="false" aria-controls="collapsePDesc">[show/hide]</a><div class="collapse listBibl" id="collapsePDesc" style="text-indent:initial;">`+((onto[ id ].comment)?onto[ id ].comment.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'):`[No scope note available.]`)+`</div></li><li><b>Superproperties:</b>
	    <a role="button" data-toggle="collapse" href="#collapsePSup" aria-expanded="false" aria-controls="collapsePSup">[show/hide]</a><div class="collapse listBibl" id="collapsePSup" style="text-indent:initial;"><ul style="margin-left:0;">`;
	if ( onto[ id ].superproperty ) {
	    $.each( onto[ id ].superproperty, function(i,v) {
		    p_desc += `<li><span style="width:100%;">`+((onto[ onto[ v ].domain])?onto[ onto[ v ].domain ].label:onto[ v ].domain)+` <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> <a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="direct">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> `+((onto[ onto[ v ].range])?onto[ onto[ v ].range ].label:onto[ v ].range)+`</span></li>`;
		});
	} else {
	    p_desc += `<li style="margin-left:0">No superproperties of '`+onto[ id ].label+`'</li>`;
	}
	p_desc += `</ul></div></li><li><b>Subproperties:</b> <a role="button" data-toggle="collapse" href="#collapsePSub" aria-expanded="false" aria-controls="collapsePSub">[show/hide]</a><div class="collapse listBibl" id="collapsePSub" style="text-indent:initial;"><ul style="margin-left:0;">`;
	if ( onto[ id ].subproperty ) {
	    $.each( onto[ id ].subproperty, function(i,v) {
		    p_desc += `<li><span style="width:100%;">`+((onto[ onto[ v ].domain])?onto[ onto[ v ].domain ].label:onto[ v ].domain)+` <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> <a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="direct">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> `+((onto[ onto[ v ].range])?onto[ onto[ v ].range ].label:onto[ v ].range)+`</span></li>`;
		});
	} else {
	    p_desc += `<li style="margin-left:0">No subproperties of '`+onto[ id ].label+`'</li>`;
	}
	p_desc += `</ul></div></li></ul>`;
	$( "#pred_choice" ).append( p_desc );
	$( "#tax_pred" ).html( onto[ $(this).data("id") ].label );
	curr_stmt["p"] = $(this).data("id");
	$( "#obj ul" ).not( "#obj_choice" ).hide();
	if ( $(this).data("dir") == "direct" ) {
	    curr_stmt["o"] = ((onto[ $(this).data("id") ].range)?onto[ $(this).data("id") ].range:$(this).data("id"));
	    $( "#tax_obj" ).html( ((onto[ onto[ $(this).data("id") ].range ])?onto[ onto[ $(this).data("id") ].range ].label:curr_stmt["o"]) );
	    $( "#obj_choice" ).html( `<li><a class="relsLink" data-id="`+onto[ $(this).data("id") ].range+`" href="`+((onto[ onto[ $(this).data("id") ].range ])?onto[ onto[ $(this).data("id") ].range ].about:curr_stmt["o"])+`">`+((onto[ onto[ $(this).data("id") ].range ])?onto[ onto[ $(this).data("id") ].range ].label:curr_stmt["o"])+`</a>  <a role="button" data-toggle="collapse" href="#collapseODesc" aria-expanded="false" aria-controls="collapseODesc">[show more/less]</a></li>` ).show();
	} else {
	    curr_stmt["o"] = ((onto[ $(this).data("id") ].range)?onto[ $(this).data("id") ].range:$(this).data("id"));
	    $( "#tax_obj" ).html( onto[ onto[ $(this).data("id") ].range ].label );
	    $( "#obj_choice" ).html( `<li><a class="relsLink" data-id="`+onto[ $(this).data("id") ].range+`" href="`+onto[ onto[ $(this).data("id") ].range ].about+`">`+onto[ onto[ $(this).data("id") ].range ].label+`</a>  <a role="button" data-toggle="collapse" href="#collapseODesc" aria-expanded="false" aria-controls="collapseODesc">[show more/less]</a></li>` ).show();
	}
	var id = curr_stmt["o"];
	var crels = retrieve_class_relationships( id );
	var o_desc = `
	    <ul class="listBibl collapse" style="margin-left:-40px;" id="collapseODesc">
	    <li><b>Label:</b> `+((onto[ id ])?onto[ id ].label:id)+` (`+id+`)</li><li style="word-break:break-all;"><b>URI:</b> `+((onto[ id ])?onto[ id ].about:id)+`</li><li><b>Type:</b> `+((onto[ id ])?_(onto[ id ].type).capitalize():id)+`</li><li><b>Description:</b> <a role="button" data-toggle="collapse" href="#collapseOMore" aria-expanded="false" aria-controls="collapseOMore">[show/hide]</a><div class="collapse listBibl" id="collapseOMore" style="text-indent:initial;">`+((onto[ id ] && onto[ id ].comment)?onto[ id ].comment.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'):"[No scope note available.]")+`</div></li><li><b>Superclasses:</b> <a role="button" data-toggle="collapse" href="#collapseOSup" aria-expanded="false" aria-controls="collapseOSup">[show/hide]</a><div class="collapse listBibl" id="collapseOSup" style="text-indent:initial;"><ul>`;
	if ( crels[0].length+crels[1].length > 0 ) {
	    if ( crels[0].length > 0 ) {
		$.each( crels[0], function(i,v) {
			o_desc += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>direct<span></li>`;
		    });
	    }
	    if ( crels[1].length > 0 ) {
		$.each( crels[1], function(i,v) {
			o_desc += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>inferred<span></li>`;
		    });
	    }
	} else {
	    o_desc += `<li style="margin-left:0">No superclasses of '`+((onto[ id ])?onto[ id ].label:id)+`'</li>`;
	}
	o_desc += `</ul></div></li><li><b>Subclasses:</b>
	    <a role="button" data-toggle="collapse" href="#collapseOSub" aria-expanded="false" aria-controls="collapseOSub">[show/hide]</a><div class="collapse listBibl" id="collapseOSub" style="text-indent:initial;"><ul>`;
	
	if ( crels[2].length+crels[3].length > 0 ) {
	    if ( crels[2].length > 0 ) {
		$.each( crels[2], function(i,v) {
			o_desc += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>direct<span></li>`;
		    });
	    }
	    if ( crels[3].length > 0 ) {
		$.each( crels[3], function(i,v) {
			o_desc += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>inferred<span></li>`;
		    });
	    }
	} else {
	    o_desc += `<li style="margin-left:0">No subclasses of '`+((onto[ id ])?onto[ id ].label:id)+`'</li>`;
	}
	o_desc += `</ul></div></li></ul>`;
	$( "#obj_choice" ).append( o_desc );
	$( "#rels_add" ).removeAttr("disabled");
	/*
	  if ( $(this).data("dir") == "inverse" ) {
	  $( "#curr_stmt i" ).removeClass( "glyphicon-arrow-right" ).addClass( "glyphicon-arrow-left" );
	  }
	*/
    });

// stop propagation
$(document.body).on('click', '#obj .relsLink,#mod_ctl_sel_res .relsLink,#mod_ctl_vie a.relsLink,#ontotempl .relsLink', function(e) {
	e.preventDefault();
    });

// undo in build statement
$(document.body).on('click', '#pred #pred_undo', function(e) {
	e.preventDefault();
	if ( curr_stmt["p"] ) {
	    $( ".popover" ).remove();
	    $( "#pred #pred_choice" ).hide();
	    $( "#pred ul" ).not( "#pred_choice" ).show();
	    $( "#pred_choice" ).html( `` );
	    $( "#tax_pred" ).html( "[please choose a predicate]" );
	    $( "#tax_obj" ).html( "[tbd]" );
	    $( "#obj #obj_choice" ).html( `<li>[tbd]</li>`);
	    $( "#rels_add" ).attr("disabled","disabled");
	    if ( $( "#curr_stmt i" ).hasClass( "glyphicon-arrow-left" ) ) {
		$( "#curr_stmt i" ).removeClass( "glyphicon-arrow-left" ).addClass( "glyphicon-arrow-right" );
	    }
	    curr_stmt["p"] = "";
	    curr_stmt["o"] = "";
	}
    });

// display built statement (uses shortcut form mechanism)
$(document.body).on('click', '#rels_add', function(e) {
	e.preventDefault();
	var header = $( "#curr_head" ).clone().find('*').removeAttr('id').end();
	var path = [];
	path.push( { s: { name:"s1", id:curr_stmt["s"], stype:"string" }, 
		    p: { name:"p1", id:curr_stmt["p"], stype:"string" },
		    o: { name:"o1", id:curr_stmt["o"], stype:"string"}, req:true, rep:false } );
	/*
	  path.push( { s: { name:"s2", id:curr_stmt["o"], stype:"string", svalue:"o1" }, 
	  p: { name:"p2", id:"crm:P2_has_type", stype:"string" },
	  o: { name:"o2", id:"crm:E55_Type", stype:"string"}, req:false, rep:false } );
	*/
	create_shortcut( header[0].innerHTML,path );
	if ( curr_stmt["i"] ) {
	    $( "#newModal input[name='s1']" ).attr( "readonly", "readonly" );	
	    $( "#newModal input[name='s1']" ).val( curr_stmt["i"] );
	}
    });

// close statement build environmant 
$(document.body).on('close.bs.alert', '#mod_ctl_sel_res', function () {
	$( "#mod_ctl_nav" ).fadeIn( "fast" );
    });

// retrieve instances for a selected class in viewing mode
$(document.body).on('click', '#view_classes a', function(e) {
	e.preventDefault();
	var id = $(this).attr("href");

	$( "#view_classes *" ).css("background-color", "");
	$(this).css("background-color", bgcolor[ nsv( $(this).attr("href") ).substring( 0, nsv( $(this).attr("href") ).indexOf( ":" ) ) ]);
	$(this).parent().css("background-color", bgcolor[ nsv( $(this).attr("href") ).substring( 0, nsv( $(this).attr("href") ).indexOf( ":" ) ) ]);
	$( "span#iclass" ).remove();
	$( this ).after( ` <span id="iclass"> (`+nsv( id )+`)</span>` );

	var graph, statements, nodes_seen=[];
	var instances = `<ul class="listBibl">`;
	if ( localizedKBURI ) {
	    graph = localizedKB;
	} else {
	    graph = kb;
	}
	statements = graph.statementsMatching( undefined, undefined, $rdf.sym( id ) );
	statements.forEach(function(statement) {
		var s = statement.subject;
		var p = statement.predicate;
		var o = statement.object;

		if ( typeof nodes_seen[s.value] == 'undefined' ) { // count each instance once
		    nodes_seen[s.value] = 1;
		    var res = skp( graph,s );
		    if ( !res ) {
			res = graph.any( s, NS["rdfs"]('label'), undefined );
			if ( !res ) {
			    res = s.uri;
			}
		    }
		    instances += `<li><a href="`+s.uri+`" data-bgcolor="`+nsv( id ).substring( 0, nsv( id ).indexOf( ":" ) )+`">`+res+`</a></li>`;
		}
	    });
	instances += `</ul>`;
	$( "#view_instances" ).html( instances );
	$( "#view_results" ).html( '' );

    });

// retrieve statements for a selected instance in viewing mode
$(document.body).on('click', '#view_instances a:not([class])', function(e) {
	e.preventDefault();
	var id = $(this).attr("href");
	var graph, statements;
	$( "#view_instances *" ).css("background-color", "");
	$( this ).css( "background-color", bgcolor[ $(this).data("bgcolor") ]);
	$( this ).parent().css("background-color", bgcolor[ $(this).data("bgcolor") ]);
	$( "span#isubj" ).remove();
	$( this ).after( ` <span id="isubj"> (S)</span>` );
	var j = cy.$( "[id='"+id+"']" );
	cy.animate({
		zoom: 1,
		    center: { eles: cy.filter( j ) }
	    }, {
		duration: 500
		    });
	var stinout = `<p>Outgoing statements ( <em><i class="glyphicon glyphicon-arrow-right"/> P <i class="glyphicon glyphicon-arrow-right"/> O </em>):</p><ul class="listBibl">`;
	if ( localizedKBURI ) {
	    graph = localizedKB;
	} else {
	    graph = kb;
	}
	statements = graph.statementsMatching( $rdf.sym( id ), undefined, undefined );
	if ( statements.length > 0 ) {
	    statements.forEach(function(statement) {
		    var s = statement.subject;
		    var p = statement.predicate;
		    var o = statement.object;

		    if ( p.value == "http://www.w3.org/2007/ont/link#uri" ) { return; } // skip rdflib.js sameAs bug
		    stinout += `<li data-s="`+s+`" data-p="`+p+`" data-o="`+o+`"`+(onto[ nsv( p.value ) ]?``:` style="display:none"`)+`><span>`+(onto[ nsv( p.value ) ]?
																		 `<a class="relsLink" data-id="`+p.value+`" href="`+( onto[ nsv( p.value ) ]?onto[ nsv( p.value ) ].about:p.value )+`">`:``)
			+( onto[ nsv( p.value ) ]?onto[ nsv( p.value ) ].label:(nsv( p.value )?nsv( p.value ):p.value))+
			(onto[ nsv( p.value ) ]?`</a>`:``)
			+`</span> &nbsp; <span>`+((o.termType == "NamedNode" || onto[ nsv( o.value ) ] || nsv( o.value ) || o.value.startsWith( 'http' ))?
						  `<a data-id="`+o.value+`" href="`+( onto[ nsv( o.value ) ]?onto[ nsv( o.value ) ].about+`" class="relsLink"`:(( o.value.startsWith (NS[""]('').value) )?o.value+`" class="relsLink2"`:
o.value+`" class="external" target="_blank"`))+`>`:``)+
		( onto[ nsv( o.value ) ]?onto[ nsv( o.value ) ].label:
		  ( skp( graph,o )?skp( graph,o ):
		    ( nsv( o.value )?nsv( o.value ):
		      o.value)))
		+((o.termType == "NamedNode" || onto[ nsv( o.value ) ] || nsv( o.value ) || o.value.startsWith( 'http' ))?`</a>`:``)
		+`</span></li>`;
		});
    } else {
	stinout += `<li>none</li>`;
    }
    stinout += `</ul><p>Incoming statements ( <em><i class="glyphicon glyphicon-arrow-left"/> P <i class="glyphicon glyphicon-arrow-left"/> O </em>):</p><ul class="listBibl">`;
    statements = graph.statementsMatching( undefined, undefined, $rdf.sym( id ) );
    if ( statements.length > 0 ) {
	statements.forEach(function(statement) {
		var s = statement.subject;
		var p = statement.predicate;
		var o = statement.object;

		if ( p.value == "http://www.w3.org/2007/ont/link#uri" ) { return; } // skip rdflib.js sameAs bug
		stinout += `<li data-s="`+s+`" data-p="`+p+`" data-o="`+o+`"`+(onto[ nsv( p.value ) ]?``:` style="display:none"`)+`><span>`+(onto[ nsv( p.value ) ]?
																	     `<a class="relsLink" data-id="`+p.value+`" href="`+( onto[ nsv( p.value ) ]?onto[ nsv( p.value ) ].about:p.value )+`">`:``)
		    +( onto[ nsv( p.value ) ]?onto[ nsv( p.value ) ].label:(nsv( p.value )?nsv( p.value ):p.value))+
		    (onto[ nsv( p.value ) ]?`</a>`:``)
		    +`</span> &nbsp; <span>`+((s.termType == "NamedNode" || onto[ nsv( s.value ) ])?
					      `<a data-id="`+s.value+`" href="`+( onto[ nsv( s.value ) ]?onto[ nsv( s.value ) ].about+`" class="relsLink"`:(( s.value.startsWith (NS[""]('').value) )?s.value+`" class="relsLink2"`:
s.value+`" class="external" target="_blank"`))+`>`:``)+
	    ( onto[ nsv( s.value ) ]?onto[ nsv( s.value ) ].label:
	      ( skp( graph,s )?skp( graph,s ):
		( nsv( s.value )?nsv( s.value ):
		  s.value)))
	    +((s.termType == "NamedNode" || onto[ nsv( s.value ) ])?`</a>`:``)
	    +`</span></li>`;
	    });
    } else {
    stinout += `<li>none</li>`;
}
$( "#view_results" ).html( stinout );

});

// update viewing mode based on newly selected instances
$(document.body).on('click', '#view_results a.relsLink2', function(e) {
	e.preventDefault();
	var id = $( this ).data( "id" )
	    if ( localizedKBURI ) {
		graph = localizedKB;
	    } else {
		graph = kb;
	    }
	var res = graph.any( $rdf.sym( id ), NS["rdf"]("type"), undefined );
	$( "#view_classes a[href='"+res.value+"']" ).trigger( "click" );
	$( "#view_instances a[href='"+id+"']" ).trigger( "click" );

    });

// Treeview ontology editing options
function triggerTreeLinkClick (e) {

    var link = e[0].href, panel, id;
    $( "a[href='#mod_edit']" ).trigger( "click" ); // switch to editing mode in case we are in viewing mode
    if ( link && !link.endsWith('#') ) {
	if ( link.includes( "/models/#" ) ) {     // Instance
	    id = localizedKB.any( $rdf.sym( link ), NS["rdf"]("type"), undefined );
	    id = nsv( id.value );
	    panel = create_TAX_res( id,link );			
	} else if ( link.startsWith( base ) ) {   // FCR
	    id = link.substr(link.indexOf('#')+1);
	    panel = create_FCR_res( id );
	} else if ( link.startsWith( 'http' ) ) { // Taxonomy
	    id = nsv( link );
	    panel = create_TAX_res( id,'' );
	}
	// swap panels
	$( "#mod_ctl_nav" ).fadeOut( "fast", function () {
		$( "#mod_ctl_sel" ).html( panel );
		$( "#mod_ctl_sel" ).fadeIn( "fast" );
		if ( link.startsWith( 'http' ) ) { // Taxonomy
		    if ( onto[ id ] ) {	$( "#tax_subj" ).html( onto[ id ].label ); }
		    $( "#tax_pred" ).html( "[please choose a predicate]" );
		    $( "#tax_obj" ).html( "[tbd]" );
		    curr_stmt["o"] = "";
		    curr_stmt["p"] = "";
		    curr_stmt["s"] = id;
		}
	    });
    }

}

// FCR overviews
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
	<div class="panel-heading" role="tab" id="headingPOne">
	`+header+`
	<button type="button" class="close" data-target="#mod_ctl_sel_res" data-dismiss="alert"> <span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button></div>
																       <div class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingPOne" aria-expanded="false">
																       <div class="panel-body">`+((paths.length > 1)?`<p>Please choose the shortcut <em>best suited to express</em> the intended relationship:</p>`:`<p>This is the standard shortcut to <em>express</em> this relationship:</p>`);
    
    $.each( paths, function(i,v) {
	    panel += `<p><a class="shortcutLink" title="[Spawns modal with statements to be filled in]"
		data-id="`+v.id+`"><b>Shortcut `+(i+1)+`</b></a> (`+v.path.length+` statements):</p><ol>`;
	    $.each( v.path, function(i2,v2) {
		    var porps = ``;
		    if ( Array.isArray( v2.p.id ) ) {
			$.each( v2.p.id, function(i,v) {
				porps += `<a class="relsLink" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a>/`;
			    });
		    } else {
			porps = `<a class="relsLink" href="`+onto[v2.p.id].about+`">`+onto[v2.p.id].label+`</a> `;
		    }
		    panel += `<li><a class="relsLink" href="`+onto[v2.s.id].about+`">`+onto[v2.s.id].label+`</a> <i class="glyphicon glyphicon-arrow-right"/> `+ porps.substring(0, porps.length - 1) +` <i class="glyphicon glyphicon-arrow-right"/> <a class="relsLink" href="`+((onto[v2.o.id])?onto[v2.o.id].about:v2.o.id)+`">`+((onto[v2.o.id])?onto[v2.o.id].label:v2.o.id)+`</a>`+((v2.req)?``:` (optional)`)+`</li>`;
		});
	    panel += `</ol>`;
	});
    panel += `
	<p class="alert alert-info" role="alert" style="margin-top:15px;margin-right:15px;">If none of the shortcuts suits your particular situation, please consider using the full expressivity of the taxonomy, or <a href="mailto:info@eighteenthcenturypoetry.org" class="alert-link">let us know</a> about your modelling requirement, and we may be able to provide suggestions.</p><button type="button" class="btn btn-primary" data-target="#mod_ctl_sel_res" data-dismiss="alert">Close</button>
	</div>
	</div>
	</div> `;

    return panel;

}

// build a statement from the taxonomy
function create_TAX_res ( id,instance ) {

    var crels, prels, header, panel;
    curr_stmt["s"] = id;
    header = onto[ id ].label + " ("+ id +")";
    crels = retrieve_class_relationships( id );
    prels = retrieve_property_relationships( id,crels[0].concat(crels[1]) );

    panel = `
	<div class="panel panel-primary" id="mod_ctl_sel_res">
	<div class="panel-heading" role="tab" id="headingPOne">
	<b>Create a statement</b> 
	<button type="button" class="close" data-target="#mod_ctl_sel_res" data-dismiss="alert"> <span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
																       </div>
																       <div class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingPOne" aria-expanded="false">
																       <div class="panel-body">`;
    panel += `
	<p class="alert alert-info" role="alert" style="margin-top:5px;margin-right:15px;" id="curr_stmt">
	<em><b>Current statement:</b></em><button id="rels_add" type="button" class="btn btn-sm btn-primary" disabled>Create</button><br/> <span id="curr_head"><span id="tax_subj"></span> <i class="glyphicon glyphicon-arrow-right"/> <span id="tax_pred"></span> <i class="glyphicon glyphicon-arrow-right"/> <span id="tax_obj"></span></span>
	</p>
	<ul id="idmd"><li id="subj"><em>Subject (S):</em>`;
    var sdesc = `
	<li><b>Label:</b> `+header+`</li><li style="word-break:break-all;"><b>URI:</b> `+onto[ id ].about+`</li><li><b>Type:</b> `+_(onto[ id ].type).capitalize()+`</li><li><b>Description:</b> <a role="button" data-toggle="collapse" href="#collapseDesc" aria-expanded="false" aria-controls="collapseDesc">[show/hide]</a><div class="collapse listBibl" id="collapseDesc" style="text-indent:initial;">`+onto[ id ].comment.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2')+`</div></li><li><b>Superclasses:</b>
	<a role="button" data-toggle="collapse" href="#collapseSup" aria-expanded="false" aria-controls="collapseSup">[show/hide]</a><div class="collapse listBibl" id="collapseSup" style="text-indent:initial;"><ul>`;
    if ( crels[0].length+crels[1].length > 0 ) {
	if ( crels[0].length > 0 ) {
	    $.each( crels[0], function(i,v) {
		    sdesc += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>direct<span></li>`;
		});
	}
	if ( crels[1].length > 0 ) {
	    $.each( crels[1], function(i,v) {
		    sdesc += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>inferred<span></li>`;
		});
	}
    } else {
	sdesc += `<li style="margin-left:0">No superclasses of '`+onto[ id ].label+`'</li>`;
    }
    sdesc += `</ul></div></li><li><b>Subclasses:</b>
	<a role="button" data-toggle="collapse" href="#collapseSub" aria-expanded="false" aria-controls="collapseSub">[show/hide]</a><div class="collapse listBibl" id="collapseSub" style="text-indent:initial;"><ul>`;

    if ( crels[2].length+crels[3].length > 0 ) {
	if ( crels[2].length > 0 ) {
	    $.each( crels[2], function(i,v) {
		    sdesc += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>direct<span></li>`;
		});
	}
	if ( crels[3].length > 0 ) {
	    $.each( crels[3], function(i,v) {
		    sdesc += `<li><span><a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`">`+onto[ v ].label+`</a></span><span>inferred<span></li>`;
		});
	}
    } else {
	sdesc += `<li style="margin-left:0">No subclasses of '`+onto[ id ].label+`'</li>`;
    }
    sdesc += `</ul></div></li>`;

    if ( instance != '' ) {
	var i_name = skp( localizedKB, $rdf.sym( instance ) );
	panel += `<ul class="listBibl"><li><a class="relsLink" data-id="`+id+`" href="`+onto[ id ].about+`">`+i_name+`</a>  <a role="button" data-toggle="collapse" href="#collapseSDesc" aria-expanded="false" aria-controls="collapseSDesc">[show more/less]</a></li></ul>`;
	panel += `<ul class="listBibl collapse" style="margin-left:-40px;" id="collapseSDesc"><ul class="listBibl">`+sdesc+`</ul></ul>`;
	curr_stmt["i"] = i_name;
    } else {
	panel += `<ul class="listBibl">`+sdesc+`</ul>`;
	curr_stmt["i"] = "";
    }
    panel += `
	</li>
	<li id="pred"><br/><em>Predicate (P):</em> <i id="pred_undo" style="margin-left:5px;" class="fa fa-undo"></i> <ul class="listBibl" id="pred_sel">`;
    panel += `
	<li><b>Properites</b> (direct):
    <a role="button" data-toggle="collapse" href="#collapsePropDR" aria-expanded="false" aria-controls="collapsePropDR">[show/hide]</a><div class="collapse listBibl" id="collapsePropDR" style="text-indent:initial;"><ul style="margin-left:0;">`;
    if ( prels[0].length+prels[1].length > 0 ) {
	if ( prels[0].length > 0 ) {
	    $.each( prels[0], function(i,v) {
		    panel += `<li><span style="width:100%;"><span style="width:100%;">`+onto[ onto[ v ].domain ].label+` <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> <a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="direct">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> `+((onto[ onto[ v ].range])?onto[ onto[ v ].range ].label:onto[ v ].range)+`</span></li>`;
		});
	}
	if ( prels[1].length > 0 ) {
	    $.each( prels[1].sort(function(a, b) { return onto[ onto[ a ].domain ].label.toUpperCase().localeCompare(onto[ onto[ b ].domain ].label.toUpperCase()); } )
		    , function(i,v) {
			panel += `<li><span style="width:100%;">(`+onto[ onto[ v ].domain ].label+`) <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> <a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="direct">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-right"/> `+((onto[ onto[ v ].range])?onto[ onto[ v ].range ].label:onto[ v ].range)+`</span></li>`;
                    });
	}
    }
    panel += `
	</ul></div></li><li><b>Properites</b> (inverse):
    <a role="button" data-toggle="collapse" href="#collapsePropRD" aria-expanded="false" aria-controls="collapsePropRD">[show/hide]</a><div class="collapse listBibl" id="collapsePropRD" style="text-indent:initial;"><ul style="margin-left:0;">`;
    if ( prels[2].length+prels[3].length > 0 ) {
	if ( prels[2].length > 0 ) {
	    $.each( prels[2], function(i,v) {
		    panel += `<li><span style="width:100%;">`+onto[ onto[ v ].range ].label+` <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/> <a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="inverse">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/> `+onto[ onto[ v ].domain ].label+`</span></li>`;
		});
	}
	if ( prels[3].length > 0 ) {
	    $.each( prels[3].sort(function(a, b) { return onto[ onto[ a ].domain ].label.toUpperCase().localeCompare(onto[ onto[ b ].domain ].label.toUpperCase()); })
		    , function(i,v) {
			panel += `<li><span style="width:100%;">`+onto[ onto[ v ].range ].label+` <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/> <a class="relsLink" data-id="`+v+`" href="`+onto[ v ].about+`" data-dir="inverse">`+onto[ v ].label+`</a> <i style="margin-left:20px;margin-right: -5px;" class="glyphicon glyphicon-arrow-left"/> (`+onto[ onto[ v ].domain ].label+`)</span></li>`;
                    });
	}
    }
    panel += `</ul></div></li></ul><ul class="listBibl" id="pred_choice"></ul>
	</li>
	<li id="obj"><br/><em>Object (O):</em><ul class="listBibl">
	</ul><ul class="listBibl" id="obj_choice"></ul>
	</li>
	</ul>
	<p class="alert alert-info" role="alert" style="margin-top:15px;margin-right:15px;">Please <a href="mailto:info@eighteenthcenturypoetry.org" class="alert-link">let us know</a> if you have difficulties expressing what you want to capture, and we may be able to provide suggestions.</p><button type="button" class="btn btn-primary" data-target="#mod_ctl_sel_res" data-dismiss="alert">Close</button>
																								   </div>
																								   </div>
																								   </div>`;
    return panel;

}

// retrieve direct/inferred sub/superclasses
function retrieve_class_relationships( clid ) {

    var supercl = {}, subcl = {}, cache = [];
    supercl["direct"] = []; supercl["indirect"] = [];
    subcl["direct"] = []; subcl["indirect"] = [];

    if ( onto[ clid ] ) {
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
    }
    return [ supercl["direct"], supercl["indirect"], subcl["direct"], subcl["indirect"] ];

}

// retrieve direct/inferred sub/superproperties
function retrieve_property_relationships( clid,clidinf ) {

    var clidrange = {}, cliddomain = {};
    clidrange["direct"] = []; clidrange["indirect"] = [];
    cliddomain["direct"] = []; cliddomain["indirect"] = [];

    // retrieve direct properties
    var patt = /\d+i_/; // exclude inverse versions
    $.each( onto, function( i,v ) {
	    if ( v.type == "property" && !patt.test( i ) ) {
		if ( v.domain == clid ) {
		    cliddomain["direct"].push( i );				
		}
	    }
	});
    $.each( onto, function( i,v ) {
	    if ( v.type == "property" && patt.test( i ) ) {
		if ( v.domain == clid ) {
		    clidrange["direct"].push( i );				
		}
	    }
	});
    // retrieve inherited properties
    $.each( clidinf, function( i2,v2 ) {
	    $.each( onto, function( i,v ) {
		    if ( v.type == "property" && !patt.test( i ) ) {
			if ( v.domain == v2 ) {
			    cliddomain["indirect"].push( i );				
			}
		    }
		});
	    $.each( onto, function( i,v ) {
		    if ( v.type == "property" && patt.test( i ) ) {
			if ( v.domain == v2 ) {
			    clidrange["indirect"].push( i );				
			}
		    }
		});
	});

    cliddomain["direct"] = _.uniq( cliddomain["direct"] );
    clidrange["direct"] = _.uniq( clidrange["direct"] );
    cliddomain["indirect"] = cliddomain["indirect"].filter(val => !cliddomain["direct"].includes(val));
    clidrange["indirect"] = clidrange["indirect"].filter(val => !clidrange["direct"].includes(val));
    return [ cliddomain["direct"],cliddomain["indirect"],clidrange["direct"],clidrange["indirect"] ];

}


// Cytoscape functions

// create CY JSON from graph
function createCYJSON( graph ) {

    var jsonObj=[], nodes_seen=[], i = 0;
    var ontomd = graph.any( undefined, NS["rdf"]("type"), NS["owl"]("Ontology") );
    graph.match(undefined, undefined, undefined).forEach( st => {
	    var s = st.subject;
	    var p = st.predicate;
	    var o = st.object;

	    // process ECPA instances (s)
	    // process nodes (s)
	    if ( typeof nodes_seen[s.value] == 'undefined' // count each instance once
		 && s["value"].startsWith( NS[""]("").value ) // render only ECPA nodes
		 && !(s["value"].includes( ontomd.uri ) ) // don't render owl:Ontology information
		 ) { 
		nodes_seen[s.value] = 1;
		var node = {};
		node["data"] = { "id": s.value };
		node["classes"] = "node";
		var res = skp( graph,s );
		if ( res ) {
		    node["data"]["name"] = res.value ;
		} else {
		    var res = graph.any( s, NS["rdfs"]('label'), undefined );
		    if ( res ) { node["data"]["name"] = res.value ; } else { node["data"]["name"] = s.value ; }
		}
		node["data"]["class"] = o.value;
		node["data"]["bgcolor"] = bgcolor[ nsv(o.value) ]?bgcolor[ nsv(o.value) ]:undefined;
		node["data"]["shape"] = "rectangle";
		jsonObj.push( node );
	    }
	    // process edge (p)
	    if ( s["value"].startsWith( NS[""]("").value ) // render only edges from ECPA nodes
		 && !(s["value"].includes( ontomd.uri )) // don't render owl:Ontology information
		 ) {
		if ( o.termType == "NamedNode" // if object is a node
		     && o["value"].startsWith( NS[""]("").value ) // and it is in the ECPA NS
		     ) {
		    // object properties
		    var edge = {};
		    edge["data"] = { "name": ((onto[ nsv(p.value) ])?onto[ nsv(p.value) ].label:((nsv(p.value))?nsv(p.value):p.value) ) };
		    edge["data"]["source"] = s.value ;
		    edge["data"]["target"] = o.value ;
		    edge["classes"] = "edge";
		    jsonObj.push( edge );
		} else if ((
			    o.termType == "Literal"  &&
			    !( p.value.startsWith( NS["rdf"]("type").value )
			       || p.value.startsWith( NS["skos"]("prefLabel").value )
			       || p.value.startsWith( NS["rdfs"]("comment").value )
			       || p.value.startsWith( NS["rdfs"]("label").value )
			       || p.value.startsWith( NS["rdfs"]("seeAlso").value )
			       || p.value.startsWith( NS["rdfs"]("isDefinedBy").value )
			       || p.value.startsWith( NS["crm"]("P138i_has_representation").value )
			       || p.value.startsWith( NS["crm"]("P1_is_identified_by").value )
			       || p.value.startsWith( NS["crm"]("P2_has_type").value )
			       || p.value.startsWith( NS["crm"]("P3_has_note").value )
			       || p.value.startsWith( NS["crm"]("P102_has_title").value )
			       || p.value.startsWith( NS["dct"]("").value )
			       || p.value.startsWith( NS["foaf"]("").value )
			       ))
			   || ( p.value.startsWith( NS["rdf"]("predicate").value ) )  
			   ) {
		    // dataType properties
		    var node = {};
		    node["data"] = { "id": "_:dtp"+i };
		    node["data"]["name"] = ((onto[ nsv(o.value) ])?onto[ nsv(o.value) ].label:((nsv(o.value))?nsv(o.value):o.value) ) ;
		    node["classes"] = "node";
		    if ( o.termType == "Literal" ) {
			node["data"]["shape"] = "diamond";
		    } else {
			node["data"]["shape"] = "ellipse";
		    }
		    jsonObj.push( node );
		    var edge = {};
		    edge["data"] = { "name": ((onto[ nsv(p.value) ])?onto[ nsv(p.value) ].label:((nsv(p.value))?nsv(p.value):p.value) ) };
		    edge["data"]["source"] = s.value ;
		    edge["data"]["target"] = "_:dtp"+i ;
		    edge["classes"] = "edge";
		    jsonObj.push( edge );
		}
	    }
	    i++;
	});
    return( jsonObj );

}

// produce CY graph from CY JSON
function createCYgraph( data,graph ) {

    cy = cytoscape({
	    container: $('#cy'),
	    elements: data,
	    layout: {
		name: 'dagre',
		// dagre algo options, uses default value on undefined
		nodeSep: undefined, // the separation between adjacent nodes in the same rank
		edgeSep: undefined, // the separation between adjacent edges in the same rank
		rankSep: undefined, // the separation between adjacent nodes in the same rank
		rankDir: 'TB', // 'TB' for top to bottom flow, 'LR' for left to right,
		ranker: 'tight-tree', // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
		minLen: function( edge ){ return 2; }, // number of ranks to keep between the source and target of the edge
		edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges
		// general layout options
		fit: true, // whether to fit to viewport
		padding: 30, // fit padding
		spacingFactor: 1.3, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
		nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
		animate: true, // whether to transition the node positions
		animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
		animationDuration: 500, // duration of animation in ms if enabled
		animationEasing: undefined, // easing of animation if enabled
		boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
		transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
		ready: function(){}, // on layoutready
		stop: function(){} // on layoutstop
	    },
	    style: [ // the stylesheet for the CY graph
    {
	selector: 'node',
	style: {
	    'shape': function (shape) {return ( shape.data().shape )},
	    'background-color': '#eee',
	    'label': function (label) {return ( ((label.data().class)?((onto[ nsv( label.data().class ) ])?onto[ nsv( label.data().class )].label:(nsv( label.data().class )?nsv( label.data().class ):label.data().class))+`:\n`:``) + label.data().name )},
	    'text-wrap': 'wrap',
	    'text-max-width': 250,
	    "border-width": 2,
	}
    },
    {
	selector: 'edge',
	style: {
	    'label': function (label) {return ( label.data().name + "\n \u2060" )},
	    'width': 2,
	    'curve-style': 'unbundled-bezier',
	    'target-arrow-shape': 'triangle',
	    'target-arrow-fill': 'filled',
	    'edge-text-rotation': 'autorotate',
	    'text-wrap': 'wrap' ,
	    'text-background-opacity': 0,
	}
    },
    {
	selector: 'node.highlight',
	style: {
	    'border-color': '#f7b71d',
	    'border-width': '2px'
	}
    },
    {
	selector: 'node.semitransp',
	style:{ 'opacity': '0.5' }
    },
    {
	selector: 'edge.highlight',
	style: { 'target-arrow-color': '#f7b71d' }
    },
    {
	selector: 'edge.semitransp',
	style:{ 'opacity': '0.2' }
    }
		     ],
	});

    var makeTippy = function(node,content,place) {
	return tippy( node.popperRef(), {
		content: function(){
		    var div = document.createElement('div');
		    div.innerHTML = `
		    <div class="tippy-popper" style="text-align:left;">
		    <div class="tippy-content">`+
		    content+`
		    </div>
		    </div>`;
		    return div;
		},
		trigger: 'manual',
		arrow: true,
		//boundary: document.getElementById('cy'),
		placement: place,
		hideOnClick: true,
		multiple: true,
		theme: 'light-border',
		sticky: true,
		interactive: true
	    });
    };

    // style nodes individually
    cy.nodes().forEach(function( node ) {
	    var res;
	    res = graph.any( $rdf.sym( node.id() ), NS["crm"]("P138i_has_representation"), undefined );
	    if ( res ) {
		if ( res.value.includes( '/models/#' ) ) {
		    res = graph.any( $rdf.sym( res.value ), NS["skos"]("prefLabel"), undefined );		
		}
		node.style ( { 
			"background-image": res.value , 
			    "background-fit": "cover cover",
			    "border-width": 2,
			    "width": 120,
			    "height": 150,
			    "border-color": function (color) { return( color.data().bgcolor?color.data().bgcolor:'initial' )}
		    } );
	    } else {
		node.style( { 
			"text-halign":"center",
			    "text-valign":"top",
			    "background-color": function (color) {return ( color.data().bgcolor?color.data().bgcolor:'initial' )}
		    } );
	    }

	    // all statements go in tippies
	    if ( node.id().startsWith( NS[""]("").value )) // render only edges from ECPA nodes                        
		{
		    id = node.id();
		    var contentR = `<p><b>Outgoing statements:</b></p><ul class="listBibl">`;
		    statements = graph.statementsMatching( $rdf.sym( id ), undefined, undefined );
		    if ( statements.length > 0 ) {
			statements.forEach(function(statement) {
				var s = statement.subject;
				var p = statement.predicate;
				var o = statement.object;
		    
				contentR += `<li data-s="`+s+`" data-p="`+p+`" data-o="`+o+`"`+`><span>`
				    +( onto[ nsv( p.value ) ]?onto[ nsv( p.value ) ].label:(nsv( p.value )?nsv( p.value ):p.value))
				    +`</span> &nbsp; <span>`+
							  ( onto[ nsv( o.value ) ]?onto[ nsv( o.value ) ].label:
							    ( skp( graph,o )?skp( graph,o ):
							      //( nsv( o.value )?nsv( o.value ):
							      o.value))
							  //)
							  +`</span></li>`;});
		    } else {
			contentR += `<li>none</li>`;
		    }
		    contentR += "</ul>";
		    var contentL = `<p><b>Incoming statements:</b></p><ul class="listBibl">`;
		    statements = graph.statementsMatching( undefined, undefined, $rdf.sym( id ) );
		    if ( statements.length > 0 ) {
			statements.forEach(function(statement) {
				var s = statement.subject;
				var p = statement.predicate;
				var o = statement.object;
		    
				contentL += `<li data-s="`+s+`" data-p="`+p+`" data-o="`+o+`"`+`><span>`
				    +( onto[ nsv( p.value ) ]?onto[ nsv( p.value ) ].label:(nsv( p.value )?nsv( p.value ):p.value))
				    +`</span> &nbsp; <span>`+
							  ( onto[ nsv( s.value ) ]?onto[ nsv( s.value ) ].label:
							    ( skp( graph,s )?skp( graph,s ):
							      ( nsv( s.value )?nsv( s.value ):
								s.value)))
							  +`</span></li>`;
			    });
		    } else {
			contentL += `<li>none</li>`;
		    }
		    contentL += "</ul>";
		    var tippy = makeTippy(node,contentL,'left');
		    var tippy2 = makeTippy(node,contentR,'right');
		    node.on('mouseover', () => { tippy.show(),tippy2.show() });
		    node.on('mouseout', () => { tippy.hide(),tippy2.hide() });
		}
	});

    // Initialize navigator and panzoom
    cy_var["nav"] = cy.navigator({ container:document.getElementsByClassName("cytoscape-navigator")[0] });
    cy.panzoom();
    $( ".cy-panzoom" ).append(`
			      <div style="display:grid; position:absolute; top:220px; left:-5px;">
			      <button style="font-size:10px;padding:0px;margin-bottom:1px;" type="button" class="btn btn-primary" id="seventhstep">Export PNG</button>
			      <button style="font-size:10px;padding:0px" type="button" class="btn btn-primary" id="eighthstep">Export JSON</button>
			      </div>
			      `);

    // Event handlers
    cy.nodes().on('click', function(e) {
	    var ele = e.target;
	    $( "a[href='#mod_view']" ).trigger( "click" ); // switch to viewing mode
	    $( "#view_classes a[href='"+ele.data().class+"']" ).trigger( "click" ); // show class
	    $( "#view_instances a[href='"+ele.id()+"']" ).trigger( "click" ); // show instance
	});
    cy.on('mouseover', 'node', function(e) {
	    var sel = e.target;
	    cy.elements()
		.difference(sel.outgoers()
			    .union(sel.incomers()))
		.not(sel)
		.addClass('semitransp');
	    sel.addClass('highlight')
		.outgoers()
		.union(sel.incomers())
		.addClass('highlight');
	});
    cy.on('mouseout', 'node', function(e) {
	    var sel = e.target;
	    cy.elements()
		.removeClass('semitransp');
	    sel.removeClass('highlight')
		.outgoers()
		.union(sel.incomers())
		.removeClass('highlight');
	});

}
