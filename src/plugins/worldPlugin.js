export default function(urlWorld, urlCountryNames) {
    const _ = {svg:null, q: null, world: null, countryNames: null};
    const $ = {};

    function svgAddWorldOrCountries() {
        _.svg.selectAll('.land,.lakes,.countries').remove();
        if (this._.options.showLand) {
            if (_.world) {
                if (this._.options.showCountries) {
                    _.svgAddCountries.call(this);
                } else {
                    _.svgAddWorld.call(this);
                }
                if (this._.options.showLakes) {
                    _.svgAddLakes.call(this);
                }
            }
            refresh.call(this);
        }
    }

    function refresh() {
        if (_.world && this._.options.showLand) {
            if (this._.options.showCountries) {
                $.countries.attr("d", this._.path);
            } else {
                $.world.attr("d", this._.path);
            }
            if (this._.options.showLakes) {
                $.lakes.attr("d", this._.path);
            }
        }
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
            this._.options.showLand = true;
            this._.options.showLakes = true;
            this._.options.showCountries = true;
            this.$fn.svgAddWorldOrCountries = svgAddWorldOrCountries;
            _.svgAddCountries = svgAddCountries;
            _.svgAddLakes = svgAddLakes;
            _.svgAddWorld = svgAddWorld;
            _.svg = this._.svg;
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
