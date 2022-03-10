//lab 1 leaflet map final

var map;

//var minValue;
var dataStats = {};
function createMap(){

    //create the map
    map = L.map('mapid', {
        center: [44, -91], //center map on central Wisconsin
        zoom: 6.5
    });

    //add OSM base tilelayer. I added in my own tilelayer to fit the theme of cows.
    L.tileLayer('https://api.mapbox.com/styles/v1/blinden/cl0kglkcd001e14myzlh53fx8/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYmxpbmRlbiIsImEiOiJja3RicnN2aXQxejJnMm9yNXJ5ODdnZnlzIn0.xxMkVduVt5ll-Trxg1qBPQ', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18, //set zoom to occupy most of Wisconsin
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYmxpbmRlbiIsImEiOiJja3RicnN2aXQxejJnMm9yNXJ5ODdnZnlzIn0.xxMkVduVt5ll-Trxg1qBPQ'
    }).addTo(map);

    //call getData function
    getData(map);
};


function calcStats(data) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for (var city of data.features) {
      //loop through each year, start at 1987, end at 2017
      for (var year = 1987; year <= 2017; year += 5) {
        //get population for current year. change string to Yr_
        var value = city.properties["Yr_" + String(year)];
        //add value to array
        allValues.push(value);
      }
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function (a, b) {
      return a + b;
    });
    dataStats.mean = sum / allValues.length;
  }

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 10;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius

    return radius;
};
//create function PopupContent to save space in the code below
function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.Yr = attribute.split("_")[1];
    this.population = this.properties[attribute];
    this.formatted = "<p><b>County:</b> " + this.properties.County + "</p><p><b>Cows in " + this.Yr + ":</b> " + this.population + " thousand</p>";
};


//function to convert markers to circle markers and add popups
function pointToLayer(feature, latlng,attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    
    console.log(attributes)
    console.log('var attribute is ' + attribute); //this should loop through to give you many values in the console

    //create marker options, create pink ones to match a cow's pink nose
    var options = {
        fillColor: "#D464A4",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = new PopupContent(feature.properties, attribute);

 
    layer.bindPopup(popupContent.formatted, {
        offset: new L.Point(0,-options.radius)
    });

  //return the circle marker to the L.geoJson pointToLayer option
  return layer; 
    
};

function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


function getCircleValues(attribute) {
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
      max = -Infinity;
  
    map.eachLayer(function (layer) {
      //get the attribute value
      if (layer.feature) {
        var attributeValue = Number(layer.feature.properties[attribute]);
  
        //test for min
        if (attributeValue < min) {
          min = attributeValue;
        }
  
        //test for max
        if (attributeValue > max) {
          max = attributeValue;
        }
      }
    });
  
    //set mean
    var mean = (max + min) / 2;
  
    //return values as an object
    return {
      max: max,
      mean: mean,
      min: min,
    };
  }


//in this function you need to make sure that the math function does not give you have a cow for the mean circle value. This error can be fixed by moving around the parentheses
  function updateLegend(attribute) {
    //create content for legend
    var year = attribute.split("_")[1];
    //replace legend content
    document.querySelector("span.year").innerHTML = year;
  
    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(attribute);
  
    for (var key in circleValues) {
      //get the radius
      var radius = calcPropRadius(circleValues[key]);
  
      document.querySelector("#" + key).setAttribute("cy", 59 - radius);
      document.querySelector("#" + key).setAttribute("r", radius)
  
      document.querySelector("#" + key + "-text").textContent = Math.round((circleValues[key] * 100) / 100) + " thousand";

    };
  };
  
function updatePropSymbols(attribute) {
    map.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
        //access feature properties
        var props = layer.feature.properties;

        //update each feature's radius based on new attribute values
        var radius = calcPropRadius(props[attribute]);
        layer.setRadius(radius);
        //plug in new PopupContent to shorten the code
        var popupContent = new PopupContent(props, attribute);
        
        popup = layer.getPopup();
        popup.setContent(popupContent.formatted).update();
        }
    });

    updateLegend(attribute);
};


function processData(data) {
    //empty array to hold attributes
    var attributes = [];
  
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
  
    //push each attribute name into attributes array
    for (var attribute in properties) {
      //only take attributes with population values
      if (attribute.indexOf("Yr") > -1) {
        attributes.push(attribute);
      }
    }
  
    return attributes;
  }

//create the sequence bar in the bottom left
  function createSequenceControls(attributes){   
    
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
  
        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
  
            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')
  
            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/cowL.png"></button>'); //utilize cows facing opposite ways instead of arrows
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/cowR.png"></button>'); 
  
            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);
  
  
            return container;
  
        }
    });
  
    map.addControl(new SequenceControl());
  
    ///////add listeners after adding the control!///////
    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
  
    var steps = document.querySelectorAll('.step');
  
    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };
  
            //Step 8: update slider
            document.querySelector('.range-slider').value = index;
  
            //Step 9: pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })
  
    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //Step 6: get the new index value
        var index = this.value;
  
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
  
  };
  
  //create the legend
  function createLegend(attributes) {
    var LegendControl = L.Control.extend({
      options: {
        position: "bottomright",
      },
  
      onAdd: function () {
        // create the control container with a particular class name
        var container = L.DomUtil.create("div", "legend-control-container");
        //change year to 1987 otherwise if you refresh the page you receive the wrong year
        container.innerHTML = '<p class="temporalLegend">Population in <span class="year">1987</span></p>';
  
        //Step 1: start attribute legend svg string
        var svg = '<svg id="attribute-legend" width="160px" height="60px">';
  
        //array of circle names to base loop on, use these string values when you style them in css
        var circles = ["max", "mean", "min"];
  
        //Step 2: loop to add each circle and text to svg string
        for (var i = 0; i < circles.length; i++) {
          //calculate r and cy
          var radius = calcPropRadius(dataStats[circles[i]]);
          console.log(radius);
          var cy = 59 - radius; //cy is the center of the circle
          console.log(cy);
  
          //circle string
          svg +=
            '<circle class="legend-circle" id="' +
            circles[i] +
            '" r="' +
            radius +
            '"cy="' +
            cy +
            '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';
  
          //evenly space out labels
          var textY = i * 20 + 20;
          console.log(dataStats[circles[i]])
          //text string
          svg +=
            '<text id="' +
            circles[i] +
            '-text" x="65" y="' +
            textY +
            '">' +
            Math.round(dataStats[circles[i]]) +
            " thousand" +
            "</text>";
        }

  
        //close svg string
        svg += "</svg>";
  
        //add attribute legend svg to container
        container.insertAdjacentHTML('beforeend',svg);
  
        return container;
      },
    });
  
    map.addControl(new LegendControl());
  }
  

  function getData(map){
    //load the data
    fetch("data/reformattedcows.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json);
            calcStats(json)
            console.log('test fetch function')
            //call function to create proportional symbols, call all 3
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
        })
  };


document.addEventListener('DOMContentLoaded',createMap)
