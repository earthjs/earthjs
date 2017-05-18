// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
const eQuakeApp = () => {
    return {
        name: 'eQuakeApp',
        urls: [
            './d/world-110m.json',
            'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson',
        ],
        onReady(err, world, equake) {
            const features = equake.features.filter(d => d.properties.mag>3);
            this.worldCanvas.data({world});
            this.dotsCanvas.data({features});
            this.pingsPlugin.data({features});
        },
        onInit() {
            this.register(earthjs.plugins.commonPlugins());
            this.register(earthjs.plugins.pingsPlugin());
            this.register(earthjs.plugins.dotsCanvas());
            this.commonPlugins.addChecker('showPings:Pings:showPings'.split(':'));
            this.commonPlugins.addChecker('showDots:EQuake:showDots'.split(':'));
        }
    }
}
earthjs.plugins.eQuakeApp = eQuakeApp;
// countryNames
