// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    /*eslint no-console: 0 */
    const _ = {countries: null,
        onHover: {},
        onHoverVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: [],
    };

    function init() {
        if (this.hoverCanvas) {
            const hoverHandler = (event, country) => {
                _.onHoverVals.forEach(v => {
                    v.call(this, event, country);
                });
                return country;
            }
            this.hoverCanvas.onCountry({
                countrySelectCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            const clickHandler = (event, country) => {
                _.onClickVals.forEach(v => {
                    v.call(this, event, country);
                });
                return country;
            }
            this.clickCanvas.onCountry({
                countrySelectCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            const dblClickHandler = (event, country) => {
                _.onDblClickVals.forEach(v => {
                    v.call(this, event, country);
                });
                return country;
            }
            this.dblClickCanvas.onCountry({
                countrySelectCanvas: dblClickHandler
            });
        }
    }

    function create() {
        if (this.worldCanvas && !_.countries) {
            const world = this.worldCanvas.data();
            if (world) {
                _.world = world;
                _.countries = topojson.feature(world, world.objects.countries);
            }
        }
    }

    return {
        name: 'countrySelectCanvas',
        onInit() {
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(k => _.onHover[k]);
        },
        onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(k => _.onClick[k]);
        },
        onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(k => _.onDblClick[k]);
        },
        data(data) {
            if (data) {
                _.world = data;
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return _.world;
            }
        },
    }
}
