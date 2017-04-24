export default function(jsonWorld='./d/world-110m.json', tsvCountryNames) {
    var countryClick = function() {
        // console.log(d);
    }

    function svgAddWorldOrCountries(planet, options) {
        planet.svg.selectAll('.land,.lakes,.countries').remove();
        if (!options.hideLand) {
            if (planet._world) {
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
        planet._.countries = planet.svg.append("g").attr("class","countries").selectAll("path")
        .data(topojson.feature(planet._world, planet._world.objects.countries).features)
        .enter().append("path").attr("id",function(d) {return 'x'+d.id})
        .on('click', countryClick)
        .attr("d", planet.path);
        return planet._.countries;
    }

    function svgAddWorld(planet) {
        planet._.world = planet.svg.append("g").attr("class","land").append("path")
        .datum(topojson.feature(planet._world, planet._world.objects.land))
        .attr("d", planet.path);
        return planet._.world;
    }

    function svgAddLakes(planet) {
        planet._.lakes = planet.svg.append("g").attr("class","lakes").append("path")
        .datum(topojson.feature(planet._world, planet._world.objects.ne_110m_lakes))
        .attr("d", planet.path);
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
            planet._world = world;
            planet._countryNames = countryNames;
            planet.svgRecreate(planet);
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
                    planet._.countries.attr("d", planet.path);
                } else {
                    planet._.world.attr("d", planet.path);
                }
                planet._.lakes.attr("d", planet.path);
            }
        }
    };
}
