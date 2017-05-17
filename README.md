# Earthjs
D3 Earth JS

Earthjs is a javascript library for easy building orthographic globe. Originally inspired by [planetary.js](https://github.com/BinaryMuse/planetary.js) (canvas) and [Faux-3d Shaded Globe](http://bl.ocks.org/dwtkns/4686432) (svg) and both was created using D3.v3.

Earthjs created using D3.v4, design as pluggable modules.

Awesome interactive globe can be created, dragging to rotate any direction, zooming using scroll mouse or tap, multiple layer of globe with oceanPlugin & fauxGlobePlugin, area of land can be plain one svg path or switch with bordered countries for optimized rendering, auto rotate with adjustable speed and ticker to balance between smooth and cpu utilization, point of places is included and lastly sample tool tips of the country. All of this can configure on the fly switching to activate, deactivate or adjust speed and ticker.

Support Canvas in or outside SVG!

## Internal Plugins
Selected plugins bundled into library:

* versorDragPlugin,
* wheelZoomPlugin,
* threejsPlugin,
* canvasPlugin,
* oceanPlugin,
* configPlugin,
* graticuleCanvas,
* graticulePlugin,
* fauxGlobePlugin,
* autorotatePlugin,
* countryTooltipPlugin,
* placesPlugin,
* worldCanvas,
* worldPlugin,
* worldThreejs,
* centerPlugin,
* flattenPlugin,
* barPlugin,
* dotsPlugin,
* dotsCanvas,
* pingsPlugin,
* debugThreejs,
* commonPlugins,

## Requirements
* [D3 version 4](http://d3js.org/)
* [topojson version 3](https://github.com/topojson/topojson)

## Quick Start
This sample need to run on the webserver, you can use [nodejs web-server](https://www.npmjs.com/package/http-server) or [python simple http server](http://2ality.com/2014/06/simple-http-server.html).
```html
<html>
<head>
  <script type='text/javascript' src='http://d3js.org/d3.v4.min.js'></script>
  <script type='text/javascript' src='http://d3js.org/topojson.v3.min.js'></script>
  <script type='text/javascript' src='../dist/earthjs.js'></script>
  <style media="screen">
  .countries path {
      fill: rgb(117, 87, 57);
      stroke: rgb(80, 64, 39);
      stroke-linejoin: round;
      stroke-width: 1.5;
      opacity: 1;
  }
  .graticule path {
      fill: none;
      opacity: 0.2;
      stroke: black;
      stroke-width: 0.5;
  }
</style>
</head>
<body>
  <svg id="earth"></svg>
  <script>
    var p = earthjs({width: 700, height: 500});
    p.register(earthjs.plugins.graticulePlugin());
    p.register(earthjs.plugins.autorotatePlugin(10));
    p.register(earthjs.plugins.worldPlugin('./d/world-110m.json'));
    p.ready(function(){
        p.svgDraw();
    })
  </script>
</body>
</html>
```
#### Live Example
* [Quick Start](http://blockbuilder.org/earthjs/df9abf84c90586cb9e27d5f4b3d21d14)
* [Complete Globe](http://blockbuilder.org/earthjs/562bbae9b4a22f826e40b9ee10445e23)

## Writing Plugins
Sample skeleton of plugin, five(5) event handler and you can add any function that will be live on the plugin namespace, you can check folder plugins for each functionality.
```javascript
export default function(url='/some/path.json') {
    // Internal functions definitions
    // var _ = {svg:null, q: null}; // (**)
    //
    return {
        // namespace for the plugins
        name: 'samplePlugin',
        // async ajax call and when finish, it will call onReady()
        data: [url],
        // event handler ajax
        onReady(err, places) {
            // code...(*)
        },
        // register event handler
        onInit() {
            // code...(*)
            // _.svg = this._.svg; // (**)
        },
        // zoom event handler
        onResize() {
            // code...(*)
            // see fauxGlobePlugin, oceanPlugin
        },
        // refresh svg graphics components
        onRefresh() {
            // code...(*)
            // see graticulePlugin, placesPlugin, worldPlugin
        },
        // timer event handler
        onInterval() {
            // code...(*)
        }
        /* (**)
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        }
        // see fauxGlobePlugin, graticulePlugin, oceanPlugin,
        //     placesPlugin, worldPlugin.
        */
    }
}
(*) context refer to earthjs instance.
(**) pattern need to follow if plugins operate with .._.svg.append().
```

## Building
Building the project requires [Node.js](https://nodejs.org/en/). Once you've installed the project's dependencies with npm install, you can build the JavaScript to the dist directory with npm run build.

## License
earthjs.js is licensed under the MIT license. See the LICENSE file for more information.
