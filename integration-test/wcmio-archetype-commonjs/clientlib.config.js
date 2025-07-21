module.exports = {
  // default working directory (can be changed per 'cwd' in every asset option)
  context: __dirname,

  // path to the clientlib root folder (output)
  clientLibRoot: "result",

  // define all clientlib options here as array... (multiple clientlibs)
  libs: [
    {
      name: "myproject1.app",
      serializationFormat: "json",
      allowProxy: true,
      assets: {
        js: ["dist/static/js/app.js", "dist/static/js/app.js.map"],
        css: ["dist/static/styles/app.css", "dist/static/styles/app.css.map"],
        resources: {
          cwd: "./public/",
          flatten: false,
          files: ["**/*.*"]
        }
      }
    },
    {
      name: "myproject1.all",
      serializationFormat: "json",
      embed: [
        "core.wcm.components.commons.datalayer.v1",
        "core.wcm.components.commons.site.container",
        "core.wcm.components.image.v2",
        "core.wcm.components.carousel.v1",
        "core.wcm.components.tabs.v1",
        "core.wcm.components.accordion.v1",
        "myproject1.app"
      ],
      jsProcessor: ["default:none", "min:gcc;compilationLevel=whitespace;languageIn=ECMASCRIPT_2018;languageOut=ECMASCRIPT_2018"],
      cssProcessor: ["default:none", "min:none"],
      allowProxy: true,
      assets: {
        js: [],
        css: []
      }
    }
  ]
};
