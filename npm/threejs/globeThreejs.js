export default function (
    imgUrl,
    elvUrl,
    wtrUrl) {
    if ( imgUrl === void 0 ) imgUrl='../d/world.jpg';
    if ( elvUrl === void 0 ) elvUrl='../d/elevation.jpg';
    if ( wtrUrl === void 0 ) wtrUrl='../d/water.png';

    /*eslint no-console: 0 */
    var _ = {
        sphereObject: null,
        onHover: {},
        onHoverVals: [],
    };
    var manager = new THREE.LoadingManager();
    var loader = new THREE.TextureLoader(manager);

    function init() {
        this._.options.showGlobe = true;
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var earth_img = loader.load(imgUrl, function (image){ return image; });
            var elevt_img = loader.load(elvUrl, function (image){ return image; });
            var water_img = loader.load(wtrUrl, function (image){ return image; });
            var geometry  = new THREE.SphereGeometry(SCALE, 30, 30);
            var material  = new THREE.MeshPhongMaterial({
                map: earth_img,
                bumpMap: elevt_img,
                bumpScale: 0.01,
                specularMap: water_img,
                specular: new THREE.Color('grey')
            })
            _.sphereObject = new THREE.Mesh(geometry, material);
            if (this._.domEvents) {
                this._.domEvents.addEventListener(_.sphereObject, 'mousemove', function(event){
                    for (var i = 0, list = _.onHoverVals; i < list.length; i += 1) {
                        var v = list[i];

                        v.call(event.target, event);
                    }
                }, false);
            }
            var ambient= new THREE.AmbientLight(0x777777);
            var light1 = new THREE.DirectionalLight(0xffffff, 0.2);
            var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
            light1.position.set(5, 3,  6);
            light2.position.set(5, 3, -6);
            tj.addGroup(ambient);
            tj.addGroup(light1);
            tj.addGroup(light2);
            tj.addGroup(_.sphereObject);
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'globeThreejs',
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onHover: function onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(function (k) { return _.onHover[k]; });
        },
        sphere: function sphere() {
            return _.sphereObject;
        }
    }
}
