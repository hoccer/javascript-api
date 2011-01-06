var FileCache = function() {
  var that = {};
  var uploadURI = undefined;
  HC.observable(that);
  
	var uploader, uploadURI; 
  uploader = new qq.UploadHandlerXhr({
    method: 'PUT',
    debug: true,
    onComplete: function(id, filename) {
      that.fire('loaded', filename);
    },
    onProgress: function(id, fileName, loaded, total) {
      that.fire('progress', loaded/total);
    }
  });
  
  that.cancel = function() {
    uploader.cancelAll();
    that.fire('canceled');
  }
  
  that.uploadURI = function() {
    return uploadURI;
  }
    
  that.upload = function(file) {
    uploadURI = 'http://filecache.beta.hoccer.com/v3/' + HC.randomUUID();
  	
    var id = uploader.add(file);
    uploader.upload(id, {"expires_in": 120 }, uploadURI);
  }
  
  return that;
}