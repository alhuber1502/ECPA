
// Analysis


// help modals - there is a copy of this in viz.functions.js for iFrame modals
$(document.body).on('click', '.help-modal', function () {
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
    var file;
    if ($(this).parent().prop("nodeName") == "A") { // views tabs
	switch ($(this).parent().attr("href")) {
	case "#reading":
	    file = "rdn_intro";
	    break;
	case "#analysis":
	    file = "ana_intro";
	    break;
	case "#visualization":
	    file = "viz_intro";
	    break;
	case "#modelling":
	    file = "mod_intro";
	    break;
	}
    } else if ( !$(this).parent().attr("id").match(/\_/) ) { // layer tabs
	file = "ana_"+$(this).parent().attr("id").substring(0,3);	
    } else {
	if ($(this).prev().attr("src").match(/phonemia/)) {
	    file = "viz_phonemia";
	} else if ($(this).prev().attr("src").match(/poemvis/)) {
	    file = "viz_poemvis";
	} // iFrame help is in viz.functions.js
    }
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


// wrap elements automatically by ID
// http://stackoverflow.com/questions/21791765/jquery-wrap-multiple-elements-independent-of-level
// Used for multi-word NEs, function modified by #AH
jQuery.fn.myWrap = function(key, type) {
    var e = this;
    
    // find most nested
    var max = null;
    var $mostNested = null;
    
    $(e).each(function(i, elem) {
	    var parents = $(elem).parents().length;
	    if (parents > max || max == null) {
		max = parents;
		$mostNested = $(elem);
	    }
	})
    
    // find common parent
    var found = false;
    $parent = $mostNested.parent();
    while($parent != null && !found) {
        if ($parent.find(e).length == e.length) {
            // Right Level
            found = true;
            var toWrap = [];
            var numDirect = 0;
            $.each($parent.children(), function(i, item) {
		    var direct = $(e).index(item) >= 0;
		    var sibling = $(item).find(e).length > 0;
		    if (direct) numDirect++;
		    if (direct || sibling) toWrap.push(item);
		})
		$(toWrap).wrapAll('<span id="'+key+'" class="'+type+'"/>');
        }
        $parent = $parent.parent();
    }
};


// return mixed case function
String.prototype.capitalize = function () {
    return this.replace(/\w\S*/, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

var RFphon = [], RFmorp = [], RFsynt = [], RFsema = [], RFprag = [];
// analysis view content for popover
function ana_cont (e) {
    var content, token, lastW;
    if ( $(jq($(e).attr("id"))).closest(".line").length ) {
	if ( lineID != $(jq($(e).attr("id"))).closest(".line").attr("id") ) {
	    lineID = $(jq($(e).attr("id"))).closest(".line").attr("id"); // update lineID
	    $(jq( lineID  )).trigger("mouseenter");
	}
    }
    token = o[$(e).attr("id")];
    if ( l[lineID] ) {
	var words = l[lineID].content;
	for (var i=words.length; i>0; i--) { 
	    if (o[words[i]] && o[words[i]].class == "w") { lastW = words[i]; break; }
	}
    }
    content = `<div class="ana_pop small">`;
    content += `<div class='small text-right'>[Click on any word or line to add a note or query]</div>`;

// phonology
    content += `<p><b>Phonological layer</b>`+` <a href="#phonological"><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></a></p>`;
    content += `<div>Token: <a class="visualize_ids" data-ids="`+IDfromST(token.sent,token.spos)+`">"`+token.tok+`"</a></div><div>Phonemic transcription: `+((token.class=="w")?`/`+token.pron+`/ (<a target="_blank" class="external" href="https://www.internationalphoneticassociation.org/content/ipa-chart">IPA</a>)`:`n/a`)+`</div>`;
    if ( l[lineID] && l[lineID].rhyme.pattern != "" && l[lineID].rhyme.pattern != null && (l[lineID].rhymes || l[lineID].rhyme.pattern.substring( parseInt(l[lineID].rhyme.pos), parseInt(l[lineID].rhyme.pos)+1 ) == "x" ) && ( l[lineID].rhymes && $.inArray($(e).attr("id"), l[lineID].rhymes[0]["end"].rword ) != -1 || lastW == $(e).attr("id") )) {
	var pattern = '', bound = '', label = '', rsnd = '', rword = '', spos = '', stress = '', rrel = '', ids = [];
	var pattern = l[lineID].rhyme.pattern.split('');
	var label = l[lineID].rhyme.pattern.substring( parseInt(l[lineID].rhyme.pos), parseInt(l[lineID].rhyme.pos)+1 );
	pattern[ parseInt(l[lineID].rhyme.pos) ] = label.bold();
	pattern = pattern.join('');
	if (l[lineID].rhymes) {
	    for (var i = 0; i < l[lineID].rhymes.length; i++) {
		if (l[lineID].rhymes[i]["end"]) {                        // end rhyme
		    if (l[lineID].rhymes[i]["end"].bound.id != "" && l[lineID].rhymes[i]["end"].bound.id != null) {
			bound = l[lineID].rhymes[i]["end"].bound.text+" rhyme";
		    }
		    if (l[lineID].rhymes[i]["end"].spos.id != "" && l[lineID].rhymes[i]["end"].spos.id != null) {
			spos = l[lineID].rhymes[i]["end"].spos.text;
		    }
		    if (l[lineID].rhymes[i]["end"].stress.id != "" && l[lineID].rhymes[i]["end"].stress.id != null) {
			stress = l[lineID].rhymes[i]["end"].stress.text;
		    }
		    if (l[lineID].rhymes[i]["end"].rword[0] != "" && l[lineID].rhymes[i]["end"].rword[0] != null) {
			for (var j = 0; j < l[lineID].rhymes[i]["end"].rword.length; j++) {
			    rword += o[ l[lineID].rhymes[i]["end"].rword[j] ].tok+" ";
			    ids.push ( l[lineID].rhymes[i]["end"].rword[j] );
			}
			rword = rword.substring(0,rword.length-1);
		    }
		}
	    }
	} // end rhymes
	if (l[lineID].rrel) {
	    rrel = "<li>Related rhymes (stanza coherence):";
	    for (var i = 0; i < l[lineID].rrel.length; i++) { // each related line 0, 1...
		var rrwrd = '';
		for (var j = 0; j < l[ l[lineID].rrel[i].id ].rhymes[0]["end"].rword.length; j++) {
		    rrwrd += o[ l[ l[lineID].rrel[i].id ].rhymes[0]["end"].rword[j] ].tok+" ";
    		    ids.push ( l[ l[lineID].rrel[i].id ].rhymes[0]["end"].rword[j] );
		}
		rrwrd = rrwrd.substring(0,rrwrd.length-1);
		rrel += "<ul><li>Line: "+$( "div[id='"+l[lineID].rrel[i].id+"']" ).children(".ln").first().text().trim()+"; </li>"+
		    "<li>rhyme word: "+rrwrd+"; </li>"+
		    "<li>nature of similarity: "+l[lineID].rrel[i].sim+" rhyme</li></ul>";
	    }
	    rrel += "</li>";
	}
	content += "<ul class='ana_rhymes' style='padding:0;'><li>Rhyme label: "+label+"</li><li>Rhyme pattern (position): "+pattern+"</li>"+((bound != '')?'<li>Rhyme (word boundaries): '+bound+'</li>':'')+
((spos != '')?'<li>Rhyme (stanza position): '+spos+'</li>':'')+
((stress != '')?'<li>Rhyme (stress pattern): '+stress+'</li>':'')+
((rword != '')?'<li>Rhyme word: <a class="visualize_ids" data-ids="'+ids+'">'+rword+'</a></li>':'')+rrel+
"</ul>";
    }
    var phocoll = [];
    if (Object.keys(RFphon).length > 0) {
	for (var key in RFphon) {
	    for (var i=0; i < RFphon[key].length; i++) {
		for (var j=0; j < RFphon[key][i].loc.length; j++) {
		    if (RFphon[key][i].loc[j].words.indexOf( $(e).attr("id") ) !== -1) {
			if (!phocoll[key]) { phocoll[key] = [] };
			phocoll[key].push( RFphon[key][i] );
		    }
		}
	    }
	}
    }
    if (Object.keys(phocoll).length > 0) {
	content += "<div>Rhetorical figures:</div>"+RF_json( phocoll );
    }
    content += `<br/>`;

// morphology
    content += `<p><b>Morphological layer</b>`+` <a href="#morphological"><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></a></p>`;
    if ( token && token.class == "w" ) {
        var posA=[], lemA=[], lemS="", posSd="", posSm="";
        var lemA = (token.lem).split('|');
        var posA = (token.pos).split('|');
        $.each(lemA, function(index, value) {
            lemS += value + " | ";
        });
        lemS = lemS.substring(0, lemS.length-3);
        $.each(posA, function(index, value) {
            posSd += nupos[value].description + " | ";
            posSm += nupos[value].majorwordclass + " | ";
        });
        posSd = posSd.substring(0, posSd.length-3);
        posSm = posSm.substring(0, posSm.length-3);
	var word = token.tok;
	content += "<table class='table morphanalysis'><thead><tr><th>Token</th><th>Syll</th><th>Lemma</th><th>Class</th><th>Part-of-speech</th><th>UC</th><th>Freq</th></tr></thead><tbody>";
	content += "<tr id='"+$(e).attr("id")+"-kwic'>"+
	    "<td><a class=\"visualize_ids\" data-ids=\""+IDfromST(token.sent,token.spos)+"\">"+token.tok+"</a></td>"+
	    "<td>"+token.syllab+"</td>"+
	    "<td>"+lemS+"</td>"+
	    "<td>"+posSm+"</td>"+
	    "<td>"+posSd+"</td>"+
	    "<td>"+((word[0] === word[0].toUpperCase())?'Y':'N')+"</td>"+
	    "<td>"+token.freq+"</td>"+
	    "</tr></tbody></table>";
    } else {
	content += `<div>Token: <a class="visualize_ids" data-ids="`+IDfromST(token.sent,token.spos)+`">"`+token.tok+`"</a></div><div>Morphological information: n/a</div>`;
	content += `<br/>`;
    }
    var morcoll = [];
    if (Object.keys(RFmorp).length > 0) {
	for (var key in RFmorp) {
	    for (var i=0; i < RFmorp[key].length; i++) {
		for (var j=0; j < RFmorp[key][i].loc.length; j++) {
		    if (RFmorp[key][i].loc[j].words.indexOf( $(e).attr("id") ) !== -1) {
			if (!morcoll[key]) { morcoll[key] = [] };
			morcoll[key].push( RFmorp[key][i] );
		    }
		}
	    }
	}
    }
    if (Object.keys(morcoll).length > 0) {
	content += "<div>Rhetorical figures:</div>"+RF_json( morcoll );
	content += `<br/>`;
    }

// syntax
    var synroot, synhead, synrpath = [];
    // turn CONLL parse into array
    var synwords = malt[ token.sent ].split("\n").map(function(e) {
        return e.split("\t");
    });
    // identify HEAD and ROOT
    synhead = ((synwords[ token.spos ][6])?(synwords[ synwords[ token.spos ][6]-1 ]):null);
    $.each(synwords, function(index,item) {
	if ( item[6] == "0" ) {
	    synroot = item;
	    return false;
	}
    });
    // path from ROOT to sentence token
    // (add display of all tokens that have the current token as their HEAD?)
    var current = token.spos;
    while ( synwords[ synwords[ current ][6]-1 ] ) { // while not at ROOT collect path elements
	synrpath.unshift( synwords[ synwords[ current ][6]-1 ] );
	current = synwords[ current ][6]-1;
    }
    content += `<p><b>Syntactic layer</b>`+` <a href="#syntactic"><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></a></p>`;
    content += `<div>Sentence no.: `+(parseInt( token.sent )+ 1)+`, token id.: `+synwords[ token.spos ][0]+` (tokens normalized)</div>`;
    content += `<div>Token: `+format_conll(synwords[ token.spos ],token.sent)+`</div>`;
    content += ((synhead!==undefined)?`<div>HEAD: `+format_conll(synhead,token.sent)+`</div>`:``);// check HEAD exists
    if (synhead!==undefined && synroot[0] != synhead[0]) { // check HEAD and ROOT are not identical
	content += `<div>Path from ROOT to token:<ul class="bibliography">`;
	$.each (synrpath, function(index,item) {
	    content += `<li>`+format_conll(item,token.sent)+`</li>`;
	});
	content += `<li>`+format_conll(synwords[ token.spos ],token.sent)+`</li>`;
	content += `</ul></div>`;
    } else { content += `<br/>`; }
    var syncoll = [];
    if (Object.keys(RFsynt).length > 0) {
	for (var key in RFsynt) {
	    for (var i=0; i < RFsynt[key].length; i++) {
		for (var j=0; j < RFsynt[key][i].loc.length; j++) {
		    if (RFsynt[key][i].loc[j].words.indexOf( $(e).attr("id") ) !== -1) {
			if (!syncoll[key]) { syncoll[key] = [] };
			syncoll[key].push( RFsynt[key][i] );
		    }
		}
	    }
	}
    }
    if (Object.keys(syncoll).length > 0) {
	content += "<div>Rhetorical figures:</div>"+RF_json( syncoll );
	content += `<br/>`;
    }

// semantics
    content += `<p><b>Semantic layer</b>`+` <a href="#semantic"><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></a></p>`;
    content += `<div>Sentence no.: `+(parseInt( token.sent )+ 1)+`, token id.: `+(token.spos+1)+` (tokens normalized)</div>`;
    content += `<ul style="margin-left:-40px" class="listBibl">`;
    var semout = false;
    $.each(sema[ token.sent ].frames, function(index,item) {
	if (item.target.name != "" && item.target.spans && item.target.spans[0].start <= token.spos && item.target.spans[0].end > token.spos) { // look in frames
	    content += `<li>`+format_frame(token,item)+`</li>`;
	    semout = true;
	    return true;
	}
	$.each(item.annotationSets[0].frameElements, function(index2,item2) { // look in frame elements
	    if (item2.name != "" && item2.spans && item2.spans[0].start <= token.spos && item2.spans[0].end > token.spos) {
		content += `<li>`+format_frame(token,item)+`</li>`;
		semout = true;
		return false;
	    }
	});
    });
    if (!semout) { content += `<li><a class="visualize_ids" data-ids="`+IDfromST(token.sent,token.spos)+`">"`+token.reg+`"</a> is not in any semantic frame</li>`; }
    content += `</ul>`;
    var semcoll = [];
    if (Object.keys(RFsema).length > 0) {
	for (var key in RFsema) {
	    for (var i=0; i < RFsema[key].length; i++) {
		for (var j=0; j < RFsema[key][i].loc.length; j++) {
		    if (RFsema[key][i].loc[j].words.indexOf( $(e).attr("id") ) !== -1) {
			if (!semcoll[key]) { semcoll[key] = [] };
			semcoll[key].push( RFsema[key][i] );
		    }
		}
	    }
	}
    }
    if (Object.keys(semcoll).length > 0) {
	content += "<div>Rhetorical figures:</div>"+RF_json( semcoll );
	content += `<br/>`;
    }

// pragmatics
    var ne_key = [], ne_hit = false;
    for (var key in ne) {
	if (ne[key].loc.words.indexOf( $(e).attr("id") ) !== -1) {
	    ne_key[ ne_id[ ne[key].id ].type ] = [];
	    ne_key[ ne_id[ ne[key].id ].type ].push( ne[key] );
	    ne_hit = true;
	    break;
	}
    }
    content += `<p><b>Pragmatic layer</b>`+` <a href="#pragmatic"><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></a></p>`;
    if (ne_hit) {
	content += "<div>Named entity: "+NE_json( ne_key )+"</div>"; 
    }
    var pracoll = [];
    if (Object.keys(RFprag).length > 0) {
	for (var key in RFprag) {
	    for (var i=0; i < RFprag[key].length; i++) {
		for (var j=0; j < RFprag[key][i].loc.length; j++) {
		    if (RFprag[key][i].loc[j].words.indexOf( $(e).attr("id") ) !== -1) {
			if (!pracoll[key]) { pracoll[key] = [] };
			pracoll[key].push( RFprag[key][i] );
		    }
		}
	    }
	}
    }
    if (Object.keys(pracoll).length > 0) {
	content += "<div>Rhetorical figures:</div>"+RF_json( pracoll );
	content += `<br/>`;
    }
    if (ne_hit == false && Object.keys(pracoll).length == 0) {
	content += `<div>Pragmatic information: n/a</div>`;
    }

    content += `</div>`;
    content += "<p style='text-align: right;' class='small'>"+query('[Found an error?]','Please specify...','anaprops',$(e).attr("id"), 'Make a correction', 'Please provide a correction to any of these properites', 'ta')+"</p>";
    content += `<div class="small text-right">TEI/XML ID: `+$(e).attr("id")+`</div>`;
    return content;
}

// format a SEMAFOR JSON frame
function format_frame(token, frame) {
    var content = "";
    content += `<a class="visualize_ids" data-ids="`+IDfromST(token.sent,token.spos)+`">"`+token.reg+`"</a> `+((frame.target.spans[0].start <= token.spos && frame.target.spans[0].end > token.spos)?"evokes":"participates in")+` the frame <a target="_blank" class="external" href="https://framenet2.icsi.berkeley.edu/fnReports/data/frame/`+frame.target.name+`.xml">`+frame.target.name+`</a>`;
    content += ((!(frame.target.spans[0].start <= token.spos && frame.target.spans[0].end > token.spos))?` (`+format_frame_span(token, frame.target.spans[0])+`)`:"");
    var element, elements = [], done = [];
    $.each(frame.annotationSets[0].frameElements, function(index,item) {
	element = "";
	if ((item.name == frame.target.name && item.spans && item.spans[0].start == frame.target.start &&
	     item.spans[0].end == frame.target.end) || item.name == "" || !(item.hasOwnProperty("spans"))
	   || $.inArray( item.name, done ) != -1) { return true; } // hides bug that seems to cause repetition of frame elements over time (same bug is in frameviz.js)
	else {
	    done.push(item.name);
	    element = item.name+` (`+format_frame_span(token,item.spans[0])+`)`;
	    elements.push(element);
	}
    });
    if (elements.length > 0) {
	content += ` with the frame element`+((elements.length > 1)?"s ":" ");
	$.each(elements, function(index,item) {
	    content += item;
	    if (elements.length > 1) {
		if (index < elements.length-2) { content += ", "; }
		else if (index == elements.length-2) { content += " and "; }
	    }
	});
    }
    return content;
}

function format_frame_span(token,spans) {
    var ids = [], content;
    for (var i = spans.start; i < spans.end; i++) {
	ids.push(IDfromST(token.sent,i));
    }
    content = `<a class="visualize_ids" data-ids="`+ids+`">"`;
    if ((spans.end - spans.start) > 6) {
	content += sema[ token.sent ].tokens[spans.start] + " " +
	    sema[ token.sent ].tokens[(spans.start+1)] + " " +
	    sema[ token.sent ].tokens[(spans.start+2)] + " ... " +
	    sema[ token.sent ].tokens[(spans.end-3)] + " " +
	    sema[ token.sent ].tokens[(spans.end-2)] + " " +
	    sema[ token.sent ].tokens[spans.end-1];
    } else if ((spans.end - spans.start) > 4) {
	content += sema[ token.sent ].tokens[spans.start] + " " +
	    sema[ token.sent ].tokens[(spans.start+1)] + " ... " +
	    sema[ token.sent ].tokens[(spans.end-2)] + " " +
	    sema[ token.sent ].tokens[spans.end-1];
    } else if ((spans.end - spans.start) > 2) {
	content += sema[ token.sent ].tokens[spans.start] + " ... " +
	    sema[ token.sent ].tokens[spans.end-1];
    } else if ((spans.end - spans.start) == 2) {
	content += sema[ token.sent ].tokens[spans.start] + " " +
	    sema[ token.sent ].tokens[spans.end-1];
    } else {
	content += sema[ token.sent ].tokens[spans.start];
    }
    return content+`"</a>`;
}


// format a CONLL line as an array
function format_conll(tok, sent) {
    return "<a class='visualize_ids' data-ids='"+IDfromST(sent,tok[0]-1)+"'>\""+tok[1]+"\"</a> ("+penn[tok[4]].description.toLowerCase()+") as "+(tok[7]!='null'?tdep[tok[7]].name:"ROOT");
}


// ID from sentence/token position combination
function IDfromST (sent, spos) {
    var returnID;
    $.each(o, function(index) {
	if ( parseInt(o[index].sent) == parseInt(sent) && parseInt(o[index].spos) == parseInt(spos) ) {
	    returnID = index;
	    return false;
	}
    });
    return returnID;
}


// analysis view mouse for popover
function ana_mouse(e,p) {
    var offset = 0;
    var synwords = [];
    if ( o[$(e).attr("id")].sent ) {
	synwords = malt[ o[$(e).attr("id")].sent ].split("\n").map(function(e) {
		return e.split("\t");
	    });
    }
    // for lines with more than one sentence, calculate the position of the token
    if ( l[lineID] ) {
	if ( l[lineID].sentences.indexOf( parseInt(o[$(e).attr("id")].sent,10) ) > 0 ) {
	    for (var i = 0; i <= l[lineID].sentences.indexOf( parseInt(o[$(e).attr("id")].sent,10) )-1; i++) {
		offset += malt[ l[lineID].sentences[i] ].split("\n").length;
	    }
	}
    }

    if (p == "enter" ) {
	// highlight token in morphological parse
	$('table.morphological tbody tr[id="'+$(e).attr("id")+'-kwic"]').css({"background-color":"#88bcdf","color":"#fff"});
	// highlight token in syntactic dependency parse
	if (synwords[ o[$(e).attr('id')].spos]) {
	    $('div.conllu-parse g.text text tspan[data-chunk-id="' +(parseInt(synwords[ o[$(e).attr('id')].spos ][0])+offset-1)+ '"]').css({"text-decoration":"underline overline"});
	// highlight token in frame semantic parse
	$('#parse_horiz table:nth-child('+((offset==0)?"1":(l[lineID].sentences.indexOf( parseInt(o[$(e).attr("id")].sent,10) )+1))+') th.word.w' +(parseInt(synwords[ o[$(e).attr("id")].spos ][0])-1) ).css({"text-decoration":"underline overline"});
	}
    } else {
	// undo highlighting
	$('table.morphological tbody tr[id="'+$(e).attr("id")+'-kwic"]').css({"background-color":"","color":""});
	if (synwords[ o[$(e).attr('id')].spos]) {
	    $('div.conllu-parse g.text text tspan[data-chunk-id="' +(parseInt(synwords[ o[$(e).attr('id')].spos ][0])+offset-1)+ '"]').css({"text-decoration":"initial"});
	$('#parse_horiz table:nth-child('+((offset==0)?"1":(l[lineID].sentences.indexOf( parseInt(o[$(e).attr("id")].sent,10) )+1))+') th.word.w' +(parseInt(synwords[ o[$(e).attr('id')].spos ][0])-1) ).css({"text-decoration":"initial"});
	}	
    }
}


// frame-semantic parse token in text highlighting
function fra_high(e,p) {
    var tpos = $(e).index();
    var sentence = $(e).parent().parent().parent().attr("data-sentnum");

    if (p == "enter") {
	$(jq( IDfromST(sentence, (tpos-1)) )).addClass("idsSelected");
    } else {
	$(jq( IDfromST(sentence, (tpos-1)) )).removeClass("idsSelected");
    }
}
// frame-semantic parse hover highlight
$(document.body).on('mouseenter', 'div.frameviz table.sentence th.word', function () {
	fra_high(this,"enter")
}).on('mouseleave', 'div.frameviz table.sentence th.word', function () {
	fra_high(this,"leave")
});

// dependency parse token in text highlighting
function dep_high(e,p) {
    var spos = $(e).parent().index();
    var tpos = $(e).index();
    var sentence = $(e).parent().parent().parent().find("g.sentnum a:eq("+spos+") text").text();

    if (p == "enter") {
	$(jq( IDfromST((sentence-1), tpos) )).addClass("idsSelected");
    } else {
	$(jq( IDfromST((sentence-1), tpos) )).removeClass("idsSelected");
    }
}
// dependency parse hover highlight
$(document.body).on('mouseenter', 'div.conllu-parse g.text text tspan', function () {
	dep_high(this,"enter");
}).on('mouseleave', 'div.conllu-parse g.text text tspan', function () {
	dep_high(this,"leave");
});

// morphological parse hover highlight
$(document.body).on('mouseenter mouseleave', 'table.morphological tbody tr[id]', function () {
	$(jq( $(this).attr("id") )).toggleClass("idsSelected");
	$(jq( $(this).attr("id").substring(0,$(this).attr("id").length - 5) )).toggleClass("idsSelected");
});
$(document.body).on('mouseenter', '.freq a', function () {
    var d = this;
    $.each(o, function(index) {
	if (o[index].spe && o[index].spe.toLowerCase() == $(d).text()) {
	    $( jq( index ) ).css({"background-color":"#88bcdf","color":"#fff"});
	}
    });
}).on('mouseleave', '.freq a', function () {
    var d = this;
    $.each(o, function(index) {
	if (o[index].spe && o[index].spe.toLowerCase() == $(d).text()) {
	    $( jq( index ) ).css({"background-color":"","color":""});
	}
    });
});


// morphological analysis
function morph_ana (lineID) {
    var morph = "<table class='table morphological'><thead><tr><th>Token</th><th>Syll</th><th>Lemma</th><th>Class</th><th>Part-of-speech</th><th>UC</th><th>Freq</th><th>Context</th><th></th></tr></thead><tbody>";

    $.each (l[lineID].content , function ( index, item ) {
	if ( o[ item ] && o[ item ].class == "w" ) {
            var posA=[], lemA=[], lemS="", posSd="", posSm="";
            var lemA = (o[ item ].lem).split('|');
            var posA = (o[ item ].pos).split('|');
            $.each(lemA, function(index, value) {
                lemS += value + " | ";
            });
            lemS = lemS.substring(0, lemS.length-3);
            $.each(posA, function(index, value) {
                posSd += nupos[value].description + " | ";
                posSm += nupos[value].majorwordclass + " | ";
            });
            posSd = posSd.substring(0, posSd.length-3);
            posSm = posSm.substring(0, posSm.length-3);
	    var word = o[ item ].tok;
	    morph += "<tr id='"+item+"-kwic'>"+
		"<td>"+o[ item ].tok+"</td>"+
		"<td>"+o[ item ].syllab+"</td>"+
		"<td>"+lemS+"</td>"+
		"<td>"+posSm+"</td>"+
		"<td>"+posSd+"</td>"+
		"<td>"+((word[0] === word[0].toUpperCase())?'Y':'N')+"</td>"+
		"<td>"+o[ item ].freq+"</td>"+
		"<td><button type='button' class='btn btn-xs btn-primary kwic' data-toggle='off' aria-pressed='false' autocomplete='off' data-kwic='"+item+"'>KWIC <span>on</span></button></span></td>"+
		"<td>"+query("","","correction",item, 'Make a correction', 'Please provide a correction to these word properties', 'ta')+"</td>"
		"</tr>";
	}
    });

    morph += "</tbody></table>";
    return morph;
}


// simple KWIC index
function KWIC (kwic_id) {
    var kwic = "<ol class='kwic'>";
    var ids = [];

    for (var key in l) {
	if (l[key] !== null && l[key].content !== undefined ) {
	    var left = [], right = $.extend(true, [], l[key].content); // clone content
	    $.each (l[key].content , function ( index, item ) {
	        var curr_id = right.shift();
		if ( o[ curr_id ] && o[ curr_id ].class == "w" && 
		     o[ curr_id ].tok.toLowerCase() == o[ kwic_id ].tok.toLowerCase() ) {
		    ids.push( curr_id );
		    var lefts = '', rights = '';		
		    $.each( left , function( index, item ) {
			if ( o[ item ] && o[ item ].tok ) {
			    lefts += o[ item ].tok;
			} else if ( item == "c" ) {
			    lefts += " ";
			}
		    });
		    lefts = lefts.split(" ").slice(-7).join(" ");
		    $.each( right , function( index, item )  {
			if ( o[ item ] && o[ item ].tok ) {
			    rights += o[ item ].tok;
			} else if ( item == "c" ) {
			    rights += " ";
			}
		    });
		    rights = rights.split(" ").slice(0,7).join(" ");
		    kwic += "<li>"+
			"<span class='left'>"+((lefts != '')?lefts:"&nbsp;")+"</span>"+
			"<span class='keyword'><a class='visualize_ids' data-ids='"+ids+"' href='#"+(($('[id="'+curr_id+'"]').closest(".line").length)?$('[id="'+curr_id+'"]').closest(".line").attr("id"):$('[id="'+curr_id+'"]').attr('id'))+"' title='"+
			//			currentline( $( jq( curr_id ) ).closest(".line").attr("id") )+
			"[click to jump to token]"+
			"'>"+
			o[ curr_id ].tok+"</a></span>"+
			"<span class='right'>"+((rights != '')?rights:"&nbsp;")+"</span>"+
			"</li>";
		}
		left.push( curr_id );
	    });
	}
    }
    kwic += "</ol>";
    return kwic;
}


function RF_patt (pattern, figure) {
    var ids = [];
    for (var key in rf) {
	if (rf[key].name == figure && rf[key].patt.toLowerCase() == pattern.toLowerCase() ) {
	    for (var i = 0; i < rf[key].loc.length; i++) {
		ids.push( rf[key].loc[i].words.split(" ") );
	    }
	}
    }
    return ids;
}


// output rhetorical figures by domain
function RF_json (json) {
    var RF = '';
    var keys = Object.keys(json);
    keys.sort();
    for (i = 0; i < keys.length; i++) { // output figures sorted by name
	var key = keys[i];
        RF += "<h3 class='rhetname'>"+rf_id[key].name.capitalize()+" (<a class='external' target='_blank' href='"+rf_id[key].link+"'>"+rf_id[key].kind+"</a>)</h3><ul class='figures'>";
	for (var j = 0; j < json[key].length; j++) { // output individual figure
	    var tokens = '', ids = [], words = [], pattids = [];
	    $.each( json[key][j].loc , function( index, item ) {
		words = item.words.split(" ");
		$.each( words, function( index, item ) {
		    tokens += ((o[item])?o[item].tok+"/":"");
		});
		ids.push ( [].concat.apply([], words) ); // flatten and push ids
	    });
	    if (json[key][j].patt != '' && json[key][j].patt != null) {
		pattids = RF_patt(json[key][j].patt,key);
	    }
	    RF += "<li>pattern: "+((json[key][j].patt != '' && json[key][j].patt != null)?"<a class='visualize_ids' data-ids='"+pattids+"'>"+json[key][j].patt+"</a>":tokens.substring(0,tokens.length-1))+"; words: <a class='visualize_ids' data-ids='"+ids+"'>"+tokens.substring(0,tokens.length-1)+"</a>; affinity: ";
	    tokens = '';
	    $.each( json[key][j].aff , function( index, item ) {
		tokens += item+", ";
	    });
	    RF += tokens.substring(0,tokens.length-2)+"; function: "+query("[?]","","function",json[key][j].id, 'Add a poetic function', 'Please provide one or more poetic functions for this figure', 'ta')+"</li>";
	}
	RF += "</ul>";
    }
    return RF;
}


// output named entities (pragmatic layer)
function NE_json (json) {
    var NE = '';
    var keys = Object.keys(json);
    //    keys.sort();
    for (i = 0; i < keys.length; i++) { // output figures sorted by name
	var key = keys[i], type = '', link = '';
	switch (key) {
	    case "TIM": 
	        type = "Time";
	        link = "http://nerd.eurecom.fr/ontology#Time";
	        break;
	    case "LOC": 
	        type = "Location";
	        link = "http://nerd.eurecom.fr/ontology#Location";
	        break;
	    case "ORG": 
	        type = "Group/Organization";
	        link = "http://nerd.eurecom.fr/ontology#Organization";
	        break;
	    case "PER": 
	        type = "Person";
	        link = "http://nerd.eurecom.fr/ontology#Person";
	        break;
	    case "MON": 
	        type = "Money";
	        link = "http://nerd.eurecom.fr/ontology#Amount";
	        break;
	    case "PRC": 
	        type = "Percentage";
	        link = "http://nerd.eurecom.fr/ontology#Thing";
	        break;
	    case "DAT": 
	        type = "Date";
	        link = "http://nerd.eurecom.fr/ontology#Thing";
	        break;
	    case "MSC": 
	        type = "Miscellaneous";
	        link = "http://nerd.eurecom.fr/ontology#Thing";
	        break;
	}
        NE += "<h3 class='nename'>"+type+" ("+((link != '')?'<a target="_blank" class="external" href="'+link+'">':'')+"named entity class"+((link != '')?'</a>':'')+")</h3><ul class='namedent'>";
	for (var j = 0; j < json[key].length; j++) { // output individual figure
	    var tokens = '', ids = [], words = [];
	    words = json[key][j].loc.words.split(" ");
	    $.each( words, function( index, item ) {
		tokens += ((o[item])?o[item].tok:"")+" ";
	    });
	    ids.push ( [].concat.apply([], words) ); // flatten and push ids
	    var references = '';
	    if (ne_id[json[key][j].id].refs) {
		var total = ne_id[json[key][j].id].refs.length;
		references = '; reference(s): ';
		$.each( ne_id[json[key][j].id].refs, function( index, item ) {
		    var refs = item.split('|');
		    var link = '', text = '';
		    switch (refs[1]) {
		    case "PleiadesDB":
			text = "<em>Pleiades</em>";
			link = "http://pleiades.stoa.org/places/"+refs[0];
			break;
		    case "GGBrice":
			text = "<em>Grand Gazetteer</em>";
			link = "https://books.google.co.uk/books?id=JHZaAAAAYAAJ&pg=PA"+refs[0];
			break;
		    }
		    references += '<a href="'+link+'" class="external" target="_blank">'+text+'</a>';
		    if (index != total - 1) {
			references += ", ";
		    }
		});
	    }
	    NE += "<li>pattern: "+ne_id[json[key][j].id].pattern+" (source: "+(json[key][j].mech=='comp-gaz'?'gazetteer':'classifier')+"); words: <a class='visualize_ids' data-ids='"+ids+"'>"+tokens.substring(0,tokens.length-1)+"</a>"+references+((ne_id[json[key][j].id].desc != '' && ne_id[json[key][j].id].desc != null)?"; definition: "+ne_id[json[key][j].id].desc:"")+" "+query("[edit]","","note",json[key][j].occur, 'Add a note/comment to this named entity', 'Please add a note or comment about this gazetteer entry or the particular occurrence of it in the text', 'ta')+"</li>";
	}
	NE += "</ul>";
    }
    return NE;
}


// generate the human-readble currentline string
function currentline (lineID) {
    var currentline = '', main = '', sub = '';

    if ($(jq( lineID  )).parents().prevAll(".ecep").length) { // if multi-part
	if ($(jq( lineID  )).parents().prevAll(".head-part.main").first().length && phonemic == false) {
	    main = $(jq( lineID  )).parents().prevAll(".head-part.main").first().text();
	    currentline += '"'+main+'", ';
	}
	if ($(jq( lineID  )).parents().prevAll(".head-part").first().length && phonemic == false) {
	    sub = $(jq( lineID  )).parents().prevAll(".head-part").first().text();
	    if (main != sub) {
		currentline += '"'+sub+'", ';
	    }
	} 
	if (currentline == '' && $(jq( lineID  )).parents().prevAll(".ecep").first().length) {
	    currentline += $(jq( lineID  )).parents().prevAll(".ecep").first().attr("data-type").capitalize()+", ";
	}
    }
    if ( $(jq( lineID )).closest("p").length ) {
	currentline += "Paragraph "+$(jq( lineID  )).children(".ln").text().trim();
    } else {
	currentline += "Line "+$(jq( lineID  )).children(".ln").text().trim();
    }
    return currentline;
}


var hoverEnabled = true, newParse = true;
var sentenceDisplayed = [];
var lineID;
var phonemic = false;


// display the Annodoc syntactic dependency parse
function draw (lineID) {
    var parse = "";
    sentnum = "";
    if ( l[lineID] && l[lineID].sentences ) {
	$( "#syn-sporadic" ).html("<h2>Syntactic dependency parse</h2>");
	parse = "<div class='conllu-parse' tabs='yes'>";
	for (var i = 0; i < l[lineID].sentences.length; i++) {
	    var wordnum = 0;
	    $.each( s[ l[lineID].sentences[i] ].ids, function( index,item ) {
		    if ( o[item] && o[item].class == "w" ) { wordnum++; }
		});
	    sentnum += (parseInt(l[lineID].sentences[i])+1)+" ("+wordnum+" words), ";
	    parse += "# sentence-label "+ (parseInt(l[lineID].sentences[i])+1)+"\n"+
		// this is configured in Config.bratCollData
		//		"# visual-style nodes #99bafa\n"+
		//		"# visual-style arcs #333333\n"+
		malt[ l[lineID].sentences[i] ]+"\n\n";
	}
	parse += "</div>";
	sentnum = sentnum.substring(0, sentnum.length - 2);
	parse = "<div>Sentence no. "+sentnum+":</div>" + parse;
	$( "#syn-sporadic" ).append(parse);
	Annodoc.activate(Config.bratCollData, "{}");
    }
}


$(document.body).on('click', '#meta-tabs a.freeze', function (e) {
    if (hoverEnabled == true && e.target.nodeName != "SUP") { // ensure click is on line, not links
	hoverEnabled = false;
	$(this).addClass( "active" );
	if ($(this).hasClass("line")) {
	    $(this).addClass("lineSelected");
	} else {
	    e.stopPropagation();
	    if ( $(this).closest(".line").length ) {
		$(this).closest(".line").addClass("lineSelected");
	    } else {
		$(this).closest("p").addClass("lineSelected");
	    }
	}
    } else if (hoverEnabled == false && e.target.nodeName != "SUP") {
        $(".lineSelected:first").removeClass("lineSelected");
	$(this).removeClass( "active" );
	hoverEnabled = true;
	if ($(this).hasClass("line")) {
	    $(this).trigger("mouseenter");
	} else {
	    e.stopPropagation();
	}
    }
});

$('#collapsePho').on('show.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.phonological" ).addClass( "active" );
    }
});
$('#collapsePho').on('hide.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.phonological" ).removeClass( "active" );
    }
});
$('#collapseMor').on('show.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.morphological" ).addClass( "active" );
    }
});
$('#collapseMor').on('hide.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.morphological" ).removeClass( "active" );
    }
});
$('#collapseSyn').on('show.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.syntactic" ).addClass( "active" );
    }
});
$('#collapseSyn').on('hide.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.syntactic" ).removeClass( "active" );
    }
});
$('#collapseSem').on('show.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.semantic" ).addClass( "active" );
    }
});
$('#collapseSem').on('hide.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.semantic" ).removeClass( "active" );
    }
});
$('#collapsePra').on('show.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.pragmatic" ).addClass( "active" );
    }
});
$('#collapsePra').on('hide.bs.collapse', function (e) {
    if (e.target.nodeName == "DIV") {
	$( "#meta-tabs a.pragmatic" ).removeClass( "active" );
    }
});

// produce "analysis"-view displays
$('.line,#text p').hover(
    function() { // mouseenter
    if ($('.right .tab-content > div.active').attr("id") == "analysis" && hoverEnabled == true) {
	RFphon = [], RFmorp = [], RFsynt = [], RFsema = [], RFprag = [];

	// context line
	lineID = $(this).attr("id");

	if (lineID && l[lineID] && l[lineID].content) {
	var wordnum = 0;
	$.each( l[lineID].content, function( index,item ) {
	    if ( o[item] && o[item].class == "w" ) { wordnum++; }
	});
	$('#currentline').html(currentline(lineID)+" ("+wordnum+" words)");

	$( ".hoverLine:first" ).removeClass("hoverLine").children("#meta-tabs").remove();
// data-toggle='collapse' removed below to allow for jumping to target
	$(this).append("<div id='meta-tabs'><div class='btn-panel'><div>Jump to or pin/unpin analytical layers:</div>"+
	"<div class='panel-btn'><a class='btn btn-default btn-xs freeze' role='button'>Pin/Unpin</a></div><br clear='both'/>"+
	"<div class='panel-btn'><a class='btn btn-default btn-xs phonological in' role='button' data-toggle='' href='#collapsePho' aria-controls='collapsePho' aria-expanded='true'>Phonological</a></div>"+
	"<div class='panel-btn'><a class='btn btn-default btn-xs morphological in' role='button' data-toggle='' href='#collapseMor' aria-controls='collapseMor' aria-expanded='true'>Morphological</a></div>"+
	"<div class='panel-btn'><a class='btn btn-default btn-xs syntactic in' role='button' data-toggle='' href='#collapseSyn' aria-controls='collapseSyn' aria-expanded='true'>Syntactic</a></div>"+
	"<div class='panel-btn'><a class='btn btn-default btn-xs semantic in' role='button' data-toggle='' href='#collapseSem' aria-controls='collapseSem' aria-expanded='true'>Semantic</a></div>"+
	"<div class='panel-btn'><a class='btn btn-default btn-xs pragmatic in' role='button' data-toggle='' href='#collapsePra' aria-controls='collapsePra' aria-expanded='true'>Pragmatic</a></div>"+
	"</div></div>").addClass("hoverLine");
	if ( $( "div#pho-dynamic" ).hasClass( "first-time" )) {
//	    $( "a[aria-controls='collapseMor'],a[aria-controls='collapseSyn'],a[aria-controls='collapseSem'],a[aria-controls='collapsePra']" ).addClass( "collapsed" );
//	    $( "#collapseMor,#collapseSyn,#collapseSem,#collapsePra" ).collapse("toggle");
            $( "div#pho-dynamic" ).removeClass( "first-time" );
	}       
	if ( $("a[aria-controls='collapsePho']").hasClass("collapsed") ) {
	    $("a[aria-controls='collapsePho']").removeClass( "active" );
	} else {
	    $("a[aria-controls='collapsePho']").addClass( "active" );
	}
	if ( $("a[aria-controls='collapseMor']").hasClass("collapsed") ) {
	    $("a[aria-controls='collapseMor']").removeClass( "active" );
	} else {
	    $("a[aria-controls='collapseMor']").addClass( "active" );
	}
	if ( $("a[aria-controls='collapseSyn']").hasClass("collapsed") ) {
	    $("a[aria-controls='collapseSyn']").removeClass( "active" );
	} else {
	    $("a[aria-controls='collapseSyn']").addClass( "active" );
	}
	if ( $("a[aria-controls='collapseSem']").hasClass("collapsed") ) {
	    $("a[aria-controls='collapseSem']").removeClass( "active" );
	} else {
	    $("a[aria-controls='collapseSem']").addClass( "active" );
	}
	if ( $("a[aria-controls='collapsePra']").hasClass("collapsed") ) {
	    $("a[aria-controls='collapsePra']").removeClass( "active" );
	} else {
	    $("a[aria-controls='collapsePra']").addClass( "active" );
	}
	// update general layer IC
	$( ".todelete" ).remove(); 
	$.each( ["phonological","morphological","syntactic","semantic","pragmatic"] , function( index, item ) {
	    $( "#"+item )
	        .append( "<span class='pull-right todelete' style='padding-right:5px;'>"+query("","",item+" layer",lineID,"Add a comment","Please add your comments on the "+item+" layer of "+currentline(lineID),"ta"));
	});

        // split RFs into domains and sort by name
	if ( typeof( rf ) != 'undefined' ) {
	    for (var key in rf) {
		for (var i = 0; i < rf[key].loc.length; i++) {
		    if (rf[key].loc[i].line == lineID) {
			switch (rf_id[rf[key].name].domain) {
			case 'phonological':
			    if (!RFphon[rf[key].name]) { RFphon[rf[key].name] = []; }
			    RFphon[rf[key].name].push(rf[key]);
			    break;
			case 'morphological':
			    if (!RFmorp[rf[key].name]) { RFmorp[rf[key].name] = []; }
			    RFmorp[rf[key].name].push(rf[key]);
			    break;
			case 'syntactic':
			    if (!RFsynt[rf[key].name]) { RFsynt[rf[key].name] = []; }
			    RFsynt[rf[key].name].push(rf[key]);
			    break;
			case 'semantic':
			    if (!RFsema[rf[key].name]) { RFsema[rf[key].name] = []; }
			    RFsema[rf[key].name].push(rf[key]);
			    break;
			case 'pragmatic':
			    if (!RFprag[rf[key].name]) { RFprag[rf[key].name] = []; }
			    RFprag[rf[key].name].push(rf[key]);
			    break;
			default:
			    console.log("Uncaught RF domain: "+rf_id[rf[key].name].domain);
			}
		    }
		}
	    }
	}

	// update all content
	timer = setTimeout(function display_line() {
	    $( "#pho-dynamic,#mor-dynamic,#syn-dynamic,#sem-dynamic,#pra-dynamic" ).html( "" );
	    //	    location.href = "#currentline";
	    ana_phonological(lineID);
	    ana_morphological(lineID);
	    ana_syntactic(lineID);
	    ana_semantic(lineID);
	    ana_pragmatic(lineID);
	}, 100);
	}
    }
    },  function() { // mouseleave
    if ($('.right .tab-content > div.active').attr("id") == "analysis" && hoverEnabled == true) {
	clearTimeout(timer);
    }
});


// initialize analytical layers
function ana_initialize () {
    $( "#analysis" ).prepend( "<h1 class='info clearfix'><span id='currentline'/><button class='btn btn-default btn-xs pull-right active' id='toggle_all_ana'><i class=\"glyphicon glyphicon-minus-sign\"></i> Collapse All</button></h1>" );
    $("#phonological-body").html("<div id='pho-dynamic' class='first-time'/><div id='pho-sporadic'/><div id='pho-static'/>");
    $("#morphological-body").html("<div id='mor-dynamic'/><div id='mor-sporadic'/><div id='mor-static'/>");
    $("#syntactic-body").html("<div id='syn-dynamic'/><div id='syn-sporadic'/><div id='syn-static'/>");
    $("#semantic-body").html("<div id='sem-dynamic'/><div id='sem-sporadic'/><div id='sem-static'/>");
    $("#pragmatic-body").html("<div id='pra-dynamic'/><div id='pra-sporadic'/><div id='pra-static'/>");

    // make analysis accordions sortable    
    $( "#analysis .panel-group" ).sortable({
        connectWith: "#analysis .panel-group",
        handle: ".panel-heading",
        placeholder: "panel-placeholder ui-corner-all"
    });

    $( "#analysis .panel" )
        .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
        .find( ".panel-heading" )
        .addClass( "ui-widget-header ui-corner-all" )
        .find( ".panel-title" )
        .addClass( "inline" )
        .append( "<span class='pull-right glyphicon glyphicon-resize-vertical' style='vertical-align:text-top'/>")
        .parent()
        .after( "<a class='help-modal' href='#'><span class='pull-right glyphicon glyphicon-question-sign' style='padding-right:2px; vertical-align:text-top'/></a>");

    // add textareas for notes/observations
    $.each( ["pho-static","mor-static","syn-static","sem-static","pra-static"], function( index,item ) {
	    $( "#"+item ).append( '<div data-id="'+item.substr(0,3)+'"><i>Notes/Observations:</i><br/><textarea style="resize:vertical;width:100%;" class="textaInput" rows="4" id="ta-'+item+'"/></div>' );
    });

    // trigger first line hover
    if ( $("#analysis")[0] ) {
	for (var key in l) {
	    if (l[key] !== null && l[key].content !== undefined ) {
		$(jq( key  )).trigger("mouseenter");
		break;
	    }
	}
    }
}

// save notes/observations textarea after timeout
var timeout = null;
$(document.body).on('input propertychange paste', '.textaInput', function(e){
    clearTimeout(timeout);
    var d = $(this);
    timeout = setTimeout(function() {
        $.ajax({
	    type: 'POST',
	    url: '/cgi-bin/handleCS.cgi',
	    data: { 'content': $(d).parent().attr("data-id")+"/"+lineID+": "+$(d).val(), 'file': docname, 'source': source },
	    dataType: 'text',
	    success: function() {},
	    error: function() {}
    	});
    }, 2500);
});

$('#collapseSyn').on('show.bs.collapse', function () { // Annodoc needs a re-draw when change happens while collapsed
	draw(lineID);
    });

// show analytical layer on focus in case it is collapsed
$(document.body).on('mousedown', '.phonological,.morphological,.syntactic,.semantic,.pragmatic', function (e) {
	$("#"+$(this).attr("aria-controls")).collapse('show');
    });

var wtokensno = 0, wtokens = [];
// phonological layer
function ana_phonological (lineID) {

// metre/real
    if (l[lineID].met != "" && l[lineID].met != null) {
	$( "#pho-dynamic" ).append("<h2>Metre</h2>");
	var real = '', type = '', number = '', rtype = '', rnumber = '', stanzas = '';
	if (l[lineID].real != "" && l[lineID].real != null) {
	    real = output_met(l[lineID].real);
	} else {
	    real = query("["+ output_met(l[lineID].met) +"]",output_met(l[lineID].met),"real",lineID,'Add line stress', 'Please add the line stress as opposed to the metre shown here', 'ln');
	}
	if (l[lineID].foot.id != "" && l[lineID].foot.id != null) {      
	    type = l[lineID].foot.text;
	}
	if (l[lineID].footnum.id != "" && l[lineID].footnum.id != null) {      
	    number = l[lineID].footnum.text;
	}
	if (l[lineID].realfoot.id != "" && l[lineID].realfoot.id != null) {      
	    rtype = l[lineID].realfoot.text;
	}
	if (l[lineID].realfootnum.id != "" && l[lineID].realfootnum.id != null) {      
	    rnumber = l[lineID].realfootnum.text;
	}
	$( "#pho-dynamic" ).append("<ul class='ana_metre'><li>Metre: "+ output_met(l[lineID].met) +"</li>"+((type != '')?'<li>Metrical foot type: '+type+'</li>':'')+((number != '')?'<li>Metrical foot number: '+number+'</li>':'')+"<li>Realisation: "+real+"</li>"+((rtype != '')?'<li>Realised foot type: '+rtype+'</li>':'')+((rnumber != '')?'<li>Realised foot number: '+rnumber+'</li>':'')+"</ul>");
    }

// rhyme pattern/position
    if (l[lineID].rhyme.pattern != "" && l[lineID].rhyme.pattern != null) {
	var pattern = '', bound = '', label = '', rsnd = '', rword = '', spos = '', stress = '', rrel = '', ids = [];
	var pattern = l[lineID].rhyme.pattern.split('');
	var label = l[lineID].rhyme.pattern.substring( parseInt(l[lineID].rhyme.pos), parseInt(l[lineID].rhyme.pos)+1 );
	pattern[ parseInt(l[lineID].rhyme.pos) ] = label.bold();
	pattern = pattern.join('');
	$( "#pho-dynamic" ).append("<h2>Rhyme</h2>");
	if (l[lineID].rhymes) {
	    for (var i = 0; i < l[lineID].rhymes.length; i++) {
		if (l[lineID].rhymes[i]["end"]) {                        // end rhyme
		    if (l[lineID].rhymes[i]["end"].bound.id != "" && l[lineID].rhymes[i]["end"].bound.id != null) {
			bound = l[lineID].rhymes[i]["end"].bound.text+" rhyme";
		    }
		    if (l[lineID].rhymes[i]["end"].spos.id != "" && l[lineID].rhymes[i]["end"].spos.id != null) {
			spos = l[lineID].rhymes[i]["end"].spos.text;
		    }
		    if (l[lineID].rhymes[i]["end"].stress.id != "" && l[lineID].rhymes[i]["end"].stress.id != null) {
			stress = l[lineID].rhymes[i]["end"].stress.text;
		    }
		    if (l[lineID].rhymes[i]["end"].rword[0] != "" && l[lineID].rhymes[i]["end"].rword[0] != null) {
			for (var j = 0; j < l[lineID].rhymes[i]["end"].rword.length; j++) {
			    rword += o[ l[lineID].rhymes[i]["end"].rword[j] ].tok+" ";
			    ids.push ( l[lineID].rhymes[i]["end"].rword[j] );
			}
			rword = rword.substring(0,rword.length-1);
		    }
		}
	    }
	} // end rhymes
	if (l[lineID].rrel) {
	    rrel = "<li>Related rhymes (stanza coherence):";
	    for (var i = 0; i < l[lineID].rrel.length; i++) { // each related line 0, 1...
		var rrwrd = '';
		for (var j = 0; j < l[ l[lineID].rrel[i].id ].rhymes[0]["end"].rword.length; j++) {
		    rrwrd += o[ l[ l[lineID].rrel[i].id ].rhymes[0]["end"].rword[j] ].tok+" ";
    		    ids.push ( l[ l[lineID].rrel[i].id ].rhymes[0]["end"].rword[j] );
		}
		rrwrd = rrwrd.substring(0,rrwrd.length-1);
		rrel += "<ul><li>Line: "+$( "div[id='"+l[lineID].rrel[i].id+"']" ).children(".ln").first().text().trim()+"; </li>"+
		    "<li>rhyme word: "+rrwrd+"; </li>"+
		    "<li>nature of similarity: "+l[lineID].rrel[i].sim+" rhyme</li></ul>";
	    }
	    rrel += "</li>";
	}
	$( "#pho-dynamic" ).append("<ul class='ana_rhymes'><li>Rhyme label: "+label+"</li><li>Rhyme pattern (position): "+pattern+"</li>"+((bound != '')?'<li>Rhyme (word boundaries): '+bound+'</li>':'')+
((spos != '')?'<li>Rhyme (stanza position): '+spos+'</li>':'')+
((stress != '')?'<li>Rhyme (stress pattern): '+stress+'</li>':'')+
((rword != '')?'<li>Rhyme word: <a class="visualize_ids" data-ids="'+ids+'">'+rword+'</a></li>':'')+rrel+
"</ul>");
    }

// rhetorical figures
    if (Object.keys(RFphon).length > 0) {
	$( "#pho-dynamic" ).append("<h2 class='rhetfigs'>Rhetorical figures</h2>");
	$( "#pho-dynamic" ).append(RF_json(RFphon));
    }

// Phonemic display button
    if ( !$("#phonemic")[0]) {
	$.each(o, function(index) { if (o[ index ].class == "w") { wtokensno++; } });
	$( "#pho-static" )
            .prepend( "<p id='phonemic'>This text has "+wtokensno+" word token"+(wtokensno > 1 ? "s" : "")+". <button id='phonemicdisplay' type='button' class='btn btn-xs btn-primary' data-toggle='off' aria-pressed='false' autocomplete='off'>Phonemic display <span>on</span></button></p> ");
    }

}


// morphological layer
function ana_morphological (lineID) {

// syllable count/pattern
    $( "#mor-dynamic" ).append("<h2>Syllables</h2>");
    var syll = 0, str = '', reduced = '';
    $.each( l[lineID].content, function( index,item ) {
	if ( o[item] && o[item].class == "w" ) { syll += parseInt(o[item].syllab) }
    });
    if (l[lineID].syllab != "" && l[lineID].syllab != null) {
	str = "<li>Pattern: "+l[lineID].syllab+" / </li>";
	if (l[lineID].syllab < syll) { reduced = " (syllabic reduction)"; }
    }
    str += "<li>Counted: "+syll+"</li>";
    $( "#mor-dynamic" ).append("<ul class='ana_syll'>"+str+reduced+"</ul>");

// morphological table
    $( "#mor-dynamic" ).append("<h2>Morphology</h2>"+morph_ana( lineID ));

// rhetorical figures
    if (Object.keys(RFmorp).length > 0) {
	$( "#mor-dynamic" ).append("<h2 class='rhetfigs'>Rhetorical figures</h2>");
	$( "#mor-dynamic" ).append(RF_json(RFmorp));
    }

    if ( !$("#morphemic")[0]) {
	var morphtext;
	$.each(o, function(index) { if (o[ index ].class == "w" && !_.contains(stopped, o[index].tok.toLowerCase())
				       ) { wtokens.push( o[index].tok.toLowerCase() ) } });
	morphtext = `<p id='morphemic'>This text has `+wtokensno+` word`+(wtokensno > 1 ? `s` : ``)+` and `+_.uniq(wtokens).length+` unique word forms. Its <b>vocabulary density</b> is `+(_.uniq(wtokens).length/wtokensno).toFixed(3)+`.</p><p>Most frequent words (including paratexts; excluding <a target="_blank" class="external" href="https://github.com/alhuber1502/ECPA/blob/master/web/data/stopwords.txt">stop words</a>): <ul class="figures freq">`;
	var frqMap = {};
	for (var x=0, len=wtokens.length; x<len; x++) {
	    var hkey = wtokens[x];
	    frqMap[hkey] = (frqMap[hkey] || 0) + 1;
	}
	var frqArr = [];
	for (hkey in frqMap) frqArr.push({key: hkey, freq: frqMap[hkey]});
	frqArr.sort(function(a,b){return b.freq - a.freq});
	var newArr = frqArr.length;
	for (var j = 0; j < newArr; j++) {
	    morphtext += "<li style='display:inline;'><a style='word-break:no;'>"+frqArr[j].key+"</a>&nbsp;("+frqArr[j].freq+")</a>";
	    if (j+1 < newArr && (j < 50 || j > 50)) { morphtext += ",</li> "; } else if (j+1 < newArr && j == 50) { morphtext += ", <a class='more' id='freqallc'>[more]</a></li><ul class='collapse' id='freqall'>"; }
	}
	if (newArr >= 50) {
	    morphtext += "</ul></ul>";
	} else {
	    morphtext += "</ul>";
	}
	$( "#mor-static" ).prepend( morphtext );
    }
    
}


// syntactic layer
function ana_syntactic (lineID) {

// stanza
    if (l[lineID].stanzas.id != "" && l[lineID].stanzas.id != null) {      
	$( "#syn-dynamic" ).append("<h2>Stanza</h2><ul class='ana_stanza'><li>Form: "+l[lineID].stanzas.text+"</li></ul>");
    }

// enjambment
    if (l[lineID].enjamb != "" && l[lineID].enjamb != null) {
	$( "#syn-dynamic" ).append("<p class='ana_stanza'>Enjambment: "+l[lineID].enjamb+"</p>");
    }

// rhetorical figures
    if (Object.keys(RFsynt).length > 0) {
	$( "#syn-dynamic" ).append("<h2 class='rhetfigs'>Rhetorical figures</h2>");
	$( "#syn-dynamic" ).append(RF_json(RFsynt));
    }

// CONLL (token count starts with 1 --- tokens can be aligned with sentences JSON ids in _s)
// check if new parse is required
    if ( sentenceDisplayed.length != l[lineID].sentences.length ) { // fewer or more sentences need to be displayed
	newParse = true;
	sentenceDisplayed = l[lineID].sentences;
    } else {
	for (var i = 0; i < l[lineID].sentences.length; i++) {
	    if ( l[lineID].sentences[i] != sentenceDisplayed[i] ) { // new sentence
		newParse = true;
		sentenceDisplayed = l[lineID].sentences;
		break;
	    } else {
		newParse = false;
	    }
	}
    }
    if (newParse) {
	draw(lineID);
    }

// Sentencing button
    if ( !$("#sentences")[0]) {
	$( "#syn-static" )
            .prepend( "<p id='sentences'>This text has "+Object.keys(s).length+" sentence"+(Object.keys(s).length > 1 ? "s" : "")+". The average number of <b>words per sentence</b> is "+(wtokensno/Object.keys(s).length).toFixed(1)+". <button id='sentencing' type='button' class='btn btn-xs btn-primary' data-toggle='off' aria-pressed='false' autocomplete='off'>Sentencing <span>on</span></button></p><br/> ");
    }
}


// semantic layer
function ana_semantic (lineID) {

// Frame semantic parse (token count starts with 0 --- tokens can be aligned with sentences JSON ids in _s)
    if (newParse) {
	$( "#sem-sporadic" ).html("<h2>Frame semantic parse</h2>");
	$( "#sem-sporadic" ).append("<div>Sentence no. "+sentnum+":</div>"+
	"<p style='text-align: right;' class='small'>[<b>Tokens</b> // <span style='font-variant:small-caps;font-size:1.1em;'>Frames</span> // Frame elements (frame-specific roles)] &nbsp; "+query('[Found an error?]','Please specify...','semantics',l[lineID].sentences[0], 'Make a correction', 'Please provide a correction to the frame semantic parse', 'ta')+

	"<br/><div id='parse_horiz' class='frameviz'/><br/>");
	for (var i = 0; i < l[lineID].sentences.length; i++) {
	    sentnum += (parseInt(l[lineID].sentences[i])+1)+", ";
	    receivedFrameJSON(sema[ l[lineID].sentences[i]], 'sent', l[lineID].sentences[i]); // function appends output directly, plus, added third parameter to include sentence number
	}
    }
    // make all tables equal width
    var largest = 0;
    $('table.sentence').each(function() {
	    var width = $(this)[0].offsetWidth;
	    if(width > largest) {
		largest = width;
	    }
	}).width(largest);

// rhetorical figures
    if (Object.keys(RFsema).length > 0) {
	$( "#sem-dynamic" ).append("<h2 class='rhetfigs'>Rhetorical figures</h2>");
	$( "#sem-dynamic" ).append(RF_json(RFsema));
    }

}


// pragmatic layer
function ana_pragmatic (lineID) {
// rhetorical figures
    if (Object.keys(RFprag).length > 0) {
	$( "#pra-dynamic" ).append("<h2 class='rhetfigs'>Rhetorical figures</h2>");
	$( "#pra-dynamic" ).append(RF_json(RFprag));
    }

// sort NEs by type
    var NE = [];
    for (var key in ne) {
	if (ne[key].loc.line == lineID) {
	    if (!NE[ne_id[ne[key].id].type]) { NE[ne_id[ne[key].id].type] = []; }
	    NE[ne_id[ne[key].id].type].push(ne[key]);
	}
    }

// named entities
    var nespresent = Object.keys(ne_id).length;
    var nesoccur = Object.keys(ne).length;
    if ( nespresent > 0 ) {
	$( "#pra-dynamic" ).append("<h2 class='namedents'>Named entities</h2>");
    }
    if (Object.keys(NE).length > 0) {
	$( "#pra-dynamic" ).append(NE_json(NE));
    }

// Named entities button
    if ( !$("#namedent")[0]) {
	$( "#pra-static" )
	    .prepend( "<div id='namedent'>This text refers to "+nespresent+" named entit"+(nespresent > 1 || nespresent == 0 ? "ies" : "y")+" ("+nesoccur+" occurrence"+(nesoccur > 1 || nesoccur == 0 ? "s" : "")+")."+((nespresent > 0)?" <button id='namedentities' type='button' class='btn btn-xs btn-primary' data-toggle='off' aria-pressed='false' autocomplete='off'>Named Entities <span>on</span></button></div><br/> ":"</div><br/>"));
    }
}


// visualize RF hover link
$(document.body).on('mouseenter', '.visualize_ids', function () {
    var ids = $(this).attr('data-ids').split(',');
    $.each( ids , function( index, item ){
	$( jq( item ) ).addClass("idsSelected");
	$( "[data-id='"+item+"']" ).addClass("idsSelected");
    });
}).on('mouseleave', '.visualize_ids', function () {
    var ids = $(this).attr('data-ids').split(',');
    $.each( ids , function( index, item ){
	$( jq( item ) ).removeClass("idsSelected");
	$( "[data-id='"+item+"']" ).removeClass("idsSelected");
    });
});


// "phonemicdisplay" toggle link
$(document.body).on('click', '#phonemicdisplay' ,function(){
    if (!$(this).attr('data-toggled') || $(this).attr('data-toggled') == 'off'){
	$(this).attr('data-toggled','on');
	$.each(o, function(index) {
	    if (o[ index ].class == "w") {
		$( jq( index ) ).text( o[ index ].pron );
	    }
	});
	$('span', this).text('off').parent().addClass("active");
	$(this).parent().append(" <span id='phonemicdisplay_legend'></span>");
	phonemic = true;
    } else if ($(this).attr('data-toggled') == 'on'){
        $(this).attr('data-toggled','off');
	$.each(o, function(index) {
	    if (o[ index ].class == "w") {
		$( jq( index ) ).text( o[ index ].spe );
	    }
	});
	$("#phonemicdisplay_legend").remove();
	$('span', this).text('on').parent().removeClass("active");
	phonemic = false;
    }
});


// "sentencing" toggle link
$(document.body).on('click', '#sentencing' ,function(){
    if (!$(this).attr('data-toggled') || $(this).attr('data-toggled') == 'off'){
	$(this).attr('data-toggled','on');
	var sstart = [], send = [], sdiv = [];
	for (var key in s) {
	    sstart.push(s[key].ids[0]);
	    send.push(s[key].ids[(s[key].ids.length-1)]);

	    for (var i = 0; i < s[key].ids.length-1; i++) {
		// further weaker subdivisions would be "," "—" (others?)
		if (o[s[key].ids[i]].tok == ":" || o[s[key].ids[i]].tok == ";") {
		    sdiv.push(s[key].ids[i]);
		}
	    }

	}
	$.each( sstart, function( index, value ){
	    $( "<span class='sstart'><sup>"+(1+index)+"</sup><span class='glyphicon glyphicon-chevron-right sstart'/></span> " ).insertBefore( "#"+value );
	});
	$.each( send, function( index, value ){
	    $( " <span class='glyphicon glyphicon-chevron-left send'/>" ).insertAfter( "#"+value );
	});
	$.each( sdiv, function( index, value ){
	    $( " <span class='glyphicon glyphicon-option-vertical sdiv'/>" ).insertAfter( "#"+value );
	});
	$('span', this).text('off').parent().addClass("active");
	$(this).parent().append(" <span id='sentencing_legend'>[Sentence start: <span class='glyphicon glyphicon-chevron-right'/> / Sentence end: <span class='glyphicon glyphicon-chevron-left'/> / Subdivisions: <span class='glyphicon glyphicon-option-vertical'/>]</span>");
    } else if ($(this).attr('data-toggled') == 'on'){
        $(this).attr('data-toggled','off');
	$( ".sstart" ).remove();
	$( ".send" ).remove();
	$( ".sdiv" ).remove();
	$("#sentencing_legend").remove();
	$('span', this).text('on').parent().removeClass("active");
    }
});


// "KWIC" toggle link
$(document.body).on('click', 'button.kwic' ,function(){
    if (!$(this).attr('data-toggled') || $(this).attr('data-toggled') == 'off'){
	$(this).attr('data-toggled','on');
	$('span', this).text('off').parent().addClass("active");
	$(jq( $(this).attr("data-kwic")+'-kwic' )).after("<tr><td colspan='8'>"+ KWIC ($(this).attr('data-kwic')) + "</td></tr>");
    } else if ($(this).attr('data-toggled') == 'on'){
        $(this).attr('data-toggled','off');
	$(jq( $(this).attr("data-kwic")+'-kwic' )).next("tr").remove();
	$('span', this).text('on').parent().removeClass("active");
    }
});


// "namedentities" toggle link
$(document.body).on('click', '#namedentities' ,function(){
    if (!$(this).attr('data-toggled') || $(this).attr('data-toggled') == 'off'){
	$(this).attr('data-toggled','on');

	if ( !$(".ne")[0]) { // initial mark-up
	    for (var key in ne) {
		if (ne.hasOwnProperty(key)) {
		    var wrapper = ne[key].loc.words.split(" ");  // split words of each occurrence into an array
		    var type = ({
			"TIM" : "ne_tim",
			"LOC" : "ne_loc",
			"ORG" : "ne_org",
			"PER" : "ne_per",
			"MON" : "ne_mon",
			"PRC" : "ne_prc",
			"DAT" : "ne_dat",
			"MSC" : "ne_msc"
		    })[ne_id[ne[key].id].type];
		    type = "ne "+type;
		    if (wrapper.length == 1) {
			$(jq( wrapper[0] ) ).wrapAll('<span id="'+key+'" class="'+type+'"/>');
		    } else {
			wrapper = jQuery.map( wrapper, function( n, i ) {
			    return ( n.replace( /(:|\.|\[|\]|,|=)/g, "\\$1" ) );
			});
			$("#"+wrapper.join(',#')).myWrap(key,type);
			wrapper.splice(-1,1);  // insert spaces between elements to compensate for .wrapAll()
			$("#"+wrapper.join(',#')).after(" ");
		    }
		}
	    }
	} else { // remove override styles
	    $("#newNEstyles").remove();
	}
	$('span', this).text('off').parent().addClass("active");
	$(this).parent().append("<span id='ne_legend'>[<span class='ne_per'>person</span> / <span class='ne_org'>group/orginazation</span> / <span class='ne_loc'>location</span> / <span class='ne_dat'>date</span> / <span class='ne_tim'>time</span> / <span class='ne_mon'>currency</span> / <span class='ne_prc'>percentage</span> / <span class='ne_msc'>miscellaneous</span>]</span>");
    } else if ($(this).attr('data-toggled') == 'on'){
	$(this).attr('data-toggled','off');
	$("head").append('<style id="newNEstyles" type="text/css"></style>'); // override default styles
	$("#newNEstyles").append('span.ne_tim{background-color:transparent !important;}span.ne_loc{background-color:transparent !important;}span.ne_org{background-color:transparent !important;}span.ne_per{background-color:transparent !important;}span.ne_mon{background-color:transparent !important;}span.ne_prc{background-color:transparent !important;}span.ne_dat{background-color:transparent !important;}span.ne_msc{background-color:transparent !important;}');
	$("#ne_legend").remove();
	$('span', this).text('on').parent().removeClass("active");
    }
});


// toggle expand/collapse all analysis accordions
$(document.body).on('click', '#toggle_all_ana' ,function(){
    if ($(this).html() == "<i class=\"glyphicon glyphicon-minus-sign\"></i> Collapse All") {
        $('#ana-body .collapse.in').each(function (index) {
            $(this).collapse("toggle");
        });
        $(this).html("<i class=\"glyphicon glyphicon-plus-sign\"></i> Expand All").removeClass("active");
    } else {
        $('#ana-body .collapse:not(.in)').each(function (index) {
            $(this).collapse("toggle");
	});
        $(this).html("<i class=\"glyphicon glyphicon-minus-sign\"></i> Collapse All").addClass("active");
    }
});

$(document.body).on('click', '#freqallc' ,function(){
    if ($(this).hasClass("more")) {
	$(this).html("[less]");
	$(this).removeClass("more").addClass("less");
    } else {
	$(this).html("[more]");
	$(this).removeClass("less").addClass("more");
    }
    $('#freqall').collapse('toggle');
});
