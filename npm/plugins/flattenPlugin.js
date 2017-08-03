export default function () {
    /*eslint no-console: 0 */
    var _ = {};

    function init() {
        var g1 = this._.proj;
        var g2 = d3.geoEquirectangular()
            .scale(this._.options.width/6.3)
            .translate(this._.center);
        _.g1 = g1;
        _.g2 = g2;
    }

    function animation() {
        var _this = this;
        return _this._.svg.transition()
            .duration(10500)
            .tween('projection', function() {
                return function(_x) {
                    animation.alpha(_x);
                    _this._.refresh();
                };
            });
    }

    function interpolatedProjection(a, b) {
        var px = d3.geoProjection(raw).scale(1);
        var alpha;

        function raw(lamda, pi) {
            var pa = a([lamda *= 180 / Math.PI, pi *= 180 / Math.PI]), pb = b([lamda, pi]);
            return [(1 - alpha) * pa[0] + alpha * pb[0], (alpha - 1) * pa[1] - alpha * pb[1]];
        }

        animation.alpha = function(_x) {
            if (!arguments.length) {
                return alpha;
            }
            alpha = + _x;
            var
                ca = a.center(),
                cb = b.center(),
                ta = a.translate(),
                tb = b.translate();
            px.center([
                (1 - alpha) * ca[0] + alpha * cb[0],
                (1 - alpha) * ca[1] + alpha * cb[1]]);
            px.translate([
                (1 - alpha) * ta[0] + alpha * tb[0],
                (1 - alpha) * ta[1] + alpha * tb[1]]);
            return px;
        };
        animation.alpha(0);
        return px;
    }

    //Rotate to default before animation
    function defaultRotate() {
        var __ = this._;
        return d3.transition()
        .duration(1500)
        .tween('rotate', function() {
            __.rotate(__.proj.rotate());
            var r = d3.interpolate(__.proj.rotate(), [0, 0, 0]);
            return function(t) {
                __.rotate(r(t));
            };
        })
    }

    return {
        name: 'flattenPlugin',
        onInit: function onInit() {
            init.call(this);
        },
        toMap: function toMap() {
            var this$1 = this;

            defaultRotate.call(this).on('end', function () {
                var proj = interpolatedProjection(_.g1, _.g2);
                this$1._.path = d3.geoPath().projection(proj);
                animation.call(this$1).on('end', function () {
                    this$1._.options.enableCenter = false;
                })
            })
        },
        toGlobe: function toGlobe() {
            var this$1 = this;

            this._.rotate([0,0,0]);
            var proj = interpolatedProjection(_.g2, _.g1);
            this._.path = d3.geoPath().projection(proj);
            animation.call(this).on('end', function () {
                this$1._.path = d3.geoPath().projection(this$1._.proj);
                this$1._.options.enableCenter = true;
                this$1._.refresh();
            })
        }
    }
}
