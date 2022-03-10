

var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map, center the map over wisconsin as this is the location of the data. Zoom level to 7 to fit properly
    map = L.map('map', {
        center: [44.363103, -89.41091],
        zoom: 7
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

//This function is what gets the list from the geojson file to appear when you click on each point
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};


//function to retrieve the data and place it on the map. This uses the same fetch response that we learned from last activity
function getData(){
    //load the data
    fetch("data/whereMilk.geojson")
        .then(function(response){
            return response.json();
        })
        
         //Example 2.3 load the data    
         .then(function(json){            
            //create marker options, colors, style
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map.
            // very important to call the function 'onEachFeature' down below. This ensures that the function will actually work
            L.geoJson(json, {
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        });
};

document.addEventListener('DOMContentLoaded',createMap)
