// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
export default function() {
    var _ = {canvas: null, path: null, q: null}

    function svgAddCanvas() {
        if (this._.options.showCanvas) {
            if (!_.canvas) {
                var fObject = this._.svg.append("g").attr("class","canvas").append("foreignObject")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", this._.options.width)
                .attr("height", this._.options.height);
                var fBody = fObject.append("xhtml:body")
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
            this.svgAddCanvas = svgAddCanvas;
            this._.options.showCanvas = true;
            _.path = d3.geoPath().projection(this._.proj);
        },
        onRefresh() {
            var width = this._.options.width,
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
        render(fn) {
            if (this._.options.showCanvas) {
                var _this = this;
                _.canvas.each(function() {
                    var context = this.getContext("2d");
                    fn.call(_this, context, _.path.context(context));
                });
            }
        }
    }
}
