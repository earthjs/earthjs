// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    /*eslint no-console: 0 */
    const _ = {
        mouse: null,
        country: null,
        countries: null,
        onCircle: {},
        onCircleKeys: [],
        onCountry: {},
        onCountryKeys: []
    }

    function init() {
        if (this.worldCanvas) {
            const {world} = this.worldCanvas.data();
            if (world) {
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        const __ = this._;
        const mouseClickHandler = function(event, mouse) {
            if (!event) {
                return;
            }
            if (event.sourceEvent) {
                event = event.sourceEvent;
            }
            const xmouse = [event.clientX, event.clientY];
            const pos = __.proj.invert(mouse);
            _.pos = pos;
            _.dot = null;
            _.mouse = xmouse;
            _.country = null;
            if (__.options.showDots) {
                _.onCircleKeys.forEach(k => {
                    _.dot = _.onCircle[k].call(this, _.mouse, pos);
                });
            }
            if (__.options.showLand && !_.dot) {
                if (!__.drag) {
                    _.country = findCountry(pos);
                }
                _.onCountryKeys.forEach(k => {
                    _.onCountry[k].call(this, _.mouse, _.country);
                });
            }
        }
        if (this.mousePlugin) {
            this.mousePlugin.onClick({
                clickCanvas: mouseClickHandler
            });
        }
    }

    function findCountry(pos) {
        return _.countries.features.find(function(f) {
            return f.geometry.coordinates.find(function(c1) {
                return d3.polygonContains(c1, pos) || c1.find(function(c2) {
                    return d3.polygonContains(c2, pos)
                })
            })
        });
    }

    return {
        name: 'clickCanvas',
        onInit() {
            init.call(this);
        },
        onCircle(obj) {
            Object.assign(_.onCircle, obj);
            _.onCircleKeys = Object.keys(_.onCircle);
        },
        onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryKeys = Object.keys(_.onCountry);
        },
        world(w) {
            _.countries = topojson.feature(w, w.objects.countries);
        },
        data() {
            return {
                pos: _.pos,
                dot: _.dot,
                mouse: _.mouse,
                country: _.country,
            };
        },
    }
}
