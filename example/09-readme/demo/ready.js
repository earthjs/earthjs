/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
g.iconsThreejs.ready = function(err, json) {
    json.features.forEach(function(d) {
        d.geometry.value = d.properties.mag;
    });
    g.iconsThreejs.data(json);
    g.barThreejs.data(json);
};
g.flight.ready = function(err, csv) {
    g.flight.data(csv,['#aaffff','#ff0011'],[30,200],100,1);
}
g.border.ready = function(err, json) {
    g.canvas.data(json);
    g.border.data(json);
    g.clickCanvas.data(json);
}

let data,keys,r;
// g.autorotatePlugin.stop();
g._.options.choropleth = true;
g.ready(function(){
    const countries = g.border.allData().countries;
    g.choroplethCsv  .colorize('alcohol', 'schemeOranges', 0.8); //schemeReds, https://github.com/d3/d3-scale-chromatic
    g.choroplethCsv  .mergeData(countries, ['properties.cid:cid', 'properties.color:color']);
    g.choroplethCsv  .mergeData(countries, ['properties.cid:cid', 'properties.value:alcohol']);
    g.canvas.allData(g.border.allData());
    g.create();

    g.threejsPlugin.emptyGroup();
    // g.flight.add();
    g.ocean1.add();

    r = g._.proj.scale()-3;
    g.graticule.sphere().scale.set(0.97,0.97,0.97);
    g.ocean1.sphere().scale.set(0.97,0.97,0.97);
    g.ocean2.sphere().scale.set(0.97,0.97,0.97);
    g.world3d.sphere().scale.set(r,r,r);

    data = g.world3d.data();
    keys = Object.keys(data);
});
