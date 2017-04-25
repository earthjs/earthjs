export default function() {
    return {
        name: 'configPlugin',
        set(newOpt) {
            if (newOpt) {
                Object.assign(this._.options, newOpt);
                if (newOpt.stop!==undefined) {
                    var p = this.autorotatePlugin;
                    newOpt.stop ? p.stop() : p.start();
                }
                this._.drag = true;
                this.svgDraw();
                this._.drag = false;
            }
            return Object.assign({}, this._.options);
        }
    }
}
