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

var path = require("path");
module.exports = {

  options: {
    cwd: __dirname,
    clientLibRoot: path.join(__dirname, "result/clientlibs-root")
  },

  list: [
    {
      name: "test.base.apps.mainapp",
      cssProcessor: ["default:none", "min:none"], // disable minification for CSS
      jsProcessor: ["default:none", "min:gcc;obfuscate=true"],  // using google closure compiler instead of YUI
      assets: {
        js: [
          {src: "src/frontend/js/app.js", dest: "app.js"},
          {src: "src/frontend/js/libs/mylib.min.js", dest: "libs/mylib.min.js"},
          {src: "src/frontend/js/libs/mylib.min.js.map", dest: "libs/mylib.min.js.map"}
        ],
        css: [
          "src/frontend/css/styling.css",
          "src/frontend/css/lib.css"
        ]
      }
    },
    {
      name: "test.base.apps.secondapp",
      embed: [
        "test.base.apps.thirdapp"   // this clientlib will be auto embedded in AEM (kind of `merging`)
      ],
      dependencies: [
        "test.base.apps.mainapp"    // define clientlib dependency
      ],
      assets: {
        js: {
          base: "js", // by default the `base` is the asset key property
          files: [
            {src: "src/frontend/secondapp/js/lib.js", dest: "secondapp-lib.js"}
          ]
        },
        css: {
          base: "style", // changes the `base` from `css` (default) to `style`
          files: [
            "src/frontend/secondapp/main.css"
          ]
        },
        resources: [
          "src/frontend/resources/template.html"
        ]
      }
    },
    {
      name: "test.base.apps.thirdapp",
      assets: {
        resources: {
          base: ".", // copy the file into `test.base.apps.thirdapp` (root) instead of `test.base.apps.thirdapp/resources`
          files: [
            "src/frontend/resources/notice.txt"
          ]
        }
      }
    }
  ]
};