var HC = {};

HC.observable = function(that) {
  var observers = {};
    
  that.on = function(name, fn) {
    if (observers[name] === undefined) {
      observers[name] = [];
    }

    var a = observers[name];
    if (typeof fn === 'function') {
      a.push(fn);      
    }
  }

  that.fire = function(name, data) {
    var a = observers[name] || [];
    for (var i in a) {
      a[i](data);
    }
  }
	
	return that;
}

HC.randomUUID = function() {
  var s = [], itoh = '0123456789ABCDEF';

  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random()*0x10);

  // Conform to RFC-4122, section 4.4
  s[14] = 4;  // Set 4 high bits of time_high field to version
  s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

  // Convert to hex chars
  for (var i = 0; i <36; i++) s[i] = itoh[s[i]];

  // Insert '-'s
  s[8] = s[13] = s[18] = s[23] = '-';

  return s.join('');
};