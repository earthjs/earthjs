export default function() {
    const datumGraticule = d3.geoGraticule()();

    function canvasAddGraticule() {
        if (this._.options.showGraticule) {
            this.canvasPlugin.render(function(context, path) {
                context.beginPath();
                path(datumGraticule);
                context.lineWidth = 0.3;
                context.strokeStyle = 'rgba(119,119,119,0.4)';
                context.stroke();
            });
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
        }
    }
}
