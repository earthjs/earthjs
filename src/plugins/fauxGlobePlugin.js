// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
//
export default function(initOptions={}) {
    function svgAddGlobeDropShadow(planet, options) {
        planet.svg.selectAll('#drop_shadow,.drop_shadow').remove();
        if (!options.hideGlobeShadow) {
            var drop_shadow = planet._.defs.append("radialGradient")
                  .attr("id", "drop_shadow")
                  .attr("cx", "50%")
                  .attr("cy", "50%");
                drop_shadow.append("stop")
                  .attr("offset","20%").attr("stop-color", "#000")
                  .attr("stop-opacity",".5")
                drop_shadow.append("stop")
                  .attr("offset","100%").attr("stop-color", "#000")
                  .attr("stop-opacity","0")
            planet._.dropShadow = planet.svg.append("ellipse")
                  .attr("cx", options.width/2).attr("cy", options.height-50)
                  .attr("rx", planet.proj.scale()*0.90)
                  .attr("ry", planet.proj.scale()*0.25)
                  .attr("class", "drop_shadow noclicks")
                  .style("fill", "url(#drop_shadow)");
            planet._.dropShadow;
        }
    }

    function svgAddGlobeShading(planet, options) {
        planet.svg.selectAll('#globe_shading,.globe_shading').remove();
        if (!options.hideGlobeShading) {
            var globe_shading = planet._.defs.append("radialGradient")
                  .attr("id", "globe_shading")
                  .attr("cx", "50%")
                  .attr("cy", "40%");
                globe_shading.append("stop")
                  .attr("offset","50%").attr("stop-color", "#9ab")
                  .attr("stop-opacity","0")
                globe_shading.append("stop")
                  .attr("offset","100%").attr("stop-color", "#3e6184")
                  .attr("stop-opacity","0.3")
            planet._.globeShading = planet.svg.append("circle")
                .attr("cx", options.width / 2).attr("cy", options.height / 2)
                .attr("r",  planet.proj.scale())
                .attr("class","globe_shading noclicks")
                .style("fill", "url(#globe_shading)");
            return planet._.globeShading;
        }
    }

    function svgAddGlobeHilight(planet, options) {
        planet.svg.selectAll('#globe_hilight,.globe_hilight').remove();
        if (!options.hideGlobeHilight) {
            var globe_highlight = planet._.defs.append("radialGradient")
                  .attr("id", "globe_hilight")
                  .attr("cx", "75%")
                  .attr("cy", "25%");
                globe_highlight.append("stop")
                  .attr("offset", "5%").attr("stop-color", "#ffd")
                  .attr("stop-opacity","0.6");
                globe_highlight.append("stop")
                  .attr("offset", "100%").attr("stop-color", "#ba9")
                  .attr("stop-opacity","0.2");
            planet._.globeHilight = planet.svg.append("circle")
                .attr("cx", options.width / 2).attr("cy", options.height / 2)
                .attr("r",  planet.proj.scale())
                .attr("class","globe_hilight noclicks")
                .style("fill", "url(#globe_hilight)");
            return planet._.globeHilight;
        }
    }

    initOptions = Object.assign({
        hideGlobeShadow: false,
        hideGlobeShading: false,
        hideGlobeHilight: false,
    }, initOptions);

    return {
        name: 'fauxGlobePlugin',
        onInit(planet, options) {
            Object.assign(options, initOptions);
            planet.svgAddGlobeDropShadow = svgAddGlobeDropShadow;
            planet.svgAddGlobeHilight = svgAddGlobeHilight;
            planet.svgAddGlobeShading = svgAddGlobeShading;
        },
        onResize(planet, options) {
            if (planet._.globeShading && !options.hideGlobeShading) {
                planet._.globeShading.attr("r", planet.proj.scale());
            }
            if (planet._.globeHilight && !options.hideGlobeHilight) {
                planet._.globeHilight.attr("r", planet.proj.scale());
            }
        }
    }
}
