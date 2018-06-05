$( document ).ready( function() {
    twitterCheck = setInterval( function() {
        var twitterFrame = $("#twitter-widget-0"); 
        var twitterTimelineHeader = twitterFrame.contents().find(".timeline-Header");
        var twitterTimelineAuthor = twitterFrame.contents().find(".TweetAuthor-name");
        var twitterTimelineText = twitterFrame.contents().find(".timeline-Tweet-text");
	if ( twitterFrame.length && twitterTimelineHeader.length ) {
	    twitterFrame.attr("style","width: 100%; height: 600px;");
            twitterTimelineHeader.attr("style","display: none;");
            twitterTimelineAuthor.attr("style","font-weight: normal; font-size: 18px; line-height: 27px;");
            twitterTimelineText.attr("style","font-size: 14px; line-height: 1.5em; font-family: 'Open Sans',Helvetica,Arial,sans-serif;");
            clearInterval(twitterCheck);
        }
    }, 50);
});
