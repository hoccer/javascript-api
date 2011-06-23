if (window.console === undefined) {
  window.console = { log : function() {}, debug : function() {} };
} 

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

    var readCookie = function() {
      var name = "uuid=";
      var ca = document.cookie.split(';');
    	for(var i=0;i < ca.length;i++) {
	    	var c = ca[i];
		    while (c.charAt(0)==' ') c = c.substring(1,c.length);
		    if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
 	    }
      return null;
    }

    var setCookie = function(_uuid) {
      document.cookie = "uuid=" + _uuid;
      
      return;
    }

    var uuid = readCookie();

    if ( uuid != null ) {
      that.uuid = uuid;
    } else {
      that.uuid = HC.randomUUID();
      setCookie(that.uuid);
    }

    that.bssids = [];
    that.client_name = "";
    that.selected_clients = [];
    
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
          if (client.status == 401) {
            that[callbackFunctionName]({"message": "not_authorized"});
          } else if (client.status > 399 || client.status == 204) {
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
        if (that.bssids[i].trim() !== "") {
          bssids.push("bssids[]=" + that.bssids[i]);
        }
      }
      var bssidString = "&" + bssids.join("&") || "";
 
      var selected_clients = [];
      for (var i = 0; i < that.selected_clients.length; i++) {
        if (that.selected_clients[i].trim() !== "") {
          selected_clients.push("selected_clients[]=" + that.selected_clients[i]);
        }
      }
      var selectedString = "&" + selected_clients.join("&") || "";

      load("/clients/" + that.uuid + "/environment.js"
             + "?api_key=" + options['api_key']   
             + "&client_name=" + that.client_name 
             + selectedString
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

    that.peeked = function(data) {
      if (!hasError(data)) {
        that.fire('peeked', data);
      }
    };

    that.deleted = function(data) {
      if (!hasError(data)) {
        that.fire('deleted', data);
      }
    };

  
    that.updatedEnvironment = function(data) {
      if (hasError(data)) { return; }
      
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
    
    that.setBssids = function(_bssids) {
      that.bssids = _bssids;
      updateEnvironment();
    };

    that.setName = function(_client_name) {
      that.client_name = _client_name;
      that.peek();
      updateEnvironment();
    };

    that.setClients = function(_selected_clients) {
      that.selected_clients = _selected_clients;
      updateEnvironment();
    };
  
    that.send = function(mode, data) {
      var send = { "payload" : data };
      load("/clients/" + that.uuid + "/action/send.js" + 
                                      "?api_key=" + options['api_key'] + 
                                      "&mode=" + mode
                                      + "&" + HC.param(send), "sent");
    };
    
    that.peek = function(group_id, data) {
      load("/clients/" + that.uuid + "/action/peek.js" + 
                                      "?api_key=" + options['api_key'] +  
                                      "&group_id=" + group_id
                                      , "peeked");
    };


    that.receive = function(mode, receiveOptions) {
      if (receiveOptions !== undefined) {
        var timeout = receiveOptions['timeout'];
        delete receiveOptions['timeout'];
      }
      
      
      var params = [];
      params.push('mode=' + mode);
      params.push('api_key=' + options['api_key']);
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

    that.getID = function() {
      return that.uuid;
    };

    that.delete = function(id) {

      if ( !id ) {
        id = that.uuid;
      }
    
      load("/clients/" + id + "/environment.js"
             + "?api_key=" + options['api_key']
             + "&method=delete",
             "deleted");

    };

    return that;  
};

Linccer.autoLocation = function () {
  return (navigator.geolocation !== undefined);
};
