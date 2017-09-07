export default () => {
    const _ = {
        svg:null,
        q: null,
        scale: 0, 
        oceanColor: [
            'rgba(221, 221, 255, 0.6)',
            'rgba(153, 170, 187,0.8)'
        ]};
    const $ = {};

    function init() {
        const __ = this._;
        this._.options.showOcean = true;
        Object.defineProperty(__.options, 'oceanColor', {
            get: () => _.oceanColor,
            set: (x) => {
                _.oceanColor = x;
            }
        });
        _.svg = __.svg;
    }

    function create() {
        _.svg.selectAll('#ocean,.ocean').remove();
        if (this._.options.showOcean) {
            let c = _.oceanColor;
            const ocean_fill = this.$slc.defs.append('radialGradient')
            .attr('id', 'ocean')
            .attr('cx', '75%')
            .attr('cy', '25%');
            if (typeof(c)==='string') {
                c = [c, c];
            }
            ocean_fill.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', c[1]);
            $.ocean = _.svg.append('g').attr('class','ocean').append('circle')
            .attr('cx',this._.center[0]).attr('cy', this._.center[1])
            .attr('class', 'noclicks');
            resize.call(this);
        }
    }

    function resize() {
        if ($.ocean && this._.options.showOcean) {
            $.ocean.attr('r', this._.proj.scale()+_.scale);
        }
    }

    return {
        name: 'oceanSvg',
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
        scale(sz) {
            if (sz) {
                _.scale = sz;
                resize.call(this);
            } else {
                return _.scale;
            }
        },
        recreate() {
            create.call(this);
        },
        $ocean() {return $.ocean;},
    }
}
