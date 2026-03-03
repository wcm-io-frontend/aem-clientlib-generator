/*
 *  Copyright (c) 2016 wcm.io and Contributors
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

import fs from "fs";
import walk from "klaw";
import fse from "fs-extra";
import clientlib, { fileExists } from "../lib/clientlib.js";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

import clientLibConf from "./clientlib.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var resultDir = path.join(__dirname, "result");
var expectedDir = path.join(__dirname, "expected");


describe("Test output", function() {

  // cleanup result folder
  beforeEach(function(){
    fse.removeSync(resultDir);
    fs.mkdirSync(resultDir);
  });

  it("should create files correctly", function(done) {

    var libs = clientLibConf.libs;
    delete clientLibConf.libs;

    clientlib(libs, clientLibConf, function() {

      var items = []; // files, directories, symlinks, etc
      walk(expectedDir)
        .on("data", function (item) {
          items.push(item.path)
        })
        .on("end", function () {

          items.forEach(function(expectedFile) {
            var subFilePath = path.relative(expectedDir, expectedFile);
            if (!subFilePath) {
              return;
            }

            var resultFile = path.join(resultDir, subFilePath);

            assert.ok(fileExists(resultFile), "file does not exist in result: " + subFilePath);

            if (!fs.lstatSync(expectedFile).isDirectory()) {
              var result = fs.readFileSync(resultFile, "utf-8").replace(/\r\n/g, "\n");
              var expected = fs.readFileSync(expectedFile, "utf-8").replace(/\r\n/g, "\n");

              assert.equal(result, expected, "content of " + subFilePath + " is not expected");
            }

          });

          done();
        });
    });
  });

  // Regression test for https://github.com/wcm-io-frontend/aem-clientlib-generator/issues/150
  // libs as a single object (not wrapped in an array) should be supported
  it("should support libs as a single object instead of an array (issue #150)", function(done) {

    var singleLib = {
      name: "test.base.apps.mainapp",
      assets: {
        js: [
          "src/frontend/js/app.js"
        ],
        css: [
          "src/frontend/css/styling.css"
        ]
      }
    };

    var options = {
      context: __dirname,
      clientLibRoot: path.resolve(__dirname, "result", "clientlibs-root")
    };

    // Verify the CLI normalization handles a single object without throwing
    var libs = Array.isArray(singleLib) ? [...singleLib] : [singleLib];
    assert.ok(Array.isArray(libs), "libs should be normalized to an array");
    assert.equal(libs.length, 1, "normalized libs array should contain one entry");
    assert.equal(libs[0].name, "test.base.apps.mainapp");

    // The library function should also handle a single object without error
    clientlib(singleLib, options, function() {

      var mainappDir = path.join(options.clientLibRoot, "test.base.apps.mainapp");
      assert.ok(fileExists(mainappDir), "clientlib directory should be created for single-object libs");

      var jsonFile = path.join(options.clientLibRoot, "test.base.apps.mainapp.json");
      assert.ok(fileExists(jsonFile), "clientlib JSON descriptor should be created for single-object libs");

      done();
    });
  });
});
