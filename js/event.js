"use strict";!function(){var n=$("html"),t=function(){$(".btn-menu").on("click",function(t){t.preventDefault(),n.toggleClass("menu-opened")})},e=function(){t()};e()}();
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
    var sliderRadius = document.getElementById("sliderRadius");
    var radiusText = document.getElementById("radiusText");
    radiusText.innerHTML = sliderRadius.value;
    sliderRadius.oninput = function() {
    radiusText.innerHTML = this.value;
    }
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
//    add new event in event DB
// ##################
function addEvent() {
    var event_name = document.getElementById("event_name").value;
    var radius = document.getElementById("radiusText").innerHTML;
    var time_window = getTimeInputToMinutes();
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
            var textEventIdDisplay = document.getElementById('text_event_id');
            textEventIdDisplay.innerHTML = 'Save your new event code: ';
            eventIdDisplay.innerHTML = jsonResult.event_id;
            console.log('Event ID'+jsonResult.event_id);
        },
        error: function ajaxError(jqXHR, textStatus, errorThrown) {
            console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
            alert('An error occured when requesting:\n' + jqXHR.responseText);
        }
    });
}

function getTimeInputToMinutes() {
  var time_window = document.getElementById("time_window").value;
  var match = time_window.match(/(\d*):(\d*)/i);
  var minutes = parseInt(match[1])*60 + parseInt(match[2]);
  return minutes;
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
      },
      function(err) {
        console.log(err,err.message);
        // return alert("There was an error uploading your photo: ", err.message);

      }
    );
  }
