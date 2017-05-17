// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
const eQuakeApp = () => {
    return {
        name: 'eQuakeApp',
        urls: ['https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'],
        onReady(err, dataJson) {
            const features = dataJson.features.filter(d => d.properties.mag>3);

            this.dotsCanvas.data({features});
            this.pingsPlugin.data({features});
        },
        onInit() {
            this.register(earthjs.plugins.pingsPlugin());
            this.register(earthjs.plugins.commonPlugins('./d/world-110m.json'));
            this.register(earthjs.plugins.dotsCanvas());
            this.commonPlugins.addChecker('showPings:Pings:showPings'.split(':'));
            this.commonPlugins.addChecker('showDots:EQuake:showDots'.split(':'));
        }
    }
}
earthjs.plugins.eQuakeApp = eQuakeApp;
