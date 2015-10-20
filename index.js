'use strict';

var path = require('path');

var glob = require("glob");
var UglifyJS = require("uglify-js");

var argv = require('yargs')
    
    .default('d', process.cwd())
    .alias('d', 'directory')

    .default('t', 'x-icon')
    .alias('tag')

    .help('h')
    .alias('h', 'help')
    .epilog('svg2ce - SVG to custom element')
    .argv
;

var result = UglifyJS.minify("var b = function () {};", { fromString: true });


var Promise = require('bluebird');

var blackboard = {
    dir: path.resolve(argv.directory || process.cwd()),
    tagName: argv.t
};

console.log(blackboard);

Promise
    .resolve(argv.directory)
    .then(getFilenames.bind(blackboard))
    .map(getMinifiedFileContent.bind(blackboard))

    //.map(console.log.bind(console));

function getFilenames(cwd) {
    return new Promise(function(resolve, reject) {
        glob("**/*.svg", { cwd: cwd }, function (err, files) {
            if (err) { return reject(err); }

            resolve(files);
        });
    });
}

var SVGO = require('svgo');
var svgo = new SVGO(
        // config
    );

var fs = require('fs');

function getMinifiedFileContent(filename) {
    return new Promise(function(resolve, reject) {
        var baseDir = path.resolve(process.cwd(), argv.directory);
        var f = path.join(baseDir, filename);

        fs.readFile(f, 'utf-8', function(err, content) {
            if (err) { return reject(err); }
            svgo.optimize(content, function(result) {
                var obj = {};
                obj[filename] = result.data;
                resolve(obj);
            });
        });
    });
}
