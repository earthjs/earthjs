export default () => {
    /*eslint no-console: 0 */
    const _ = {}
    const dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    function init() {
        const hoverHandler = (event, d) => {
            if (d) {
                if (_.me.onShow) {
                    d = _.me.onShow.call(this, d, dotTooltip);
                }
                const {mouse} = this.hoverCanvas.states();
                _.me.show(d.properties)
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
