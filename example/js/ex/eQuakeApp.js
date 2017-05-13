// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
var eQuakeApp = function() {
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
        name: 'eQuakeApp',
        urls: ['https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'],
        onReady(err, dataEQuake) {
            _.dataEQuake = dataEQuake;
        },
        onInit() {
            this.svgAddEQuake = svgAddEQuake;
            this._.options.showEQueake = true;
            this._.addRenderer('svgAddEQuake');
            _.center = [this._.options.width / 2, this._.options.height/2];

            this.register(earthjs.plugins.commonPlugins('./d/world-110m.json'));
            this.commonPlugins.addChecker('showEQueake:EQueake:showEQueake'.split(':'));
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
earthjs.plugins.eQuakeApp = eQuakeApp;
// export default eq
