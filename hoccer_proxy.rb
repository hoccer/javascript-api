require 'sinatra'

get %r{/clients/([a-zA-Z0-9\-]{36,36})/environment.js} do
  puts params.inspect

  ""
end

get %r{/clients/([a-zA-Z0-9\-]{36,36})/action/send.js} do 
  puts params.inspect

  "linccer.onSend()"
end

get %r{/clients/([a-zA-Z0-9\-]{36,36})/action/receive\.js} do
  "linccer.onReceived({content: \"hallo\"})"
end