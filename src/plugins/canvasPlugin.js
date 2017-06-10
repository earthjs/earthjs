// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
export default () => {
    /*eslint no-console: 0 */
    const _ = {canvas: null, path: null, q: null}

    function svgAddCanvas() {
        if (this._.options.showCanvas) {
            if (!_.canvas) {
                const fObject = this._.svg.append("g").attr("class","canvas").append("foreignObject")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", this._.options.width)
                .attr("height", this._.options.height);
                const fBody = fObject.append("xhtml:body")
                .style("margin", "0px")
                .style("padding", "0px")
                .style("background-color", "none")
                .style("width", this._.options.width + "px")
                .style("height", this._.options.height + "px");
                _.canvas = fBody.append("canvas");
            }
            _.canvas
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this._.options.width)
            .attr("height", this._.options.height);
            return _.canvas;
        }
    }

    return {
        name: 'canvasPlugin',
        onInit() {
            this._.options.showCanvas = true;
            this.$.svgAddCanvas = svgAddCanvas;
            _.path = d3.geoPath().projection(this._.proj);
        },
        onRefresh() {
            const width = this._.options.width,
                  height= this._.options.height;
            _.canvas.each(function() {
                this.getContext("2d").clearRect(0, 0, width, height);
            });
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.canvas = d3.selectAll(q);
            }
            return _.canvas;
        },
        render(fn, drawTo, options=[]) {
            if (this._.options.showCanvas) {
                var rChange = false;
                const proj = this._.proj;
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
