export default function(initOptions={}) {
    var _ = {svg:null, select: null};

    function svgAddOcean() {
        _.svg.selectAll('#ocean,.ocean').remove();
        if (this._.options.showOcean) {
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
            this._.ocean = _.svg.append("g").attr("class","ocean").append("circle")
                .attr("cx",this._.options.width / 2).attr("cy", this._.options.height / 2)
                .attr("r", this._.proj.scale())
                .attr("class", "noclicks")
            return this._.ocean;
        }
    }

    initOptions = Object.assign({
        showOcean: true,
    }, initOptions);

    return {
        name: 'oceanPlugin',
        onInit() {
            Object.assign(this._.options, initOptions);
            this.svgAddOcean = svgAddOcean;
            _.svg = this._.svg;
        },
        onResize() {
            if (this._.ocean && this._.options.showOcean) {
                this._.ocean.attr("r", this._.proj.scale());
            }
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        }
    }
}
