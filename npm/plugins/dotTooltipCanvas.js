export default function () {
    /*eslint no-console: 0 */
    var dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    function init() {
        var this$1 = this;

        var hoverHandler = function (mouse, d) {
            if (d) {
                if (this$1.dotTooltipCanvas.onShow) {
                    d = this$1.dotTooltipCanvas.onShow.call(this$1, d, dotTooltip);
                }
                this$1.dotTooltipCanvas.show(d.properties)
                .style('display', 'block')
                .style('opacity', 1)
                .style('left', mouse[0] + 7 + 'px')
                .style('top', mouse[1] - 15 + 'px');
            } else {
                dotTooltip.style('opacity', 0)
                .style('display', 'none');
            }
        }
        this.dotSelectCanvas.onHover({
            dotTooltipCanvas: hoverHandler
        });
    }

    return {
        name: 'dotTooltipCanvas',
        onInit: function onInit() {
            init.call(this);
        },
        show: function show(props) {
            var title = Object.keys(props).map(function (k) { return k+': '+props[k]; }).join('<br/>');
            return dotTooltip.html(title)
        },
    }
}
