/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
d3.select('#empty-group'   ).on('click', () => (g.threejsPlugin.emptyGroup()));
d3.select('#toggle-flight' ).on('click', () => (g.flightLineThreejs.isAdded() ? g.flightLineThreejs.remove() : g.flightLineThreejs.add()));
d3.select('#toggle-grat'   ).on('click', () => (g.graticuleThreejs.isAdded() ? g.graticuleThreejs.remove() : g.graticuleThreejs.add()));
d3.select('#toggle-ocean'  ).on('click', () => (g.oceanThreejs.isAdded() ? g.oceanThreejs.remove() : g.oceanThreejs.add()));
d3.select('#toggle-earth'  ).on('click', () => (g.earthThreejs.isAdded() ? g.earthThreejs.remove() : g.earthThreejs.add()));
d3.select('#toggle-world3d').on('click', () => (g.world3d.isAdded() ? g.world3d.remove() : g.world3d.add()));
d3.select('#toggle-border' ).on('click', () => (g.worldThreejs.isAdded() ? g.worldThreejs.remove() : g.worldThreejs.add()));
d3.select('#toggle-bars'   ).on('click', () => {
    if (g.barThreejs.isAdded()) {
        g.iconsThreejs.remove();
        g.barThreejs.remove();
    } else {
        g.iconsThreejs.add();
        g.barThreejs.add();
    }
});
d3.select('#float-3d').on('click', () => {
    if (!g._.options.tween) {
        g.threejsPlugin.emptyGroup();
        g.graticuleThreejs.add();
        g.worldThreejs.add();
        g.world3d.add();
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
});
d3.select('#blue-marble').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.oceanThreejs.add();
    g.worldThreejs.add();
    g.world3d.add();
    g.earthThreejs.add();
});
d3.select('#flight-ln').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.graticuleThreejs.add();
    g.oceanThreejs.add();
    g.worldThreejs.add();
    g.world3d.add();
    g.earthThreejs.add();
    g.flightLineThreejs.add();
});
