import path from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { pathConfig } from "../../../path.config";

const pathsToClean = [pathConfig.paths.target];

export const clean = {
  plugins: [new CleanWebpackPlugin({
    cleanOnceBeforeBuildPatterns: pathsToClean,
    verbose: false
  })]
};
