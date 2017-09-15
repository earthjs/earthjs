const g = earthjs({scale:350})
.register(earthjs.plugins.mousePlugin())
// .register(earthjs.plugins.canvasPlugin())
.register(earthjs.plugins.threejsPlugin())
.register(earthjs.plugins.autorotatePlugin())

// drop shadow
.register(earthjs.plugins.dropShadowSvg())

// texture map of the world
// .register(earthjs.plugins.globeThreejs('../d/world.jpg'))
.register(earthjs.plugins.imageThreejs('../d/world.jpg'))
// polyline land of countries
// .register(earthjs.plugins.worldCanvas('../d/world-110m.json'))
.register(earthjs.plugins.worldThreejs('../d/world-110m.json'))

// polyline land of countries - filled
// .register(earthjs.plugins.canvasThreejs('../d/world-110m.json'))

// showing flightLine
.register(earthjs.plugins.flightLineThreejs('../d/flights2.json','../images/point3.png'))

// g.register(earthjs.plugins.barSvg('../d/bars.json'));
// g.barSvg.ready = function(err, json) {
//     json.features.forEach(d => d.geometry.value = d.properties.mag);
//     g.barSvg.data(json);
// };
// .register(earthjs.plugins.fauxGlobeSvg());
// g.canvasPlugin.selectAll('.ej-canvas');
g.mousePlugin.selectAll('#three-js');
// g.barSvg.selectAll('.ej-svg');

g.flightLineThreejs.ready = function(err, csv) {
    g.flightLineThreejs.data(csv, true, [30,100],100,1);
}
g.flightLineThreejs.onHover({
    checkLine(event) {
        console.log('checkLine')
    }
})

var flightLine;
g.ready(function(){
    g.create();
    g.flightLineThreejs.lightFlow(false);
    flightLine = g.flightLineThreejs.sphere().children;
    flightLine[0].visible = false;
    flightLine[1].visible = false;
})

d3.select('#auto-rotate').on('click', function() {
    var toggle = g.autorotatePlugin.spin();
    g.autorotatePlugin.spin(!toggle);
})
d3.select('#light-flow').on('click', function() {
    var toggle = g.flightLineThreejs.lightFlow();
    g.flightLineThreejs.lightFlow(!toggle);
})
d3.select('#line').on('click', function() {
    flightLine[0].visible = !flightLine[0].visible;
    g.threejsPlugin.renderThree();
})
d3.select('#light').on('click', function() {
    flightLine[1].visible = !flightLine[1].visible;
    g.flightLineThreejs.lightFlow(flightLine[1].visible);
    g.threejsPlugin.renderThree();
})
var colorChg = false;
d3.select('#color-chg').on('click', function() {
    var data = g.flightLineThreejs.data();
    colorChg = !colorChg;
    if (colorChg) {
        g.flightLineThreejs.data(data, ['#aaffff','#ff0011'], [30,100],100,1);
    } else {
        g.flightLineThreejs.data(data, true, [30,100],100,1);
    }
    g.flightLineThreejs.reload();
    flightLine = g.flightLineThreejs.sphere().children;
})
