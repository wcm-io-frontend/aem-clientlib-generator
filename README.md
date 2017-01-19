# aem-clientlib-generator

A node plugin that creates ClientLib configuration files (repository nodes) for 
[AEM ClientLibs](https://docs.adobe.com/docs/en/aem/6-2/develop/the-basics/clientlibs.html),
creates _Client Library Folders_ and synchronizes all assets.


## Installation
```bash
npm install aem-clientlib-generator
```

```js
var clientlib = require("aem-clientlib-generator");
// clientlib() is the function to use
```


## Usage

### clientlib(arrProps | props, [options], callback)

* `arrProps` `{Array<Object>}` Array of Clientlib configuration properties (see below)
* `props` `{Object}` Clientlib configuration properties
  * `path` `{String}` Clientlib root path (optional if `options.clientLibRoot` is set)
  * `name` `{String}` Clientlib name (required)
  * `embed` `{Array<String>}` other Clientlib names that should be embedded (optional)
  * `dependencies` `{Array<String>}` other Clientlib names that should be included (optional)
  * `assets` `{Object}` content that should be copied to the clientlib folder, more details below (required)

* `options` `{Object}` global options to be used for all clientlib definitions (optional)
  * `clientLibRoot` {String} Clientlib root path
  * `cwd` {String} changes the current working directory (via `process.chdir()`)

* `callback` `{Function}` to be called if clientlib() has finished

### The `assets` Object

The `assets` object determine the content that should be pushed into the clientlib folder. The key stands for
the content type, `js` for JavaScript files, `css` for styles and `resources` for other content such as
fonts or images.

```javascript
{
  js: {
    // JavaScript files to be copied and used for `js.txt` - a clientlib JS configuration file
  },
  css: {
    // CSS files to be copied and used for `css.txt` - a clientlib CSS configuration file
  },
  resources: {
    // other resources that should be copied
  }
}
```

Each property can be an object of deeper configuration options (`assetConfig`) or an array of files (simple way, see example below).
The following can be configured:

* `assetConfig` `{Object}` Configuration object for an asset type
  * `base` `{String}` path within the clientlib folder where the data should be copied to (optional), default: asset key, e.g. for "js" is the base "js"
    * Hint: Using "." copies the files into the clientlib folder instead of the subfolder
  * `files` `{Array<String|Object>}` array of file paths (sources) or a src-dest key value map (required)
    * Important: The order of JS or CSS files in this property defines the merging/bundling order in AEM clientlib.
    * file object contains:
      * `src` {String} - source file relative to the current working directory or the global `cwd` option, if set
      * `dest` {String} - destination relative to the clientlib folder including base

```javascript
// simple version
js: [
  "pth/to/file.js",
  {src:"pth/to/lib/file.js", dest: "lib/file.js"}
]
// will be transformed to:
js: {
  base: "js"
  files: [
    {src:"pth/to/file.js",, dest: "file.js"}
    {src:"pth/to/lib/file.js", dest: "lib/file.js"}
  ]
}
```

### Example
```javascript

var clientlib = require("aem-clientlib-generator");
clientlib([
  {
    name: "test.base.apps.mainapp",
    // the name will be used as subfolder in clientlibs root and for the AEM respository node
    // in this example is creates:
    //   the subfoler: path/to/clientlibs-root/test.base.apps.mainapp/
    //   repository node: path/to/clientlibs-root/test.base.apps.mainapp.json

    assets: {

      // creates the JS configuration file:
      //  path/to/clientlibs-root/test.base.apps.mainapp/js.txt
      // which lists all JavaScript files from the ClientLib.
      // and copies all files into a js subfolder (default base):
      //  path/to/clientlibs-root/test.base.apps.mainapp/js/
      js: [

        // file will be copied to:
        //  path/to/clientlibs-root/test.base.apps.mainapp/js/app.js
        {src: "src/frontend/js/app.js", dest: "app.js"},

        // file will be copied to:
        //  path/to/clientlibs-root/test.base.apps.mainapp/js/libs/mylib.min.js
        {src: "src/frontend/js/libs/mylib.min.js", dest: "libs/mylib.min.js"},
        
        // copy source map files as well 
        {src: "src/frontend/js/libs/mylib.min.js.map", dest: "libs/mylib.min.js.map"}
      ],

      // creates the CSS configuration file:
      //  path/to/clientlibs-root/test.base.apps.mainapp/css.txt
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

      // creates the CSS configuration file:
      //  path/to/clientlibs-root/test.base.apps.secondapp/css.txt
      // that lists all CSS files from the ClientLib.
      // All files defined below will be copied into the defined base:
      //  path/to/clientlibs-root/test.base.apps.secondapp/style/
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

      // copy all files into the clientlib subfolder, because `base` is changed:
      //  path/to/clientlibs-root/test.base.apps.thirdapp/
      resources: {
        base: ".", // copy the file into `test.base.apps.thirdapp` (root) instead of `test.base.apps.thirdapp/resources`
        files: [
          "src/frontend/resources/notice.txt"
        ]
      }
    }
  }
],
{
  cwd: __dirname, // using folder of the file as current working directory
  clientLibRoot: path.join(__dirname, "path/to/clientlibs-root")
},
function() {
  console.log("clientlibs created");
});
```

