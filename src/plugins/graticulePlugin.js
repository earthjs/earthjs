export default function() {
    const datumGraticule = d3.geoGraticule();
    const _ = {svg:null, q: null}

    function svgAddGraticule() {
        _.svg.selectAll('.graticule').remove();
        if (this._.options.showGraticule) {
            this._.graticule = _.svg.append("g").attr("class","graticule").append("path")
                .datum(datumGraticule)
                .attr("class", "noclicks");
            refresh.call(this);
            return this._.graticule;
        }
    }

    function refresh() {
        if (this._.graticule && this._.options.showGraticule) {
            this._.graticule.attr("d", this._.path);
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
