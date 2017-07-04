// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
export default function() {
    /*eslint no-console: 0 */
    const _ = {svg:null, q: null};
    const $ = {};

    function create() {
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
            .attr("class", "noclicks")
            .style("fill", "url(#drop_shadow)");
            resize.call(this);
        }
    }

    function resize() {
        const scale = this._.proj.scale();
        $.dropShadow
        .attr("cy", scale+this._.center[1])
        .attr("rx", scale*0.90)
        .attr("ry", scale*0.25);
    }

    return {
        name: 'dropShadowPlugin',
        onInit() {
            const {options} = this._;
            options.showDropShadow  = true;
            _.svg = this._.svg;
        },
        onCreate() {
            create.call(this);
        },
        onResize() {
            if ($.dropShadow && this._.options.showDropShadow) {
                resize.call(this);
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
