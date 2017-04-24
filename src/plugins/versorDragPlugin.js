// Mike Bostock’s Block https://bl.ocks.org/mbostock/7ea1dde508cec6d2d95306f92642bc42
//
import versorFn from '../versor.js';

var versor = versorFn();
export default function() {
    return {
        name: 'versorDragPlugin',
        onInit(planet) {
            planet._.svg.call(d3.drag()
                .on('start', dragstarted)
                .on('end',   dragsended)
                .on('drag',  dragged));

            var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
                r0, // Projection rotation as Euler angles at start.
                q0; // Projection rotation as versor at start.

            function dragstarted() {
                planet._.drag = true;
                v0 = versor.cartesian(planet._.proj.invert(d3.mouse(this)));
                r0 = planet._.proj.rotate();
                q0 = versor(r0);
            }

            function dragsended() {
                planet._.drag = false;
            }

            function dragged() {
                var v1 = versor.cartesian(planet._.proj.rotate(r0).invert(d3.mouse(this))),
                    q1 = versor.multiply(q0, versor.delta(v0, v1)),
                    r1 = versor.rotation(q1);
                planet._.rotate(r1);
            }
        }
    }
}
