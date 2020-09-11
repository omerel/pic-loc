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
            eventDisplay.innerHTML = 'Your event: '+jsonObj[0].EVENT_NAME;
            document.getElementById('viewer').innerHTML = htmlTemplate;
        },
        error: function(error){
            console.log('Error ${error}');
        }
    });
}