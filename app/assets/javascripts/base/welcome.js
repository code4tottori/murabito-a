
$(document).ready(function() {
  if ($("body").hasClass("welcome")) {

    if ($("body").hasClass("index")) {

      // append caree status to sidebar.
      var appendCaree = function(caree, marker) {
        var panel = $('<li class="panel panel-primary" />');
        var heading = $('<div class="panel-heading">').appendTo(panel);
        var link = $('<a href="#" />').text(caree.name);
        $('<h4 class="panel-title">').append(link).appendTo(heading);

        var body = $('<div class="panel-body">').appendTo(panel);
        var media = $('<div class="media">').appendTo(body);
        var img = $('<a href="#" />').append($('<img class="img-circle media-object caree-icon" />').attr('src', caree.icon).attr('alt', caree.name))
        $('<div class="media-left">').append(
            img
          ).appendTo(media);
        $('<div class="media-body">').append(
          $('<ul />').append(
              $('<li />').text('lat: ' + caree.last_event.latitude)
            ).append(
              $('<li />').text('lng: ' + caree.last_event.longitude)
            )
          ).appendTo(media);

        var onClick = function(ev) {
          showTrailAndShowInfoWindowCenter(marker);
        };
        $(link).on('click', onClick);
        $(img).on('click', onClick);

        $('ul.status').append(panel);
      };

      var MAP = null;
      var MARKERS = [];
      var dialog = null;

      function appendNewPin(latlng, caree) {
        // http://www.ajaxtower.jp/googlemaps/gmarker/index1.html
        var marker = MARKERS[caree.id] = new google.maps.Marker({
          map: MAP,
          position: latlng,
          icon: { url: caree.icon, scaledSize: new google.maps.Size(48, 48) },
          title: caree.name,
          clickable: true,
        });
        marker.caree = caree;
        // https://developers.google.com/maps/documentation/javascript/examples/event-simple
        marker.addListener('click', function() {
          showTrailAndShowInfoWindowCenter(marker);
        });
        return marker;
      }

      function showTrailAndShowInfoWindowCenter(marker) {
        MAP.setCenter(marker.getPosition());
        showCareeTrail(marker.caree);
        showInfoWindow(marker);
      }

      function showInfoWindow(marker) {
        hideInfoWindowAndPath();

        var caree = marker.caree;
        var lastev = caree.last_event;
        var event_class = (lastev.event=='TUMBLED') ? 'tumbled' : 'moved';
        var content = $('<div class="infoWindow" />').append(
          $('<img class="img-circle media-object caree-icon" src="'+caree.icon+'" /><b>'+caree.name+'</b>')
        ).append(
          $('<ul/>').append(
            $('<li class="event '+event_class+'"/>').text(lastev.event)
          ).append(
            $('<li/>').text((lastev.heartrate || '----'))
          )
        );
        dialog = new google.maps.InfoWindow({
          content: content[0],
          position: marker.position
        });
        dialog.caree = marker.caree;
        dialog.marker = marker;
        google.maps.event.addListener(dialog, 'closeclick', function(){
          hideInfoWindowAndPath();
        });
        marker.setMap(null);
        dialog.open(MAP);
      }

      function showCareeTrail(caree) {
        $.get(Routes.locations_caree_path(caree.id), "", function(data) {
          if (caree.path) {
            caree.path.setMap(null);
          }
          if (dialog && dialog.caree.id==caree.id) {
            // https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
            caree.path = new google.maps.Polyline({
              path: data,
              geodesic: true,
              strokeColor: '#FF8080',
              strokeOpacity: 1.0,
              strokeWeight: 2
            });
            caree.path.setMap(MAP);
          }
        }, "json");
      }

      function hideInfoWindowAndPath() {
        if (dialog) {
          if (dialog.caree.path) { dialog.caree.path.setMap(null); }
          if (dialog.marker) { dialog.marker.setMap(MAP); }
          dialog.close();
          dialog = null;
        }
      }

      function onMqttMessage(message) {
        var set_last_event = function(last_event, event) {
          last_event.event = event.event;
          last_event.heartrate = event.heartrate;
          last_event.latitude  = event.location ? event.location.lat : null;
          last_event.longitude = event.location ? event.location.lon : null;
          last_event.altitude  = event.location ? event.location.alt : null;
          last_event.acceleration_x = event.acceleration ? event.acceleration.x : null;
          last_event.acceleration_y = event.acceleration ? event.acceleration.y : null;
          last_event.acceleration_y = event.acceleration ? event.acceleration.z : null;
        };

        var event = null;
        try {
          event = JSON.parse(message.payloadString);
        } catch(e) {
          console.log(e, message.payloadString);
          return;
        }
        var location = event.location;
        if (location && location.lat && location.lon) {
          var latlng = new google.maps.LatLng(location.lat, location.lon);
          if (MARKERS[event.caree_id]==null) {
            $.get(Routes.caree_path(event.caree_id, {format: 'json'}), "", function(caree) {
              var marker = appendNewPin(latlng, caree);
              if (!marker.caree.last_event) {
                // DBにまだなかった.
                marker.caree.last_event = {};
                set_last_event(marker.caree.last_event, event);
              }
              appendCaree(caree, marker);
              if (event.event=='TUMBLED') {
                showTrailAndShowInfoWindowCenter(marker);
              }
            }, "json");
          } else {
            var marker = MARKERS[event.caree_id];
            marker.setPosition(latlng);
            set_last_event(marker.caree.last_event, event);
            if (event.event=='TUMBLED') {
              showTrailAndShowInfoWindowCenter(marker);
            }
          }
        } else {
          console.log("dropped: ", message.payloadString);
        }
      }

      var MQTTClient = null;

      function connectMQTT() {
        $.get(Routes.mqtturis_path(), "", function(resp){
          var endpoint = resp.uri;
          var clientId = Math.random().toString(36).substring(7);
          var connectOptions = {
            useSSL: true,
            timeout: 3,
            mqttVersion: 4,
            onSuccess: function() {
              MQTTClient.subscribe("murabito-a/moved");
              document.getElementById('status').innerHTML = "subscribed";
            }
          };
          MQTTClient = new Paho.MQTT.Client(endpoint, clientId);
          MQTTClient.connect(connectOptions);
          MQTTClient.onMessageArrived = onMqttMessage;
          MQTTClient.onConnectionLost = function(e) {
            console.log("MQTTClient.onConnectionLost", e);
            document.getElementById('status').innerHTML = "DISCONNECTED";
            setTimeout(function() {
              connectMQTT();
            }, 1);
          };
        }, "json");
      }

      MAP = new google.maps.Map(document.getElementById("map_canvas"), {
        zoom: 16,
        center: new google.maps.LatLng(35.515132, 134.1696503),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      $.get(Routes.carees_path({format: 'json'}), "", function(carees) {
        carees.forEach(function(caree,index,arr){
          console.log("loading: ", caree.name, caree.last_event);
          if (caree.last_event && caree.last_event.latitude && caree.last_event.longitude) {
            var latlng = new google.maps.LatLng(caree.last_event.latitude, caree.last_event.longitude);
            var marker = appendNewPin(latlng, caree);
            appendCaree(caree, marker);
          }
        });
      });
      connectMQTT();
    }
  }
});
