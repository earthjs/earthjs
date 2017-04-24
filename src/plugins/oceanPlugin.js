export default function(initOptions={}) {
    function svgAddOcean(planet, options) {
        planet._.svg.selectAll('#ocean,.ocean').remove();
        if (!options.hideOcean) {
            var ocean_fill = planet._.defs.append("radialGradient")
                .attr("id", "ocean")
                .attr("cx", "75%")
                .attr("cy", "25%");
            ocean_fill.append("stop")
                .attr("offset", "5%")
                .attr("stop-color", "#ddf");
            ocean_fill.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#9ab");
            planet._.ocean = planet._.svg.append("circle")
                .attr("cx",options.width / 2).attr("cy", options.height / 2)
                .attr("r", planet._.proj.scale())
                .attr("class", "ocean noclicks")
                .style("fill", "url(#ocean)");
            return planet._.ocean;
        }
    }

    initOptions = Object.assign({
        hideOcean: false,
    }, initOptions);

    return {
        name: 'oceanPlugin',
        onInit(planet, options) {
            Object.assign(options, initOptions);
            planet.svgAddOcean = svgAddOcean;
        },
        onResize(planet, options) {
            if (planet._.ocean && !options.hideOcean) {
                planet._.ocean.attr("r", planet._.proj.scale());
            }
        }
    }
}
