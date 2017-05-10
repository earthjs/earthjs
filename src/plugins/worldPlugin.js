export default function(urlWorld, urlCountryNames) {
    var _ = {svg:null, select: null, world: null, countries: null, countryNames: null};
    var countryClick = function() {
        // console.log(d);
    }

    function svgAddWorldOrCountries() {
        _.svg.selectAll('.land,.lakes,.countries').remove();
        if (this._.options.showLand) {
            if (_.world) {
                if (this._.options.showCountries) {
                    svgAddCountries.call(this);
                } else {
                    svgAddWorld.call(this);
                }
                if (this._.options.showLakes) {
                    svgAddLakes.call(this);
                }
            }
        }
    }

    function svgAddWorld() {
        var land = topojson.feature(_.world, _.world.objects.land);

        this._.world = _.svg.append("g").attr("class","land").append("path")
            .datum(land)
            .attr("d", this._.path);
        return this._.world;
    }

    function svgAddCountries() {
        var countries = topojson.feature(_.world, _.world.objects.countries).features;

        this._.countries = _.svg.append("g").attr("class","countries").selectAll("path")
            .data(countries).enter().append("path").on('click', countryClick)
            .attr("id",function(d) {return 'x'+d.id})
            .attr("d", this._.path);
        return this._.countries;
    }

    function svgAddLakes() {
        var lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);

        this._.lakes = _.svg.append("g").attr("class","lakes").append("path")
            .datum(lakes)
            .attr("d", this._.path);
        return this._.lakes;
    }

    var urls = null;
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
            _.svg = this._.svg;
        },
        onRefresh() {
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
        },
        countries() {
            return _.countries;
        },
        countryName(d) {
            var cname = '';
            if (_.countryNames) {
                cname = _.countryNames.find(function(x) {
                    return x.id==d.id;
                });
            }
            return cname;
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        },
        data(p) {
            if (p) {
                var data = p.worldPlugin.data()
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
