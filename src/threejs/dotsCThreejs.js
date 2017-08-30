export default urlDots => {
    /*eslint no-console: 0 */
    const _ = {dataDots: null};

    function init() {
        let dots;
        const o = this._.options;
        o.showDots = true;
        this.canvasThreejs.onDraw({
            dotsCThreejs(context, path) {
                if (o.showDots) {
                    if (!dots) {
                        dots = _.dots.map(d => d.circle);
                    }
                    const _g = _.dataDots.geometry || {};
                    context.beginPath();
                    path({type: 'GeometryCollection', geometries: dots});
                    context.lineWidth = _g.lineWidth ||  0.2;
                    context.fillStyle = _g.fillStyle || 'rgba(100,0,0,.4)';
                    context.strokeStyle = _g.strokeStyle || 'rgba(100,0,0,.6)';
                    context.fill();
                    context.stroke();
                }
            }
        });
    }

    function initData() {
        const geoCircle = d3.geoCircle();
        const _g = _.dataDots.geometry || {};
        const _r = _g.radius || 0.5;
        _.dots = _.dataDots.features.map(function(d) {
            const coordinates = d.geometry.coordinates;
            const properties = d.properties;
            const r = d.geometry.radius || _r;
            const circle = geoCircle.center(coordinates).radius(r)();
            return {properties, coordinates, circle};
        });
    }

    return {
        name: 'dotsCThreejs',
        urls: urlDots && [urlDots],
        onReady(err, dots) {
            _.me.data(dots);
        },
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        data(data) {
            if (data) {
                _.dataDots = data;
                initData();
            } else {
                return  _.dataDots;
            }
        },
    }
}
