require 'aws-sdk'
require 'json'
require 'pp'

class SQSClient
  class SkipDeleteMessage < RuntimeError; end

  attr_reader   :region, :uri, :client

  def initialize(uri)
    cred = Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']) if ENV['AWS_ACCESS_KEY_ID'] and ENV['AWS_SECRET_ACCESS_KEY']
    proxy = ENV['HTTPS_PROXY'] || ENV['HTTP_PROXY']
    @region = (ENV['AWS_REGION'] || 'ap-northeast-1').strip
    @uri = uri
    if @region and @uri
      if cred and proxy
        @client = Aws::SQS::Client.new(region: @region, credentials: cred, http_proxy: proxy)
      else
        @client = Aws::SQS::Client.new(region: @region)
      end
    end
  end

  def send_message(message, uri=nil)
    uri ||= @uri
    @client.send_message(queue_url: uri, message_body: message)
  end

  def handle_message(visibility_timeout: 10)
    raise ArgumentError, 'block required.' unless block_given?
    @client.receive_message(queue_url: @uri,
                            wait_time_seconds: 1,
                            visibility_timeout: visibility_timeout,
                            max_number_of_messages: 1).messages.each{|msg|
      if yield(msg.body)
        handle = msg.receipt_handle
        @client.delete_message(queue_url: @uri, receipt_handle: handle)
      end
    }
  end

  def poll_message(visibility_timeout: 10)
    raise ArgumentError, 'block required.' unless block_given?
    ENV['AWS_REGION'] ||= @region
    poller = Aws::SQS::QueuePoller.new(@uri, client: @client)
    poller.poll(visibility_timeout: visibility_timeout, max_number_of_messages: 1) {|msg|
      unless yield(msg.body, msg)
        throw :skip_delete
      end
    }
  end
end
