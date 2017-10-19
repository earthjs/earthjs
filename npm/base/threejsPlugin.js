// Philippe Rivière’s https://bl.ocks.org/Fil/9ed0567b68501ee3c3fef6fbe3c81564
// https://gist.github.com/Fil/ad107bae48e0b88014a0e3575fe1ba64
// http://bl.ocks.org/kenpenn/16a9c611417ffbfc6129
// https://stackoverflow.com/questions/42392777/three-js-buffer-management
export default function (threejs) {
    if ( threejs === void 0 ) threejs='three-js';

    /*eslint no-console: 0 */
    var _ = {renderer: null, scene: null, camera: null};
    var manager = new THREE.LoadingManager();
    var loader  = new THREE.TextureLoader(manager);
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
        var canvas = document.getElementById(threejs);
        _.scale  = d3.scaleLinear().domain([0,SCALE]).range([0,1]);
        _.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 30000)
        _.light  = new THREE.PointLight(0xffffff, 0);
        _.scene  = new THREE.Scene();
        _.group  = new THREE.Group();
        _.node   = canvas;
        _.camera.position.z = 3010; // (higher than RADIUS + size of the bubble)
        _.camera.name = 'camera';
        _.group.name = 'group';
        _.light.name = 'light';
        _.scene.add(_.camera);
        _.scene.add(_.group);
        _.camera.add(_.light);

        _.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: canvas});
        _.renderer.setClearColor(0x000000, 0);
        _.renderer.setSize(width, height);
        _.renderer.sortObjects = true;
        this.renderThree = renderThree;
        if (window.THREEx &&  window.THREEx.DomEvents) {
            _.domEvents	= new window.THREEx.DomEvents(_.camera, _.renderer.domElement);
        }
        Object.defineProperty(_.me, 'group', {get: function get() {return _.group;}});
        Object.defineProperty(_.me, 'camera', {get: function get() {return _.camera;}});
        Object.defineProperty(_.me, 'renderer', {get: function get() {return _.renderer;}});
        Object.defineProperty(_.me, 'domEvents', {get: function get() {return _.domEvents;}});
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

    function rotate(obj, direct, delay) {
        if ( direct === void 0 ) direct=false;
        if ( delay === void 0 ) delay=0;

        var __ = this._;
        var rt = __.proj.rotate();
        rt[0]   -= 90;
        var q1 = __.versor(rt);
        var q2 = new THREE.Quaternion(-q1[2], q1[1], q1[3], q1[0]);
        (obj || _.group).setRotationFromQuaternion(q2);
        renderThree.call(this, direct, false, delay);
    }

    var renderThreeX = null;
    function renderThree(direct, fn) {
        var this$1 = this;
        if ( direct === void 0 ) direct=false;

        if (direct) {
            _.renderer.render(_.scene, _.camera);
            if (renderThreeX) {
                renderThreeX = null;
                clearTimeout(renderThreeX);
            }
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
            rotate.call(this);
        },
        onRefresh: function onRefresh() {
            rotate.call(this, null, true);
        },
        onResize: function onResize() {
            scale.call(this);
        },
        addGroup: function addGroup(obj) {
            var this$1 = this;

            _.group.add(obj);
            if (obj.name && this[obj.name]) {
                this[obj.name].add = function () {
                    _.group.add(obj);
                    this$1.__addEventQueue(obj.name);
                    renderThree.call(this$1);
                };
                this[obj.name].remove = function () {
                    _.group.remove(obj);
                    this$1.__removeEventQueue(obj.name);
                    renderThree.call(this$1);
                };
                this[obj.name].isAdded = function () { return _.group.children.filter(function (x){ return x.name===obj.name; }).length>0; };
            }
        },
        emptyGroup: function emptyGroup() {
            var this$1 = this;

            var arr = _.group.children;
            var ttl = arr.length;
            for (var i= ttl-1; i>-1; --i) {
                var obj = arr[i];
                _.group.remove(obj);
                obj.name && this$1.__removeEventQueue(obj.name);
                renderThree.call(this$1);
            }
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
        texture: function texture(imgUrl) {
            return loader.load(imgUrl, function (image){ return image; });
        },
        renderThree: function renderThree$1() {
            renderThree.call(this);
        },
        light: function light() {
            return _.camera.children[0];
        },
        node: function node() {
            return _.node;
        },
        q2rotate: function q2rotate(q) {
            if ( q === void 0 ) q=_.group.quaternion;

            var trans = [q._w, q._y, -q._x, q._z];
            var euler = this._.versor.rotation(trans);
            euler[0]   += 90;
            return euler;
        },
        light3d: function light3d() {
            var sphereObject = new THREE.Group();
            var ambient= new THREE.AmbientLight(0x777777);
            var light1 = new THREE.DirectionalLight(0xffffff);
            var light2 = new THREE.DirectionalLight(0xffffff);
            light1.position.set( 1, 0, 1);
            light2.position.set(-1, 0, 1);
            sphereObject.add(ambient);
            sphereObject.add(light1);
            sphereObject.add(light2);
            return sphereObject;
        }
    }
}
