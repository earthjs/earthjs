export default function (worldUrl, flexbox) {
    if ( flexbox === void 0 ) flexbox='.ej-flexbox';

    /*eslint no-console: 0 */
    var _ = {
        q: null,
        svg:null,
        world: null,
        land:   null,
        onCountry: {},
        onCountryVals: [],
        selectedCountry: null,
        lakes:     {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[]},
        countries: {type: 'FeatureCollection', features:[]},
    };
    var $ = {};
    _.mapTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

    function init() {
        _.svg = this._.svg;
        var ref = this._.options;
        var width = ref.width;
        var height = ref.height;
        var scale = width/6.279;
        _.zoom = d3.zoom().on('zoom', function () { return $.g.attr('transform', d3.event.transform); });
        _.proj = d3.geoEquirectangular().scale(scale).translate([width/2, height/2]);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
        _.svg.call(_.zoom);
    }

    function show(data, tooltip) {
        var props = data.properties;
        var title = Object.keys(props).map(function (k) { return k+': '+props[k]; }).join('<br/>');
        return tooltip.html(title)
    }

    function create() {
        var _this = this;
        var klas = _.me.name;
        _.flexBox = d3.selectAll(flexbox);
        _.svg.selectAll((".countries." + klas)).remove();
        if (this._.options.showMap) {
            $.g = _.svg.append('g').attr('class',("countries " + klas));
            $.countries = $.g.selectAll('path')
                .data(_.countries.features).enter().append('path')
                .attr('class', function (d) { return ("cid-" + (d.properties.cid)); })
                .attr('id', function (d) { return ("x" + (d.id)); });

            $.countries
            .on('click', function(d) {
                var this$1 = this;

                var cid = d.properties.cid;
                $.countries.classed('selected', false);
                if (_this.choroplethCsv) {
                    var oscale = -1;
                    var v = _this.choroplethCsv.colorScale();
                    var vscale = v.scale(d.properties.value);
                    if (_.selectedCountry) {
                        oscale = v.scale(_.selectedCountry.properties.value);
                    }
                    if (oscale!==vscale || _.selectedCountry===d) {
                        _this.choroplethCsv.setSelectedColor(vscale-1);
                    }
                    _this.choroplethCsv.cid(cid);
                    d3.selectAll(".color-countries-item").classed('selected', false);
                    d3.selectAll((".color-countries-item.cid-" + cid)).classed('selected', true);
                }
                if (_.selectedCountry!==d) {
                    _.selectedCountry = d;
                    $.countries.filter(("#x" + (d.id))).classed('selected', true);
                } else {
                    _.selectedCountry = null;
                }
                _.onCountryVals.forEach(function (v) {
                    v.call(this$1, d3.event, d);
                });
            })
            .on('mouseover', function(data) {
                var ref = d3.event;
                var pageX = ref.pageX;
                var pageY = ref.pageY;
                (_.me.show || show)(data, _.mapTooltip)
                    .style('display', 'block')
                    .style('left', (pageX + 7) + 'px')
                    .style('top', (pageY - 15) + 'px');
                _.flexBox.style('display', 'flex');
            })
            .on('mouseout', function(data) {
                if (_.me.hide) {
                    _.me.hide(data, _.mapTooltip);
                }
                _.mapTooltip.style('display', 'none');
                if (_.selectedCountry===null) {
                    _.flexBox.style('display', 'none');
                }
            })
            .on('mousemove', function() {
                var ref = d3.event;
                var pageX = ref.pageX;
                var pageY = ref.pageY;
                _.mapTooltip
                    .style('left', (pageX + 7) + 'px')
                    .style('top', (pageY - 15) + 'px')
            });
            refresh.call(this);
        }
    }

    function refresh() {
        var __ = this._;
        if (__.options.showMap) {
            $.countries.attr('d', _.path);
        }
    }

    return {
        name: 'mapSvg',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            var __ = this._;
            var options = __.options;
            options.showMap = true;
            init.call(this);
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        onCountry: function onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryVals = Object.keys(_.onCountry).map(function (k) { return _.onCountry[k]; });
        },
        selectedCountry: function selectedCountry() {
            return _.selectedCountry;
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.land = topojson.feature(data$1, data$1.objects.land);
                _.countries.features = topojson.feature(data$1, data$1.objects.countries).features;
                if (data$1.objects.ne_110m_lakes)
                    { _.lakes.features = topojson.feature(data$1, data$1.objects.ne_110m_lakes).features; }
            } else {
                return  _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world     = all.world;
                _.land      = all.land;
                _.lakes     = all.lakes;
                _.countries = all.countries;
            } else {
                var world = _.world;
                var land = _.land;
                var lakes = _.lakes;
                var countries = _.countries;
                return {world: world, land: land, lakes: lakes, countries: countries};
            }
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        resetZoom: function resetZoom() {
            _.svg.call(_.zoom.transform, d3.zoomIdentity);
        }
    }
}
