export default () => {
    /*eslint no-console: 0 */
    const _ = {dataDots: null, dots: null, radiusPath: null,
        onHover: {},
        onHoverVals: [],
        onClick: {},
        onClickVals: [],
        onDblClick: {},
        onDblClickVals: [],
    };

    function detect(pos) {
        let dot = null;
        const {mouse} = this.hoverCanvas.states();
        _.dots.forEach(function(d) {
            if (mouse && !dot) {
                const geoDistance = d3.geoDistance(d.coordinates, pos);
                if (geoDistance <= 0.02) {
                    dot = d;
                }
            }
        });
        return dot;
    }

    function initCircleHandler() {
        if (this.hoverCanvas) {
            const hoverHandler = (event, pos) => {
                const dot = detect.call(this, pos);
                _.onHoverVals.forEach(v => {
                    v.call(this, event, dot);
                });
                return dot;
            }
            this.hoverCanvas.onCircle({
                dotsCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            const clickHandler = (event, pos) => {
                const dot = detect.call(this, pos);
                _.onClickVals.forEach(v => {
                    v.call(this, event, dot);
                });
                return dot;
            }
            this.clickCanvas.onCircle({
                dotsCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            const dblClickHandler = (event, pos) => {
                const dot = detect(event, pos);
                _.onDblClickVals.forEach(v => {
                    v.call(this, event, dot);
                });
                return dot;
            }
            this.dblClickCanvas.onCircle({
                dotsCanvas: dblClickHandler
            });
        }
    }

    return {
        name: 'dotSelectCanvas',
        onInit(me) {
            _.me = me;
            initCircleHandler.call(this);
        },
        onCreate() {
            if (this.dotsCanvas && !_.dots) {
                _.me.dots(this.dotsCanvas.dots());
            }
        },
        onHover(obj) {
            Object.assign(_.onHover, obj);
            _.onHoverVals = Object.keys(_.onHover).map(k => _.onHover[k]);
        },
        onClick(obj) {
            Object.assign(_.onClick, obj);
            _.onClickVals = Object.keys(_.onClick).map(k => _.onClick[k]);
        },
        onDblClick(obj) {
            Object.assign(_.onDblClick, obj);
            _.onDblClickVals = Object.keys(_.onDblClick).map(k => _.onDblClick[k]);
        },
        dots(dots) {
            _.dots = dots;
        },
    }
}
