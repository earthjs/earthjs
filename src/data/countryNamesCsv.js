export default csvUrl => {
    /*eslint no-console: 0 */
    const _ = {countryNames: null};

    return {
        name: 'countryNamesCsv',
        urls: csvUrl && [csvUrl],
        onReady(err, csv) {
            this.countryNamesCsv.data(csv)
        },
        data(data) {
            if (data) {
                _.countryNames = data;
            } else {
                return _.countryNames;
            }
        },
        mergeData(json, arr) {
            const cn = _.countryNames;
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
