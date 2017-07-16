export default () => {
    /*eslint no-console: 0 */
    const _ = {};

    function animation() {
        const _this = this;
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
        const px = d3.geoProjection(raw).scale(1);
        let alpha;

        function raw(lamda, pi) {
            const pa = a([lamda *= 180 / Math.PI, pi *= 180 / Math.PI]), pb = b([lamda, pi]);
            return [(1 - alpha) * pa[0] + alpha * pb[0], (alpha - 1) * pa[1] - alpha * pb[1]];
        }

        animation.alpha = function(_x) {
            if (!arguments.length) {
                return alpha;
            }
            alpha = + _x;
            const
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
        const __ = this._;
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
        onInit() {
            const g1 = this._.proj;
            const g2 = d3.geoEquirectangular()
                .scale(this._.options.width/6.3)
                .translate(this._.center);
            _.g1 = g1;
            _.g2 = g2;
        },
        toMap() {
            defaultRotate.call(this).on('end', () => {
                const proj = interpolatedProjection(_.g1, _.g2);
                this._.path = d3.geoPath().projection(proj);
                animation.call(this).on('end', () => {
                    this._.options.enableCenter = false;
                })
            })
        },
        toGlobe() {
            this._.rotate([0,0,0]);
            const proj = interpolatedProjection(_.g2, _.g1);
            this._.path = d3.geoPath().projection(proj);
            animation.call(this).on('end', () => {
                this._.path = d3.geoPath().projection(this._.proj);
                this._.options.enableCenter = true;
                this._.refresh();
            })
        }
    }
}
