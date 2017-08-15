// http://bl.ocks.org/syntagmatic/6645345
export default worldUrl => {
    /*eslint no-console: 0 */
    const _ = {recreate: true};

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
        if (_.recreate) {
            _.recreate = false;
            _.context.clearRect(0, 0, 1024, 512);
            let i = _.countries.features.length;
            while (i--) {
                _.context.beginPath();
                _.path(_.countries.features[i]);
                _.context.fillStyle = "rgb(" + (i+1) + ",0,0)";
                _.context.fill();
            }
        }
    }

    return {
        name: 'countryCanvas',
        urls: worldUrl && [worldUrl],
        onReady(err, data) {
            this.countryCanvas.data(data);
        },
        onInit() {
            init.call(this);
        },
        onCreate() {
            if (this.worldJson && !_.world) {
                this.countryCanvas.allData(this.worldJson.allData());
            }
            create.call(this);
        },
        data(data) {
            if (data) {
                _.world = data;
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return  _.world;
            }
        },
        allData(all) {
            if (all) {
                _.world     = all.world;
                _.countries = all.countries;
            } else {
                const  {world, countries} = _;
                return {world, countries};
            }
        },
        detectCountry(pos) {
            const hiddenPos = _.proj(pos);
            if (hiddenPos[0] > 0) {
                const p = _.context.getImageData(hiddenPos[0], hiddenPos[1], 1, 1).data;
                return _.countries.features[p[0]-1];
            }
        }
    }
}
