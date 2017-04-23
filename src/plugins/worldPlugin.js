earthjs.plugins.worldPlugin = function(jsonWorld='./d/world-110m.json', tsvCountryNames) {
    function addWorldOrCountries(planet, options) {
        planet.svg.selectAll('.land,.lakes,.countries').remove();
        if (!options.hideLand) {
            if (planet._world) {
                if (!options.hideCountries) {
                    planet.addCountries(planet, options);
                } else {
                    planet.addWorld(planet, options);
                }
                planet.addLakes(planet, options);
            }
        }
    }

    function addCountries(planet, options) {
        planet.countries = planet.svg.append("g").attr("class","countries").selectAll("path")
        .data(topojson.feature(planet._world, planet._world.objects.countries).features)
        .enter().append("path").attr("id",function(d) {return 'x'+d.id})
        .attr("d", planet.path);
        return planet.countries;
    }

    function addWorld(planet, options) {
        planet.world = planet.svg.append("g").attr("class","land").append("path")
        .datum(topojson.feature(planet._world, planet._world.objects.land))
        .attr("d", planet.path);
        return planet.world;
    }

    function addLakes(planet, options) {
        planet.lakes = planet.svg.append("g").attr("class","lakes").append("path")
        .datum(topojson.feature(planet._world, planet._world.objects.ne_110m_lakes))
        .attr("d", planet.path);
        return planet.lakes;
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
            planet.recreateSvg(planet);
        },
        onInit(planet, options) {
            options.world = true;
            options.hideLand = false;
            options.hideCountries = false;
            planet.addWorldOrCountries = addWorldOrCountries;
            planet.addCountries = addCountries;
            planet.addWorld = addWorld;
            planet.addLakes = addLakes;
        },
        onRefresh(planet, options) {
            if (!options.hideLand) {
                if (!options.hideCountries) {
                    planet.countries.attr("d", planet.path);
                } else {
                    planet.world.attr("d", planet.path);
                }
                planet.lakes.attr("d", planet.path);
            }
        }
    };
};
