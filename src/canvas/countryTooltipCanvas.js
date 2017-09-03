// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default countryNameUrl => {
    /*eslint no-console: 0 */
    const _ = {hidden: null};
    const countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

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

    function show(data, tooltip) {
        const title = Object.keys(data).map(k => k+': '+data[k]).join('<br/>');
        return tooltip.html(title)
    }

    function showTooltip(event, country) {
        refresh([event.clientX, event.clientY]);
        (_.me.show || show)(country, countryTooltip)
        .style('display', 'block')
        .style('opacity', 1);
        _.hidden = false;
    }

    function hideTooltip() {
        if (!_.hidden) {
            _.hidden = true;
            countryTooltip
            .style('opacity', 0)
            .style('display', 'none');
        }
    }

    function init() {
        const hoverHandler = (event, data) => { // fn with  current context
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
        hoverHandler.tooltips = true;
        this.hoverCanvas.onCountry({
            countryTooltipCanvas: hoverHandler
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
        data(data) {
            if (data) {
                _.countryNames = data;
            } else {
                return _.countryNames;
            }
        },
    }
}
