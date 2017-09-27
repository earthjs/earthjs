/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
function checked(ids) {
    d3.selectAll('.left input:checked').property('checked', false);
    d3.selectAll(`#toggle-${ids.replace(/,/g,',#toggle-')}`).property('checked', true);
}

d3.select('#toggle-flight' ).on('click', () => (g.flight.isAdded()    ? g.flight.remove()    : g.flight.add()));
d3.select('#toggle-grat'   ).on('click', () => (g.graticule.isAdded() ? g.graticule.remove() : g.graticule.add()));
d3.select('#toggle-earth'  ).on('click', () => (g.earth.isAdded()     ? g.earth.remove()     : g.earth.add()));
d3.select('#toggle-world3d').on('click', () => (g.world3d.isAdded()   ? g.world3d.remove()   : g.world3d.add()));
d3.select('#toggle-canvas' ).on('click', () => (g.canvas.isAdded()    ? g.canvas.remove()    : g.canvas.add()));
d3.select('#toggle-border' ).on('click', () => (g.border.isAdded()    ? g.border.remove()    : g.border.add()));
d3.select('#toggle-ocean1' ).on('click', () => {
    d3.selectAll('#toggle-ocean2').property('checked', false);
    d3.selectAll('#toggle-ocean1').property('checked', true);
    if (g.ocean1.isAdded())
        g.ocean1.remove()
    else {
        g.ocean2.remove()
        g.ocean1.add()
    };
});
d3.select('#toggle-ocean2' ).on('click', () => {
    d3.selectAll('#toggle-ocean1').property('checked', false);
    d3.selectAll('#toggle-ocean2').property('checked', true);
    if (g.ocean2.isAdded())
        g.ocean2.remove()
    else {
        g.ocean1.remove()
        g.ocean2.add()
    };
});
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
d3.select('#blue-marble').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.ocean1.add();
    g.border.add();
    g.world3d.add();
    g.earth.add();
    checked('ocean1,border,world3d,earth');
});
d3.select('#heat-map').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.graticule.add();
    g.ocean2.add();
    g.canvas.add();
    checked('grat,ocean2,canvas');
});
d3.select('#float-3d').on('click', () => {
    if (!g._.options.tween) {
        g.threejsPlugin.emptyGroup();
        g.graticule.add();
        g.ocean1.add();
        g.world3d.add();
        g.border.add();
        checked('grat,ocean1,world3d,border');
        tmax = 20;
        tweening();
    } else {
        tmax = 1;
    }
});
d3.select('#bar-graph').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.graticule.add();
    g.ocean1.add();
    g.world3d.add();
    g.border.add();
    g.iconsThreejs.add();
    g.barThreejs.add();
    checked('grat,ocean1,border,bars,world3d');
});
d3.select('#flight-ln').on('click', () => {
    g.threejsPlugin.emptyGroup();
    g.graticule.add();
    g.ocean2.add();
    g.world3d.add();
    g.earth.add();
    g.border.add();
    g.flight.add();
    checked('grat,ocean2,border,world3d,earth,flight');
});
