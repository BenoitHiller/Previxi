var convertMinutes = function(minutes) {
  var hours = Math.floor(minutes / 60);
  var relative_minutes = Math.floor(minutes % 60);
  return padIntToString(hours) + ":" + padIntToString(relative_minutes); 
}

var padIntToString = function(num) {
  str = String(num);
  if (str.length === 1) {
    str = "0" + str;
  }
  return str
}

function getRadiusAlpha(numBikes, numEmptyDocks) {
    var imageCanvas, context;
    var radius;
    var alpha;
    if (numBikes == 0 && numEmptyDocks == 0) {
	// edge case: station with nothing in it
	radius = 5;
	alpha = 0.0;
    } else {
	radius = (numBikes+numEmptyDocks);
	if (radius > 32) {
	    radius = 32;
	} else if (radius < 16) {
	    radius = 16;
	}

	alpha = numBikes / (numBikes+numEmptyDocks);
	if (alpha > 0.5 && alpha < 1.0) {
	    alpha=0.5;
	} else if (alpha < 0.1 && alpha > 0.0) {
	    alpha = 0.1;
	}
    }

  return [radius, alpha];
}

$(function() {
  var map = L.map('map_canvas').setView(L.latLng(45.5068, -73.591), 11);
  L.tileLayer('http://{s}.tile.cloudmade.com/f17c5c94810248b38d77a731c20e25d7/997/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18
  }).addTo(map);

  var stationLayerGroup = L.layerGroup().addTo(map);
  var classesAdded = {};

  function updateMap(minute) {
    stationLayerGroup.clearLayers()
    var stations = [];
    console.log(stations);
    $.getJSON('data/stations-' + minute + '.json', function(data) {
      data.stations.forEach(function(stationDict, i, a) {
        if (stationDict.installed) {
          i++;
	  var station = {
	    id: stationDict.id,
	    name: stationDict.name,
	    numBikes: stationDict.nbBikes,
	    numEmptyDocks: stationDict.nbEmptyDocks,
	    latlng: new L.LatLng(stationDict.lat, stationDict.long),
	  };

          var radiusAlpha = getRadiusAlpha(station.numBikes, station.numEmptyDocks);

          var className = ['circle',parseInt(radiusAlpha[1]*100)].join('-');
          if (classesAdded[className] === undefined) {
            var css = "." + className + " { border-radius: 50%; border: solid 1px rgb(255, 0, 0); background-color: rgba(255, 0, 0, " + radiusAlpha[1] + ");}";
            var style = $('<style>' + css + '</style>');
            $('html > head').append(style);
            classesAdded[className] = 1;
          }

          var myIcon = L.divIcon({className:className, iconSize: new L.Point(radiusAlpha[0]*2+4, radiusAlpha[0]*2+4)});
          var marker = L.marker(station.latlng, {icon: myIcon}).bindPopup("<b>" + station.name +
					                                  "</b><br/>Bikes: " +
					                                  station.numBikes + ' - ' +
					                                  "Docks: " + station.numEmptyDocks);
          stations.push(marker);

        }
      });
      console.log("Done");
      stationLayerGroup.addLayer(L.layerGroup(stations));
    });
  }

  updateMap(0);

  $('#horizSlider').slider({
    max: 1439,
    change: function(event, ui) {
      console.log("Value is now: " + ui.value);
      $("#time").text(convertMinutes(ui.value));
      updateMap(ui.value);
    }
  }).width(470);

  $("form#location-form").unbind();
  $("form#location-form").submit(function() {
    console.log("Submittin' time: " + $("#location-input").val());
    var url = 'http://geocoder.ca/?locate=' + $("#location-input").val()  + '+montreal+qc&geoit=xml&jsonp=1&callback=?';
    $.getJSON(url, null, function(data) {
      var latlng = new L.LatLng(parseFloat(data.latt), parseFloat(data.longt));
      map.setView(latlng, 15);

      var locationMarker = L.marker(latlng,
                                    { title: $("#location-input").val() }).addTo(map);
    });

    return false;
  });

  $("#dp").datepicker();

});
