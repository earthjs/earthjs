export default function() {
    /*eslint no-console: 0 */
    const _ = {data: []};
    const args = arguments;

    return {
        name: 'baseCsv',
        urls: Array.prototype.slice.call(args),
        onReady(err, csv) {
            _.me.data(csv);
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
        arrToJson(k, v) {
            const json = {};
            _.data.forEach(x => json[x[k]] = x[v]);
            return json;
        }
    }
}
