var geoCodingUri = 'https://maps.googleapis.com/maps/api/geocode/json'
var geoLocationUri = 'https://www.googleapis.com/geolocation/v1/geolocate?key='
var apiKey = {
  geoLocationApiKey: 'AIzaSyCeCnGgRtHiCQVEn9Fx0afqPY8w9C63LUQ',
  geoCodingApiKey: 'AIzaSyAGEwaaEBjHQPCwSw-h-VBAFSK5vk2fLB8'
}

// Use current location
document.getElementById('useCurrentLocation').addEventListener('click', function(e){
  var xmlhttp = new XMLHttpRequest()
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText)
      // log for debug
      console.info(this.responseText)
      var point1 = {
        name: 'Your current location',
        lat: response['location']['lat'],
        lng: response['location']['lng']
      }
      
      var uod = document.getElementById('uod').options[document.getElementById('uod').selectedIndex].value
      var phpEndpoint = `/?name=${point1.name.replace(/ /g, '+')}&lat=${point1.lat}&lng=${point1.lng}&uod=${uod}`
      
      window.location.href = phpEndpoint
    }
  }
  console.log(geoLocationUri + apiKey.geoLocationApiKey)
  xmlhttp.open("POST", geoLocationUri + apiKey.geoLocationApiKey, true)
  xmlhttp.send()
})

// use different location
document.getElementById('geolocation').addEventListener('submit', function (e) {
  e.preventDefault()
  var rawValue = e.currentTarget.getElementsByTagName('input')[0].value
  var apiEndpoint = '?address=' + rawValue.replace(' ', '+') + '&key=' + apiKey.geoCodingApiKey
  console.log('submit', apiEndpoint)

  var xmlhttp = new XMLHttpRequest()
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var response = JSON.parse(this.responseText)['results'][0]
      // log for debug
      //console.info(response)
      var point1 = {
        name: response['formatted_address'],
        lat: response['geometry']['location']['lat'],
        lng: response['geometry']['location']['lng']
      }
      console.log(point1)
      var uod = document.getElementById('uod').options[document.getElementById('uod').selectedIndex].value
      var phpEndpoint = `/location/?name=${point1.name.replace(/ /g, '+')}&lat=${point1.lat}&lng=${point1.lng}&uod=${uod}`

      window.location.href = phpEndpoint
    }
  }
  xmlhttp.open("GET", geoCodingUri + apiEndpoint, true)
  xmlhttp.send()

})

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2, uod) {
  if (uod === 'miles') {
    R = 3958; // Earth's radius (miles)
  } else {
    R = 6371; // Earth's radius (kilometers)
  }
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in uod
  
  return d.toFixed(2);
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function findGetParameter(parameterName) {
  var result = null,
      tmp = [];
  location.search
      .substr(1)
      .split("&")
      .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
      });
  return result;
}
var point1 = {
  name: findGetParameter('name'),
  lat: findGetParameter('lat'),
  lng: findGetParameter('lng')
}

var uod = findGetParameter('uod')

var points2 = [{
    name: "Cube3 office",
    lat: 53.485001,
    lng: -2.236833
  },
  {
    name: "Natural History Museum",
    lat: 51.496715,
    lng: -0.176367
  },
  {
    name: "Market Street",
    lat: 53.482532,
    lng: -2.241437
  },
  {
    name: "Birmingham NEC",
    lat: 52.454894,
    lng: -1.718506
  },
  {
    name: "Edinburgh Castle",
    lat: 55.948595,
    lng: -3.199913
  },
  {
    name: "Greyfriars Kirkyard",
    lat: 55.947141,
    lng: -3.192837
  },
  {
    name: "Smithfield Market",
    lat: 51.519346,
    lng: -0.101382
  }
]

for (i = 0; i < points2.length; i++) {
  points2[i]['distance'] = getDistanceFromLatLonInKm(point1.lat, point1.lng, points2[i].lat, points2[i].lng, uod)
}

points2.sort(function(a, b) {
  return parseFloat(a.distance) - parseFloat(b.distance);
});

function makeRow(point1, point2){
  return `
    <tr>
      <td>${point1.name.replace(/\+/g, ' ')}</td>
      <td>${point2.name}</td>
      <td>${point2.distance} ${uod}</td>
    </tr>
  `
}
for (i = 0; i < points2.length; i++) {
  document.querySelector('table').innerHTML += makeRow(point1, points2[i])
};
