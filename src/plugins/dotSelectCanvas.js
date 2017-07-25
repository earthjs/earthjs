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

    function detect(mouse, pos) {
        let dot = null;
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
            const hoverHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onHoverVals.forEach(v => {
                    v.call(this, mouse, dot);
                });
                return dot;
            }
            this.hoverCanvas.onCircle({
                dotsCanvas: hoverHandler
            });
        }

        if (this.clickCanvas) {
            const clickHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onClickVals.forEach(v => {
                    v.call(this, mouse, dot);
                });
                return dot;
            }
            this.clickCanvas.onCircle({
                dotsCanvas: clickHandler
            });
        }

        if (this.dblClickCanvas) {
            const dblClickHandler = (mouse, pos) => {
                const dot = detect(mouse, pos);
                _.onDblClickVals.forEach(v => {
                    v.call(this, mouse, dot);
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
        onInit() {
            initCircleHandler.call(this);
        },
        onCreate() {
            if (this.dotsCanvas && !_.dots) {
                this.dotSelectCanvas.dots(this.dotsCanvas.dots());
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
