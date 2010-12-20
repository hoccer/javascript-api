var load = function(scriptName) {
	console.log("loading " + scriptName);
	
	var script = document.createElement("script");
	script.setAttribute("type", "text/javascript");
	script.setAttribute("src", scriptName);
	
	document.body.appendChild(script);
}

var Linccer = function() {
	var that = this;
	var latitude, longitude;
	
	var updateEnvironment = function() {
		setTimeout(updateEnvironment, 25 * 1000);
		if (that.latitude == null || that.longitude == null) {
			return;
		}
		
		load("http://localhost:4567/clients/" + uuid + "/environment.js" +
												"?latitude=" + that.latitude 
											 + "&longitude=" + that.longitude
											// preventing caching by adding timestamp
											       + "&time=" + new Date().getTime()); 
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
	
	that.onReceived = function(data) {
		console.log(data.content);
	}
	
	that.onSend = function(data) {
		console.log("send");
	}
				
	that.setEnvirenmentCoordinates = function(latitude, longitude, accuracy) {				
		that.latitude = latitude;
		that.longitude = longitude; 
		
		updateEnvironment();
	}
	
	that.send = function(mode, data) {
		var send = { "data" : data }
		load("http://localhost:4567/clients/" + uuid + "/action/send.js?mode=" + mode
										 + "&" + $.param(send));
	}
	
	that.receive = function(mode) {
		load("http://localhost:4567/clients/" + uuid + "/action/receive.js?mode=" + mode);
	}
	
	return that;	
}
