// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
const eQuakeApp = () => {
    return {
        name: 'eQuakeApp',
        urls: [
            './d/world-110m.json',
            './d/world-110m-country-names.tsv',
            'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson',
        ],
        onReady(err, world, countryNames, equake) {
            const features = equake.features.filter(d => d.properties.mag>=3);
            const maxMag = features.map(d => d.properties.mag).sort(d3.descending)[0];
            const scale = d3.scaleLinear().domain([3, maxMag]).range([0.5, 2]);
            features.forEach(d => {
                d.geometry.value = d.properties.mag;
                d.geometry.radius = scale(d.properties.mag);
            });
            const dataMssg = {
                features,
                geometry: {
                    radius: 1,
                    lineWidth: 0.5,
                    fillStyle: 'rgba(100,0,0,.4)',
                    strokeStyle: 'rgba(100,0,0,.6)'
                }
            }
            this.worldCanvas.data({world, countryNames});
            this.countrySelectCanvas.world(world);
            this.barPlugin.data(dataMssg);
            this.dotsCanvas.data(dataMssg);
            this.pingsCanvas.data(dataMssg);
        },
        onInit() {
            this.register(earthjs.plugins.commonPlugins());
            this.register(earthjs.plugins.pingsCanvas());
            this.register(earthjs.plugins.dotsCanvas());
            this.register(earthjs.plugins.barPlugin());
            this.register(earthjs.plugins.barTooltipPlugin());
            this.register(earthjs.plugins.countrySelectCanvas());
            this.register(earthjs.plugins.countryTooltipCanvas());
            this.commonPlugins.addChecker('showPings:Pings:showPings'.split(':'));
            this.commonPlugins.addChecker('showBars:Bars:showBars'.split(':'));
            this.commonPlugins.addChecker('showDots:Dots:showDots'.split(':'));
            const tt = this.barTooltipPlugin;
            this.barTooltipPlugin.onShow = function(d) {
                const {mag, tsunami, eventtime, place, detail} = d.properties;
                if (!eventtime) {
                    d3.json(detail, function(error, data) {
                        const {eventtime} = data.properties.products.origin[0].properties;
                        d.properties.eventtime = eventtime;
                        tt.show({properties: {mag,tsunami,eventtime,place}});
                    });
                }
                return {properties: {mag,tsunami,eventtime,place}};
            }
            this._.options.transparent = true;
        }
    }
}
earthjs.plugins.eQuakeApp = eQuakeApp;
