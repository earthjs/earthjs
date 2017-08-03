export default function (urlDots) {
    /*eslint no-console: 0 */
    var _ = {dataDots: null};

    function init() {
        var dots;
        var o = this._.options;
        o.showDots = true;
        this.canvasThreejs.onDraw({
            dotsCThreejs: function dotsCThreejs(context, path) {
                if (o.showDots) {
                    if (!dots) {
                        dots = _.dots.map(function (d) { return d.circle; });
                    }
                    var _g = _.dataDots.geometry || {};
                    context.beginPath();
                    path({type: 'GeometryCollection', geometries: dots});
                    context.lineWidth = _g.lineWidth ||  0.2;
                    context.fillStyle = _g.fillStyle || 'rgba(100,0,0,.4)';
                    context.strokeStyle = _g.strokeStyle || 'rgba(100,0,0,.6)';
                    context.fill();
                    context.stroke();
                }
            }
        });
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
        name: 'dotsCThreejs',
        urls: urlDots && [urlDots],
        onReady: function onReady(err, dots) {
            this.dotsCThreejs.data(dots);
        },
        onInit: function onInit() {
            init.call(this);
        },
        data: function data(data$1) {
            if (data$1) {
                _.dataDots = data$1;
                initData();
            } else {
                return  _.dataDots;
            }
        },
    }
}
