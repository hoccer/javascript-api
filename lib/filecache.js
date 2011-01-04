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
  
  var getIframeContent = function(iframe) {
     var doc = iframe.contentDocument ? iframe.contentDocument: iframe.contentWindow.document,
          response;
    
    return doc.body.innerHTML;
  }
  
  var iframe = createIFrame();
  
  var form = document.getElementById(formId);
  form.setAttribute('target', 'iframe1234');  
  
  iframe.onload = function() {
    uploadURI = getIframeContent(iframe);
    that.fire('loaded', uploadURI);
  }
  
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