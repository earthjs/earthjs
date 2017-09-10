export default function (worldUrl) {
    if ( worldUrl === void 0 ) worldUrl='../d/world-110m.json';

    /*eslint no-console: 0 */
    var _ = {};

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
                var arr = g.worldCanvas.selectedCountries().concat(country);
                g.worldCanvas.selectedCountries(arr);
            } else {
                g.worldCanvas.selectedCountries([country]);
            }
            console.log(country);
        })
        g.clickCanvas.onCountry({
            autorotate: function autorotate(event, country) {
                if (!country) {
                    g.worldCanvas.style({});
                    // g.autorotatePlugin.start();
                    g.worldCanvas.selectedCountries([]);
                }
            }
        })
    }

    return {
        name: 'selectCountryMix',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        region: function region(arr, centeroid) {
            var g = this;
            var reg = g.worldCanvas.countries().filter(function (x){ return arr.indexOf(x.id)>-1; });
            g.worldCanvas.style({selected: 'rgba(255, 235, 0, 0.4)'});
            g.worldCanvas.selectedCountries(reg);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        },
        multiRegion: function multiRegion(mregion, centeroid) {
            var reg = [];
            var g = this;
            for (var i = 0, list = mregion; i < list.length; i += 1) {
                var obj = list[i];

                var arr = g.worldCanvas.countries().filter(function (x){
                    var bool = obj.countries.indexOf(x.id)>-1;
                    if (bool) { x.color = obj.color; }
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
