const g = earthjs({scale:350})
.register(earthjs.plugins.mousePlugin())
.register(earthjs.plugins.threejsPlugin())
.register(earthjs.plugins.autorotatePlugin())
.register(earthjs.plugins.dropShadowSvg())
.register(earthjs.plugins.globeThreejs('../d/world.jpg'))
.register(earthjs.plugins.worldThreejs('../d/world-110m.json'))
.register(earthjs.plugins.flightLineThreejs('../d/flights2.json','../images/point3.png'))
g.mousePlugin.selectAll('#three-js');
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
