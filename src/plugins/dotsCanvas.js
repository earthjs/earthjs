export default urlJson => {
    /*eslint no-console: 0 */
    const _ = {dataDots: null, circles: [], radiusPath: null,
        onHover: {},
        onHoverKeys: [],
        onClick: {},
        onClickKeys: [],
        onDblClick: {},
        onDblClickKeys: [],
    };

    function create() {
        const __ = this._;
        if (!__.drag && _.dataDots && this._.options.showDots) {
            const proj = this._.proj;
            const _g = _.dataDots.geometry || {};
            const center = proj.invert(this._.center);
            let circles1 = [];
            let circles2 = [];
            _.circles.forEach(function(d) {
                if (d3.geoDistance(d.coordinates, center) > 1.57) {
                    circles1.push(d.circle);
                } else {
                    circles2.push(d.circle);
                }
            });
            if (__.options.transparent || __.options.transparentDots) {
                __.proj.clipAngle(180);
                this.canvasPlugin.render(function(context, path) {
                    context.beginPath();
                    path({type: 'GeometryCollection', geometries: circles1});
                    context.lineWidth = 0.2;
                    context.strokeStyle = 'rgba(119,119,119,.4)';
                    context.stroke();
                    context.closePath();
                }, _.drawTo);
                __.proj.clipAngle(90);
            }
            this.canvasPlugin.render(function(context, path) {
                context.beginPath();
                path({type: 'GeometryCollection', geometries: circles2});
                context.lineWidth = _g.lineWidth ||  0.2;
                context.fillStyle = _g.fillStyle || 'rgba(100,0,0,.4)';
                context.strokeStyle = _g.strokeStyle || 'rgba(100,0,0,.6)';
                context.fill();
                context.stroke();
                context.closePath();
            }, _.drawTo);
        }
    }

    function initData() {
        const geoCircle = d3.geoCircle();
        const _g = _.dataDots.geometry || {};
        const _r = _g.radius || 0.5;
        _.circles = _.dataDots.features.map(function(d) {
            const coordinates = d.geometry.coordinates;
            const properties = d.properties;
            const r = d.geometry.radius || _r;
            const circle = geoCircle.center(coordinates).radius(r)();
            return {properties, coordinates, circle};
        });
    }

    function detect(mouse, pos) {
        let dot = null;
        _.circles.forEach(function(d) {
            if (mouse && !dot) {
                const geoDistance = d3.geoDistance(d.coordinates, pos);
                if (geoDistance <= 0.02) {
                    dot = d;
                }
            }
        });
        return dot;
    }

    function initCircleHandler() {
        if (this.hoverCanvas) {
            const hoverHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onHoverKeys.forEach(k => {
                    _.onHover[k].call(this, mouse, dot);
                });
                return dot;
            }
            this.hoverCanvas.onCircle({
                dotsCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            const clickHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onClickKeys.forEach(k => {
                    _.onClick[k].call(this, mouse, dot);
                });
                return dot;
            }
            this.clickCanvas.onCircle({
                dotsCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            const dblClickHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onDblClickKeys.forEach(k => {
                    _.onDblClick[k].call(this, mouse, dot);
                });
                return dot;
            }
            this.dblClickCanvas.onCircle({
                dotsCanvas: dblClickHandler
            });
        }
    }

    return {
        name: 'dotsCanvas',
        urls: urlJson && [urlJson],
        onReady(err, json) {
            this.dotsCanvas.data(json);
        },
        onInit() {
            initCircleHandler.call(this);
            this._.options.transparentDots = false;
            this._.options.showDots = true;
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            create.call(this);
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
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverKeys = Object.keys(_.onHover);
        },
        onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickKeys = Object.keys(_.onClick);
        },
        onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickKeys = Object.keys(_.onDblClick);
        },
    }
}
