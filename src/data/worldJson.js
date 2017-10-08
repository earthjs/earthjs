export default jsonUrl => {
    /*eslint no-console: 0 */
    const _ = {
        world:  null,
        land:   null,
        lakes:     {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[]},
        countries: {type: 'FeatureCollection', features:[]},
    };

    return {
        name: 'worldJson',
        urls: jsonUrl && [jsonUrl],
        onReady(err, json) {
            _.me.data(json);
        },
        onInit(me) {
            _.me = me;
        },
        data(data) {
            if (data) {
                _.world = data;
                _.land  = topojson.feature(data, data.objects.land);
                _.countries.features = topojson.feature(data, data.objects.countries).features;
                if (data.objects.ne_110m_lakes)
                    _.lakes.features = topojson.feature(data, data.objects.ne_110m_lakes).features;
            } else {
                return _.world;
            }
        },
        allData(all) {
            if (all) {
                _.world     = all.world;
                _.land      = all.land;
                _.lakes     = all.lakes;
                _.countries = all.countries;
            } else {
                const  {world, land, lakes, countries} = _;
                return {world, land, lakes, countries};
            }
        },
        countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
    }
}
