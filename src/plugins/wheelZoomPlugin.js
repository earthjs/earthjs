export default function() {
    return {
        name: 'wheelZoomPlugin',
        onInit() {
            const _this = this;
            this._.svg.on('wheel', function() {
                const y = d3.event.deltaY+_this._.proj.scale();
                if (y>230 && y<1000) {
                    _this._.scale(y);
                }
            });
        }
    }
}
