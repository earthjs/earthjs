earthjs.plugins.graticulePlugin = function(initOptions={}) {
    function addGraticule(planet, options) {
        planet.svg.selectAll('.graticule').remove();
        if (!options.hideGraticule) {
            planet.graticule = planet.svg.append("path").datum(planet.datumGraticule)
            .attr("class", "graticule noclicks")
            .attr("d", planet.path);
        }
    }

    initOptions = Object.assign({
        hideGraticule: false,
    }, initOptions);

    return {
        name: 'graticulePlugin',
        onInit(planet, options) {
            planet.datumGraticule = d3.geoGraticule();
            Object.assign(options, initOptions);
            planet.addGraticule = addGraticule;
        },
        onRefresh(planet, options) {
            if (planet.graticule && !options.hideGraticule) {
                planet.graticule.attr("d", planet.path);
            }
        },
    }
}
