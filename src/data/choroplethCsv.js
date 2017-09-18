export default csvUrl => {
    /*eslint no-console: 0 */
    const _ = {data: null, color: null};

    return {
        name: 'choroplethCsv',
        urls: csvUrl && [csvUrl],
        onReady(err, csv) {
            _.me.data(csv)
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
        mergeData(json, arr) {
            const cn = _.data;
            const id = arr[0].split(':');
            const vl = arr[1].split(':');
            json.features.forEach(function(obj) {
                const o = cn.find(x=> ''+obj[id[0]]===x[id[1]] );
                if (o) {
                    obj[vl[0]] = o[vl[1]];
                }
            })
        },
        // https://github.com/d3/d3-scale-chromatic
        colorize(key, scheme='schemeReds') {
            let arr = _.data.map(x=>+x[key]);
            arr = [...new Set(arr)];
            _.min = d3.min(arr);
            _.max = d3.max(arr);
            const c = d3[scheme] || d3.schemeReds;
            const x = d3.scaleLinear().domain([1, 10]).rangeRound([_.min, _.max]);
            const color = d3.scaleThreshold().domain(d3.range(2, 10)).range(c[9]);
            _.data.forEach(function(obj) {
                obj.color = color(x(+obj[key]));
            })
        },
        setCss(target) {
            const colors = _.data.map(x=> {
                return `.countries path.cid-${x.cid} {fill: ${x.color};} `
            });
            d3.select(target).text(colors.join("\n"));
        }
    }
}
