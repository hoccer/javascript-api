require 'sinatra'

get '/environment.js' do
  puts params.inspect

  ""
end

get "/send.js" do 
  puts params.inspect

  "linccer.rockOn()"
end

get "/reveive.js" do
  puts params.inspect

  "linccer.received({content: \"hallo\"})"
end