// Visualization Home

// Intro
$( '#visualization' ).html( "<div id='viz_overview'><div id='viz_intro'/></div>" );
//$( '#viz_intro' ).load( "/help/viz_intro.shtml" );
$( '#viz_intro' ).append( "<h1 class='info'>Available visualizations</h1>" );
// Available visualizations
$( '#viz_intro' ).after( "<p>Please choose from the <b>available visualizations</b> for this poem:</p><div id='viz_avail'><div id='viz_phonemia'/></div>" );
$( '#viz_phonemia' ).load( "/works/viz_phonemia.shtml" );
if (!isProse) {
    $( '#viz_phonemia' ).after( "<hr/><div id='viz_poemvis'/>" );
    $( '#viz_poemvis' ).load( "/works/viz_poemvis.shtml"  );
}
