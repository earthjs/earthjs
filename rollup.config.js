import node from "rollup-plugin-node-resolve";

export default {
  entry: "index.js",
  format: "umd",
  plugins: [node()],
  moduleName: "earthjs",
  dest: "build/earthjs.js",
  sourceMap: true
};
