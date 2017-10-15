const {offsetWidth, offsetHeight} = d3.select('body').node();
const g = earthjs({width: offsetWidth, height: offsetHeight, padding:5})
.register(earthjs.plugins.inertiaPlugin())
.register(earthjs.plugins.threejsPlugin())
.register(earthjs.plugins.autorotatePlugin())
.register(earthjs.plugins.clickCanvas());

const light = g.threejsPlugin.light();
light.intensity = 0.5;
light.color.set(0x777777);
