// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    /*eslint no-console: 0 */
    const _ = {countries: null, country: null, mouse: null, onHover: {}, onHoverKeys: []};

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

    return {
        name: 'countrySelectCanvas',
        onInit() {
            const __ = this._;
            const worldCanvas = this.worldCanvas;
            const {world} = worldCanvas.data();
            if (world) {
                _.countries = topojson.feature(world, world.objects.countries);
            }
            const mouseMoveHandler = function() {
                let event = d3.event;
                if (event.sourceEvent) {
                    event = event.sourceEvent;
                }
                const mouse = [event.clientX, event.clientY]; //d3.mouse(this);
                const pos = __.proj.invert(d3.mouse(this));
                _.country = _.countries.features.find(function(f) {
                    return f.geometry.coordinates.find(function(c1) {
                        return polygonContains(c1, pos) || c1.find(function(c2) {
                            return polygonContains(c2, pos)
                        })
                    })
                });
                _.mouse = mouse;
                _.onHoverKeys.forEach(k => {
                    _.onHover[k].call(this, _.mouse, _.country);
                });

            }
            __.svg.on("mousemove", mouseMoveHandler);
            if (this.versorMousePlugin) {
                this.versorMousePlugin.onDrag({
                    countrySelectCanvas: mouseMoveHandler
                });
            }
        },
        data() {
            return {
                country: _.country,
                mouse: _.mouse
            };
        },
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverKeys = Object.keys(_.onHover);
        },
        world(w) {
            _.countries = topojson.feature(w, w.objects.countries);
        }
    }
}
