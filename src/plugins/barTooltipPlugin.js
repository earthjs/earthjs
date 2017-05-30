// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    const barTooltip = d3.select("body").append("div").attr("class", "barTooltip");

    return {
        name: 'barTooltipPlugin',
        onInit() {
            const _this = this;
            const originalsvgAddBar = this.$.svgAddBar;
            this.$.svgAddBar = function() {
                return originalsvgAddBar.call(this)
                .on("mouseover", function() {
                    const i = +this.dataset.index;
                    var d = _this.barPlugin.data().features[i];
                    if (_this.barTooltipPlugin.onShow) {
                        d = _this.barTooltipPlugin.onShow.call(this, d, i, barTooltip);
                    }
                    _this.barTooltipPlugin.show(d)
                    .style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .style("display", "block")
                    .style("opacity", 1);
                })
                .on("mouseout", function() {
                    barTooltip.style("opacity", 0)
                    .style("display", "none");
                })
                .on("mousemove", function() {
                    barTooltip.style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
                });
            }
        },
        show(d) {
            const props = d.properties;
            const title = Object.keys(props).map(k => k+': '+props[k]).join("<br/>");
            return barTooltip.html(title)
        }
    }
}
