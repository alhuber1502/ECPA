
// Global
$.ajax({
    url: "/data/stats.json", dataType: 'json',
    success: function(data) { stats = data; },
    error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
});

function output_met(met) {
    return met.replace(/\-/g," &#x02d8; ").replace(/\+/g,"&#x2032;");
}

// Initialize poem display
if ($('#reading').length) {

  // Reading
    // load object (w/pc) data
    $.ajax({
        url: "/works/"+docname+"/"+docname+"_o.json", dataType: 'json',
	success: function(data) { o = data; },
	error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load sentence data
    $.ajax({
	url: "/works/"+docname+"/"+docname+"_s.json", dataType: 'json',
	success: function(data) { s = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load NUPOS POS metadata
    $.ajax({
	url: "/data/nupos.json", dataType: 'json', 
	success: function(data) { nupos = data; },
	error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load Penn POS metadata
    $.ajax({
	url: "/data/penn.json", dataType: 'json', 
	success: function(data) { penn = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

  // Analysis
    // load typed dependencies metadata
    $.ajax({
	url: "/data/tdep.json", dataType: 'json', 
	success: function(data) { tdep = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load named entities data
    $.ajax({
	url: "/works/"+docname+"/"+docname+"_ne.json", dataType: 'json', 
	success: function(data) { ne_id = data[0]; ne = data[1]; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load rhetorical figures
    $.ajax({
	url: "/works/"+docname+"/"+docname+"_rf.json", dataType: 'json', 
	success: function(data) { rf = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load rhetfig metadata
    $.ajax({
	url: "/data/rf.json", dataType: 'json', 
	success: function(data) { rf_id = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load frame semantic parse data
    $.ajax({
	url: "/works/"+docname+"/"+docname+"-wds_sema.json", dataType: 'json',
	success: function(data) { sema = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load syntactic dependency parse data
    $.ajax({
	url: "/works/"+docname+"/"+docname+"-wds_malt.conll", dataType: 'text',
	success: function(data) { malt = data.split("\n\n"); },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load stopwords list
    $.ajax({
	url: "/data/stopwords.txt", dataType: 'text',
	success: function(data) { stopped = data.split("\n"); },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

  // Visualization
    // load phonemes (w) data
    $.ajax({
	url: "/works/"+docname+"/"+docname+"_p.json", dataType: 'json',
	success: function(data) { p = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load line data
    $.ajax({
	url: "/works/"+docname+"/"+docname+"_l.json", dataType: 'json', async: false,
	success: function(data) { l = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

  // Modelling
    // load ontologies
    $.ajax({
	url: "/resources/models/onto.json", dataType: 'json',
	success: function(data) { onto = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });
    
    // load fundamentals
    $.ajax({
	url: "/resources/models/fundamental.json", dataType: 'json',
	success: function(data) { fcr = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load hierarchies
    $.ajax({
	url: "/resources/models/ontohier.json", dataType: 'json',
	success: function(data) { ontohier = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load authors/works lists
    $.ajax({
	url: "/resources/models/authwork_mdp.json", dataType: 'json',
	success: function(data) { mod_auth = data[0]; mod_work = data[1]; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });

    // load public models' metadata
    $.ajax({
	url: "/resources/models/models.json", dataType: 'json',
	success: function(data) { mod_md = data; },
        error: function (jqXHR, textStatus, errorThrown) { console.log(jqXHR, textStatus, errorThrown); }
    });


    // generate "poetic form"
    var arr_syllab = [], arr_met = [], arr_rhyme = [];
    if (l.syllab != "" && l.syllab != null) {
	arr_syllab = l.syllab.split(/\./);
    }
    if (l.met != "" && l.met != null) {
	arr_met = l.met.split(/\s+/);
    }
    if (l.rhyme != "" && l.rhyme != null && l.rhyme != "irregular") {
	arr_rhyme = l.rhyme.split('');
    }
    var pf = ""; 
    if (l.met != "" && l.met != null) {
	pf += "<div class='bibl'>Metrical notation: ";
	if (arr_met.length > 1) {
	    pf += "<ul>";
	    for (var i=0; i<arr_met.length; i++) {
		pf += "<li><span>"+
		    (arr_rhyme[i] ? arr_rhyme[i] : i+1)
		    +"</span> "+ output_met(arr_met[i]) +"</li>";
	    }
	    pf += "</ul>";
	} else {
	    pf += output_met(l.met);
	}
	pf += "</div>";
    }
    var result = "";
    for (var i=0; i<l.type.length; i++) {
	result += l.type[i].text + "; ";
    }
    result = result.slice(0,-2);
    pf += result != "" ? "<div class='bibl'>Metrical foot type: "+result+"</div>" : "";
    result = "";
    for (var i=0; i<l.number.length; i++) {
	result += l.number[i].text + "; ";
    }
    result = result.slice(0,-2);
    pf += result != "" ? "<div class='bibl'>Metrical foot number: "+result+"</div>" : "";
    pf += l.real != "" && l.real != null ? "<div class='bibl'>Realisation: "+ output_met(l.real) +"</div>" : "";
    result = "";
    for (var i=0; i<l.lines.length; i++) {
	result += l.lines[i].text + "; ";
    }
    result = result.slice(0,-2);
    pf += result != "" ? "<div class='bibl'>Syllabic phenomena: "+result+"</div>" : "";
    result = "";
    for (var i=0; i<l.stanzas.length; i++) {
	result += l.stanzas[i].text + "; ";
    }
    result = result.slice(0,-2);
    pf += result != "" ? "<div class='bibl'>Stanza: "+result+"</div>" : "";
    pf += l.syllab != "" && l.syllab != null ? "<div class='bibl'>Syllable pattern: "+arr_syllab.join('/')+"</div>" : "";
    pf += l.rhyme != "" && l.rhyme != null ? "<div class='bibl'>Rhyme scheme: "+l.rhyme+"</div>" : "";
    result = "";
    for (var i=0; i<l.spos.length; i++) {
	result += l.spos[i].text + "; ";
    }
    result = result.slice(0,-2);
    pf += result != "" ? "<div class='bibl'>Rhyme (stanza position): "+result+"</div>" : "";
    if (pf != "") {
	var pf_symbols = '<i>Symbols:</i><ul class="bibl"><li><span>&#x02d8;</span> metrically non-prominent</li><li><span>&#x2032;</span> metrically prominent (primary)</li><li><span>`</span> metrically prominent (secondary)</li><li><span>|</span> metrical foot boundary</li><li><span>/</span> metrical line boundary</li><li><span>||</span> caesura</li></ul>';
	$("#poeticform").html('<div id="form"><h1 class="info">Poetic form</h1><table><tr><td>'+pf+'</td>'+
          '<td style="font-size:12px">'+pf_symbols+'</td></tr></table></div>');
    } else {
	$("#poeticform").remove();
    }

}
