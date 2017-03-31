importScripts("jimp-wrapper.js");

self.addEventListener("message", function(e) {
	Jimp.read(e.data).then(function (file) {
        file.resize(1600, Jimp.AUTO)
             .quality(80)                 // set JPEG quality
             .getBase64(Jimp.AUTO, function (err, src) {
                 self.postMessage(src);   // message the main thread
             });
    });
});