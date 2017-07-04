// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    /*eslint no-console: 0 */
    const _ = { mouseXY: [0,0], visible: false }
    const barTooltip = d3.select("body").append("div").attr("class", "barTooltip");

    function create() {
        const _this = this;
        this.barPlugin.$bar()
        .on("mouseover", function() {
            if (_this._.options.showBarTooltip) {
                _.visible = true;
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                const i = +this.dataset.index;
                var d = _this.barPlugin.data().features[i];
                if (_this.barTooltipPlugin.onShow) {
                    d = _this.barTooltipPlugin.onShow.call(this, d, barTooltip);
                }
                _this.barTooltipPlugin.show(d)
                .style("display", "block")
                .style("opacity", 1);
                refresh();
            }
        })
        .on("mouseout", function() {
            _.visible = false;
            barTooltip.style("opacity", 0)
            .style("display", "none");
        })
        .on("mousemove", function() {
            if (_this._.options.showBarTooltip) {
                _.mouseXY = [d3.event.pageX + 7, d3.event.pageY - 15];
                refresh();
            }
        });
    }

    function refresh() {
        barTooltip
        .style("left", _.mouseXY[0] + 7 + "px")
        .style("top", _.mouseXY[1] - 15 + "px");
    }

    return {
        name: 'barTooltipPlugin',
        onInit() {
            this._.options.showBarTooltip = true;
        },
        onCreate() {
            create.call(this);
        },
        onResize() {
            create.call(this);
            barTooltip.style("opacity", 0)
            .style("display", "none");
        },
        onRefresh() {
            refresh.call(this);
        },
        show(d) {
            const props = d.properties;
            const title = Object.keys(props).map(k => k+': '+props[k]).join("<br/>");
            return barTooltip.html(title)
        },
        visible() {
            return _.visible;
        }
    }
}
