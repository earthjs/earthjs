export default function (csvUrl) {
    /*eslint no-console: 0 */
    var _ = {countryNames: null};

    return {
        name: 'countryNamesCsv',
        urls: csvUrl && [csvUrl],
        onReady: function onReady(err, csv) {
            _.me.data(csv)
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(data$1) {
            if (data$1) {
                _.countryNames = data$1;
            } else {
                return _.countryNames;
            }
        },
        mergeData: function mergeData(json, arr) {
            var cn = _.countryNames;
            var id = arr[0].split(':');
            var vl = arr[1].split(':');
            json.features.forEach(function(obj) {
                var o = cn.find(function (x){ return ''+obj[id[0]]===x[id[1]]; } );
                if (o) {
                    obj[vl[0]] = o[vl[1]];
                }
            })
        }
    }
}
