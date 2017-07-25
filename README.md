# Earthjs

#### Live Example
* [Earthquake](https://earthjs.github.io/)
* [Quick Start](http://blockbuilder.org/earthjs/df9abf84c90586cb9e27d5f4b3d21d14)
* [Complete Globe](http://blockbuilder.org/earthjs/562bbae9b4a22f826e40b9ee10445e23)

![Earthquake](https://earthjs.github.io/images/earthquake.png)

Earthjs is a javascript library for easy building orthographic globe. Originally inspired by [planetary.js](https://github.com/BinaryMuse/planetary.js) (canvas) and [Faux-3d Shaded Globe](http://bl.ocks.org/dwtkns/4686432) (svg) and both were created using D3-v3.

Earthjs is created using D3-v4, design as pluggable modules.

Awesome interactive globe can be created, dragging to rotate globe to any direction, zooming using scroll mouse or tap, multiple layer of globe with ocean (oceanSvg) & skinned globe like [Faux-3d Shaded Globe](http://bl.ocks.org/dwtkns/4686432) (fauxGlobeSvg), area of world can be plain one svg path or using canvas plugin, toggle with hide/show countries border or lakes for optimized rendering, auto rotate with adjustable speed and ticker, balancing between smooth and cpu utilization, point of places, bar chart in globe, country tooltip, point of location (dots) tooltip, bar chart in globe tooltip, graticules, etc (see below list of the plugins). All of this can be configured on the fly, switching to activate / deactivate, adjust speed and ticker.

Support Canvas in or outside SVG! Canvas mouse detection is included with hover, click and doubleclick event are supported.

## Internal Plugins
Selected plugins bundled into library:

* configPlugin,
* autorotatePlugin,
* mousePlugin,
* zoomPlugin,
* centerCanvas,
* centerSvg,
* flattenPlugin,
* canvasPlugin,
* threejsPlugin,
* dropShadowSvg,
* canvasThreejs,
* oceanThreejs,
* oceanSvg,
* sphereSvg,
* hoverCanvas,
* clickCanvas,
* dblClickCanvas,
* graticuleSvg,
* fauxGlobeSvg,
* graticuleCanvas,
* graticuleThreejs,
* countrySelectCanvas,
* barTooltipSvg,
* dotTooltipSvg,
* worldSvg,
* placesSvg,
* worldCanvas,
* worldThreejs,
* imageThreejs,
* barSvg,
* dotsSvg,
* pingsSvg,
* pinCanvas,
* dotsCanvas,
* dotsThreejs,
* dotsCThreejs,
* dotSelectCanvas,
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
    //.... private code
    return {
        name: 'samplePlugin',
        urls: [url],     // ajax url
        onReady   () {}, // ajax handler
        onInit    () {},
        onCreate  () {},
        onResize  () {},
        onRefresh () {},
        onInterval() {}
    }
}
```
**If necessary** when the plugin is in use, _onReady()_ can be superseded by _ready()_ function, created in the plugin namespace.

```javascript
// example:
g.register(earthjs.plugins.worldSvg('./d/world-110m.json'));
g.worldSvg.ready = function(err, world) {
    //+++collpased code
    g.worldSvg.data({world});
}
```
**Plugin example**
```javascript
earthjs.plugins.graticuleSimple = () => {
    const grat = d3.geoGraticule(), $ = {};

    function create() {
        this._.svg.selectAll('.graticule').remove();
        $.grat = this._.svg.append("path").datum(grat).attr("class", "graticule");
        refresh.call(this);
    }

    function refresh() {
        $.grat.attr("d", this._.path);
    }

    return {
        name: 'graticuleSimple',
        onCreate()  {create .call(this);},
        onRefresh() {refresh.call(this);}
    }
}

//... plugin in use
const g = earthjs();
g.register(earthjs.plugins.graticuleSimple());
g.create();
```
**convention**

For SVG create function:
* when removing element, it should be removing same element that created from same plugin.
* attributes are often get update (ex:"d"), it should be placed in refresh function and at the end of create function, it should call the refresh function.

in general, return value should be a simple object where by body of functions are kept in the private place with same name, and the execution is using **.call(this,...)**

For Canvas, it always recreate the whole canvas, mean that onCreate & onRefresh should be using same logic of drawing.  

## Building
Building the project requires [Node.js](https://nodejs.org/en/). Once you've installed the project's dependencies with npm install, you can build the JavaScript to the dist directory with npm run build.

## License
earthjs.js is licensed under the **MIT license**. See the LICENSE file for more information.
