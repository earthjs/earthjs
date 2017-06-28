// https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json
// https://raw.githubusercontent.com/mahemoff/geodata/master/cities.geojson
// ct.features.find(x=>x.properties.city==='Jakarta')
var cities = {
	"type": "FeatureCollection",
	"features": [{
		"geometry": {"type": "Point","coordinates": [-176.633, 51.883]},
		"properties": {"wikipedia": "Adak,_Alaska","city": "Adak"},
        "type": "Feature",
		"id": "Adak"
	}]
}
var ct = {};
var cc = [];
var features = [];
cc.forEach((d)=>{
    var cty = ct.features.find(x=>x.properties.city===d.capital);
    var dd = ({
      geometry: (cty ? cty.geometry : {
          type: 'Point',
          coordinates: d.latlng
      }),
      "type": "Feature",
      "properties": {
          tld: d.tld,
          area: d.area,
          region: d.region,
          name:d.name.common + (cty ? '' : ' **'),
          capital: d.capital,
          currency: d.currency,
          languages: d.languages,
          callingCode: d.callingCode,
      }
    })
    if (cty) {
        features.push(dd);
    }
});
var topo = {type: 'FeatureCollection', features}
console.log(JSON.stringify(topo,null))

// subregion: d.subregion,
// console.log(d.name.common +': '+ d.capital)

// geometry: (cty ? cty.geometry : {
//     type: 'Point',
//     coordinates: d.latlng
// }),

// https://raw.githubusercontent.com/annexare/Countries/master/countries.json
