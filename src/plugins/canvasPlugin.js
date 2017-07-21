// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
export default () => {
    /*eslint no-console: 0 */
    const _ = {
        canvas: null,
        path: null,
        q: null
    }

    function init() {
        const __ = this._;
        __.options.showCanvas = true;
        _.path = d3.geoPath().projection(__.proj);
    }

    function create() {
        const __ = this._;
        if (__.options.showCanvas) {
            if (!_.canvas) {
                const fObject = __.svg.append('g').attr('class','canvas').append('foreignObject')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', __.options.width)
                .attr('height', __.options.height);
                const fBody = fObject.append('xhtml:body')
                .style('margin', '0px')
                .style('padding', '0px')
                .style('background-color', 'none')
                .style('width', __.options.width + 'px')
                .style('height', __.options.height + 'px');
                _.canvas = fBody.append('canvas');
            }
            _.canvas
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', __.options.width)
            .attr('height', __.options.height);
        }
        if (_.canvas) {
            refresh.call(this);
        }
    }

    function refresh() {
        const {width, height} = this._.options;
        _.canvas.each(function() {
            this.getContext('2d').clearRect(0, 0, width, height);
        });
    }

    return {
        name: 'canvasPlugin',
        onInit()    {
            init   .call(this);
        },
        onCreate()  {
            create .call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        selectAll(q) {
            if (q) {
                _.q = q;
                _.canvas = d3.selectAll(q);
            }
            return _.canvas;
        },
        render(fn, drawTo, options=[]) {
            const __ = this._;
            if (__.options.showCanvas) {
                var rChange = false;
                const proj = __.proj;
                const r = proj.rotate();
                const _this = this;
                _.canvas.each(function(obj, idx) {
                    if (!drawTo || drawTo.indexOf(idx)>-1) {
                        const o = options[idx] || {};
                        if (o.rotate) {
                            rChange = true;
                            proj.rotate([r[0]+o.rotate, r[1], r[2]]);
                        } else if (rChange) {
                            rChange = false;
                            proj.rotate(r);
                        }
                        const context = this.getContext('2d');
                        fn.call(_this, context, _.path.context(context));
                    }
                });
                if (rChange) {
                    rChange = false;
                    proj.rotate(r);
                }
            }
        },
        flipRender(fn, drawTo, options=[]) {
            // __.proj.clipAngle(180);
            // this.canvasPlugin.render(function(context, path) {
            //     fn.call(this, context, path);
            // }, _.drawTo, _.options);
            // __.proj.clipAngle(90);
            const __ = this._;
            const w = __.center[0];
            const r = __.proj.rotate();
            this.canvasPlugin.render(function(context, path) {
                context.save();
                context.translate(w, 0);
                context.scale(-1, 1);
                context.translate(-w, 0);
                __.proj.rotate([r[0]+180,-r[1],-r[2]]);
                fn.call(this, context, path);
                context.restore();
                __.proj.rotate(r);
            }, drawTo, options);
        }
    }
}
