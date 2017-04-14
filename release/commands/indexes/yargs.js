"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var console_1 = require("../../console");
var path = require("path");
var env = require("../../env/constants");
var find_1 = require("../../components/find");
var renderComponentIndex = function (indexPath, indexName, files) {
    var componentNames = [];
    var singleImports = files.map(function (fileComponent) {
        componentNames.push(fileComponent.name + 'Component');
        return "import { " + fileComponent.name + "Component } from './" + path.relative(indexPath, fileComponent.dir) + "/" + fileComponent.dasherizedName + ".component'";
    });
    return singleImports.join('\n') + "\n\nexport { " + componentNames.join(', ') + " }\nexport const " + indexName + " = [ " + componentNames.join(', ') + " ]\n  ";
};
var renderFixtureIndex = function (indexPath, indexName, files) {
    var componentNames = [];
    var singleImports = files.map(function (fileComponent) {
        componentNames.push(fileComponent.name);
        return "import { Fixture as " + fileComponent.name + " } from './" + path.relative(indexPath, fileComponent.dir) + "/" + fileComponent.dasherizedName + ".component.cquery.fixture'";
    });
    return singleImports.join('\n') + "\n\nexport { " + componentNames.join(', ') + " }\n  ";
};
var renderCriteriaIndex = function (indexPath, indexName, files) {
    var componentNames = [];
    var singleImports = files.map(function (fileComponent) {
        componentNames.push(fileComponent.name);
        return "import { Criteria as " + fileComponent.name + " } from './" + path.relative(indexPath, fileComponent.dir) + "/" + fileComponent.dasherizedName + ".component.cquery.fixture'";
    });
    return singleImports.join('\n') + "\n\nexport { " + componentNames.join(', ') + " }\n  ";
};
var writeComponentsToIndex = function (indexPath, indexName, files) {
    var indexFileName = path.join(indexPath, indexName + '.generated.ts');
    console_1.log('Write index for %s at "%s"', indexName, indexFileName);
    fs.writeFileSync(indexFileName, renderComponentIndex(indexPath, indexName, files), { encoding: 'utf8' });
};
exports.yargs = {
    command: 'buildIndexes',
    aliases: ['index'],
    describe: 'Updates index files in ' + env.KIO_PATHS.root,
    builder: function (argv) {
        return argv
            .usage('Usage: $0 index [publication|structure|fixture|criteria]')
            .option('filter', {
            alias: 'f',
            choices: ['publication', 'structure', 'fixture', 'criteria'],
            default: ['publication', 'structure', 'fixture', 'criteria'],
            demand: true
        });
    },
    handler: function (args) {
        var command = args._[0];
        args.filter.forEach(function (filterValue) {
            var files = find_1.findComponents(filterValue);
            console.log('files for %s', filterValue, files.join(','));
            //writeComponentsToIndex(path.join(env.KIO_PROJECT_ROOT,env.KIO_PATHS.root),stringUtils.classify(filterValue+'Components'),files)
        });
        //console.log('files',args)
    }
};
//# sourceMappingURL=yargs.js.map