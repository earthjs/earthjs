// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
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

    function initMouseMoveHandler() {
        if (this.worldCanvas) {
            const {world} = this.worldCanvas.data();
            if (world) {
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
        const __ = this._;
        const mouseMoveHandler = function() {
            let event = d3.event;
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
                _.onCircleKeys.forEach(k => {
                    _.dot = _.onCircle[k].call(this, _.mouse, pos);
                });
            }
            if (__.options.showLand && _.countries && !_.dot) {
                _.country = _.countries.features.find(function(f) {
                    return f.geometry.coordinates.find(function(c1) {
                        return d3.polygonContains(c1, pos) || c1.find(function(c2) {
                            return d3.polygonContains(c2, pos)
                        })
                    })
                });
                _.onCountryKeys.forEach(k => {
                    _.onCountry[k].call(this, _.mouse, _.country);
                });
            }
        }
        __.svg.on("mousemove", mouseMoveHandler);
        if (this.versorDragPlugin) {
            this.versorDragPlugin.onDrag({
                hoverCanvas: mouseMoveHandler
            });
        }
    }

    return {
        name: 'hoverCanvas',
        onInit() {
            initMouseMoveHandler.call(this);
        },
        addSelectCircleEvent(obj) {
            Object.assign(_.onCircle, obj);
            _.onCircleKeys = Object.keys(_.onCircle);
        },
        addSelectCountryEvent(obj) {
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
