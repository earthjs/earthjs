export default (worldUrl='../d/world-110m.json') => {
    /*eslint no-console: 0 */
    const _ = {};

    function init() {
        const g = this
        .register(earthjs.plugins.inertiaPlugin())
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
        g._.options.showBorder = false;
        g.worldCanvas.style({countries: 'rgba(220,91,52,0.2)'});
        g.worldCanvas.ready = function(err, json) {
            g.countryCanvas.data(json);
            g.worldCanvas.data(json);
            g.hoverCanvas.data(json);
            g.clickCanvas.data(json);
        };
        g.centerCanvas.focused(function(event, country) {
            g.autorotatePlugin.stop();
            if (event.metaKey) {
                const arr = g.worldCanvas.selectedCountries().concat(country);
                g.worldCanvas.selectedCountries(arr);
            } else {
                g.worldCanvas.selectedCountries([country]);
            }
            console.log(country);
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
            g.worldCanvas.selectedCountries(reg);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        },
        multiRegion(mregion, centeroid) {
            let reg = [];
            const g = this;
            for (let obj of mregion) {
                const arr = g.worldCanvas.countries().filter(x=>{
                    const bool = obj.countries.indexOf(x.id)>-1;
                    if (bool) x.color = obj.color;
                    return bool;
                });
                reg = reg.concat(arr);
            }
            g.worldCanvas.selectedCountries(reg, true);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        }
    }
}
