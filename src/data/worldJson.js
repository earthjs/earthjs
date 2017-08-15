export default jsonUrl => {
    /*eslint no-console: 0 */
    const _ = {world: null};

    return {
        name: 'worldJson',
        urls: jsonUrl && [jsonUrl],
        onReady(err, json) {
            this.worldJson.data(json);
        },
        data(data) {
            if (data) {
                _.world = data;
                _.land = topojson.feature(data, data.objects.land);
                _.lakes = topojson.feature(data, data.objects.ne_110m_lakes);
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return  _.world;
            }
        },
    }
}
