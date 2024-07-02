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

import { mkdirSync, lstatSync, readFileSync } from "fs";
import walk from "klaw";
import fsExtra from "fs-extra";
import clientlib from "../lib/clientlib.js";
import { fileExists } from "../lib/clientlib.js";
import { join, relative } from "path";
import { ok, equal } from 'assert';

import clientLibConf from "./clientlib.config.js";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var {removeSync} = fsExtra;
var resultDir = join(__dirname, "result");
var expectedDir = join(__dirname, "expected");


describe("Test output", function() {

  // cleanup result folder
  beforeEach(function(){
    removeSync(resultDir);
    mkdirSync(resultDir);
  });

  it("should create files correctly", function(done) {
    var config = JSON.parse(JSON.stringify(clientLibConf));
    var libs = [...clientLibConf.libs];
    delete config.libs;

    clientlib(libs, config, function() {

      var items = []; // files, directories, symlinks, etc
      walk(expectedDir)
        .on("data", function (item) {
          items.push(item.path)
        })
        .on("end", function () {

          items.forEach(function(expectedFile) {
            var subFilePath = relative(expectedDir, expectedFile);
            if (!subFilePath) {
              return;
            }

            var resultFile = join(resultDir, subFilePath);

            ok(fileExists(resultFile), "file does not exist in result: " + subFilePath);

            if (!lstatSync(expectedFile).isDirectory()) {
              var result = readFileSync(resultFile, "utf-8").replace(/\r\n/g, "\n");
              var expected = readFileSync(expectedFile, "utf-8").replace(/\r\n/g, "\n");

              equal(result, expected, "content of " + subFilePath + " is not expected");
            }

          });

          done();
        });
    });
  });
});
