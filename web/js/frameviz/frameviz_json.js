
function receivedFrameJSON(sentence,debug_info,sentnum) { // -AH- added sentnum to function to include sentence number
	//var pageurl = location.protocol+'//'+location.host+location.pathname+'?sentence='+escape($('#sentence').val());
	//history.pushState(sentence, document.title, pageurl);
	$('#parse_horiz').append(buildSentence(sentence,'sent',sentnum)); // -AH- sentnum added
	/* Frameviz */
	$('#parse_horiz .sentence .frameann:not(.targets) td:not(.filler)').hover(function() {
		var thisClass = " "+$(this).attr("class")+" ";
		var aId = thisClass.match(/ a(\d+) /)[1];
		$(this).parent().parent().find('td:not(.a'+aId+')').fadeTo(0, 0.25);
		if ($(this).filter('.arg').length) {
		    var ww = thisClass.match(/ fullspan(\d+)[:](\d+) /);// in case an arg is split in pieces
		    if (ww===null)
			ww = thisClass.match(/ w(\d+)[:](\d+) /);
		    for (var i=Number(ww[1])-1; i<Number(ww[2])-1; i++)
			$(this).parent().parent().find('.word.w'+i).addClass("hoveredarg");
		}
	  }, function() {
		$(this).parent().parent().find('td').fadeTo(0, 1.0);
		$(this).parent().parent().find('.word').removeClass("hoveredarg");
	  });
	$('#parse_horiz .sentence .frameann.targets td.framename').css({"cursor": 'pointer'}).click(function () {
		// navigate to frame page on FrameNet website
		window.open('https://framenet2.icsi.berkeley.edu/fnReports/data/frame/'+escape($(this).text())+'.xml');
	});
	$('#parse_horiz .sentence .frameann.targets td.framename').hover(function() {
		var thisId = $(this).attr("id");
		var aId = thisId.substring(thisId.lastIndexOf("a")+1);
		$(this).parent().parent().find("tr.frameann > td:not(.a"+aId+")").fadeTo(0, 0.25);
	  }, function() {
		$(this).parent().parent().find("tr.frameann > td").fadeTo(0, 1.0);
	  });
}

/*	// does SEMAFOR ever predict discontinuous FEs or targets? apparently not
	sema.forEach(function (sem, i) {
	sem["frames"].forEach(function (frame, j) {
	frame["annotationSets"][0]["frameElements"].forEach(function (fe, k) {
	if (fe["spans"].length>1)
	console.log(i+' '+j+' '+k);
	});
	});
	});
	console.log(sema[0]);
*/
