// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    /*eslint no-console: 0 */
    const countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

    function refresh(mouse) {
        return countryTooltip
        .style("left", (mouse[0] + 7) + "px")
        .style("top", (mouse[1] - 15) + "px")
    }

    function hideTooltip() {
        countryTooltip
        .style("opacity", 0)
        .style("display", "none");
    }

    return {
        name: 'countryTooltipCanvas',
        onInit() {
            const toolTipsHandler = () => {
                const {country, mouse} = this.hoverCanvas.data();
                if (country && this._.options.showCountryTooltip) {
                    const countryName = this.worldCanvas.countryName(country);
                    if (countryName && !(this.barTooltipSvg && this.barTooltipSvg.visible())) {
                        refresh(mouse)
                        .style("display", "block")
                        .style("opacity", 1)
                        .text(countryName.name);
                    } else {
                        hideTooltip()
                    }
                } else {
                    hideTooltip()
                }
            }
            this.hoverCanvas.addSelectCountryEvent({
                countryTooltipCanvas: toolTipsHandler
            });
            if (this.versorDragPlugin) {
                this.versorDragPlugin.onDrag({
                    countryTooltipCanvas: toolTipsHandler
                });
            }
            this._.options.showCountryTooltip = true;
        },
        onRefresh() {
            if (this._.drag) {
                refresh(this.versorDragPlugin.mouse());
            }
        },
    }
}
