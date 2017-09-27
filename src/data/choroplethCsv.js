export default (csvUrl, scheme='schemeReds') => {
    /*eslint no-console: 0 */
    const _ = {
        cid: null,
        data: null,
        color: null,
        selectedColorId: null,
        selectedCountryId: null,
        countries: {type: 'FeatureCollection', features:[]},
    };

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
        colorize(key, schemeKey=scheme, opacity) {
            let value, colorList = d3[schemeKey][9];
            if (arguments.length>1) {

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
                    if (opacity===undefined) {
                        obj.color = _.color(id);
                    } else {
                        const color = d3.color(_.color(id));
                        color.opacity = opacity;
                        obj.color = color+'';
                    }
                    obj.colorId = id-1;
                    _.colorValues[obj.colorId].totalValue += vl;
                })
            }
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
            if (fl===undefined && _.selectedColorId!==null) {
                fl = _.selectedColorId;
            }
            const texts = _.data.map(x=> {
                if (fl===undefined || fl===x.colorId || fl===x.cid) {
                    hiden = `opacity:1;fill:${x.color};stroke:black`;
                } else {
                    hiden = '';
                }
                return `.countries path.cid-${x.cid} {${hiden};}`;
            });
            if (target) {
                _.targetCss = target;
            }
            d3.select(_.targetCss).text(texts.join("\n"));
        },
        setColorcountries(colorId, selector='body', format='.1f') {
            let data = _.me.countries();
            const f = d3.format(format);
            d3.select(`${selector} .color-countries`).remove();
            const colorCountries = d3.select(selector).append('div').attr('class','color-countries');
            colorCountries.append('div').attr('class','color-countries-title');
            const colorList = data.filter(x => {
                const {value} = x.properties;
                const vscale = _.scale(value);
                return vscale-1===colorId;
            });
            colorList.sort((a,b)=> b.properties.value-a.properties.value);
            colorCountries
                .selectAll('div.color-countries-item').data(colorList).enter()
                .append('div')
                    .attr('data-cid', d => d.properties.cid)
                    .attr('class', d => {
                        const selected = (d.properties.cid===_.cid ? 'selected' : '');
                        return `color-countries-item cid-${d.properties.cid} ${selected}`;
                    })
                    .html(d => {
                        const {cid, name, value} = d.properties;
                        return `${name}: ${f(value)} - ${cid ? cid : '&nbsp;-&nbsp;'}`;
                    });
            colorCountries
                .on('mouseover', function() {
                    _.me.setCss(_.targetCss, d3.event.target.dataset.cid);
                })
                .on('mouseout', function() {
                    _.me.setCss(_.targetCss);
                })
        },
        setColorRange(selector='body', format='.1f') {
            let data = _.me.colorize();
            const f = d3.format(format);
            data.sort((a,b)=> b.value-a.value);
            d3.select(`${selector} .color-range`).remove();
            const colorRange = d3.select(selector).append('div').attr('class','color-range');
            colorRange.append('div').attr('class','color-range-title');
            const colorList = data.filter(x => x.totalValue!==0);
            _.colorItems = colorRange
                .selectAll('div.color-range-item').data(colorList).enter()
                .append('div').attr('class', d => `color-range-item s-${d.id}`)
                    .style('background', d => d.color)
                    .text(d => f(d.totalValue));
            _.colorItems
                .on('click', function(data) {
                    _.me.setSelectedColor(data.id)
                })
                .on('mouseover', function(data) {
                    _.me.setCss(_.targetCss, data.id);
                    _.me.setColorcountries(data.id);
                })
                .on('mouseout', function() {
                    _.me.setCss(_.targetCss);
                    if (_.selectedColorId===null) {
                        _.me.setColorcountries(-2);
                    } else {
                        _.me.setColorcountries(_.selectedColorId);
                    }
                })
        },
        setSelectedColor(colorId) {
            _.colorItems.classed('selected', false);
            if (_.selectedColorId!==colorId) {
                _.colorItems.filter(`.s-${colorId}`).classed('selected', true);
            } else {
                colorId = null;
            }
            _.selectedColorId = colorId;
            _.me.setColorcountries(colorId);
            _.me.setCss(_.targetCss);
        },
        countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
        cid(id) {
            _.cid = id;
        },
    }
}
