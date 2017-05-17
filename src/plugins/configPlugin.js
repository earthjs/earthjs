export default function() {
    return {
        name: 'configPlugin',
        set(newOpt) {
            if (newOpt) {
                Object.assign(this._.options, newOpt);
                if (newOpt.spin!==undefined) {
                    const p = this.autorotatePlugin;
                    newOpt.spin ? p.start() : p.stop();
                }
                this.svgDraw();
            }
            return Object.assign({}, this._.options);
        }
    }
}
