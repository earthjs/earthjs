export default () => {
    const _ = {svg:null, q: null, sphereColor: 0};

    function create() {
        _.svg.selectAll('#glow,.sphere').remove();
        if (this._.options.showSphere) {
            this.$slc.defs.nodes()[0].append(`
<filter id="glow">
    <feColorMatrix type="matrix"
        values=
        "0 0 0 0   0
         0 0 0 0.9 0
         0 0 0 0.9 0
         0 0 0 1   0"/>
    <feGaussianBlur stdDeviation="5.5" result="coloredBlur"/>
    <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
</filter>
`);
            _.sphere = _.svg.append("g").attr("class","sphere").append("circle")
            .attr("cx",this._.center[0]).attr("cy", this._.center[1])
            .attr("class", "noclicks").attr("filter", "url(#glow)");
            resize.call(this);
        }
    }

    function resize() {
        _.sphere.attr("r", this._.proj.scale());
    }

    return {
        name: 'sphereSvg',
        onInit() {
            this._.options.showSphere = true;
            _.svg = this._.svg;
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
    }
}
