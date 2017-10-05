// https://github.com/pyalot/webgl-heatmap
// https://github.com/pyalot/webgl-heatmap/blob/master/example.html
export default hmapUrl => {
    /*eslint no-console: 0 */
    const _ = {
        sphereObject:null,
        material: new THREE.MeshBasicMaterial({transparent:true})
    };
    const $ = {canvas: null};

    function init() {
        this._.options.showHmap = true;
        const SCALE = this._.proj.scale();
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
            const paintAtCoord = function(x, y){
                let count = 0;
                while(count < 200){
                    let xoff = Math.random()*2-1;
                    let yoff = Math.random()*2-1;
                    const l = xoff*xoff + yoff*yoff;
                    if(l > 1){
                        continue;
                    }
                    const ls = Math.sqrt(l);
                    xoff/=ls; yoff/=ls;
                    xoff*=1-l; yoff*=1-l;
                    count += 1;
                    _.heatmap.addPoint(x+xoff*50, y+yoff*50, 30, 2/300);
                }
            }
            // event handling
            const onTouchMove = function(evt){
                evt.preventDefault();
                const touches = evt.changedTouches;
                for(let i=0; i<touches.length; i++){
                    const touch = touches[i];
                    paintAtCoord(touch.pageX, touch.pageY);
                }
            };
            _.canvas.addEventListener("touchmove", onTouchMove, false);
            _.canvas.onmousemove = function(event){
                const x = event.offsetX || event.clientX;
                const y = event.offsetY || event.clientY;
                paintAtCoord(x, y);

            }
            _.canvas.onclick = function(){
                _.heatmap.clear();
            }
        }
    }

    function create() {
        const tj = this.threejsPlugin;
        if (!_.sphereObject) {
            _.sphereObject= new THREE.Mesh(_.geometry, _.material);
            _.sphereObject.name = _.me.name;
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
        onReady(err, data) {
            _.me.data(data);
        },
        onInit(me) {
            _.me = me;
            init.call(this);
        },
        onInterval() {
            if (!hmapUrl) {
                _.texture.needsUpdate = true;
            }
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        data(data) {
            if (data) {
                _.world = data;
                _.countries = topojson.feature(data, data.objects.countries);
            } else {
                return  _.world;
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}
