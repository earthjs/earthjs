// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
export default () => {
    /*eslint no-console: 0 */
    const _ = {svg:null, q: null};
    const $ = {};

    function init() {
        const __ = this._;
        __.options.showGlobeShading = true;
        __.options.showGlobeHilight = true;
        _.svg = __.svg;
    }

    function create() {
        svgAddGlobeShading.call(this);
        svgAddGlobeHilight.call(this);
    }

    function svgAddGlobeShading() {
        const __ = this._;
        _.svg.selectAll('#shading,.shading').remove();
        if (__.options.showGlobeShading) {
            const globe_shading = this.$slc.defs.append('radialGradient')
                  .attr('id', 'shading')
                  .attr('cx', '50%')
                  .attr('cy', '40%');
                globe_shading.append('stop')
                  .attr('offset','50%').attr('stop-color', '#9ab')
                  .attr('stop-opacity','0')
                globe_shading.append('stop')
                  .attr('offset','100%').attr('stop-color', '#3e6184')
                  .attr('stop-opacity','0.3')
            $.globeShading = _.svg.append('g').attr('class','shading').append('circle')
                .attr('cx', __.center[0]).attr('cy', __.center[1])
                .attr('r',  __.proj.scale())
                .attr('class','noclicks')
                .style('fill', 'url(#shading)');
        }
    }

    function svgAddGlobeHilight() {
        const __ = this._;
        _.svg.selectAll('#hilight,.hilight').remove();
        if (__.options.showGlobeHilight) {
            const globe_highlight = this.$slc.defs.append('radialGradient')
                  .attr('id', 'hilight')
                  .attr('cx', '75%')
                  .attr('cy', '25%');
                globe_highlight.append('stop')
                  .attr('offset', '5%').attr('stop-color', '#ffd')
                  .attr('stop-opacity','0.6');
                globe_highlight.append('stop')
                  .attr('offset', '100%').attr('stop-color', '#ba9')
                  .attr('stop-opacity','0.2');
            $.globeHilight = _.svg.append('g').attr('class','hilight').append('circle')
                .attr('cx', __.center[0]).attr('cy', __.center[1])
                .attr('r',  __.proj.scale())
                .attr('class','noclicks')
                .style('fill', 'url(#hilight)');
        }
    }

    function resize() {
        const __ = this._;
        const {options} = __;
        const scale = __.proj.scale();
        if ($.globeShading && options.showGlobeShading) {
            $.globeShading.attr('r', scale);
        }
        if ($.globeHilight && options.showGlobeHilight) {
            $.globeHilight.attr('r', scale);
        }
    }

    return {
        name: 'fauxGlobeSvg',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
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
        },
        $globeShading() {return $.globeShading;},
        $globeHilight() {return $.globeHilight;},
    }
}
