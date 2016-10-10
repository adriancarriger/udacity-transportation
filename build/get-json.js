var Converter = require("csvtojson").Converter;
var jsonfile = require('jsonfile');
var path = require('path');

var final = {
  defaultSchedule: {
    weekdayNorth: [],
    weekdaySouth: [],
    weekendNorth: [],
    weekendSouth: []
  },
  indexedStops: {},
  metaInfo: {},
  stopsMeta: {}
}

// Get Other
getJson(__dirname + '/files/stop_times.txt', function(stop_times) {
  for (var i = 0; i < stop_times.length; i++) {
    var t = stop_times[i]; // this time
    var trip_id = t.trip_id;
    var other = '';
    if ((typeof trip_id) === 'string') {
      other = trip_id.replace(/[0-9]/g, '');
      trip_id = trip_id.replace(/\D+/g, '');
    }
    if (trip_id !== '' && trip_id > 100) { // skip non-train routes
      // indexedStops
      if (other !== 'u') {
        final.indexedStops[t.stop_id] = final.indexedStops[t.stop_id] || [];
        final.indexedStops[t.stop_id].push( Number(trip_id) );
      }
      // metaInfo        
      final.metaInfo[trip_id] = final.metaInfo[trip_id] || {};
      final.metaInfo[trip_id][t.stop_id] = final.metaInfo[trip_id][t.stop_id] || {};
      final.metaInfo[trip_id][t.stop_id].time = t.arrival_time;
      if (other === 'a' && final.metaInfo[trip_id][t.stop_id].satOnly !== false) {
        final.metaInfo[trip_id][t.stop_id].satOnly = true;
      } else {
        final.metaInfo[trip_id][t.stop_id].satOnly = false;
      }
    }
  }
  // defaultSchedule
  for (var property in final.metaInfo) {
    if (final.metaInfo.hasOwnProperty(property)) {
      if (property < 400 && isOdd(property)) {
        addToSchedule('weekdayNorth', property);
      } else if (property < 400 && !isOdd(property)) {
        addToSchedule('weekdaySouth', property);
      } else if (property > 400 && isOdd(property)) {
        addToSchedule('weekendNorth', property);
      }  else if (property > 400 && !isOdd(property)) {
        addToSchedule('weekendSouth', property);
      }
    }
  }
  // Get stops
  getJson(__dirname + '/files/stops.txt', function(stopsMeta) {
    final.stopsMeta = filterStops(stopsMeta);
    saveFile( final );
  });
});

function addToSchedule(key, trip_id) {
  if ( final.defaultSchedule[key].indexOf(trip_id) === -1 ) {
    final.defaultSchedule[key].push(trip_id);
  }
}

// http://stackoverflow.com/a/11926475/5357459
function isOdd(x) { return x & 1; };

function getJson(file, callback) {
  var converter = new Converter({});
  converter.fromFile(file,function(err,result){
    callback(result);
  });
}

function filterStops(stopsMeta) {
  var temp = {};
  for (var i = 0; i < stopsMeta.length; i++) {
    if (!isNaN( stopsMeta[i].stop_id ) && stopsMeta[i].stop_id < 100000) {
      var stopName = stopsMeta[i].stop_name;
      // filter out 'station' and 'Caltrain'
      stopName = stopName.split(' Station').join('');
      stopName = stopName.split(' Caltrain').join('');
      temp[stopsMeta[i].stop_id] = stopName;
    } 
  }
  return temp;
}

function saveFile(obj) {
  var file = path.resolve( __dirname + '/../src/assets/schedule.json' );
  jsonfile.writeFile(file, obj, function (err) {
    if (err) {
      console.error(err);
    }
    console.log('Converted to json!');
  });
}
