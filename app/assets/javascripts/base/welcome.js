
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
        var img = $('<a href="#" />').append($('<img class="img-circle media-object" />').attr('src', caree.icon).attr('alt', caree.name))
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
          MAP.setCenter(marker.getPosition());
          showCareeTrail(marker.caree);
          showInfoWindow(marker);
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
          icon: caree.icon,
          title: caree.name,
          clickable: true,
        });
        marker.caree = caree;
        // https://developers.google.com/maps/documentation/javascript/examples/event-simple
        marker.addListener('click', function() {
          MAP.setCenter(marker.getPosition());
          showCareeTrail(marker.caree);
          showInfoWindow(marker);
        });
        return marker;
      }

      function showInfoWindow(marker) {
        if (dialog) {
          if (dialog.caree.path) { dialog.caree.path.setMap(null); }
          if (dialog.marker) { dialog.marker.setMap(MAP); }
          dialog.close();
        }

        var caree = marker.caree;
        var lastev = caree.last_event;
        var content = $('<div />').append(
          $('<img src="'+caree.icon+'" /><b>'+caree.name+'</b>')
        ).append(
          $('<ul/>').append(
            $('<li/>').text('event: '+lastev.event)
          ).append(
            $('<li/>').text('heartrate: '+(lastev.heartrate || '----'))
          )
        );
        dialog = new google.maps.InfoWindow({
          content: content[0],
          position: marker.position
        });
        dialog.caree = marker.caree;
        dialog.marker = marker;
        google.maps.event.addListener(dialog, 'closeclick', function(){
          dialog.caree.path.setMap(null);
          dialog.marker.setMap(MAP);
        });
        marker.setMap(null);
        dialog.open(MAP);
      }

      function showCareeTrail(caree) {
        $.get(Routes.locations_caree_path(caree.id), "", function(data) {
          if (caree.path) {
            caree.path.setMap(null);
          }
          // https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
          caree.path = new google.maps.Polyline({
            path: data,
            geodesic: true,
            strokeColor: '#FF8080',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
          caree.path.setMap(MAP);
        }, "json");
      }

      function onMqttMessage(message) {
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
              appendCaree(caree, marker);
            }, "json");
          } else {
            MARKERS[event.caree_id].setPosition(latlng);
            MARKERS[event.caree_id].caree.last_event = {
              event: event.event,
              heartrate:  event.heartrate,
              latitude:   event.location ? event.location.lat : null,
              longitude:  event.location ? event.location.lon : null,
              altitude:   event.location ? event.location.alt : null,
              acceleration_x: event.acceleration ? event.acceleration.x : null,
              acceleration_y: event.acceleration ? event.acceleration.y : null,
              acceleration_y: event.acceleration ? event.acceleration.z : null,
            };
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
