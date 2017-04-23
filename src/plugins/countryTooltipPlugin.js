// KoGor’s Block http://bl.ocks.org/KoGor/5994804
//
export default function() {
    var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

    return {
        name: 'countryTooltipPlugin',
        onInit(planet) {
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
                })
                .on("mouseout", function() {
                    countryTooltip.style("opacity", 0)
                    .style("display", "none");
                })
                .on("mousemove", function() {
                    countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
                });
                return planet.countries;
            }
        },
    }
}
