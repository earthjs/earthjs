/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
let tmax=20;
function tweening() {
    let cord, targ, ctr, mesh;
    const arr = keys.filter(s=>data[s].mesh.scale.x>1);
    if (arr.length<tmax) {
        ctr  = keys[Math.round(Math.random() * 230)];
        mesh = data[ctr].mesh; // "United States"
        cord = {r:mesh.scale.x};
        targ = {r:(cord.r===1 ? 1.5 : 1)};
    } else {
        cord = {r:1.5};
        targ = {r:1};
    }
    g._.options.tween = function(time) {TWEEN.update(time);}
    new TWEEN.Tween(cord).to(targ, 500)
    .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    .onUpdate(function() {
        const {r} = cord;
        if (arr.length<tmax && mesh)
            mesh.scale.set(r,r,r)
        else {
            arr.forEach(k=>data[k].mesh.scale.set(r,r,r))
        }
    })
    .onComplete(function() {
        g._.options.tween = null
        if (tmax===20 || keys.filter(s=>data[s].mesh.scale.x>1).length>0)
            setTimeout(()=>tweening(),50);
    })
    .start(); // Start the tween immediately.
}
