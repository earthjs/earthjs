export default function() {
    const _ = {proj: null};

    return {
        name: 'flattenPlugin',
        onInit() {
            const width = 700,
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
                const px = d3.geoProjection(raw).scale(1);
                let alpha;

                function raw(lamda, pi) {
                    const pa = a([lamda *= 180 / Math.PI, pi *= 180 / Math.PI]), pb = b([lamda, pi]);
                    return [(1 - alpha) * pa[0] + alpha * pb[0], (alpha - 1) * pa[1] - alpha * pb[1]];
                }

                animation.alpha = function(_x) {
                    if (!arguments.length)
                        return alpha;
                    const ta = a.translate(),
                        tb = b.translate();
                        alpha = + _x;
                        tb[0] = ta[0];
                        tb[1] = ta[1]/1.2;
                    // console.log(px.rotate(), _x);
                    px.translate([
                        (1 - alpha) * ta[0] + alpha * tb[0],
                        ((1 - alpha) * ta[1] + alpha * tb[1])
                    ]);
                    return px;
                };
                animation.alpha(0);
                return px;
            }

            const g1 = this._.proj;
            const g2 = d3.geoEquirectangular()
                .scale(width/4)
                .translate([width / 2, height / 2]);
            _.proj = interpolatedProjection(g1, g2);
            // _.proj.center([0,0]);
            this._.animation = animation;
            this._.px = _.proj;
            this._.g1 = g1;
            this._.g2 = g2;
        },
        toMap() {
            // const r = this._.proj.rotate();
            this._.path = d3.geoPath().projection(_.proj);
            // this._.proj.rotate([r[0],0,0]);
            // this._.proj.center([0,0]);
            this.svgDraw();
            this._.animation.call(this);
        }
    }
}
