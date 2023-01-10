
// Reading


// annotation modal (available on ALL w/pc of the text, and on all tabs)
$(document.body).on('click', '.w:not(.note .w),.pc:not(.note .pc),.l:not(.note .l)', function (e) {
    if (e.target.nodeName == "SUP") { e.preventDefault(); return true; } // prevent modal on footnotes
    if (e.target.parentNode.href || e.target.href ) { return true; } // prevent modal on clicking on internal links a.link_ref
    var isWord = false, ref = '';
    if ( $(this).hasClass("w") || $(this).hasClass("pc") ) { isWord = true; }
    if (isWord) {
	ref = o[ $(e.target).attr("id") ].tok;
	if ($(e.target).closest(".line").attr("id")) {
	    ref = reference( $(e.target) );
	} else {
	    ref += '] ';
	}
    } else {
	if ($(e.target).closest(".line").attr("id")) {
	    ref += currentline( $(e.target).closest(".line").attr("id") );
	} else {
	    ref += 'this token';
	}
    }
    $( "body" ).prepend(`
<div id="newNote" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="newModalLabel">Add a note or query</h4>
      </div>
      <div class="modal-body">
<form id="newNoteForm">
<h5 style="display: inline-block; padding-right:8px;"> Type </h5> 
<div class="btn-group" data-toggle="buttons">
  <label class="btn btn-default btn-sm active">
    <input class="form-control" type="radio" name="nq" autocomplete="off" checked="checked" value="note"/> note
  </label>
  <label class="btn btn-default btn-sm">
    <input class="form-control" type="radio" name="nq" autocomplete="off" value="query"/> query
  </label>
</div>
<h5 style="display:inline-block; padding: 0 10px 0 20px;"> Context </h5>
<div class="btn-group" data-toggle="buttons">
  <label class="btn btn-default btn-sm`+((isWord)?' active':'')+`">
    <input type="radio" name="obj" autocomplete="off" class="form-control" `+((isWord)?'checked="checked"':'')+` value="`+$(e.target).attr("id")+`"/> word
  </label>
  <label class="btn btn-default btn-sm`+((!isWord)?' active':'')+`">
    <input type="radio" name="obj" autocomplete="off" class="form-control" `+((!isWord)?'checked="checked"':'')+` value="`+($(e.target).parent().attr("id")?$(e.target).parent().attr("id"):'line: '+$(e.target).attr("id"))+`"> line(s) 
  </label>
  <label class="btn btn-default btn-sm">
    <input class="form-control" type="radio" name="obj" autocomplete="off" value="stanza: `+((isWord)?$(e.target).attr("id"):$(e.target).parent().attr("id"))+`"> stanza/paragraph
  </label>
  <label class="btn btn-default btn-sm">
    <input class="form-control" type="radio" name="obj" autocomplete="off" value="whole text: `+((isWord)?$(e.target).attr("id"):$(e.target).parent().attr("id"))+`"/> whole text
  </label>
</div>
<h5>Your <span id="contribution-type">note on</span> <span id="contribution-context">`+ref+
`</span></h5>`+
`<textarea style="resize:vertical;" class="form-control" name="comment" id="newNoteText" rows="6" required="required"/>`+add_user());
    $('#newNote').modal('show');
    if ( isWord ) { // prevent double firing of modal
	e.stopPropagation();
    }
});

$(document.body).on('change', '[name=nq]' , function(e) {
    if ( $('input[name=nq]:checked', '#newNoteForm').val()=="note" ) {
	$("#contribution-type").text("note on");
    } else {
	$("#contribution-type").text("query about");
    }
});
$(document.body).on('shown.bs.modal', "#newNote,#newIC", function () {
    $('#newNoteText').focus();
});

// save annotation modal form
$(document.body).on('click', 'button#newNoteSubmit' , function(e) {
    e.preventDefault();
    var str = $("#newNoteForm").serialize();
    d = this;
    $(d).html("Submitting...");
    $.ajax({
        type: 'POST',
        url: '/cgi-bin/handleCS.cgi',
	data: { 'content': str, 'file': docname, 'source': source },
        dataType: 'text',
        success: function() {
	    $(d).html("Thank You!");
	    setTimeout(function() { 
		$('#newNote').modal('hide');
		$('#newIC').modal('hide');
		}, 1000);
        },
        error: function() {
            $(d).html("Error - Please try again!");
        }
    });
});


// line/word reference
function reference (token) {
    if (token.hasClass("w")) {                           // word
        var id = document.getElementById(token.attr("id"));
	if ( l[token.closest(".line").attr("id")] ) {// verse
	    var words = l[token.closest(".line").attr("id")].content;
	    words = jQuery.grep(words, function( n ) {
		    return ( n != "c" && n != "cs" && o[n].class != "pc" );
		});
	    return token.closest(".l").prev().text().trim()+"."+
		(1+words.indexOf(id.id))+" "+
		token.text()+"] ";
	} else {                                     // prose 
	    return token.text()+"] ";
	}
    } else {                                             // punctuation
	if ( token.closest(".l").length ) {          // verse
	    return token.closest(".l").prev().text().trim()+". "+
		token.text()+"] ";
	} else {                                     // prose
	    return token.text()+"] ";
	}
    }
}


// reading view content for popover
function rdn_cont (e) {

    var content = `<div class="small"><div class='small text-right'>[Click on 
      any word or line to add a note or query]</div></div>`;
    lineID = $(jq($(e).attr("id"))).closest(".line").attr("id"); // update lineID
    var lookup_l, lookup_r, posA=[], lemA=[], lemS="", posSd="", posSm="";
    var lemA = (o[$(e).attr("id")].lem).split('|');
    var posA = (o[$(e).attr("id")].pos).split('|');
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
    if ($(e).hasClass("w")) {
	//	var words = l[$(e).closest(".line").attr("id")].content;
	//	words = jQuery.grep(words, function( n ) {
	//	    return ( n != "c" && n != "cs" && o[n].class != "pc" );
	//	});
	lookup_r = o[$(e).attr("id")].reg.replace(/'$|'s$/ig, '');
	lookup_l = lemA[0];
	content += "<p class='small'><b>Word properties</b></p><div class='small'>"+
	    "<div class='bibl'>Standard form: "+o[$(e).attr("id")].reg+
	    "</div><div class='bibl'>Lemma: "+lemS+
	    "</div><div class='bibl'>Part of speech: "+posSd+
	    "</div><div class='bibl'>Word class: "+posSm+
	    "</div><div class='bibl'>Pronunciation (IPA): /"+o[$(e).attr("id")].pron+
	    "/</div></div>";
    } else {
	lookup_r = o[$(e).attr("id")].reg.replace(/'$|'s$/ig, '');
	lookup_l = o[$(e).attr("id")].lem;
	content += "<p class='small'><b>Punctuation properties</b></p><div class='small'>"+
	    "<div class='bibl'>Standard form: "+o[$(e).attr("id")].reg+
	    "</div><div class='bibl'>Lemma: "+lemS+
	    "</div><div class='bibl'>Word class: "+posSm+
	    "</div></div>";
    }
    content += "<p style='text-align: right;' class='small'>"+query('[Found an error?]','Please specify...','props',$(e).attr('id'), 'Make a correction', 'Please provide a correction to the properites of '+reference($(e)), 'ta')+"</p>";
    content += "<p class='small'><b>External tools</b></p><ul class='downloads2 small'><li>Language: "+
	"<ul class='bibliography'><li><a class='external' target='_blank' href='https://www.dictionary.com/browse/"+escape(lookup_r)+"'>English dictionary</a>"+
	"<li><a class='external' target='_blank' href='https://www.thesaurus.com/browse/"+escape(lookup_l)+"'>English thesaurus</a>"+
	"<li><a class='external' target='_blank' href='http://www.collinsdictionary.com/search/?dictCode=french-english&amp;q="+escape(lookup_l)+"'>French dictionary</a>"+
	"<li><a class='external' target='_blank' href='http://www.perseus.tufts.edu/hopper/resolveform?lang=la&amp;lookup="+escape(lookup_l)+"'>Latin dictionary</a></ul>"+
	"<li>Reference: "+
	"<ul class='bibliography'><li><a class='external' target='_blank' href='http://www.britannica.com/search?query="+lookup_r+"'>Britannica</a>"+
	"<li><a class='external' target='_blank' href='https://en.wikipedia.org/wiki/Special:Search/"+lookup_r+"'>Wikipedia</a>"+
	"<li><a class='external' target='_blank' href='https://catalog.hathitrust.org/Search/Home?searchtype=all&amp;lookfor="+lookup_r+"'>HathiTrust</a>"+
	"<li><a class='external' target='_blank' href='https://www.google.com/search?q="+escape(lookup_r)+"&amp;tbm=bks'>Google Books</a>"+
	"</ul></ul>"+
	"</div><div class='small text-right'>TEI/XML ID: "+$(e).attr("id")+"</div>";
    return content;

}

// reading view mouse for popover
function rdn_mouse (e,p) {

    var lem = o[$(e).attr("id")].lem;
    var reg = o[$(e).attr("id")].reg;
    if ( p == "enter" ) {
	$.each(o, function(index) {
	    if (o[index].lem == lem || o[index].reg == reg) {
		$( jq( index ) ).css({"background-color":"#88bcdf","color":"#fff"});
	    }
	});
    } else {
	$.each(o, function(index) {
	    if (o[index].lem == lem || o[index].reg == reg) {
		$( jq( index ) ).css({"background-color":"","color":""});
	    }
	});
    }

}

// produce token popovers
$(".lg .l .w,.lg .l .pc,.sp .l .w,.sp .l .pc,#text p .w,#text p .pc").not(".note .w,.note .pc").popover({
    trigger: "manual", 
    html: true, 
    animation: false, 
    container: "body", 
    placement: "top auto", 
    viewport: "#text", 
    title: function() {
	if ($('.right .tab-content > div.active').attr("id") == "reading"
            || $('.right .tab-content > div.active').attr("id") == "analysis"
	   ) {
	    return reference( $(this) );
	}
    }, 
    content: function() {
	if ($('.right .tab-content > div.active').attr("id") == "reading") {
	    return rdn_cont( $(this) );
	}
	else if ($('.right .tab-content > div.active').attr("id") == "analysis") {
	    return ana_cont( $(this) );
	}
    }
}).on("mouseenter", function () {              // enter selector from anywhere or from popover
    var _this = this;
    if ( $('.right .tab-content > div.active').attr("id") == "reading" ) {
	rdn_mouse ( $(this), "enter" );
	$(this).popover("show");
    } else if ( $('.right .tab-content > div.active').attr("id") == "analysis" ) {
	rdn_mouse ( $(this), "enter" );
	ana_mouse ( $(this), "enter" );
	$(this).popover("show");
    } else if ( $('.right .tab-content > div.active').attr("id") == "visualization" ) {
	viz_mouse ( $(this), "enter" );	
    }
    $(".popover").css( "opacity", "0.8" );
    $(".popover").on("mouseleave", function () { // leave popover
        $(_this).popover('hide');
    });
}).on("mouseleave", function () {              // leave selector
    var _this = this;
    if ( $('.right .tab-content > div.active').attr("id") == "reading" ) {
	rdn_mouse ( $(this), "leave" );
    } else if ( $('.right .tab-content > div.active').attr("id") == "analysis" ) {
	rdn_mouse ( $(this), "leave" );
	ana_mouse ( $(this), "leave" );
    } else if ($('.right .tab-content > div.active').attr("id") == "visualization") {
	viz_mouse ( $(this), "leave" );	
    }
    setTimeout(function () {           
        if (!$(".popover:hover").length) {         // do not enter popover
	    $(_this).popover("hide");
        } else {                                   // enter popover
	    $(".popover").css( "opacity", "1" );
	}
    }, 10);
});


// function to safely address IDs containing dots etc.
function jq( myid ) {
    return "#" + myid.replace( /(:|\.|\[|\]|,|=)/g, "\\$1" );
}


// on switching primary tabs do...
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

    if ($(e.target).attr('href') == "#xml") {           // TEI/XML tab
	var content = editor.getValue();
	if (content == "") {     // load XML on first visit to XML tab
            $.ajax({
		type: "GET",
		url: '/works/'+docname+'/'+docname+'.xml',
		cache: false,
		error: function(xhr, status, error){
                    alert("Error: " + xhr.status + " - " + error)},
		dataType: 'xml',
		success: function(data,status,jqXHR){
                    var xml = jqXHR.responseText;
                    editor.setValue(xml);
		}
            });
	} else {
	    editor.refresh();
	    $('#myXML').click();
	}

    } else if ($(e.target).attr('href') == "#image") {  // Facsimile tab
/*
	$("#myImage").css({"width":"100%", "height":"100%"}); // seems to lose this info
	if (Z.Viewer) {
	    Z.Viewer.autoResizeViewer();
	}
*/
    }
    
});

// make disabled tabs "disabled" (bug in BS3.3.6)
$(document.body).on('click', 'a[data-toggle="tab"],[role="menu"]>li>a', function (e) {
    if ( $(this).parent().hasClass('disabled') ) {
	e.preventDefault(); // prevent hash to change
	e.stopImmediatePropagation(); // prevent "active" state change
    }
});

// on switching secondary tabs do ...
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

    if ($(e.target).attr('href') == "#reading") {
	$('link[href="/css/ana.ecep.css"]').prop('disabled', true);
	$('link[href="/css/viz.ecep.css"]').prop('disabled', true);
	$('link[href="/css/mod.ecep.css"]').prop('disabled', true);
	$('.nav-tabs a[href="#text"]').tab('show');

	if (mod_ft == 0) {  // don't display outside of modelling view
	    $(".cytoscape-navigator")
		.css({ "display":"none" });
	}

	if (phonemic == true) {  // don't display outside of analysis view
	    $.each(o, function(index) {
		if (o[ index ].class == "w") {
		    $( jq( index ) ).text( o[ index ].spe );
		}
	    });
	}

    } else if ($(e.target).attr('href') == "#analysis") {
	$('link[href="/css/ana.ecep.css"]').prop('disabled', false);
	$('link[href="/css/viz.ecep.css"]').prop('disabled', true);
	$('link[href="/css/mod.ecep.css"]').prop('disabled', true);
	$('.nav-tabs a[href="#text"]').tab('show');
	if ( $( "div#pho-dynamic" ).hasClass( "first-time" )) {
	    $( "div#pho-dynamic" ).removeClass( "first-time" );
	    $("div#text").scrollTop(0);
	    // trigger first line hover
	    for (var key in l) {
		if (l[key] !== null && l[key].content !== undefined ) {
		    $( jq( key ) ).trigger("mouseenter");
		    break;
		}
	    }
	}

	if (mod_ft == 0) {  // don't display outside of modelling view
	    $(".cytoscape-navigator")
		.css({ "display":"none"});
	}

	if (phonemic == true) {  // display when selected
	    $.each(o, function(index) {
		if (o[ index ].class == "w") {
                    $( jq( index ) ).text( o[ index ].pron );
		}
            });
	}

    } else if ($(e.target).attr('href') == "#visualization") {
	$('link[href="/css/ana.ecep.css"]').prop('disabled', true);
	$('link[href="/css/viz.ecep.css"]').prop('disabled', false);
	$('link[href="/css/mod.ecep.css"]').prop('disabled', true);
	$('.nav-tabs a[href="#text"]').tab('show');
	if ( viz_chosen == '' ) {
	    if (viz_ft == 1) {
		$.getScript('/js/viz_overview.js');
		$( '.left' ).switchClass( "col-xs-6", "col-xs-3", 1000);
		$( '.right' ).switchClass( "col-xs-6", "col-xs-9");
		viz_ft = 0;
	    }
	}

	if (mod_ft == 0) {  // don't display outside of modelling view
	    $(".cytoscape-navigator")
		.css({ "display":"none"});
	}
	
	if (phonemic == true) {  // don't display outside of analysis view
	    $.each(o, function(index) {
		if (o[ index ].class == "w") {
		    $( jq( index ) ).text( o[ index ].spe );
		}
	    });
	}
	
    } else if ($(e.target).attr('href') == "#modelling") {
	$('link[href="/css/ana.ecep.css"]').prop('disabled', true);
	$('link[href="/css/viz.ecep.css"]').prop('disabled', true);
	$('link[href="/css/mod.ecep.css"]').prop('disabled', false);
	$('.nav-tabs a[href="#text"]').tab('show');
	if (mod_ft == 1) {
	    mod_home( '' );
	    $( '.left' ).switchClass( "col-xs-6", "col-xs-3", 1000);
	    $( '.right' ).switchClass( "col-xs-6", "col-xs-9");
	    mod_ft = 0;
	}
	
	$(".cytoscape-navigator")
	    .css({ "display":"initial"}); //  display when selected

	if (phonemic == true) {  // don't display outside of analysis view
	    $.each(o, function(index) {
		if (o[ index ].class == "w") {
		    $( jq( index ) ).text( o[ index ].spe );
		}
	    });
	}
	
    }
});


// switch to facsimile tab and load image (if specified) and update pagination
function switchToImageView(image) {
    $('.nav-tabs a[href="#image"]').tab('show');
    if (image) {
	/*
	var pageno = image.split("/").pop();
	Z.showImage("myImage","/images/works/"+image+".zif","zRotationVisible=1&zInitialRotation=0&zSkinPath=/js/zoomify/Assets/Skins/Default&zSaveImageFilename="+docname+"-"+pageno+".jpg&zSaveImageFormat=JPG&zSaveImageHandlerPath=local&zSaveImageCompression=0.9");
	$('#image-pagination').twbsPagination('destroy');
	$('#image-pagination').twbsPagination({
	    startPage: Number(_.invert(images)[image]),
	    totalPages: totalImages,
	    visiblePages: visibleImages,
	    first: '&laquo;',
	    prev: '&lsaquo;',
	    next: '&rsaquo;',
	    last: '&raquo;',
	    onPageClick: function (event, page) {
		var pageno = images[page].split("/").pop();
                Z.showImage("myImage","/images/works/"+images[page]+".zif","zRotationVisible=1&zInitialRotation=0&zSkinPath=/js/zoomify/Assets/Skins/Default&zSaveImageFilename="+docname+"-"+pageno+".jpg&zSaveImageFormat=JPG&zSaveImageHandlerPath=local&zSaveImageCompression=0.9");
	    }
	});
	*/
	viewer[ docname ].goToPage( imgs.indexOf( image ) );
    }
}


// save CodeMirror XML to server/download CodeMirror XML/reset buttons
$("#upXML").click(function(e){
    e.preventDefault();
    var response = confirm("Do you want to submit your changes?");
    if (response) {
	$("#upXML").html("Submitting...");
        editor.save();
        var content = editor.getValue(); //textarea text
        $.ajax({
	    type: 'POST',
	    url: '/cgi-bin/handleXML.cgi',
	    data: { 'myXML': content, 'file': docname, 'option': "up", 'source': source.replace(/\./g,'') },
	    dataType: 'xml',
	    success: function() {
		$("#upXML").html("Changes submitted!");
	    },
	    error: function() {
		$("#upXML").html("Changes NOT submitted!");	    
	    }
	});
	$('#upXML').prop('disabled', true);
    }
});

$("#downXML").click(function(e) {
    e.preventDefault();
    $("#downXML").html("Downloading...");
    editor.save();
    $('#file').val(docname);
    $('#option').val("down");
    $("#handleXML").submit();
    $("#downXML").html("Finished!");
    $('#downXML').prop('disabled', true);
});


$('div.CodeMirror').click(function(){
    $("#upXML").html("Submit changes");
    $('#upXML').prop('disabled', false);
    $("#downXML").html("Download XML");
    $('#downXML').prop('disabled', false);
});

function showTitles(value) {
    if (value == false) { // alphabetical
	$('#alphabetical').html('<b>alphabetical listing</b>');
	$('#bysourceeditions').html('<a href="#" onClick="showTitles(true);">listing in source editions</a>');
	$('[data-id="alphabetical"]').show();
	$('[data-id="bysourceeditions"]').hide();
    } else {
	$('#alphabetical').html('<a href="#" onClick="showTitles(false);">alphabetical listing</a>');
	$('#bysourceeditions').html('<b>listing in source editions</b>');
	$('[data-id="alphabetical"]').hide();
	$('[data-id="bysourceeditions"]').show();
    }

}

// switch between "text" view and "document" view
function showAllParatexts(value) {
    $('.nav-tabs a[href="#text"]').tab('show');
    if (value == false) {  // "Text" view
	$('link[href="/css/tei.typo.css"]').prop('disabled', true);
	$('link[href="/css/tei.default.css"]').prop('disabled', false);
	$('#textview').html('<b>Text view</b>');
	$('#documentview').html('<a href="#" onClick="showAllParatexts(true);">Document view</a>');
	$("#text .pagebreak").css('display','none');
	$("#text .byline").css('display','none');
	$("#text .figure").css('display','none');
	$("#text .titlepage").css('display','none');
	$("#text .tableofcontents").css('display','none');
	$("#text .dramatispersonae").css('display','none');
	$("#text .halftitle").css('display','none');
	$("#text .half-title").css('display','none');
	$("#text .introduction").css('display','none');
	$("#text .argument").css('display','none');
	$("#text .dedication").css('display','none');
	$("#text .preface").css('display','none');
	$("#text .gap").css('display','none');
    } else {                                          // "Document" view
	$('#textview').html('<a href="#" onClick="showAllParatexts(false);">Text view</a>');
	if (encoding == "#semi-diplomatic") {         // @decls = semi-diplomatic
	    $('link[href="/css/tei.default.css"]').prop('disabled', true);
	    $('link[href="/css/tei.typo.css"]').prop('disabled', false);
	    $('#documentview').html('<b>Document view</b> (semi-diplomatic)');
	} else {                                      // @decls = semi-normalized
	    $('link[href="/css/tei.typo.css"]').prop('disabled', true);
	    $('link[href="/css/tei.default.css"]').prop('disabled', false);
	    $('#documentview').html('<b>Document view</b> (semi-normalized)');
	}
	$("#text .pagebreak").css('display','');
	$("#text .byline").css('display','');
	$("#text .figure").css('display','');
	$("#text .titlepage").css('display','');
	$("#text .tableofcontents").css('display','');
	$("#text .dramatispersonae").css('display','');
	$("#text .halftitle").css('display','');
	$("#text .half-title").css('display','');
	$("#text .introduction").css('display','');
	$("#text .argument").css('display','');
	$("#text .dedication").css('display','');
	$("#text .preface").css('display','');
	$("#text .gap").css('display','');
    }
}


// prevent jump to href for these selectors (comma-separated list: '.notelink, ...')
$('.notelink').on('click', function(e) {e.preventDefault(); return true;});

