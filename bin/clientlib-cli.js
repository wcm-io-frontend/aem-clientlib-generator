#!/usr/bin/env node

var DEFAULT_FILE = "clientlib.config.js";
import clientlib from "../lib/clientlib.js";

import path from "path";
import fs from "fs";
import yargs from "yargs";

const y = yargs();

y
  .usage("aem-clientlib-generator " + process.env.npm_package_version + "\n" +
    "Usage with config file: clientlib [path] [options]" + "\n\n" +
    "Default config path: " + DEFAULT_FILE);

y
  .help("help")
  .alias("help", "h")
  .version()
  .alias("version", "v")
  .options({
    "dry": {
      type: "boolean",
      describe: "'Dry run' without write operations."
    },
    "verbose": {
      type: "boolean",
      describe: "Prints more details"
    }
  }).strict();

var argv = y.argv;
var configPath = path.resolve(process.cwd(), DEFAULT_FILE);

if (argv._ && argv._.length > 0) {
  configPath = argv._[0];
  if (!path.isAbsolute(configPath)) {
    configPath = path.resolve(process.cwd(), configPath);
  }
}

if (!fs.existsSync(configPath)) {
  console.error("Could not find config file: " + configPath);
  process.exit(1);
}

import(configPath).then(conf => {
  var libs = [...conf.default.libs];
  var clientLibConf = conf.default;
  delete conf.default.libs;
  clientLibConf.dry = argv.dry;
  clientLibConf.verbose = argv.verbose || argv.dry;

  clientlib(libs, clientLibConf);
}).catch(err => console.error(err));

