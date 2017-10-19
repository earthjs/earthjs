export default function (csvUrl, scheme) {
    if ( scheme === void 0 ) scheme='schemeReds';

    /*eslint no-console: 0 */
    var _ = {
        cid: null,
        data: null,
        color: null,
        oldData: null,
        selectedColorId: null,
        selectedCountryId: null,
        countries: {type: 'FeatureCollection', features:[]},
    };

    function getPath(path) {
        var v = this;
        path.split('.').forEach(function (p) { return v = v[p]; });
        return v;
    }

    function updatePath(path, value) {
        var o, k, v = this;
        path.split('.').forEach(function (p) {
            o = v;
            k = p;
            v = v[p];
        });
        o[k] = value;
    }

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
                _.data = data$1;
                _.oldData = data$1;
                _.data.getPath = getPath;
                _.data.updatePath = updatePath;
            } else {
                return _.data;
            }
        },
        filter: function filter(fn) {
            _.data = _.oldData.filter(fn);
        },
        mergeData: function mergeData(json, arr) {
            var cn = _.data;
            var id = arr[0].split(':');
            var vl = arr[1].split(':');
            json.features.forEach(function(obj) {
                var o = cn.find(function (src){
                    return getPath.call(obj, id[0])===
                           getPath.call(src, id[1]);
                });
                if (o) {
                    var v = getPath.call(o, vl[1]);
                    updatePath.call(obj, vl[0], v);
                }
            })
        },
        // https://github.com/d3/d3-scale-chromatic
        colorize: function colorize(key, schemeKey, opacity) {
            if ( schemeKey === void 0 ) schemeKey=scheme;

            var value, colorList = d3[schemeKey][9];
            if (arguments.length>1) {

                var arr = _.data.map(function (x){ return +x[key]; });
                arr = [].concat( new Set(arr) );
                var r = [1,8];
                _.scheme= schemeKey;
                _.minMax= d3.extent(arr);
                _.range = d3.range.apply(d3, r);  //_.scale(2990000) - 2
                _.scale = d3.scaleLinear().domain(_.minMax).rangeRound(r);
                _.color = d3.scaleThreshold().domain(_.range).range(colorList);
                _.colorValues = colorList.map(function (color,id) {
                    value = Math.floor(_.scale.invert(id+1.45));
                    return {id: id, color: color, value: value, totalValue: 0};
                });
                _.data.forEach(function(obj) {
                    var vl = +obj[key];
                    var id = _.scale(vl);
                    if (opacity===undefined) {
                        obj.color = _.color(id);
                    } else {
                        var color = d3.color(_.color(id));
                        color.opacity = opacity;
                        obj.color = color+'';
                    }
                    obj.colorId = id-1;
                    _.colorValues[obj.colorId].totalValue += vl;
                })
            }
            return _.colorValues;
        },
        colorScale: function colorScale(value) {
            var result;
            if (value!==undefined) {
                result = _.color(_.scale(+value));
            } else {
                result = {color: _.color, scale: _.scale, minMax: _.minMax};
            }
            return result;
        },
        setCss: function setCss(target, fl) {
            var hiden;
            if (fl===undefined && _.selectedColorId!==null) {
                fl = _.selectedColorId;
            }
            var texts = _.data.map(function (x){
                if (fl===undefined || fl===x.colorId || fl===x.cid) {
                    hiden = "opacity:1;fill:" + (x.color) + ";stroke:black";
                } else {
                    hiden = '';
                }
                return (".countries path.cid-" + (x.cid) + " {" + hiden + ";}");
            });
            if (target) {
                _.targetCss = target;
            }
            d3.select(_.targetCss).text(texts.join("\n"));
        },
        setColorcountries: function setColorcountries(colorId, selector, format) {
            if ( selector === void 0 ) selector='body';
            if ( format === void 0 ) format='.1f';

            var data = _.me.countries();
            var f = d3.format(format);
            d3.select((selector + " .color-countries")).remove();
            var colorCountries = d3.select(selector).append('div').attr('class','color-countries');
            colorCountries.append('div').attr('class','color-countries-title');
            var colorList = data.filter(function (x) {
                var ref = x.properties;
                var value = ref.value;
                var vscale = _.scale(value);
                return vscale-1===colorId;
            });
            colorList.sort(function (a,b){ return b.properties.value-a.properties.value; });
            colorCountries
                .selectAll('div.color-countries-item').data(colorList).enter()
                .append('div')
                    .attr('data-cid', function (d) { return d.properties.cid; })
                    .attr('class', function (d) {
                        var selected = (d.properties.cid===_.cid ? 'selected' : '');
                        return ("color-countries-item cid-" + (d.properties.cid) + " " + selected);
                    })
                    .html(function (d) {
                        var ref = d.properties;
                        var cid = ref.cid;
                        var name = ref.name;
                        var value = ref.value;
                        return (name + ": " + (f(value)) + " - " + (cid ? cid : '&nbsp;-&nbsp;'));
                    });
            colorCountries
                .on('mouseover', function() {
                    _.me.setCss(_.targetCss, d3.event.target.dataset.cid);
                })
                .on('mouseout', function() {
                    _.me.setCss(_.targetCss);
                })
        },
        setColorRange: function setColorRange(selector, format) {
            if ( selector === void 0 ) selector='body';
            if ( format === void 0 ) format='.1f';

            var data = _.me.colorize();
            var f = d3.format(format);
            data.sort(function (a,b){ return b.value-a.value; });
            d3.select((selector + " .color-range")).remove();
            var colorRange = d3.select(selector).append('div').attr('class','color-range');
            colorRange.append('div').attr('class','color-range-title');
            var colorList = data.filter(function (x) { return x.totalValue!==0; });
            _.colorItems = colorRange
                .selectAll('div.color-range-item').data(colorList).enter()
                .append('div').attr('class', function (d) { return ("color-range-item s-" + (d.id)); })
                    .style('background', function (d) { return d.color; })
                    .text(function (d) { return f(d.totalValue); });
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
        setSelectedColor: function setSelectedColor(colorId) {
            _.colorItems.classed('selected', false);
            if (_.selectedColorId!==colorId) {
                _.colorItems.filter((".s-" + colorId)).classed('selected', true);
            } else {
                colorId = null;
            }
            _.selectedColorId = colorId;
            _.me.setColorcountries(colorId);
            _.me.setCss(_.targetCss);
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
        },
        cid: function cid(id) {
            _.cid = id;
        },
    }
}
