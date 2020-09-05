"use strict";
function uploadPhotos(file) {
    var photoKey = file.name;  
    // Use S3 ManagedUpload class as it supports multipart uploads
    var upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: bucketName,
        Key: photoKey,
        Body: file,
        ACL: "public-read"
      }
    });
    var promise =  upload.promise();

    promise.then(
      function(data) {
        console.log(photoKey+" successfully uploaded photo");
        renderUploadList(photoKey);
      },
      function(err) {
        console.log(err,err.message);
        return alert("There was an error uploading your photo: ", err.message);
      }
    );
  }


  const renderUploadList = function (photo) {
    var fileListDisplay = document.getElementById('file-list-display');
    var fileDisplayEl = document.createElement('p');
    fileDisplayEl.innerHTML = photo + ' Successfully uploaded' ;
    fileListDisplay.appendChild(fileDisplayEl);
    };


// ##################
//    Handle mulyiple files
// ##################
  ( function () {
	var fileCatcher = document.getElementById('file-catcher');
  var fileInput = document.getElementById('file-input');
  var fileListDisplay = document.getElementById('file-list-display');
  
  var fileList = [];
  var renderFileList,startUpload;
  fileCatcher.addEventListener('submit', async function (evnt) {
    if (!document.getElementById('file-input').files.length) {
      return alert("Please choose photos to upload first.");
    }
        evnt.preventDefault();
        fileListDisplay.innerHTML = '';
        var fileDisplayEl = document.createElement('p');
        fileDisplayEl.innerHTML = "Uploading..."
        fileListDisplay.appendChild(fileDisplayEl);
        await startUpload(fileList);
        
  });
  
  startUpload = async function(fileList){
    fileList.forEach(async function (file) {
                await uploadPhotos(file);
            });  
  }

  fileInput.addEventListener('change', function (evnt) {
 		fileList = [];
  	for (var i = 0; i < fileInput.files.length; i++) {
    	fileList.push(fileInput.files[i]);
    }
    renderFileList();
  });
  
  renderFileList = function () {
  	fileListDisplay.innerHTML = '';
    fileList.forEach(function (file, index) {
    	var fileDisplayEl = document.createElement('p');
      fileDisplayEl.innerHTML = (index + 1) + ': ' + file.name;
      fileListDisplay.appendChild(fileDisplayEl);
    });
  };
  
})();