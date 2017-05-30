export default urlBars => {
    /*eslint no-console: 0 */
    const _ = {svg:null, barProjection: null, q: null, bars: null};

    function svgAddBar() {
        _.svg.selectAll('.bar').remove();
        if (_.bars && this._.options.showBars) {
            const gBar = _.svg.append("g").attr("class","bar");
            const mask = gBar.append("mask")
                .attr("id", "edge");
            mask.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "white");
            mask.append("use")
                .attr("xlink:href", "#edgeCircle")
                .attr("fill", "black");
            this._.mask = mask;

            _.max = d3.max(_.bars.features, d => parseInt(d.properties.mag))

            const scale = this._.proj.scale();
            _.lengthScale = d3.scaleLinear()
                .domain([0, _.max])
                .range([scale, scale+50])

            this._.bar = gBar.selectAll("line").data(_.bars.features).enter().append("line")
                .attr("stroke", "red")
                .attr("stroke-width", "2")
                .attr("data-index", (d, i) => i);
            // render to correct position
            refresh.call(this);
            return this._.bar;
        }
    }

    function refresh() {
        if (_.bars && this._.options.showBars) {
            const proj1 = this._.proj;
            const scale = _.lengthScale;
            const proj2 = _.barProjection;
            const center = proj1.invert(this._.center);
            this._.bar
                .each(function(d) {
                    const arr = d.geometry.coordinates;
                    proj2.scale(scale(d.properties.mag));
                    const distance = d3.geoDistance(arr, center);
                    const d1 = proj1(arr);
                    const d2 = proj2(arr);
                    d3.select(this)
                        .attr('x1', d1[0])
                        .attr('y1', d1[1])
                        .attr('x2', d2[0])
                        .attr('y2', d2[1])
                        .attr('mask', distance < 1.57 ? null : 'url(#edge)');
                });
        }
    }

    function svgClipPath() {
        // mask creation
        this._.defs.selectAll('clipPath').remove();
        this._.defs.append("clipPath").append("circle")
            .attr("id", "edgeCircle")
            .attr("cx", this._.options.width / 2)
            .attr("cy", this._.options.height / 2)
            .attr("r",  this._.proj.scale());
    }

    return {
        name: 'barPlugin',
        urls: urlBars && [urlBars],
        onReady(err, bars) {
            _.bars = bars;
            setTimeout(() => refresh.call(this),1);
        },
        onInit() {
            this.$.svgAddBar = svgAddBar;
            this.$.svgClipPath = svgClipPath;
            this._.options.showBars = true;
            _.barProjection = this._.orthoGraphic();
            _.svg = this._.svg;
            svgClipPath.call(this);
        },
        onResize() {
            svgClipPath.call(this);
            svgAddBar.call(this);
        },
        onRefresh() {
            _.barProjection.rotate(this._.proj.rotate());
            refresh.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg = d3.selectAll(q);
            }
            return _.svg;
        },
        data(data) {
            if (data) {
                _.bars = data;
            } else {
                return _.bars;
            }
        },
    }
}
