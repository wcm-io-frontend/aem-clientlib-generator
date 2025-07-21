import path from "path";

export const pathConfig = {
  paths: {
    src: path.resolve("src"),
    target: path.resolve("dist"),
    public: "public",
    styleTarget: "static/styles",
    jsTarget: "static/js"
  }
};
