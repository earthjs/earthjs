// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
// http://bl.ocks.org/kenpenn/16a9c611417ffbfc6129
export default function (threejs) {
    if ( threejs === void 0 ) threejs='three-js';

    /*eslint no-console: 0 */
    var _ = {renderer: null, scene: null, camera: null};
    var SCALE;

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
        var __ = this._;
        SCALE = __.proj.scale();
        var ref = __.options;
        var width = ref.width;
        var height = ref.height;
        var container = document.getElementById(threejs);
        _.scale  = d3.scaleLinear().domain([0,SCALE]).range([0,1]);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 30000)
        _.light  = new THREE.PointLight(0xffffff, 0);
        _.scene  = new THREE.Scene();
        _.group  = new THREE.Group();
        _.camera.position.z = 3010; // (higher than RADIUS + size of the bubble)
        _.scene.add(_.camera);
        _.scene.add(_.group);
        _.camera.add(_.light);
        this._.camera = _.camera;

        _.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: container});
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        _.renderer.sortObjects = false;
        this.renderThree = renderThree;
        if (window.THREEx &&  window.THREEx.DomEvents) {
            _.domEvents	= new window.THREEx.DomEvents(_.camera, _.renderer.domElement);
        }
        this._.domEvents = _.domEvents;
    }

    function scale(obj) {
        if (!obj) {
            obj = _.group;
        }
        var sc = _.scale(this._.proj.scale());
        obj.scale.x = sc;
        obj.scale.y = sc;
        obj.scale.z = sc;
        renderThree.call(this);
    }

    function rotate(obj) {
        if (!obj) {
            obj = _.group;
        }
        var __ = this._;
        var rt = __.proj.rotate();
        rt[0]   -= 90;
        var q1 = __.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        obj.setRotationFromQuaternion(q2);
        renderThree.call(this);
    }

    var renderThreeX = null;
    function renderThree(direct, fn) {
        var this$1 = this;
        if ( direct === void 0 ) direct=false;

        if (direct) {
            _.renderer.render(_.scene, _.camera);
        } else if (renderThreeX===null) {
            renderThreeX = setTimeout(function () {
                fn && fn.call(this$1, _.group);
                 _.renderer.render(_.scene, _.camera);
                renderThreeX = null;
            }, 0);
        }
    }

    return {
        name: 'threejsPlugin',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            _.group.children = [];
            renderThree.call(this, false, rotate);
        },
        onRefresh: function onRefresh() {
            rotate.call(this);
        },
        onResize: function onResize() {
            scale.call(this);
        },
        group: function group() {
            return _.group;
        },
        addGroup: function addGroup(obj) {
            _.group.add(obj);
        },
        scale: function scale$1(obj) {
            scale.call(this, obj);
        },
        rotate: function rotate$1(obj) {
            rotate.call(this, obj);
        },
        vertex: function vertex$1(point) {
            return vertex(point);
        },
        wireframe: function wireframe$1(multilinestring, material) {
            return wireframe(multilinestring, material);
        },
        renderThree: function renderThree$1() {
            renderThree.call(this);
        },
        light: function light() {
            return _.camera.children[0];
        }
    }
}
