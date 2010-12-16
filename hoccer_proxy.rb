require 'sinatra'

get '/environment.js' do
  puts params.inspect

  ""
end