/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
function changeOcean(id,enabled) {
    d3.selectAll('#toggle-ocean1,#toggle-ocean2,#toggle-ocean3').property('checked', false);
    g.ocean1.remove()
    g.ocean2.remove()
    g.ocean3.remove()
    if (enabled) {
        g[`ocean${id}`].add();
        d3.selectAll(`#toggle-ocean${id}`).property('checked', true);
    }
}
function checked(ids,addition) {
    g.threejsPlugin.emptyGroup();
    ids.split(',').forEach(s=>g[s].add());
    if (addition) {
        ids = `${ids},${addition}`;
    }
    d3.selectAll('.left input:checked').property('checked', false);
    d3.selectAll(`#toggle-${ids.replace(/,/g,',#toggle-')}`).property('checked', true);
}
function toggle(key, enabled) {
    enabled ? g[key].add() : g[key].remove()
}
d3.select('#toggle-earth'    ).on('click', () => toggle('earth',    d3.event.target.checked));
d3.select('#toggle-equake'   ).on('click', () => toggle('equake',   d3.event.target.checked));
d3.select('#toggle-flight'   ).on('click', () => toggle('flight',   d3.event.target.checked));
d3.select('#toggle-flight2'  ).on('click', () => toggle('flight2',  d3.event.target.checked));
d3.select('#toggle-graticule').on('click', () => toggle('graticule',d3.event.target.checked));
d3.select('#toggle-world3d'  ).on('click', () => toggle('world3d',  d3.event.target.checked));
d3.select('#toggle-canvas'   ).on('click', () => toggle('canvas',   d3.event.target.checked));
d3.select('#toggle-border'   ).on('click', () => toggle('border',   d3.event.target.checked));
d3.select('#toggle-ocean1'   ).on('click', () => changeOcean(1,     d3.event.target.checked));
d3.select('#toggle-ocean2'   ).on('click', () => changeOcean(2,     d3.event.target.checked));
d3.select('#toggle-ocean3'   ).on('click', () => changeOcean(3,     d3.event.target.checked));
d3.select('#toggle-bars'     ).on('click', () => {
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
d3.select('#blue-marble').on('click', () => checked('ocean1,earth'));
d3.select('#heat-map'   ).on('click', () => checked('border,ocean1,canvas'));
d3.select('#float-3d'   ).on('click', () => {
    checked('graticule,ocean3,world3d,border');
    if (!g.world3d.tween) {
        tmax = tval;
        tweening();
    } else {
        tmax = 1;
    }
});
d3.select('#bar-graph').on('click', () => {
    checked('ocean1,border,world3d','bars');
    g.iconsThreejs.add();
    g.barThreejs.add();
});
d3.select('#flight-ln').on('click', () => {
    checked('graticule,ocean3,border,world3d,earth,flight');
});
d3.select('#e-quake').on('click', () => {
    checked('ocean2,border,equake');
});
