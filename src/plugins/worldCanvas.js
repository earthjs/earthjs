// John J Czaplewski’s Block http://bl.ocks.org/jczaplew/6798471
export default (urlWorld, urlCountryNames) => {
    /*eslint no-debugger: 0 */
    /*eslint no-console: 0 */
    const _ = {world: null, countryNames: null, style: {}};

    function canvasAddWorldOrCountries() {
        if (_.world && this._.options.showLand) {
            canvasAddWorld.call(this);
            if (!this._.drag) {
                if (this._.options.showCountries) {
                    canvasAddCountries.call(this);
                }
                if (this._.options.showLakes) {
                    canvasAddLakes.call(this);
                }
            }
        }
    }

    function canvasAddWorld() {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.land);
            context.fillStyle = _.style.land || 'rgba(117, 87, 57, 0.4)';
            context.fill();
        });
    }

    function canvasAddCountries() {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.countries);
            context.lineWidth = 0.5;
            context.strokeStyle = _.style.countries || 'rgba(80, 64, 39, 0.6)';
            context.stroke();
        });
    }

    function canvasAddLakes() {
        this.canvasPlugin.render(function(context, path) {
            context.beginPath();
            path(_.lakes);
            context.fillStyle = _.style.lakes || 'rgba(80, 87, 97, 0.4)';
            context.fill();
        });
    }

    let urls = null;
    if (urlWorld) {
        urls = [urlWorld];
        if (urlCountryNames) {
            urls.push(urlCountryNames);
        }
    }

    return {
        name: 'worldCanvas',
        urls: urls,
        onReady(err, world, countryNames) {
            _.world = world;
            _.countryNames = countryNames;
            _.land = topojson.feature(_.world, _.world.objects.land);
            _.lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);
            _.countries = topojson.feature(_.world, _.world.objects.countries);
        },
        onInit() {
            this._.options.showLand = true;
            this._.options.showLakes = true;
            this._.options.showCountries = true;
            this.canvasAddWorldOrCountries = canvasAddWorldOrCountries;
        },
        onRefresh() {
            canvasAddWorldOrCountries.call(this);
        },
        data(data) {
            _.world = data.world;
            _.countryNames = data.countryNames;
            _.land = topojson.feature(_.world, _.world.objects.land);
            _.lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);
            _.countries = topojson.feature(_.world, _.world.objects.countries);
        },
        style(s) {
            if (s) {
                _.style = s;
            }
            return _.style;
        }
    }
}
