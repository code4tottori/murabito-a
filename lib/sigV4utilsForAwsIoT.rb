require 'openssl'
require 'uri'
require 'time'

module SigV4UtilsForAwsIoT
  class << self
  private
    def sign(key, msg)
      OpenSSL::HMAC.hexdigest('sha256', key, msg)
    end

    def sha256(msg)
      OpenSSL::Digest.hexdigest("sha256", msg)
    end

    def getSignatureKey(key, dateStamp, regionName, serviceName)
        kDate    = OpenSSL::HMAC.digest('sha256', "AWS4" + key, dateStamp)
        kRegion  = OpenSSL::HMAC.digest('sha256', kDate, regionName)
        kService = OpenSSL::HMAC.digest('sha256', kRegion, serviceName)
        kSigning = OpenSSL::HMAC.digest('sha256', kService, "aws4_request")

        kSigning
    end

    def encodeURIComponent(str)
      URI.escape(str, /[^-_.!~*'()a-zA-Z\d]/u)
    end

  public
    def createEndpoint(endpoint, regionName:nil, accessKey:nil, secretKey:nil)
      regionName ||= ENV['AWS_REGION'] || 'ap-northeast-1'
      accessKey  ||= ENV['AWS_ACCESS_KEY_ID']
      secretKey  ||= ENV['AWS_SECRET_ACCESS_KEY']
      time = Time.now.utc
      dateStamp = time.strftime("%Y%m%d")
      amzdate = time.strftime("%Y%m%dT%H%M%SZ")
      service = 'iotdevicegateway'
      algorithm = 'AWS4-HMAC-SHA256'
      method = 'GET'
      canonicalUri = '/mqtt'

      credentialScope = dateStamp + '/' + regionName + '/' + service + '/' + 'aws4_request'
      canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256'
      canonicalQuerystring << '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope)
      canonicalQuerystring << '&X-Amz-Date=' + amzdate
      canonicalQuerystring << '&X-Amz-SignedHeaders=host'

      canonicalHeaders = 'host:' + endpoint + "\n"
      payloadHash = sha256('')
      canonicalRequest = method + "\n" + canonicalUri + "\n" + canonicalQuerystring + "\n" + canonicalHeaders + "\nhost\n" + payloadHash

      stringToSign = algorithm + "\n" +  amzdate + "\n" +  credentialScope + "\n" +  sha256(canonicalRequest)
      signingKey = getSignatureKey(secretKey, dateStamp, regionName, service)
      signature = sign(signingKey, stringToSign)

      canonicalQuerystring << '&X-Amz-Signature=' + signature
      return 'wss://' + endpoint + canonicalUri + '?' + canonicalQuerystring
    end
  end
end

if $0==__FILE__
  puts SigV4UtilsForAwsIoT.createEndpoint(
    # http://docs.aws.amazon.com/ja_jp/iot/latest/developerguide/authorization.html
    'a284fmjqennl6d.iot.ap-northeast-1.amazonaws.com',  # Require 'lowercamelcase'!!
    regionName:nil,                                     # Your Region
    accessKey:ARGV[0],                                  # AWS_ACCESS_KEY_ID
    secretKey:ARGV[1]                                   # AWS_SECRET_ACCESS_KEY
  )
end
