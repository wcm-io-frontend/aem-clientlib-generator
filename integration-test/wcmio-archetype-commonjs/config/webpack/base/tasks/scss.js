import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { pathConfig } from "../../../path.config";

export const scss = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: `${pathConfig.paths.styleTarget}/[name].css`,
      chunkFilename: `${pathConfig.paths.styleTarget}/[id].css`
    })
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
};
