// Bo Ericsson’s Block http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
export default function () {
    /*eslint no-console: 0 */
    var _ = {
        canvas: null,
        path: null,
        q: null
    }

    function init() {
        var __ = this._;
        __.options.showCanvas = true;
        _.path = d3.geoPath().projection(__.proj);
    }

    function create() {
        var __ = this._;
        if (__.options.showCanvas) {
            if (!_.canvas) {
                var fObject = __.svg.append('g').attr('class','canvas').append('foreignObject')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', __.options.width)
                .attr('height', __.options.height);
                var fBody = fObject.append('xhtml:body')
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
        var ref = this._.options;
        var width = ref.width;
        var height = ref.height;
        _.canvas.each(function() {
            this.getContext('2d').clearRect(0, 0, width, height);
        });
    }

    return {
        name: 'canvasPlugin',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate()  {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        selectAll: function selectAll(q) {
            if (q) {
                _.q = q;
                _.canvas = d3.selectAll(q);
            }
            return _.canvas;
        },
        render: function render(fn, drawTo, options) {
            if ( options === void 0 ) options=[];

            var __ = this._;
            if (__.options.showCanvas) {
                var rChange = false;
                var proj = __.proj;
                var r = proj.rotate();
                var _this = this;
                _.canvas.each(function(obj, idx) {
                    if (!drawTo || drawTo.indexOf(idx)>-1) {
                        var o = options[idx] || {};
                        if (o.rotate) {
                            rChange = true;
                            proj.rotate([r[0]+o.rotate, r[1], r[2]]);
                        } else if (rChange) {
                            rChange = false;
                            proj.rotate(r);
                        }
                        var context = this.getContext('2d');
                        fn.call(_this, context, _.path.context(context));
                    }
                });
                if (rChange) {
                    rChange = false;
                    proj.rotate(r);
                }
            }
        },
        flipRender: function flipRender(fn, drawTo, options) {
            if ( options === void 0 ) options=[];

            // __.proj.clipAngle(180);
            // _.me.render(function(context, path) {
            //     fn.call(this, context, path);
            // }, _.drawTo, _.options);
            // __.proj.clipAngle(90);
            var __ = this._;
            var w = __.center[0];
            var r = __.proj.rotate();
            _.me.render(function(context, path) {
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
