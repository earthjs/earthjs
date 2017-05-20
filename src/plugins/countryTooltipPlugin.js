// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    const countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

    return {
        name: 'countryTooltipPlugin',
        onInit() {
            const _this = this;
            const originalsvgAddCountries = this.$.svgAddCountries;
            this.$.svgAddCountries = function() {
                return originalsvgAddCountries.call(this)
                .on("mouseover", function(d) {
                    const country = _this.worldPlugin.countryName.call(_this, d);
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
            }
        },
    }
}
