// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    /*eslint no-console: 0 */
    const _ = {
        mouse: null,
        country: null,
        countries: null,
        addSelectCircleEvent: {},
        addSelectCircleEventKeys: [],
        addSelectCountryEvent: {},
        addSelectCountryEventKeys: []
    }

    // https://github.com/d3/d3-polygon
    function polygonContains(polygon, point) {
        var n = polygon.length
        var p = polygon[n - 1]
        var x = point[0], y = point[1]
        var x0 = p[0], y0 = p[1]
        var x1, y1
        var inside = false
        for (var i = 0; i < n; ++i) {
            p = polygon[i], x1 = p[0], y1 = p[1]
            if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
            x0 = x1, y0 = y1
        }
        return inside
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
                _.addSelectCircleEventKeys.forEach(k => {
                    _.dot = _.addSelectCircleEvent[k].call(this, _.mouse, pos);
                });
            }
            if (__options.showLand && _.countries && !_.dot) {
                _.country = _.countries.features.find(function(f) {
                    return f.geometry.coordinates.find(function(c1) {
                        return polygonContains(c1, pos) || c1.find(function(c2) {
                            return polygonContains(c2, pos)
                        })
                    })
                });
                _.addSelectCountryEventKeys.forEach(k => {
                    _.addSelectCountryEvent[k].call(this, _.mouse, _.country);
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
            Object.assign(_.addSelectCircleEvent, obj);
            _.addSelectCircleEventKeys = Object.keys(_.addSelectCircleEvent);
        },
        addSelectCountryEvent(obj) {
            Object.assign(_.addSelectCountryEvent, obj);
            _.addSelectCountryEventKeys = Object.keys(_.addSelectCountryEvent);
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
