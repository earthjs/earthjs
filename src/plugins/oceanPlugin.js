export default function(initOptions={}) {
    var _ = {svg:null, select: null};

    function svgAddOcean() {
        _.svg.selectAll('#ocean,.ocean').remove();
        if (!this._.options.hideOcean) {
            var ocean_fill = this._.defs.append("radialGradient")
                .attr("id", "ocean")
                .attr("cx", "75%")
                .attr("cy", "25%");
            ocean_fill.append("stop")
                .attr("offset", "5%")
                .attr("stop-color", "#ddf");
            ocean_fill.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#9ab");
            this._.ocean = _.svg.append("circle")
                .attr("cx",this._.options.width / 2).attr("cy", this._.options.height / 2)
                .attr("r", this._.proj.scale())
                .attr("class", "ocean noclicks")
                .style("fill", "url(#ocean)");
            return this._.ocean;
        }
    }

    initOptions = Object.assign({
        hideOcean: false,
    }, initOptions);

    return {
        name: 'oceanPlugin',
        onInit() {
            Object.assign(this._.options, initOptions);
            this.svgAddOcean = svgAddOcean;
            _.svg = this._.svg;
        },
        onResize() {
            if (this._.ocean && !this._.options.hideOcean) {
                this._.ocean.attr("r", this._.proj.scale());
            }
        },
        select(slc) {
            _.select = slc;
            _.svg = d3.selectAll(slc);
            return _.svg;
        }
    }
}
