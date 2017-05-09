export default function(urlBars) {
    var _ = {svg:null, proj: null, select: null, bars: null};

    function svgAddBar() {
        _.svg.selectAll('.bar').remove();
        if (_.bars && this._.options.showBars) {
            var gBar = _.svg.append("g").attr("class","bar");
            var mask = gBar.append("mask")
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

            _.max = d3.max(_.bars, function(d) {
              return parseInt(d.Value);
            })

            _.lengthScale = d3.scaleLinear()
                .domain([0, _.max])
                .range([200, 250])

            this._.bar = gBar.selectAll(".bar").data(_.bars).enter().append("line")
                .attr("stroke", "red")
                .attr("stroke-width", "2");
            return this._.bar;
        }
    }

    function refresh() {
        if (_.bars && this._.options.showBars) {
            var proj= this._.proj;
            var centerPos = proj.invert([this._.options.width / 2, this._.options.height/2]);
            this._.bar
                .attr("x1", function(d) {return proj([d.Longitude, d.Latitude])[0]})
                .attr("y1", function(d) {return proj([d.Longitude, d.Latitude])[1]})
                .attr("x2", function(d) {
                    _.barProjection.scale(_.lengthScale(d.Value));
                    return _.barProjection([d.Longitude, d.Latitude])[0];
                })
                .attr("y2", function(d) {
                    _.barProjection.scale(_.lengthScale(d.Value));
                    return _.barProjection([d.Longitude, d.Latitude])[1];
                })
                .attr("mask", function (d) {
                    var gDistance = d3.geoDistance([d.Longitude, d.Latitude], centerPos);
                    return gDistance < 1.57 ? null : "url(#edge)";
                });
        }
    }

    return {
        name: 'barPlugin',
        urls: urlBars && [urlBars],
        onReady(err, bars) {
            _.bars = bars;
            svgAddBar.call(this);
            refresh.call(this);
        },
        onInit() {
            this.svgAddBar = svgAddBar;
            this._.options.showBars = true;
            _.barProjection = this._.orthoGraphic();
            _.svg = this._.svg;
            // mask creation
            _.center = this._.proj.translate(); // get the center of the circle
            _.edge = this._.proj([-90, 90]); // edge point
            _.r = Math.pow(Math.pow(_.center[0] - _.edge[0], 2) + Math.pow(_.center[1] - _.edge[1], 2), 0.5); // radius
            this._.defs.append("clipPath").append("circle")
                .attr("id", "edgeCircle")
                .attr("cx", _.center[0])
                .attr("cy", _.center[1])
                .attr("r",  _.r);
        },
        onRefresh() {
            _.barProjection.rotate(this._.proj.rotate());
            refresh.call(this);
        },
        select(slc) {
            _.svg = d3.selectAll(slc);
            _.select = slc;
            return _.svg;
        },
        data(p) {
            if (p) {
                var data = p.barPlugin.data()
                _.bars = data.bars;
            } else {
                return {bars: _.bars}
            }
        },
    }
}
