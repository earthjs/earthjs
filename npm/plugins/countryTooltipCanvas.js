// KoGor’s Block http://bl.ocks.org/KoGor/5994804
export default function (countryNameUrl) {
    /*eslint no-console: 0 */
    var countryTooltip = d3.select('body').append('div').attr('class', 'ej-country-tooltip');
    var _ = {};

    function countryName(d) {
        var cname = '';
        if (_.countryNames) {
            cname = _.countryNames.find(function(x) {
                return x.id==d.id;
            });
        }
        return cname;
    }

    function init() {
        var this$1 = this;

        var toolTipsHandler = function (mouse, d) { // fn with  current context
            if (!this$1._.drag && d && this$1._.options.showCountryTooltip) {
                var country = countryName(d);
                if (country && !(this$1.barTooltipSvg && this$1.barTooltipSvg.visible())) {
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
        onReady: function onReady(err, countryNames) {
            _.countryNames = countryNames;
        },
        onInit: function onInit() {
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
