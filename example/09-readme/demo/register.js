/* eslint no-unused-vars:0 */
/* eslint no-console:0 */
/* eslint no-undef:0 */
const {offsetWidth, offsetHeight} = d3.select('body').node();
const g = earthjs({width: offsetWidth, height: offsetHeight, padding:5})
// .register(earthjs.plugins.mousePlugin())
.register(earthjs.plugins.inertiaPlugin())
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
.register(earthjs.plugins.world3dThreejs('../d/world.geometry.json','../globe/blue.jpg',0.975),'world3d')
.register(earthjs.plugins.imageThreejs('../globe/earth_ocean-mask.png'), 'earth')
.register(earthjs.plugins.choroplethCsv('../data/2010_alcohol_consumption_by_country.csv'))
.register(earthjs.plugins.canvasThreejs(),'canvas')
.register(earthjs.plugins.dotsThreejs('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'),'equake')
.register(earthjs.plugins.iconsThreejs('../data/bars.json','../globe/check.svg'))
.register(earthjs.plugins.flightLineThreejs('../data/flights2.json','../globe/point3.png'),'flight')
.register(earthjs.plugins.flightLineThreejs('../data/flights.json','../globe/point.png'),'flight2')
.register(earthjs.plugins.barThreejs());
g._.options.showLakes = false;
