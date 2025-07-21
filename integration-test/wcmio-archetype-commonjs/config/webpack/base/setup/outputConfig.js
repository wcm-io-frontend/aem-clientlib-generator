import path from "path";
import { pathConfig } from "../../../path.config";

export const output = {
  path: path.resolve(pathConfig.paths.target),
  filename: `${pathConfig.paths.jsTarget}/[name].js`,
  chunkFilename: `${pathConfig.paths.jsTarget}/[name].[hash].js`
};
