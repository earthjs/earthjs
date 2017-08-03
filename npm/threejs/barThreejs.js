// http://davidscottlyons.com/threejs/presentations/frontporch14/offline-extended.html#slide-79
export default function (jsonUrl, height) {
    if ( height === void 0 ) height=2;

    /*eslint no-console: 0 */
    var _ = {sphereObject: null, data: null};
    var material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors,
        morphTargets: false,
        color: 0xaaffff,
    });

    function createGeometry(w) {
        var geometry = new THREE.BoxGeometry(2, 2, w);
        for (var i = 0; i < geometry.faces.length; i += 2 ) {
            var hex = Math.random() * 0xffffff;
            geometry.faces[ i ].color.setHex( hex );
            geometry.faces[ i + 1 ].color.setHex( hex );
        }
        return geometry;
    }

    function meshCoordinate(mesh, sc) {
        var phi = ( 90 - mesh.coordinates[1]) * 0.017453292519943295; //Math.PI / 180.0;
        var the = (360 - mesh.coordinates[0]) * 0.017453292519943295; //Math.PI / 180.0;

        mesh.position.x = sc * Math.sin(phi) * Math.cos(the);
        mesh.position.y = sc * Math.cos(phi);
        mesh.position.z = sc * Math.sin(phi) * Math.sin(the);
        mesh.lookAt({x:0,y:0,z:0});
    }

    function init() {
        this._.options.showBars = true;
    }

    function create() {
        var o = this._.options;
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var group = new THREE.Group();
            var SCALE = this._.proj.scale();
            _.max = d3.max(_.data.features, function (d) { return parseInt(d.geometry.value); })
            _.scale = d3.scaleLinear().domain([0, _.max]).range([2, 70]);
            _.data.features.forEach(function(data) {
                var v = data.geometry.value;
                var h = v ? _.scale(v) : height;
                var geometry = createGeometry(h);
                var mesh = new THREE.Mesh(geometry, material);
                mesh.coordinates = data.geometry.coordinates;
                meshCoordinate(mesh, SCALE+(h/2));
                group.add(mesh);
            })
            _.sphereObject = group;
        }
        _.sphereObject.visible = o.showBars;
        tj.addGroup(_.sphereObject);
        tj.rotate();
    }

    return {
        name: 'barThreejs',
        urls: jsonUrl && [jsonUrl],
        onReady: function onReady(err, data) {
            this.barThreejs.data(data);
        },
        onInit: function onInit() {
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            _.sphereObject.visible = this._.options.showBars;
        },
        data: function data(data$1) {
            if (data$1) {
                if (_.valuePath) {
                    var p = _.valuePath.split('.');
                    data$1.features.forEach(function (d) {
                        var v = d;
                        p.forEach(function (o) { return v = v[o]; });
                        d.geometry.value = v;
                    });
                }
                _.data = data$1;
            } else {
                return _.data;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
