export default function() {
    const _ = {dataDots: null};

    function canvasAddDots() {
        if (_.dataDots && this._.options.showDots) { // && !this._.drag
            const circles = [];
            const circle = d3.geoCircle();
            const proj = this._.proj;
            const center = proj.invert(this._.center);
            this.canvasPlugin.render(function(context, path) {
                // _.dataDots.features.forEach(function(d) {
                //     if (d3.geoDistance(d.geometry.coordinates, center) <= 1.57) {
                //         context.beginPath();
                //         context.fillStyle = '#F00';
                //         context.arc(
                //             proj(d.geometry.coordinates)[0],
                //             proj(d.geometry.coordinates)[1], 2,0,2*Math.PI);
                //         context.fill();
                //         context.closePath();
                //     }
                // });
                _.dataDots.features.forEach(function(d) {
                    const coord = d.geometry.coordinates;
                    if (d3.geoDistance(coord, center) <= 1.57) {
                        circles.push(circle.center(coord).radius(0.5)());
                    }
                });
                context.beginPath();
                path({type: 'GeometryCollection', geometries: circles});
                context.fillStyle = 'rgba(100,0,0,.4)';
                context.lineWidth = 0.2;
                context.strokeStyle = 'rgba(100,0,0,.6)';
                context.fill();
                context.stroke();
                context.closePath();
            }, _.drawTo);
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
        drawTo(arr) {
            _.drawTo = arr;
        },
    }
}
