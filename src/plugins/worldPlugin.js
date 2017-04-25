export default function(jsonWorld='./d/world-110m.json', tsvCountryNames) {
    var _ = {svg:null, select: null, world: null, countryNames: null};
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
                this.svgAddLakes.call(this);
            }
        }
    }

    function svgAddCountries() {
        this._.countries = _.svg.append("g").attr("class","countries").selectAll("path")
        .data(topojson.feature(_.world, _.world.objects.countries).features)
        .enter().append("path").attr("id",function(d) {return 'x'+d.id})
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

    var data = [jsonWorld];
    if (tsvCountryNames) {
        data.push(tsvCountryNames);
    }
    return {
        name: 'worldPlugin',
        data: data,
        onReady(err, world, countryNames) {
            _.countryNames = countryNames;
            _.world = world;
            this.svgDraw();
        },
        onInit() {
            this._.options.showLand = true;
            this._.options.showCountries = true;
            this.svgAddWorldOrCountries = svgAddWorldOrCountries;
            this.svgAddCountries = svgAddCountries;
            this.svgAddWorld = svgAddWorld;
            this.svgAddLakes = svgAddLakes;
            _.svg = this._.svg;
        },
        onRefresh() {
            if (this._.options.showLand) {
                if (this._.options.showCountries) {
                    this._.countries.attr("d", this._.path);
                } else {
                    this._.world.attr("d", this._.path);
                }
                this._.lakes.attr("d", this._.path);
            }
        },
        countryName(d) {
            return _.countryNames.find(function(x) {
                return x.id==d.id;
            })
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        }
    };
}
