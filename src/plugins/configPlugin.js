export default function() {
    return {
        name: 'configPlugin',
        set(newOpt) {
            if (newOpt) {
                Object.assign(this._.options, newOpt);
                if (newOpt.spin!==undefined) {
                    var p = this.autorotatePlugin;
                    newOpt.spin ? p.start() : p.stop();
                }
                this._.drag = true;
                this.svgDraw();
                this._.drag = false;
            }
            return Object.assign({}, this._.options);
        }
    }
}
