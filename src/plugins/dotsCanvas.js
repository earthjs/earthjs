export default urlDots => {
    const _ = {dataDots: null, circles: []};

    function canvasAddDots() {
        if (_.dataDots && this._.options.showDots) {
            const circles = [];
            const proj = this._.proj;
            const _g = _.dataDots.geometry || {};
            const center = proj.invert(this._.center);
            this.canvasPlugin.render(function(context, path) {
                _.circles.forEach(function(d) {
                    if (d3.geoDistance(d.coordinates, center) <= 1.57) {
                        circles.push(d.circle);
                    }
                });
                context.beginPath();
                path({type: 'GeometryCollection', geometries: circles});
                context.lineWidth = _g.lineWidth ||  0.2;
                context.fillStyle = _g.fillStyle || 'rgba(100,0,0,.4)';
                context.strokeStyle = _g.strokeStyle || 'rgba(100,0,0,.6)';
                context.fill();
                context.stroke();
                context.closePath();
            }, _.drawTo);
        }
    }

    function initData() {
        const geoCircle = d3.geoCircle();
        const _g = _.dataDots.geometry || {};
        const _r = _g.radius || 0.5;
        _.circles = _.dataDots.features.map(function(d) {
            const coordinates = d.geometry.coordinates;
            const r = d.geometry.radius || _r;
            const circle = geoCircle.center(coordinates).radius(r)();
            return {coordinates, circle};
        });
    }

    return {
        name: 'dotsCanvas',
        urls: urlDots && [urlDots],
        onReady(err, dots) {
            this.dotsCanvas.data(dots);
        },
        onInit() {
            this.$fn.canvasAddDots = canvasAddDots;
            this._.options.showDots = true;
        },
        onRefresh() {
            canvasAddDots.call(this);
        },
        data(data) {
            if (data) {
                _.dataDots = data;
                initData();
                setTimeout(() => canvasAddDots.call(this),1);
            } else {
                return _.dataDots;
            }
        },
        drawTo(arr) {
            _.drawTo = arr;
        },
    }
}
