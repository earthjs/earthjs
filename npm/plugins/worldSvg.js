export default function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = {svg:null, q: null, world: null};
    var $ = {};

    function create() {
        var __ = this._;
        _.svg.selectAll('.landbg,.land,.lakes,.countries').remove();
        if (__.options.showLand) {
            if (_.world) {
                if (__.options.transparent || __.options.transparentLand) {
                    _.svgAddWorldBg.call(this);
                }
                if (!__.drag && __.options.showCountries) {
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
        if (_.world && __.options.showLand) {
            if (__.options.transparent || __.options.transparentLand) {
                __.proj.clipAngle(180);
                $.worldBg.attr('d', __.path);
                __.proj.clipAngle(90);
            }
            if (__.options.showCountries) {
                $.countries.attr('d', __.path);
            } else {
                $.world.attr('d', __.path);
            }
            if (__.options.showLakes) {
                $.lakes.attr('d', __.path);
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
            this.worldSvg.data(data);
        },
        onInit: function onInit() {
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
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        countries: function countries() {
            return _.countries.features;
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.land = topojson.feature(data$1, data$1.objects.land);
                _.lakes = topojson.feature(data$1, data$1.objects.ne_110m_lakes);
                _.countries = topojson.feature(data$1, data$1.objects.countries);
            } else {
                return  _.world;
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
