// http://bl.ocks.org/syntagmatic/6645345
export default (jsonUrl, radius=1.5) => { //
    /*eslint no-console: 0 */
    const _ = {recreate: true};

    function rgb2num(str) {
        return str.split(',').reduce((i,n)=>(+i)*256+(+n));
    }

    function num2rgb(num) {
        let d = num%256;
        for (let i = 2; i > 0; i--) {
            num = Math.floor(num/256);
            d = num%256 + ',' + d;
        }
        return d;
    }

    function init() {
        const width  = 1600;
        const height = 800;
        const center = [width/2, height/2]
        _.canvas = d3.select('body').append('canvas')
            .attr('class','ej-hidden')
            .attr('width', width)
            .attr('height', height)
            .node();
        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().translate(center).scale(center[1]/1.2);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
    }

    function create() {
        if (_.recreate) {
            _.recreate = false;
            _.context.clearRect(0, 0, 1024, 512);
            const arr = _.dataDots.features;
            for (let i = 0; i< arr.length; i++) {
                _.context.beginPath();
                // _.path(arr[i]);
                const xy = _.proj(arr[i].geometry.coordinates);
                _.context.arc(xy[0], xy[1], radius, 0, 2*Math.PI);
                _.context.fillStyle = `rgb(${num2rgb(i+2)})`;
                _.context.fill();
            }
        }
    }

    return {
        name: 'dotRegion',
        urls: jsonUrl && [jsonUrl],
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        data(data) {
            if (data) {
                _.dataDots = data;
            } else {
                return  _.dataDots;
            }
        },
        detect(latlong) { // g._.proj.invert(mouse);
            const hiddenPos = _.proj(latlong);
            if (hiddenPos[0] > 0) {
                const p = _.context.getImageData(hiddenPos[0], hiddenPos[1], 1, 1).data;
                const d = _.dataDots.features[rgb2num(p.slice(0,3).join(','))-2];
                if (d) {
                    const {coordinates} = d.geometry;
                    if (Math.floor(coordinates[0])===Math.floor(latlong[0]) &&
                        Math.floor(coordinates[1])===Math.floor(latlong[1])) {
                        // console.log(latlong, coordinates);
                        return d;
                    }
                }
            }
        }
    }
}
