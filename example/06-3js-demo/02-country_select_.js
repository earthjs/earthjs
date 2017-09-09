const g = earthjs({scale:350})
.register(earthjs.plugins.dropShadowSvg())
.register(earthjs.plugins.selectCountryMix())
.register(earthjs.plugins.imageThreejs('../d/world.jpg'));
g.mousePlugin.selectAll('#three-js');
g.ready(function(){
    g.create();
})
