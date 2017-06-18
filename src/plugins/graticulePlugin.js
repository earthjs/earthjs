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
        if ($.graticule && this._.options.showGraticule) {
            $.graticule.attr("d", this._.path);
        }
    }

    return {
        name: 'graticulePlugin',
        onInit() {
            this.$.svgAddGraticule = svgAddGraticule;
            this._.options.showGraticule = true;
            _.svg = this._.svg;
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
