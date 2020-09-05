"use strict";!function(){var n=$("html"),t=function(){$(".btn-menu").on("click",function(t){t.preventDefault(),n.toggleClass("menu-opened")})},e=function(){t()};e()}();
var UrlApiGet = 'https://vdgf33zpdb.execute-api.eu-west-1.amazonaws.com/v1/events/';
var UrlApiPost = 'https://vdgf33zpdb.execute-api.eu-west-1.amazonaws.com/v1/event'
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
// ##################
//    add new event in event DB
// ##################
function addEvent() {
    var event_name = document.getElementById("event_name").value;
    var radius = document.getElementById("radius").value;
    var time_window = document.getElementById("time_window").value;
    var files = document.getElementById("photoupload").files;
    if (!files.length) {
      return alert("Please choose a file to upload first.");
    }
    var file = files[0];
    var fileName = file.name;  
    console.log(event_name,radius,time_window,fileName);
    $.ajax({
        method: 'POST',
        url:UrlApiPost,
        headers: {
        },
        data: JSON.stringify({
            "event_name" : event_name,
            "srcKey" : fileName,
            "radius" : radius,
            "time_window" : time_window
        }),
        contentType: 'application/json',
        success: function(result){
            var jsonResult = JSON.parse(result);
            var eventIdDisplay = document.getElementById('event_id');
            eventIdDisplay.innerHTML = 'Your Event ID is: '+ jsonResult.event_id;
            console.log('Event ID'+jsonResult.event_id);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            alert('An error occured when requesting:\n' + jqXHR.responseText);
        }
    });
}
// ##################
//    Submit Event : upload the image and call addevent method
// ##################
function submitEvent() {
    var files = document.getElementById("photoupload").files;
    if (!files.length) {
      return alert("Please choose a file to upload first.");
    }
    var file = files[0];
    var fileName = file.name;  
    var photoKey = fileName;

    // update waiting
    var eventIdDisplay = document.getElementById('event_id');
    eventIdDisplay.innerHTML = 'Waiting...';

    // Use S3 ManagedUpload class as it supports multipart uploads
    var upload = new AWS.S3.ManagedUpload({
    
      params: {
        Bucket: bucketName,
        Key: photoKey,
        Body: file,
        ACL: "public-read"
      }
    });
  
    var promise = upload.promise();
  
    promise.then(
      function(data) {
        addEvent()
        alert("Successfully uploaded and create event.");
      },
      function(err) {
        console.log(err,err.message);
        // return alert("There was an error uploading your photo: ", err.message);

      }
    );
  }
