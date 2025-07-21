import { merge } from "webpack-merge";
import { devServer } from "./server.js";

export const devConfig = merge(devServer, {
  devtool: "source-map",
  bail: true
});
