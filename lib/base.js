var observable = function(that) {
  var observers = {};
    
  that.on = function(name, fn) {
    if (observers[name] === undefined) {
      observers[name] = [];
    }
  
    var a = observers[name];
    a.push(fn);
  }

  that.fire = function(name, data) {
    var a = observers[name] || [];
    for (var i in a) {
      a[i](data);
    }
  }
	
	return that;
}