// Derek Watkins’s Block http://bl.ocks.org/dwtkns/4686432
export default function () {
    /*eslint no-console: 0 */
    var _ = {svg:null, q: null};
    var $ = {};

    function init() {
        var __ = this._;
        __.options.showGlobeShading = true;
        __.options.showGlobeHilight = true;
        _.svg = __.svg;
    }

    function create() {
        svgAddGlobeShading.call(this);
        svgAddGlobeHilight.call(this);
    }

    function svgAddGlobeShading() {
        var __ = this._;
        var klas = _.me.name;
        _.svg.selectAll(("#shading,.shading." + klas)).remove();
        if (__.options.showGlobeShading) {
            var globe_shading = this.$slc.defs.append('radialGradient')
                  .attr('id', 'shading')
                  .attr('cx', '50%')
                  .attr('cy', '40%');
                globe_shading.append('stop')
                  .attr('offset','50%').attr('stop-color', '#9ab')
                  .attr('stop-opacity','0')
                globe_shading.append('stop')
                  .attr('offset','100%').attr('stop-color', '#3e6184')
                  .attr('stop-opacity','0.3')
            $.globeShading = _.svg.append('g').attr('class',("shading " + klas)).append('circle')
                .attr('cx', __.center[0]).attr('cy', __.center[1])
                .attr('r',  __.proj.scale())
                .attr('class','noclicks')
                .style('fill', 'url(#shading)');
        }
    }

    function svgAddGlobeHilight() {
        var __ = this._;
        var klas = _.me.name;
        _.svg.selectAll(("#hilight,.hilight." + klas)).remove();
        if (__.options.showGlobeHilight) {
            var globe_highlight = this.$slc.defs.append('radialGradient')
                  .attr('id', 'hilight')
                  .attr('cx', '75%')
                  .attr('cy', '25%');
                globe_highlight.append('stop')
                  .attr('offset', '5%').attr('stop-color', '#ffd')
                  .attr('stop-opacity','0.6');
                globe_highlight.append('stop')
                  .attr('offset', '100%').attr('stop-color', '#ba9')
                  .attr('stop-opacity','0.2');
            $.globeHilight = _.svg.append('g').attr('class',("hilight " + klas)).append('circle')
                .attr('cx', __.center[0]).attr('cy', __.center[1])
                .attr('r',  __.proj.scale())
                .attr('class','noclicks')
                .style('fill', 'url(#hilight)');
        }
    }

    function resize() {
        var __ = this._;
        var options = __.options;
        var scale = __.proj.scale();
        if ($.globeShading && options.showGlobeShading) {
            $.globeShading.attr('r', scale);
        }
        if ($.globeHilight && options.showGlobeHilight) {
            $.globeHilight.attr('r', scale);
        }
    }

    return {
        name: 'fauxGlobeSvg',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onResize: function onResize() {
            resize.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $globeShading: function $globeShading() {return $.globeShading;},
        $globeHilight: function $globeHilight() {return $.globeHilight;},
    }
}
