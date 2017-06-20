// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
export default function() {
    /*eslint no-console: 0 */
    const _ = {svg:null, q: null};
    const $ = {};

    function svgAddDropShadow() {
        const __ = this._;
        _.svg.selectAll('#drop_shadow,.drop_shadow').remove();
        if (__.options.showDropShadow) {
            const drop_shadow = this.$slc.defs.append("radialGradient")
                  .attr("id", "drop_shadow")
                  .attr("cx", "50%")
                  .attr("cy", "50%");
                drop_shadow.append("stop")
                  .attr("offset","20%").attr("stop-color", "#000")
                  .attr("stop-opacity",".5")
                drop_shadow.append("stop")
                  .attr("offset","100%").attr("stop-color", "#000")
                  .attr("stop-opacity","0")
            $.dropShadow = _.svg.append("g").attr("class","drop_shadow").append("ellipse")
                  .attr("cx", __.center[0])
                  .attr("cy", __.options.height-50)
                  .attr("rx", __.proj.scale()*0.90)
                  .attr("ry", __.proj.scale()*0.25)
                  .attr("class", "noclicks")
                  .style("fill", "url(#drop_shadow)");
        }
    }

    return {
        name: 'dropShadowPlugin',
        onInit() {
            const {options} = this._;
            options.showDropShadow  = true;
            this.$fn.svgAddDropShadow   = svgAddDropShadow;
            _.svg = this._.svg;
        },
        onResize() {
            const __ = this._;
            const {options} = __;
            const scale = __.proj.scale();
            if ($.dropShadow && options.showDropShadow) {
                $.dropShadow
                .attr("cy", scale+250)
                .attr("rx", scale*0.90)
                .attr("ry", scale*0.25);
            }
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
