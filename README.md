
![build pass](https://travis-ci.org/vaenow/cordova-plugin-pause-resume-download.svg?branch=master)

# cordova-plugin-pause-resume-download
Use the way Pause & Resume to download files for Cordova/PhoneGap

扩展CordovaFilePlugin，断点续下载

# Platforms
  * Android 
  * iOS

# How-to

Use `new PRD()` instead of `new FileTransfer()`

and the rest of usage is **the same as** [cordova-plugin-file-transfer # download](https://www.npmjs.com/package/cordova-plugin-file-transfer#download).


```js

//var fileTransfer = new FileTransfer();
  var fileTransfer = new PRD();  // Use PRD ( extended cordova-plugin-pause-resume-download )

var uri = encodeURI("http://some.server.com/download.php");

fileTransfer.download(
    uri,
    fileURL,
    function(entry) {
        console.log("download complete: " + entry.toURL());
    },
    function(error) {
        console.log("download error source " + error.source);
        console.log("download error target " + error.target);
        console.log("upload error code" + error.code);
    },
    false,
    {
        headers: {
            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
        }
    }
);

fileTransfer.onprogress = function(progress) {
    console.log(progress.loaded, progress.total);
    
    /*if (this.pre === undefined) this.pre = 0;

    var now = ~~((progress.loaded / progress.total) * 100 * 100);
    if (now - +this.pre > 17) {
        updateProgress(now / 100);
        this.pre = now;
    }*/
}
```

Thanks my friend @Jason @BlackSi
