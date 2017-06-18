// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
export default function() {
    /*eslint no-console: 0 */
    const _ = {svg:null, q: null};
    const $ = {};

    function svgAddDropShadow() {
        const __ = this._;
        _.svg.selectAll('#drop_shadow,.drop_shadow').remove();
        if (__.options.showGlobeShadow) {
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

    function svgAddGlobeShading() {
        const __ = this._;
        _.svg.selectAll('#shading,.shading').remove();
        if (__.options.showGlobeShading) {
            const globe_shading = this.$slc.defs.append("radialGradient")
                  .attr("id", "shading")
                  .attr("cx", "50%")
                  .attr("cy", "40%");
                globe_shading.append("stop")
                  .attr("offset","50%").attr("stop-color", "#9ab")
                  .attr("stop-opacity","0")
                globe_shading.append("stop")
                  .attr("offset","100%").attr("stop-color", "#3e6184")
                  .attr("stop-opacity","0.3")
            $.globeShading = _.svg.append("g").attr("class","shading").append("circle")
                .attr("cx", __.center[0]).attr("cy", __.center[1])
                .attr("r",  __.proj.scale())
                .attr("class","noclicks")
                .style("fill", "url(#shading)");
        }
    }

    function svgAddGlobeHilight() {
        const __ = this._;
        _.svg.selectAll('#hilight,.hilight').remove();
        if (__.options.showGlobeHilight) {
            const globe_highlight = this.$slc.defs.append("radialGradient")
                  .attr("id", "hilight")
                  .attr("cx", "75%")
                  .attr("cy", "25%");
                globe_highlight.append("stop")
                  .attr("offset", "5%").attr("stop-color", "#ffd")
                  .attr("stop-opacity","0.6");
                globe_highlight.append("stop")
                  .attr("offset", "100%").attr("stop-color", "#ba9")
                  .attr("stop-opacity","0.2");
            $.globeHilight = _.svg.append("g").attr("class","hilight").append("circle")
                .attr("cx", __.center[0]).attr("cy", __.center[1])
                .attr("r",  __.proj.scale())
                .attr("class","noclicks")
                .style("fill", "url(#hilight)");
        }
    }

    return {
        name: 'fauxGlobePlugin',
        onInit() {
            const {options} = this._;
            options.showGlobeShadow  = true;
            options.showGlobeShading = true;
            options.showGlobeHilight = true;
            this.$fn.svgAddDropShadow   = svgAddDropShadow;
            this.$fn.svgAddGlobeHilight = svgAddGlobeHilight;
            this.$fn.svgAddGlobeShading = svgAddGlobeShading;
            _.svg = this._.svg;
        },
        onResize() {
            const __ = this._;
            const {options} = __;
            const scale = __.proj.scale();
            if ($.globeShading && options.showGlobeShading) {
                $.globeShading.attr("r", scale);
            }
            if ($.globeHilight && options.showGlobeHilight) {
                $.globeHilight.attr("r", scale);
            }
            if ($.dropShadow && options.showGlobeShadow) {
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
