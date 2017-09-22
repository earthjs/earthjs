export default worldUrl => {
    /*eslint no-console: 0 */
    const _ = {
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
    const $ = {};
    const mapTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

    function init() {
        _.svg = this._.svg;
        const {width, height} = this._.options;
        const scale = width/6.279;
        _.zoom = d3.zoom().on('zoom', () => $.g.attr('transform', d3.event.transform));
        _.proj = d3.geoEquirectangular().scale(scale).translate([width/2, height/2]);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
        _.svg.call(_.zoom);
    }

    function show(data, tooltip) {
        const props = data.properties;
        const title = Object.keys(props).map(k => k+': '+props[k]).join('<br/>');
        return tooltip.html(title)
    }

    function create() {
        const _this = this;
        _.svg.selectAll('.countries').remove();
        if (this._.options.showMap) {
            $.g = _.svg.append('g').attr('class','countries');
            $.countries = $.g.selectAll('path')
                .data(_.countries.features).enter().append('path')
                .attr('class', d => `cid-${d.properties.cid}`)
                .attr('id', d => `x${d.id}`);

            $.countries
            .on('click', function(d) {
                if (_this.choroplethCsv) {
                    let oscale = -1;
                    const v = _this.choroplethCsv.colorScale();
                    const vscale = v.scale(d.properties.value);
                    if (_.selectedCountry) {
                        oscale = v.scale(_.selectedCountry.properties.value);
                    }
                    if (oscale!==vscale || _.selectedCountry===d) {
                        _this.choroplethCsv.setSelectedColor(vscale-1);
                    }
                }
                $.countries.classed('selected', false);
                if (_.selectedCountry!==d) {
                    _.selectedCountry = d;
                    $.countries.filter(`#x${d.id}`).classed('selected', true);
                } else {
                    _.selectedCountry = null;
                }
                _.onCountryVals.forEach(v => {
                    v.call(this, d3.event, d);
                });
            })
            .on('mouseover', function(data) {
                const {pageX, pageY} = d3.event;
                (_.me.show || show)(data, mapTooltip)
                    .style('display', 'block')
                    .style('left', (pageX + 7) + 'px')
                    .style('top', (pageY - 15) + 'px')
            })
            .on('mouseout', function() {
                mapTooltip.style('display', 'none')
            })
            .on('mousemove', function() {
                const {pageX, pageY} = d3.event;
                mapTooltip
                    .style('left', (pageX + 7) + 'px')
                    .style('top', (pageY - 15) + 'px')
            });
            refresh.call(this);
        }
    }

    function refresh() {
        const __ = this._;
        if (__.options.showMap) {
            $.countries.attr('d', _.path);
        }
    }

    return {
        name: 'mapSvg',
        urls: worldUrl && [worldUrl],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            const __ = this._;
            const options = __.options;
            options.showMap = true;
            init.call(this);
        },
        onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryVals = Object.keys(_.onCountry).map(k => _.onCountry[k]);
        },
        selectedCountry() {
            return _.selectedCountry;
        },
        data(data) {
            if (data) {
                _.world = data;
                _.land = topojson.feature(data, data.objects.land);
                _.lakes.features = topojson.feature(data, data.objects.ne_110m_lakes).features;
                _.countries.features = topojson.feature(data, data.objects.countries).features;
            } else {
                return  _.world;
            }
        },
        allData(all) {
            if (all) {
                _.world     = all.world;
                _.land      = all.land;
                _.lakes     = all.lakes;
                _.countries = all.countries;
            } else {
                const  {world, land, lakes, countries} = _;
                return {world, land, lakes, countries};
            }
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        resetZoom() {
            _.svg.call(_.zoom.transform, d3.zoomIdentity);
        }
    }
}
