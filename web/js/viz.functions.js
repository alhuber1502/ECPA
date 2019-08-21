
// Visualization


// "Phonemia" (LK)

// Phonemes
// Vowels
var v_s = ["ph01","ph02","ph03","ph04","ph05","ph06","ph07"]; // monophthongs (short)
var v_l = ["ph08","ph09","ph10","ph11","ph12"]; // monophthongs (long)
var v_d = ["ph13","ph14","ph15","ph16","ph17","ph18","ph19","ph20"]; // diphthongs
var v_n = ["ph21","ph22"]; // neutralized
var vow = [v_l,v_d,v_s,v_n];
// Front/Central/Back
var v_f = ["ph01","ph08","ph03","ph05"]; // front
var v_c = ["ph04","ph06","ph10"]; // central
var v_b = ["ph02","ph09","ph11","ph07","ph12"]; // back

// Consonants
var c_n = ["ph23","ph24","ph25"]; // nasal
var c_p = ["ph26","ph27","ph28","ph29","ph30","ph31"]; // stop/plosive
var c_a = ["ph32","ph33"]; // affricate
var c_f = ["ph34","ph35","ph36","ph37","ph38","ph39","ph40","ph41","ph42","ph43"]; // fricative
var c_x = ["ph44","ph45","ph46","ph47"]; // approximant
var con = [c_a,c_n,c_p,c_f,c_x];
// Voiced/Voiceless
var cvo = [c_n,"ph27","ph29","ph31","ph32","ph35","ph37","ph39","ph41","ph43",c_x];
var cuv = ["ph26","ph28","ph30","ph33","ph34","ph36","ph38","ph40","ph42"];

// Suprasegmentals
var sup = ["su01","su02","su03","su04","su05"];

// CSS Styles
var phon = '', statsd = '', classes = '', scan = '', isProse = 0;
if ( $('#genres').text().indexOf('prose poem') > -1 ) { // prose poems
    isProse = 1;
}
phon='<style id="style_v_s">\n'; $.each(v_s,function(i,e) { phon += "."+e+"::before,"; });
var $style_v_s = phon.substring(0,phon.length-1) + ' { background-color:#FA8072; }\n</style>';
phon='<style id="style_v_l">\n'; $.each(v_l,function(i,e) { phon += "."+e+"::before,"; });
var $style_v_l = phon.substring(0,phon.length-1) + ' { background-color:#EED5B7; }\n</style>';
phon='<style id="style_v_d">\n'; $.each(v_d,function(i,e) { phon += "."+e+"::before,"; });
var $style_v_d = phon.substring(0,phon.length-1) + ' { background-color:#FFC469; }\n</style>';
phon='<style id="style_v_n">\n'; $.each(v_n,function(i,e) { phon += "."+e+"::before,"; });
var $style_v_n = phon.substring(0,phon.length-1) + ' { background-color:#FFF68F; }\n</style>';
phon='<style id="style_vow">\n'; vow = $.map(vow, function(n){ return n; }); $.each(vow,function(i,e) { phon += "."+e+"::before,"; });
var $style_vow = phon.substring(0,phon.length-1) + ' { background-color:#fde6de; }\n</style>';
phon='<style id="style_v_f">\n'; $.each(v_f,function(i,e) { phon += "."+e+"::before,"; });
var $style_v_f = phon.substring(0,phon.length-1) + ' { background-color:#fff2bf; }\n</style>';
phon='<style id="style_v_c">\n'; $.each(v_c,function(i,e) { phon += "."+e+"::before,"; });
var $style_v_c = phon.substring(0,phon.length-1) + ' { background-color:#ffd9a6; }\n</style>';
phon='<style id="style_v_b">\n'; $.each(v_b,function(i,e) { phon += "."+e+"::before,"; });
var $style_v_b = phon.substring(0,phon.length-1) + ' { background-color:#ce9898; }\n</style>';

phon='<style id="style_c_n">\n'; $.each(c_n,function(i,e) { phon += "."+e+"::before,"; });
var $style_c_n = phon.substring(0,phon.length-1) + ' { background-color:#BCED91; }\n</style>';
phon='<style id="style_c_p">\n'; $.each(c_p,function(i,e) { phon += "."+e+"::before,"; });
var $style_c_p = phon.substring(0,phon.length-1) + ' { background-color:#B4CDCD; }\n</style>';
phon='<style id="style_c_a">\n'; $.each(c_a,function(i,e) { phon += "."+e+"::before,"; });
var $style_c_a = phon.substring(0,phon.length-1) + ' { background-color:#A4D3EE; }\n</style>'; 
phon='<style id="style_c_f">\n'; $.each(c_f,function(i,e) { phon += "."+e+"::before,"; });
var $style_c_f = phon.substring(0,phon.length-1) + ' { background-color:#B5A2FF; }\n</style>';
phon='<style id="style_c_x">\n'; $.each(c_x,function(i,e) { phon += "."+e+"::before,"; });
var $style_c_x = phon.substring(0,phon.length-1) + ' { background-color:#DBDB70; }\n</style>';
phon='<style id="style_con">\n';  con = $.map(con, function(n){ return n; }); $.each(con,function(i,e) { phon += "."+e+"::before,"; });
var $style_con = phon.substring(0,phon.length-1) + ' { background-color:#d7d8e4; }\n</style>';
phon='<style id="style_cvo">\n'; cvo = $.map(cvo, function(n){ return n; }); $.each(cvo,function(i,e) { phon += "."+e+"::before,"; });
var $style_cvo = phon.substring(0,phon.length-1) + ' { background-color:#b5f9d3; }\n</style>';
phon='<style id="style_cuv">\n'; cuv = $.map(cuv, function(n){ return n; }); $.each(cuv,function(i,e) { phon += "."+e+"::before,"; });
var $style_cuv = phon.substring(0,phon.length-1) + ' { background-color:#9ee7fa; }\n</style>';

var $style_cl_noun = '<style id="style_cl_noun">\n.cl_noun { background-color:#fad8d8; }\n</style>';
var $style_cl_pron = '<style id="style_cl_pron">\n.cl_pron { background-color:#ffe2d7; }\n</style>';
var $style_cl_verb = '<style id="style_cl_verb">\n.cl_verb { background-color:#ddf9dd; }\n</style>';
var $style_cl_adj = '<style id="style_cl_adj">\n.cl_adj { background-color:#bce7e5; }\n</style>';
var $style_cl_adv = '<style id="style_cl_adv">\n.cl_adv { background-color:#e7edf5; }\n</style>';
var $style_cl_other = '<style id="style_cl_other">\n.cl_other { background-color:#d8e3ff; }\n</style>';

var $style_scans = '<style id="style_scans">\n.conf-high { background-color:#9d9 !important; }\n.conf-med { background-color:#ffdcb2 !important; }\n.conf-low { background-color:#fcc !important; }\n</style>';
//var $style_scans = '<style id="style_scans">\n#lk_body .text table#lk_scan tr.scan.conf-high td { background-color:#9d9 !important; }\n#lk_body .text table#lk_scan tr.scan.conf-med td { background-color:#ffdcb2 !important; }\n#lk_body .text table#lk_scan tr.scan.conf-low td { background-color:#fcc !important; }\n</style>';

// initialize visualizations
var ecep, ecepsaved = 0, ecepidsaved, displaysaved, $clone = $(), viz_chosen = '', viz_ft = 1, rp = {};

$(document.body).on('click', '.viz_choose', function () {
	// set up LK
	$("#visualization").html( '<div id="lk_viz"><p id="loading"><br/>Loading default display...</p><div id="spinner"><img src="/images/loader.gif"/></div></div>' );
	var checkExist = setInterval(function() {
	    if ($('#spinner').length) {
		clearInterval(checkExist);		    
	    }
	}, 100);
	var d = $(this);
	_.defer( function() {
	    init( $(d).attr( 'id' ) );
	    $( "#spinner" ).remove();
	    $( "#loading" ).remove();
	});
});
function init(d) {
    viz_chosen = d;
    $('.nav-tabs a[href="#text"]').tab('show');
    $( "div#text" ).scrollTop(0);
    ecep = $("#text").find('.ecep');
    switch ( d ) {
    case "PHONEMIA_VIZ":                                             // "Phonemia"
	if ( $(ecep).length ) {
	    $clone = $( "#text" ).clone()
		.find( '[id*="_return"],[class*="note"],.introduction,.pagebreak,.stage,.epigraph,.argument,.castList,.dramatispersonae,p.align-center,.notes' ).remove().end()
		.find( "#"+$(ecep).eq(0).attr('id') ).nextUntil( "#"+$(ecep).eq(1).attr('id') );
	} else {
	    $clone = $( "#text" ).clone()
		.find( '[id*="_return"],[class*="note"],.introduction,.pagebreak,.stage,.epigraph,.argument,.castList,.dramatispersonae,p.align-center,.notes' ).remove().end()
		.children(".lg,.sp,#text > p");
	    if ($clone.length == 0) { $clone = $( "#text > div" ).clone()
		    .find( '[id*="_return"],[class*="note"],.introduction,.pagebreak,.stage,.epigraph,.argument,.castList,.dramatispersonae,p.align-center,.notes' ).remove().end()
		    .children(".lg,.sp,#text > p");
	    }
	    if ($clone.length == 0) { $clone = $( "#text > div > div" ).clone()
		    .find( '[id*="_return"],[class*="note"],.introduction,.pagebreak,.stage,.epigraph,.argument,.castList,.dramatispersonae,p.align-center,.notes' ).remove().end()
		    .children(".lg,.sp,#text > p");
	    }
	}
	ecepsaved = 0;
	ecepidsaved = '';
	(totals = []).length = 16; totals.fill(0);
	totalc = [], totalv = [], totala = [];
	lk_clone();
	
	// default visualization
	if ( isProse == 1 ) {                             // prose poems
	    displaysaved = "t+c";
	    lk_wc();
	    display_viz_lk( classes );
	} else {	                             // lyric poems
	    displaysaved = "t+d";
	    lk_stats();
	    display_viz_lk( statsd );
	}
	$.ajax({
	    url: "/js/lk-zeus/"+docname+"-1-lk.txt.zeus", dataType: 'text',
	    success: function(data) { zeus = data.split("\n"); }
	});
	break;
    case "POEMVIS_VIZ":                                              // PoemViewer
	poemvis_load(1);
	ecepsaved = 0;
	ecepidsaved = '';
	break;
    case "DTREEJS_VIZ":                                              // PoemViewer
	dtreejs_load(1);
	ecepsaved = 0;
	ecepidsaved = '';
	break;
    }
}


// LK viz home
$(document.body).on('click', '.viz_home', function () {
    viz_chosen = '';
    $( "div#text" ).scrollTop(0);
    statsd = '', classes = '', scan = '';
    $.getScript('/js/viz_overview.js');
    $( "#style_vow,#style_v_s,#style_v_l,#style_v_d,#style_v_n,#style_v_f,#style_v_c,#style_v_b" ).remove();
    $( "#style_con,#style_c_n,#style_c_p,#style_c_a,#style_c_f,#style_c_x,#style_cvo,#style_cuv" ).remove();
    $( "#style_cl_noun,#style_cl_pron,#style_cl_verb,#style_cl_adj,#style_cl_adv,#style_cl_other,#style_scans" ).remove();
});

// LK selection
$(document.body).on('change', '#selection', function () {
    var d = $(this);
    $( "#visualization" ).append( "<div id='spinner'><img src='/images/loader.gif'/></div>" );
    var checkExist = setInterval(function() {
	if ($('#spinner').length) {
	    clearInterval(checkExist);		    
	}
    }, 100);
    _.defer( function() {
        ecepsaved = parseInt( d.val(),10 );
	ecepidsaved = $("#text").find('.ecep').eq(ecepsaved).attr("id");
	displaysaved = $( 'select#display' ).val();
	(totals = []).length = 16; totals.fill(0);
	totalc = [], totalv = [], totala = [];
	$.ajax({
	    url: "/js/lk-zeus/"+docname+"-"+(ecepsaved+1)+"-lk.txt.zeus", dataType: 'text', async: false,
	    success: function(data) { zeus = data.split("\n"); }
	});
	$clone = $( "#text" ).clone()
	    .find( '[id*="_return"],[class*="note"],.introduction,.pagebreak,.stage,.epigraph,.argument,.castList,.dramatispersonae,p.align-center,.notes' ).remove().end()
	    .find( "#"+$(ecep).eq(ecepsaved).attr('id') ).nextUntil( "#"+$(ecep).eq(ecepsaved+1).attr('id') );
	lk_clone();
	switch ( $( 'select#display' ).val() ) {
	case "t+d":
	    lk_stats();
	    display_viz_lk( statsd );
	    break;
	case "t+c":
	    lk_wc();
	    display_viz_lk( classes );
	    break;
	case "t+m":
	    lk_scansion();
	    display_viz_lk( scan );
	    break;
	}
	$( "#style_vow,#style_v_s,#style_v_l,#style_v_d,#style_v_n,#style_v_f,#style_v_c,#style_v_b" ).remove();
	$( "#style_con,#style_c_n,#style_c_p,#style_c_a,#style_c_f,#style_c_x,#style_cvo,#style_cuv" ).remove();
	$( "#style_cl_noun,#style_cl_pron,#style_cl_verb,#style_cl_adj,#style_cl_adv,#style_cl_other,#style_scans" ).remove();
	if (ecepidsaved) {
	    $( "#text" ).animate({
		    scrollTop: $( "#"+ecepidsaved ).offset().top - 100
			}, 500);
	}
	$( "#spinner" ).remove();
    });
});

// LK display
$(document.body).on('change', '#display', function () {
    var d = $(this);
    $( "#visualization" ).append( "<div id='spinner'><img src='/images/loader.gif'/></div>" );
    var checkExist = setInterval(function() {
	if ($('#spinner').length) {
	    clearInterval(checkExist);		    
	}
    }, 100);
    _.defer( function() {
	displaysaved = $( 'select#display' ).val();
	(totals = []).length = 16; totals.fill(0);
	totalc = [], totalv = [], totala = [];

	switch ( $( 'select#display' ).val() ) {
	case "t+d":
	    scan = '';
	    classes = '';
	    lk_stats();
	    display_viz_lk( statsd );
	    break;
	case "t+c":
	    statsd = '';
	    scan = '';
	    lk_wc();
	    display_viz_lk( classes );
	    break;
	case "t+m":
	    statsd = '';
	    classes = '';
	    lk_scansion();
	    display_viz_lk( scan );
	    break;
	}
	$( "#style_vow,#style_v_s,#style_v_l,#style_v_d,#style_v_n,#style_v_f,#style_v_c,#style_v_b" ).remove();
	$( "#style_con,#style_c_n,#style_c_p,#style_c_a,#style_c_f,#style_c_x,#style_cvo,#style_cuv" ).remove();
	$( "#style_cl_noun,#style_cl_pron,#style_cl_verb,#style_cl_adj,#style_cl_adv,#style_cl_other,#style_scans" ).remove();
	$( "#spinner" ).remove();
    });
});

// LK display phonemes
function lk_clone() {

    $.each(p, function(index) {
	var phon = "<span class='w' data-id='"+index+"'>";
	$.each( p[ index ].phon, function(i,e) {
		phon += "<span class='"+e+"'></span>";
	    });
	phon += "</span>";
	rp[index] = {
	    "index" : index,
	    "phon" : phon
	};
    });
    $clone.find( ".w" ).each( function(i,e) {
	if ( p[ $(e).attr("id") ] ) {
	    $(e).replaceWith( rp[ $(e).attr("id") ].phon );
	}
    });

}

// LK generate word classes
function lk_wc() {
    // create overview
    classes = `<table style="width:100%; table-layout:fixed;" id="lk_wc"><tr><th style="width:45%; margin-right:30px; text-align:left;" class="panel-title">Phonemic transcription</th><th style="text-align:left" class="panel-title">Major word classes</th></tr>`;

    $clone.each( function(i,e) { // paratexts
	    if ( $(e).prop("nodeName")=="H2" || $(e).hasClass( 'trailer' ) || $(e).hasClass( 'epigraph' ) ) {
	    classes += `<tr>`;
	    classes += `<td>`+$('<div>').append($(e).clone()).html()+`</td>`;
	    classes += `</tr>`;
	} else if ( ($(e).hasClass( 'lg' )) || ($(e).hasClass( 'sp' )) ) {
	    $(e).children().each( function(i,e) {
		if ( ($(e).hasClass( 'lg' )) || ($(e).hasClass( 'sp' )) ) {
		    $(e).find( "div.line,span.head-stanza").each( function(i,e) {
			classes += `<tr>`;
			classes += `<td>`+$('<div>').append($(e).clone()).html()+(($(e).prop("nodeName")=="DIV" || $(e).hasClass("p-in-sp"))?`</td>`+lk_wordclass( $(e) ):'</td>');
			classes += `</tr>`;
		    });
		} else {         
		    classes += `<tr>`;
		    classes += `<td>`+$('<div>').append($(e).clone()).html()+(($(e).prop("nodeName")=="DIV" || $(e).hasClass("p-in-sp"))?`</td>`+lk_wordclass( $(e) ):'</td>');
		    classes += `</tr>`;
		}
			});
		classes += `<tr><td><br></td></tr>`;
	    } else {
		classes += `<tr>`;
		classes += `<td>`+$('<div>').append($(e).clone()).html()+(($(e).prop("nodeName")=="P" || $(e).prop("nodeName")=="DIV" || $(e).hasClass("p-in-sp"))?`</td>`+lk_wordclass( $(e) ):'</td>');
		classes += `</tr>`;
	    }
	});
    classes += '</table>';

}

// LK word class line
function lk_wordclass (line) {
    var result = '', i = 0;
    $( line ).find( ".w" ).each( function(index,element) {
	if (o[ $(element).attr("data-id") ]) {
	    var posA = (o[$(element).attr("data-id")].pos).split('|'), posSm = '';
	    $.each(posA, function(index, value) {
		var cl = '';
		if ( nupos[value].mwc == "noun" ) { cl = 'noun'; }
		else if  ( nupos[value].mwc == "pron" ) { cl = 'pron'; }
		else if  ( nupos[value].mwc == "verb" ) { cl = 'verb'; }
		else if  ( nupos[value].mwc == "adj" ) { cl = 'adj'; }
		else if  ( nupos[value].mwc == "adv" ) { cl = 'adv'; }
		else { cl = 'other'; }
		posSm += "<span data-id='"+$(element).attr("data-id")+"-wc' class='cl_"+ cl +"'>" + nupos[value].mwc + "</span>"+"|";
	    });
	    posSm = posSm.substring(0, posSm.length-1);
	    result += posSm + " ";
	}
    });
    $.each( [vow,con], function(i,e) {
	var result = 0;
	$.each(e, function (i2,e2) {
	    var re = new RegExp(e2, 'g');
	    result = ((line.html() || '').match(re) || []).length;
	    for (x=0;x<result;x++) {
		totala.push(e2);
		if ( $.inArray(e2, [].concat.apply([], vow)) != -1 ) {
		    totalv.push(e2);
		} else {
		    totalc.push(e2);
		}
	    }
	});
    });
    return "<td>"+result+"</td>";
}

// LK build scansion
function lk_scansion() {
    // create overview
    scan = `<table style="width:100%; table-layout:fixed;" id="lk_scan"><tr class="panel-title"><th style="width:45%; margin-right:30px;">Phonemic transcription</th><th style="text-align:left;" class="panel-title">Scansion (metrical pattern)</th>
    </tr>`;
    // build scansion

    $clone.each( function(i,e) { // paratexts
	if ( $(e).prop("nodeName")=="H2" || $(e).prop("nodeName")=="P" || $(e).hasClass( 'trailer' ) || $(e).hasClass( 'epigraph' ) ) {
	    scan += `<tr>`;
	    scan += `<td>`+$('<div>').append($(e).clone()).html()+`</td>`;
	    scan += `</tr>`;
	} else if ( ($(e).hasClass( 'lg' )) || ($(e).hasClass( 'sp' )) ) {
	    $(e).children().each( function(i,e) {                                                              
		if ( ($(e).hasClass( 'lg' )) || ($(e).hasClass( 'sp' )) ) {
		    $(e).find( "div.line,span.head-stanza").each( function(i,e) {
			scan += `<tr>`;                                                                           
			scan += `<td>`+$('<div>').append($(e).clone()).html()+(($(e).prop("nodeName")=="DIV")?`</td>`+lk_scan( $(e) ):'</td>');
			scan += `</tr>`;
		    });
			classes += `<tr><td><br></td></tr>`;
		} else {         
		    scan += `<tr>`;                                                                           
		    scan += `<td>`+$('<div>').append($(e).clone()).html()+(($(e).prop("nodeName")=="DIV")?`</td>`+lk_scan( $(e) ):'</td>');                                                                                           
		    scan += `</tr>`;                                                                         
		}
	    });
		scan += `<tr><td><br></td></tr>`;
	}
    });
    scan += '</table>';

}

// LK scan line
function lk_scan (line) {
    var met = '', syllab = '', result = '';
    var syl = [], scount = 0;

    if ( l[ $( line ).attr( "id" ) ] ) {
	if ( l[$( line ).attr( "id" )].real != '' && l[$( line ).attr( "id" )].real != null ) {
	    met = l[$( line ).attr( "id" )].real;
	} else {
	    met = l[$( line ).attr( "id" )].met;
	}
    }
    if (l[$( line ).attr( "id" )] && l[$( line ).attr( "id" )].syllab != "" && l[$( line ).attr( "id" )].syllab != null) {
	syllab = l[$( line ).attr( "id" )].syllab;
    }
    if (l[$( line ).attr( "id" )] && ( (met != '' && syllab != '') || l.met != '' ) ) {
	var i = 0, j = 0, wordnum = 0, hyphened = [], omitted = [];
	$.each( l[$( line ).attr( "id" )].content, function( index,item ) {
	    if ( o[item] && o[item].class == "w" ) {
		syl[i] = parseInt(o[item].syllab);
		scount += parseInt(o[item].syllab)
		wordnum++;
		if (o[item].tok.indexOf('-') > -1) {
		    hyphened.push(i);
		}
		if (parseInt(o[item].syllab) == 0) {
		    omitted.push(i);
		}
		i++;
	    }
	});
	if ( (met != '' && syllab != '') && scount == parseInt(syllab)) {    // syllables and metrical pattern match
	    var i = 0, wrd = [];
	    met = met.replace(/[\||\/]/g,'');
	    for (i = 0; i < syl.length; i++) {
		wrd[i] = '';
		for  (var j = 0; j < syl[i]; j++) {
		    wrd[i] += met.charAt(j);
		}
		met = met.substring( syl[i] );
	    }
	    result = lk_output_scan(wrd,line,1);
	} else {                                                             // use automatic scansion results
	    var lineno = $clone.find( "#"+$( line ).attr( "id" ) ).children(".ln").text().trim()-1;
	    var	syl = zeus[ lineno ].split(':').pop().trim().replace(/\'/g,'+').split(" ");
	    $.each( hyphened, function(index,item) {
		syl[item] += syl[item+1];
	    });
	    $.each( hyphened, function(index,item) {
		syl.splice(item+1,1);
	    });
	    $.each( omitted, function(index,item) {
		syl[item] = '';
	    });
	    if (syl.length == wordnum) {
		result = lk_output_scan(syl,line,_.contains(syl, '?')?3:2); 		
	    } else {
		result = lk_output_scan(syl,line,3);
	    }
	}
    }
    $.each( [vow,con], function(i,e) {
	var result = 0;
	$.each(e, function (i2,e2) {
	    var re = new RegExp(e2, 'g');
	    result = ((line.html() || '').match(re) || []).length;
	    for (x=0;x<result;x++) {
		totala.push(e2);
		if ( $.inArray(e2, [].concat.apply([], vow)) != -1 ) {
		    totalv.push(e2);
		} else {
		    totalc.push(e2);
		}
	    }
	});
    });
    return "<td class='scan'>"+result+"</td>";
}

function lk_output_scan (syl, line, conf) {
    var linetext = '',linemet = '',open = 0, saved = '', i = 0;
    $.each( l[$( line ).attr( "id" )].content, function( index,item ) {
	if ( o[item] && o[item].class == "w" ) {
	    open = 1;
	    linetext += "<td colspan='"+ ((typeof syl[i]=='string')?syl[i].split('').length:0) +"' data-id='"+item+"-wc'>"+saved+o[item].tok;
	    if ( parseInt( o[item].syllab ) == 0 || (typeof syl[i]!='string') ) { linemet += "<td> </td>"; }
	    else {
		$.each( syl[i].split(''), function( index,item ) {
		    linemet += "<td>"+output_met(item)+"</td>";
		});
	    }
	    saved = '';
	    i++;
	} else if ( o[item] && o[item].class == "pc" ) {
	    if (open == 1 ) {
		linetext += o[item].tok;
	    } else {
		saved += o[item].tok;
	    }
	} else if ( item == "c" ) {
	    linetext += "</td>";
	    open = 0;
	}
    });
    var confidence;
    if (conf == 1) { confidence = "conf-high"; }
    else if (conf == 2) { confidence = "conf-med"; }
    else if (conf == 3) { confidence = "conf-low"; }
    return `<table><tr class="scan `+confidence+`">`+linemet+`</tr><tr class="line">`+linetext+`</tr></table>`;

}

// LK generate statistics
(totals = []).length = 16; totals.fill(0);
var totalc = [], totalv = [], totala = [];
function lk_stats() {
    // create overview
    statsd = `<table style="width:100%; table-layout:fixed;" id="lk_stats"><tr class="panel-title"><th style="width:45%; margin-right:30px;">Phonemic transcription</th>
	<th class="t_v_s">V/s</th><th class="t_v_l">V/l</th><th class="t_v_d">V/d</th><th class="t_v_n">V/n</th>
	<th class="t_vt">V</th><th class="t_v_f">V/f</th><th class="t_v_c">V/c</th><th class="t_v_b">V/b</th>
	<th class="t_c_n">C/n</th><th class="t_c_p">C/p</th><th class="t_c_a">C/af</th><th class="t_c_f">C/f</th>
	<th class="t_c_x">C/ap</th><th class="t_ct">C</th><th class="t_cvo">C/v</th><th class="t_cuv">C/vl</th>
	</tr>`;
    // build stats

    $clone.each( function(i,e) { // paratexts
	if ( $(e).prop("nodeName")=="H2" || $(e).prop("nodeName")=="P" || $(e).hasClass( 'trailer' ) || $(e).hasClass( 'epigraph' ) ) {
	    statsd += `<tr>`;
	    statsd += `<td>`+$('<div>').append($(e).clone()).html()+`</td>`;
	    statsd += `</tr>`;
	} else if ( ($(e).hasClass( 'lg' )) || ($(e).hasClass( 'sp' )) ) {
	    $(e).children().each( function(i,e) {
		if ( ($(e).hasClass( 'lg' )) || ($(e).hasClass( 'sp' )) ) {
		    $(e).find( "div.line,span.head-stanza").each( function(i,e) {
			res = lk_calculate( $(e) );
			statsd += `<tr>`;
			statsd += `<td>`+$('<div>').append($(e).clone()).html()+(($(e).prop("nodeName")=="DIV")?`</td><td class="t_v_s">`+res[0]+`</td><td class="t_v_l">`+res[1]+`</td><td class="t_v_d">`+res[2]+`</td><td class="t_v_n">`+res[3]+`</td><td class="t_vt">`+res[4]+`</td><td class="t_v_f">`+res[5]+`</td><td class="t_v_c">`+res[6]+`</td><td class="t_v_b">`+res[7]+`</td><td class="t_c_n">`+res[8]+`</td><td class="t_c_p">`+res[9]+`</td><td class="t_c_a">`+res[10]+`</td><td class="t_c_f">`+res[11]+`</td><td class="t_c_x">`+res[12]+`</td><td class="t_ct">`+res[13]+`</td><td class="t_cvo">`+res[14]+`</td><td class="t_cuv">`+res[15]+`</td>`:'</td>');
			statsd += `</tr>`;
			});
		} else {         
		    res = lk_calculate( $(e) );
		    statsd += `<tr>`;
		    statsd += `<td>`+$('<div>').append($(e).clone()).html()+(($(e).prop("nodeName")=="DIV")?`</td><td class="t_v_s">`+res[0]+`</td><td class="t_v_l">`+res[1]+`</td><td class="t_v_d">`+res[2]+`</td><td class="t_v_n">`+res[3]+`</td><td class="t_vt">`+res[4]+`</td><td class="t_v_f">`+res[5]+`</td><td class="t_v_c">`+res[6]+`</td><td class="t_v_b">`+res[7]+`</td><td class="t_c_n">`+res[8]+`</td><td class="t_c_p">`+res[9]+`</td><td class="t_c_a">`+res[10]+`</td><td class="t_c_f">`+res[11]+`</td><td class="t_c_x">`+res[12]+`</td><td class="t_ct">`+res[13]+`</td><td class="t_cvo">`+res[14]+`</td><td class="t_cuv">`+res[15]+`</td>`:'</td>');
		    statsd += `</tr>`;
		}
			});
		statsd += `<tr><td><br></td></tr>`;
	}
    });
    statsd += `<tr id="totals"><td></td><td class="t_v_s">`+totals[0]+`</td><td class="t_v_l">`+totals[1]+`</td><td class="t_v_d">`+totals[2]+`</td><td class="t_v_n">`+totals[3]+`</td><td class="t_vt">`+totals[4]+`</td><td class="t_v_f">`+totals[5]+`</td><td class="t_v_c">`+totals[6]+`</td><td class="t_v_b">`+totals[7]+`</td><td class="t_c_n">`+totals[8]+`</td><td class="t_c_p">`+totals[9]+`</td><td class="t_c_a">`+totals[10]+`</td><td class="t_c_f">`+totals[11]+`</td><td class="t_c_x">`+totals[12]+`</td><td class="t_ct">`+totals[13]+`</td><td class="t_cvo">`+totals[14]+`</td><td class="t_cuv">`+totals[15]+`</td></tr>`;
    statsd += '</table>';

}

// LK calculate line
function lk_calculate (line) {
    var result = [], i = 0;
    $.each( [v_s,v_l,v_d,v_n,vow,v_f,v_c,v_b,c_n,c_p,c_a,c_f,c_x,con,cvo,cuv], function(i,e) {
	result[i] = 0;
	$.each(e, function (i2,e2) {
	    var re = new RegExp(e2, 'g');
	    result[i] += ((line.html() || '').match(re) || []).length;
	    });
	totals[i] += result[i];
	i++;
    });
    $.each( [vow,con], function(i,e) {
	var result = 0;
	$.each(e, function (i2,e2) {
	    var re = new RegExp(e2, 'g');
	    result = ((line.html() || '').match(re) || []).length;
	    for (x=0;x<result;x++) {
		totala.push(e2);
		if ( $.inArray(e2, [].concat.apply([], vow)) != -1 ) {
		    totalv.push(e2);
		} else {
		    totalc.push(e2);
		}
	    }
	});
    });
    return result;
}

// LK display
function display_viz_lk( vis ) {

    // set up LK
    $("#visualization").html( '<div id="lk_viz"><div id="lk_control"></div><div id="lk_body"></div></div>' );
    // display clone + visualization
    $(vis).appendTo( '#lk_body' ).wrapAll( '<div class="text"/>' );
    var lk_control = `<img style="padding:5px 0;" src="/images/screenshots/phonemia.png" alt="Phonemia"/><a class='help-modal' href='#'><span class='glyphicon glyphicon-question-sign' style='vertical-align:middle'/></a>`+`<a style="float:right; padding:23px 5px 0 0;" href="#visualization" class="viz_home">Visualization Home</a>
    <div class="panel-group" role="tablist" aria-multiselectable="true">
        <div class="panel">
	    <div class="panel-heading" role="tab" id="headingVOne">
	        <div class="panel-title">
		    <a role="button" data-toggle="collapse" href="#collapseVOne" aria-expanded="true" aria-controls="collapseVOne">Layout</a>
	        </div>
	    </div>
	    <div id="collapseVOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingVOne">
	        <div class="panel-body">`;

    if ( $(ecep).length > 0 ) {
	lk_control += `<label style="margin-right:10px;">Selection:</label>
	<select id="selection">`;
	$.each(ecep, function(i,e) {
		lk_control += `<option value="`+i+`">`;
		var $text = $( '#contents' ).find( 'li' ).eq(i).text();
		if ( $text.length > 42 ) {
		    $text = $text.trim().substring(0, 45).split(" ").slice(0, -1).join(" ") + "...";
		}
		lk_control += $text;
		lk_control += `</option>`;
	    });
	lk_control += `</select><br clear='all'/>`;
    }
    lk_control += `<label style="margin-right:23px;">Display:</label>
	<select id="display">`;
    if ( isProse == 0 ) { // verse only
	lk_control += `<option value="t+d">Phonemic transcription / distribution</option>`;
//    if ( l[ $("#text").find(".line").first().attr("id")] && l[ $("#text").find(".line").first().attr("id") ].met != null && l[$("#text").find(".line").first().attr("id")].met != '') {
        if ( l.met != "" ) {
	    lk_control += `<option value="t+m">Phonemic transcription / metre</option>`;
        }
    }
    lk_control += `<option value="t+c">Phonemic transcription / word classes</option>
		     </select>
	        </div>
            </div>
	</div>`;
    if (classes != '') {
	lk_control += `<div class="panel">
	        <div class="panel-heading" role="tab" id="headingTwoA">
		    <div class="panel-title">
		        <a role="button" data-toggle="collapse" href="#collapseVTwoA" aria-expanded="true" aria-controls="collapseVTwoA">Parts of speech (word classes)</a>
		    </div>
		</div>
		<div id="collapseVTwoA" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingTwoA">
		    <div class="panel-body">
		        <table style="width:100%">
	                    <tr>
	                        <th colspan="2"><label>Word classes:</label><a id="clear_cl"> ×</a></th>
			    </tr>
			    <tr id="classes">
			        <td style="width:50%;vertical-align:baseline;">
	            <input value="cl_noun" type="checkbox" aria-label="..."/> <span>Nouns</span><br/>
	            <input value="cl_pron" type="checkbox" aria-label="..."/> <span>Pronouns</span><br/>
	            <input value="cl_verb" type="checkbox" aria-label="..."/> <span>Verbs</span><br/>
                                </td><td>
	            <input value="cl_adj" type="checkbox" aria-label="..."/> <span>Adjectives</span><br/>
	            <input value="cl_adv" type="checkbox" aria-label="..."/> <span>Adverbs</span><br/>
	            <input value="cl_other" type="checkbox" aria-label="..."/> <span>Other</span><br/>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
	    </div>`;
    } else if (scan != '') {
	lk_control += `<div class="panel">
	        <div class="panel-heading" role="tab" id="headingTwoA">
		    <div class="panel-title">
		        <a role="button" data-toggle="collapse" href="#collapseVTwoA" aria-expanded="true" aria-controls="collapseVTwoA">Scansion (metrical pattern)</a>
		    </div>
		</div>
		<div id="collapseVTwoA" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingTwoA">
		    <div class="panel-body">
		        <table style="width:100%" id="scan_results">
	                    <tr>
	                        <th colspan="2"><label>Scansion results:</label></th>
			    </tr>
			    <tr>
			        <td style="vertical-align:baseline;"><span>′</span> Primary stress</td>
                            </tr>
			    <tr>
			        <td style="vertical-align:baseline;"><span>\`</span> Secondary stress</td>	
                            </tr>
			    <tr>
		                <td style="vertical-align:baseline;"><span>˘</span> Unstressed</td>
                            </tr>
			    <tr>
			        <td style="vertical-align:baseline;"><span>
	            <input value="scans" type="checkbox" aria-label="..."/></span> Show degrees of confidence <div id="scan_res" style="margin-left:20px;"/>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
	    </div>`;
    }
    lk_control += `<div class="panel">
	<div class="panel-heading" role="tab" id="headingVTwo">
	<div class="panel-title">
	<a role="button" data-toggle="collapse" href="#collapseVTwo" aria-expanded="true" aria-controls="collapseVTwo">Phonemic units and features</a>
	</div>
	</div>
	<div id="collapseVTwo" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingVTwo">
	<div class="panel-body">
	<table style="width:100%">
	<tr>
	<th><label>Vowels:</label><a id="clear_vow"> ×</a></th>
	<th><label>Consonants:</label><a id="clear_con"> ×</a></th>
	</tr>
	<tr>
	<td style="width:50%;vertical-align:baseline;" id="vowels">
	<input value="v_s" type="checkbox" aria-label="..."/> <span>Monophthongs (short)</span><br/>
	<input value="v_l" type="checkbox" aria-label="..."/> <span>Monophthongs (long)</span><br/>
	<input value="v_d" type="checkbox" aria-label="..."/> <span>Diphthongs</span><br/>
	<input value="v_n" type="checkbox" aria-label="..."/> <span>Neutralized</span><br/><br/>
	<input value="v_f" type="checkbox" aria-label="..."/> <span>Front (short/long)</span><br/>
	<input value="v_c" type="checkbox" aria-label="..."/> <span>Central (short/long)</span><br/>
	<input value="v_b" type="checkbox" aria-label="..."/> <span>Back (short/long)</span><br/>
	</td>
	<td style="width:50%;vertical-align:baseline;" id="consonants">
	<input value="c_n" type="checkbox" aria-label="..."/> <span>Nasal</span><br/>
	<input value="c_p" type="checkbox" aria-label="..."/> <span>Plosive</span><br/>
	<input value="c_a" type="checkbox" aria-label="..."/> <span>Affricate</span><br/>
	<input value="c_f" type="checkbox" aria-label="..."/> <span>Fricative</span><br/>
	<input value="c_x" type="checkbox" aria-label="..."/> <span>Approximant</span><br/><br/>
	<input value="cvo" type="checkbox" aria-label="..."/> <span>Voiced</span><br/>
	<input value="cuv" type="checkbox" aria-label="..."/> <span>Voiceless</span><br/>
	</td>
	</tr>
	</table>
	<label style="padding-top:7px;">Suprasegmentals:</label> &nbsp;
    <span class="su01"></span> &nbsp;
    <span class="su02"></span> &nbsp;
    <span class="su03"></span> &nbsp;
    <span class="su04"></span> &nbsp;
    <span class="su05"></span>
	 </div>
	 </div>
	 </div>`;
    lk_control += `<div class="panel">
                <div class="panel-heading" role="tab" id="headingVThree">
                    <div class="panel-title">
                        <a role="button" data-toggle="collapse" href="#collapseVThree" aria-expanded="true" aria-controls="collapseVThree">Dominant sounds</a>
                    </div>
                </div>
                <div id="collapseVThree" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingVThree">
                    <div class="panel-body" id="dominant_sounds">`;

    var domlabels = ["Vowels","Consonants","All phonemes"];
    $.each([totalv,totalc,totala], function(i,e) {
	lk_control += "<label>"+domlabels[i]+":</label><ul class='figures'>";
	var frqMap = {};
	for (var x=0, len=e.length; x<len; x++) {
		var hkey = e[x];
		frqMap[hkey] = (frqMap[hkey] || 0) + 1;
	    }
	    var frqArr = [];
	    for (hkey in frqMap) frqArr.push({key: hkey, freq: frqMap[hkey]});
	    frqArr.sort(function(a,b){return b.freq - a.freq});
	    var newArr = frqArr.length;
	    for (var j = 0; j < newArr; j++) {
		lk_control += "<li style='display:inline;'><a>\/<span class='"+frqArr[j].key+"'></span>\/</a>&nbsp;("+frqArr[j].freq+")</a>";
		if (j+1 < newArr) { lk_control += ", ";}
		lk_control += "</li>";
	    }
	    lk_control += `</ul>`;
    });

    lk_control  += `</div>
	        </div>
	</div>`;
    // phonologicalfigures
    var RFphon = [];
    if ( typeof( rf ) != 'undefined' ) {
	for (var key in rf) {
	    if (rf_id[rf[key].name].domain == 'phonological') {
		if (!RFphon[rf[key].name]) { RFphon[rf[key].name] = []; }
		RFphon[rf[key].name].push(rf[key]);
	    }
	}
    }
    if (Object.keys(RFphon).length > 0 || l.rhyme != "" && l.rhyme != null ) {
	lk_control  += `<div class="panel">
                <div class="panel-heading" role="tab" id="headingVFour">
                    <div class="panel-title">
                        <a role="button" data-toggle="collapse" href="#collapseVFour" aria-expanded="true" aria-controls="collapseVFour">Sound devices`+ (( $(ecep).length > 0 )?` (entire poem)`:``) + `</a>
                    </div>
                </div>
                <div id="collapseVFour" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingVFour">
                    <div class="panel-body" id="sound_devices">`;
	if (Object.keys(RFphon).length > 0) {
	    lk_control += lk_json( RFphon );
	}
	// end-rhyme vowels
	var stable = [];
	if ( l.rhyme != "irregular" && l.rhyme != "" && l.rhyme != null ) { // add rhyme vowels
	    lk_control += "<label>End-rhyme vowels:</label><ul class='figures'>";
	    for (var key in l) {
		if ( l[key] !== null && l[key].rhymes !== undefined ) {
		    stable.push( l[key].rhymes[0]["end"].rpho );
		}
	    }
	    var frqMap = {};
	    for (var x=0, len=stable.length; x<len; x++) {
		var hkey = stable[x];
		frqMap[hkey] = (frqMap[hkey] || 0) + 1;
	    }
	    var frqArr = [];
	    for (hkey in frqMap) frqArr.push({key: hkey, freq: frqMap[hkey]});
	    frqArr.sort(function(a,b){return b.freq - a.freq});
	    var newArr = frqArr.length;
	    for (var j = 0; j < newArr; j++) {
		var pattids = [];
		for (var key in l) {
		    if ( l[key] == null || l[key].rhymes == undefined || l[key].rhymes[0]["end"].rpho != frqArr[j].key) { continue; }
		    $.each( l[key].rhymes[0]["end"].rword, function( index, item ) {
			pattids.push ( item );
		    });
		}
		lk_control += "<li style='display:inline;'><a class='visualize_ids' data-ids='"+pattids.join()+"'>\/<span class='"+frqArr[j].key+"'></span>\/</a>&nbsp;("+frqArr[j].freq+")</a>";
		if (j+1 < newArr) { lk_control += ", ";}
		lk_control += "</li>";
	    }
	    lk_control += `</ul>`;
	}
	lk_control += `</div>
            </div>
        </div>`;
    }
    lk_control += `</div>`;
    $( '#lk_control').append( lk_control );
    $( 'select#selection' ).val( ecepsaved );
    $( 'select#display' ).val( displaysaved );

}

// LK collect, sort and prioritize phonological figures by phoneme occurrence for each figure 
function lk_json (json) {
    var RF = '';
    var keys = Object.keys(json);
    keys.sort();
    for (i = 0; i < keys.length; i++) { // output figures sorted by name
	var stable = [];
	var key = keys[i];
	RF += "<label>"+rf_id[key].name.capitalize()+" (<a class='external' target='_blank' href='"+rf_id[key].link+"'>"+rf_id[key].kind+"</a>):</label><ul class='figures'>";
	for (var j = 0; j < json[key].length; j++) { // populate frequency table
	    stable.push( json[key][j].phon );
	}
	var frqMap = {};
	for (var x=0, len=stable.length; x<len; x++) {
	    var hkey = stable[x];
	    frqMap[hkey] = (frqMap[hkey] || 0) + 1;
	}
	var frqArr = [];
	for (hkey in frqMap) frqArr.push({key: hkey, freq: frqMap[hkey]});
	frqArr.sort(function(a,b){return b.freq - a.freq});
	var newArr = frqArr.length;
	for (var j = 0; j < newArr; j++) {
	    var tokens = '', ids = [], words = [], pattids = [];
	    for (var k = 0; k < json[key].length; k++) {
		if ( json[key][k].phon != frqArr[j].key) { continue; }
		$.each( json[key][k].loc , function( index, item ) {
		    words = item.words.split(" ");
		    $.each( words, function( index, item ) {
			tokens += ((o[item])?o[item].tok+"/":"");
		    });
		    ids.push ( [].concat.apply([], words) ); // flatten and push ids
		});
		if (json[key][j].patt != '' && json[key][k].patt != null) {
		    pattids.push( RF_patt(json[key][k].patt,key) );
		}
	    }
	    RF += "<li style='display:inline;'><a class='visualize_ids' data-ids='"+pattids+"'>\/<span class='"+frqArr[j].key+"'></span>\/</a>&nbsp;("+frqArr[j].freq+")</a>";
	    if (j+1 < newArr) { RF += ", ";}
	    RF += "</li>";
	}
	RF += "</ul>";
    }
    return RF;

}

// LK interface controls
$(document.body).on('click', '#lk_control input', function () {
    switch ( $(this).val() ) {
        case "v_s":
	case "v_l":
	case "v_d":
	case "v_n":
	    if ( $("#style_"+$(this).val()).length ) {
		$( "#style_"+$(this).val() ).remove();
	    } else {
		$('head').append( window[ "$style_"+$(this).val() ] );
	    }
	    $( "#style_v_f,#style_v_c,#style_v_b" ).remove();
	    $( '#vowels input[value=v_f]' ).prop('checked', false);		
	    $( '#vowels input[value=v_c]' ).prop('checked', false);		
	    $( '#vowels input[value=v_b]' ).prop('checked', false);		
	    break;
	case "c_n":
	case "c_p":
	case "c_a":
	case "c_f":
	case "c_x":
	    if ( $("#style_"+$(this).val()).length ) {
		$( "#style_"+$(this).val() ).remove();
	    } else {
		$('head').append( window[ "$style_"+$(this).val() ] );
	    }
	    $( "#style_cvo,#style_cuv" ).remove();
	    $( '#consonants input[value=cuv]' ).prop('checked', false);		
	    $( '#consonants input[value=cvo]' ).prop('checked', false);		
	    break;	    
	case "v_f":
	case "v_c":
	case "v_b":
	    $( "#style_v_s,#style_v_l,#style_v_d,#style_v_n" ).remove();
	    if ( $("#style_"+$(this).val()).length ) {
		$( "#style_"+$(this).val() ).remove();
	    } else {
		$('head').append( window[ "$style_"+$(this).val() ] );
	    }
	    $( '#vowels input[value=v_s],#vowels input[value=v_l],#vowels input[value=v_d],#vowels input[value=v_n]' ).prop('checked', false);
	    break;
	case "cvo":
	case "cuv":
	    $( "#style_c_n,#style_c_p,#style_c_a,#style_c_f,#style_c_x" ).remove();
	    if ( $("#style_"+$(this).val()).length ) {
		$( "#style_"+$(this).val() ).remove();
	    } else {
		$('head').append( window[ "$style_"+$(this).val() ] );
	    }
	    $( '#consonants input[value=c_n],#consonants input[value=c_p],#consonants input[value=c_a],#consonants input[value=c_f],#consonants input[value=c_x]' ).prop('checked', false);
	    break;
        case "cl_noun":
        case "cl_pron":
        case "cl_verb":
        case "cl_adj":
        case "cl_adv":
        case "cl_other":
        case "scans":
	    if ( $("#style_"+$(this).val()).length ) {
		$( "#style_"+$(this).val() ).remove();
		$( "#scan_res *" ).remove();
	    } else {
		$('head').append( window[ "$style_"+$(this).val() ] );
		$( "#scan_res" ).append("<span class='conf-high'>high confidence</span><br/><span class='conf-med'>medium confidence</span><br/><span class='conf-low'>low confidence</span>")
	    }
	    break;
    }
    $("#vowels input,#consonants input,#classes input").each(function(i,e) { 
	if ( $(this).prop('checked') == true ) {
	    if ( window[ "$style_"+$(this).val() ] ) {
		var colour = window[ "$style_"+$(this).val() ].match(/(#.*)/);
		$( this ).next().css('background-color',colour[0]);
		$( ".t_"+$(this).val()).css('background-color',colour[0]);
	    }
	} else {
	    $( this ).next().css('background-color','');
	    $( ".t_"+$(this).val()).css('background-color','');
	}
    });

});

// LK clear controls
$(document.body).on('click', 'a#clear_vow', function () {
    $( "#style_vow,#style_v_s,#style_v_l,#style_v_d,#style_v_n,#style_v_f,#style_v_c,#style_v_b" ).remove();
    $( '#vowels input' ).prop('checked', false);
    $( "#vowels input" ).each(function(i,e) { 
	$( this ).next().css('background-color','');
    });
    $( '[class^="t_v"]' ).css('background-color','');
});
$(document.body).on('click', 'a#clear_con', function () {
    $( "#style_con,#style_c_n,#style_c_p,#style_c_a,#style_c_f,#style_c_x,#style_cvo,#style_cuv" ).remove();
    $( '#consonants input' ).prop('checked', false);
    $( "#consonants input" ).each(function(i,e) { 
	$( this ).next().css('background-color','');
    });
    $( '[class^="t_c"]' ).css('background-color','');
});
$(document.body).on('click', 'a#clear_cl', function () {
    $( "#style_cl_noun,#style_cl_pron,#style_cl_verb,#style_cl_adj,#style_cl_adv,#style_cl_other" ).remove();
    $( '#classes input' ).prop('checked', false);
    $( "#classes input" ).each(function(i,e) { 
	$( this ).next().css('background-color','');
    });
});

// LK viz view mouse for popover
function viz_mouse (e,p) {

    if ( p == "enter" ) {
	$( ".text [data-id='"+jq( $(e).attr("id") ).substr(1)+"']" ).css({"background-color":"#88bcdf","color":"#fff"});
    } else {
	$( ".text [data-id='"+jq( $(e).attr("id") ).substr(1)+"']" ).css({"background-color":"","color":""});
    }

}
// LK phonemic transcription hover highlight
$(document.body).on('mouseenter', '.text .w', function (e) {
        $( jq( $(this).attr("data-id") ) ).css({"background-color":"#88bcdf","color":"#fff"});
        $( "#visualization .text [data-id='"+jq( $(this).attr('data-id') ).substr(1)+"-wc']" ).addClass("idsSelected");
    }).on('mouseleave', '.text .w', function (e) {
	$( jq( $(this).attr("data-id") ) ).css({"background-color":"","color":""});
	$( "#visualization .text [data-id='"+jq( $(this).attr('data-id') ).substr(1)+"-wc']" ).removeClass("idsSelected");
});
// LK phonemes hover highlight
$(document.body).on('mouseenter', '#dominant_sounds span[class^="ph"]', function (e) {
	$( ".text span."+$(this).attr("class") ).css({"background-color":"#88bcdf","color":"#fff"});
    }).on('mouseleave', '#dominant_sounds span[class^="ph"]', function (e) {
	$( ".text span."+$(this).attr("class") ).css({"background-color":"","color":""});
});



// PoemVis load part
function poemvis_load (part) {

    // PoemVis in iframe
    $( '#visualization' ).html( '<iframe id="poemvis_frame"></iframe>' );
    // make sure iframe is loaded before manipulating and attaching listeners
    $( '#poemvis_frame' ).on('load', function() {
	var poemvisFrame = $("#poemvis_frame").contents();
	// adapt interface for multiple ecep
	if ( $(ecep).length > 0 ) {
	    poemvisFrame.find("#sel_label").replaceWith( "<label class='subtitle'>Selection:</label>" );
	    var poemvisReplace= `<select id="selection" class="subtitle select_mapping">`;
	    $.each(ecep, function(i,e) {
	        poemvisReplace += `<option value="`+i+`">`;
		var $text = $( '#contents' ).find( 'li' ).eq(i).text();
	      	if ( $text.length > 45 ) {
		    $text = $text.trim().substring(0, 45).split(" ").slice(0, -1).join(" ") + "...";
		}
		poemvisReplace += $text;
		poemvisReplace += `</option>`;
	    });
      	    poemvisReplace += `</select>`;
	    poemvisFrame.find("#sel_selection").replaceWith( poemvisReplace );
	}
	// preserve selection
	poemvisFrame.find( '#selection' ).val( part-1 );
	if (ecepidsaved) {
	    $( "#text" ).animate({
	      	scrollTop: $( "#"+ecepidsaved ).offset().top - 100
	    }, 500);
	}
	// viz home
        poemvisFrame.find(".viz_home").click(function(){
           location.hash = "#visualization";
	   viz_chosen = '';
           $( "div#text" ).scrollTop(0);
           $.getScript('/js/viz_overview.js');
	});
	poemvisFrame.find(".help-modal").click(function(){

$( "body" ).prepend(`
<div id="newHelp" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newModalLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Help</h4>
      </div>
      <div class="modal-body" id="modal-help-text"/>
`);
    var file = "viz_poemvis";
    $( "#modal-help-text" ).append( $("<div/>").load("/help/"+file+".shtml", function( data ) { data } ))
        .after(`
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`);
$( "#newHelp" ).modal('show');

	    });
	    // new selection
	    poemvisFrame.find("#selection").change(function(){
		var d = $(this);
		$( "#visualization" ).append( "<div id='spinner'><img src='/images/loader.gif'/></div>" );
		var checkExist = setInterval(function() {
		    if ($('#spinner').length) {
			clearInterval(checkExist);		    
		    }
		}, 100);
		_.defer( function() {
		    ecepsaved = parseInt( d.val(),10 )+1;
		    ecepidsaved = $("#text").find('.ecep').eq(ecepsaved-1).attr("id");
		    poemvis_load(ecepsaved);
		    $( "#spinner" ).remove();
		});
	    });
	    // highlight corresponding words in text
	    poemvisFrame.on("mouseenter", "[id*='word_']", function(e) {
		if ($(e.currentTarget).closest("svg[id*='word_']").attr('id') && $(e.currentTarget).closest("svg[id*='line_']").attr('id')) {
		    var wordno = $(e.currentTarget).closest("svg[id*='word_']").attr('id').split("_").pop();
		    var lineno = $(e.currentTarget).closest("svg[id*='line_']").attr('id').split("_").pop();
		    if ( $(e.currentTarget).closest("svg[id*='line_']").find("svg[id*='word_']").first().children("text").is(":empty") ) { // addresses empty word bug in PoemVis SVG plot
			$( jq( IDfromPLW(part,lineno,wordno-1) ) ).addClass("idsSelected");
		    } else {
			$( jq( IDfromPLW(part,lineno,wordno) ) ).addClass("idsSelected");
		    }
		}
	    }).on("mouseleave", "[id*='word_']", function(e) {
		if ($(e.currentTarget).closest("svg[id*='word_']").attr('id') && $(e.currentTarget).closest("svg[id*='line_']").attr('id')) {
		    var wordno = $(e.currentTarget).closest("svg[id*='word_']").attr('id').split("_").pop();
		    var lineno = $(e.currentTarget).closest("svg[id*='line_']").attr('id').split("_").pop();
		    if ( $(e.currentTarget).closest("svg[id*='line_']").find("svg[id*='word_']").first().children("text").is(":empty") ) {
			$( jq( IDfromPLW(part,lineno,wordno-1) ) ).removeClass("idsSelected");
		    } else {
			$( jq( IDfromPLW(part,lineno,wordno) ) ).removeClass("idsSelected");
		    }
		}
	    });
	});
    // load iframe
    $( '#poemvis_frame' ).attr("src", "/js/poemvis-page/viewpoem.html?filename="+docname+"-"+part+"-poemvis-ipa-processed-json.json");
    
}

// ID from line/word position combination
function IDfromPLW (part, line, word) {
    var returnID, i=0, j=0, offset=0;

    if (part > 1) {
	$clone = $( "#text" )
	    .find( "#"+$(ecep).eq(0).attr('id') )
	    .nextUntil( "#"+$(ecep).eq(part-1).attr('id') )
	    .clone();
	offset = $clone.find("div.line").length;
    }
    var oline=offset+parseInt(line, 10);
    for (var key in l) {
	if (l[key] !== null && l[key].content !== undefined ) {	    
	    if (i+1 == oline) {
		$.each (l[key].content , function ( index, item ) {
		    if ( o[item] && o[item].class == "w" ) {
			if (j+1 == word) {
			    returnID = item;
			    return false;
			}
			j++;
		    }
		});
	    }
	    i++;
	}
    }
    return returnID;
}



// DoubleTreeJS
function dtreejs_load (part) {

    // DoubleTreeJS in iframe
    $( '#visualization' ).html( '<iframe id="dtreejs_frame"></iframe>' );
    // load iframe
    var dt_token = "";
    $( '#dtreejs_frame' ).attr("src", "/js/DoubleTreeJS_0.8/samples/doubletree-ecpa.html?filename="+docname+"&token="+dt_token);
    $( '#dtreejs_frame' ).on('load', function() {
	var dtreejsFrame = $("#dtreejs_frame").contents();
	// viz home
        dtreejsFrame.find(".viz_home").click(function(){
           location.hash = "#visualization";
	   viz_chosen = '';
           $( "div#text" ).scrollTop(0);
           $.getScript('/js/viz_overview.js');
	});
        // help modal
	dtreejsFrame.find(".help-modal").click(function(){
$( "body" ).prepend(`
<div id="newHelp" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newModalLabel">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Help</h4>
      </div>
      <div class="modal-body" id="modal-help-text"/>
`);
    var file = "viz_dtreejs";
    $( "#modal-help-text" ).append( $("<div/>").load("/help/"+file+".shtml", function( data ) { data } ))
        .after(`
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`);
            $( "#newHelp" ).modal('show');

	});
    });

}
