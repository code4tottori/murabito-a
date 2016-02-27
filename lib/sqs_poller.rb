require_relative 'sqs_client'
require 'ostruct'


class SQSPoller
private
  class ValidationError < ArgumentError; end

  def test_hash(value, key)
    return true if value.nil?
    return true if value.is_a? Hash
    raise ValidationError, "#{key} is not like a Hash"
  end

  def to_float(value)
    return nil if value.nil?
    value.to_f
  end

  def logger
    Rails.logger
  end

public
  def initialize(queue_uri)
    @queue_uri = queue_uri
    Rails.logger.level = Logger::INFO
  end

  def poll
    Rails.logger.info "Starting SQS Poller"
    Rails.logger.info "- queue_uri: #{@queue_uri}"

    SQSClient.new(@queue_uri).poll_message{|msg|
      begin
        params = OpenStruct.new(JSON.parse(msg))
        raise ValidationError, 'caree_id is nil.'  unless params.caree_id
        raise ValidationError, 'event is nil.'   unless params.event
        params.heartrate = to_float(params.heartrate)
        if test_hash(params.location, :location)
          params.location = OpenStruct.new(params.location)
          params.location.lat = to_float(params.location.lat)
          params.location.lon = to_float(params.location.lon)
          params.location.alt = to_float(params.location.alt)
        end
        if test_hash(params.acceleration, :acceleration)
          params.acceleration = OpenStruct.new(params.acceleration)
          params.acceleration.x = to_float(params.acceleration.x)
          params.acceleration.y = to_float(params.acceleration.y)
          params.acceleration.z = to_float(params.acceleration.z)
        end
        caree = Caree.find(params.caree_id)
        ev = Event.create!(
          caree_id:     params.caree_id,
          event:        params.event,
          heartrate:    params.heartrate,
          latitude:     params.location.lat,
          longitude:    params.location.lon,
          altitude:     params.location.alt,
          acceleration_x: params.acceleration.x,
          acceleration_y: params.acceleration.y,
          acceleration_z: params.acceleration.z,
          created_at:   params.datetime,
        )
        Rails.logger.info "Stored: #{caree.name}@#{Event.find(ev.id).to_json}"
        true
      rescue ValidationError, ActiveRecord::RecordNotFound, JSON::ParserError
        Rails.logger.warn "Store failed. dropped. '#{msg}' - #{$!.class} `#{$!.message}`"
        true
      rescue
        Rails.logger.error "Store failed. retry. '#{msg}' - #{$!.class} `#{$!.message}`"
        false
      end
    }
  end
end

if $0==__FILE__
  if ARGV.include? '-D'
    ARGV.delete('-D')
    puts "Daemonize now."
    Process.daemon(true)
  end
  queue_uri = ARGV[0] || ENV['SQS_URI'] || 'https://sqs.ap-northeast-1.amazonaws.com/611913629108/murabito-a'
  SQSPoller.new(queue_uri).poll
end
