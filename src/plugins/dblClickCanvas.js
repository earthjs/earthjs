// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    /*eslint no-console: 0 */
    const _ = {
        mouse: null,
        country: null,
        countries: null,
        onCircle: {},
        onCircleVals: [],
        onCountry: {},
        onCountryVals: []
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

    function initmouseClickHandler() {
        if (this.worldCanvas) {
            const world = this.worldCanvas.data();
            if (world) {
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        const __ = this._;
        const _this = this;
        const mouseDblClickHandler = function(event, mouse) {
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
                _.onCircleVals.forEach(v => {
                    _.dot = v.call(this, event, pos);
                });
            }
            if (__.options.showLand && !_.dot) {
                if (!__.drag) {
                    if (_this.countryCanvas) {
                        _.country = _this.countryCanvas.detectCountry(pos);
                    } else {
                        _.country = findCountry(pos);
                    }
                }
                _.onCountryVals.forEach(v => {
                    v.call(this, event, _.country);
                });
            }
        }
        if (this.mousePlugin) {
            this.mousePlugin.onDblClick({
                dblClickCanvas: mouseDblClickHandler
            });
        }
    }

    return {
        name: 'dblClickCanvas',
        onInit() {
            initmouseClickHandler.call(this);
        },
        onCircle(obj) {
            Object.assign(_.onCircle, obj);
            _.onCircleVals = Object.keys(_.onCircle).map(k => _.onCircle[k]);
        },
        onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryVals = Object.keys(_.onCountry).map(k => _.onCountry[k]);
        },
        data(data) {
            if (data) {
                _.world = data;
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return _.world;
            }
        },
        state() {
            return {
                pos: _.pos,
                dot: _.dot,
                mouse: _.mouse,
                country: _.country,
            };
        },
    }
}
