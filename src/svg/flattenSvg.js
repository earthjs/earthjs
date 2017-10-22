export default () => {
    /*eslint no-console: 0 */
    const _ = {};
    window._flat = _;

    function init() {
        const g1 = this._.proj;
        const g2 = d3.geoEquirectangular()
            .scale(this._.options.width/6.3)
            .translate(this._.center); 
        _.g1 = g1;
        _.g2 = g2;
        _.scale = d3.scaleLinear().domain([47.3, _.g1.scale()]).range([0.0559, 1]);
        _.scaleG2 = d3.scaleLinear().domain([47.3, _.g1.scale()]).range([0, _.g2.scale()]);
    }

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
        _.px = d3.geoProjection(raw).scale(1);
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
            _.px.center([
                (1 - alpha) * ca[0] + alpha * cb[0],
                (1 - alpha) * ca[1] + alpha * cb[1]]);
            _.px.translate([
                (1 - alpha) * ta[0] + alpha * tb[0],
                (1 - alpha) * ta[1] + alpha * tb[1]]);
            return _.px;
        };
        animation.alpha(0);
        return _.px;
    }

    //Rotate to default before animation
    function defaultRotate() {
        const __ = this._;
        return d3.transition()
        .duration(1500)
        .tween('rotate', function() {
            __.rotate(__.proj.rotate());
            const r = d3.interpolate(__.proj.rotate(), [0, 0, 0]);
            return function(t) {
                __.rotate(r(t));
            };
        })
    }

    return {
        name: 'flattenSvg',
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onResize() {
            if (this._.options.map) {
                const g1 = _.g1.scale();
                const g2 = _.scale(g1);
                _.px.scale(g2);
                _.path.attr('d', this._.path);    
            }
        },
        toMap() {
            defaultRotate.call(this).on('end', () => {
                _.g2.scale(_.scaleG2(_.g1.scale()));
                const proj = interpolatedProjection(_.g1, _.g2);
                this._.path = d3.geoPath().projection(proj);
                animation.call(this).on('end', () => {
                    _.path = this._.svg.selectAll('path');
                    this._.options.enableCenter = false;
                    this._.options.map = true;
                })
            })
        },
        toGlobe() {
            this._.rotate([0,0,0]);
            // const scale = _.px.scale();
            _.g2.scale(_.scaleG2(_.g1.scale()));
            const proj = interpolatedProjection(_.g2, _.g1);
            // proj.scale(scale);
            this._.path = d3.geoPath().projection(proj);
            animation.call(this).on('end', () => {
                this._.path = d3.geoPath().projection(_.g1);
                this._.options.enableCenter = true;
                this._.options.map = false;
                this._.refresh();
            })
        }
    }
}
