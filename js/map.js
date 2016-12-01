function initMap() {
  var myLatLng = {lat: 29.227945, lng: 68.857616};
<<<<<<< HEAD
  //var geocoder = new google.maps.Geocoder();
=======
  var geocoder = new google.maps.Geocoder();
>>>>>>> origin/plotting-points-on-map

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: myLatLng
  });

  //The part right below this comment is how the marker is added to the map
  /*var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hello, my name is Pakistan!'
  });*/

  d3.csv("data/Drone Strike Data.csv", function(error, data) {

    data.forEach(function(d) {
      d["Latitude"] = +d["Latitude"];
      d["Longitude"] = +d["Longitude"];

      var position = new google.maps.LatLng(d["Latitude"], d["Longitude"]);

      var marker = new google.maps.Marker({
        map: map,
        position: position
      });
    })
  })
}

initMap();