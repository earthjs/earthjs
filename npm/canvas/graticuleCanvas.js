export default function () {
    var datumGraticule = d3.geoGraticule()();
    var _ = {style: {}, drawTo: null};

    function init(){
        var __ = this._;
        __.options.showGraticule = true;
        __.options.transparentGraticule = false;
    }

    function create() {
        var __ = this._;
        if (__.options.showGraticule) {
            if (__.options.transparent || __.options.transparentGraticule) {
                __.proj.clipAngle(180);
            }
            this.canvasPlugin.render(function(context, path) {
                context.beginPath();
                path(datumGraticule);
                context.lineWidth = 0.4;
                context.strokeStyle = _.style.line || 'rgba(119,119,119,0.6)';
                context.stroke();
            }, _.drawTo);
            if (__.options.transparent || __.options.transparentGraticule) {
                __.proj.clipAngle(90);
            }
        }
    }

    return {
        name: 'graticuleCanvas',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            create.call(this);
        },
        drawTo: function drawTo(arr) {
            _.drawTo = arr;
        },
        style: function style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
    }
}
