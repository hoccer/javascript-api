var Linccer = function(_options) {
  	var that = {};
    HC.observable(that);
    
    var latitude, longitude, accuracy, timestamp;
    var isReady;
    var timerId;
  	
  	var connections;
  	
  	var options = { 'server' : '' };
  	HC.extend(options, _options);
    
    if (options["api_key"] === undefined) { throw new Error("no api key provided"); }
  	options["server"] = (options["server"] === undefined  || 
                         options["server"] === "production" ||
                         options["server"] === "") 
  	                                ? "" : "-" + options["server"] ;
  	
    that.uuid = HC.randomUUID();
    
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(function(position) {
        
        that.setEnvironmentCoordinates(position.coords.latitude, 
          position.coords.longitude, position.coords.accuracy, position.timestamp);
      },
      function(error) {
         that.fire('error', error);
      },
      { maximumAge:Infinity, timeout: 4000 }); 
    }
    
    
    var load = function(scriptName, callbackFunctionName, timeout) {
      var jsonpName = 'jsonp' + Math.floor(Math.random() * 10000000001);
      var scriptURL =  "https://linccer" + options["server"] + ".hoccer.com/v3" + scriptName + "&jsonp=" + jsonpName;
      // var scriptURL = "http://127.0.0.1:9292/v3" + scriptName + "&jsonp=" + jsonpName;
	    var head = document.getElementsByTagName("head")[0] || document.documentElement,
	      script = document.createElement("script");
    	
    	script.setAttribute("type", "text/javascript");
    	script.setAttribute("src", scriptURL);
      
      if (script.src.match(/receive.js/)) {
        console.log('receive with', jsonpName);
      }
      
    	head.appendChild(script);	
  	
    	window[jsonpName] = function(jsonpName, script) {
    	  return function(data) {        
          if (head) {
            if (script.src.match(/receive.js/)) {
              console.log('release script', script.src);
            }
            head.removeChild(script);
          }
        
          console.log('undefining', jsonpName);
          window[jsonpName] = undefined;
        
          if (callbackFunctionName !== undefined 
            && that[callbackFunctionName] !== undefined) {
                that[callbackFunctionName](data);
          }
        }
      }(jsonpName, script);
      
      if (timeout !== undefined) {
        setTimeout(function(name) {
          return function() { 
            if (window[name] !== undefined) {
              console.log('sending request timeout', name);
              window[name]( { message: 'request_timeout' } );
            }
          }
        }(jsonpName), timeout);
      }
    }

    
  	var updateEnvironment = function() {
  		clearTimeout(timerId);
  		timerId = setTimeout(updateEnvironment, 25 * 1000);
  		if (latitude === undefined || longitude === undefined) {
  			return;
  		}
		
  		load("/clients/" + that.uuid + "/environment.js"
  					 + "?api_key=" + options['api_key']	  
  					 + "&latitude=" + latitude 
  					 + "&longitude=" + longitude 
  					 +  "&accuracy=" + accuracy
  					 + "&timestamp=" + timestamp
  					 , "updatedEnvironment");
  	}
		
	  var hasError = function(data) {
  	  if (data.message !== undefined) {
  	    that.fire('error', new Error(data.message));
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
  										 + "&" + HC.param(send), "sent");
  	}
	
  	that.receive = function(mode, options) {
      if (options !== undefined) {
        var timeout = options['timeout'];
        delete options['timeout'];
      }
            
      params = [];
      params.push('mode=' + mode);
  	  
  	  if (options !== undefined) {
  	    for (var key in options) {
  	      params.push(key + "=" + options[key]);
  	    }
  	  }
  	  
  		load("/clients/" + that.uuid + "/action/receive.js?" + params.join("&") , "received", timeout);
  	}
	
  	that.isReady = function() {
  	  return isReady;
  	}
	
  	return that;	
}

Linccer.autoLocation = function () {
  return (navigator.geolocation !== undefined);
}

