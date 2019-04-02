/**
 * @author Chris Culy
 * @date 28 February 2014
 * @revised 28 February
 */

/**
 * Gets alls the paths through the dependencies in a CoNLL formatted text
 * @param {type} conll  CoNLL text input
 * @param {type} handler    What we do with the the paths
 * @returns {undefined}
 */
function getPaths(conll, handler) {
    setStatus("Getting all paths ...");
    var url = "/paths/";
    var params = {"c":conll};
    
    jQuery.post(url, params, function(data, status, jqXHR) {
         if (status !== "success") {
             setError(status);
            return;
        }
        setError("None");

        newText = data;
        handler(); //it will be setUpDT
    }); 
}

/**
 * Get the num original CoNLL parse
 * @param {type} num
 * @param {type} handler    What we do with the parse
 * @returns {undefined}
 */
function getParse(num, handler) {
    var url = "/conll/";
    var params = {"p": num};
    
    jQuery.get(url, params, function(data, status, jqXHR) {
         if (status !== "success") {
             setError(status);
            return;
        }
        setError("None");

        handler(data[0]);
    }); 
}

