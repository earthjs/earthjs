export default function(urlWorld, urlCountryNames) {
    /*eslint no-console: 0 */
    const _ = {svg:null, q: null, world: null, countryNames: null};
    const $ = {};

    function svgAddWorldOrCountries() {
        const __ = this._;
        _.svg.selectAll('.landbg,.land,.lakes,.countries').remove();
        if (__.options.showLand) {
            if (_.world) {
                if (__.options.transparent || __.options.transparentWorld) {
                    _.svgAddWorldBg.call(this);
                }
                if (__.options.showCountries) {
                    _.svgAddCountries.call(this);
                } else {
                    _.svgAddWorld.call(this);
                }
                if (__.options.showLakes) {
                    _.svgAddLakes.call(this);
                }
            }
            refresh.call(this);
        }
    }

    function refresh() {
        const __ = this._;
        if (_.world && __.options.showLand) {
            if (__.options.transparent || __.options.transparentWorld) {
                __.proj.clipAngle(180);
                $.worldBg.attr("d", __.path);
                __.proj.clipAngle(90);
            }
            if (__.options.showCountries) {
                $.countries.attr("d", __.path);
            } else {
                $.world.attr("d", __.path);
            }
            if (__.options.showLakes) {
                $.lakes.attr("d", __.path);
            }
        }
    }

    function svgAddWorldBg() {
        $.worldBg = _.svg.append("g").attr("class","landbg").append("path").datum(_.land)
        .attr('fill', 'rgba(119,119,119,0.2)');
    }

    function svgAddWorld() {
        $.world = _.svg.append("g").attr("class","land").append("path").datum(_.land);
    }

    function svgAddCountries() {
        $.countries = _.svg.append("g").attr("class","countries").selectAll("path")
            .data(_.countries.features).enter().append("path")
            .attr("id",function(d) {return 'x'+d.id});
    }

    function svgAddLakes() {
        $.lakes = _.svg.append("g").attr("class","lakes").append("path").datum(_.lakes);
    }

    let urls = null;
    if (urlWorld) {
        urls = [urlWorld];
        if (urlCountryNames) {
            urls.push(urlCountryNames);
        }
    }
    return {
        name: 'worldPlugin',
        urls: urls,
        onReady(err, world, countryNames) {
            this.worldPlugin.data({world, countryNames});
        },
        onInit() {
            const __ = this._;
            const options = __.options;
            options.showLand = true;
            options.showLakes = true;
            options.showCountries = true;
            options.transparentWorld = false;
            this.$fn.svgAddWorldOrCountries = svgAddWorldOrCountries;
            _.svgAddCountries = svgAddCountries;
            _.svgAddWorldBg = svgAddWorldBg;
            _.svgAddLakes = svgAddLakes;
            _.svgAddWorld = svgAddWorld;
            _.svg = __.svg;
        },
        onRefresh() {
            refresh.call(this);
        },
        countries() {
            return _.countries.features;
        },
        data(data) {
            if (data) {
                _.world = data.world;
                _.countryNames = data.countryNames;
                _.land = topojson.feature(_.world, _.world.objects.land);
                _.lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);
                _.countries = topojson.feature(_.world, _.world.objects.countries);
            }
            return {
                world: _.world ,
                countryNames: _.countryNames
            }
        },
        countryName(d) {
            let cname = '';
            if (_.countryNames) {
                cname = _.countryNames.find(function(x) {
                    return x.id==d.id;
                });
            }
            return cname;
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $countries() {
            return $.countries;
        }
    };
}
