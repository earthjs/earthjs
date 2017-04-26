export default function(initOptions={}) {
    var datumGraticule = d3.geoGraticule();
    var _ = {svg:null, select: null}

    function svgAddGraticule() {
        _.svg.selectAll('.graticule').remove();
        if (this._.options.showGraticule) {
            this._.graticule = _.svg.append("g").attr("class","graticule").append("path")
                .datum(datumGraticule)
                .attr("class", "noclicks")
                .attr("d", this._.path);
            return this._.graticule;
        }
    }

    initOptions = Object.assign({
        showGraticule: true,
    }, initOptions);

    return {
        name: 'graticulePlugin',
        onInit() {
            Object.assign(this._.options, initOptions);
            this.svgAddGraticule = svgAddGraticule;
            _.svg = this._.svg;
        },
        onRefresh() {
            if (this._.graticule && this._.options.showGraticule) {
                this._.graticule.attr("d", this._.path);
            }
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        }
    }
}
