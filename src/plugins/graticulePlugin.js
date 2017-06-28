export default function() {
    const _ = {svg:null, q: null, graticule: d3.geoGraticule()}
    const $ = {};

    function svgAddGraticule() {
        _.svg.selectAll('.graticule').remove();
        if (this._.options.showGraticule) {
            $.graticule = _.svg.append("g").attr("class","graticule").append("path")
                .datum(_.graticule).attr("class", "noclicks");
            refresh.call(this);
        }
    }

    function refresh() {
        const __ = this._;
        if ($.graticule && __.options.showGraticule) {
            if (__.options.transparent || __.options.transparentGraticule) {
                __.proj.clipAngle(180);
                $.graticule.attr("d", this._.path);
                __.proj.clipAngle(90);
            } else {
                $.graticule.attr("d", this._.path);
            }
        }
    }

    return {
        name: 'graticulePlugin',
        onInit() {
            // this.$fn.svgAddGraticule = svgAddGraticule;
            this._.options.showGraticule = true;
            _.svg = this._.svg;
        },
        onCreate() {
            svgAddGraticule.call(this);
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
        }
    }
}
