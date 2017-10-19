export default function (worldUrl, worldImg) {
    if ( worldUrl === void 0 ) worldUrl='../d/world-110m.json';

    /*eslint no-console: 0 */
    var _ = {};

    function init() {
        var g = this
        .register(earthjs.plugins.worldJson(worldUrl))
        .register(earthjs.plugins.inertiaPlugin())
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
                var arr = g.canvasThreejs.selectedCountries().concat(country);
                g.canvasThreejs.selectedCountries(arr);
            } else {
                g.canvasThreejs.selectedCountries([country]);
            }
            g.canvasThreejs.refresh();
            // console.log(country);
        })
    }

    return {
        name: 'selectCountryMix2',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        region: function region(arr, centeroid) {
            var g = this;
            var reg = g.canvasThreejs.countries().filter(function (x){ return arr.indexOf(x.id)>-1; });
            g.canvasThreejs.selectedCountries(reg);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        },
        multiRegion: function multiRegion(mregion, centeroid) {
            var reg = [];
            var g = this;
            var loop = function () {
                var obj = list[i];

                var arr = g.canvasThreejs.countries().filter(function (x){
                    var bool = obj.countries.indexOf(x.id)>-1;
                    if (bool) { x.color = obj.color; }
                    return bool;
                });
                reg = reg.concat(arr);
            };

            for (var i = 0, list = mregion; i < list.length; i += 1) loop();
            g.canvasThreejs.selectedCountries(reg, true);
            g.autorotatePlugin.stop();
            if (centeroid) {
                g.centerCanvas.go(centeroid);
            }
        }
    }
}
