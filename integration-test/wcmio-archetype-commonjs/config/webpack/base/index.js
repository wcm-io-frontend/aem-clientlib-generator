import path from "path";
import merge from "webpack-merge";

import { pathConfig } from "../../path.config";
import { entry, output } from "./setup";
import { clean, es6, scss, handlebars, html, copy } from "./tasks";

export const baseConfig = merge(clean, es6, scss, handlebars, html, copy, {
  entry,
  output,
  context: path.resolve(pathConfig.paths.src)
});
