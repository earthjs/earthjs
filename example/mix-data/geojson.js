g.register(earthjs.plugins.baseCsv('../d/country-ids.csv'))
g.register(earthjs.plugins.world3dThreejs2('...'))

q = g.world3dThreejs.data();
ctr = g.baseCsv.data();

q.features.forEach(x=>{
    b = ctr.filter(y=>y.cid3===x.id)[0];
    if (b) {
       x.properties.cid = b.cid
       x.properties.cid3 = b.cid3
    }
})
