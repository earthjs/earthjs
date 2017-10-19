export default function (jsonUrl) {
    /*eslint no-console: 0 */
    var _ = {
        world:  null,
        land:   null,
        lakes:     {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[]},
        countries: {type: 'FeatureCollection', features:[]},
    };

    return {
        name: 'worldJson',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, json) {
            _.me.data(json);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.land  = topojson.feature(data$1, data$1.objects.land);
                _.countries.features = topojson.feature(data$1, data$1.objects.countries).features;
                if (data$1.objects.ne_110m_lakes)
                    { _.lakes.features = topojson.feature(data$1, data$1.objects.ne_110m_lakes).features; }
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world     = all.world;
                _.land      = all.land;
                _.lakes     = all.lakes;
                _.countries = all.countries;
            } else {
                var world = _.world;
                var land = _.land;
                var lakes = _.lakes;
                var countries = _.countries;
                return {world: world, land: land, lakes: lakes, countries: countries};
            }
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
    }
}
