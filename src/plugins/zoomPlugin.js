export default function() {
    return {
        name: 'zoomPlugin',
        onInit() {
            const __ = this._;
            const zoom = d3.zoom()
                .scaleExtent([__.proj.scale(), 1000])
                .translateExtent([[-100, -100], [90, 100]]);
            zoom
                .on("start", zoomstart)
                .on("end",   zoomend)
                .on('zoom',  function() {
                    const e = d3.event;
                    if (e.sourceEvent) {
                        const t = e.transform;
                        if (e.sourceEvent.constructor.name==='WheelEvent') {
                            __.scale(t.k);
                        } else if (e.sourceEvent.constructor.name==='MouseEvent') {
                            const rX = rotateScale(t.x);
                            const rY = rotateScale(t.y);

                            __.rotate([rX, -rY]).scale(t.k);
                        }
                    }
                });

            const zoomSettings = d3.zoomIdentity.translate(0, 0).scale(__.proj.scale());
            const rotateScale  = d3.scaleLinear()
                .domain([-1500, 0, 1500])
                .range([-250, 0, 250]);

            __.svg
                .call(zoom)
                .call(zoom.transform, zoomSettings)

            function zoomstart(){
                __.drag = true;
            }

            function zoomend(){
                __.drag = false;
            }
        }
    }
}
