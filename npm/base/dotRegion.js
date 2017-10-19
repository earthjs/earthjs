// http://bl.ocks.org/syntagmatic/6645345
export default function (jsonUrl, radius) {
    if ( radius === void 0 ) radius=1.5;
 //
    /*eslint no-console: 0 */
    var _ = {recreate: true};

    function rgb2num(str) {
        return str.split(',').reduce(function (i,n){ return (+i)*256+(+n); });
    }

    function num2rgb(num) {
        var d = num%256;
        for (var i = 2; i > 0; i--) {
            num = Math.floor(num/256);
            d = num%256 + ',' + d;
        }
        return d;
    }

    function init() {
        var width  = 1600;
        var height = 800;
        var center = [width/2, height/2]
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
            var arr = _.dataDots.features;
            for (var i = 0; i< arr.length; i++) {
                _.context.beginPath();
                // _.path(arr[i]);
                var xy = _.proj(arr[i].geometry.coordinates);
                _.context.arc(xy[0], xy[1], radius, 0, 2*Math.PI);
                _.context.fillStyle = "rgb(" + (num2rgb(i+2)) + ")";
                _.context.fill();
            }
        }
    }

    return {
        name: 'dotRegion',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(data$1) {
            if (data$1) {
                _.dataDots = data$1;
            } else {
                return  _.dataDots;
            }
        },
        detect: function detect(latlong) { // g._.proj.invert(mouse);
            var hiddenPos = _.proj(latlong);
            if (hiddenPos[0] > 0) {
                var p = _.context.getImageData(hiddenPos[0], hiddenPos[1], 1, 1).data;
                var d = _.dataDots.features[rgb2num(p.slice(0,3).join(','))-2];
                if (d) {
                    var ref = d.geometry;
                    var coordinates = ref.coordinates;
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
