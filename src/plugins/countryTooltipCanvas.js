// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    /*eslint no-debugger: 0 */
    /*eslint no-console: 0 */
    const _ = {show: false};
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
            const _this = this;
            const toolTipsHandler = function() {
                const {country, mouse} = _this.countrySelectCanvas.data();
                if (country) {
                    const countryName = _this.worldCanvas.countryName(country);
                    if (countryName) {
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
            this.countrySelectCanvas.onHover({
                countryTooltipCanvas: toolTipsHandler
            });
            if (this.versorDragPlugin) {
                this.versorDragPlugin.onDrag({
                    countryTooltipCanvas: toolTipsHandler
                });
            }
        },
        onRefresh() {
            if (this._.drag && _.show) {
                refresh(this.versorDragPlugin.mouse());
            }
        },
    }
}
