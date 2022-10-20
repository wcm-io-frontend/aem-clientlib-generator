/*
 *  Copyright (c) 2016 pro!vision GmbH and Contributors
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

"use strict";

import async from "async";
import path from "path";
import _ from "lodash";
import fs from "fs";
import fse from "fs-extra";
import glob from "glob";

/**
 * JSON serialization format
 *
 * @type {string}
 */
var SERIALIZATION_FORMAT_JSON = "json";

/**
 * XML serialization format for File Vault
 *
 * @type {string}
 */
var SERIALIZATION_FORMAT_XML = "xml";

/**
 * XML serialization format for Sling Initial Content
 *
 * @type {string}
 */
var SERIALIZATION_FORMAT_SLING_XML = "slingxml";

/**
 * List of fields to be evaluated for being added to the {@code cq:ClientLibraryFolder} file descriptor
 * @type {String[]}
 */
var defaultClientLibDirectoryFields = ["embed", "dependencies", "cssProcessor", "jsProcessor", "allowProxy", "longCacheKey", "replaces", "disableIfReplacing", "guideComponentType"];
var clientLibDirectoryFields = [];

/**
 * List of source file extensions which AEM is able to merge and provide as `.js` or `.css` client-side library
 * @type {Object}
 */
var ALLOWED_EXTENSIONS = {
  css: [".css", ".less"],
  js: [".js"]
}

/**
 * @typedef {Object} ClientLibItem
 * @property {String} path - Clientlib root path (optional if `options.clientLibRoot` is set)
 * @property {String} name - Clientlib name
 * @property {String} [serializationFormat=json] - Type of the target archive for which the resources must be generated [json|xml|slingxml] (optional, default=json)
 * @property {boolean} [allowProxy] - Is the Clientlib meant to be used as a proxy
 * @property {Array<String>} [embed] - other Clientlib names that should be embedded
 * @property {Array<String>} [dependencies] - other Clientlib names that should be included
 * @property {Array<String>} [categories] - to set a category for the clientLib (optional), ovrrides the default that uses the name as category
 * @property {Array<String>} [customProperties] - by default only a set of known properties will be copied over the clientlib, using this field custom properties can be added
 * @property {Array<String>} [cssProcessor] - Clientlib processor specification for CSS
 * @property {Array<String>} [jsProcessor] - Clientlib processor specification for JS
 * @property {Array<Object>} assets - content that should be copied to the clientlib folder, more details below
 * @property {String} guideComponentType - property added for adaptive forms

 */

/**
 * Check if the given file exists
 * @param file
 * @returns {boolean}
 */
function fileExists(file) {
  try {
    fs.accessSync(file);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Removes clientlib folder and configuration file (JSON) for the given
 * clientlib item.
 * @param {ClientLibItem} item - clientlib properties
 * @param {Object} [options] - further options
 * @param {Function} done - callback to be invoked after
 */
function removeClientLib(item, options, done) {
  var configJson = path.join(item.path, item.name + ".json");
  var clientLibPath = path.join(item.path, item.name);
  var files = [];

  if (_.isFunction(options)) {
    done = options;
    options = {};
  }
  if (fileExists(configJson)) {
    files.push(configJson);
  }
  if (fileExists(clientLibPath)) {
    files.push(clientLibPath);
  }

  if (files.length === 0) {
    return done();
  }

  options.verbose && console.log("remove clientlib from " + clientLibPath);
  if (options.dry) {
    return done();
  }
  async.eachSeries(files, function (file, doneClean) {
    fse.remove(file, doneClean);
  }, done);
}

/**
 * Write the clientlib asset TXT file (js or css) that describes the
 * base and contains all resource paths.
 * @param {String} clientLibPath - path to the clientlib folder
 * @param {Object} asset - asset object
 */
function writeAssetTxt(clientLibPath, asset, options) {

  if (!asset || !asset.type || !_.isArray(asset.files)) {
    return;
  }
  var outputFile = path.join(clientLibPath, asset.type + ".txt");
  var basePath = path.posix.join(clientLibPath, asset.base);

  // determines file path relative to the base
  var filenames = [];

  options.verbose && console.log("write clientlib asset txt file (type: " + asset.type + "): " + outputFile);

  asset.files.forEach(function (file) {

    // inject only files that correspondents to the asset type
    if (ALLOWED_EXTENSIONS[asset.type].indexOf(path.extname(file.dest)) !== -1) {
      var rel = path.posix.relative(basePath, file.dest);
      filenames.push(rel);
    }
  });

  var content = "#base=" + asset.base + "\n\n" + filenames.join("\n");
  content.trim();

  if (!options.dry) {
    fs.writeFileSync(outputFile, content);
  }
}

/**
 * Write a configuration JSON file for a clientlib
 * with the given properties in `item`
 * @param {ClientLibItem} item - clientlib configuration properties
 * @param {Object} options - further options
 */
function writeClientLibJson(item, options) {
  var content = {
    'jcr:primaryType': 'cq:ClientLibraryFolder'
  };

  // if categories is a config entry append the values to the array, else use item.name
  if (item.hasOwnProperty('categories')) {
    content.categories = item['categories'];
  } else {
    content.categories = [item.name];
  }

  clientLibDirectoryFields.forEach(function (nodeKey) {
    if (item.hasOwnProperty(nodeKey)) {
      content[nodeKey] = item[nodeKey];
    }
  });


  var jsonFile = path.join(item.path, item.name + ".json");
  options.verbose && console.log("write clientlib json file: " + jsonFile);
  if (!options.dry) {
    fse.writeJsonSync(jsonFile, content, {spaces: 2});
  }
}

/**
 * Write a configuration FileVault XML file for a clientlib
 * with the given properties in `item`
 * @param {ClientLibItem} item - clientlib configuration properties
 * @param {Object} options - further options
 */
function writeClientLibXml(item, options) {
  var content = '<?xml version="1.0" encoding="UTF-8"?>' +
      '\n<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"' +
      '\n    jcr:primaryType="cq:ClientLibraryFolder"';

  if (item.hasOwnProperty('categories')) {
    var fieldValue = item.categories.join(',');
    content += '\n    categories="[' + fieldValue + ']"';
  } else {
    content += '\n    categories="[' + item.name + ']" ';
  }

  clientLibDirectoryFields.forEach(function (fieldKey) {
    if (item.hasOwnProperty(fieldKey)) {
      if (typeof item[fieldKey] === 'boolean') {
        // Boolean value
        content += '\n    ' + fieldKey + '="{Boolean}' + item[fieldKey] + '"';
      } else if (Array.isArray(item[fieldKey])) {
        // Array of strings
        var fieldValue = item[fieldKey].join(',');
        content += '\n    ' + fieldKey + '="[' + fieldValue + ']"';
      } else if (typeof item[fieldKey] === 'string') {
        // String value
        content += '\n    ' + fieldKey + '="' + item[fieldKey] + '"';
      }
    }
  });

  content += "/>\n";
  var contentXml = getXmlOutputFile(item, SERIALIZATION_FORMAT_XML);

  options.verbose && console.log("write clientlib json file: " + contentXml);

  if (!options.dry) {
    fse.writeFileSync(contentXml, content);
  }
}

/**
 * Write a configuration Sling-Initial-Content XML file for a clientlib
 * with the given properties in `item`
 * @param {ClientLibItem} item - clientlib configuration properties
 * @param {Object} options - further options
 */
function writeClientLibSlingXml(item, options) {
  var content = '<?xml version="1.0" encoding="UTF-8"?>' +
      '\n<node>' + 
      '\n    <name>' + item.name + '</name>' +
      '\n    <primaryNodeType>cq:ClientLibraryFolder</primaryNodeType>' +
      '\n    <property>' + 
      '\n        <name>categories</name>' +
      '\n        <values>';
  if (item.hasOwnProperty('categories')) {
    item.categories.forEach(category => {
      content += '\n            <value>' + category + '</value>';
    });
  } else {
    content += '\n            <value>' + item.name + '</value>';
  }
  content += 
      '\n        </values>' +
      '\n        <type>String</type>' +
      '\n    </property>';

  clientLibDirectoryFields.forEach(function (fieldKey) {
    if (item.hasOwnProperty(fieldKey)) {
      content += '\n    <property>\n        <name>' + fieldKey + '</name>';
      if (typeof item[fieldKey] === 'boolean') {
        // Boolean value
        content += 
            '\n        <value>' + item[fieldKey] + '</value>' +
            '\n        <type>Boolean</type>';
      } else if (Array.isArray(item[fieldKey])) {
        // Array of strings
        content += '\n        <values>';
        item[fieldKey].forEach(value => {
          content += '\n            <value>' + value + '</value>';
        });
        content += '\n        </values>\n        <type>String</type>';
      } else if (typeof item[fieldKey] === 'string') {
        // String value
        content += 
            '\n        <value>' + item[fieldKey] + '</value>' +
            '\n        <type>String</type>';
      }
      content += '\n    </property>';
    }
  });
  content += '\n</node>\n'

  var contentXml = getXmlOutputFile(item, SERIALIZATION_FORMAT_SLING_XML);

  options.verbose && console.log("write clientlib Sling-Initial-Content XML file: " + contentXml);

  if (!options.dry) {
    fse.writeFileSync(contentXml, content);
  }
}

/**
 * Get the output file name and path for the specified XML serialization format
 * @param {ClientLibItem} item - clientlib configuration properties
 * @param {String} serializationFormat serialization format (xml|slingxml)
 */
function getXmlOutputFile(item, serializationFormat) {

  // Sling initial content: <name>.xml
  if (serializationFormat === SERIALIZATION_FORMAT_SLING_XML) {
    return item.outputPath || path.join(item.path, item.name + ".xml")
  }

  // FileVault: a folder with a .content.xml file in it
  var outputPath = item.outputPath || path.join(item.path, item.name);
  return path.join(outputPath + "/.content.xml");
}

/**
 * Iterate through the given array of clientlib configuration objects and
 * process them asynchronously.
 * @param {Array<ClientLibItem>} itemList - array of clientlib configuration items
 * @param {Object} [options] - global configuration options
 * @param {Function} done - to be called if everything is done
 */
function start(itemList, options, done) {

  if (_.isFunction(options)) {
    done = options;
    options = {};
  }

  if (!_.isArray(itemList)) {
    itemList = [itemList];
  }

  if (options.context || options.cwd) {
    options.cwd = options.context || options.cwd;
    process.chdir(options.cwd);
  }

  if (options.verbose) {
    console.log("\nstart aem-clientlib-generator");
    console.log("  working directory: " + process.cwd());
  }
  options.dry && console.log("\nDRY MODE - without write options!");

  async.eachSeries(itemList, function (item, processItemDone) {
    processItem(item, options, processItemDone);
  }, done);
}

/**
 * Normalize different asset configuration options.
 * @param {String} clientLibPath - clientlib subfolder
 * @param {Object} assets - asset configuration object
 * @returns {*}
 */
function normalizeAssets(clientLibPath, assets) {

  var list = assets;

  // transform object to array
  if (!_.isArray(assets)) {
    list = [];
    _.keys(assets).forEach(function (assetKey) {
      var assetItem = assets[assetKey];

      // check/transform short version
      if (_.isArray(assetItem)) {
        assetItem = {
          files: assetItem
        };
      }
      if (!assetItem.base) {
        assetItem.base = assetKey;
      }
      assetItem.type = assetKey;
      list.push(assetItem);
    });
  }

  // transform files to scr-dest mapping
  list.forEach(function (asset) {

    var mapping = [];
    var flatName = typeof asset.flatten !== "boolean" ? true : asset.flatten;
    var assetPath = path.posix.join(clientLibPath, asset.base);
    var globOptions = {};
    if (asset.cwd) {
      globOptions.cwd = asset.cwd;
    }
    if (asset.ignore) {
      globOptions.ignore = asset.ignore;
    }

    asset.files.forEach(function (file) {
      var fileItem = file;

      // convert simple syntax to object
      if (_.isString(file)) {
        fileItem = {
          src: file
        };
      }

      // no magic pattern -> default behaviour
      if (!glob.hasMagic(fileItem.src)) {

        // determine default dest
        if (!fileItem.dest) {
          fileItem.dest = path.posix.basename(file);
        }

        // generate full path
        fileItem.dest = path.posix.join(assetPath, fileItem.dest);
        mapping.push(fileItem);
      }

      // resolve magic pattern
      else {
        var files = glob.sync(fileItem.src, globOptions);
        var hasCwd = !!globOptions.cwd;
        var dest = fileItem.dest ? path.posix.join(assetPath, fileItem.dest) : assetPath;

        files.forEach(function (resolvedFile) {

          // check 'flatten' option -> strip dir name
          var destFile = flatName ? path.posix.basename(resolvedFile) : resolvedFile;

          var item = {
            src: resolvedFile,
            dest: path.posix.join(dest, destFile)
          };

          // check "cwd" option -> rebuild path, because it was stripped by glob.sync()
          if (hasCwd) {
            item.src = path.posix.join(globOptions.cwd, resolvedFile);
          }

          mapping.push(item);
        });
      }
    });

    mapping = removeDuplicates(mapping, 'src');

    asset.files = mapping;
  });

  return list;
}

/**
 * Removes duplicates in array of Objects based on the provided key
 * From: https://firstclassjs.com/remove-duplicate-objects-from-javascript-array-how-to-performance-comparison/
 * @param {Array} array - array of Objects that will be filtered
 * @param {String} key - key that will be used for filter comparison
 */
function removeDuplicates(array, key) {
  let lookup = new Set();
  return array.filter(obj => !lookup.has(obj[key]) && lookup.add(obj[key]));
}

/**
 * Process the given clientlib configuration object.
 * @param {ClientLibItem} item - clientlib configuration object
 * @param {Object} options - configuration options
 * @param {Function} processDone - to be called if everything is done
 */
function processItem(item, options, processDone) {

  if (!item.path) {
    item.path = options.clientLibRoot;
  }

  clientLibDirectoryFields.length = 0;
  clientLibDirectoryFields = defaultClientLibDirectoryFields.concat(item.customProperties);

  options.verbose && console.log("\n\nprocessing clientlib: " + item.name);

  // remove current files if exists
  removeClientLib(item, function (err) {

    var clientLibPath = item.outputPath || path.join(item.path, item.name);

    // create clientlib directory
    fse.mkdirsSync(clientLibPath);

    var serializationFormat = item.serializationFormat || SERIALIZATION_FORMAT_JSON;

    options.verbose && console.log("Write node configuration using serialization format: " + serializationFormat);

    if (serializationFormat === SERIALIZATION_FORMAT_JSON) {
        // write configuration JSON
        writeClientLibJson(item, options);
    } else if (serializationFormat === SERIALIZATION_FORMAT_SLING_XML) {
        // write Sling-Initial-Content configuration
        writeClientLibSlingXml(item, options);
    } else {
        // write FileVault XML configuration
        writeClientLibXml(item, options);
    }

    var assetList = normalizeAssets(clientLibPath, item.assets);

    // iterate through assets
    async.eachSeries(assetList, function (asset, assetDone) {

      // write clientlib creator files
      if (asset.type === "js" || asset.type === "css") {
        options.verbose && console.log("");
        writeAssetTxt(clientLibPath, asset, options);
      }

      // copy files for given asset
      async.eachSeries(asset.files, function (fileItem, copyDone) {
        if (fileItem.src == fileItem.dest) {
          options.verbose && console.log(`${fileItem.src} already in output directory`);
          return copyDone();
        }
        options.verbose && console.log("copy:", fileItem.src, fileItem.dest);
        if (options.dry) {
          return copyDone();
        }

        // create directories separately or it will be copied recursively
        if (fs.lstatSync(fileItem.src).isDirectory()) {
          fs.mkdir(fileItem.dest, { recursive: true }, copyDone);
        } else {
          fse.copy(fileItem.src, fileItem.dest, copyDone);
        }
      }, assetDone);

    }, processDone);
  });
}

export default start;

export {
  removeClientLib,
  fileExists,
};
