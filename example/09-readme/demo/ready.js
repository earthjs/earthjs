/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
g.border.ready = function(err, json) {
    g.borderSvg.data(json);
    g.border.data(json);
}
g.iconsThreejs.ready = function(err, json) {
    json.features.forEach(function(d) {
        d.geometry.value = d.properties.mag;
    });
    g.iconsThreejs.data(json);
    g.barThreejs.data(json);
};
g.flight.ready = function(err, csv) {
    g.flight.data(csv,['#aaffff','#88ff11'],[30,200],100,1);
}
g.border.ready = function(err, json) {
    g.canvas.data(json);
    g.border.data(json);
    g.clickCanvas.data(json);
}
g.equake.ready = function(err, json) {
    const arr    = json.features;
    const range  = d3.range.apply(d3, [1,8]);
    const minMax = d3.extent(arr.map(d => d.properties.mag));
    const vScale = d3.scaleLinear().domain(minMax).range([0.5, 2]);
    const scale  = d3.scaleLinear().domain(minMax).rangeRound([1,8]);
    const color  = d3.scaleThreshold().domain(range).range(d3.schemeReds[9]);

    arr.forEach(d => {
        const {mag}  = d.properties;
        d.geometry.value  = mag;
        d.geometry.radius = vScale(mag);
        d.geometry.color  = color(scale(mag));
    });
    g.equake.data(json);
};

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
    g.ocean1.add();

    g.graticule.sphere().scale.set(0.98,0.98,0.98);
    g.ocean1.sphere().scale.set(0.97,0.97,0.97);
    g.ocean2.sphere().scale.set(0.97,0.97,0.97);

    data = g.world3d.data();
    keys = Object.keys(data);
});
