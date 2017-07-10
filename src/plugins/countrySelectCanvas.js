// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function() {
    /*eslint no-console: 0 */
    const _ = {countries: null, country: null, mouse: null, onHover: {}, onHoverKeys: []};

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
                        return d3.polygonContains(c1, pos) || c1.find(function(c2) {
                            return d3.polygonContains(c2, pos)
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
