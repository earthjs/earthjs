// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    /*eslint no-console: 0 */
    const _ = {
        mouse: null,
        country: null,
        ocountry: null,
        countries: null,
        onCircle: {},
        onCircleVals: [],
        onCountry: {},
        onCountryVals: []
    }

    function init() {
        this._.options.showSelectedCountry = false;
        if (this.worldCanvas) {
            const world = this.worldCanvas.data();
            if (world) {
                _.world = world;
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        const __ = this._;
        const _this = this;
        const mouseMoveHandler = function() {
            let event = d3.event;
            if (__.drag || !event) {
                return;
            }
            if (event.sourceEvent) {
                event = event.sourceEvent;
            }
            const mouse = [event.clientX, event.clientY]; //d3.mouse(this);
            const pos = __.proj.invert(d3.mouse(this));
            _.pos = pos;
            _.dot = null;
            _.mouse = mouse;
            _.country = null;
            if (__.options.showDots) {
                _.onCircleVals.forEach(v => {
                    _.dot = v.call(this, event, pos);
                });
            }
            if (__.options.showLand && _.countries && !_.dot) {
                if (!__.drag) {
                    if (_this.countryCanvas) {
                        _.country = _this.countryCanvas.detectCountry(pos);
                    } else {
                        _.country = findCountry(pos);
                    }
                    if (_.country && _.ocountry!==_.country && _this.canvasThreejs) {
                        _this.canvasThreejs.refresh();
                        _.ocountry= _.country;
                    }
                }
                _.onCountryVals.forEach(v => {
                    v.call(this, event, _.country);
                });
            }
        }
        __.svg.on('mousemove', mouseMoveHandler);
        if (this.mousePlugin) {
            this.mousePlugin.onDrag({
                hoverCanvas: mouseMoveHandler
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
        name: 'hoverCanvas',
        onInit() {
            init.call(this);
        },
        onCreate() {
            if (this.worldJson && !_.world) {
                this.hoverCanvas.data(this.worldJson.data());
            }
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
        country() {
            return _.country;
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
