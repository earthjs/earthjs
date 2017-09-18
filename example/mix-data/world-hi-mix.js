/* eslint no-undef:0 */
/* eslint no-console:0 */
// cid = country_nm_to_id.json
// iso = country_iso3166.json
g=cnew.objects.countries.geometries;
g.forEach(x=> x.name=x.properties.name);
g.forEach(x=> x.cid = cid[x.name.toUpperCase()]);
g.forEach(x=> x.name = iso[x.cid]);
g.forEach(x=> delete x.properties);

// cid=world-110m-country-names.json
// g.forEach(x=> x.cid = cid[x.name.toUpperCase()]);
g.forEach(x=> {
    var f = cid.find(y=> y.id===x.id);
    x.cid = f ? f.cid : undefined;
})


cnew.objects.land = {"type":"MultiPolygon","arcs":[]};
cnew.objects.ne_110m_lakes = {"type":"FeatureCollection","features":[]};

g.forEach(x=> {
    x.properties = {cid:x.cid, name:x.name};
    delete x.cid;
    delete x.name;
});
$('body').innerText = JSON.stringify(cnew);

g.forEach(x=> {
    // console.log(!cid[x.id] ? x : '.')
    x.properties.cid3 = cid[x.id] && cid[x.id].cid3;
});



cnew.objects.countries.geometries.forEach(x=> {
    var f = cid.find(y=> y.id===x.id);
    if (!f) console.log(x.properties)
})

cnew.objects.countries.geometries.forEach(x=> {
  var w = cid.filter(y=>y.cid===x.cid)[0];
  if (w) {
      x.name = w.name
  }
})
