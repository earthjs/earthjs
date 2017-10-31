/* eslint no-unused-vars:0 */
/* eslint no-undef:0 */
let tween, tmax=tval=30;
function tweening() {
    const tj = g.threejsPlugin;
    if (g.world3d.tween)
        return;
    let cord, targ, ctr, mesh;
    let arr = keys.filter(s=>data[s].mesh.scale.x>1);
    if (arr.length<tmax) {
        ctr  = keys[Math.round(Math.random() * 230)];
        mesh = data[ctr].mesh; // "United States"
        cord = {r:mesh.scale.x};
        targ = {r:(cord.r===1 ? 1.5 : 1)};
    } else {
        cord = {r:1.5};
        targ = {r:1};
    }
    g.world3d.tween = time => TWEEN.update(time);
    // g.__addEventQueue('world3dThreejs', 'onTween');
    tween = new TWEEN.Tween(cord).to(targ, 500)
    .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    .onUpdate(function() {
        const {r} = cord;
        if (arr.length<tmax && mesh)
            mesh.scale.set(r,r,r)
        else {
            let l = arr.length;
            while(l--) {data[arr[l]].mesh.scale.set(r,r,r);}
        }
        tj.renderThree();
    })
    .onComplete(function() {
        g.world3d.tween = null;
        // g.__removeEventQueue('world3dThreejs', 'onTween');
        if (tmax===tval || keys.filter(s=>data[s].mesh.scale.x>1).length>0)
            setTimeout(()=>tweening(),50);
    })
    .start(); // Start the tween immediately.
}
