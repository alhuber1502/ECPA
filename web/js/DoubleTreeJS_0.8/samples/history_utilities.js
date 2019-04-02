var itemHistory = new SearchHistory();

function pushHistory(searchTerm, isRegex, howMany) {
  itemHistory.pushItem(searchTerm, {'isRegex': isRegex, 'hits':howMany});
  var select = document.getElementById("searchHistory");
  var opts = itemHistory.getAll().map(function(d,i) {
    var item = d[0].toString().replace(/<unknown>/g, '&lt;unknown&gt;').replace(/"/g,'&quot;');
    var what = '<option value="' + i + '" class="';
    if (d[1].hits > 0) {
      what += 'found">' + item + '\t(' + d[1].hits + ')';
    } else {
      what += 'missed" disabled>' + item + '\t(0)';
    }
    what += '</option>';
    return what;
  }).reverse(); //most recent on top
  select.innerHTML = opts.join("\n");
  
  
}
function clearHistory() {
  itemHistory.removeAll();
  var select = document.getElementById("searchHistory").innerHTML = "";
}

function setFromHistory(which) {
  var item = itemHistory.getAll()[which][0];
  document.getElementById("toUse").item
  if (itemHistory.getAll()[which][1].isRegex) {
    resetDataByRegex(item)
  } else {
    resetData(item, true);
  }
}