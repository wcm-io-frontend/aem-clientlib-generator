import webpackMerge from "webpack-merge";

import { baseConfig } from "./config/webpack/base";
import { devConfig } from "./config/webpack/dev";
import { prodConfig } from "./config/webpack/prod";

/**
 * Get the configuration file based on webpacks `mode` parameter.
 *
 * @param {String} runMode - Webpack mode (like: "development", "production", "test", "...");
 */
const getConfig = runMode => {
  switch (runMode) {
    case "development":
      return devConfig;
    case "production":
      return prodConfig;
    default:
      return prodConfig;
  }
};

/**
 * Compose the webpack config
 */
export default (_, argv) => {
  const runMode = argv.mode ? argv.mode : "production";
  const runModeConfig = getConfig(runMode);

  return webpackMerge(baseConfig, runModeConfig);
};
