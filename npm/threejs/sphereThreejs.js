export default function (imgUrl) {
    if ( imgUrl === void 0 ) imgUrl='../globe/world.png';

    /*eslint no-console: 0 */
    var _ = {sphereObject: null};
    var Shaders = {
      'earth' : {
        uniforms: {
          'texture': { type: 't', value: null }
        },
        vertexShader: [
          'varying vec3 vNormal;',
          'varying vec2 vUv;',
          'void main() {',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            'vNormal = normalize( normalMatrix * normal );',
            'vUv = uv;',
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform sampler2D texture;',
          'varying vec3 vNormal;',
          'varying vec2 vUv;',
          'void main() {',
            'vec3 diffuse = texture2D( texture, vUv ).xyz;',
            'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
            'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
            'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
          '}'
        ].join('\n')
      },
      'atmosphere' : {
        uniforms: {},
        vertexShader: [
          'varying vec3 vNormal;',
          'void main() {',
            'vNormal = normalize( normalMatrix * normal );',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          '}'
        ].join('\n'),
        fragmentShader: [
          'varying vec3 vNormal;',
          'void main() {',
            'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
            'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
          '}'
        ].join('\n')
      }
    };

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            var SCALE = this._.proj.scale();
            var geometry  = new THREE.SphereGeometry(SCALE, 30, 30);
            var uniforms1 = THREE.UniformsUtils.clone(Shaders.earth.uniforms);
            var uniforms2 = THREE.UniformsUtils.clone(Shaders.atmosphere.uniforms);
            uniforms1['texture'].value = tj.texture(imgUrl);

            var mesh1 = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
                uniforms: uniforms1,
                vertexShader: Shaders.earth.vertexShader,
                fragmentShader: Shaders.earth.fragmentShader
            }));

            var mesh2 = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
                uniforms: uniforms2,
                vertexShader: Shaders.atmosphere.vertexShader,
                fragmentShader: Shaders.atmosphere.fragmentShader,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            }));

            var group = new THREE.Group();
            group.add(mesh1);
            group.add(mesh2);
            _.sphereObject = group;
            _.sphereObject.name = _.me.name;
            tj.addGroup(_.sphereObject);
            // tj.rotate();
        } else {
            tj.addGroup(_.sphereObject);
        }
    }

    return {
        name: 'sphereThreejs',
        onInit: function onInit(me) {
            _.me = me;
            this._.options.showSphere = true;
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
        imgSrc: function imgSrc(imgUrl) {
            var tj = this.threejsPlugin;
            var ref = _.me.sphere().children[0];
            var material = ref.material;
            material.uniforms.texture.value = tj.texture(imgUrl);
            material.needsUpdate = true;
        }
    }
}
