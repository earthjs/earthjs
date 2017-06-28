// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
export default () => {
    /*eslint no-console: 0 */
    const _ = {canvas: null, path: null, q: null}

    function svgAddCanvas() {
        const __ = this._;
        if (__.options.showCanvas) {
            if (!_.canvas) {
                const fObject = __.svg.append("g").attr("class","canvas").append("foreignObject")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", __.options.width)
                .attr("height", __.options.height);
                const fBody = fObject.append("xhtml:body")
                .style("margin", "0px")
                .style("padding", "0px")
                .style("background-color", "none")
                .style("width", __.options.width + "px")
                .style("height", __.options.height + "px");
                _.canvas = fBody.append("canvas");
            }
            _.canvas
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", __.options.width)
            .attr("height", __.options.height);
        }
        if (_.canvas) {
            refresh.call(this);
        }
    }

    function refresh() {
        const {width, height} = this._.options;
        _.canvas.each(function() {
            this.getContext("2d").clearRect(0, 0, width, height);
        });
    }

    return {
        name: 'canvasPlugin',
        onInit() {
            this._.options.showCanvas = true;
            // this.$fn.svgAddCanvas = svgAddCanvas;
            _.path = d3.geoPath().projection(this._.proj);
        },
        onCreate() {
            svgAddCanvas.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.canvas = d3.selectAll(q);
            }
            return _.canvas;
        },
        render(fn, drawTo, options=[]) {
            const __ = this._;
            if (__.options.showCanvas) {
                var rChange = false;
                const proj = __.proj;
                const r = proj.rotate();
                const _this = this;
                _.canvas.each(function(obj, idx) {
                    if (!drawTo || drawTo.indexOf(idx)>-1) {
                        const o = options[idx] || {};
                        if (o.rotate) {
                            rChange = true;
                            proj.rotate([r[0]+o.rotate, r[1], r[2]]);
                        } else if (rChange) {
                            rChange = false;
                            proj.rotate(r);
                        }
                        const context = this.getContext("2d");
                        fn.call(_this, context, _.path.context(context));
                    }
                });
                if (rChange) {
                    rChange = false;
                    proj.rotate(r);
                }
            }
        }
    }
}
