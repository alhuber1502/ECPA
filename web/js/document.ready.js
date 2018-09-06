
// Document ready
//$( document ).ready(function() {

    // dropdown navigation
    $('.dropdown').hover(function() {
        $(this).addClass('open');
    },
    function() {
        $(this).removeClass('open');
    });


    // initialize popovers
    $(function () {
	$('body').popover({
	    selector: '[data-toggle="popover"]'
	});
	$('#citation').attr("data-content", citation);
    });


    // add "_blank" link target to external links
    $('a.link_ref:not(a.link_ref[href^="#"])').attr('target', '_blank');
    $('a.external').attr('target', '_blank');


    // switch to tab specified in URL hash
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show') || $('.nav-tabs a[href="#text"]').tab('show');
    if (hash == "#poemvis") { // supports direct link into #PoemViewer from TGA
	viz_chosen = "POEMVIS_VIZ";
	hash && $('ul.nav a[href="' + '#visualization' + '"]').tab('show');
	$( '.left' ).switchClass( "col-xs-6", "col-xs-3", 1000);
	$( '.right' ).switchClass( "col-xs-6", "col-xs-9");
	init( viz_chosen );
    }
    $('.nav-tabs a').click(function (e) {
        $(this).tab('show');
        var scrollmem = $('body').scrollTop();
        window.location.hash = this.hash;
        $('html,body').scrollTop(scrollmem);
    });


    $('.dropdown-menu a').click(function (e) {
	$('.nav-tabs a[href="' + this.hash + '"]').tab('show');
	$(this).closest(".dropdown").removeClass('open');
    });


    if ($('#text').length) {
	// switch to default view
	showAllParatexts(false);


	// Make bootstrap cols resizable
	// Adapted from https://codepen.io/delagics/pen/PWxjMN
	$(function() {
		var resizableEl = $('.resizable').not(':last-child'),
		    columns = 12,
		    fullWidth = resizableEl.parent().width(),
		    columnWidth = fullWidth / columns,
		    totalCol, // this is filled by start event handler
		    updateClass = function(el, col) {
		    el.css('width', ''); // remove width, our class already has it
		    el.removeClass(function(index, className) {
			    return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
			}).addClass('col-xs-' + col);
		    el.css('border', '1px solid #eee');
		};
		
		// jQuery UI Resizable
		resizableEl.resizable({
			handles: 'e',
			    start: function(event, ui) {
			    var
				target = ui.element,
				next = target.next(),
				targetCol = Math.round(target.width() / columnWidth),
				nextCol = Math.round(next.width() / columnWidth);
			    
			    // set totalColumns globally
			    totalCol = targetCol + nextCol;
			    target.resizable('option', 'minWidth', columnWidth);
			    target.resizable('option', 'maxWidth', ((totalCol - 1) * columnWidth));
			},
			    resize: function(event, ui) {
			    var
				target = ui.element,
				next = target.next(),
				targetColumnCount = Math.round(target.width() / columnWidth),
				nextColumnCount = Math.round(next.width() / columnWidth),
				targetSet = totalCol - nextColumnCount,
				nextSet = totalCol - targetColumnCount;
			    
			    updateClass(target, targetSet);
			    updateClass(next, nextSet);
			    if ($('.right .tab-content > div.active').attr("id") == "analysis") {
				draw(lineID); // redraw analysis view
			    }
			}
		    });
	    });
	
	
	// IC
	$("#themes").append(" "+query('[add]','Please separate terms with a semi-colon...','themes',$(this).attr('id'), 'Add themes', 'Please provide one or more themes (keywords)', 'ln') );
	$("#genres").append(" "+query('[add]','Please separate terms with a semi-colon...','genres',$(this).attr('id'), 'Add genres', 'Please provide one or more genres (keywords)', 'ln') );
	

	// move all footnotes outside of their parent element to allow for
	// accordion display as divs
	$($("div.note").get().reverse()).each(function() {
		if ( $(this).parent('.l').length ) {     // notes in poem lines
		    $(this).insertAfter($(this).parent().parent());
		} else if ( $(this).parent('div').length ) { // notes outside of <lg>s
		} else {                                     // notes in paratexts
		    $(this).insertAfter($(this).parent());      
		}
	    });


	// add help buttons
	$.each( ["reading","analysis","visualization"
		 //		 ,"modelling"
		] , function( index, item ) {
		$( 'a[href="#' + item + '"]' )
		    .append(" <a class='help-modal' href='#'><span class='glyphicon glyphicon-question-sign' style='vertical-align:text-top'/></a>");
	    });

    
	// generate the image pagination controls for the #image tab
	if ($('#image').length) {
	    $('#image-pagination').twbsPagination({
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
	    // TODO: uncomment and test this when zoomify 5 is released
	    //$('#myImageControls').append(' <button class="btn btn-primary btn-sm" autocomplete="off" id="saveViewLocal"> Download view </button> <button class="btn btn-primary btn-sm" autocomplete="off" id="showView"> Open view </button>');
	}


	// unload non-default stylesheet
	if ($('.right .tab-content > div.active').attr("id") == "reading") {
	    $('link[href="/css/ana.ecep.css"]').prop('disabled', true);
	    $('link[href="/css/viz.ecep.css"]').prop('disabled', true);
	    $('link[href="/css/mod.ecep.css"]').prop('disabled', true);
	} else if ($('.right .tab-content > div.active').attr("id") == "analysis") {
	    $('link[href="/css/viz.ecep.css"]').prop('disabled', true);
	    $('link[href="/css/mod.ecep.css"]').prop('disabled', true);
	}

	// initialize analysis view
	ana_initialize();
	
    }


    // gallery default
    if ($('#myImagePortrait').length) {
	var id = '';
	if (hash) { id = hash.substring(1); }
	else { id = $(".gallery-nav li:first-child a").attr('href').substring(1); }
	$('.gallery-nav li a[href="#' + id + '"]').parent().addClass("active");
	$("#myImagePortrait img").attr({
	    src: src[id],
	    alt: title[id]
	});
	$("#myImageControls p").replaceWith("<p><em>"+title[id]+"</em> / "+desc[id]+"</p>");
    }


    // default IC modal
    IC_modal();

//});


// gallery navigation
$(document.body).on('click', '.gallery-nav a:nth-child(1)' , function(e) {
    $(".gallery-nav li").removeClass("active");
    var id = $(this).attr('href').substring(1); 
    $("#myImagePortrait img").attr({
        src: src[id],
        alt: title[id]
    });
    $("#myImageControls p").replaceWith("<p><em>"+title[id]+"</em> / "+desc[id]+"</p>");
    $(this).parent().addClass("active");
});


// Zoomify save view link
$(document.body).on('mousedown', '#showView' , function(e) {
    Z.Viewport.saveAnnotationsToImageFile(false, true);
});
$(document.body).on('mousedown', '#saveViewLocal' , function(e) {
    Z.Viewport.saveAnnotationsToImageFile(false, false, true);
});


// general purpose IC function, takes query, provides modal etc.
function query (linktext, placeholder, feature, objID, mtitle, ititle, itype) {
    var queryLink = "<a class='cs_query' data-toggle='modal' data-target='#newIC' data-f='"+feature+"' data-objid='"+objID+"' data-d='"+docname+"' data-p='"+placeholder+"' data-mtitle='"+mtitle+"' data-ititle='"+ititle+"' data-itype='"+itype+"' href='#'>"+linktext+" <span class='glyphicon glyphicon-pencil' style='vertical-align:text-top;'/></a>";
    return queryLink;
}

// IC modal skeleton
function IC_modal () {
    $( "body" ).prepend(`
<div id="newIC" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="newModalLabel">
<div class="modal-dialog" role="document">
<div class="modal-content">
<div class="modal-header">
<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
<h4 class="modal-title" id="newModalLabel"></h4>
</div>
<div class="modal-body">
<form id="newNoteForm">
<h5 id="modal-ititle"></h5>`+
add_user());
}

// IC modal customization
$(document.body).on('show.bs.modal', '#newIC', function(e) {
    var trigger = $(e.relatedTarget) // what triggered the modal
    var modal = $(this); // the modal itself
    var ihtml= '';

    modal.find('#newNoteForm').prepend(`
<input type='hidden' name='feature' value='`+trigger.data("f")+`' autocomplete='off'/>
<input type='hidden' name='objectID' value='`+trigger.data("objid")+`' autocomplete='off'/>
<input type='hidden' name='docname' value='`+trigger.data("d")+`' autocomplete='off'/>
`);
    modal.find('.modal-title').text(trigger.data("mtitle"));
    if ( trigger.data("itype") == "ta" ) {
	ihtml = '<textarea style="resize:vertical;" class="form-control" name="comment" id="newNoteText" rows="6" required="required" placeholder="'+trigger.data("p")+'"/>';
    } else if ( trigger.data("itype") == "ln" ) {
	ihtml = '<input class="form-control" name="comment" id="newNoteText" required="required" placeholder="'+trigger.data("p")+'" autocomplete="off"/>';
    }
    modal.find('#modal-ititle').text(trigger.data("ititle")).after(ihtml);
//    modal.find('.modal-body input').val(recipient);
});

// IC user details
function add_user () {
var user_details =
`<h5>Your details (if you wish to be acknowledged)</h5>`+
`<div class="input-group input-group-sm">
<span class="input-group-addon" id="basic-addon1">Name</span>
<input required="required" name="name" type="text" class="form-control" placeholder="real name" aria-describedby="basic-addon1">
</div>
<div class="input-group input-group-sm">
<span class="input-group-addon" id="basic-addon2">E-mail</span>
<input required="required" name="e-mail" type="text" class="form-control" placeholder="valid e-mail address" aria-describedby="basic-addon2">
</div>
<div class="input-group input-group-sm">
<span class="input-group-addon" id="basic-addon3">Affiliation</span>
<input name="affiliation" type="text" class="form-control" placeholder="institution (optional)" aria-describedby="basic-addon3">
</div>
<div class="input-group input-group-sm">
<span class="input-group-addon" id="basic-addon4">Website</span>
<input name="website" type="text" class="form-control" placeholder="Web address (optional)" aria-describedby="basic-addon4">
</div>
</form></div>
<div class="modal-footer">
<p class="small"><em>Please note:</em> this contribution will be submitted to the editor in the first instance for review.  Once peer reviewed, the contribution will be made publicly available under a <a class="external" target="_blank" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons BY-NC-SA License</a>.</p>
<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
<button type="button" class="btn btn-primary" id="newNoteSubmit" >Submit</button>
</div>
</div>
</div>
</div>
`;
return user_details;
}

// remove modals
$(document.body).on('hidden.bs.modal', '#newIC', function(e) { 
    $(this).remove();
    IC_modal();
});
$(document.body).on('hidden.bs.modal', '#newNote,#newHelp', function(e) { 
    $(this).remove();
});


// Authors/Works: toggle visibility...
$(document.body).on('click', 'div.aw-btns button' , function(e) {
    var idno = $(this).attr("id").split(/\-(.+)?/);
    $('div.aw-btns button[id^="'+idno[0]+'"]').removeClass("active");
    $(this).addClass("active");
    if ( idno[1] == "All" ) {
	$('ul[id^="'+idno[0]+'"]').show();
    } else {
	$('ul[id^="'+idno[0]+'"]').hide();
	$('ul[id="'+idno[0]+'-list-'+idno[1]+'"]').show();
    }
});


// Works: toggle themes/genres
$(document.body).on('click', '.browse' , function(e) {
    $( "ul[class='hidden']").hide().removeClass("hidden");
    $(this).next("ul").slideToggle();
});

// Authors: highlight source editions
$('#works .source').hover(function() {
    $('#'+$(this).attr('data-rel')).addClass('highlight');
},function() {
    $('#'+$(this).attr('data-rel')).removeClass('highlight');
});

