# Earthjs
D3 Earth JS

Earthjs.js is a javascript library for easy building earth orthographic. Originally inspired by [planetary.js](https://github.com/BinaryMuse/planetary.js) (canvas) and [Faux-3d Shaded Globe](http://bl.ocks.org/dwtkns/4686432) (svg) and it was created using early version of D3.v3.

To make it easy for D3.v4 users to create (svg) orthographic globe, this library was created with plugins architecture in mind. Svg graphic components will be automatically created when user register the plugins.

## Internal Plugins
Selected plugins bundled into library:

* versorDragPlugin,
* wheelZoomPlugin,
* oceanPlugin,
* configPlugin,
* graticulePlugin,
* fauxGlobePlugin,
* autorotatePlugin,
* placesPlugin,
* worldPlugin,
* countryTooltipPlugin

## Quick Start
This sample need to run on the webserver, you can use [nodejs web-server](https://www.npmjs.com/package/http-server) or [python simple http server](http://2ality.com/2014/06/simple-http-server.html).
```html
<html>
<head>
  <script type='text/javascript' src='http://d3js.org/d3.v4.min.js'></script>
  <script type='text/javascript' src="http://d3js.org/queue.v1.min.js"></script>
  <script type='text/javascript' src='http://d3js.org/topojson.v1.min.js'></script>
  <script type='text/javascript' src='../dist/earthjs.min.js'></script>
  <style media="screen">
  .countries path {
      stroke: rgb(80, 64, 39);
      stroke-linejoin: round;
      stroke-width: 1.5;
      fill: rgb(117, 87, 57);
      opacity: 1;
  }
  .graticule path {
      fill: none;
      stroke: black;
      stroke-width:.5;
      opacity:.2;
  }
  </style>
</head>
<body>
  <svg id="earth"></svg>
  <script>
    var p = earthjs({width: 250, height: 250});
    p.register(earthjs.plugins.graticulePlugin());
    p.register(earthjs.plugins.autorotatePlugin(10));
    p.register(earthjs.plugins.worldPlugin('./d/world-110m.json'));
    p.ticker();
  </script>
</body>
</html>
```

## Building
Building the project requires [Node.js](https://nodejs.org/en/). Once you've installed the project's dependencies with npm install, you can build the JavaScript to the dist directory with npm run build.

## License
earthjs.js is licensed under the MIT license. See the LICENSE file for more information.
