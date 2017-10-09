export default () => {
    const _ = {svg:null, q: null, graticule: d3.geoGraticule()}
    const $ = {};

    function init() {
        const __ = this._;
        __.options.showGraticule = true;
        __.options.transparentGraticule = false;
        _.svg = __.svg;
    }

    function create() {
        const klas = _.me.name;
        _.svg.selectAll(`.graticule.${klas}`).remove();
        if (this._.options.showGraticule) {
            $.graticule = _.svg.append('g').attr('class', `graticule ${klas}`)
                .append('path').datum(_.graticule).attr('class', 'noclicks');
            refresh.call(this);
        }
    }

    function refresh() {
        const __ = this._;
        if ($.graticule && __.options.showGraticule) {
            if (__.options.transparent || __.options.transparentGraticule) {
                __.proj.clipAngle(180);
                $.graticule.attr('d', this._.path);
                __.proj.clipAngle(90);
            } else {
                $.graticule.attr('d', this._.path);
            }
        }
    }

    return {
        name: 'graticuleSvg',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        $graticule() {return $.graticule;},
    }
}
