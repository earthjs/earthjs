// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import bundleWorker from 'rollup-plugin-bundle-worker';
// import butternut from 'rollup-plugin-butternut';
// import node from "rollup-plugin-node-resolve";

export default {
    entry: "build.js",
    format: "iife",
    moduleName: "earthjs",
    dest: "dist/earthjs.js",
    sourceMap: true,
    plugins: [
        // node(),
        // butternut(),
        bundleWorker(),
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
