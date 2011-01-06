var Linccer = function() {
  	var that = {};
  	HC.observable(that);
    
  	var latitude, longitude, accuracy, timestamp;
    var isReady;

    var load = function(scriptName, callbackFunctionName) {
      var jsonpName = 'jsonp' + Math.floor(Math.random() * 10000000001);
      var scriptURL =  "http://linccer.beta.hoccer.com/v3/" + scriptName + "&jsonp=" + jsonpName;
  	  //var scriptURL =  "http://localhost:9292/v3" + scriptName + "&jsonp=" + jsonpName;
    	
    	var script = document.createElement("script");
    	script.setAttribute("type", "text/javascript");
    	script.setAttribute("src", scriptURL);

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
  		if (latitude === undefined || longitude === undefined) {
  			return;
  		}
		
  		load("/clients/" + that.uuid + "/environment.js" +
  						  "?latitude=" + latitude 
  					 + "&longitude=" + longitude 
  					 +  "&accuracy=" + accuracy
  					 + "&timestamp=" + timestamp
  					 , "updatedEnvironment");
  	}
	
  	that.uuid = HC.randomUUID();
	
	  var hasError = function(data) {
  	  if (data.message == "timeout" || data.message == "conflict") {
  	    that.fire('error', data);
  	    return true;
  	  }
	    
	    return false;
	  }
	
  	that.received = function(data) {
  		if (!hasError(data)) { 
  		  that.fire('received', data);
  		} 
  	}
	
  	that.sent = function(data) {
  	  if (!hasError(data)) {
        that.fire('sent', data);
      }
  	}
	
  	that.updatedEnvironment = function(data) {
  		if (!that.isReady()) {
  		  isReady = true;
  		  that.fire('ready');
  		}
		
  	  that.fire('updated_environment', data)
  	}
				
  	that.setEnvironmentCoordinates = function(_latitude, _longitude, _accuracy, _timestamp) {				
  		latitude = _latitude;
  		longitude = _longitude; 
  		accuracy = _accuracy;
  		if (_timestamp === undefined) {
  		  var date = new Date();
  		  _timestamp = Math.round(date.getTime() / 1000);
  		}
		
  		timestamp = _timestamp
		
  		updateEnvironment();
  	}
	
  	that.send = function(mode, data) {
  		var send = { "payload" : data }
  		load("/clients/" + that.uuid + "/action/send.js?mode=" + mode
  										 + "&" + $.param(send), "sent");
  	}
	
  	that.receive = function(mode) {
  		load("/clients/" + that.uuid + "/action/receive.js?mode=" + mode, "received");
  	}
	
  	that.isReady = function() {
  	  return isReady;
  	}
	
  	return that;	
}
