// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
const eQuakeApp = () => {
    const _ = {dataEQuake: null, style: {}};

    function svgAddEQuake() {
        this._.svg.selectAll('.e-queake').remove();
        if (_.dataEQuake && this._.options.showEQuake) {
            const proj = this._.proj;
            this._.eQuake = this._.svg.append("g").attr("class","e-queake").selectAll('circle')
                .data(_.dataEQuake.features).enter().append('circle')
                .attr('r', 2)
                .attr('stroke', '#F00')
                .style('opacity', 0.75);
            refresh.call(this);
            return this._.eQuake;
        }
    }

    function refresh() {
        if (this._.drag==null) {
            this._.eQuake.style("display", 'none');
        } else if (!this._.drag && this._.eQuake && this._.options.showEQuake) {
            const proj = this._.proj;
            const center = this._.proj.invert(this._.center);
            this._.eQuake
                .attr('cx', d => proj(d.geometry.coordinates)[0])
                .attr('cy', d => proj(d.geometry.coordinates)[1])
                .style("display", function(d) {
                    return d3.geoDistance(d.geometry.coordinates, center) > 1.57 ? 'none' : 'inline';
                });
        }
    }

    return {
        name: 'eQuakeApp',
        urls: ['https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'],
        onReady(err, dataEQuake) {
            const features = dataEQuake.features.filter(d => d.properties.mag>3);

            _.dataEQuake = {features};
            this.pingsPlugin.data({features});
        },
        onInit() {
            this.svgAddEQuake = svgAddEQuake;
            this._.options.showEQuake = true;
            this._.addRenderer('svgAddEQuake');

            this.register(earthjs.plugins.pingsPlugin());
            this.register(earthjs.plugins.commonPlugins('./d/world-110m.json'));
            this.commonPlugins.addChecker('showPings:Pings:showPings'.split(':'));
            this.commonPlugins.addChecker('showEQuake:EQuake:showEQuake'.split(':'));
        },
        onRefresh() {
            refresh.call(this);
        },
    }
}
earthjs.plugins.eQuakeApp = eQuakeApp;
