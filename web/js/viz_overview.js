// Visualization Home

// Intro
$( '#visualization' ).html( `<div id='viz_overview'/>` );
$( '#viz_overview' ).append( `<h1 class='info'>Original and adapted visualizations</h1>` );

// Available visualizations
$( '#viz_overview' ).append( `<p style='padding-bottom:15px;'>Please choose from the <b>available visualizations</b> for this poem:</p><div id='viz_avail'>` );

$( '#viz_avail' ).append( `<ul id="list_avail" style="display:inline-block;list-style:none;vertical-align:top;">` );
// Phonemia
$( '#list_avail' ).append( `<li id='viz_phonemia' style="margin-bottom:10px;"/>` );
$( '#viz_phonemia' ).load( "/works/viz_phonemia.shtml" );
// Poem Viewer
if (isProse == 0) {
    $( '#list_avail' ).append( `<li id='viz_poemvis' style="margin-bottom:10px;"/>` );
    $( '#viz_poemvis' ).load( "/works/viz_poemvis.shtml"  );
}
// DoubleTree
$( '#list_avail' ).append( `<li id='viz_dtreejs' style="margin-bottom:10px;"/>` );
$( '#viz_dtreejs' ).load( "/works/viz_dtreejs.shtml"  );

// External visualizations
$( '#viz_avail' ).append(`</ul><div class="viz_external">

<h2>Externally hosted visualizations</h2>

  <ul style="display:inline-block;list-style:none;vertical-align:top;">
    <!-- Voyant -->
    <li>
      <a data-toggle="collapse" href="#collapseEOne" aria-expanded="false"
         aria-controls="collapseEOne">Voyant Tools</a> / 
	<span>Sinclair, Stéfan and Geoffrey Rockwell. <em>Voyant Tools.</em> 2016. Web. 20 Mar. 2019. &lt;http://voyant-tools.org/&gt;</span>
      <div class="collapse" id="collapseEOne">
        <div class="well">
	<a href="https://voyant-tools.org/?input=https://www.eighteenthcenturypoetry.org/works/`+docname+`/`+docname+`.txt" target="_blank" class="external">Launch Voyant Tools</a><br/>
	<p><em>Instructions: </em> Just follow the above link to use Voyant Tools with this poem.</p>
	<p><em>Description: </em> Voyant Tools is a web-based text reading and analysis environment. It is a scholarly project that is designed to facilitate reading and interpretive practices for digital humanities students and scholars as well as for the general public.</p>
        </div>
      </div>
    </li>
    <!-- CATMA -->
    <li>
      <a data-toggle="collapse" href="#collapseETwo" aria-expanded="false"
        aria-controls="collapseETwo">CATMA (Computer Assisted Text Markup and Analysis)</a> / 
			 <span>Meister, J.C.; Petris, M.; Gius, E.; Jacke, J. <em>CATMA 5.0</em>. 2016. Web. 20 Mar. 2019. &lt;http://www.catma.de&gt;</span>
      <div class="collapse" id="collapseETwo">
        <div class="well">
	<a href="http://portal.catma.de/catma/" target="_blank" class="external">Visit CATMA</a><br/>
	<p><em>Instructions: </em> Copy the link address of <a href="https://www.eighteenthcenturypoetry.org/works/`+docname+`/`+docname+`.txt">this link</a>. Visit CATMA and sign up for a free account. Click <em>Add document</em> and paste the link address. Click <em>Next</em> until you <em>Finish</em> the process.  Find the added document and click <em>Open document</em>. </p>
			 <p><em>Description: </em> CATMA (Computer Assisted Text Markup and Analysis) is a practical and intuitive tool for text researchers. In CATMA users can combine the hermeneutic, ‘undogmatic’ and the digital, taxonomy based approach to text and corpora, as a single researcher, or in real-time collaboration with other team members.</p>
        </div>
      </div>
    </li>
    <!-- textometrica -->
    <li>
      <a data-toggle="collapse" href="#collapseEThree" aria-expanded="false"
        aria-controls="collapseEThree">Textometrica</a> / 
			 <span>Lindgren, S. and F. Palm. <em>Textometrica Service Package</em>. 2012. Web. 20 Mar. 2019.
			 &lt;http://textometrica.humlab.umu.se&gt;</span>
      <div class="collapse" id="collapseEThree">
        <div class="well">
	<a href="http://textometrica.humlab.umu.se/" target="_blank" class="external">Visit Textometrica</a><br/>
	<p><em>Instructions: </em> Save <a href="https://www.eighteenthcenturypoetry.org/works/`+docname+`/`+docname+`.txt">this link</a> as a file to your machine. Visit Textometrica and upload the file. Follow the instructions provided. </p>
			 <p><em>Description: </em> Textometrica is a tool for Connected Concept Analysis (CCA),  a framework for text analysis which ties qualitative and quantitative considerations together in one unified model. Even though CCA can be used to map and analyze any full text dataset, of any size, the method was created specifically for taking the sensibilities of qualitative discourse analysis into the age of the Internet and big data.  </p>
        </div>
      </div>
    </li>
    <!-- Lexos -->
    <li>
      <a data-toggle="collapse" href="#collapseEFour" aria-expanded="false"
        aria-controls="collapseEFour">Lexos</a> /
			 <span>Kleinman, S., LeBlanc, M.D., Drout, M., and Zhang, C.  <em>Lexos v3.2.0.</em> 2018. Web. 20 Mar. 2019. &lt;http://lexos.wheatoncollege.edu/&gt;</span>
      <div class="collapse" id="collapseEFour">
        <div class="well">
	<a href="http://lexos.wheatoncollege.edu/upload" target="_blank" class="external">Visit Lexos</a><br/>
	<p><em>Instructions: </em> Save <a href="https://www.eighteenthcenturypoetry.org/works/`+docname+`/`+docname+`.txt">this link</a> as a file to your machine. Visit Lexos and upload the file. Follow the workflow. </p>
			 <p><em>Description: </em> Lexos is a web-based tool to help you explore your favorite corpus of digitized texts. Our primary motivation is to help you find the explorer spirit as you apply computational and statistical probes to your favorite collection of texts. Lexos provides a workflow of effective practices so you are mindful of the many decisions made in your experimental methods. </p>
        </div>
      </div>
    </li>
    <!-- Weblicht -->
    <li>
      <a data-toggle="collapse" href="#collapseEFive" aria-expanded="false"
        aria-controls="collapseEFive">WebLicht</a> /
			 <span>
			 CLARIN-D/SfS-Uni. <em>WebLicht: Web-Based Linguistic Chaining Tool.</em> Tübingen, 2012. Web. 20 Mar. 2019. &lt;https://weblicht.sfs.uni-tuebingen.de/&gt;
</span>
      <div class="collapse" id="collapseEFive">
        <div class="well">
	<a href="https://weblicht.sfs.uni-tuebingen.de/" target="_blank" class="external">Visit WebLicht</a><br/>
			 <p><em>Instructions: </em> Save <a href="https://www.eighteenthcenturypoetry.org/works/`+docname+`/`+docname+`.txt">this link</a> as a file to your machine. Visit WebLicht and request an account or sign in from an EU institutional account. Click <em>Start</em> and upload the file. Follow the instructions for building tool chains. </p>
			 <p><em>Description: </em> WebLicht is an execution environment for automatic annotation of text corpora. Linguistic tools such as tokenizers, part of speech taggers, and parsers are encapsulated as web services, which can be combined by the user into custom processing chains. The resulting annotations can then be visualized in an appropriate way, such as in a table or tree format.
			 Many of the tools incorporated into WebLicht have existed as command-line or desktop tools for many years and are well know within the linguistic community. Others have been developed specifically for use with WebLicht. By making these tools available on the web and by use of a common data format for storing the annotations, WebLicht provides a way to combine them into processing chains. </p>
        </div>
      </div>
    </li>
    <!-- CAFETIERE -->
    <li>
      <a data-toggle="collapse" href="#collapseESix" aria-expanded="false"
			 aria-controls="collapseESix">Cafeti&egrave;re</a> /
			 <span>NaCTeM. <em>Cafeti&egrave;re</em>. The National Centre for Text Mining, University of Manchester, 2016. Web. 20 Mar. 2019. &lt;http://www.nactem.ac.uk/cafetiere/&gt;

</span>
      <div class="collapse" id="collapseESix">
        <div class="well">
			 <a href="http://www.nactem.ac.uk/cafetiere/" target="_blank" class="external">Visit Cafeti&egrave;re</a><br/>
			 <p><em>Instructions: </em> Save <a href="https://www.eighteenthcenturypoetry.org/works/`+docname+`/`+docname+`.txt">this link</a> as a file to your machine. Visit Cafeti&egrave;re and upload the file. Follow the instructions for starting text-mining. </p>
			 <p><em>Description: </em> Cafeti&egrave;re is an easy-to-use text mining system for carrying out text mining on your own document collection.</p>

        </div>
      </div>
    </li>
    
  </ul>

			 <p class="alert alert-info" role="alert" style="margin-top:15px;">Please <a href="mailto:huber@eighteenthcenturypoetry.org" class="alert-link">let us know</a> about any other visualization tools you would like to use, and we may be able to either include them as an adapted visualization or provide a custom version of our texts, if required.</p>
			 </div>`);
