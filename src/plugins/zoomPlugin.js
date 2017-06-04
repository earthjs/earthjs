export default function() {
    return {
        name: 'zoomPlugin',
        onInit() {
            const _this= this;
            const zoom = d3.zoom()
                .scaleExtent([this._.proj.scale(), 1000])
                .translateExtent([[-100, -100], [90, 100]]);
            zoom
                .on("start", zoomstart)
                .on("end",   zoomend)
                .on('zoom',  function() {
                    const e = d3.event;
                    if (e.sourceEvent) {
                        const t = e.transform;
                        if (e.sourceEvent.constructor.name==='WheelEvent') {
                            _this._.scale(t.k);
                            // _this._.proj.scale(t.k);
                            // _this._.resize.call(_this);
                            // _this._.refresh.call(_this);

                        } else if (e.sourceEvent.constructor.name==='MouseEvent') {
                            const rX = rotateScale(t.x);// % 360;
                            const rY = rotateScale(t.y);// % 360;

                            _this._.rotate([rX, -rY]).scale(t.k);
                        }
                    }
                });

            const zoomSettings = d3.zoomIdentity.translate(0, 0).scale(this._.proj.scale());
            const rotateScale  = d3.scaleLinear()
                .domain([-1500, 0, 1500])
                .range([-250, 0, 250]);

            this.svg
                .call(zoom)
                .call(zoom.transform, zoomSettings)

            function zoomstart(){
                _this._.drag = true;
            }

            function zoomend(){
                _this._.drag = false;
            }
        }
    }
}
