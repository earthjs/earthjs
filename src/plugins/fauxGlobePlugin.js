// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
//
export default function(initOptions={}) {
    var _ = {svg:null, select: null};

    function svgAddDropShadow() {
        _.svg.selectAll('#drop_shadow,.drop_shadow').remove();
        if (this._.options.showGlobeShadow) {
            var drop_shadow = this._.defs.append("radialGradient")
                  .attr("id", "drop_shadow")
                  .attr("cx", "50%")
                  .attr("cy", "50%");
                drop_shadow.append("stop")
                  .attr("offset","20%").attr("stop-color", "#000")
                  .attr("stop-opacity",".5")
                drop_shadow.append("stop")
                  .attr("offset","100%").attr("stop-color", "#000")
                  .attr("stop-opacity","0")
            this._.dropShadow = _.svg.append("ellipse")
                  .attr("cx", this._.options.width/2).attr("cy", this._.options.height-50)
                  .attr("rx", this._.proj.scale()*0.90)
                  .attr("ry", this._.proj.scale()*0.25)
                  .attr("class", "drop_shadow noclicks")
                  .style("fill", "url(#drop_shadow)");
            this._.dropShadow;
        }
    }

    function svgAddGlobeShading() {
        _.svg.selectAll('#globe_shading,.globe_shading').remove();
        if (this._.options.showGlobeShading) {
            var globe_shading = this._.defs.append("radialGradient")
                  .attr("id", "globe_shading")
                  .attr("cx", "50%")
                  .attr("cy", "40%");
                globe_shading.append("stop")
                  .attr("offset","50%").attr("stop-color", "#9ab")
                  .attr("stop-opacity","0")
                globe_shading.append("stop")
                  .attr("offset","100%").attr("stop-color", "#3e6184")
                  .attr("stop-opacity","0.3")
            this._.globeShading = _.svg.append("circle")
                .attr("cx", this._.options.width / 2).attr("cy", this._.options.height / 2)
                .attr("r",  this._.proj.scale())
                .attr("class","globe_shading noclicks")
                .style("fill", "url(#globe_shading)");
            return this._.globeShading;
        }
    }

    function svgAddGlobeHilight() {
        _.svg.selectAll('#globe_hilight,.globe_hilight').remove();
        if (this._.options.showGlobeHilight) {
            var globe_highlight = this._.defs.append("radialGradient")
                  .attr("id", "globe_hilight")
                  .attr("cx", "75%")
                  .attr("cy", "25%");
                globe_highlight.append("stop")
                  .attr("offset", "5%").attr("stop-color", "#ffd")
                  .attr("stop-opacity","0.6");
                globe_highlight.append("stop")
                  .attr("offset", "100%").attr("stop-color", "#ba9")
                  .attr("stop-opacity","0.2");
            this._.globeHilight = _.svg.append("circle")
                .attr("cx", this._.options.width / 2).attr("cy", this._.options.height / 2)
                .attr("r",  this._.proj.scale())
                .attr("class","globe_hilight noclicks")
                .style("fill", "url(#globe_hilight)");
            return this._.globeHilight;
        }
    }

    initOptions = Object.assign({
        showGlobeShadow: true,
        showGlobeShading: true,
        showGlobeHilight: true,
    }, initOptions);

    return {
        name: 'fauxGlobePlugin',
        onInit() {
            Object.assign(this._.options, initOptions);
            this.svgAddDropShadow = svgAddDropShadow;
            this.svgAddGlobeHilight = svgAddGlobeHilight;
            this.svgAddGlobeShading = svgAddGlobeShading;
            _.svg = this._.svg;
        },
        onResize() {
            if (this._.globeShading && this._.options.showGlobeShading) {
                this._.globeShading.attr("r", this._.proj.scale());
            }
            if (this._.globeHilight && this._.options.showGlobeHilight) {
                this._.globeHilight.attr("r", this._.proj.scale());
            }
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        }
    }
}
