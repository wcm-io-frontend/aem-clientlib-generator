import webpackMerge from "webpack-merge";
import { devServer } from "./server";

export const devConfig = webpackMerge(devServer, {
  devtool: "source-map",
  bail: true
});
