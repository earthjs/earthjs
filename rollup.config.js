import node from "rollup-plugin-node-resolve";

export default {
  entry: "index.js",
  format: "umd",
  plugins: [node()],
  moduleName: "earthjs",
  dest: "dist/earthjs.js",
  sourceMap: true
};
