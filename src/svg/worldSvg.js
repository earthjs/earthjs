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
        const klas = _.me.name;
        _.svg.selectAll(`.world.${klas}`).remove();
        if (__.options.showLand) {
            $.g = _.svg.append('g').attr('class', `world ${klas}`);
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
                if (!$.worldBgPath) {
                    svgAddWorldBg();
                }
                __.proj.clipAngle(180);
                $.worldBgPath.attr('d', __.path);
                __.proj.clipAngle(90);
            } else if ($.worldBgPath) {
                $.worldBgG.remove();
                $.worldBgPath = null;
            }
            if (__.options.showLand) {
                if (__.options.showCountries) {
                    if (!$.countriesPath) {
                        $.worldG.remove();
                        $.worldPath = null;
                        svgAddCountries();
                    }
                    $.countriesPath.attr('d', __.path);
                } else {
                    if (!$.worldPath) {
                        $.countriesG.remove();
                        $.countriesPath = null;
                        svgAddWorld();
                    }
                    $.worldPath.attr('d', __.path);
                }
                if (__.options.showLakes) {
                    $.lakesPath.attr('d', __.path);
                }
            }
        }
    }

    function svgAddWorldBg() {
        $.worldBgG = $.g.append('g').attr('class','landbg');
        $.worldBgPath = $.worldBgG.append('path').datum(_.land)
            .attr('fill', 'rgba(119,119,119,0.2)');
    }

    function svgAddWorld() {
        $.worldG = $.g.append('g').attr('class','land');
        $.worldPath = $.worldG.append('path').datum(_.land);
    }

    function svgAddCountries() {
        $.countriesG = $.g.append('g').attr('class','countries');
        $.countriesPath = $.countriesG
            .selectAll('path').data(_.countries.features).enter().append('path')
            .attr('class',function(d) {return `cid-${d.properties.cid}`})
            .attr('id',function(d) {return 'x'+d.id});
    }

    function svgAddLakes() {
        $.lakesG = $.g.append('g').attr('class','lakes').append('path').datum(_.lakes);
        $.lakesPath = $.lakesG.append('path').datum(_.lakes);
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
                _.countries.features = topojson.feature(data, data.objects.countries).features;
                if (data.objects.ne_110m_lakes)
                    _.lakes.features = topojson.feature(data, data.objects.ne_110m_lakes).features;
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
        $world()     {return $.worldPath;},
        $lakes()     {return $.lakesPath;},
        $countries() {return $.countriesPath;},
    };
}
