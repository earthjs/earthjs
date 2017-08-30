export default (urlJson, {important}={}) => {
    /*eslint no-console: 0 */
    const _ = {dataDots: null, dots: [], radiusPath: null};

    function create() {
        const __ = this._;
        if (!(__.drag && !important) && _.dataDots && this._.options.showDots) {
            const proj = this._.proj;
            const _g = _.dataDots.geometry || {};
            const center = proj.invert(this._.center);
            let dots1 = [];
            let dots2 = [];
            _.dots.forEach(function(d) {
                if (d3.geoDistance(d.coordinates, center) > 1.57) {
                    dots1.push(d.circle);
                } else {
                    dots2.push(d.circle);
                }
            });
            if (__.options.transparent || __.options.transparentDots) {
                this.canvasPlugin.flipRender(function(context, path) {
                    context.beginPath();
                    path({type: 'GeometryCollection', geometries: dots1});
                    context.lineWidth = 0.2;
                    context.strokeStyle = 'rgba(119,119,119,.4)';
                    context.stroke();
                }, _.drawTo);
            }
            this.canvasPlugin.render(function(context, path) {
                context.beginPath();
                path({type: 'GeometryCollection', geometries: dots2});
                context.lineWidth = _g.lineWidth ||  0.2;
                context.fillStyle = _g.fillStyle || 'rgba(100,0,0,.4)';
                context.strokeStyle = _g.strokeStyle || 'rgba(100,0,0,.6)';
                context.fill();
                context.stroke();
            }, _.drawTo);
        }
    }

    function initData() {
        const geoCircle = d3.geoCircle();
        const _g = _.dataDots.geometry || {};
        const _r = _g.radius || 0.5;
        _.dots = _.dataDots.features.map(function(d) {
            const coordinates = d.geometry.coordinates;
            const properties = d.properties;
            const r = d.geometry.radius || _r;
            const circle = geoCircle.center(coordinates).radius(r)();
            return {properties, coordinates, circle};
        });
    }

    return {
        name: 'dotsCanvas',
        urls: urlJson && [urlJson],
        onReady(err, json) {
            _.me.data(json);
        },
        onInit(me) {
            _.me = me;
            this._.options.transparentDots = false;
            this._.options.showDots = true;
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            // execue if important or start/end of drag
            if (important || this._.drag!==true) {
                create.call(this);
            }
        },
        radiusPath(path) {
            _.radiusPath = path;
        },
        data(data) {
            if (data) {
                if (_.radiusPath) {
                    const p = _.radiusPath.split('.');
                    const x = data.features.map(d => {
                        let v = d;
                        p.forEach(o => v = v[o]);
                        return v;
                    }).sort();
                    const scale = d3.scaleLinear()
                        .domain([x[0], x.pop()])
                        .range([0.5, 2]);
                    data.features.forEach(d => {
                        let v = d;
                        p.forEach(o => v = v[o]);
                        d.geometry.radius = scale(v);
                    });
                }
                _.dataDots = data;
                initData();
                setTimeout(() => create.call(this),1);
            } else {
                return _.dataDots;
            }
        },
        drawTo(arr) {
            _.drawTo = arr;
        },
        dots() {
            return _.dots;
        },
    }
}
