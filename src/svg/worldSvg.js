export default worldUrl => {
    /*eslint no-console: 0 */
    const _ = {
        q: null,
        svg:null,
        world: null,
        land:   null,
        lakes:     {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[]},
        countries: {type: 'FeatureCollection', features:[]},
    };
    const $ = {};

    function create() {
        const __ = this._;
        _.svg.selectAll(`.${_.me.name}`).remove();
        if (__.options.showLand) {
            $.g = _.svg.append('g').attr('class', _.me.name);
            if (_.world) {
                if (__.options.transparent || __.options.transparentLand) {
                    _.svgAddWorldBg.call(this);
                }
                if (__.options.showCountries || _.me.showCountries) {
                    _.svgAddCountries.call(this);
                } else {
                    _.svgAddWorld.call(this);
                }
                if (!__.drag && __.options.showLakes) {
                    _.svgAddLakes.call(this);
                }
            }
            refresh.call(this);
        }
    }

    function refresh() {
        const __ = this._;
        if (_.world) {
            if (__.options.transparent || __.options.transparentLand) {
                if (!$.worldBg) {
                    svgAddWorldBg();
                }
                __.proj.clipAngle(180);
                $.worldBg.attr('d', __.path);
                __.proj.clipAngle(90);
            } else if ($.worldBg) {
                $.worldBg.remove();
                $.worldBg = null;
            }
            if (__.options.showLand) {
                if (__.options.showCountries) {
                    if (!$.countries) {
                        $.world.remove();
                        $.world = null;
                        svgAddCountries();
                    }
                    $.countries.attr('d', __.path);
                } else {
                    if (!$.world) {
                        $.countries.remove();
                        $.countries = null;
                        svgAddWorld();
                    }
                    $.world.attr('d', __.path);
                }
                if (__.options.showLakes) {
                    $.lakes.attr('d', __.path);
                }
            }
        }
    }

    function svgAddWorldBg() {
        $.worldBg = $.g.append('g').attr('class','landbg').append('path').datum(_.land)
        .attr('fill', 'rgba(119,119,119,0.2)');
    }

    function svgAddWorld() {
        $.world = $.g.append('g').attr('class','land').append('path').datum(_.land);
    }

    function svgAddCountries() {
        $.countries = $.g.append('g').attr('class','countries')
            .selectAll('path').data(_.countries.features).enter().append('path')
            .attr('class',function(d) {return `cid-${d.properties.cid}`})
            .attr('id',function(d) {return 'x'+d.id});
    }

    function svgAddLakes() {
        $.lakes = $.g.append('g').attr('class','lakes').append('path').datum(_.lakes);
    }

    return {
        name: 'worldSvg',
        urls: worldUrl && [worldUrl],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            const __ = this._;
            const options = __.options;
            options.showLand = true;
            options.showLakes = true;
            options.showCountries = true;
            options.transparentLand = false;
            _.svgAddCountries = svgAddCountries;
            _.svgAddWorldBg = svgAddWorldBg;
            _.svgAddLakes = svgAddLakes;
            _.svgAddWorld = svgAddWorld;
            _.svg = __.svg;
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
        countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
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
        $world()     {return $.world;},
        $lakes()     {return $.lakes;},
        $countries() {return $.countries;},
    };
}
