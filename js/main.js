"use strict";!function(){var n=$("html"),t=function(){$(".btn-menu").on("click",function(t){t.preventDefault(),n.toggleClass("menu-opened")})},e=function(){t()};e()}();
var UrlApiGet = 'https://vdgf33zpdb.execute-api.eu-west-1.amazonaws.com/v1/events/';
var S3Url = '.s3-eu-west-1.amazonaws.com/';
var bucketName = 'pic-loc-awsbucket';
var bucketRegion = 'eu-west-1';
var IdentityPoolId = 'eu-west-1:be6d13a6-826d-4cd0-b03d-6a8a538b2974';

AWS.config.update({
  region:  bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: bucketName }
});

 $(function onDocReady() {
    $('#request').click(handleRequestClick);

});

// ##################
//    handleRequestClick
// ##################
function handleRequestClick(event) {
    var event_id = document.getElementById("event_id").value;
    document.getElementById('viewer').innerHTML = '';
    // update waiting
    var eventDisplay = document.getElementById('event_details');
    eventDisplay.innerHTML = 'Waiting...';
    getPhotos(event_id);
}
// ##################
//    Get all images that related to the requested event id
// ##################
function getPhotos(event_id) {
    $.ajax({
        url:UrlApiGet+event_id,
        type:"GET",
        success: function(result){
            var jsonResult  = JSON.stringify(result);
            var jsonObj = JSON.parse(jsonResult);
            console.log(jsonObj);
            var htmlTemplate ='';
            var photos = jsonObj[1].map(function(photo) {
                console.log(photo);
                htmlTemplate = htmlTemplate + 
                '<div><p>'+photo.KEY.S+'</p></div>'+
                '<img src="https://'+photo.BUCKET.S+S3Url+photo.KEY.S+'" alt="image"></img>';
            });
            // update waiting
            var eventDisplay = document.getElementById('event_details');
            eventDisplay.innerHTML = jsonObj[0].EVENT_NAME;
            document.getElementById('viewer').innerHTML = htmlTemplate;
            updateMap(jsonObj[0],jsonObj[1]);
        },
        error: function(error){
            console.log('Error ${error}');
        }
    });
}


function updateMap(eventJson,photoJson){
  var mymap = L.map('mapid').setView([eventJson.CENTER_LON,eventJson.CENETER_LAT], 13);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 20,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
  }).addTo(mymap);
  
  // var marker = L.marker([51.5, -0.09]).addTo(mymap);
  var circle = L.circle([eventJson.CENTER_LON, eventJson.CENETER_LAT], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.0,
    radius: eventJson.RADUIS,
  }).addTo(mymap);
  circle.bindPopup("<b>Event name:</b><br>"+eventJson.EVENT_NAME+"</br>");//.openPopup();

  photoJson.map(function(photoObject) {
    var photo = JSON.parse(photoObject.geoJson.S);
    var photo_lat = photo.coordinates[0];
    var photo_lon = photo.coordinates[1];
    var photoMark = L.marker([photo_lat, photo_lon]).addTo(mymap);
    photoMark.bindPopup("<b>"+photoObject.KEY.S+"</b>");
});
}
