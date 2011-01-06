var FileCache = function(buttonId) {
  var that = {};
  var uploadURI = undefined;
  observable(that);
  
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
	
	var uploadURI = 'http://filecache.beta.hoccer.com/v3/' + randomUUID();
  var uploader = new qq.FileUploader({      
      element: document.getElementById(buttonId),
      action: uploadURI,
      method: 'PUT',
      debug: true,
      params: {
        "expires_in": 120
      },
      onComplete: function(id, filename) {
        that.fire('loaded', filename);
      },
      onProgress: function(id, fileName, loaded, total) {
        that.fire('progress', loaded/total);
      }
  });
  
  that.cancel = function() {
    uploader.cancel();
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