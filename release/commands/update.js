"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var project = require("../project");
var kio_ng2_env_1 = require("kio-ng2-env");
var logger = require("../console");
var rxjs_1 = require("rxjs");
exports.updateProjectCommand = function () { return ({
    command: 'updateProject',
    aliases: ['update'],
    describe: 'Updates a new kio digitorial project',
    builder: function (argv) {
        return argv
            .usage('Usage: $0 <command> [options]')
            .options({
            target: {
                type: 'string',
                default: process.env.KIO_NG2_PROJECT || process.cwd(),
                describe: 'Project root'
            }
        });
    },
    handler: function (args) {
        var _a = args._, command = _a[0], projectName = _a[1];
        var target = args.target;
        return kio_ng2_env_1.env(target)
            .flatMap(function (store) {
            console.log('store components', store.get('components'));
            return rxjs_1.Observable.from(store.get('components'))
                .flatMap(function (component) {
                if (project.namedComponentExists(component)) {
                    logger.log('Component "%s" already exists at %s', component.name, project.pathForNamedComponent(component.type, component.name));
                    return rxjs_1.Observable.empty();
                }
                else if (project.isNamedFragmentComponentStructure(component)) {
                    logger.log('Write FragmentComponent "%s" at %s', component.name, project.pathForNamedComponent(component.type, component.name));
                    var data = project.dataForNamedFragmentComponent(component);
                    return project.writeComponent(data, target).map(function (res) { return component; });
                }
                else {
                    logger.log('Write Component "%s" at %s', component.name, project.pathForNamedComponent(component.type, component.name));
                    var data = project.dataForNamedComponent(component);
                    return project.writeComponent(data, target).map(function (res) { return component; });
                }
            })
                .map(function (component) {
                logger.log('Wrote "%s"', component.name);
                return component;
            })
                .toArray()
                .flatMap(function (components) {
                return store.save().map(function () { return store; });
            });
        })
            .toPromise()
            .then(function (envStore) {
            console.log('envStore', envStore.get('components'));
        })
            .catch(function (error) {
            console.error(error);
        });
    }
}); };
//# sourceMappingURL=update.js.map