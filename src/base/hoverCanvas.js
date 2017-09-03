// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    /*eslint no-console: 0 */
    const _ = {
        svg: null,
        mouse: null,
        country: null,
        ocountry: null,
        countries: null,
        hoverHandler: null,
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
        _.hoverHandler = function() {
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
                    if (_.ocountry!==_.country && _this.canvasThreejs) {
                        _.ocountry = _.country;
                        _this.canvasThreejs.refresh();
                    }
                }
                _.onCountryVals.forEach(v => {
                    if ( v.tooltips) {
                         v.call(this, event, _.country);
                    } else if (_.ocountry2!==_.country) {
                         v.call(this, event, _.country);
                    }
                });
                _.ocountry2 = _.country;
            }
        }
        _.svg.on('mousemove', _.hoverHandler);
        if (this.mousePlugin) {
            this.mousePlugin.onDrag({
                hoverCanvas: _.hoverHandler
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
        onInit(me) {
            _.me = me;
            _.svg = this._.svg;
            init.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.on('mousemove', null);
                _.svg = d3.selectAll(q);
                init.call(this);
            }
            return _.svg;
        },
        onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
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
        allData(all) {
            if (all) {
                _.world     = all.world;
                _.countries = all.countries;
            } else {
                const  {world, countries} = _;
                return {world, countries};
            }
        },
        states() {
            return {
                pos: _.pos,
                dot: _.dot,
                mouse: _.mouse,
                country: _.country,
            };
        },
        registerMouseDrag() {
            this.mousePlugin.onDrag({
                hoverCanvas: _.hoverHandler
            });
        },
    }
}
