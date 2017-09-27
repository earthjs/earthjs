const fs = require('fs');
var dir = '../'; // your directory

// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function(dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        const path = dir+file;
        const isDir = fs.statSync(path).isDirectory();
        if (isDir && path.match(/\d{2}/)) {
            filelist.push(`<h2>${file}</h2>`);
            filelist = walkSync(path+ '/', filelist);
        }
        else {
            if (file.indexOf('.html')>0) {
                filelist.push(`<a href="${path.replace('..','')}">[${file.replace('.html','')}]</a> - `);
            }
        }
    });
    return filelist;
};

walkSync(dir).forEach(file => {
    console.log(file);
})

// var files = fs.readdirSync(dir);
// files.sort(function(a, b) {
//    return fs.statSync(dir + a).mtime.getTime() -
//           fs.statSync(dir + b).mtime.getTime();
// });
//
