// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default () => {
    /*eslint no-console: 0 */
    const countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

    function init() {
        const toolTipsHandler = (mouse, country) => { // fn with  current context
            if (!this._.drag && country && this._.options.showCountryTooltip) {
                const countryName = this.worldCanvas.countryName(country);
                if (countryName && !(this.barTooltipSvg && this.barTooltipSvg.visible())) {
                    refresh(mouse)
                    .style('display', 'block')
                    .style('opacity', 1)
                    .text(countryName.name);
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
        onInit() {
            init.call(this);
        },
        onRefresh() {
            if (this._.drag) {
                refresh(this.mousePlugin.mouse());
            }
        },
    }
}
