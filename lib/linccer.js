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
    that.bssids = [];
    
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
      var scriptURL = "https://linccer" + options["server"] + ".hoccer.com/v3" + scriptName,
          client;
      console.log(scriptURL);
      client = new XMLHttpRequest();
      client.open("GET", scriptURL);
      client.onload = function() {
        if (callbackFunctionName !== undefined 
              && that[callbackFunctionName] !== undefined) {
          if (client.status > 399 || client.status == 204) {
            that[callbackFunctionName]({"message": "request_timeout"});
          } else {
            that[callbackFunctionName](json_parse(client.responseText));
          }
        };
      };
      
      client.onerror = function() {
        that[callbackFunctionName]({"message": "request_timeout"});
      };
      
      client.send();
    };

    var updateEnvironment = function() {
      clearTimeout(timerId);
      timerId = setTimeout(updateEnvironment, 25 * 1000);
      if (latitude === undefined || longitude === undefined) {
        return;
      }
    
      var bssids = [];
      for (var i = 0; i < that.bssids.length; i++) {
        bssids.push("bssids[]=" + that.bssids[i]);
      }
      var bssidString = "&" + bssids.join("&") || "";
    
      load("/clients/" + that.uuid + "/environment.js"
             + "?api_key=" + options['api_key']   
             + "&latitude=" + latitude 
             + "&longitude=" + longitude 
             + "&accuracy=" + accuracy
             + bssidString
             + "&timestamp=" + timestamp,
             "updatedEnvironment");
    };
    
    var hasError = function(data) {
      if (data.message !== undefined) {
        that.fire('error', new Error(data.message));
        return true;
      }
      
      return false;
    };
  
    that.received = function(data) {
      if (!hasError(data)) { 
        that.fire('received', data);
      } 
    };
  
    that.sent = function(data) {
      if (!hasError(data)) {
        that.fire('sent', data);
      }
    };
  
    that.updatedEnvironment = function(data) {
      if (!that.isReady()) {
        isReady = true;
        that.fire('ready');
      }
    
      that.fire('updated_environment', data);
    };
        
    that.setEnvironmentCoordinates = function(_latitude, _longitude, _accuracy, _timestamp) {       
      latitude = _latitude;
      longitude = _longitude; 
      accuracy = _accuracy;
      if (_timestamp === undefined) {
        var date = new Date();
        _timestamp = Math.round(date.getTime() / 1000);
      }
    
      timestamp = _timestamp;
    
      updateEnvironment();
    };
  
    that.send = function(mode, data) {
      var send = { "payload" : data };
      load("/clients/" + that.uuid + "/action/send.js" + 
                                      "?api_key=" + options['api_key'] + 
                                      "&mode=" + mode
                                      + "&" + HC.param(send), "sent");
    };
  
    that.receive = function(mode, receiveOptions) {
      if (receiveOptions !== undefined) {
        var timeout = receiveOptions['timeout'];
        delete receiveOptions['timeout'];
      }
      
      
      var params = [];
      params.push('mode=' + mode);
      params.push('api_key=' + api_key);
      if (receiveOptions !== undefined) {
        for (var key in receiveOptions) {
          params.push(key + "=" + receiveOptions[key]);
        }
      }
      
      load("/clients/" + that.uuid + "/action/receive.js?" 
                                      + params.join("&") , "received", timeout);
    };
  
    that.isReady = function() {
      return isReady;
    };
  
    return that;  
};

Linccer.autoLocation = function () {
  return (navigator.geolocation !== undefined);
};