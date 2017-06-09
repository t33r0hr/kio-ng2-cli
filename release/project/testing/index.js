"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var path = require("path");
var env = require("../../env");
var rxfs = require("rxfs");
var stringUtils = require("../../utils/string");
__export(require("./Runner.class"));
var templates = require("../templates");
var files_1 = require("../files");
__export(require("./resolve"));
exports.renderTests = function (targetFilename) {
    return files_1.default().publicationComponents()
        .catch(function (error) {
        console.log('Failed to list publication components.');
        console.error(error);
        return rxjs_1.Observable.throw(error);
    })
        .map(function (componentFilepath) { return path.basename(componentFilepath, '.component.ts'); })
        .map(stringUtils.classify)
        .toArray()
        .flatMap(function (componentNames) {
        var targetFilepath = path.resolve(targetFilename);
        var targetDir = path.resolve(path.dirname(targetFilename));
        return templates
            .renderTemplateWithData('test', {
            pathToKioIndexes: './' + path.relative(targetDir, env.resolve(env.resolveKioPath('root'))),
            componentNames: componentNames
        })
            .flatMap(function (_a) {
            var file = _a.file, content = _a.content;
            return rxfs.writeFile(targetFilepath, rxjs_1.Observable.of(new Buffer(content))).map(function () { return path.relative(process.cwd(), targetFilepath); });
        });
    }, 1);
};
exports.execTestAt = function (specFilename) {
    var specDirpath = path.dirname(specFilename);
    var command = "ts-node \"./" + path.basename(specFilename) + "\"";
    console.log('Exec "%s"', command);
    return rxfs.exec(command, {
        cwd: specDirpath
    })
        .map(function (row, idx) {
        var stderr = row.stderr, stdout = row.stdout;
        var text;
        if (stdout) {
            text = stdout.toString('utf8');
            console.log('<------------------------------------------------');
            console.log('- row: %s ', idx);
            console.log('-------------------------------------------------');
            console.log('%s', text);
            console.log('------------------------------------------------->');
        }
        else {
            console.error(stderr.toString('utf8'));
        }
        return text;
    });
};
//# sourceMappingURL=index.js.map