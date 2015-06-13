'use strict';

var Fs = require('fs');
var Lodash = require('lodash');
var Mkdirp = require('mkdirp');
var Path = require('path');

var Chalk = require('chalk');

function logFormattedDeps(depTable) {
    for (var depName in depTable) {
        var depRef = depTable[depName];
        console.log(Chalk.gray('famous'), '  ', depName, '~>', depRef);
    }
}

function freezeDependencies(info, cb) {
    var frameworkFile;

    console.log(Chalk.gray('famous'), 'Freezing dependencies for ' + info.name + '...');
    if (Object.keys(info.dereffedDependencyTable).length > 0) {
        logFormattedDeps(info.dereffedDependencyTable);
    }

    frameworkFile = Lodash.find(info.files, function(file) {
        return file.path === this.options.frameworkFilename;
    }.bind(this));

    // If no dependencies file exists, add it to the collection so it
    // gets saved along with everything else during persistence
    if (!frameworkFile) {
        frameworkFile = {
            path: this.options.frameworkFilename
        };
        info.files.push(frameworkFile);
    }

    // And set the file's content to the JSON of the dependencies
    // that we've resolved in a previous step
    frameworkFile.content = JSON.stringify({
        // It's kind of hacky to put this in here, but we need to store
        // the block info for future requests.
        block: info.frameworkInfo.block,

        dependencies: info.dereffedDependencyTable
    }, null, 4);

    // If we're building a component from a local source folder, we
    // need to write the dependencies back to that folder so that subsequent
    // saves have the correct dependency data we gathered in this build
    //
    // In this condition, the source directory is the specific directory from
    // which we got the files data in the first place, probably passed to
    // us via the framework 'assistant' watcher
    if (info.sourceDirectory) {
        var frameworkFilePath = Path.join(info.sourceDirectory, frameworkFile.path);
        var baseDirectory = Path.dirname(frameworkFilePath);

        // Minor point: we need to ensure that the .famous directory actually exists
        // before attempting to write to it
        Mkdirp(baseDirectory, function(mkdirErr) {
            if (!mkdirErr) {
                Fs.writeFile(frameworkFilePath, frameworkFile.content, this.options.fileOptions, function(fileWriteErr) {
                    if (!fileWriteErr) {
                        cb(null, info);
                    }
                    else {
                        cb(fileWriteErr);
                    }
                });
            }
            else {
                cb(mkdirErr);
            }
        }.bind(this));
    }
    else {
        cb(null, info);
    }
}

module.exports = freezeDependencies;
