export default (csvUrl, scheme='schemeReds') => {
    /*eslint no-console: 0 */
    const _ = {data: null, color: null};
    window._ = _;

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
            let value, colorList = d3[schemeKey][9];
            if (arguments.length===2) {

                let arr = _.data.map(x=>+x[key]);
                arr = [...new Set(arr)];
                const r = [1,8];
                _.scheme= schemeKey;
                _.minMax= d3.extent(arr);
                _.range = d3.range.apply(d3, r);  //_.scale(2990000) - 2
                _.scale = d3.scaleLinear().domain(_.minMax).rangeRound(r);
                _.color = d3.scaleThreshold().domain(_.range).range(colorList);
                _.colorValues = colorList.map((color,id) => {
                    value = Math.floor(_.scale.invert(id+1.45));
                    return {id, color, value, totalValue: 0};
                });
                _.data.forEach(function(obj) {
                    const vl = +obj[key];
                    const id = _.scale(vl);
                    obj.color = _.color(id);
                    obj.colorId = id-1;
                    // console.log('obj: ', obj);
                    _.colorValues[obj.colorId].totalValue += vl;
                })
            }
            // console.log('_.colorValues: ', _.colorValues);
            return _.colorValues;
        },
        colorScale(value) {
            let result;
            if (value!==undefined) {
                result = _.color(_.scale(+value));
            } else {
                result = {color: _.color, scale: _.scale, minMax: _.minMax};
            }
            return result;
        },
        setCss(target, fl) {
            let hiden;
            const texts = _.data.map(x=> {
                if (fl!==undefined && fl!==x.colorId) {
                    hiden = ''; } else {
                    hiden = `opacity:1;fill:${x.color};stroke:black`;
                }
                return `.countries path.cid-${x.cid} {${hiden};}`;
            });
            if (target) {
                _.targetCss = target;
            }
            d3.select(_.targetCss).text(texts.join("\n"));
        },
        setColorRange(selector='body', format='.1f') {
            let data = _.me.colorize();
            data.sort((a,b)=> b.value-a.value);
            const f = d3.format(format);
            const colorRange = d3.select('body')
                .append('div').attr('class','color-range');
            colorRange
                .append('div').attr('class','color-range-title');
            const colorList = data.filter(x => {
                // console.log('xxx',x, x.totalValue!==0);
                return x.totalValue!==0;
            });
            const colorItems = colorRange
                .selectAll('div.color-range-item').data(colorList).enter()
                .append('div').attr('class', d => `color-range-item s-${d.id}`)
                    .style('background', d => d.color)
                    .text(d => {
                        // console.log(d.value, f(d.totalValue));
                        return f(d.totalValue);
                    });
            colorItems
                .on('mouseover', function(data) {
                    _.me.setCss(_.targetCss, data.id);
                    // console.log('over',data);
                })
                .on('mouseout', function() {
                    _.me.setCss(_.targetCss);
                    // console.log('out',data);
                })
        }
    }
}
