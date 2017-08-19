// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
// http://bl.ocks.org/kenpenn/16a9c611417ffbfc6129
export default (threejs='three-js') => {
    /*eslint no-console: 0 */
    const _ = {renderer: null, scene: null, camera: null};
    let SCALE;

    // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
    function vertex(point) {
        var lambda = point[0] * Math.PI / 180,
            phi = point[1] * Math.PI / 180,
            cosPhi = Math.cos(phi);
        return new THREE.Vector3(
            SCALE * cosPhi * Math.cos(lambda),
            SCALE * Math.sin(phi),
          - SCALE * cosPhi * Math.sin(lambda)
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
        SCALE = __.proj.scale();
        const {width, height} = __.options;
        const container = document.getElementById(threejs);
        _.scale  = d3.scaleLinear().domain([0,SCALE]).range([0,1]);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 30000)
        _.scene  = new THREE.Scene();
        _.group  = new THREE.Group();
        _.camera.position.z = 3010; // (higher than RADIUS + size of the bubble)
        _.scene.add(_.group);
        this._.camera = _.camera;

        _.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: container});
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        _.renderer.sortObjects = false;
        this.renderThree = renderThree;
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

    let timeout = null;
    function renderThree() {
        if (timeout===null) {
            timeout = setTimeout(function() {
                _.renderer.render(_.scene, _.camera);
                timeout = null;
            }, 0);
        }
    }

    return {
        name: 'threejsPlugin',
        onInit() {
            init.call(this);
        },
        onCreate() {
            _.group.children = [];
            renderThree.call(this);
        },
        onRefresh() {
            rotate.call(this);
        },
        onResize() {
            scale.call(this);
        },
        group() {
            return _.group;
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
        vertex(point) {
            return vertex(point);
        },
        wireframe(multilinestring, material) {
            return wireframe(multilinestring, material);
        },
        renderThree() {
            renderThree.call(this);
        }
    }
}
