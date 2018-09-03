(function(){
    var tour = new Tour({
	    storage: false,
	    duration: 11000,
	    onEnd: function(tour) {
		document.location.href = "/";
	    }
	});

    tour.addSteps([
		   {
		       orphan: true,
			   backdrop: true,
			   title: "1. Welcome to the ECPA core features tour!",
			   content: "<p>This is a <b>10-step (2-min.) quick tour</b> of the core features on any of the <b>poem pages</b> in the Eighteenth-Century Poetry Archive (ECPA).</p> <p>At the centre of any poem page is a <b>split screen</b> with the <i>text and primary source materials</i> on the <b>left</b> and the <i>secondary materials</i> on the <b>right</b>.</p>"
		   },
                   {
                       element: ".left .nav-tabs",
			   backdrop: true,
			   placement: "bottom",
			   title: "2. Primary source materials on the left hand side",
			   content: "<p>Switch between the <b>tabs</b> on the <i>left hand</i> side to access the <b>text</b>, digital <b>images</b> of the source edition (where available), the underlying <b>TEI/XML encoding</b>, and all the source files for <b>download</b>.</p>"
		   },
                   {
                       element: ".right .nav-tabs",
			   backdrop: true,
			   placement: "bottom",
			   title: "3. Secondary materials on the right hand side",
			   content: "<p>Switch between the <b>tabs</b> on the <i>right hand</i> side to access <b>different views</b>, reflecting different <i>modes of engagement</i> with the text. Each <b>view</b> has a distinct <b>set of functions</b> accessed through <b>distinct interactions</b> (e.g. hovering, clicking, scrolling, dragging).</p>"
		   },
                   {
		       element: "#reading",
			   backdrop: true,
			   placement: "left",
			   title: "4. Reading view with contextual background information",
			   content: "<p>The default view on the <b>right</b> is the <i>Reading</i> view, which provides a set of <b>bibliographic metadata</b>, a brief summary of <b>poetic form</b>, information about the <b>source edition</b>, an <b>editorial statement</b>, and other <b>contextualizing information</b>, as well as a <i>reading aid function</i> (see next step).</p>",
			   onShow: function(tour){
			   $('.nav-tabs a[href="#reading"]').trigger('click');
			   $('.nav-tabs a[href="#text"]').trigger('click');
		       }
		   },
		   {
		       orphan: true,
			   backdrop: true,
			   title: "5. Reading view with reading aid function",
			   content: "<p>When <b>hovering over</b> any word/token on the <b>left</b>, a set of <b>word properties</b> is displayed, including <i>standardized spelling</i>, <i>lemma</i>, <i>part of speech</i>, <i>word class</i>, and <i>pronunciation</i> according to the International Phonetic Alphabet (IPA). Also <b>identical words and lemmas</b> are highlighted throughout the poem.</p>",
			   onShown: function(tour){
			   $("#o5152-243970").trigger("mouseenter");
			   $(".popover").css( "opacity", "1" );
			   $(".popover").css( "z-index", "1101" );
		       },
			   onHidden: function(tour){
			   $("#o5152-243970").trigger("mouseleave");
			   $("#o5152-243970").popover("hide");
		       }
		   },
                   {
                       element: ".right .nav-tabs .active",
			   backdrop: true,
			   placement: "bottom",
			   title: "6. Analysis view with results of a computationally-assisted reading",
			   content: "<p>The <i>Analysis</i> view (accessed via the second tab on the <b>right</b>) comprises results from a number of <b>computationally-assisted analytical processes</b> on five core linguistic levels and hence a means of assisting the reader in the task of <b>close reading</b> a poem.</p>",
			   onShow: function(tour){
			   $('.nav-tabs a[href="#analysis"]').trigger('click');
		       },
			   onPrev: function(tour) {
			   $('.nav-tabs a[href="#reading"]').trigger('click');
		       }
		   },
                   {
                       element: "#analysis",
			   backdrop: true,
			   placement:"left",
			   title: "7. Analytical results for any line of the poem",
			   content:"<p>Initially, the <b>results</b> of an analysis on <i>phonological</i>, <i>morphological</i>, <i>syntactic</i>, <i>semantic</i>, and <i>pragmatic</i> levels for the <b>first line</b> of a poem are displayed on the <b>right hand</b> side.  The display is <b>updated dynamically</b> when <b>hovering over</b> any line of a poem.</p>",
			   onNext: function(tour) {
			   $('#o5152-l12555').trigger('mouseenter');
		       }
		       
		   },
                   {
		       orphan: true,
			   backdrop: true,
			   title: "8. Analysis view with integrated analytical results",
			   content:"<p>When <b>hovering over</b> any word/token on the <b>left</b>, an <b>integrated view</b> of all analytical layers for this word/token is displayed. The <b>analytical results</b> for the whole line are automatically updated on the <b>right hand</b> side.</p>",
			   onShow: function(tour){
			   $("#o5152-243280").trigger("mouseenter");
			   $(".popover").css( "opacity", "1" );
			   $(".popover").css( "z-index", "1101" );
		       },
			   onHidden: function(tour){
			   $("#o5152-243280").trigger("mouseleave");
			   $("#o5152-243280").popover("hide");
		       },
			   onPrev: function(tour) {
			   $('#o5152-l12515').trigger('mouseenter');
		       }
		   },
		   {
		       orphan: true,
			   backdrop: true,
			   title: "9. Contributions to the Eighteenth-Century Poetry Archive",
		           content: "<p>ECPA is conceived as a collaborative initiative. At any point, <b>clicking on</b> a line or word/token on the <b>left</b> will bring up a <b>contribution form</b> for your notes, glosses, suggestions, corrections, readings and interpretations. Your <b>contributions</b> are welcome and we <i>thank you</i> for them in advance!</p>",
			   onShown: function(tour){
			   $("#o5152-l12530").trigger("mouseenter");
			   $("#o5152-242980").trigger("click");
			   $(".popover").css( "opacity", "1" );
		       },
			   onHide: function(tour){
			   $("#newNote").modal("hide");
		       }
		   },
		   {
		       orphan: true,
			   backdrop: true,
			   title: "10. Thank you for taking the tour!",
			   content: function(tour) { return "<p>We hope you found the <b>tour</b> useful. Please do not hesitate to <b>contact us</b> if you have any <i>questions</i> or <i>suggestions</i>.  We would love to hear your thoughts, ideas for collaborations or projects, or recommendations for additions and improvements. <b>Thank you!</b></p>" }
		   }
		   
		   ]);

    tour.init();
    tour.start();

}());
