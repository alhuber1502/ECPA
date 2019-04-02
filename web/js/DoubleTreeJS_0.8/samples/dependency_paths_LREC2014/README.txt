WARNING: This example has not been updated past version 0.6 of DoubleTreeJS. It still functions, but it is included for historical purposes.

This folder contains the materials for the presentation and demo of:

    C. Culy, M. Passarotti, and U. König-Cardanobile. 2014. A Compact Interactive Visualization of Dependency Treebank Query Results. LREC 2014, May 2014.

The system requires as its input a CONLL-X dependency format. A sample is included: volume 2 of Edgar Allan Poe's collected works from Project Gutenberg (http://www.gutenberg.org/ebooks/2148) parsed with the Stanford Parser (http://nlp.stanford.edu/software/corenlp.shtml).

If you want to use this system with the Index Thomisticus, as done in the demo, please download the CONLL file from:

    http://www.sfs.uni-tuebingen.de/en/ascl/resources/corpora/index-thomisticus-treebank.html

or contact Marco Passarotti at the address on this page:

    http://itreebank.marginalia.it

For the best results with the system, the file should be named:

    IT-TB.conll    

To run the system, start DepRelApp.jar, e.g. by double clicking on it (you must have Java installed, at least version 6). The web page for the system should open in your default browser. If your default browser is Safari, then you <em>should open the page in Firefox or Chrome instead</em>. The URL is:

    http://127.0.0.1:8383/
    
    
In the settings, chose whether the base is lemmas (not included in all CONLL files), or tokens. Then click on the button to the right of "Input file:" to select a CONLL file.

Note: the diagrams work better when the dependency structures are in fact trees. Some types of Stanford collapsed dependencies can result in a structure that is not only not a tree, but which have loops in the resulting graph (i.e. the result is directed graph, but not a DAG). The path generator does check for loops, but the diagrams do not.

The tree diagrams are done with the ProD tool:

    http://linguistics.chrisculy.net/software/ProD/index.html
    
The arc diagrams are done with the xLDD tool:

    http://linguistics.chrisculy.net/software/index.html#xLDD