
var MQTTClient = null;
var MAP = null;
var MARKERS = [];

$(document).ready(function() {
  if ($("body").hasClass("welcome")) {

    if ($("body").hasClass("index")) {

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
          // MAP.setZoom(20);
          MAP.setCenter(marker.getPosition());
          showCareeTrail(marker.caree);
          showCareeDialog(marker.caree);
        });
      }

      function showCareeDialog(caree) {
        var ev = caree.last_event;
        $('#careeDialog .event').text(ev.event);
        $('#careeDialog .heartrate').text(ev.heartrate || "----");
        $('#careeDialog .location').text(ev.latitude+", "+ev.longitude+", "+(ev.altitude||""));
        $('#careeDialog').on("dialogclose", function(e){
          caree.path.setMap(null);
        });
        $('#careeDialog').dialog({
          title: caree.name,
          modal: false,
          closeOnEscape: true,
          position: {
            of: "#map_canvas",
            at: "center",
            my: "left top"
          },
          show: 500,
          hide: 500
        });
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
              appendNewPin(latlng, caree);
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

      function initialize() {
        var latlng = new google.maps.LatLng(35.515132, 134.1696503);
        MAP = new google.maps.Map(document.getElementById("map_canvas"), {
          zoom: 16,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        $.get(Routes.carees_path({format: 'json'}), "", function(carees) {
          carees.forEach(function(caree,index,arr){
            console.log("loading: ", caree.name, caree.last_event);
            if (caree.last_event && caree.last_event.latitude && caree.last_event.longitude) {
              var latlng = new google.maps.LatLng(caree.last_event.latitude, caree.last_event.longitude);
              appendNewPin(latlng, caree);
            }
          });
        });
        connectMQTT();
      }

      initialize();
    }
  }
});
