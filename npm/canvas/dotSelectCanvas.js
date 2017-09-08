export default function () {
    /*eslint no-console: 0 */
    var _ = {dataDots: null, dots: null, radiusPath: null,
        onHover: {},
        onHoverVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: [],
    };

    function detect(pos) {
        var dot = null;
        if (_.dots) {
            var ref = this.hoverCanvas.states();
            var mouse = ref.mouse;
            _.dots.forEach(function(d) {
                if (mouse && !dot) {
                    var geoDistance = d3.geoDistance(d.coordinates, pos);
                    if (geoDistance <= 0.02) {
                        dot = d;
                    }
                }
            });            
        }
        return dot;
    }

    function initCircleHandler() {
        var this$1 = this;

        if (this.hoverCanvas) {
            var hoverHandler = function (event, pos) {
                var dot = detect.call(this$1, pos);
                _.onHoverVals.forEach(function (v) {
                    v.call(this$1, event, dot);
                });
                return dot;
            }
            // always receive hover event
            hoverHandler.tooltips = true;
            this.hoverCanvas.onCircle({
                dotsCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            var clickHandler = function (event, pos) {
                var dot = detect.call(this$1, pos);
                _.onClickVals.forEach(function (v) {
                    v.call(this$1, event, dot);
                });
                return dot;
            }
            this.clickCanvas.onCircle({
                dotsCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            var dblClickHandler = function (event, pos) {
                var dot = detect(event, pos);
                _.onDblClickVals.forEach(function (v) {
                    v.call(this$1, event, dot);
                });
                return dot;
            }
            this.dblClickCanvas.onCircle({
                dotsCanvas: dblClickHandler
            });
        }
    }

    return {
        name: 'dotSelectCanvas',
        onInit: function onInit(me) {
            _.me = me;
            initCircleHandler.call(this);
        },
        onCreate: function onCreate() {
            if (this.dotsCanvas && !_.dots) {
                _.me.dots(this.dotsCanvas.dots());
            }
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) { return _.onHover[k]; });
        },
        onClick: function onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(function (k) { return _.onClick[k]; });
        },
        onDblClick: function onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(function (k) { return _.onDblClick[k]; });
        },
        dots: function dots(dots$1) {
            _.dots = dots$1;
        },
    }
}
