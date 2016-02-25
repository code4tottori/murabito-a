class MqtturisController < ApplicationController
  # GET /mqtturis.json
  def index
    uri = SigV4UtilsForAwsIoT.createEndpoint(ENV['MQTT_URI'] || 'a284fmjqennl6d.iot.ap-northeast-1.amazonaws.com')
    render text: {uri:uri}.to_json
  end
end
