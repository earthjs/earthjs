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
                    this.svgAddCountries.call(this);
                } else {
                    this.svgAddWorld.call(this);
                }
                if (this._.options.showLakes) {
                    this.svgAddLakes.call(this);
                }
            }
        }
    }

    function svgAddCountries() {
        this._.countries = _.svg.append("g").attr("class","countries").selectAll("path")
        .data(_.countries).enter().append("path").attr("id",function(d) {return 'x'+d.id})
        .on('click', countryClick)
        .attr("d", this._.path);
        return this._.countries;
    }

    function svgAddWorld() {
        this._.world = _.svg.append("g").attr("class","land").append("path")
        .datum(topojson.feature(_.world, _.world.objects.land))
        .attr("d", this._.path);
        return this._.world;
    }

    function svgAddLakes() {
        this._.lakes = _.svg.append("g").attr("class","lakes").append("path")
        .datum(topojson.feature(_.world, _.world.objects.ne_110m_lakes))
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
            _.countries = topojson.feature(_.world, _.world.objects.countries).features;
        },
        onInit() {
            this._.options.showLand = true;
            this._.options.showLakes = true;
            this._.options.showCountries = true;
            this.svgAddWorldOrCountries = svgAddWorldOrCountries;
            this.svgAddCountries = svgAddCountries;
            this.svgAddWorld = svgAddWorld;
            this.svgAddLakes = svgAddLakes;
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
