export default () => {
    /*eslint no-console: 0 */
    const _ = {};
    const dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    function showTooltip(event, data) {
        if (_.me.onShow) {
            data = _.me.onShow.call(this, data, dotTooltip);
        }
        const mouse = [event.clientX, event.clientY];
        _.me.show(data.properties)
        .style('display', 'block')
        .style('opacity', 1)
        .style('left', mouse[0] + 7 + 'px')
        .style('top', mouse[1] - 15 + 'px');
        _.oldData = data;
    }

    function hideTooltip() {
        dotTooltip.style('opacity', 0)
        .style('display', 'none');
    }

    function init() {
        const hoverHandler = (event, data) => {
            if (data && this._.drag!==null) {
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
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        show(props) {
            const title = Object.keys(props).map(k => k+': '+props[k]).join('<br/>');
            return dotTooltip.html(title)
        },
    }
}
