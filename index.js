// Environment variables
var thisUrl = window.location.href
if (thisUrl.indexOf('localhost') > -1) {
  var ENV = '/'
} else {
  var ENV = '/location/'
}

if (thisUrl.indexOf('https') > -1) {
  document.getElementById('useCurrentLocation').style.display = 'inline-block'
} else {
  document.getElementById('useCurrentLocation').style.display = 'none'
}

var geoCodingUri = 'https://maps.googleapis.com/maps/api/geocode/json'
var apiKey = {
  geoCodingApiKey: 'AIzaSyAGEwaaEBjHQPCwSw-h-VBAFSK5vk2fLB8'
}
var loader = document.getElementById('loader')
// Use current location
document.getElementById('useCurrentLocation').addEventListener('click', function (e) {
  e.preventDefault()
  loader.setAttribute('data-state', 'loading')
  var startPos

  var geoSuccess = function (position) {
    startPos = position

    var point1 = {
      name: 'Your current location',
      lat: startPos.coords.latitude,
      lng: startPos.coords.longitude
    }

    var uod = document.getElementById('uod').options[document.getElementById('uod').selectedIndex].value
    var returnUri = ENV + `?name=${point1.name.replace(/ /g, '+')}&lat=${point1.lat}&lng=${point1.lng}&uod=${uod}`

    window.location.href = returnUri
  }

  navigator.geolocation.getCurrentPosition(geoSuccess)

})

// use different location
document.getElementById('geolocation').addEventListener('submit', function (e) {
  e.preventDefault()
  loader.setAttribute('data-state', 'loading')
  var rawValue = e.currentTarget.getElementsByTagName('input')[0].value
  var apiEndpoint = '?address=' + rawValue.replace(' ', '+') + ', United Kingdom&key=' + apiKey.geoCodingApiKey
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
      var returnUri = ENV + `?name=${point1.name.replace(/ /g, '+')}&lat=${point1.lat}&lng=${point1.lng}&uod=${uod}`

      window.location.href = returnUri
    }
  }
  xmlhttp.open("GET", geoCodingUri + apiEndpoint, true)
  xmlhttp.send()

})

function getDistance(point1, point2, uod) {
  if (uod === 'mi') {
    R = 3958 // Earth's radius (miles)
  } else {
    R = 6371 // Earth's radius (kilometers)
  }
  var dLat = deg2rad(point2.lat - point1.lat); // deg2rad below
  var dLon = deg2rad(point2.lng - point1.lng);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c // Distance in uod

  return d.toFixed(2)
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
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
  points2[i]['distance'] = getDistance(point1, points2[i], uod)
}

points2.sort(function (a, b) {
  return parseFloat(a.distance) - parseFloat(b.distance);
});

function makeRow(point1, point2) {
  return `
    <tr>
      <td>${point2.name}</td>
      <td>${point2.distance}<span class="muted-text">${uod}</span></td>
    </tr>
  `
}
document.querySelector('#from').innerText = point1.name.replace(/\+/g, " ")
for (i = 0; i < points2.length; i++) {
  document.getElementsByTagName('tbody')[0].innerHTML += makeRow(point1, points2[i])
};