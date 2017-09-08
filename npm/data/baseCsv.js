export default function (csvUrl) {
    /*eslint no-console: 0 */
    var _ = {data: null};

    return {
        name: 'baseCsv',
        urls: csvUrl && [csvUrl],
        onReady: function onReady(err, csv) {
            _.me.data(csv);
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(data$1) {
            if (data$1) {
                _.data = data$1;
            } else {
                return _.data;
            }
        },
        message: function message(fn) {
            _.data = _.data.map(fn);
        },
        allData: function allData(all) {
            if (all) {
                _.data = all.data;
            } else {
                var data = _.data;
                return {data: data};
            }
        },
    }
}
