export default function(jsonWorld='./d/world-110m.json', tsvCountryNames) {
    var _ = {world: null, countryNames: null, select: null};
    var countryClick = function() {
        // console.log(d);
    }

    function svgAddWorldOrCountries(planet, options) {
        planet._.svg.selectAll('.land,.lakes,.countries').remove();
        if (!options.hideLand) {
            if (_.world) {
                if (!options.hideCountries) {
                    planet.svgAddCountries(planet, options);
                } else {
                    planet.svgAddWorld(planet, options);
                }
                planet.svgAddLakes(planet, options);
            }
        }
    }

    function svgAddCountries(planet) {
        planet._.countries = planet._.svg.append("g").attr("class","countries").selectAll("path")
        .data(topojson.feature(_.world, _.world.objects.countries).features)
        .enter().append("path").attr("id",function(d) {return 'x'+d.id})
        .on('click', countryClick)
        .attr("d", planet._.path);
        return planet._.countries;
    }

    function svgAddWorld(planet) {
        planet._.world = planet._.svg.append("g").attr("class","land").append("path")
        .datum(topojson.feature(_.world, _.world.objects.land))
        .attr("d", planet._.path);
        return planet._.world;
    }

    function svgAddLakes(planet) {
        planet._.lakes = planet._.svg.append("g").attr("class","lakes").append("path")
        .datum(topojson.feature(_.world, _.world.objects.ne_110m_lakes))
        .attr("d", planet._.path);
        return planet._.lakes;
    }

    var data = [jsonWorld];
    if (tsvCountryNames) {
        data.push(tsvCountryNames);
    }
    return {
        name: 'worldPlugin',
        data: data,
        ready(planet, options, err, world, countryNames) {
            _.world = world;
            _.countryNames = countryNames;
            planet.svgDraw();
        },
        onInit(planet, options) {
            options.world = true;
            options.hideLand = false;
            options.hideCountries = false;
            planet.svgAddWorldOrCountries = svgAddWorldOrCountries;
            planet.svgAddCountries = svgAddCountries;
            planet.svgAddWorld = svgAddWorld;
            planet.svgAddLakes = svgAddLakes;
        },
        onRefresh(planet, options) {
            if (!options.hideLand) {
                if (!options.hideCountries) {
                    planet._.countries.attr("d", planet._.path);
                } else {
                    planet._.world.attr("d", planet._.path);
                }
                planet._.lakes.attr("d", planet._.path);
            }
        },
        countryName(planet, options, d) {
            return _.countryNames.find(function(x) {
                return x.id==d.id;
            })
        }
    };
}
