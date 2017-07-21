// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default countryNameUrl => {
    /*eslint no-console: 0 */
    const countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');
    const _ = {};

    function countryName(d) {
        let cname = '';
        if (_.countryNames) {
            cname = _.countryNames.find(function(x) {
                return x.id==d.id;
            });
        }
        return cname;
    }

    function init() {
        const toolTipsHandler = (mouse, d) => { // fn with  current context
            if (!this._.drag && d && this._.options.showCountryTooltip) {
                const country = countryName(d);
                if (country && !(this.barTooltipSvg && this.barTooltipSvg.visible())) {
                    refresh(mouse)
                    .style('display', 'block')
                    .style('opacity', 1)
                    .text(country.name);
                } else {
                    hideTooltip()
                }
            } else {
                hideTooltip()
            }
        }
        this.hoverCanvas.onCountry({
            countryTooltipCanvas: toolTipsHandler
        });
        if (this.mousePlugin) {
            this.mousePlugin.onDrag({
                countryTooltipCanvas: toolTipsHandler
            });
        }
        this._.options.showCountryTooltip = true;
    }

    function refresh(mouse) {
        return countryTooltip
        .style('left', (mouse[0] + 7) + 'px')
        .style('top', (mouse[1] - 15) + 'px')
    }

    function hideTooltip() {
        countryTooltip
        .style('opacity', 0)
        .style('display', 'none');
    }

    return {
        name: 'countryTooltipCanvas',
        urls: countryNameUrl && [countryNameUrl],
        onReady(err, countryNames) {
            _.countryNames = countryNames;
        },
        onInit() {
            init.call(this);
        },
        onRefresh() {
            if (this._.drag) {
                refresh(this.mousePlugin.mouse());
            }
        },
        data(data) {
            if (data) {
                _.countryNames = data;
            } else {
                return _.countryNames;
            }
        },
    }
}
