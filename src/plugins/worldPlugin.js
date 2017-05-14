export default function(urlWorld, urlCountryNames) {
    const _ = {svg:null, q: null, world: null, countryNames: null};
    const countryClick = function() {
        // console.log(d);
    }

    function svgAddWorldOrCountries() {
        _.svg.selectAll('.land,.lakes,.countries').remove();
        if (this._.options.showLand) {
            if (_.world) {
                if (this._.options.showCountries) {
                    this.svgAddCountries.call(this);
                } else {
                    this.svgAddWorld.call(this);
                }
                if (this._.options.showLakes) {
                    this.svgAddLakes.call(this);
                }
            }
            // render to correct position
            refresh.call(this);
        }
    }

    function refresh() {
        if (_.world && this._.options.showLand) {
            if (this._.options.showCountries) {
                this._.countries.attr("d", this._.path);
            } else {
                this._.world.attr("d", this._.path);
            }
            if (this._.options.showLakes) {
                this._.lakes.attr("d", this._.path);
            }
        }
    }

    function svgAddWorld() {
        const land = topojson.feature(_.world, _.world.objects.land);

        this._.world = _.svg.append("g").attr("class","land").append("path")
            .datum(land);
        return this._.world;
    }

    function svgAddCountries() {
        const countries = topojson.feature(_.world, _.world.objects.countries).features;

        this._.countries = _.svg.append("g").attr("class","countries").selectAll("path")
            .data(countries).enter().append("path").on('click', countryClick)
                .attr("id",function(d) {return 'x'+d.id});
        return this._.countries;
    }

    function svgAddLakes() {
        const lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);

        this._.lakes = _.svg.append("g").attr("class","lakes").append("path")
            .datum(lakes);
        return this._.lakes;
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
            _.world = world;
            _.countryNames = countryNames;

        },
        onInit() {
            this._.options.showLand = true;
            this._.options.showLakes = true;
            this._.options.showCountries = true;
            this.svgAddWorldOrCountries = svgAddWorldOrCountries;
            this.svgAddCountries = svgAddCountries;
            this.svgAddLakes = svgAddLakes;
            this.svgAddWorld = svgAddWorld;
            _.svg = this._.svg;
        },
        onRefresh() {
            refresh.call(this);
        },
        countries() {
            return topojson.feature(_.world, _.world.objects.countries).features;
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
        data(p) {
            if (p) {
                const data = p.worldPlugin.data()
                _.countryNames = data.countryNames;
                _.world = data.world;
            } else {
                return {
                    countryNames: _.countryNames,
                    world: _.world
                }
            }
        }
    };
}
