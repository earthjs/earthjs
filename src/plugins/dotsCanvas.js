export default function() {
    const _ = {dataDots: null};

    function canvasAddDots() {
        if (_.dataDots && this._.options.showDots && !this._.drag) {
            const proj = this._.proj;
            const center = proj.invert(this._.center);
            this.canvasPlugin.render(function(context) {
                _.dataDots.features.forEach(function(d) {
                    if (d3.geoDistance(d.geometry.coordinates, center) <= 1.57) {
                        context.beginPath();
                        context.fillStyle = '#F00';
                        context.arc(
                            proj(d.geometry.coordinates)[0],
                            proj(d.geometry.coordinates)[1], 2,0,2*Math.PI);
                        context.fill();
                        context.closePath();
                    }
                });
            });
        }
    }

    return {
        name: 'dotsCanvas',
        onInit() {
            this.$.canvasAddDots = canvasAddDots;
            this._.options.showDots = true;
        },
        onRefresh() {
            canvasAddDots.call(this);
        },
        data(data) {
            _.dataDots = data;
        },
    }
}
