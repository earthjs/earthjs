export default function () {
    /*eslint no-console: 0 */
    var _ = {hidden: null};
    var dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    function show(data, tooltip) {
        var props = data.properties;
        var title = Object.keys(props).map(function (k) { return k+': '+props[k]; }).join('<br/>');
        return tooltip.html(title)
    }

    function showTooltip(event, data) {
        var mouse = [event.clientX, event.clientY];
        (_.me.show || show)(data, dotTooltip)
        .style('display', 'block')
        .style('opacity', 1)
        .style('left', mouse[0] + 7 + 'px')
        .style('top', mouse[1] - 15 + 'px');
        _.oldData = data;
        _.hidden = false;
    }

    function hideTooltip() {
        if (!_.hidden) {
            _.hidden = true;
            dotTooltip.style('opacity', 0)
            .style('display', 'none');
        }
    }

    function init() {
        var this$1 = this;

        var hoverHandler = function (event, data) {
            if (data && this$1._.drag!==null) {
                showTooltip(event, data);
            } else {
                hideTooltip();
            }
        }
        this.dotSelectCanvas.onHover({
            dotTooltipCanvas: hoverHandler
        });
    }

    return {
        name: 'dotTooltipCanvas',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
    }
}
