export default (csvUrl, scheme='schemeReds') => {
    /*eslint no-console: 0 */
    const _ = {data: null, color: null};

    function getPath(path) {
        let v = this;
        path.split('.').forEach(p => v = v[p]);
        return v;
    }

    function updatePath(path, value) {
        let o, k, v = this;
        path.split('.').forEach(p => {
            o = v;
            k = p;
            v = v[p];
        });
        o[k] = value;
        // console.log(o,k,value);
    }

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
                _.data.getPath = getPath;
                _.data.updatePath = updatePath;
            } else {
                return _.data;
            }
        },
        mergeData(json, arr) {
            const cn = _.data;
            const id = arr[0].split(':');
            const vl = arr[1].split(':');
            json.features.forEach(function(obj) {
                const o = cn.find(src=> {
                    return getPath.call(obj, id[0])===
                           getPath.call(src, id[1]);
                });
                if (o) {
                    const v = getPath.call(o, vl[1]);
                    updatePath.call(obj, vl[0], v);
                }
            })
        },
        // https://github.com/d3/d3-scale-chromatic
        colorize(key, schemeKey=scheme) {
            let colorList;
            if (arguments.length===2) {
                colorList = d3[schemeKey][9];
                let arr = _.data.map(x=>+x[key]);
                arr = [...new Set(arr)];
                const r = [1,9];
                _.scheme= schemeKey;
                _.minMax= d3.extent(arr);
                _.range = d3.range.apply(d3, r);
                _.scale = d3.scaleLinear().domain(_.minMax).rangeRound(r);
                _.color = d3.scaleThreshold().domain(_.range).range(colorList);
                _.data.forEach(function(obj) {
                    obj.color = _.color(_.scale(+obj[key]));
                })
            } else {
                colorList = d3[_.scheme][9];
            }
            let value;
            return colorList.map((color,i) => {
                value  = _.scale.invert(i+1);
                return {color, value};
            });
        },
        setCss(target) {
            const colors = _.data.map(x=> {
                return `.countries path.cid-${x.cid} {fill: ${x.color};} `
            });
            d3.select(target).text(colors.join("\n"));
        },
        colorScale(value) {
            let result;
            if (value!==undefined) {
                result = _.color(_.scale(+value));
            } else {
                result = {color: _.color, scale: _.scale, minMax: _.minMax};
            }
            return result;
        }
    }
}
