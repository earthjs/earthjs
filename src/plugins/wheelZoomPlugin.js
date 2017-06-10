export default function() {
    /*eslint no-console: 0 */
    return {
        name: 'wheelZoomPlugin',
        onInit() {
            const __ = this._;
            __.svg.on('wheel', function() {
                let y = d3.event.deltaY+__.proj.scale();
                y = (y<20 ? 20 : (y>999 ? 1000 : y));
                __.scale(y);
            });
        }
    }
}
