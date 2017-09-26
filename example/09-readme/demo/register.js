/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
const g = earthjs({padding:85})
.register(earthjs.plugins.mousePlugin())
.register(earthjs.plugins.threejsPlugin())
.register(earthjs.plugins.autorotatePlugin())
.register(earthjs.plugins.clickCanvas())
.register(earthjs.plugins.dropShadowSvg())
.register(earthjs.plugins.graticuleThreejs())
.register(earthjs.plugins.worldThreejs('../d/world-110m.json'))
.register(earthjs.plugins.imageThreejs('../globe/world5.jpg'),'oceanThreejs')
.register(earthjs.plugins.world3d('../d/world.geometry.json','../globe/blue.jpg',0.95))
.register(earthjs.plugins.imageThreejs('../globe/earth_ocean-mask.png'), 'earthThreejs')
.register(earthjs.plugins.flightLineThreejs('../data/flights2.json','../globe/point3.png'))
.register(earthjs.plugins.iconsThreejs('../data/bars.json','../globe/check.svg'))
.register(earthjs.plugins.barThreejs());
