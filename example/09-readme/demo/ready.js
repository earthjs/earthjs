/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
g.iconsThreejs.ready = function(err, json) {
    json.features.forEach(function(d) {
        d.geometry.value = d.properties.mag;
    });
    g.iconsThreejs.data(json);
    g.barThreejs.data(json);
};
g.flightLineThreejs.ready = function(err, csv) {
    g.flightLineThreejs.data(csv,true,[30,200],100,1);
}
g.worldThreejs.ready = function(err, json) {
    g.worldThreejs.data(json);
    g.clickCanvas.data(json);
}

let data,keys,r;
// g.autorotatePlugin.stop();
g.ready(function(){
    g.create();

    g.threejsPlugin.emptyGroup();
    // g.flightLineThreejs.add();
    g.oceanThreejs.add();

    r = g._.proj.scale()-3;
    g.graticuleThreejs.sphere().scale.set(0.97,0.97,0.97);
    g.oceanThreejs.sphere().scale.set(0.97,0.97,0.97);
    g.world3d.sphere().scale.set(r,r,r);

    data = g.world3d.data();
    keys = Object.keys(data);
});
