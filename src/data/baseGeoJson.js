export default jsonUrl => {
    /*eslint no-console: 0 */
    const _ = {data: null};

    return {
        name: 'baseGeoJson',
        urls: jsonUrl && [jsonUrl],
        onReady(err, json) {
            _.me.data(json);
        },
        onInit(me) {
            _.me = me;
        },
        data(data) {
            if (data) {
                _.data = data;
            } else {
                return _.data;
            }
        },
        message(fn) {
            _.data = _.data.map(fn);
        },
        allData(all) {
            if (all) {
                _.data = all.data;
            } else {
                const  {data} = _;
                return {data};
            }
        },
    }
}
