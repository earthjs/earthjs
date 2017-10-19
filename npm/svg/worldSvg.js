export default function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = {
        q: null,
        svg:null,
        world: null,
        land:   null,
        lakes:     {type: 'FeatureCollection', features:[]},
        selected:  {type: 'FeatureCollection', features:[]},
        countries: {type: 'FeatureCollection', features:[]},
    };
    var $ = {};

    function create() {
        var __ = this._;
        var klas = _.me.name;
        _.svg.selectAll((".world." + klas)).remove();
        if (__.options.showLand) {
            $.g = _.svg.append('g').attr('class', ("world " + klas));
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
        var __ = this._;
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
            .attr('class',function(d) {return ("cid-" + (d.properties.cid))})
            .attr('id',function(d) {return 'x'+d.id});
    }

    function svgAddLakes() {
        $.lakesG = $.g.append('g').attr('class','lakes').append('path').datum(_.lakes);
        $.lakesPath = $.lakesG.append('path').datum(_.lakes);
    }

    return {
        name: 'worldSvg',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            var __ = this._;
            var options = __.options;
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
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        countries: function countries(arr) {
            if (arr) {
                _.countries.features = arr;
            } else {
                return _.countries.features;
            }
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
        $world: function $world()     {return $.worldPath;},
        $lakes: function $lakes()     {return $.lakesPath;},
        $countries: function $countries() {return $.countriesPath;},
    };
}
