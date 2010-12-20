require 'sinatra'

get '/environment.js' do
  puts params.inspect

  ""
end

get "/send.js" do 
  puts params.inspect

  "linccer.onSend()"
end

get "/reveive.js" do
  puts params.inspect

  "linccer.onReceived({content: \"hallo\"})"
end