export default function(initOptions={}) {
    var datumGraticule = d3.geoGraticule();

    function svgAddGraticule(planet, options) {
        planet._.svg.selectAll('.graticule').remove();
        if (!options.hideGraticule) {
            planet._.graticule = planet._.svg.append("g").attr("class","graticule").append("path")
                .datum(datumGraticule)
                .attr("class", "noclicks")
                .attr("d", planet._.path);
            return planet._.graticule;
        }
    }

    initOptions = Object.assign({
        hideGraticule: false,
    }, initOptions);

    return {
        name: 'graticulePlugin',
        onInit(planet, options) {
            Object.assign(options, initOptions);
            planet.svgAddGraticule = svgAddGraticule;
        },
        onRefresh(planet, options) {
            if (planet._.graticule && !options.hideGraticule) {
                planet._.graticule.attr("d", planet._.path);
            }
        },
    }
}
