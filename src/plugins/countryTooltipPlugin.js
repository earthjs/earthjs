// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    /*eslint no-console: 0 */
    const _ = {show: false};
    const countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");

    function create() {
        const _this = this;
        this.worldPlugin.$countries()
        .on("mouseover", function(d) {
            if (_this._.options.showCountryTooltip) {
                _.show = true;
                const country = _this.worldPlugin.countryName.call(_this, d);
                refresh()
                .style("display", "block")
                .style("opacity", 1)
                .text(country.name);
            }
        })
        .on("mouseout", function() {
            _.show = false;
            countryTooltip.style("opacity", 0)
            .style("display", "none");
        })
        .on("mousemove", function() {
            if (_this._.options.showCountryTooltip) {
                refresh();
            }
        });
    }

    function refresh(mouse) {
        if (!mouse) {
            mouse = [d3.event.pageX, d3.event.pageY];
        }
        return countryTooltip
        .style("left", (mouse[0] + 7) + "px")
        .style("top", (mouse[1] - 15) + "px")
    }

    return {
        name: 'countryTooltipPlugin',
        onInit() {
            this._.options.showCountryTooltip = true;
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            if (this._.drag && _.show) {
                refresh(this.versorDragPlugin.mouse());
            }
        },
    }
}
