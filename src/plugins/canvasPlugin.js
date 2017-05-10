// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
export default function() {
    var _ = {svg:null, select: null}

    function svgAddCanvas() {
        _.svg.selectAll('.canvas').remove();
        if (this._.options.showCanvas) {
            var fObject = _.svg.append("g").attr("class","canvas").append("foreignObject")
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
            this._.canvas = fBody.append("canvas")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this._.options.width)
            .attr("height", this._.options.height);
            return this._.canvas;
        }
    }

    return {
        name: 'canvasPlugin',
        onInit() {
            this.svgAddCanvas = svgAddCanvas;
            this._.options.showCanvas = true;
            _.svg = this._.svg;
        },
        onRefresh() {
            var width = this._.options.width,
                height= this._.options.height;
            this._.svg.each(function() {
                var context = this.getElementsByTagName('canvas')[0].getContext("2d");
                context.clearRect(0, 0, width, height);
            })
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        },
        render(fn) {
            var _this = this;
            var cpath = d3.geoPath().projection(this._.proj);
            this._.svg.each(function() {
                var context = this.getElementsByTagName('canvas')[0].getContext("2d");
                fn.call(_this, context, cpath.context(context));
            })
        }
    }
}
