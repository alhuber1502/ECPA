function SearchHistory() {
    var items = []; //string representations of real items
    var stored = {}; //keys are the elements in items, values are {item:origalItem, info:theInfo} 
    
    this.pushItem = function(item, info) {
        var itemStr = item.toString(); //redundant for strings, need for RegExps
        
        if (itemStr in stored) {
            var which = items.indexOf(itemStr);
            items.splice(which,1);
        }
        items.push(itemStr);
        stored[itemStr] = {'item':item, 'info':info};
    }
    
    //returns [item, info]
    this.popItem = function() {
        var itemStr = item.pop();
        var what = [stored[itemStr]['item'], stored[itemStr]['info'] ];
        delete stored[itemStr];
        return what;
    }
    
    //returns info or null
    this.removeItem = function(item) {
        var what = null;
        
        var itemStr = item.toString(); //redundant for strings, need for RegExps
        
        
        if (itemStr in stored) {
            var which = items.indexOf(which);
            items.splice(which,1);
            what = stored[itemStr]['info'];
            delete stored[itemStr];
        }
        return what;
    }
    
    this.removeAll = function() {
        items = [];
        stored = {};
    }
    
    //returns array of [item,info]; doesn't modify history
    this.getAll = function() {
        return items.map(function(d,i) {
            return [ stored[d]['item'], stored[d]['info'] ];
        });
    }
    
    //function isRegExp(e) {
    //    return (typeof(e) === 'object' && e instanceof RegExp);
    //}
}


