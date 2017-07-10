# Earthjs

#### Live Example
* [Earthquake](https://earthjs.github.io/)
* [Quick Start](http://blockbuilder.org/earthjs/df9abf84c90586cb9e27d5f4b3d21d14)
* [Complete Globe](http://blockbuilder.org/earthjs/562bbae9b4a22f826e40b9ee10445e23)

![Earthquake](https://earthjs.github.io/images/earthquake.png)

Earthjs is a javascript library for easy building orthographic globe. Originally inspired by [planetary.js](https://github.com/BinaryMuse/planetary.js) (canvas) and [Faux-3d Shaded Globe](http://bl.ocks.org/dwtkns/4686432) (svg) and both was created using D3.v3.

Earthjs created using D3.v4, design as pluggable modules.

Awesome interactive globe can be created, dragging to rotate any direction, zooming using scroll mouse or tap, multiple layer of globe with oceanSvg & fauxGlobeSvg, area of land can be plain one svg path or switch with bordered countries for optimized rendering, auto rotate with adjustable speed and ticker to balance between smooth and cpu utilization, point of places is included and lastly sample tool tips of the country. All of this can configure on the fly switching to activate, deactivate or adjust speed and ticker.

Support Canvas in or outside SVG! some of the canvas plugin implement mouse detection
on some area of canvas, hoover, click and double click are supported.

## Internal Plugins
Selected plugins bundled into library:

* configPlugin,
* centerCanvas,
* centerSvg,
* flattenPlugin,
* wheelZoomPlugin,
* versorMousePlugin,
* autorotatePlugin,
* canvasPlugin,
* threejsPlugin,
* dropShadowSvg,
* oceanSvg,
* hoverCanvas,
* clickCanvas,
* dblClickCanvas,
* graticuleSvg,
* fauxGlobeSvg,
* graticuleCanvas,
* countrySelectCanvas,
* barTooltipSvg,
* worldSvg,
* placesSvg,
* worldCanvas,
* worldThreejs,
* barSvg,
* dotsSvg,
* pingsSvg,
* dotsCanvas,
* dotTooltipCanvas,
* countryTooltipSvg,
* countryTooltipCanvas,
* pingsCanvas,
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
    const g = earthjs();
    g.register(earthjs.plugins.graticuleSvg());
    g.register(earthjs.plugins.autorotatePlugin(10));
    g.register(earthjs.plugins.worldSvg('./d/world-110m.json'));
    g.ready(function(){
        g.create();
    })
  </script>
</body>
</html>
```
## Writing Plugins
Plugins is a function created in "earthjs.plugins" namespace, return with javascript object. Some of the keys have a special meaning, "name" property will be define **plugin namespace** in "earthjs", "urls" property is an ajax url and six(6) functions start with "on" are event handler. Other functions that define in the plugin will be live on the **plugin namespace**. Function defined in the plugin will become **proxy function** in which they have a **context of earthjs instance**.
```javascript
export default (url) => {
    //....
    return {
        name: 'samplePlugin',
        urls: [url], // ajax url
        // executed after ajax call
        onReady(err, data) {},
        onInit    () {},
        onCreate  () {},
        onResize  () {},
        onRefresh () {},
        onInterval() {}
    }
}
```
**If necessary** _onReady()_ can be superseded by _ready()_ and the defintion of _ready()_ should not be in the plugin it self.

```javascript
// example:
g.register(earthjs.plugins.worldSvg('./d/world-110m.json'));
g.worldSvg.ready = function(err, world) {
    //+++collpased code
    g.worldSvg.data({world});
}
```

## Building
Building the project requires [Node.js](https://nodejs.org/en/). Once you've installed the project's dependencies with npm install, you can build the JavaScript to the dist directory with npm run build.

## License
earthjs.js is licensed under the **MIT license**. See the LICENSE file for more information.
