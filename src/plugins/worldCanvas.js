export default function(urlWorld, urlCountryNames) {
    var _ = {world: null, countryNames: null};

    function canvasAddWorldOrCountries() {
        if (this._.options.showLand) {
            if (_.world) {
                canvasAddWorld.call(this);
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
        var land = topojson.feature(_.world, _.world.objects.land);
        var context = this.canvasPlugin.context();
        var path = this.canvasPlugin.path();
        context.beginPath();
        path(land);
        context.fillStyle = "rgb(117, 87, 57)";
        context.fill();
    }

    function canvasAddCountries() {
        var countries = topojson.feature(_.world, _.world.objects.countries);
        var context = this.canvasPlugin.context();
        var path = this.canvasPlugin.path();
        context.beginPath();
        path(countries);
        context.lineWidth = .5;
        context.strokeStyle = "rgb(80, 64, 39)";
        context.stroke();
    }

    function canvasAddLakes() {
        var lakes = topojson.feature(_.world, _.world.objects.ne_110m_lakes);
        var context = this.canvasPlugin.context();
        var path = this.canvasPlugin.path();
        context.beginPath();
        path(lakes);
        context.fillStyle = "rgb(80, 87, 97)";
        context.fill();
    }

    var urls = null;
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
        },
        onInit() {
            this._.options.showLand = true;
            this._.options.showLakes = true;
            this._.options.showCountries = true;
            this.canvasAddWorldOrCountries = canvasAddWorldOrCountries;
        },
        onRefresh() {
            canvasAddWorldOrCountries.call(this);
        }
    }
}
