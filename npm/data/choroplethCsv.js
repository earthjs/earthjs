export default function (csvUrl) {
    /*eslint no-console: 0 */
    var _ = {choropleth: null, color: null};

    return {
        name: 'choroplethCsv',
        urls: csvUrl && [csvUrl],
        onReady: function onReady(err, csv) {
            _.me.data(csv)
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(data$1) {
            if (data$1) {
                _.choropleth = data$1;
            } else {
                return _.choropleth;
            }
        },
        mergeData: function mergeData(json, arr) {
            var cn = _.choropleth;
            var id = arr[0].split(':');
            var vl = arr[1].split(':');
            json.features.forEach(function(obj) {
                var o = cn.find(function (x){ return ''+obj[id[0]]===x[id[1]]; } );
                if (o) {
                    obj[vl[0]] = o[vl[1]];
                }
            })
        },
        // https://github.com/d3/d3-scale-chromatic
        colorize: function colorize(key, scheme) {
            if ( scheme === void 0 ) scheme='schemeReds';

            var arr = _.choropleth.map(function (x){ return +x[key]; });
            arr = [].concat( new Set(arr) );
            _.min = d3.min(arr);
            _.max = d3.max(arr);
            var c = d3[scheme] || d3.schemeReds;
            var x = d3.scaleLinear().domain([1, 10]).rangeRound([_.min, _.max]);
            var color = d3.scaleThreshold().domain(d3.range(2, 10)).range(c[9]);
            _.choropleth.forEach(function(obj) {
                obj.color = color(x(+obj[key]));
            })
        }
    }
}
