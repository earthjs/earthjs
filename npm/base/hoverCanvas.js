// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function () {
    /*eslint no-console: 0 */
    var _ = {
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
            var world = this.worldCanvas.data();
            if (world) {
                _.world = world;
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        var __ = this._;
        var _this = this;
        _.hoverHandler = function() {
            var this$1 = this;

            var event = d3.event;
            if (__.drag || !event) {
                return;
            }
            if (event.sourceEvent) {
                event = event.sourceEvent;
            }
            var mouse = [event.clientX, event.clientY]; //d3.mouse(this);
            var pos = __.proj.invert(d3.mouse(this));
            _.pos = pos;
            _.dot = null;
            _.mouse = mouse;
            _.country = null;
            if (__.options.showDots) {
                _.onCircleVals.forEach(function (v) {
                    _.dot = v.call(this$1, event, pos);
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
                _.onCountryVals.forEach(function (v) {
                    if ( v.tooltips) {
                         v.call(this$1, event, _.country);
                    } else if (_.ocountry2!==_.country) {
                         v.call(this$1, event, _.country);
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
        onInit: function onInit(me) {
            _.me = me;
            _.svg = this._.svg;
            init.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.svg.on('mousemove', null);
                _.svg = d3.selectAll(q);
                init.call(this);
            }
            return _.svg;
        },
        onCreate: function onCreate() {
            if (this.worldJson && !_.world) {
                _.me.allData(this.worldJson.allData());
            }
        },
        onCircle: function onCircle(obj) {
            Object.assign(_.onCircle, obj);
            _.onCircleVals = Object.keys(_.onCircle).map(function (k) { return _.onCircle[k]; });
        },
        onCountry: function onCountry(obj) {
            Object.assign(_.onCountry, obj);
            _.onCountryVals = Object.keys(_.onCountry).map(function (k) { return _.onCountry[k]; });
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.countries = topojson.feature(data$1, data$1.objects.countries);
            } else {
                return _.world;
            }
        },
        allData: function allData(all) {
            if (all) {
                _.world     = all.world;
                _.countries = all.countries;
            } else {
                var world = _.world;
                var countries = _.countries;
                return {world: world, countries: countries};
            }
        },
        states: function states() {
            return {
                pos: _.pos,
                dot: _.dot,
                mouse: _.mouse,
                country: _.country,
            };
        },
        registerMouseDrag: function registerMouseDrag() {
            this.mousePlugin.onDrag({
                hoverCanvas: _.hoverHandler
            });
        },
    }
}
