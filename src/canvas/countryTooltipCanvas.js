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

    function refresh(mouse) {
        return countryTooltip
        .style('left', (mouse[0] + 7) + 'px')
        .style('top', (mouse[1] - 15) + 'px')
    }

    function showTooltip(event, country) {
        refresh([event.clientX, event.clientY])
        .style('display', 'block')
        .style('opacity', 1)
        .text(country.name);
    }

    function hideTooltip() {
        countryTooltip
        .style('opacity', 0)
        .style('display', 'none');
    }

    function init() {
        const toolTipsHandler = (event, data) => { // fn with  current context
            if (this._.drag!==null && data && this._.options.showCountryTooltip) {
                const country = countryName(data);
                if (country && !(this.barTooltipSvg && this.barTooltipSvg.visible())) {
                    showTooltip(event, country);
                } else {
                    hideTooltip()
                }
            } else {
                hideTooltip()
            }
        }
        // always receive hover event
        toolTipsHandler.tooltips = true;
        this.hoverCanvas.onCountry({
            countryTooltipCanvas: toolTipsHandler
        });
        this._.options.showCountryTooltip = true;
    }

    return {
        name: 'countryTooltipCanvas',
        urls: countryNameUrl && [countryNameUrl],
        onReady(err, countryNames) {
            _.countryNames = countryNames;
        },
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onRefresh() {
            if (this._.drag) {
                refresh(this.mousePlugin.mouse());
            }
        },
        show(props) {
            const title = Object.keys(props).map(k => k+': '+props[k]).join('<br/>');
            return countryTooltip.html(title)
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
