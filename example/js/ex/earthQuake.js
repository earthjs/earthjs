// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
var eq = function() {
    var _ = {dataEQuake: null, center: null, style: {}};

    function svgAddEQuake() {
        this._.svg.selectAll('.e-queake').remove();
        if (_.dataEQuake && this._.options.showEQueake) {
            var centerPos = this._.proj.invert(_.center);
            var proj = this._.proj;
            this._.eQuake = this._.svg.append("g").attr("class","e-queake").selectAll('circle')
                .data(_.dataEQuake.features).enter().append('circle')
                .attr('r', function(d)  {return d.properties.mag;})
                .attr('cx', function(d) {return proj(d.geometry.coordinates)[0];})
                .attr('cy', function(d) {return proj(d.geometry.coordinates)[1];})
                .attr('class', function(d) {
                    return d.properties.mag>5 ? 'eq-pulsed' : 'normal'
                })
                .style('fill', 'magenta')
                .style('opacity', 0.75)
                .style("display", function(d) {
                    return d3.geoDistance(d.geometry.coordinates, centerPos) > 1.57 ? 'none' : 'inline';
                });
            return this._.eQuake;
        }
    }

    return {
        name: 'earthQuake',
        urls: ['https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'],
        onReady(err, dataEQuake) {
            _.dataEQuake = dataEQuake;
        },
        onInit() {
            this.svgAddEQuake = svgAddEQuake;
            this._.options.showEQueake = true;
            this._.addRenderer('svgAddEQuake');
            _.center = [this._.options.width / 2, this._.options.height/2];
        },
        onRefresh() {
            if (this._.eQuake && this._.options.showEQueake) {
                var centerPos = this._.proj.invert(_.center);
                var proj = this._.proj;
                this._.eQuake
                    .attr('cx', function(d) {return proj(d.geometry.coordinates)[0];})
                    .attr('cy', function(d) {return proj(d.geometry.coordinates)[1];})
                    .style("display", function(d) {
                        return d3.geoDistance(d.geometry.coordinates, centerPos) > 1.57 ? 'none' : 'inline';
                    });
            }
        },
    }
}

// export default eq

var p = earthjs({width: 700, height: 500});
p.register(earthjs.plugins.autorotatePlugin(10));
p.register(earthjs.plugins.versorDragPlugin());
p.register(earthjs.plugins.oceanPlugin());
p.register(earthjs.plugins.canvasPlugin());
p.register(earthjs.plugins.graticuleCanvas());
p.register(earthjs.plugins.worldCanvas('./d/world-110m.json'));
p.register(eq());

p.canvasPlugin.selectAll('.canvas');
p.ready(function(){
    p.svgDraw();
})
