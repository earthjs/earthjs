/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
d3.select('#toggle-flight' ).on('click', () => (g.flightLineThreejs.isAdded() ? g.flightLineThreejs.remove() : g.flightLineThreejs.add()));
d3.select('#toggle-grat'   ).on('click', () => (g.graticuleThreejs.isAdded()  ? g.graticuleThreejs.remove()  : g.graticuleThreejs.add()));
d3.select('#toggle-ocean'  ).on('click', () => (g.oceanThreejs.isAdded()      ? g.oceanThreejs.remove()      : g.oceanThreejs.add()));
d3.select('#toggle-earth'  ).on('click', () => (g.earthThreejs.isAdded()      ? g.earthThreejs.remove()      : g.earthThreejs.add()));
d3.select('#toggle-world3d').on('click', () => (g.world3d.isAdded()           ? g.world3d.remove()           : g.world3d.add()));
d3.select('#toggle-canvas' ).on('click', () => (g.canvasThreejs.isAdded()     ? g.canvasThreejs.remove()     : g.canvasThreejs.add()));
d3.select('#toggle-border' ).on('click', () => (g.worldThreejs.isAdded()      ? g.worldThreejs.remove()      : g.worldThreejs.add()));
d3.select('#toggle-bars'   ).on('click', () => {
    if (g.barThreejs.isAdded()) {
        g.iconsThreejs.remove();
        g.barThreejs.remove();
    } else {
        g.iconsThreejs.add();
        g.barThreejs.add();
    }
});
d3.select('#empty-group'   ).on('click', () => {
    d3.selectAll('.input-area input:checked').property('checked', false);
    g.threejsPlugin.emptyGroup();
    tmax = 1;
});
function checked(ids) {
    d3.selectAll('.left input:checked').property('checked', false);
    d3.selectAll(`#toggle-${ids.replace(/,/g,',#toggle-')}`).property('checked', true);
}
d3.select('#blue-marble').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.oceanThreejs.add();
    g.worldThreejs.add();
    g.world3d.add();
    g.earthThreejs.add();
    checked('ocean,border,world3d,earth');
});
d3.select('#heat-map').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.graticuleThreejs.add();
    g.oceanThreejs.add();
    g.canvasThreejs.add();
    checked('grat,ocean,canvas');
});
d3.select('#float-3d').on('click', () => {
    if (!g._.options.tween) {
        g.threejsPlugin.emptyGroup();
        g.graticuleThreejs.add();
        g.oceanThreejs.add();
        g.worldThreejs.add();
        g.world3d.add();
        checked('grat,ocean,border,world3d');
        tmax = 20;
        tweening();
    } else {
        tmax = 1;
    }
});
d3.select('#bar-graph').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.graticuleThreejs.add();
    g.oceanThreejs.add();
    g.worldThreejs.add();
    g.iconsThreejs.add();
    g.barThreejs.add();
    g.world3d.add();
    checked('grat,ocean,border,bars,world3d');
});
d3.select('#flight-ln').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.graticuleThreejs.add();
    g.oceanThreejs.add();
    g.worldThreejs.add();
    g.world3d.add();
    g.earthThreejs.add();
    g.flightLineThreejs.add();
    checked('grat,ocean,border,world3d,earth,flight');
});
