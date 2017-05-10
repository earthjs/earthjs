export default function() {
    var datumGraticule = d3.geoGraticule();

    function canvasAddGraticule() {
        if (this._.options.showGraticule) {
            var context = this.canvasPlugin.context();
            var path = this.canvasPlugin.path();
            context.beginPath();
            path(datumGraticule());
            context.lineWidth = 0.3;
            context.strokeStyle = 'rgba(119,119,119,.5)';
            context.stroke();
        }
    }

    return {
        name: 'graticuleCanvas',
        onInit() {
            this.canvasAddGraticule = canvasAddGraticule;
            this._.options.showGraticule = true;
        },
        onRefresh() {
            canvasAddGraticule.call(this);
        }
    }
}
