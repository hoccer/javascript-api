require 'sinatra'

get %r{/clients/([a-zA-Z0-9\-]{36,36})/environment.js} do
  puts params.inspect

  "#{params['jsonp']}({content: \"hallo\"})"
end

get %r{/clients/([a-zA-Z0-9\-]{36,36})/action/send.js} do 
  "#{params['jsonp']}({content: \"hallo\"})"
end

get %r{/clients/([a-zA-Z0-9\-]{36,36})/action/receive\.js} do
  "#{params['jsonp']}({content: \"hallo\"})"  
end