import path from "path";
import { merge } from "webpack-merge";

import { pathConfig } from "../../path.config.js";
import { entry, output } from "./setup/index.js";
import { clean, es6, scss, handlebars, html, copy } from "./tasks/index.js";

export const baseConfig = merge(clean, es6, scss, handlebars, html, copy, {
  entry,
  output,
  context: path.resolve(pathConfig.paths.src)
});
