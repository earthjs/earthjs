// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    /*eslint no-console: 0 */
    const _ = {countries: null,
        onHover: {},
        onHoverKeys: [],
        onClick: {},
        onClickKeys: [],
        onDblClick: {},
        onDblClickKeys: [],
    };

    function initCountrySelectHandler() {
        if (this.hoverCanvas) {
            const hoverHandler = (mouse, country) => {
                _.onHoverKeys.forEach(k => {
                    _.onHover[k].call(this, mouse, country);
                });
                return country;
            }
            this.hoverCanvas.onCountry({
                countrySelectCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            const clickHandler = (mouse, country) => {
                _.onClickKeys.forEach(k => {
                    _.onClick[k].call(this, mouse, country);
                });
                return country;
            }
            this.clickCanvas.onCountry({
                countrySelectCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            const dblClickHandler = (mouse, country) => {
                _.onDblClickKeys.forEach(k => {
                    _.onDblClick[k].call(this, mouse, country);
                });
                return country;
            }
            this.dblClickCanvas.onCountry({
                countrySelectCanvas: dblClickHandler
            });
        }
    }

    return {
        name: 'countrySelectCanvas',
        onInit() {
            const {world} = this.worldCanvas.data();
            if (world) {
                _.countries = topojson.feature(world, world.objects.countries);
            }
            initCountrySelectHandler.call(this);
        },
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverKeys = Object.keys(_.onHover);
        },
        onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickKeys = Object.keys(_.onClick);
        },
        onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickKeys = Object.keys(_.onDblClick);
        },
        world(w) {
            _.countries = topojson.feature(w, w.objects.countries);
        },
    }
}
