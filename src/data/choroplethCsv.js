export default csvUrl => {
    /*eslint no-console: 0 */
    const _ = {choropleth: null};

    return {
        name: 'choroplethCsv',
        urls: csvUrl && [csvUrl],
        onReady(err, csv) {
            this.choroplethCsv.data(csv)
        },
        data(data) {
            if (data) {
                _.choropleth = data;
            } else {
                return _.choropleth;
            }
        },
        mergeData(json, arr) {
            const cn = _.choropleth;
            const id = arr[0].split(':');
            const vl = arr[1].split(':');
            json.objects.countries.geometries.forEach(function(obj) {
                const o = cn.find(x=> ''+obj[id[0]]===x[id[1]] );
                if (o) {
                    obj[vl[0]] = o[vl[1]];
                }
            })
        }
    }
}
