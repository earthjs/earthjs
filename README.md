# Earthjs

#### Live Example
* [Earthquake](https://earthjs.github.io/)
* [3D Flight Line](https://earthjs.github.io/09-readme/index.html)

![alt #D Flight Line](https://raw.githubusercontent.com/earthjs/earthjs/master/example/images/3DflightLine.png)

Earthjs is a javascript library for easy building orthographic globe. Originally inspired by [planetary.js](https://github.com/BinaryMuse/planetary.js) (canvas) and [Faux-3d Shaded Globe](http://bl.ocks.org/dwtkns/4686432) (svg) and both were created using D3-v3.

Earthjs is created using D3-v4, design as pluggable modules.

Awesome interactive globe can be created, drag to rotate, scroll mouse zooming. Multi layer of globe, combination between SVG, Canvas and Threejs. Multiple globe as a twin globe with same or different layer. Solid or transparent globe in SVG, Canvas or Threejs, hide/show some features balancing between smooth rendering and cpu utilization. point/mark of location, bar chart on globe & tooltips.

SVG for quickly prototyping the globe as it used standard SVG DOM element so event & css can be applied to each element. the downside will come when the need to create so much SVG element, the responsiveness or jaggering drag will show.

Canvas for more data point that need to be render and UX experience stay in good shape. Interactivity or mouse detection are available for hovering, click & double click. detect country or point of location.

WebGL/Threejs is a way to go if eye catchy of globe is needed and lots of data, or want to be better CPU utilization by moving some intensive calculation to GPU.

Interesting Data Visualization can be created by combining SVG, Canvas & Threejs(WebGL) like: choropleth globe using Canvas or Threejs, heatmap globe by rendering heatmap on canvas and use that canvas as a texture in Threejs, flightLine to connect two datapoint using Threejs and coloring target location (usually country) using Canvas. flashy bullet that travel along the way of flightLine is there including the mouse event using Threejs.

## Internal Plugins (more than 60)
Selected plugins bundled into library:

* baseCsv,
* baseGeoJson,
* worldJson,
* world3dJson,
* choroplethCsv,
* countryNamesCsv,
* colorScale,
* dotRegion,
* hoverCanvas,
* clickCanvas,
* mousePlugin,
* canvasPlugin,
* inertiaPlugin,
* countryCanvas,
* threejsPlugin,
* dblClickCanvas,
* autorotatePlugin,
* oceanSvg,
* sphereSvg,
* zoomPlugin,
* fauxGlobeSvg,
* graticuleSvg,
* dropShadowSvg,
* dotTooltipSvg,
* dotSelectCanvas,
* graticuleCanvas,
* dotTooltipCanvas,
* countrySelectCanvas,
* countryTooltipCanvas,
* countryTooltipSvg,
* barTooltipSvg,
* worldCanvas,
* centerSvg,
* placesSvg,
* worldSvg,
* barSvg,
* mapSvg,
* haloSvg,
* dotsSvg,
* pingsSvg,
* pinCanvas,
* dotsCanvas,
* pingsCanvas,
* centerCanvas,
* flattenSvg,
* barThreejs,
* hmapThreejs,
* dotsThreejs,
* dotsCThreejs,
* iconsThreejs,
* canvasThreejs,
* pointsThreejs,
* textureThreejs,
* graticuleThreejs,
* flightLineThreejs,
* oceanThreejs,
* imageThreejs,
* inertiaThreejs,
* worldThreejs,
* globeThreejs,
* sphereThreejs,
* world3d,
* world3d2,
* commonPlugins,
* selectCountryMix,
* selectCountryMix2,

## Requirements
* [D3 version 4](http://d3js.org/)
* [topojson version 3](https://github.com/topojson/topojson)

##### Optional
* [threejs revision 8x](https://threejs.org/) for Threejs type of globe

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
    const g = earthjs()
    .register(earthjs.plugins.graticuleSvg())
    .register(earthjs.plugins.autorotatePlugin(10))
    .register(earthjs.plugins.worldSvg('./d/world-110m.json'));
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
g.worldSvg.ready = function(err, json) {
    //+++collpased code
    g.worldSvg.data(json);
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
const g = earthjs()
.register(earthjs.plugins.graticuleSimple())
.create();
```
**convention**

For SVG create function:
* when removing element, it should be removing same element that created from same plugin.
* attributes often get updated (ex:"d"), it should be placed in refresh function.
* at the end of create function, it should call refresh function.

in general, return value should be a simple object whereby body of functions are kept in the private place with same name, and use **.call(this,...)** to execute the private function.

For Canvas, it always recreate the whole canvas, mean that onCreate & onRefresh should be using same (logic of drawing) function.

For Threejs, the concept of refresh is different compare with SVG or Canvas, when globe rotate the internal state of projection is changed, to reflect the changes in UI, SVG or Canvas need to refresh or redraw the path, as for Threejs the D3 projection state change need to be transfer to Threejs main container object, so less need to create onRefresh function.   

## Building
Building earthjs requires [Node.js](https://nodejs.org/en/). Once you've installed the project's dependencies with npm install, you can build earthjs to the dist directory with npm run build.

## License
earthjs.js is licensed under the **MIT license**. See the LICENSE file for more information.

```
MIT License

Copyright (c) 2017 Widi Harsojo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
