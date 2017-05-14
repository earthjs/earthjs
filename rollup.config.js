// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
// import node from "rollup-plugin-node-resolve";

export default {
    entry: "index.js",
    format: "iife",
    moduleName: "earthjs",
    dest: "dist/earthjs.js",
    sourceMap: true,
    plugins: [
        // node(),
        eslint({
          exclude: [
            'src/styles/**',
          ]
        }),
        babel({
            exclude: 'node_modules/**',
        })
    ],
};
