// Here are the URLs for the data
var queryQuakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"
var queryPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Get the data on the Quakes first, then ...
d3.json(queryQuakesURL, function(data) {
  // Got the data on the Quakes, now get the data on the Plates
  gotQuakesGetPlates(data.features);
});

function gotQuakesGetPlates(quakesData) {
  d3.json(queryPlatesURL, function(data) {
    // Got both sets of data.  Now to create the map
    createFeatures(quakesData, data.features);
  });
}

// But first, let's define our colors for earthquakes with a magnitude of "d"
function getColor(d) {
	return d >= 7 ? '#800026' :
	       d >= 6 ? '#bd0026' :
	       d >= 5 ? '#e31a1c' :
	       d >= 4 ? '#fc4e2a' :
	       d >= 3 ? '#fd8d3c' :
         d >= 2 ? '#ffff33' :
                  '#41ab5d' ;
}

// Define the radius of the circle based on the magnitude.  Scale it so that it is visible on the map
function getRadius (magnitude) {
  return (magnitude) * 25000;
}

// Create the map!!!
function createFeatures(earthquakeData, platesData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the magnitude, place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + "Magnatude: " + feature.properties.mag + "<hr>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the earthquakeData
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5}
      )}
  });

  // Create a GeoJSON layer containing the platesData
  var plates = L.geoJson(platesData, {
    style: function (feature) {
      var latlngs = (feature.geometry.coordinates);
      return L.polyline(latlngs, {color:'red'});
   }});

  // Sending our earthquakes and plates to the createMap function
  createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

  // Define the satellite, outdoors and light map layers
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satellitemap,
    "Outdoors Map": outdoorsmap,
    "Grayscale Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };

  // Create our map, giving it the satellitemap, earthquakes and plates layers to display on load
  // Center in the Atlantic Ocean, and zoom so that we can see the whole world!!!
  var myMap = L.map("map", {
    center: [20, -10],
    zoom: 2,
    layers: [satellitemap, earthquakes, plates]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Add a legend to the map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {
  var div = L.DomUtil.create('div', 'info legend'),

    // define the categories for the legend, i.e. the different magnitudes
    categories = [0,2,3,4,5,6];

  // for each of the "categories", add a row to the legend
  for (var i = 0; i < categories.length; i++) {

    div.innerHTML += 
      '<i style="background:' + getColor(categories[i]) + '"></i> ' +
        categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] + '<br>' : '+');
  }
  return div;
  };

legend.addTo(myMap);
}