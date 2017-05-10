export default function() {
    var _ = {svg:null, select: null}

    function svgAddCanvas() {
        _.svg.selectAll('.canvas').remove();
        if (this._.options.showCanvas) {
            var fObject = _.svg.append("foreignObject")
            .attr("class", "canvas")
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
            var context = this._.canvas.node().getContext("2d");
            context.clearRect(0, 0, this._.options.width, this._.options.height);
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        },
        context() {
            return this._.canvas.node().getContext("2d");
        },
        path() {
            var context = this.canvasPlugin.context();
            var path = d3.geoPath().projection(this._.proj).context(context);
            return path;
        }
    }
}
