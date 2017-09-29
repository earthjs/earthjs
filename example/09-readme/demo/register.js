/* eslint no-unused-vars:0 */
/* eslint no-console:0 */
/* eslint no-undef:0 */
const body = d3.select('body').node();
const width = body.offsetWidth;
const height = body.offsetHeight;
d3.select('#earth-js').attr('width',width).attr('height',height);
const g = earthjs({width, height, padding:95})
.register(earthjs.plugins.mousePlugin())
.register(earthjs.plugins.threejsPlugin())
.register(earthjs.plugins.autorotatePlugin())
.register(earthjs.plugins.clickCanvas())
.register(earthjs.plugins.dropShadowSvg())
.register(earthjs.plugins.worldSvg(),'borderSvg')
.register(earthjs.plugins.oceanThreejs(),'ocean3')
.register(earthjs.plugins.graticuleThreejs(),'graticule')
.register(earthjs.plugins.worldThreejs('../d/world-110m.json'),'border')
.register(earthjs.plugins.imageThreejs('../globe/world_texture_1.jpg'),'ocean1')
.register(earthjs.plugins.imageThreejs('../globe/world_texture_2.jpg'),'ocean2')
// .register(earthjs.plugins.imageThreejs('../globe/world_texture_2.jpg'),'ocean3')
.register(earthjs.plugins.world3d('../d/world.geometry.json','../globe/blue.jpg',0.975))
.register(earthjs.plugins.imageThreejs('../globe/earth_ocean-mask.png'), 'earth')
.register(earthjs.plugins.flightLineThreejs('../data/flights2.json','../globe/point3.png'),'flight')
.register(earthjs.plugins.choroplethCsv('../data/2010_alcohol_consumption_by_country.csv'))
.register(earthjs.plugins.canvasThreejs(),'canvas')
.register(earthjs.plugins.iconsThreejs('../data/bars.json','../globe/check.svg'))
.register(earthjs.plugins.barThreejs());
g._.options.showLakes = false;
