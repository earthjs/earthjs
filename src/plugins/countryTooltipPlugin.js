earthjs.plugins.countryTooltipPlugin = function(initOptions={}) {
    var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

    initOptions = Object.assign({
        hideCountryTooltip: false,
    }, initOptions);

    return {
        name: 'countryTooltipPlugin',
        onInit(planet, options) {
            var originalAddCountries = planet.addCountries;
            planet.addCountries  = function(planet, options) {
                originalAddCountries(planet, options)
                .on("mouseover", function(d) {
                    var country = planet._countryNames.find(function(x) {
                        return x.id==d.id;
                    });
                    countryTooltip.text(country.name)
                    .style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .style("display", "block")
                    .style("opacity", 1);
                    console.log('draw tooltip');
                })
                .on("mouseout", function(d) {
                    countryTooltip.style("opacity", 0)
                    .style("display", "none");
                })
                .on("mousemove", function(d) {
                    countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
                });
                return planet.countries;
            }
        },
    }
}
