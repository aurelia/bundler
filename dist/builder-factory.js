"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Builder = require("systemjs-builder");
var config_serializer_1 = require("./config-serializer");
function createBuilder(cfg) {
    var builder = new Builder(cfg.baseURL);
    var appCfg = config_serializer_1.getAppConfig(cfg.configPath);
    delete appCfg.baseURL;
    builder.config(appCfg);
    builder.config(cfg.builderCfg);
    return builder;
}
exports.createBuilder = createBuilder;
//# sourceMappingURL=builder-factory.js.map