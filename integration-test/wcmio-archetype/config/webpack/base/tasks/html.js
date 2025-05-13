import HtmlWEbpackPlugin from "html-webpack-plugin";

export const html = {
  plugins: [
    new HtmlWEbpackPlugin({
      template: "index.hbs",
      filename: "index.html"
    })
  ]
};
