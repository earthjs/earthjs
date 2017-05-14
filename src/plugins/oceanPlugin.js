export default function() {
    const _ = {svg:null, q: null};

    function svgAddOcean() {
        _.svg.selectAll('#ocean,.ocean').remove();
        if (this._.options.showOcean) {
            const ocean_fill = this._.defs.append("radialGradient")
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
                .attr("class", "noclicks");
            resize.call(this);
            return this._.ocean;
        }
    }

    function resize() {
        if (this._.ocean && this._.options.showOcean) {
            this._.ocean.attr("r", this._.proj.scale());
        }
    }

    return {
        name: 'oceanPlugin',
        onInit() {
            this._.options.showOcean = true;
            this.svgAddOcean = svgAddOcean;
            _.svg = this._.svg;
        },
        onResize() {
            resize.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        }
    }
}
