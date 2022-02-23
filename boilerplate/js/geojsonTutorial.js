

var map = L.map('map').setView([43.063103, -89.41091], 8); //this creates the actual map on the screen. The coordinates in the [] brackets are centered over Madison right now

//var marker = L.marker([51.5, -0.09]).addTo(map); //the marker is a little blip that you can put on the screen at a given location



var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map); //this block of code gets the basemap from openstreetmap. It utilizes a tilelayer that is already constructed and imports it into my page

//this function adds the popup feature when you click on the blip on Coors Field
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}
//this feature creates a blip on Coors Field in Denver
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map); //L.geoJSON calls the function, geojsonFeature is the variable, onEachFeature is what you want the function to do, .addTo(map) adds it to the map, which is also called variable map


var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": true //when you set this string to true, the feature will show on the map. If it is set to false you cannot see it
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];
//Below is how you call the variable
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);


//This variable creates two parallel lines that go through much of the central Great Plains
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

//this sets the style properties for the lines. The weight is the thickness
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

//add myLines to the map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);



//This block of code sets the variable states and highlights two states, one republican and one democrat by using different colors
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//This function below is what actually gets the features created above to appear on the map. Where the string 'Republican' is present, a certain color is return. Same for democrats
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

//this variable below is what sets the style parameters of the states variable
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//call the states variable through the geoJSON function
L.geoJSON(states, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);



//this creates a popup when you click on the map. It gives you latlng, something similar to what was seen in the Ajax lab before we stringified the data. 
//You can see that you add .toString() to make the lat and long data easier to read
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);