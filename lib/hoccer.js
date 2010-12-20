var Linccer = function() {
	var that = this;
	var latitude, longitude;
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
  
	var load = function(scriptName, callbackFunctionName) {
    var jsonpName = 'jsonp' + Math.floor(Math.random() * 10000000001);
    var scriptURL =  "http://localhost:4567" + scriptName + "&jsonp=" + jsonpName;
  	
  	var script = document.createElement("script");
  	script.setAttribute("type", "text/javascript");
  	script.setAttribute("src", scriptURL);

    console.log("loading " + scriptURL);
  	document.body.appendChild(script);	
  	
  	window[jsonpName] = function(data) {
      if (callbackFunctionName !== undefined 
        && that[callbackFunctionName] !== undefined) {
              that[callbackFunctionName](data);
      }
      
      window[jsonpName] = undefined;
      document.body.removeChild(script);
    }
  }

	var updateEnvironment = function() {
		setTimeout(updateEnvironment, 25 * 1000);
		if (that.latitude == null || that.longitude == null) {
			return;
		}
		
		load("/clients/" + uuid + "/environment.js" +
						  "?latitude=" + that.latitude 
					 + "&longitude=" + that.longitude, "updatedEnvironment");
	}
	
	var randomUUID = function() {
	  var s = [], itoh = '0123456789ABCDEF';

	  // Make array of random hex digits. The UUID only has 32 digits in it, but we
	  // allocate an extra items to make room for the '-'s we'll be inserting.
	  for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);

	  // Conform to RFC-4122, section 4.4
	  s[14] = 4;  // Set 4 high bits of time_high field to version
	  s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

	  // Convert to hex chars
	  for (var i = 0; i <36; i++) s[i] = itoh[s[i]];

	  // Insert '-'s
	  s[8] = s[13] = s[18] = s[23] = '-';

	  return s.join('');
	}
	
	that.uuid = randomUUID();
	
	that.received = function(data) {
		that.fire('received', data);
	}
	
	that.sent = function(data) {
    that.fire('sent', data);
	}
	
	that.updatedEnvironment = function(data) {
	  that.fire('updated environment', data)
	}
				
	that.setEnvirenmentCoordinates = function(latitude, longitude, accuracy) {				
		that.latitude = latitude;
		that.longitude = longitude; 
		
		updateEnvironment();
	}
	
	that.send = function(mode, data) {
		var send = { "data" : data }
		load("/clients/" + uuid + "/action/send.js?mode=" + mode
										 + "&" + $.param(send), "sent");
	}
	
	that.receive = function(mode) {
		load("/clients/" + uuid + "/action/receive.js?mode=" + mode, "received");
	}
	
	return that;	
}
