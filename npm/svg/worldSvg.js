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
        _.svg.selectAll('.landbg,.land,.lakes,.countries').remove();
        if (__.options.showLand) {
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
        $.worldBg = _.svg.append('g').attr('class','landbg').append('path').datum(_.land)
        .attr('fill', 'rgba(119,119,119,0.2)');
    }

    function svgAddWorld() {
        $.world = _.svg.append('g').attr('class','land').append('path').datum(_.land);
    }

    function svgAddCountries() {
        $.countries = _.svg.append('g').attr('class','countries').selectAll('path')
            .data(_.countries.features).enter().append('path')
            .attr('id',function(d) {return 'x'+d.id});
    }

    function svgAddLakes() {
        $.lakes = _.svg.append('g').attr('class','lakes').append('path').datum(_.lakes);
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
                _.lakes.features = topojson.feature(data$1, data$1.objects.ne_110m_lakes).features;
                _.countries.features = topojson.feature(data$1, data$1.objects.countries).features;
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
        $world: function $world()     {return $.world;    },
        $lakes: function $lakes()     {return $.lakes;    },
        $countries: function $countries() {return $.countries;},
    };
}
