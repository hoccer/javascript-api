var FileCache = function(formId) {
  var that = {};
  var uploadURI = undefined;
  observable(that);
  
  var createIFrame = function() {
    var iframe = document.createElement("iframe");
    iframe.setAttribute("name", "iframe1234");
    iframe.setAttribute("witdh", "100");
    iframe.setAttribute("height", "100");
    iframe.setAttribute("src", "javascript:false");
    
    document.body.appendChild(iframe);
    
    return iframe;
  }
  
  var randomUUID = function() {
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
	}
	
  
  var getIframeContent = function(iframe) {
     var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document,
          response;
    
    return doc.body.innerHTML;
  }

  var uploader = new qq.FileUploader({
      element: document.getElementById('uploadButton'),
      action: 'http://filecache.beta.hoccer.com/v3/' + randomUUID(),
      method: 'PUT',
      debug: true,
      params: {
        "expires_in": 120
      }
  });
  
  that.cancel = function() {
    iframe.setAttribute("src", "javascript:false");
    that.fire('canceled');
  }
  
  that.uploadURI = function() {
    return uploadURI;
  }
  
  that.isReady = function() {
    return uploadURI !== undefined;
  }
  
  return that;
}