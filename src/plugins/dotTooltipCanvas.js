export default () => {
    /*eslint no-console: 0 */
    const dotTooltip = d3.select('body').append('div').attr('class', 'ej-dot-tooltip');

    return {
        name: 'dotTooltipCanvas',
        onInit() {
            const hoverHandler = (mouse, d) => {
                if (d) {
                    if (this.dotTooltipCanvas.onShow) {
                        d = this.dotTooltipCanvas.onShow.call(this, d, dotTooltip);
                    }
                    this.dotTooltipCanvas.show(d.properties)
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
        },
        show(props) {
            const title = Object.keys(props).map(k => k+': '+props[k]).join('<br/>');
            return dotTooltip.html(title)
        },
    }
}
