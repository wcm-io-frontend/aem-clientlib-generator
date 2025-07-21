import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { pathConfig } from "../../../path.config";

export const copy = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${path.resolve(pathConfig.paths.public)}/**/*.*`,
          to: `${pathConfig.paths.public}`,
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
};
