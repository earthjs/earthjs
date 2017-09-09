export default (worldUrl='../d/world-110m.json') => {
    /*eslint no-console: 0 */
    const _ = {};

    function init() {
        var g = this
        .register(earthjs.plugins.mousePlugin())
        .register(earthjs.plugins.hoverCanvas())
        .register(earthjs.plugins.clickCanvas())
        .register(earthjs.plugins.centerCanvas())
        .register(earthjs.plugins.canvasPlugin())
        .register(earthjs.plugins.countryCanvas())
        .register(earthjs.plugins.autorotatePlugin())
        .register(earthjs.plugins.worldCanvas(worldUrl))
        .register(earthjs.plugins.threejsPlugin());
        g.canvasPlugin.selectAll('.ej-canvas');
        g._.options.showSelectedCountry = true;
        g._.options.showBorder = true;
        g.worldCanvas.ready = function(err, json) {
            g.countryCanvas.data(json);
            g.worldCanvas.data(json);
            g.hoverCanvas.data(json);
            g.clickCanvas.data(json);
        };
        g.centerCanvas.focused(function(event, country) {
            g.autorotatePlugin.stop();
            g.worldCanvas.style({});
            if (event.metaKey) {
                const arr = g.worldCanvas.selectedCountries().concat(country);
                g.worldCanvas.selectedCountries(arr);
            } else {
                g.worldCanvas.selectedCountries([country]);
            }
            console.log(country);
        })
        g.clickCanvas.onCountry({
            autorotate(event, country) {
                if (!country) {
                    g.worldCanvas.style({});
                    g.autorotatePlugin.start();
                    g.worldCanvas.selectedCountries([]);
                }
            }
        })
    }

    return {
        name: 'selectCountryMix',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        region(arr, centeroid) {
            const g = this;
            const reg = g.worldCanvas.countries().filter(x=>arr.indexOf(x.id)>-1);
            g.worldCanvas.style({selected: 'rgba(255, 235, 0, 0.4)'});
            g.worldCanvas.selectedCountries(reg);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        }
    }
}
