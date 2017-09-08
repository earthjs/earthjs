// https://github.com/pyalot/webgl-heatmap
// https://github.com/pyalot/webgl-heatmap/blob/master/example.html
export default function (hmapUrl) {
    /*eslint no-console: 0 */
    var _ = {
        sphereObject:null,
        material: new THREE.MeshBasicMaterial({transparent:true})
    };
    var $ = {canvas: null};

    function init() {
        this._.options.showHmap = true;
        var SCALE = this._.proj.scale();
        _.geometry = new THREE.SphereGeometry(SCALE, 30, 30);
        $.canvas = d3.select('body').append('canvas')
        .style('position','absolute')
        .style('display','none')
        .style('top','450px')
        .attr('id','webgl-hmap');
        _.canvas = $.canvas.node();
        _.heatmap = createWebGLHeatmap({
            intensityToAlpha:true,
            width: 1024,
            height: 512,
            canvas: _.canvas,
        });
        _.texture = new THREE.Texture(_.canvas);
        _.material.map = _.texture;

        if (!hmapUrl) {
            $.canvas.style('display','inherit');
            var paintAtCoord = function(x, y){
                var count = 0;
                while(count < 200){
                    var xoff = Math.random()*2-1;
                    var yoff = Math.random()*2-1;
                    var l = xoff*xoff + yoff*yoff;
                    if(l > 1){
                        continue;
                    }
                    var ls = Math.sqrt(l);
                    xoff/=ls; yoff/=ls;
                    xoff*=1-l; yoff*=1-l;
                    count += 1;
                    _.heatmap.addPoint(x+xoff*50, y+yoff*50, 30, 2/300);
                }
            }
            // event handling
            var onTouchMove = function(evt){
                evt.preventDefault();
                var touches = evt.changedTouches;
                for(var i=0; i<touches.length; i++){
                    var touch = touches[i];
                    paintAtCoord(touch.pageX, touch.pageY);
                }
            };
            _.canvas.addEventListener("touchmove", onTouchMove, false);
            _.canvas.onmousemove = function(event){
                var x = event.offsetX || event.clientX;
                var y = event.offsetY || event.clientY;
                paintAtCoord(x, y);

            }
            _.canvas.onclick = function(){
                _.heatmap.clear();
            }
        }
    }

    function create() {
        var tj = this.threejsPlugin;
        if (!_.sphereObject) {
            _.sphereObject= new THREE.Mesh(_.geometry, _.material);
        }
        _.texture.needsUpdate = true;
        tj.addGroup(_.sphereObject);
    }

    function refresh() {
        _.heatmap.update();
        _.heatmap.display();
    }

    return {
        name: 'hmapThreejs',
        urls: hmapUrl && [hmapUrl],
        onReady: function onReady(err, data) {
            _.me.data(data);
        },
        onInit: function onInit(me) {
            _.me = me;
            init.call(this);
        },
        onInterval: function onInterval() {
            if (!hmapUrl) {
                _.texture.needsUpdate = true;
            }
        },
        onCreate: function onCreate() {
            create.call(this);
        },
        onRefresh: function onRefresh() {
            refresh.call(this);
        },
        data: function data(data$1) {
            if (data$1) {
                _.world = data$1;
                _.countries = topojson.feature(data$1, data$1.objects.countries);
            } else {
                return  _.world;
            }
        },
        sphere: function sphere() {
            return _.sphereObject;
        },
    }
}
