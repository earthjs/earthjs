earthjs.plugins.oceanPlugin = function(initOptions={}) {
    function addOcean(planet, options) {
        planet.svg.selectAll('#ocean_fill,.ocean_fill_circle').remove();
        if (!options.hideOcean) {
            var ocean_fill = planet.svg.append("defs").append("radialGradient")
                .attr("id", "ocean_fill")
                .attr("cx", "75%")
                .attr("cy", "25%");
            ocean_fill.append("stop")
                .attr("offset", "5%")
                .attr("stop-color", "#ddf");
            ocean_fill.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#9ab");
            planet.ocean = planet.svg.append("circle")
                .attr("cx",planet.width / 2).attr("cy", planet.height / 2)
                .attr("r", planet.proj.scale())
                .attr("class", "ocean_fill_circle noclicks")
                .style("fill", "url(#ocean_fill)");
        }
    }

    initOptions = Object.assign({
        hideOcean: false,
    }, initOptions);

    return {
        name: 'oceanPlugin',
        onInit(planet, options) {
            Object.assign(options, initOptions);
            planet.addOcean = addOcean;
        },
        onResize(planet, options) {
            if (planet.ocean && !options.hideOcean) {
                planet.ocean.attr("r", planet.proj.scale());
            }
        }
    }
}
