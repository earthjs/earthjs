// http://bl.ocks.org/syntagmatic/6645345
export default function (worldUrl) {
    /*eslint no-console: 0 */
    var _ = {};

    function init() {
        _.canvas = d3.select('body').append('canvas')
            .attr('class','ej-hidden')
            .attr('width','1024')
            .attr('height','512')
            .node();
        _.context = _.canvas.getContext('2d');
        _.proj = d3.geoEquirectangular().precision(0.5).translate([512, 256]).scale(163);
        _.path = d3.geoPath().projection(_.proj).context(_.context);
    }

    function create() {
        _.context.clearRect(0, 0, 1024, 512);
        var i = _.countries.features.length;
        while (i--) {
            _.context.beginPath();
            _.path(_.countries.features[i]);
            _.context.fillStyle = "rgb(" + (i+1) + ",0,0)";
            _.context.fill();
        }
    }

    return {
        name: 'countryCanvas',
        urls: worldUrl && [worldUrl],
        onReady: function onReady(err, data) {
            this.countryCanvas.data(data);
        },
        onInit: function onInit() {
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.countries = topojson.feature(data$1, data$1.objects.countries);
            } else {
                return  _.world;
            }
        },
        detectCountry: function detectCountry(pos) {
            var hiddenPos = _.proj(pos);
            if (hiddenPos[0] > 0) {
                var p = _.context.getImageData(hiddenPos[0], hiddenPos[1], 1, 1).data;
                return _.countries.features[p[0]-1];
            }
        }
    }
}
