export default function() {
    const datumGraticule = d3.geoGraticule()();
    const _ = {style: {}, drawTo: null};

    function canvasAddGraticule() {
        if (this._.options.showGraticule) {
            this.canvasPlugin.render(function(context, path) {
                context.beginPath();
                path(datumGraticule);
                context.lineWidth = 0.3;
                context.strokeStyle = _.style.line || 'rgba(119,119,119,0.4)';
                context.stroke();
            }, _.drawTo);
        }
    }

    return {
        name: 'graticuleCanvas',
        onInit() {
            this.$.canvasAddGraticule = canvasAddGraticule;
            this._.options.showGraticule = true;
        },
        onRefresh() {
            canvasAddGraticule.call(this);
        },
        style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        },
        drawTo(arr) {
            _.drawTo = arr;
        }
    }
}
