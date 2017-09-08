// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function (countryNameUrl) {
    /*eslint no-console: 0 */
    var _ = {hidden: null};
    var countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');

    function countryName(d) {
        var cname = '';
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
        var title = Object.keys(data).map(function (k) { return k+': '+data[k]; }).join('<br/>');
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
        var this$1 = this;

        var hoverHandler = function (event, data) { // fn with  current context
            if (this$1._.drag!==null && data && this$1._.options.showCountryTooltip) {
                var country = countryName(data);
                if (country && !(this$1.barTooltipSvg && this$1.barTooltipSvg.visible())) {
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
        onReady: function onReady(err, countryNames) {
            _.countryNames = countryNames;
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onRefresh: function onRefresh() {
            if (this._.drag) {
                refresh(this.mousePlugin.mouse());
            }
        },
        data: function data(data$1) {
            if (data$1) {
                _.countryNames = data$1;
            } else {
                return _.countryNames;
            }
        },
    }
}
