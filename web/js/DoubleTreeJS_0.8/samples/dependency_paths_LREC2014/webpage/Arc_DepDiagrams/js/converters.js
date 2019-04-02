/* (This is the new BSD license.)
* Copyright (c) 2011, Europaeische Akademie Bozen/Accademia Europea Bolzano
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of the Europaeische Akademie Bozen/Accademia Europea 
*	Bolzano nor the of its contributors may be used to endorse or promote 
*	products from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY Europaeische Akademie Bozen/Accademia Europea
* Bolzano``AS IS'' AND ANY OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
* THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
* ARE DISCLAIMED. IN NO EVENT SHALL Europaeische Akademie Bozen/Accademia Europea
* Bolzano BE LIABLE FOR ANY, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
* CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE 
* GOODS OR SERVICES; OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
* CAUSED AND ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
* TORT INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF 
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/* Author(s): Chris Culy */
/* Copyright 2011 Accademia Europea Bolzano */
/* Original: 20110208 */
/* Revised: 20110606 */
/* Version 0.16 */

/**
* Converts a {@link JSDS.JSDS} dependency structure to a protovis pv.Layout.Network
* @param {@link JSDS.JSDS} jsds the JSDS structure to convert
* @param {Boolean} headIsTarget	should the dependency heads be the targets and thus have the arrow heads. If false, the dependents will be the targets with the arrow heads.
* @returns {pv.Layout.Network} the protovis Network
*/
JSDS.jsds2pv = function(jsds, headIsTarget) {
	if (headIsTarget == null) {
		headIsTarget = true;
	}
	var what = {"nodes":[], "links":[], "original":"", "headIsTarget":headIsTarget, "rootName":jsds.rootName};
	
	var nn = jsds.tokenInfo.length;
	for(var i=0;i<nn;i++) {
		var thisTok = jsds.tokenInfo[i];
		/* not currently applicable, since we never set the error value for a node
		if (thisTok.nodeValue.info != null && thisTok.nodeValue.error != null) {
			continue;
		}
		*/
		what["nodes"].push( {nodeName: thisTok.token, nodeValue:thisTok} );
		what["original"] = what["original"] +  " " + thisTok.token;
	}
	var dn = jsds.dependencyInfo.length;
	for(var i=0;i<dn;i++) {
		var thisDep = jsds.dependencyInfo[i];
		if (thisDep.info != null && thisDep.info.error != null) {
			continue;
		}
		var srcNd, targNd;
		if (headIsTarget) {
			srcNd = 1*thisDep.depNodeIndex;
			targNd = 1*thisDep.headNodeIndex;
		} else {
			srcNd = 1*thisDep.headNodeIndex;
			targNd = 1*thisDep.depNodeIndex;
		}
		what["links"].push( {source:srcNd, target:targNd, relation:thisDep.relation, info:thisDep.info} );
	}
	what.info = jsds.phraseInfo;
	return what;
}

//see http://nextens.uvt.nl/depparse-wiki/DataFormat for details
//this is just for a single phrase (sentence). Phrases are separated by blank lines in the CoNLL files.
//tab delimited, one token per line
//e.g.
//'1	E	e	C	CC	_	4	con	_	_\n2	qualcosa	qualcosa	P	PI	num=s|gen=n	6	obj	_	_\n3	ora	ora	B	B	_	4	mod_temp	_	_\n4	sente	sentire	V	V	num=s|per=3|mod=i|ten=p	0	ROOT	_	_\n5	di	di	E	E	_	4	arg	_	_\n6	dire	dire	V	V	mod=f	5	prep	_	_\n7	:	:	F	FC	_	4	punc	_	_\n8	"	"	F	FB	_	10	punc	_	_\n9	Il	il	R	RD	num=s|gen=m	10	det	_	_\n10	dispiacere	dispiacere	S	S	num=s|gen=m	6	arg	_	_\n11	per	per	E	E	_	10	comp	_	_\n12	la	lo	R	RD	num=s|gen=f	13	det	_	_\n13	squalifica	squalifica	S	S	num=s|gen=f	11	prep	_	_\n14	di	di	E	E	_	13	comp	_	_\n15	De	de	S	SP	_	16	mod	_	_\n16	Benedictis	benedictis	S	SP	_	14	prep	_	_\n17	e	e	C	CC	_	10	con	_	_\n18	un	un	R	RI	num=s|gen=m	20	det	_	_\n19	"	"	F	FB	_	20	punc	_	_\n20	grazie	grazie	S	S	num=s|gen=m	10	conj	_	_\n21	"	"	F	FB	_	20	punc	_	_\n22	al	a	E	EA	num=s|gen=m	20	comp	_	_\n23	mio	mio	A	AP	num=s|gen=m	24	mod	_	_\n24	allenatore	allenatore	S	S	num=s|gen=m	22	prep	_	_\n25	,	,	F	FF	_	26	punc	_	_\n26	a	a	E	E	_	20	comp	_	_\n27	Pietro	pietro	S	SP	_	28	mod	_	_\n28	Pastorini	pastorini	S	SP	_	26	prep	_	_\n29	che	che	P	PR	num=n|gen=n	32	subj	_	_\n30	mi	mi	P	PC	num=s|per=1|gen=n	32	obj	_	_\n31	ha	avere	V	VA	num=s|per=3|mod=i|ten=p	32	aux	_	_\n32	portato	portare	V	V	num=s|mod=p|gen=m	28	mod_rel	_	_\n33	fino_a	fino_a	E	E	_	32	comp_loc	_	_\n34	qui	qui	B	B	_	33	prep	_	_\n35	"	"	F	FB	_	10	punc	_	_\n36	.	.	F	FS	_	4	punc	_	_\n'
/**
* Converts a CoNLL dependency structure to jsds. see <a href="http://nextens.uvt.nl/depparse-wiki/DataFormat" target="_blank">http://nextens.uvt.nl/depparse-wiki/DataFormat</a> for details of the CoNLL format.
* @param {String} conllStr the CoNLL structure to convert
* @returns {JSDS.jsds} the jsds
*/
JSDS.CoNLL2JSDS = function(conllStr) {
	if (conllStr == null) {
		return null;
	}

	var tokObjs = [ new JSDS.DSToken("ROOT",0) ]; //dummy ROOT in 0th word position 
	var depObjs = [];
	var toks = conllStr.split(/[\n\r]/);
	var nToks = toks.length;
	for(var i=0;i<nToks;i++) {
		if (toks[i] == "") {
			continue;
		}
		var tokFlds = toks[i].split("\t");

		
		var feats = tokFlds[5].split("|");
		var thisInfo = {"LEMMA":tokFlds[2], "CPOSTAG":tokFlds[3], "POSTAG":tokFlds[4], "FEATS":feats, "PHEAD":tokFlds[8], "PDEPREL":tokFlds[9]};
		
		var tokPosn = 1*tokFlds[0];
		//DSToken(tok, posn, inf)
		tokObjs.push( new JSDS.DSToken( tokFlds[1], tokPosn, thisInfo) );
		
		//DSDep(reln, headNd, depNd, inf)
		depObjs.push( new JSDS.DSDep( tokFlds[7], 1*tokFlds[6], tokPosn) ); //assumes that tokObjs has the DSTokens in order -- we'll do that below
	}
	
	tokObjs.sort(JSDS.compareTokensByPosn);
	
	//JSDS(phraseInf, tokenInf, depInf)
	return new JSDS.JSDS({}, tokObjs, depObjs, "ROOT"); //no other phrase info in CoNLL
}

//provisional, for CNR Paisa sample (more generally, CoNLL)
// tokens separated by spaces, fields by slash
// token/lemma/CPOSTAG/position/head/relation
//'E/e/C/1/4/con qualcosa/qualcosa/P/2/6/obj ora/ora/B/3/4/mod_temp sente/sentire/V/4/0/ROOT di/di/E/5/4/arg dire/dire/V/6/5/prep :/:/F/7/4/punc "/"/F/8/10/punc Il/il/R/9/10/det dispiacere/dispiacere/S/10/6/arg per/per/E/11/10/comp la/lo/R/12/13/det squalifica/squalifica/S/13/11/prep di/di/E/14/13/comp De/de/S/15/16/mod Benedictis/benedictis/S/16/14/prep e/e/C/17/10/con un/un/R/18/20/det "/"/F/19/20/punc grazie/grazie/S/20/10/conj "/"/F/21/20/punc al/a/E/22/20/comp mio/mio/A/23/24/mod allenatore/allenatore/S/24/22/prep ,/,/F/25/26/punc a/a/E/26/20/comp Pietro/pietro/S/27/28/mod Pastorini/pastorini/S/28/26/prep che/che/P/29/32/subj mi/mi/P/30/32/obj ha/avere/V/31/32/aux portato/portare/V/32/28/mod_rel fino_a/fino_a/E/33/32/comp_loc qui/qui/B/34/33/prep "/"/F/35/10/punc ././F/36/4/punc';
/**
* Converts a oneline CoNLL dependency structure to jsds.  Tokens are separated by spaces, fields by slash
* @param {String} conllStr the oneline CoNLL structure to convert
* @returns {JSDS.jsds} the jsds
*/
JSDS.CQPCoNLL2JSDS = function(cqpStr) {
	if (cqpStr == null) {
		return null;
	}
	
	var tokObjs = [ new JSDS.DSToken("ROOT",0) ]; //dummy ROOT in 0th word position 
	var depObjs = [];
	var toks = cqpStr.split(" ");
	var nToks = toks.length;
	for(var i=0;i<nToks;i++) {
		if (toks[i] == "") {
			continue;
		}
		var tokFlds = toks[i].split("/");

		var thisInfo = {"LEMMA":tokFlds[1], "CPOSTAG":tokFlds[2]};
		
		var tokPosn = 1*tokFlds[3];
		//DSToken(tok, posn, inf)
		tokObjs.push( new JSDS.DSToken( tokFlds[0], tokPosn, thisInfo) );
		
		//DSDep(reln, headNd, depNd, inf)
		depObjs.push( new JSDS.DSDep( tokFlds[5], 1*tokFlds[4], tokPosn) ); //assumes that tokObjs as the DSTokens in order -- we'll do that below
	}
	
	tokObjs.sort(JSDS.compareTokensByPosn);
		
	//JSDS(phraseInf, tokenInf, depInf)
	return new JSDS.JSDS({}, tokObjs, depObjs, "ROOT"); //no other phrase info in CoNLL
}

/////////////////////////////////////////////////////////////////////////
/*
For Kalashnikov691, based on PARC700; also works for By's TigerDB   
NB: nodes are put into phraseInfo; this is different from Decca-XML, where abstracts with heads get put with them
	also, dependencies with a node head or dependent get flagged as errors
e.g.

sentence(1,'PARC#1 (wsj_2348:553)',[0,1,2,3,4,5,6,7,8,9,10,11,12],[]).
word(1,0,'Meridian',noun,[type-proper]).
word(1,1,will,verb,[aux-modal]).
word(1,2,pay,verb,[baseform-pay,form-base]).
word(1,3,a,det,[type-central]).
word(1,4,premium,noun,[baseform-premium,num-sg,type-common]).
word(1,5,of,prep,[]).
word(1,6,'$30.5 million',noun,[subtype-measure,type-numerical]).
word(1,7,to,verb,[aux-to]).
word(1,8,assume,verb,[baseform-assume,form-base]).
word(1,9,'$2 billion',noun,[subtype-measure,type-numerical]).
word(1,10,in,prep,[]).
word(1,11,deposits,noun,[baseform-deposit,num-pl,type-common]).
word(1,12,'.',punc,[]).
dependency(1,w(0),subject,w(1)).
dependency(1,w(2),modal,w(1)).
dependency(1,w(3),determiner,w(4)).
dependency(1,w(4),dirobj,w(2)).
dependency(1,w(5),postmod,w(4)).
dependency(1,w(6),prepcompl,w(5)).
dependency(1,w(7),adverbial,w(2)).
dependency(1,w(8),infinitive,w(7)).
dependency(1,w(9),dirobj,w(8)).
dependency(1,w(10),complement,w(8)).
dependency(1,w(11),prepcompl,w(10)).

*/
/**
* Converts a Tomas By's dependency structure format for English and German to jsds. See: <br/><em>Tomas By. 2008. The Kalashnikov 691 Dependency Bank. In Proceedings of the Sixth International Conference on Language Resources and Evaluation (LREC 2008). Marrakech, Morocco. pp. 707-710.</em> <br/> and <br/> <em>Tomas By. 2009. The TiGer Dependency Bank in Prolog format. In Proceedings of Recent Advances in Intelligent Information Systems, pp. 119&ndash;129.</em>
* @param {String}  the structure to convert
* @returns {JSDS.jsds} the jsds
*/
JSDS.Kalashnikov2JSDS = function (kStr) {
	if (kStr == null) {
		return null;
	}
	
	var tokObjs = []; 
	var depObjs = [];
	var phraseInfo = {"nodes":[]};
	var errors = [];
	
	var lines = kStr.split("\n");
	var numL = lines.length;
	var nodes = [];
	
	for(var i=0;i<numL;i++) {
		var thisL = lines[i];

		if (thisL.indexOf("sentence") == 0) {
			//phraseInfo.info = thisL; //TBD?? parse out the sentence
			phraseInfo.info = JSDS.ksent(thisL);
			} else if (thisL.indexOf("word") == 0) {
			tokObjs.push( JSDS.kword(thisL) );
		} else if (thisL.indexOf("dependency") == 0) {
			var thisDep = JSDS.kdep(thisL);
			
			if (thisDep.info != null && thisDep.info.error != null) {
				errors.push("Link error: " + thisDep.info.error);
			}
			depObjs.push( JSDS.kdep(thisL) );
		} else if (thisL.indexOf("node") == 0) {
			phraseInfo.nodes.push( JSDS.knode(thisL) );
		}
	}
	return  new JSDS.JSDS(phraseInfo, tokObjs, depObjs);
}

//return info object with id, tigerRef, numWds, numNds
//e.g. sentence(49,'s8053/tiger-db-8053.fdsc',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],[0,1]).
 // -> {id:49, tigerRef: s8053/tiger-db-8053.fdsc, numWds: 23, numNds:2
 /** @ignore */
JSDS.ksent = function(str) {
	var what = {};
	//get id
	var where = str.indexOf("(") +1; //to start of id
	str = str.substr(where);
	where = str.indexOf(","); // end of number
	what.id = str.substr(0,where);
	str = str.substr(where+2); //skip '
	where = str.indexOf(",") -1; //end of tigerRef, before '
	what.tigerRef = str.substr(0,where);
	str = str.substr(where+2); //start of word list
	where = str.indexOf("]") +1; //after ]
	var wds = eval(str.substr(0,where));
	what.numWds = wds.length;
	str = str.substring(where+1, str.length-2); //after node ]
	var nds = eval(str);
	what.numNds = nds.length;
	
	return what;
	
}

//return DSToken with info having the pos, as well as the features and their values
//e.g. word(1,9,'$2 billion',noun,[subtype-measure,type-numerical]). =>
//	DSToken('$2 billion', 9, {pos:"noun", subtype:"measure", type:"numerical"}
/** @ignore */
JSDS.kword = function(str) {
	//get wdnum
	var where = str.indexOf(","); //gets to comma after snum
	str = str.substr(where+1);
	where = str.indexOf(","); //gets to comma after wdnum
	var wdnum = parseInt(str.substr(0,where));
	str = str.substr(where+1);

	//now we work from the end, because of issues with quotes
	//we're aiming to convert the array into an Object representation and then JSON.parse it
	var info;
	where = str.indexOf("["); //this is safe, because there are no quoted [ in the kalashnikov691
	var attrStr = str.substring(where+1, str.length-3); //-3 to remove final ]).
	if (attrStr == "") {
		info = {};
	} else {
		attrStr = attrStr.replace(/'/g,""); //convert pers-'1' to pers-1
		//need to quote attributes and values
		//special case of compound lemmas, where compounds have - in the middle. i.e. - is used here as well as separating attributes from values
		
		var clWhere = attrStr.indexOf("cmpd_lemma");
		var cLemma, endCL;
		if (clWhere > -1) {
			endCL = attrStr.indexOf(",",clWhere);
			cLemma = attrStr.substring(clWhere, endCL);
			var newCLemma = cLemma.replace("-",'":"'); //only replaces first one
			newCLemma = newCLemma.replace(/-/g,"\t"); //replace the rest of the - with tab -- safe since no tabs in lemmas
			attrStr = attrStr.replace(cLemma,newCLemma);
		}
		
		attrStr = attrStr.replace(/-/g, '":"');
		attrStr = attrStr.replace(/\t/g, '-'); //for compound lemmas, above
		attrStr = attrStr.replace(/,/g, '","');
		var tmp = '{"' + attrStr + '"}';
		info = JSON.parse( tmp );
	}

	str = str.substr(0, where-1); // now we just have word,pos
	where = str.lastIndexOf(",");
	var pos = str.substr(where+1);
	info.pos = pos;
	var wd = str.substring(0,where);
	//strip surrounding '...' if they're there; doing it in one go didn't work right :(
	wd = wd.replace(/^'/,""); 
	wd = wd.replace(/'$/,"");
	
	return new JSDS.DSToken(wd, wdnum, info);
}

//return DSDep
//e.g. dependency(1,w(0),subject,w(1)). =>
//	DSDep(subject, 1, 0)
//but dependency(48,n(1),mo,w(7)). and dependency(49,w(5),det,n(0)). will give errors, since the dependencies are to/from non-tokens
//this is a bit different from DeccaXML, where the <abstract> contains its dependendency
/** @ignore */
JSDS.kdep = function(str) {
	var pieces = str.split(",");
	var hdNd = pieces[3].substring(2, pieces[3].length-3);
	var depNd = pieces[1].substring(2, pieces[1].length-1);
	
	return new JSDS.DSDep(pieces[2], hdNd, depNd);
}

//return node as is (for now)
/** @ignore */
JSDS.knode = function(str) {
	return str;
}

/////////////////////////////////////
/* Decca-XML for TigerDB, e.g.
for sentence:Oft befinden sich die Areale in der Nähe von Bahnhöfen oder in Innenstädten .

<sentence id="8001" externid="tiger-db-8001.fdsc">
  <word id="1" form="Oft" lemma="oft" postag="ADV">
    <head id="2" deprel="mo"/>
  </word>
  <word id="2" form="befinden" lemma="befinden" postag="VVFIN">
    <head id="0" deprel="ROOT"/>
  </word>
  <word id="3" form="sich" lemma="sich" postag="PRF">
    <head id="2" deprel="oa"/>
  </word>
  <word id="4" form="die" lemma="der" postag="ART">
    <head id="5" deprel="det"/>
  </word>
  <word id="5" form="Areale" lemma="Areal" postag="NN">
    <head id="2" deprel="sb"/>
  </word>
  <word id="6" form="in" lemma="in" postag="APPR">
    <head id="11" deprel="cj"/>
  </word>
  <word id="7" form="der" lemma="der" postag="ART">
    <head id="8" deprel="det"/>
  </word>
  <word id="8" form="Nähe" lemma="Nähe" postag="NN">
    <head id="6" deprel="obj"/>
  </word>
  <word id="9" form="von" lemma="von" postag="APPR">
  </word>
  <word id="10" form="Bahnhöfen" lemma="Bahnhof" postag="NN">
    <head id="8" deprel="gr"/>
  </word>
  <word id="11" form="oder" lemma="oder" postag="KON">
    <head id="2" deprel="op_loc"/>
  </word>
  <word id="12" form="in" lemma="in" postag="APPR">
    <head id="11" deprel="cj"/>
  </word>
  <word id="13" form="Innenstädten" lemma="Innenstadt" postag="NN">
    <head id="12" deprel="obj"/>
  </word>
  <word id="14" form="." lemma="--" postag="$.">
  </word>
  <abstract id="504" form="coord" postag="">
  </abstract>
  <subword id="13001" form="innen" postag="">
    <head id="13" deprel="mod"/>
  </subword>
</sentence>

Notes: 
	* the "subword" elements are part of the info of their head word (may be more than one subword per word, and/or more than one head per subword)
	* the "abstract" elements are part of info of sentence if they don't have a head, and otherwise to the info of the head; similar to subwords
	* dependencies with non-tokens heads are flagged as errors (e.g. in Tiger 247)
*/

/**
* Converts a DECCAXml dependency structure to jsds. Assumes a browser XML parser. See: <em>Adriane Boyd, Markus Dickinson, and Detmar Meurers. 2007. On representing dependency relations - Insights from converting the German TiGerDB. In Proceedings of the Sixth Inter-national Workshop on Treebanks and Linguistic Theories (TLT 2007). Bergen, Norway. pp. 31-42.</em>
* @param {String}  the DECCAXml structure to convert
* @returns {JSDS.jsds} the jsds
*/
JSDS.tigerDecca2JSDS = function(deccaXMLsString) {
//deccaXMLsString is an XML fragment for a <sentence>

	if (deccaXMLsString == null) {
		return null;
	}
	if (! window.DOMParser) {
		alert('Parsing XML is not not supported in this browser. "window.DOMParser()" needed.');
		return null
	}
	
	var parser=new DOMParser();
	var sentDoc=parser.parseFromString(deccaXMLsString,"text/xml");
  
	var tokObjs = [ new JSDS.DSToken("ROOT",0) ]; //dummy ROOT in 0th word position 
	var depObjs = [];
	var phraseInfo = {};
	var errors = [];
	
	var sent = sentDoc.getElementsByTagName("sentence")[0];
	var n = sent.attributes.length;
	for(var i=0;i<n;i++) {
		phraseInfo[ sent.attributes[i].name ] = sent.attributes[i].value;
	}
	
	var words = sentDoc.getElementsByTagName("word");
	var wn = words.length;
	for(var i=0;i<wn;i++) {
		var wd = words.item(i);
		//DSToken(tok, posn, inf)
		var tok, posn;
		var info = {};
		
		var n = wd.attributes.length;
		for(var j=0;j<n;j++) {
			var attr = wd.attributes[j].name;
			var val = wd.attributes[j].value;
			
			if (attr == "id") {
				posn = 1*val;
			} else if (attr == "form") {
				tok = val;
			} else {
				if (val == "&amp;") {
					val = "&";
				}
				info[attr] = val;
			}
		}
		
		//now do the dependencies
		var deps = wd.getElementsByTagName("head");
		var dn = deps.length;
		for(var j=0;j<dn;j++) {
			//DSDep(reln, headNd, depNd, inf)
			var reln = deps[j].attributes.getNamedItem("deprel").value;
			var hd = 1*deps[j].attributes.getNamedItem("id").value;
			var depinfo = {};
			if (hd > wn || hd < 0) {
				depinfo.error = "non-token head";
				errors.push("Link with non-token head: " + hd + " (Relation: " + reln + ", dependent " + posn + ")");
			}
			depObjs.push( new JSDS.DSDep(reln, hd, posn, depinfo) );
		}

		tokObjs.push( new JSDS.DSToken(tok, posn, info) );
	}
	
	//now add the "subword" elements as part of the info of their head word (may be more than one subword per word, and/or more than one head per subword)
	var subwords = sentDoc.getElementsByTagName("subword");
	var swn = subwords.length;
	
	for(var i=0;i<swn;i++) {
		var thisSubWd = subwords.item(i);
		var baseSwInfo = {};
		var swattrN = thisSubWd.attributes.length;
		for(var j=0;j<swattrN;j++) {
			baseSwInfo[ thisSubWd.attributes[j].name ] = thisSubWd.attributes[j].value
		}
		
		var subWdHds = thisSubWd.getElementsByTagName("head");
		var swhn = subWdHds.length;
		for(var j=0;j<swhn;j++) {
			var hdWd = 1*subWdHds[j].attributes.getNamedItem("id").value;
			var subWdInfo = baseSwInfo;
			subWdInfo["deprel"] = subWdHds[j].attributes.getNamedItem("deprel").value;
			
			if (tokObjs[hdWd].info.subWords == null) {
				tokObjs[hdWd].info.subWords = [];
			}
			tokObjs[hdWd].info.subWords.push(subWdInfo);
		}
	}
	
	//add the "abstract" elements as part of info of sentence if they don't have a head, and otherwise to the info of the head; similar to subwords
	var abstracts = sentDoc.getElementsByTagName("abstract");
	var abn = abstracts.length;
	
	for(var i=0;i<abn;i++) {
		var thisAbs = abstracts.item(i);
		var baseAbsInfo = {};
		var abattrN = thisAbs.attributes.length;
		for(var j=0;j<abattrN;j++) {
			baseAbsInfo[ thisAbs.attributes[j].name ] = thisAbs.attributes[j].value
		}
		
		var absHds = thisAbs.getElementsByTagName("head");
		var abshn = absHds.length;
		if (abshn > 0) {
			//have a head, so add this info to that word
			for(var j=0;j<abshn;j++) {
				var hdWd = 1*absHds[j].attributes.getNamedItem("id").value;
				var absInfo = baseAbsInfo;
				absInfo["deprel"] = absHds[j].attributes.getNamedItem("deprel").value;
				
				if (tokObjs[hdWd].info.abstractElements == null) {
					tokObjs[hdWd].info.abstractElements = [];
				}
				tokObjs[hdWd].info.abstractElements.push(absInfo);
			}
		} else {
			//no head, so add this info to the sentenc
			if (phraseInfo.abstractElements == null) {
				phraseInfo.abstractElements = [];
			}
			phraseInfo.abstractElements.push(baseAbsInfo);
		}
	}
	if (errors.length > 0) {
		phraseInfo.errors = errors;
	}
	
	return  new JSDS.JSDS(phraseInfo, tokObjs, depObjs, "ROOT");
}


/////////////////////////////////////
/* MaltXML http://w3.msi.vxu.se/~nivre/research/MaltXML.html   e.g.
		<sentence id="1" user="" date="">
			<word id="1" form="Individuell" lemma="individuell" postag="jj.pos.utr.sin.ind.nom" head="2" deprel="ATT" chunk="APB|NPB"/>
			<word id="2" form="beskattning" lemma="beskattning" postag="nn.utr.sin.ind.nom" head="0" deprel="ROOT" chunk="NPI"/>
			<word id="3" form="av" lemma="av" postag="pp" head="2" deprel="ATT" chunk="NPI|PPB"/>
			<word id="4" form="arbetsinkomster" lemma="arbetsinkomst" postag="nn.utr.plu.ind.nom" head="3" deprel="PR" chunk="NPB|NPI|PPI"/>
		</sentence>
		
	Notes: 
		* for <word>, only id and form are required
		* for <word>, optional attributes are postag, head, deprel, 
		* the examples from the above site do follow the spec, since they have extra attributes for <word>: lemma, chunk
*/
/**
* Converts a MaltXML dependency structure to jsds. Assumes a browser XML parser. See <a href="http://w3.msi.vxu.se/~nivre/research/MaltXML.html" target="_blank">http://w3.msi.vxu.se/~nivre/research/MaltXML.html</a> for details of the format.
* @param {String}  the MaltXML structure to convert
* @returns {JSDS.jsds} the jsds
*/
JSDS.maltXML2JSDS = function(maltXMLsString) {
//maltXMLsString is an XML fragment for a <sentence>

	if (maltXMLsString == null) {
		return null;
	}
	if (! window.DOMParser) {
		alert('Parsing XML is not not supported in this browser. "window.DOMParser()" needed.');
		return null
	}
	
	var parser=new DOMParser();
	var sentDoc=parser.parseFromString(maltXMLsString,"text/xml");
  
	var tokObjs = [ new JSDS.DSToken("ROOT",0) ]; //dummy ROOT in 0th word position 
	var depObjs = [];
	var phraseInfo = {};
	
	var sent = sentDoc.getElementsByTagName("sentence")[0];
	var n = sent.attributes.length;
	for(var i=0;i<n;i++) {
		phraseInfo[ sent.attributes[i].name ] = sent.attributes[i].value;
	}
	
	var words = sentDoc.getElementsByTagName("word");
	var wn = words.length;
	for(var i=0;i<wn;i++) {
		var wd = words.item(i);
		//DSToken(tok, posn, inf0)
		var tok, posn;
		var info = {};
		var head = null;
		var dep = null;
		
		var n = wd.attributes.length;
		for(var j=0;j<n;j++) {
			var attr = wd.attributes[j].name;
			var val = wd.attributes[j].value;
			if (attr == "id") {
				posn = 1*val;
			} else if (attr == "form") {
				tok = val;
			} else if (attr == "head") {
				head = 1*val;	
			} else if (attr == "deprel") {
				dep = val;
			} else {
				info[attr] = val;
			}
		}
		
		tokObjs.push( new JSDS.DSToken( tok, posn, info) );
		//DSDep(reln, headNd, depNd, inf)
		depObjs.push( new JSDS.DSDep(dep, head, posn) );
	}
	
	//JSDS(phraseInf, tokenInf, depInf)
	return new JSDS.JSDS(phraseInfo, tokObjs, depObjs, "ROOT");
}

//tab delimited, one token per line
//token	position	dependency	head position
//dependency and head posititon may be empty
//I	1	 subj	2\nlike	2		\ncoffee.	3	obj	2
/**
* Converts a simple tab-delimited table to JSDS. The order of the fields is token, position, dependency, head position. Positions start at 1. Multiple heads for a token are allowed by listing the full dependencies on separate lines. If a root name is given, then a dummy root token with that name will be created in position 0.
* @param {String} tabTable the tab delimited table to convert
* @param {String} rtName the name of the root relation (optional)
* @returns {JSDS.jsds} the jsds
*/
JSDS.simpleTabs2JSDS = function(tabTable, rtName) {
	if (tabTable == null) {
		return null;
	}
	
	var posnOffset = -1; //if no dummy root
	var toksSeen = {};
	var tokObjs = []; 
	if (rtName != null) {
		tokObjs.push(new JSDS.DSToken(rtName,0));
		posnOffset = 0;
	}
	var depObjs = [];
	var deps = tabTable.split(/[\n\r]/);
	var nDeps = deps.length;
	for(var i=0;i<nDeps;i++) {
		if (deps[i] == "") {
			continue;
		}
		var depFlds = deps[i].split("\t");

		var tokPosn = 1*depFlds[1] + posnOffset;
		if (! toksSeen[tokPosn] ) { //we might have multiple instances of the same token -- when there are multiple heads
			//DSToken(tok, posn, inf)
			tokObjs.push( new JSDS.DSToken( depFlds[0], tokPosn, {}) ); //no other token info
			toksSeen[tokPosn] = true;
		}
		
		//we skip relations with no name 
		if (depFlds[2] == "") {
			continue;
		}
		
		//we skip non-root relations without a head
		if (depFlds[2] != rtName && depFlds[3] == "") { 
			continue;
		}
		//now we we're good to go
		//DSDep(reln, headNd, depNd, inf)
		depObjs.push( new JSDS.DSDep( depFlds[2], 1*depFlds[3] + posnOffset, tokPosn) ); //assumes that tokObjs has the DSTokens in order -- we'll do that below
	
	}
	
	tokObjs.sort(JSDS.compareTokensByPosn);
	
	//JSDS(phraseInf, tokenInf, depInf)
	return new JSDS.JSDS({}, tokObjs, depObjs, rtName); //no other phrase info here
}


/////////////////////////////////////

/**
* Compares two {@link JSDS.DSToken}s by their positions, in ascending order
* @param {JSDS.DSToken}  DSTok1
* @param {JSDS.DSToken}  DSTok2
* @returns {Integer} -1,0,1 according to whether DSTok1 precedes, is the same as, or follows DSTok2
*/
JSDS.compareTokensByPosn = function(DSTok1, DSTok2) {
	return DSTok1.position - DSTok2.position;
}