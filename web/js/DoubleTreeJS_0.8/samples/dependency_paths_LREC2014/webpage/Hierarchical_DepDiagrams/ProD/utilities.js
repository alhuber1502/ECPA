/**
  * Convert labeled bracketing to JSON structure, where a node is an object with 2 attributes: "name" (the node label) and "children" (an array of the child nodes)
  */
 function bracksToJSON(bracks) {
    var what = bracks.replace(/\[([^[\]]+)/g, '{"name":' + '"$1"' + ', "children":[');
    what = what.replace(/\]/g, "]}");
    what = what.replace(/}{/g, "},{");
    //return what;
    return JSON.parse(what);
 }
 
 /**
 *	Convert a Penn Treebank (lisp) style tree to JSON structure, where a node is an object with 2 attributes: "name" (the node label) and "children" (an array of the child nodes)
 */
 function pennToJSON(penn) {
	var what = penn.replace(/\n\s*/g,' '); //flatten
	
	//( (S (NP Chris) (VP (V left)))))
	what = what.replace(/^\(( \(.+\))$/, '$1'); //strip empty outer ()
	
	// (S (NP Chris) (VP (V left))))
	what = what.replace(/ \((\S+)/g, '{"name":' + '"$1"' + ', "children":['); 

	//{"name":"S", "children":[{"name":"NP", "children":[ Chris){"name":"VP", "children":[{"name":"V", "children":[ left)))))	
	what = what.replace(/"children":\[ ([^)]+)\)/g, '"children":[{"name":"$1","children":[]}]}');

	//{"name":"S", "children":[{"name":"NP", "children":[{"name":"Chris","children":[]}]}{"name":"VP", "children":[{"name":"V", "children":[{"name":"left","children":[]}]}))))	
	what = what.replace(/\)\)/g, ']}');

	//{"name":"S", "children":[{"name":"NP", "children":[{"name":"Chris","children":[]}]}{"name":"VP", "children":[{"name":"V", "children":[{"name":"left","children":[]}]}]}]}
	what = what.replace(/}{/g, "},{");

	//{"name":"S", "children":[{"name":"NP", "children":[{"name":"Chris","children":[]}]},{"name":"VP", "children":[{"name":"V", "children":[{"name":"left","children":[]}]}]}]}
	return JSON.parse(what);
 }