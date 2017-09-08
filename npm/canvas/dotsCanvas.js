export default function (urlJson, ref) {
    if ( ref === void 0 ) ref={};
    var important = ref.important;

    /*eslint no-console: 0 */
    var _ = {dataDots: null, dots: [], radiusPath: null};

    function create() {
        var __ = this._;
        if (!(__.drag && !important) && _.dataDots && this._.options.showDots) {
            var proj = this._.proj;
            var _g = _.dataDots.geometry || {};
            var center = proj.invert(this._.center);
            var dots1 = [];
            var dots2 = [];
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
        var geoCircle = d3.geoCircle();
        var _g = _.dataDots.geometry || {};
        var _r = _g.radius || 0.5;
        _.dots = _.dataDots.features.map(function(d) {
            var coordinates = d.geometry.coordinates;
            var properties = d.properties;
            var r = d.geometry.radius || _r;
            var circle = geoCircle.center(coordinates).radius(r)();
            return {properties: properties, coordinates: coordinates, circle: circle};
        });
    }

    return {
        name: 'dotsCanvas',
        urls: urlJson && [urlJson],
        onReady: function onReady(err, json) {
            _.me.data(json);
        },
        onInit: function onInit(me) {
            _.me = me;
            this._.options.transparentDots = false;
            this._.options.showDots = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            // execue if important or start/end of drag
            if (important || this._.drag!==true) {
                create.call(this);
            }
        },
        radiusPath: function radiusPath(path) {
            _.radiusPath = path;
        },
        data: function data(data$1) {
            var this$1 = this;

            if (data$1) {
                if (_.radiusPath) {
                    var p = _.radiusPath.split('.');
                    var x = data$1.features.map(function (d) {
                        var v = d;
                        p.forEach(function (o) { return v = v[o]; });
                        return v;
                    }).sort();
                    var scale = d3.scaleLinear()
                        .domain([x[0], x.pop()])
                        .range([0.5, 2]);
                    data$1.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) { return v = v[o]; });
                        d.geometry.radius = scale(v);
                    });
                }
                _.dataDots = data$1;
                initData();
                setTimeout(function () { return create.call(this$1); },1);
            } else {
                return _.dataDots;
            }
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        dots: function dots() {
            return _.dots;
        },
    }
}
