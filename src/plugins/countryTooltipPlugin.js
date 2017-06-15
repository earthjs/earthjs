// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    /*eslint no-console: 0 */
    const _ = {show: false, countryName: ''};
    const countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

    return {
        name: 'countryTooltipPlugin',
        onInit() {
            const _this = this;
            const originalsvgAddCountries = this.$.svgAddCountries;
            this.$.svgAddCountries = function() {
                return originalsvgAddCountries.call(this)
                .on("mouseover", function(d) {
                    if (!_this._.drag) {
                        _.show = true;
                        const mouse = d3.mouse(this);
                        const country = _this.worldPlugin.countryName.call(_this, d);
                        _.countryName = country.name;
                        countryTooltip.text(_.countryName)
                        .style("left", (mouse[0] + 7) + "px")
                        .style("top", (mouse[1] - 15) + "px")
                        .style("display", "block")
                        .style("opacity", 1);
                    }
                })
                .on("mouseout", function() {
                    if (!_this._.drag) {
                        _.show = false;
                        countryTooltip.style("opacity", 0)
                        .style("display", "none");
                    }
                })
                .on("mousemove", function() {
                    if (!_this._.drag) {
                        const mouse = d3.mouse(this);
                        countryTooltip
                        .style("left", (mouse[0] + 7) + "px")
                        .style("top", (mouse[1] - 15) + "px");
                    }
                });
            }
        },
        onRefresh() {
            if (this._.drag && _.show) {
                const mouse = this.versorDragPlugin.mouse();
                countryTooltip
                .style("left", (mouse[0] + 7) + "px")
                .style("top", (mouse[1] - 15) + "px");
            }
        },
    }
}
