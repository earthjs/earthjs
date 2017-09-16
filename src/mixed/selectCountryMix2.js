export default (worldUrl='../d/world-110m.json', worldImg) => {
    /*eslint no-console: 0 */
    const _ = {};

    function init() {
        const g = this
        .register(earthjs.plugins.worldJson(worldUrl))
        .register(earthjs.plugins.mousePlugin())
        .register(earthjs.plugins.hoverCanvas())
        .register(earthjs.plugins.clickCanvas())
        .register(earthjs.plugins.centerCanvas())
        .register(earthjs.plugins.countryCanvas())
        .register(earthjs.plugins.threejsPlugin())
        .register(earthjs.plugins.autorotatePlugin());
        if (worldImg) {
            g.register(earthjs.plugins.imageThreejs(worldImg));
        }
        g.register(earthjs.plugins.canvasThreejs());
        g._.options.showSelectedCountry = true;
        g._.options.showBorder = false;
        g.canvasThreejs.style({countries: 'rgba(220,91,52,0.5)'});
        g.centerCanvas.focused(function(event, country) {
            g.autorotatePlugin.stop();
            if (event.metaKey) {
                const arr = g.canvasThreejs.selectedCountries().concat(country);
                g.canvasThreejs.selectedCountries(arr);
            } else {
                g.canvasThreejs.selectedCountries([country]);
            }
            g.canvasThreejs.refresh();
            console.log(country);
        })
    }

    return {
        name: 'selectCountryMix2',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        region(arr, centeroid) {
            const g = this;
            const reg = g.canvasThreejs.countries().filter(x=>arr.indexOf(x.id)>-1);
            g.canvasThreejs.selectedCountries(reg);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        },
        multiRegion(mregion, centeroid) {
            let reg = [];
            const g = this;
            for (var obj of mregion) {
                const arr = g.canvasThreejs.countries().filter(x=>{
                    const bool = obj.countries.indexOf(x.id)>-1;
                    if (bool) x.color = obj.color;
                    return bool;
                });
                reg = reg.concat(arr);
            }
            g.canvasThreejs.selectedCountries(reg, true);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        }
    }
}
