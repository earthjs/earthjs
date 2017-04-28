export default function() {
    var _ = {proj: null};

    return {
        name: 'flattenPlugin',
        onInit() {
            var width = 700,
                height = 500,
                _this = this;

            function animation() {
                _this._.svg.transition()
                    .duration(10500)
                    .tween("projection", function() {
                        return function(_x) {
                            animation.alpha(_x);
                            _this._.refresh();
                        };
                    });
            }

            function interpolatedProjection(a, b) {
                var px = d3.geoProjection(raw).scale(1), α;

                function raw(λ, φ) {
                    var pa = a([λ *= 180 / Math.PI, φ *= 180 / Math.PI]), pb = b([λ, φ]);
                    return [(1 - α) * pa[0] + α * pb[0], (α - 1) * pa[1] - α * pb[1]];
                }

                animation.alpha = function(_x) {
                    if (!arguments.length)
                        return α;
                    var ta = a.translate(),
                        tb = b.translate();
                        α  = + _x;
                    px.translate([
                        (1 - α) * ta[0] + α * tb[0],
                        (1 - α) * ta[1] + α * tb[1]]);
                    return px;
                };
                animation.alpha(0);
                return px;
            }

            var g1 = this._.proj;
            var g2 = d3.geoEquirectangular().scale(width/3.5).translate([width / 2, height / 2]);

            _.proj = interpolatedProjection(g1, g2);
            var patx = d3.geoPath().projection(_.proj);

            this._.patx = patx;
            this._.animation = animation;
        },
        toMap() {
            var r = this._.proj.rotate();
            this._.path = this._.patx;
            _.proj.rotate([r[0],0,0]);
            _.proj.center([0,0]);
            this.svgDraw();
            this._.animation.call(this);
        }
    }
}
