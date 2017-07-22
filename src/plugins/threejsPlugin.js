// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
export default (threejs='three-js') => {
    /*eslint no-console: 0 */
    const _ = {renderer: null, scene: null, camera: null, radius: null};
    _.scale = d3.scaleLinear().domain([0,200]).range([0,1]);

    // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
    // Axes have been rotated so Three's "y" axis is parallel to the North Pole
    function vertex(point) {
        var lambda = point[0] * Math.PI / 180,
            phi = point[1] * Math.PI / 180,
            cosPhi = Math.cos(phi);
        return new THREE.Vector3(
            _.radius * cosPhi * Math.cos(lambda),
            _.radius * Math.sin(phi),
          - _.radius * cosPhi * Math.sin(lambda)
      );
    }

    // Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
    function wireframe(multilinestring, material) {
        var geometry = new THREE.Geometry;
        multilinestring.coordinates.forEach(function(line) {
            d3.pairs(line.map(vertex), function(a, b) {
                geometry.vertices.push(a, b);
            });
        });
        return new THREE.LineSegments(geometry, material);
    }

    function init() {
        const __ = this._;
        const {width, height} = __.options;
        const container = document.getElementById(threejs);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10000)
        _.scene  = new THREE.Scene();
        _.group = new THREE.Group();
        _.camera.position.z = 1010; // (higher than RADIUS + size of the bubble)
        _.radius = __.proj.scale();
        _.scene.add(_.group);
        this._.camera = _.camera;

        _.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: container});
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        this.renderThree = renderThree;
        window.grp = _.group;
    }

    function scale(obj) {
        if (!obj) {
            obj = _.group;
        }
        const sc = _.scale(this._.proj.scale());
        obj.scale.x = sc;
        obj.scale.y = sc;
        obj.scale.z = sc;
        renderThree.call(this);
    }

    function rotate(obj) {
        if (!obj) {
            obj = _.group;
        }
        const __ = this._;
        const rt = __.proj.rotate();
        rt[0]   -= 90;
        const q1 = __.versor(rt);
        const q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        obj.setRotationFromQuaternion(q2);
        renderThree.call(this);
    }

    function renderThree() {
        setTimeout(function() {
            _.renderer.render(_.scene, _.camera);
        },1);
    }

    return {
        name: 'threejsPlugin',
        onInit() {
            init.call(this);
        },
        onCreate() {
            _.group.children = [];
        },
        onRefresh() {
            rotate.call(this);
        },
        onResize() {
            scale.call(this);
        },
        addScene(obj) {
            _.scene.add(obj);
        },
        addGroup(obj) {
            _.group.add(obj);
        },
        scale(obj) {
            scale.call(this, obj);
        },
        rotate(obj) {
            rotate.call(this, obj);
        },
        wireframe(multilinestring, material) {
            return wireframe(multilinestring, material);
        },
        // toggleOption(obj, optName) {
        //     delete this._.options[optName];
        //     Object.defineProperty(this._.options, optName, {
        //         get: () => obj.visible,
        //         set: (x) => {
        //             obj.visible = x;
        //         },
        //         configurable: true,
        //     });
        // }
    }
}
