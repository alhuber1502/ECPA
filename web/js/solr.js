// ECPA
// SOLR

var SOLR_ECPA;
if ( /eighteenthcenturypoetry\.org/.test(window.location.href) ) {
  SOLR_ECPA = "https://data.prisms.digital/solr/ecpa/select";
} else {
  SOLR_ECPA = "http://192.168.1.2:8983/solr/ecpa/select";  
}

// clear-text replacements
var repl = {};
repl[ "text:" ] = "full-text";
repl[ "default:" ] = "default fields";
repl[ "document_title:" ] = "work title";
repl[ "author:" ] = "author";

repl[ "author_str" ] = "Authors";
repl[ "languages" ] = "Languages";
repl[ "collection_id_str" ] = "Collections";
repl[ "subjects_str" ] = "Subjects/Genres";
repl[ "PRISMS_dates" ] = "Periods";

repl[ "rhyme_str" ] = "Rhyme Patterns";
repl[ "rhyme_spos_str" ] = "Rhyme Positions";
repl[ "syllab_str" ] = "Syllable Patterns";
repl[ "met_stanzas_str" ] = "Stanza Types";
repl[ "foot_type_str" ] = "Foot Types";
repl[ "foot_number_str" ] = "Foot Numbers";
repl[ "met_str" ] = "Metrical Patterns";
repl[ "met_lines_str" ] = "Metrical Lines";
repl[ "subject_str" ] = "Themes";
repl[ "form_str" ] = "Genres";

repl["eebo-tcp"] = "Early English Books Online (EEBO-TCP)";
repl["ecco-tcp"] = "Eighteenth Century Collections Online (ECCO-TCP)";
repl["evans-tcp"] = "Evans Early American Imprints (EVANS-TCP)";
repl["dta"] = "Deutsches Textarchiv (DTA)";
repl["taylor"] = "Taylor Editions";
repl["folger"] = "The Folger Shakespeare";

repl["alg"] = "Algonquian languages"
repl["ang"] = "English, Old (ca.450-1100)"
repl["chi"] = "Chinese"
repl["dut"] = "Dutch"
repl["eng"] = "English"
repl["fre"] = "French"
repl["fro"] = "French, Old (842-ca.1400)"
repl["frm"] = "French, Middle (ca.1400-1600)"
repl["ger"] = "German"
repl["gla"] = "Gaelic (Scottish Gaelic)"
repl["nai"] = "North American Indian languages"
repl["gle"] = "Irish"
repl["gml"] = "German, Middle Low"
repl["grc"] = "Greek, Ancient (to 1453)"
repl["heb"] = "Hebrew"
repl["ita"] = "Italian"
repl["cat"] = "Catalan (Valencian)"
repl["glg"] = "Galician"
repl["lat"] = "Latin"
repl["mul"] = "Multiple languages"
repl["pau"] = "Palauan"
repl["por"] = "Portuguese"
repl["roa"] = "Romance languages"
repl["sco"] = "Scots"
repl["spa"] = "Spanish (Castilian)"
repl["wel"] = "Welsh"
repl["xno"] = "Anglo-Norman";
repl["zxx"] = "No linguistic content; Not applicable"

repl[ "1301" ] = "14th century";
repl[ "1401" ] = "15th century";
repl[ "1501" ] = "16th century";
repl[ "1601" ] = "17th century";
repl[ "1701" ] = "18th century";
repl[ "1801" ] = "19th century";
repl[ "1901" ] = "20th century";
repl[ "2001" ] = "21st century";

// format facet fields and ranges
function format_filters( filters, base ) {
  output = '';
  for (key in filters.facet_fields) {
    output += `<div class="filter" id="`+key+`"><a class="btn btn-default" role="button" data-toggle="collapse" href="#collapse-`+key+`" aria-expanded="true" aria-controls="collapse-`+key+`">`+repl[ key ]+`</a><div class="collapse in" id="collapse-`+key+`"><ul class="listBibl" style="padding-left:0;">`;
    for ( var i=0; i<filters.facet_fields[ key ].length-1; i+=2 ) {
      if ( filters.facet_fields[key][i+1] > 0 ) {
        var thisfq = `fq=`+key+`:"`+filters.facet_fields[key][i]+`"`;
        var re = new RegExp( thisfq.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace( /\?/g, "\\?").replace( /\(/g, "\\(").replace( /\)/g, "\\)").replace( /\+/g, "\\+"),"g" );
        var reout = '';
        if ( base.search( re ) != -1 ) {
          reout = `<span class="facet_delete"><a class="del_facet" href='`+thisfq.replace(/'/g, '%27').replace( /\+/g, "%2B")+`' data-base='`+base.replace(/'/g, '%27').replace( /\+/g, "%2B")+`&rows=`+per_page+`'>&times;</a> </span>`;
        }
        output += `<li>`+reout+`<span class="facet_label">`+((reout == '')?`<a href='`+base.replace(/'/g, "%27").replace( /\+/g, "%2B")+`&rows=`+per_page+`&start=0&fq=`+key+`:&quot;`+filters.facet_fields[key][i].replace(/'/g, "%27").replace( /\+/g, "%2B")+`&quot;'>`:``)+(repl[ filters.facet_fields[key][i] ]?repl[ filters.facet_fields[key][i] ]:((key=="met_str")?output_met(filters.facet_fields[key][i]):filters.facet_fields[key][i]))+((reout == '')?`</a>`:``)+`</span> <span class="facet_count">`+filters.facet_fields[key][i+1].toLocaleString()+`</span></li>`;
      }
    }
    output += `</ul></div></div>`;
  }
  for (key in filters.facet_ranges) {
    output += `<div class="filter" id="`+key+`"><a class="btn btn-default" role="button" data-toggle="collapse" href="#collapse-`+key+`" aria-expanded="true" aria-controls="collapse-`+key+`">`+repl[ key ]+`</a><div class="collapse in" id="collapse-`+key+`"><ul class="listBibl" style="padding-left:0;">`;
    for ( var i=0; i<filters.facet_ranges[ key ].counts.length-1; i+=2 ) {
      if ( filters.facet_ranges[key].counts[i+1] > 0 ) {
        var thisfq = `fq=`+key+`:[`+filters.facet_ranges[key].counts[i]+` TO `+(parseInt(filters.facet_ranges[key].counts[i])+100-1)+`]`;
        var re = new RegExp( thisfq.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace( /\?/g, "\\?").replace( /\(/g, "\\(").replace( /\)/g, "\\)"),"g" );
        var reout = '';
        if ( base.search( re ) != -1 ) {
          reout = `<span class="facet_delete"><a class="del_facet" href='`+thisfq.replace(/'/g, '%27')+`' data-base='`+base.replace(/'/g, '%27')+`&rows=`+per_page+`'>&times;</a> </span>`;
        }
        output += `<li>`+reout+`<span class="facet_label">`+((reout == '')?`<a href='`+base.replace(/'/g, '%27')+`&rows=`+per_page+`&start=0&fq=`+key+`:[`+filters.facet_ranges[key].counts[i]+` TO `+(parseInt(filters.facet_ranges[key].counts[i])+100-1)+`]'>`:``)+repl[ filters.facet_ranges[key].counts[i] ]+((reout == '')?`</a>`:``)+`</span> <span class="facet_count"> `+filters.facet_ranges[key].counts[i+1].toLocaleString()+`</span></li>`;
      }
    }
    output += `</ul></div></div>`;
  }
  return output;
}

// handle filters, results per page and sorting
$( document.body ).on( 'click', '#filters_main a:not([role]), #per_page_btn .dropdown-menu a, #sorting .dropdown-menu a', async function(e) {
  e.preventDefault();
  await makeQuery( $(e.currentTarget).attr('href').replace(/(&start=\d+)/i, '') );
});
// handle removing filters
$( document.body ).on( 'click', '#filters_main a.del_facet', async function(e) {
  e.preventDefault();
  var re = $(e.currentTarget).attr('href');
  await makeQuery( $(e.currentTarget).data('base').replace( re, '') );
});
// handle author links
$( document.body ).on( 'click', '#results_main a.aut_link', async function(e) {
  e.preventDefault();
  $( "#simsearch input[name='q']" ).val( $(e.currentTarget).attr('data-aut') );
  await makeQuery( $(e.currentTarget).attr('href') );
});

// format results section
async function format_results( docs, base, highlights ) {
    // check workbench for items
    var output = `<ol start="`+parseInt(docs.start+1)+`">`;//, my_bookmarks;
    // check bookmarks for items
    /*
    var q = namespaces+"SELECT * WHERE { GRAPH "+user+" { ?s ?p prisms:Bookmark . ?s dcterm:identifier ?o . BIND ( "+user+" AS ?g ) } }";
    var records = await getJSONLD( q );
    if ( records.graph ) {
      my_bookmarks = Array.from( records.graph, a => a["rdf:type"] );
    }
    */
    for (var j = 0; j < docs.docs.length; j++ ) {
      var v = docs.docs[ j ];
      var unique_document_title;
      output += `<li>`;
      /*
      output += `<div style="display:table-cell;"><a href="#`+v.document_id+`" class="add_object_wb" data-jump="true"><img src="`+domain+"/images/editions/thumbs/"+v.document_id+"_thumb.jpeg"+`" alt=""/></a></div>`;
      */
      output += `<div style="display:table-cell;" class="item-desc">`;
      if (v.document_title) {
        unique_document_title = v.document_title.filter(function(itm, i, a) {
          return i == v.document_title.indexOf(itm);
        });
      } else {
        console.log( v );
      }
      output += `<h3><a href="/works/`+v.id+`.shtml">`+truncateString(unique_document_title[0],400)+`</a> <a 
      class="add_bm" id="`+v.id+`" href="#"><span class="glyphicon glyphicon-bookmark"></span></a></h3>`;
      output += `<div><span>First/Last Lines:</span> `+v.incipit+` / `+v.explicit+`</div>`;
      if ( v.author ) {
        output += `<div><span>`+((v.author.length > 1)?`Authors`:`Author`)+`:</span> `;
        var vautlen = v.author.length;
        $.each( v.author, function(i,v2) {
          output += `<a href="/authors/`+v.author_id[i]+`.shtml">`+v2+`</a>`;
          if ( i != (vautlen - 1) ) { output += "; "; }
        });
        output +=  `</div>`;
      }

      if (v.subject) {
        var sublen = v.subject.length;
        output += `<div><span>Themes:</span> `;
        $.each( v.subject, function(i,v) { 
          output += v;
          if (i === sublen - 1) {}
          else { output += ", "; }
        });
        output += `</div>`;
      }
      if (v.form) {
        var forlen = v.form.length;
        output += `<div><span>Genres:</span> `;
        $.each( v.form, function(i,v) { 
          output += v;
          if (i === forlen - 1) {}
          else { output += ", "; }
        });
        output += `</div>`;
      }

      if ( highlights && highlights[ v.id ].text && highlights[ v.id ].text.length > 0 ) {
        output += `<div class="snippets"><span>Text passages (max. 10 in 2 columns):</span><ul class="listBibl" style="column-count:2; column-gap:40px; column-width:450px; column-rule: 1px #ddd solid;"> `;
        $.each( highlights[ v.id ].text, function( i,v ) {
          output += `<li>. . .`+v.replace(/(?:\r\n|\r|\n)/g, '<br>')+`. . .</li>`;
        });
        output += `</ul></div>`;
      };
      /*
      output += `<div class="item-tools">
      <ul>
        <li><a href="#`+v.document_id+`" class="details_object"><i class="fas fa-info-circle"></i> Details<span /></a></li>`;
        if ( my_bookmarks && my_bookmarks.includes( domain+"/item/"+v.document_id ) ) {
          output += `<li><a href="#`+v.document_id+`" title="Remove this edition from your bookmarks" data-title="`+truncateString(unique_document_title[0],400)+trans+`" class="remove_bookmark"><i class="fas fa-bookmark"></i> Remove bookmark<span /></a></li>`;
        } else {
          output += `<li><a href="#`+v.document_id+`" title="Add this edition to your bookmarks" data-title="`+truncateString(unique_document_title[0],400)+trans+`" class="bookmark_object"><i class="fas fa-bookmark"></i> Bookmark<span /></a></li>`;
        }
        output += (($("#cy").length == 0)?`<li><a href="#`+v.document_id+`" title="View a graph representation of this edition" data-title="`+truncateString(unique_document_title[0],400)+trans+`" class="graph_object"><i class="fas fa-project-diagram"></i> Graph preview<span /></a> </li>`:``);
        if ( ids && ids.includes( v.document_id[0] ) ) {
          output += `<li><a href="#`+v.document_id+`" title="Remove this edition from your workbench" class="rem_object_wb"><i class="fas fa-times-circle"></i> Remove from workbench</a></li>`;
        } else {
          output += `<li><a href="#`+v.document_id+`" title="Add this edition to your workbench" class="add_object_wb"><i class="fas fa-plus-circle"></i> Add to workbench</a></li>`;
        }
      output += `
      </ul>
      </div>
      */
      output += `</div></li>`;
    }
  output += `</ol>`;
  return output;
}

// produce results page
async function makeResults( result ) {
  var result_header = result.responseHeader;
  var result_body = result.response;
  var facets = result.facet_counts;
  var highlights = result.highlighting;
  // format query base
  var base = '';
  for ( key in result_header.params ) {
    if ( result_header.params[ key ] instanceof Array ) {
      for( i in result_header.params[ key ] ) {
        base += `&`+key+`=`+result_header.params[ key ][i];  
      }
    } else {
      base += `&`+key+`=`+result_header.params[ key ];
    }
  }
  per_page = result_header.params["rows"] || 25;
  base = base.replace(/(&rows=\d+)/i, '');
  switch ( result_header.params["sort"] ) {
      case "score desc":
        sorting = "relevance";
        break;
      case "document_title_str asc":
        sorting = "title";
        break;
  }
  base = base.replace(/&sort=.*?&/i, '&');
  // format results/filters
  $( "#per_page" ).html( `
    <!-- Single button -->
    <div class="btn-group" id="per_page_btn">
      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        `+per_page+` per page <span class="caret"></span>
      </button>
      <ul class="dropdown-menu" style="padding-left:15px;">
        <li><a href='`+base+`&sort=`+result_header.params["sort"]+`&rows=10'>10</a></li>
        <li><a href='`+base+`&sort=`+result_header.params["sort"]+`&rows=25'>25</a></li>
        <li><a href='`+base+`&sort=`+result_header.params["sort"]+`&rows=50'>50</a></li>
        <li><a href='`+base+`&sort=`+result_header.params["sort"]+`&rows=100'>100</a></li>
      </ul>
    </div>
  `);
  $( "#sorting" ).html( `
    <!-- Single button -->
    <div class="btn-group" id="sorting_btn">
      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Sort by `+sorting+` <span class="caret"></span>
      </button>
      <ul class="dropdown-menu" style="text-align:right; padding-right:15px;">
        <li><a href='`+base+`&rows=`+per_page+`&sort=document_title_str asc'>title</a></li>
        <li><a href='`+base+`&rows=`+per_page+`&sort=score desc'>relevance</a></li>
      </ul>
    </div>
  `);
  if ( result_body.numFound > -1 ) {
    $( "#results_main" ).html( await format_results( result_body, base, highlights ) );
    if ( facets) { $( "#filters_main" ).html( format_filters( facets, base ) ); }
    $( "#spinner" ).remove();
    $('html, body, .modal-body').scrollTop(0,0);
    var tp;
    if ( result_body.numFound > per_page ) {
      if ( result_body.numFound % per_page > 0 ) {
        tp = parseInt(result_body.numFound/per_page)+1;
      } else {
        tp = result_body.numFound/per_page;
      }
    } else {
      tp = 1;
      startPage = 1;
    }
    if ( result_body.start == 0 ) {
      startPage = 1;
    }
    if ( $('#results .sync-pagination').data("twbs-pagination") ) {
      $('#results .sync-pagination').twbsPagination('destroy');
    }
    $('#results .sync-pagination').twbsPagination({
      totalPages: tp,
      visiblePages: 5,
      startPage: startPage,
      first: '&laquo;',
      prev: '&lsaquo;',
      next: '&rsaquo;',
      last: '&raquo;',
      pageClass: 'page-item',
      onPageClick: async function (evt, page) {
        startPage = page;
        base = base.replace(/(&start=\d+)/i, '');
        await makeQuery( base+"&start="+(page-1)*per_page+"&rows="+per_page+`&sort=`+result_header.params["sort"] );
      }
    });
  } else {
    // offer search bar
    $( "#spinner" ).remove();
  }
  $('html, body, .modal-body').scrollTop(0,0);
}

// submit a SOLR query
function makeQuery( query ) {
  return new Promise(function(resolve, reject) {
    if ( query.search( /&sort=/ ) == -1 ) {
      query += `&sort=document_title_str asc`;
    }
    backup_query = query;
    $( "#main,#tabCorpusSearch" ).append( "<div id='spinner'><img style='width:48px; height:48px;' src='/images/loader.gif'/></div>" );
    $.ajax(
      SOLR_ECPA+"?"+query
    ).done(function( result ) {
      makeResults( result );
      $( "#results_header h2" ).html( result.response.numFound.toLocaleString()+" results" );
    }).fail(function( error ) {
      $( "#spinner" ).remove();
      $( "#results_header h2" ).html( "0 results" );
      $( "#results_main" ).html( `<p style="margin:10px 0 15px 0;"><em>Please note:</em> There was a problem parsing your query.</p>` );
      console.log( error );
    });
  })
}

var startPage = 1, per_page = 25, sorting = 'title', backup_query = '';
// format query and submit
$( document.body ).on( 'submit', '#advsearch,#simsearch,#newSearch .simple_search', function(e) {
  e.preventDefault();
  var _this = this;
  var qvalues = [];
  var array = $( this ).serializeArray();
  var data = getFormData( $( this ) );
  var op = array.shift().value; // q.op
  // transform simple to advanced search
  if ( data.search_field ) {
    var search = { };
    search = { name: data.search_field, value: data.q };
    array.length = 0;
    array.push( search );
  }
  $.each( array, function(i, field) {
    if ( field.value != '' ) {
      var tvalues = [];
      var regex = /[\(+-]?"[^"]+"[\)]?|[^\s]+/g; // preserve phrases
      terms = field.value.match(regex).map(e => e.replace(/"(.+)"/, "$1"));
      $.each( terms, function (i,v) {
        if ( v == "AND" || v == "OR" || v == "NOT" || v == "(" || v == ")" ) {
          tvalues.push( v );
        } else {
          var res = '';
          if ( v.substring(0,1) == "(" ) {
            tvalues.push( v.slice( 0,1 ) );
            v = v.slice( 1 );
          }
          if ( v.substring(v.length-1) == ")" ) {
            res = v.slice( -1 );
            v = v.slice( 0,-1 );
          }
          if ( field.name == "PRISMS_dates" && field.value.match( /[-–]/ ) && field.value.split( /[-–]/ ).length == 2 && field.value.split( /[-–]/ )[0] != '' ) {
            tvalues.push( field.name+":["+field.value.split( /[-–]/ )[0] + " TO " +field.value.split( /[-–]/ )[1] + "]" );
          } else if ( v.substring(0,1) == "+" || v.substring(0,1) == "-") {
            if ( field.name == "PRISMS_dates" || field.name == "document_id" ) {
              tvalues.push( v.substring(0,1)+field.name+":"+((/\s/.test( v.substring(1)))?`"`+v.substring(1).replace(/\&/g,"\\\\&")+`"`:v.substring(1).replace(/\&/g,"\\\\&")) );
            } else {
              tvalues.push( v.substring(0,1)+field.name+":"+((/\s/.test( v.substring(1)))?`"`+v.substring(1).replace(/\&/g,"\\\\&")+`"`:v.substring(1).replace(/\&/g,"\\\\&"))
                +(($("input[name='fuzzy']:checked")[0])?`~1`:``)
              );
            }
          } else {
            if ( field.name == "PRISMS_dates" || field.name == "document_id" ) {
              tvalues.push( field.name+":"+((/\s/.test( v ))?`"`+v.replace(/\&/g,"\\\\&")+`"`:v.replace(/\&/g,"\\\\&")) );
            } else {
              tvalues.push( field.name+":"+((/\s/.test( v ))?`"`+v.replace(/\&/g,"\\\\&")+`"`:v.replace(/\&/g,"\\\\&")) 
                +(($("input[name='fuzzy']:checked")[0])?`~1`:``)
              );
            }
          }
          if ( res != '' ) {
            tvalues.push( res);
          }
        }
      });
      qvalues.push( tvalues.join( " " ) );
    }
  });
  var qs = "/search/?q.op="+op+"&q="+qvalues.join( " " );
  if ( qs != "/search/?q.op="+op+"&q=" ) {
    if ( $( _this ).attr( "id" ) == "advsearch" || window.location.pathname == '/' ) {
      document.location = qs;
    } else {
      makeQuery( 
        `facet.field=author_str&facet.field=subject_str&facet.field=form_str&facet.field=rhyme_str&facet.field=rhyme_spos_str&facet.field=syllab_str&facet.field=met_stanzas_str&facet.field=foot_type_str&facet.field=foot_number_str&facet.field=met_str&facet.field=met_lines_str&facet.missing=false&facet=on&q.op=`+op+`&q=`+qvalues.join( " " )+`&sort=score desc&rows=`+per_page+`&hl=on&hl.fragsize=50&hl.fl=text&hl.snippets=10&hl.encoder=html&hl.simple.pre=<span>&hl.simple.post=</span>&hl.requireFieldMatch=true`  
        //`facet.field=author_str&facet.field=languages&facet.field=subjects_str&facet.field=collection_id_str&facet.range=PRISMS_dates&f.PRISMS_dates.facet.range.start=1301&f.PRISMS_dates.facet.range.end=2100&f.PRISMS_dates.facet.range.gap=100&facet=on&q.op=`+op+`&q=`+qvalues.join( " " )+`&sort=score desc&hl=on&hl.fl=text&hl.snippets=5&hl.encoder=html&hl.simple.pre=<span>&hl.simple.post=</span>&hl.requireFieldMatch=true` 
      );
    }
  } else {
    // display alert on advanced search otherwise ignore submit
    if ( !$( "#advsearch .alert" ).length ) {
      $( "#advsearch" ).prepend( `
        <div class="alert alert-warning alert-dismissible" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <strong>No search terms!</strong> Please enter a search query to continue. 
        </div>`);
    }
  } 
});

// truncate a string                             
function truncateString(str, num) {
  if ( str ) {
      if (str.length <= num) {
              return str;
          }
          return str.slice(0, num) + '...';
  } else return '';
}

// serialize form data to object
function getFormData($form){
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};
  $.map(unindexed_array, function(n, i){
      indexed_array[n['name']] = n['value'];
  });
  return indexed_array;
}
