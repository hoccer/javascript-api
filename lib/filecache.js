var FileCache = function(formId) {
  var that = {};
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
    console.log(getIframeContent);
  }
  
  return that;
}