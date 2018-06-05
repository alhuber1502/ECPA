// -*- Mode: JavaScript; tab-width: 4; indent-tabs-mode: nil; -*-
// vim:set ft=javascript ts=4 sw=4 sts=4 cindent:

var Config = (function(window, undefined) {

    var bratCollData = {
	'entity_types': [
// this is optional
        {
            'type': 'SPAN_DEFAULT',
            'bgColor': '#7fa2ff',
            'borderColor': 'darken'
        },
        {
            'type': 'ARC_DEFAULT',
            'color': 'black',
            'arrowHead': 'triangle,5',
            'labelArrow': 'triangle,3,5',
        },
        {
            'type': 'token',
            'labels': [ '\u00A0\u00A0' ], // non-breaking space for empty
        },
        {
            'type': '-',
            'labels': [ '\u00A0\u00A0' ], // non-breaking space for empty
        },

        {
            'type': 'NN',
            'bgColor': 'lightcoral',
            'borderColor': 'darken'
        },
        {
            'type': 'NNS',
            'bgColor': 'lightcoral',
            'borderColor': 'darken'
        },
        {
            'type': 'NNP',
            'bgColor': 'lightcoral',
            'borderColor': 'darken'
        },
        {
            'type': 'NNPS',
            'bgColor': 'lightcoral',
            'borderColor': 'darken'
        },

        {
            'type': 'VB',
            'bgColor': 'lightgreen',
            'borderColor': 'darken'
        },
        {
            'type': 'VBD',
            'bgColor': 'lightgreen',
            'borderColor': 'darken'
        },
        {
            'type': 'VBG',
            'bgColor': 'lightgreen',
            'borderColor': 'darken'
        },
        {
            'type': 'VBN',
            'bgColor': 'lightgreen',
            'borderColor': 'darken'
        },
        {
            'type': 'VBP',
            'bgColor': 'lightgreen',
            'borderColor': 'darken'
        },
        {
            'type': 'VBZ',
            'bgColor': 'lightgreen',
            'borderColor': 'darken'
        },

        {
            'type': 'JJ',
            'bgColor': 'lightseagreen',
            'borderColor': 'darken'
        },
        {
            'type': 'JJR',
            'bgColor': 'lightseagreen',
            'borderColor': 'darken'
        },
        {
            'type': 'JJS',
            'bgColor': 'lightseagreen',
            'borderColor': 'darken'
        },

        {
            'type': 'RB',
            'bgColor': 'lightsteelblue',
            'borderColor': 'darken'
        },
        {
            'type': 'RBR',
            'bgColor': 'lightsteelblue',
            'borderColor': 'darken'
        },
        {
            'type': 'RBS',
            'bgColor': 'lightsteelblue',
            'borderColor': 'darken'
        },
        {
            'type': 'RP',
            'bgColor': 'lightsteelblue',
            'borderColor': 'darken'
        },

        {
            'type': 'PRP',
            'bgColor': 'lightsalmon',
            'borderColor': 'darken'
        },
        {
            'type': 'PRP$',
            'bgColor': 'lightsalmon',
            'borderColor': 'darken'
        },


	],
  'event_attribute_types': [],
  'entity_attribute_types': [
        {
            'type':   'Name',
            'values': { 
                'Name' : { 'glyph': '(N)' },
             },
         },
         ],
	'relation_types': [
// this is optional
//         {
//             'type': 'punct',
//             'labels': [ 'punct' ],
//             'dashArray': '3,3',
//             'color': 'green',
//             'args': [
//                 {
//                     'role': 'arg1',
//                     'targets': [ 'token' ]
//                 },
//                 {
//                     'role': 'arg2',
//                     'targets': [ 'token' ]
//                 }
//             ]
//         }
//
        ],
	'event_types': [],
    };

    return {
        bratCollData: bratCollData,
    };
})(window);
